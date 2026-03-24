const mongoose = require('mongoose');

const returnRequestSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    type: {
        type: String,
        enum: ['return', 'replacement'],
        required: true
    },
    status: {
        type: String,
        enum: ['Requested', 'Approved', 'Rejected', 'Pickup Scheduled', 'Refund Initiated', 'Completed'],
        default: 'Requested'
    },
    description: { type: String },
    adminNotes: { type: String }
}, { timestamps: true });

const ReturnRequest = mongoose.model('ReturnRequest', returnRequestSchema);
module.exports = ReturnRequest;
