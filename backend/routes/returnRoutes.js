const express = require('express');
const router = express.Router();
const {
    createReturnRequest,
    getMyReturnRequests,
    getAllReturnRequests,
    updateReturnStatus
} = require('../controllers/returnController');
const { protect, admin, shopkeeperOrAdmin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createReturnRequest)
    .get(protect, shopkeeperOrAdmin, getAllReturnRequests);

router.get('/mine', protect, getMyReturnRequests);
router.put('/:id/status', protect, shopkeeperOrAdmin, updateReturnStatus);

module.exports = router;
