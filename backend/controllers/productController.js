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
        if (error.code === 11000) {
            return res.status(400).json({ message: 'A variation with this exact SKU already exists. SKUs must be unique.' });
        }
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

// @desc    Update a product variation
// @route   PUT /api/products/:id/variations/:variationId
// @access  Private/Admin
const updateProductVariation = async (req, res) => {
    try {
        const { stockQuantity, priceAdjustment, isActive } = req.body;
        const variation = await ProductVariation.findById(req.params.variationId);

        if (variation) {
            if (stockQuantity !== undefined) variation.stockQuantity = stockQuantity;
            if (priceAdjustment !== undefined) variation.priceAdjustment = priceAdjustment;
            if (isActive !== undefined) variation.isActive = isActive;

            const updatedVariation = await variation.save();
            res.json(updatedVariation);
        } else {
            res.status(404).json({ message: 'Product variation not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a product variation
// @route   DELETE /api/products/:id/variations/:variationId
// @access  Private/Admin
const deleteProductVariation = async (req, res) => {
    try {
        const variation = await ProductVariation.findById(req.params.variationId);

        if (variation) {
            await variation.deleteOne();
            res.json({ message: 'Product variation removed' });
        } else {
            res.status(404).json({ message: 'Product variation not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            const alreadyReviewed = product.reviews.find(
                (r) => r.user.toString() === req.user.id.toString()
            );

            if (alreadyReviewed) {
                return res.status(400).json({ message: 'Product already reviewed' });
            }

            const review = {
                name: req.user.name,
                rating: Number(rating),
                comment,
                user: req.user.id,
            };

            product.reviews.push(review);
            product.numOfReviews = product.reviews.length;
            product.averageRating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

            await product.save();
            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get similar products
// @route   GET /api/products/:id/similar
// @access  Public
const getSimilarProducts = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Find products in the same category, excluding the current product, limit to 4
        const similarProducts = await Product.find({
            category: product.category,
            _id: { $ne: product._id },
            isActive: true
        }).limit(4);

        // If not enough products in same category, fallback to just any other products
        if (similarProducts.length < 4) {
            const moreProducts = await Product.find({
                _id: { $nin: [product._id, ...similarProducts.map(p => p._id)] },
                isActive: true
            }).limit(4 - similarProducts.length);

            similarProducts.push(...moreProducts);
        }

        res.json(similarProducts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get search suggestions
// @route   GET /api/products/suggestions
// @access  Public
const getSearchSuggestions = async (req, res) => {
    try {
        const query = req.query.q || '';
        const limit = 5;

        // Search in products
        const products = await Product.find({
            name: { $regex: query, $options: 'i' },
            isActive: true
        }).limit(limit).select('name');

        // Search in categories
        const categories = await Category.find({
            name: { $regex: query, $options: 'i' },
            isActive: true
        }).limit(limit).select('name');

        const suggestions = [
            ...categories.map(c => c.name),
            ...products.map(p => p.name)
        ];

        // Remove duplicates and limit
        res.json([...new Set(suggestions)].slice(0, 8));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Bulk create products
// @route   POST /api/products/bulk
// @access  Private/Admin
const bulkCreateProducts = async (req, res) => {
    try {
        const { products } = req.body;
        if (!Array.isArray(products)) {
            return res.status(400).json({ message: 'Products data must be an array' });
        }

        const stats = { created: 0, failed: 0, errors: [] };

        for (const item of products) {
            try {
                // Find or create category
                let categoryId;
                if (item.category) {
                    let cat = await Category.findOne({ name: { $regex: new RegExp(`^${item.category}$`, 'i') } });
                    if (!cat) {
                        cat = await Category.create({ name: item.category, description: 'Auto-created via bulk import' });
                    }
                    categoryId = cat._id;
                }

                // Create product
                const product = new Product({
                    name: item.name,
                    slug: item.slug || item.name.toLowerCase().replace(/ /g, '-'),
                    description: item.description || '',
                    category: categoryId,
                    basePrice: item.basePrice || 0,
                    brand: item.brand || 'Student Note Books',
                    gstPercentage: item.gstPercentage || 12,
                    images: item.image ? [item.image] : []
                });

                const createdProduct = await product.save();

                // Create variations if provided
                if (item.variations && Array.isArray(item.variations)) {
                    for (const v of item.variations) {
                        await ProductVariation.create({
                            product: createdProduct._id,
                            sku: v.sku || `${createdProduct.slug}-${Math.random().toString(36).substring(7)}`,
                            attributes: v.attributes || {},
                            priceAdjustment: v.priceAdjustment || 0,
                            stockQuantity: v.stockQuantity || 0,
                            lowStockThreshold: v.lowStockThreshold || 5
                        });
                    }
                } else if (item.sku) {
                    // Create a single default variation if only SKU is provided
                    await ProductVariation.create({
                        product: createdProduct._id,
                        sku: item.sku,
                        attributes: { Type: 'Default' },
                        priceAdjustment: 0,
                        stockQuantity: item.stockQuantity || 0
                    });
                }

                stats.created++;
            } catch (err) {
                stats.failed++;
                stats.errors.push({ name: item.name, error: err.message });
            }
        }

        res.status(201).json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSearchSuggestions,
    getProducts,
    getProductById,
    createProduct,
    createProductVariation,
    updateProductVariation,
    deleteProductVariation,
    getCategories,
    createCategory,
    updateProduct,
    deleteProduct,
    createProductReview,
    getSimilarProducts,
    bulkCreateProducts
};
