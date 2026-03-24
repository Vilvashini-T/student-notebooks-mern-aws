const express = require('express');
const router = express.Router();
const {
    validateCoupon,
    createCoupon,
    getCoupons,
    getActiveCoupons
} = require('../controllers/couponController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, admin, getCoupons)
    .post(protect, admin, createCoupon);

router.get('/active', getActiveCoupons);

router.post('/validate', validateCoupon);

module.exports = router;
