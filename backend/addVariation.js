// addVariation.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const ProductVariation = require('./models/ProductVariation');

dotenv.config();

const productId = '69ad97c538a6f8651deec7d7'; // target product ID

const addVariation = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student-note-books');
        console.log('MongoDB connected');
        const product = await Product.findById(productId);
        if (!product) {
            console.error('Product not found');
            process.exit(1);
        }
        const variation = new ProductVariation({
            product: product._id,
            sku: 'SN-NB-100P',
            attributes: { type: 'Standard' },
            priceAdjustment: 0,
            stockQuantity: 10,
        });
        await variation.save();
        console.log('Variation created:', variation);
        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

addVariation();
