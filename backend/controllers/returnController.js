const ReturnRequest = require('../models/ReturnRequest');
const Order = require('../models/Order');
const ProductVariation = require('../models/ProductVariation');

// @desc    Create a return/replacement request
// @route   POST /api/returns
// @access  Private
const createReturnRequest = async (req, res) => {
    try {
        const { orderId, reason, type, description } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Only the owner can request a return
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Can only return a delivered order
        if (!order.isDelivered) {
            return res.status(400).json({ message: 'Return/replacement can only be requested for delivered orders' });
        }

        // Check if a return request already exists for this order
        const existingRequest = await ReturnRequest.findOne({ order: orderId });
        if (existingRequest) {
            return res.status(400).json({ message: `A ${existingRequest.type} request already exists for this order (Status: ${existingRequest.status})` });
        }

        const returnRequest = new ReturnRequest({
            order: orderId,
            user: req.user._id,
            reason,
            type,
            description
        });

        const created = await returnRequest.save();
        res.status(201).json(created);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my return requests
// @route   GET /api/returns/mine
// @access  Private
const getMyReturnRequests = async (req, res) => {
    try {
        const requests = await ReturnRequest.find({ user: req.user._id })
            .populate('order', '_id totalPrice orderItems createdAt')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all return requests (Admin)
// @route   GET /api/returns
// @access  Private/Admin
const getAllReturnRequests = async (req, res) => {
    try {
        const requests = await ReturnRequest.find({})
            .populate('order', '_id totalPrice orderItems')
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update return request status (Admin)
// @route   PUT /api/returns/:id/status
// @access  Private/Admin
const updateReturnStatus = async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        const returnRequest = await ReturnRequest.findById(req.params.id).populate('order');

        if (!returnRequest) {
            return res.status(404).json({ message: 'Return request not found' });
        }

        returnRequest.status = status;
        if (adminNotes) returnRequest.adminNotes = adminNotes;

        // If approved as a return, restore stock
        if (status === 'Completed' && returnRequest.type === 'return') {
            for (const item of returnRequest.order.orderItems) {
                const variation = await ProductVariation.findById(item.variation);
                if (variation) {
                    variation.stockQuantity += item.quantity;
                    await variation.save();
                }
            }
        }

        const updated = await returnRequest.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createReturnRequest,
    getMyReturnRequests,
    getAllReturnRequests,
    updateReturnStatus
};
