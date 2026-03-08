const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    basePrice: { type: Number, required: true },
    gstPercentage: { type: Number, required: true, default: 18 },
    brand: { type: String, default: 'Student Note Books' },
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
    averageRating: { type: Number, default: 0 },
    numOfReviews: { type: Number, default: 0 }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
