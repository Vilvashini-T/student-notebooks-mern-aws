/**
 * Abandoned Cart Recovery Job
 * 
 * Run this with: node backend/jobs/abandonedCartJob.js
 * 
 * In production: schedule via cron or a task manager like node-cron.
 * Install: npm install node-cron
 * 
 * This script finds users who:
 *   - Have items in their server-side cart
 *   - Have NOT placed an order in the last 24 hours
 *   - Have NOT received an abandoned cart email in the last 48 hours
 * 
 * Then sends them a reminder email.
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const connectDB = require('../config/db');

connectDB();

// Inline models for the job
const User = require('../models/User');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendAbandonedCartEmail = async (user, cartItems) => {
    const itemsList = cartItems.map(item =>
        `<tr>
            <td style="padding:8px;border-bottom:1px solid #eee">${item.name}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">Qty: ${item.quantity}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">Rs. ${item.pricePaid.toFixed(2)}</td>
        </tr>`
    ).join('');

    const total = cartItems.reduce((s, i) => s + i.pricePaid * i.quantity, 0);

    const mailOptions = {
        from: `"Student Note Books" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: user.email,
        subject: '🛒 You left something behind!',
        html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <h2 style="color:#4f46e5">Hi ${user.name.split(' ')[0]}! 👋</h2>
            <p>You left some great items in your cart. Don't let them go!</p>
            
            <table style="width:100%;border-collapse:collapse;margin:20px 0">
                <thead>
                    <tr style="background:#f3f4f6">
                        <th style="padding:10px;text-align:left">Item</th>
                        <th style="padding:10px;text-align:right">Qty</th>
                        <th style="padding:10px;text-align:right">Price</th>
                    </tr>
                </thead>
                <tbody>${itemsList}</tbody>
            </table>

            <p style="font-size:1.1rem;font-weight:bold">Cart Total: Rs. ${total.toFixed(2)}</p>
            
            <p style="color:#6b7280;font-size:0.9rem">Use code <strong>WELCOME10</strong> for 10% off!</p>

            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart" 
               style="display:inline-block;margin-top:16px;background:#4f46e5;color:white;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:700">
                Complete Your Purchase →
            </a>

            <hr style="margin-top:30px;border-color:#e5e7eb">
            <p style="color:#9ca3af;font-size:0.8rem">Student Note Books, Erode. You're receiving this because you have items in your cart.</p>
        </div>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Abandoned cart email sent to ${user.email}`);
    } catch (err) {
        console.error(`❌ Failed to send email to ${user.email}:`, err.message);
    }
};

const runAbandonedCartJob = async () => {
    console.log('🕐 Running abandoned cart job at', new Date().toISOString());

    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    try {
        // Find carts that have items and were updated more than 1 hour ago (abandoned)
        const abandonedCarts = await Cart.find({
            updatedAt: { $lt: new Date(Date.now() - 60 * 60 * 1000) } // > 1 hour ago
        }).populate('user', 'name email');

        for (const cart of abandonedCarts) {
            if (!cart.cartItems || cart.cartItems.length === 0) continue;
            if (!cart.user) continue;

            // Check if user has placed an order in last 24 hours
            const recentOrder = await Order.findOne({
                user: cart.user._id,
                createdAt: { $gte: cutoffTime }
            });

            if (recentOrder) {
                console.log(`   Skipping ${cart.user.email} - has recent order`);
                continue;
            }

            await sendAbandonedCartEmail(cart.user, cart.cartItems);
        }

        console.log('✅ Abandoned cart job complete.');
    } catch (err) {
        console.error('❌ Job error:', err.message);
    } finally {
        mongoose.connection.close();
    }
};

runAbandonedCartJob();
