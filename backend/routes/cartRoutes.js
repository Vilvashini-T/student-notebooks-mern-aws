const express = require('express');
const router = express.Router();
const { syncCart, getCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getCart)
    .delete(protect, clearCart);

router.post('/sync', protect, syncCart);

module.exports = router;
