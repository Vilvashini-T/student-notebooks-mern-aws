const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');

// Route to get Razorpay public key
router.get('/razorpay', (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key' });
});

// Route to generate an order instance holding the amount
router.post('/razorpayUrl', async (req, res) => {
    try {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_secret',
        });

        const options = {
            amount: req.body.amount * 100, // Razorpay takes amount in paisa (smallest unit)
            currency: 'INR',
            receipt: 'receipt_order_' + Date.now(),
        };

        const configOrder = await instance.orders.create(options);

        if (!configOrder) {
            return res.status(500).send('Some error occurred while executing Razorpay SDK');
        }

        res.json(configOrder);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

module.exports = router;
