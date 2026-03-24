const Coupon = require('../models/Coupon');

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Public
const validateCoupon = async (req, res) => {
    try {
        let { code, cartTotal } = req.body;

        if (!code) return res.status(400).json({ message: 'Coupon code is required' });

        const searchCode = code.trim().toUpperCase();

        const coupon = await Coupon.findOne({ code: searchCode });

        if (!coupon) {
            return res.status(404).json({ message: 'Invalid coupon code' });
        }

        if (!coupon.isActive) {
            return res.status(400).json({ message: 'This coupon is no longer active' });
        }

        if (new Date() > new Date(coupon.expiryDate)) {
            return res.status(400).json({ message: 'This coupon has expired' });
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: 'This coupon has reached its usage limit' });
        }

        if (cartTotal < coupon.minOrderAmount) {
            return res.status(400).json({ message: `Minimum order amount of Rs. ${coupon.minOrderAmount} is required for this coupon` });
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discountType === 'percentage') {
            discount = (cartTotal * coupon.discountAmount) / 100;
        } else if (coupon.discountType === 'flat') {
            discount = coupon.discountAmount;
        }

        // Return validated info
        res.json({
            _id: coupon._id,
            code: coupon.code,
            discountType: coupon.discountType,
            discountAmount: coupon.discountAmount,
            calculatedDiscount: Math.min(discount, cartTotal) // Ensure discount is not more than cartTotal
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin: Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
    try {
        const { code, discountType, discountAmount, minOrderAmount, expiryDate, usageLimit } = req.body;

        const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
        if (couponExists) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }

        const coupon = new Coupon({
            code,
            discountType,
            discountAmount,
            minOrderAmount,
            expiryDate,
            usageLimit
        });

        const createdCoupon = await coupon.save();
        res.status(201).json(createdCoupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin: Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({});
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get active coupons for users
// @route   GET /api/coupons/active
// @access  Public
const getActiveCoupons = async (req, res) => {
    try {
        const currentDate = new Date();
        const activeCoupons = await Coupon.find({
            isActive: true,
            expiryDate: { $gt: currentDate },
            $expr: {
                $or: [
                    { $eq: ["$usageLimit", null] },
                    { $lt: ["$usedCount", "$usageLimit"] }
                ]
            }
        }).select('code discountType discountAmount minOrderAmount');
        res.json(activeCoupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    validateCoupon,
    createCoupon,
    getCoupons,
    getActiveCoupons
};
