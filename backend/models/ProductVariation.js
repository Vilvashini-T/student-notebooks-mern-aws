const mongoose = require('mongoose');

const productVariationSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    sku: { type: String, required: true, unique: true },
    attributes: {
        type: Map,
        of: String
    },
    priceAdjustment: { type: Number, default: 0 },
    stockQuantity: { type: Number, required: true, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const ProductVariation = mongoose.model('ProductVariation', productVariationSchema);
module.exports = ProductVariation;
