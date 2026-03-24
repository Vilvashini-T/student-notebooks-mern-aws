const mongoose = require('mongoose');

const flashSaleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    discountPercentage: { type: Number, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    isActive: { type: Boolean, default: true },
    badge: { type: String, default: '🔥 Flash Sale' }
}, { timestamps: true });

// Virtual: is the sale currently live?
flashSaleSchema.virtual('isLive').get(function () {
    const now = new Date();
    return this.isActive && now >= this.startTime && now <= this.endTime;
});

flashSaleSchema.set('toJSON', { virtuals: true });

const FlashSale = mongoose.model('FlashSale', flashSaleSchema);
module.exports = FlashSale;
