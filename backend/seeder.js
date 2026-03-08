const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const ProductVariation = require('./models/ProductVariation');
const Order = require('./models/Order');

// Configure dotenv
dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student-note-books');
        console.log('MongoDB Connected for Seeding');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const importData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Order.deleteMany();
        await ProductVariation.deleteMany();
        await Product.deleteMany();
        await Category.deleteMany();
        await User.deleteMany();

        // 1. Create Users
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('123456', salt);

        const users = await User.insertMany([
            {
                name: 'Admin User',
                email: 'admin@studentnotebooks.com',
                password,
                role: 'admin',
                phone: '9876543210'
            },
            {
                name: 'John Doe Customer',
                email: 'john@example.com',
                password,
                role: 'customer',
                phone: '7654321098'
            }
        ]);

        // 2. Create Categories
        const categories = await Category.insertMany([
            { name: 'Notebooks', description: 'Premium Ruled and Unruled Academic Notebooks' }
        ]);

        // 3. Create Template Product
        const baseProduct = new Product({
            name: 'Premium King Size Notebook',
            slug: 'premium-king-size-notebook',
            description: 'The signature 172-page king size notebook from Student Note Books, Erode. Features high-GSM smooth paper.',
            category: categories[0]._id,
            basePrice: 50,
            gstPercentage: 18,
            brand: 'Student Note Books',
            images: ['https://via.placeholder.com/400x500?text=Premium+Notebook']
        });
        await baseProduct.save();

        // 4. Create Essential Variations
        await ProductVariation.insertMany([
            {
                product: baseProduct._id,
                sku: 'NB-KING-172-RUL',
                attributes: { pages: '172', type: 'Ruled' },
                priceAdjustment: 0,
                stockQuantity: 100
            },
            {
                product: baseProduct._id,
                sku: 'NB-KING-172-UNR',
                attributes: { pages: '172', type: 'Unruled' },
                priceAdjustment: 0,
                stockQuantity: 100
            }
        ]);

        console.log('Data Imported successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error with seeding data: ${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await connectDB();

        await User.deleteMany();
        await Category.deleteMany();
        await Product.deleteMany();
        await ProductVariation.deleteMany();
        // Assuming Order is required at top if used, let's omit for destroy or require it.

        console.log('Data Destroyed successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error destroying data: ${error}`);
        process.exit(1);
    }
}

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
