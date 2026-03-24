const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/orderController');
const { protect, admin, shopkeeperOrAdmin } = require('../middleware/authMiddleware');

router.route('/summary').get(protect, admin, getOrderSummary);
router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/invoice').get(protect, downloadInvoice);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/cancel').put(protect, cancelOrder);
router.route('/:id/retry-payment').post(protect, retryPayment);
router.route('/:id/status').put(protect, shopkeeperOrAdmin, updateOrderStatus);

module.exports = router;
