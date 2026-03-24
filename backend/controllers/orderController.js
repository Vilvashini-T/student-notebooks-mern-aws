const Order = require('../models/Order');
const ProductVariation = require('../models/ProductVariation');
const Coupon = require('../models/Coupon');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            discountPrice,
            totalPrice,
            coupon,
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        } else {
            // Priority 1: Validate and Deduct Stock before finalizing the order
            for (const item of orderItems) {
                const variation = await ProductVariation.findById(item.variation);

                if (!variation) {
                    return res.status(404).json({ message: `Product variation not found for SKU: ${item.sku}` });
                }

                if (variation.stockQuantity < item.quantity) {
                    return res.status(400).json({
                        message: `Insufficient stock for ${item.name} (${item.sku}). Available: ${variation.stockQuantity}, Requested: ${item.quantity}`
                    });
                }

                // Deduct stock temporarily in memory
                variation.stockQuantity -= item.quantity;
                await variation.save();

                // 🔔 LOW STOCK ALERT: if stock drops to 5 or below, notify admin
                const LOW_STOCK_THRESHOLD = 5;
                if (variation.stockQuantity <= LOW_STOCK_THRESHOLD) {
                    try {
                        const sendEmail = require('../utils/sendEmail');
                        await sendEmail({
                            email: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
                            subject: `⚠️ Low Stock Alert: ${item.name} (${item.sku})`,
                            message: `STOCK ALERT\n\nProduct: ${item.name}\nSKU: ${item.sku}\nRemaining stock: ${variation.stockQuantity}\n\nPlease restock immediately to avoid missed orders.\n\nStudent Note Books Admin System`
                        });
                    } catch (emailErr) {
                        // Log silently - don't break order creation
                        console.warn('Low stock alert email failed:', emailErr.message);
                    }
                }
            }

            // Priority 2: Server-side Coupon Re-validation (Prevent tampering)
            let finalDiscount = 0;
            let dbCoupon = null;

            if (coupon) {
                dbCoupon = await Coupon.findById(coupon);
                if (dbCoupon && dbCoupon.isActive && new Date() <= dbCoupon.expiryDate) {
                    if (!dbCoupon.usageLimit || dbCoupon.usedCount < dbCoupon.usageLimit) {
                        if (itemsPrice >= dbCoupon.minOrderAmount) {
                            if (dbCoupon.discountType === 'percentage') {
                                finalDiscount = (itemsPrice * dbCoupon.discountAmount) / 100;
                            } else {
                                finalDiscount = dbCoupon.discountAmount;
                            }
                            finalDiscount = Math.min(finalDiscount, itemsPrice);
                        }
                    }
                }
            }

            // Recalculate Final Total (items + shipping - discount)
            const finalTotal = (Number(itemsPrice) + Number(shippingPrice) - finalDiscount).toFixed(2);

            const order = new Order({
                orderItems,
                user: req.user._id,
                shippingAddress,
                paymentMethod,
                itemsPrice,
                taxPrice,
                shippingPrice,
                discountPrice: finalDiscount,
                totalPrice: finalTotal,
                coupon: dbCoupon ? dbCoupon._id : undefined,
            });

            if (dbCoupon) {
                dbCoupon.usedCount += 1;
                await dbCoupon.save();
            }

            const createdOrder = await order.save();
            res.status(201).json(createdOrder);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate(
            'user',
            'name email'
        );

        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            if (req.body.paymentMethod === 'Razorpay') {
                const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

                // Create expected signature using secret key
                const body = razorpay_order_id + "|" + razorpay_payment_id;
                const expectedSignature = crypto
                    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                    .update(body.toString())
                    .digest('hex');

                if (expectedSignature !== razorpay_signature) {
                    return res.status(400).json({ message: 'Invalid payment signature. Payment verification failed.' });
                }

                order.isPaid = true;
                order.paidAt = Date.now();
                order.paymentResult = {
                    id: razorpay_payment_id,
                    status: 'completed',
                    update_time: new Date().toISOString(),
                    email_address: req.user.email,
                };
            } else {
                // Handle fallback/other payment mock data if necessary
                order.isPaid = true;
                order.paidAt = Date.now();
                order.paymentResult = {
                    id: req.body.id,
                    status: req.body.status,
                    update_time: req.body.update_time,
                    email_address: req.body.payer?.email_address,
                };
            }

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/ShopkeeperOrAdmin
const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.orderStatus = req.body.status; // 'Processing', 'Shipped', etc

            if (req.body.status === 'Delivered') {
                order.isDelivered = true;
                order.deliveredAt = Date.now();
            }

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Retry payment for an unpaid order (creates fresh Razorpay order)
// @route   POST /api/orders/:id/retry-payment
// @access  Private
const retryPayment = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (order.isPaid) {
            return res.status(400).json({ message: 'Order is already paid' });
        }

        if (order.orderStatus === 'Cancelled') {
            return res.status(400).json({ message: 'Cannot retry payment for a cancelled order' });
        }

        // Create a fresh Razorpay order instance for the existing order total
        const Razorpay = require('razorpay');
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(order.totalPrice * 100), // paise
            currency: 'INR',
            receipt: `retry_${order._id.toString().slice(-8)}`
        });

        res.json({
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID,
            orderId: order._id,
            totalPrice: order.totalPrice
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Download order invoice as PDF
// @route   GET /api/orders/:id/invoice
// @access  Private
const downloadInvoice = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Make sure user owns the order or is admin
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'shopkeeper') {
            return res.status(401).json({ message: 'Not authorized to view this invoice' });
        }

        // Initialize PDF Document
        const doc = new PDFDocument({ margin: 50 });

        // Set Headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="invoice-${order._id.toString().substring(18, 24).toUpperCase()}.pdf"`
        );

        // Pipe the PDF document to the response stream
        doc.pipe(res);

        // Add Header
        doc
            .fillColor('#444444')
            .fontSize(20)
            .text('Student Note Books - Invoice', 50, 50, { align: 'center' })
            .fontSize(10)
            .text('123 Education Street, Learning City, 10001', 50, 80, { align: 'center' })
            .moveDown();

        // Add Order details
        doc
            .fillColor('#000000')
            .fontSize(12)
            .text(`Order ID: ${order._id.toString().substring(18, 24).toUpperCase()}`, 50, 120)
            .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 135)
            .text(`Status: ${order.orderStatus}`, 50, 150)
            .text(`Payment: ${order.isPaid ? 'Paid' : 'Pending'}`, 50, 165);

        // Add Customer / Shipping details
        doc
            .text('Billed To:', 350, 120)
            .text(order.user.name, 350, 135)
            .text(order.user.email, 350, 150)
            .text(
                `${order.shippingAddress.street}, ${order.shippingAddress.city}`,
                350,
                165
            )
            .text(
                `${order.shippingAddress.state} ${order.shippingAddress.postalCode}`,
                350,
                180
            )
            .moveDown();

        // Generate Table Header
        const tableTop = 230;
        doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('Item', 50, tableTop)
            .text('SKU', 200, tableTop)
            .text('Quantity', 300, tableTop, { width: 50, align: 'center' })
            .text('Price (Rs)', 380, tableTop, { width: 50, align: 'right' })
            .text('Total (Rs)', 480, tableTop, { width: 50, align: 'right' });

        doc
            .strokeColor('#aaaaaa')
            .lineWidth(1)
            .moveTo(50, tableTop + 15)
            .lineTo(550, tableTop + 15)
            .stroke();

        let yPosition = tableTop + 25;
        doc.font('Helvetica');

        // Render Table Items
        order.orderItems.forEach((item) => {
            doc
                .fontSize(10)
                .text(item.name.substring(0, 25), 50, yPosition)
                .text(item.sku, 200, yPosition)
                .text(item.quantity.toString(), 300, yPosition, { width: 50, align: 'center' })
                .text(item.pricePaid.toFixed(2), 380, yPosition, { width: 50, align: 'right' })
                .text((item.pricePaid * item.quantity).toFixed(2), 480, yPosition, { width: 50, align: 'right' });

            yPosition += 20;

            // Page handling if items exceed
            if (yPosition > 700) {
                doc.addPage();
                yPosition = 50;
            }
        });

        doc
            .strokeColor('#aaaaaa')
            .lineWidth(1)
            .moveTo(50, yPosition + 10)
            .lineTo(550, yPosition + 10)
            .stroke();

        yPosition += 25;

        // Render Totals
        doc
            .fontSize(10)
            .text('Subtotal:', 380, yPosition, { width: 100, align: 'right' })
            .text(`Rs. ${order.itemsPrice.toFixed(2)}`, 480, yPosition, { width: 50, align: 'right' });

        yPosition += 15;
        doc
            .text('Shipping:', 380, yPosition, { width: 100, align: 'right' })
            .text(`Rs. ${order.shippingPrice.toFixed(2)}`, 480, yPosition, { width: 50, align: 'right' });

        doc
            .text('Included GST:', 380, yPosition, { width: 100, align: 'right' })
            .text(`Rs. ${order.taxPrice.toFixed(2)}`, 480, yPosition, { width: 50, align: 'right' });

        if (order.discountPrice > 0) {
            yPosition += 15;
            doc
                .fillColor('#10b981')
                .text('Discount Applied:', 380, yPosition, { width: 100, align: 'right' })
                .text(`- Rs. ${order.discountPrice.toFixed(2)}`, 480, yPosition, { width: 50, align: 'right' })
                .fillColor('#000000');
        }

        yPosition += 20;
        doc
            .font('Helvetica-Bold')
            .fontSize(12)
            .text('Total Amount:', 380, yPosition, { width: 100, align: 'right' })
            .text(`Rs. ${order.totalPrice.toFixed(2)}`, 480, yPosition, { width: 50, align: 'right' });

        doc.end();
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Error generating PDF invoice' });
        }
    }
};

// @desc    Cancel an order (User)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Only the owner can cancel
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to cancel this order' });
        }

        // Can only cancel if Pending or Processing
        if (!['Pending', 'Processing'].includes(order.orderStatus)) {
            return res.status(400).json({
                message: `Order cannot be cancelled. Current status: ${order.orderStatus}. Only Pending or Processing orders can be cancelled.`
            });
        }

        // ♻️ Restore stock for each item
        for (const item of order.orderItems) {
            const variation = await ProductVariation.findById(item.variation);
            if (variation) {
                variation.stockQuantity += item.quantity;
                await variation.save();
            }
        }

        // If coupon was used, decrement usedCount
        if (order.coupon) {
            const coupon = await Coupon.findById(order.coupon);
            if (coupon && coupon.usedCount > 0) {
                coupon.usedCount -= 1;
                await coupon.save();
            }
        }

        order.orderStatus = 'Cancelled';
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get order summary (Admin Stats)
// @route   GET /api/orders/summary
// @access  Private/Admin
const getOrderSummary = async (req, res) => {
    try {
        const orders = await Order.find({});
        const totalSales = orders
            .filter(order => order.isPaid)
            .reduce((acc, item) => acc + item.totalPrice, 0);

        const ordersCount = orders.length;

        const User = require('../models/User');
        const usersCount = await User.countDocuments();

        const Product = require('../models/Product');
        const productsCount = await Product.countDocuments();

        // Daily sales for chart (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const salesData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo },
                    isPaid: true
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    sales: { $sum: "$totalPrice" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Sales by Category
        const salesByCategory = await Order.aggregate([
            { $match: { isPaid: true } },
            { $unwind: "$orderItems" },
            {
                $group: {
                    _id: "$orderItems.name", // Fallback to item name if category not stored in item
                    total: { $sum: { $multiply: ["$orderItems.pricePaid", "$orderItems.quantity"] } }
                }
            },
            { $limit: 5 },
            { $sort: { total: -1 } }
        ]);

        res.json({
            totalSales,
            ordersCount,
            usersCount,
            productsCount,
            salesData,
            salesByCategory
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {

    getOrderSummary,
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    getMyOrders,
    getOrders,
    updateOrderStatus,
    downloadInvoice,
    cancelOrder,
    retryPayment
};
