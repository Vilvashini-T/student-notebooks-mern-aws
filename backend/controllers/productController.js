const Product = require('../models/Product');
const ProductVariation = require('../models/ProductVariation');
const Category = require('../models/Category');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const { keyword, category, brand, minPrice, maxPrice, sort } = req.query;

        const query = { isActive: true };

        if (keyword) {
            query.name = { $regex: keyword, $options: 'i' };
        }

        if (category) {
            query.category = category;
        }

        if (brand) {
            query.brand = brand;
        }

        if (minPrice || maxPrice) {
            query.basePrice = {};
            if (minPrice) query.basePrice.$gte = Number(minPrice);
            if (maxPrice) query.basePrice.$lte = Number(maxPrice);
        }

        let sortQuery = { createdAt: -1 }; // Default: Newest

        if (sort === 'priceLow') {
            sortQuery = { basePrice: 1 };
        } else if (sort === 'priceHigh') {
            sortQuery = { basePrice: -1 };
        } else if (sort === 'oldest') {
            sortQuery = { createdAt: 1 };
        }

        const products = await Product.find(query)
            .populate('category', 'name')
            .sort(sortQuery);

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single product with its variations
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name');
        if (product) {
            const variations = await ProductVariation.find({ product: product._id, isActive: true });
            res.json({ product, variations });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        const { name, slug, description, category, basePrice, brand, gstPercentage } = req.body;

        const product = new Product({
            name,
            slug,
            description,
            category,
            basePrice,
            brand: brand || 'Student Note Books',
            gstPercentage,
            images: [] // Handle image upload separately
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product variation
// @route   POST /api/products/:id/variations
// @access  Private/Admin
const createProductVariation = async (req, res) => {
    try {
        const { sku, attributes, priceAdjustment, stockQuantity, lowStockThreshold } = req.body;

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const variation = new ProductVariation({
            product: product._id,
            sku,
            attributes,
            priceAdjustment,
            stockQuantity,
            lowStockThreshold
        });

        const createdVariation = await variation.save();
        res.status(201).json(createdVariation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const categoryExists = await Category.findOne({ name });

        if (categoryExists) {
            return res.status(400).json({ message: "Category already exists" });
        }

        const category = new Category({ name, description });
        const createdCategory = await category.save();
        res.status(201).json(createdCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const { name, basePrice, description, images, brand, category, gstPercentage } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name || product.name;
            product.basePrice = basePrice || product.basePrice;
            product.description = description || product.description;
            product.images = images || product.images;
            product.brand = brand || product.brand;
            product.category = category || product.category;
            product.gstPercentage = gstPercentage || product.gstPercentage;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a product (Soft Delete)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            product.isActive = false;
            await product.save();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    createProductVariation,
    getCategories,
    createCategory,
    updateProduct,
    deleteProduct
};
