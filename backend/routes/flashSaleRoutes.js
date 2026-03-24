const express = require('express');
const router = express.Router();
const FlashSale = require('../models/FlashSale');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get currently live flash sales (Public)
// @route   GET /api/flashsales/live
router.get('/live', async (req, res) => {
    try {
        const now = new Date();
        const liveSales = await FlashSale.find({
            isActive: true,
            startTime: { $lte: now },
            endTime: { $gte: now }
        }).populate('products', 'name basePrice images');
        res.json(liveSales);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Get all flash sales (Admin)
// @route   GET /api/flashsales
router.get('/', protect, admin, async (req, res) => {
    try {
        const sales = await FlashSale.find({}).populate('products', 'name basePrice').sort({ startTime: -1 });
        res.json(sales);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Create a flash sale (Admin)
// @route   POST /api/flashsales
router.post('/', protect, admin, async (req, res) => {
    try {
        const { name, discountPercentage, startTime, endTime, products, badge } = req.body;
        const sale = new FlashSale({ name, discountPercentage, startTime, endTime, products, badge });
        const created = await sale.save();
        res.status(201).json(created);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Toggle active status (Admin)
// @route   PUT /api/flashsales/:id
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const sale = await FlashSale.findById(req.params.id);
        if (!sale) return res.status(404).json({ message: 'Flash sale not found' });
        sale.isActive = req.body.isActive !== undefined ? req.body.isActive : sale.isActive;
        const updated = await sale.save();
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
