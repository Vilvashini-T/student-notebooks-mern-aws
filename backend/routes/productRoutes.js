const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    createProductVariation,
    getCategories,
    createCategory,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// Category Routes
router.get('/categories', getCategories);
router.post('/categories', protect, admin, createCategory);

// Product Routes
router.route('/').get(getProducts).post(protect, admin, createProduct);
router.route('/:id')
    .get(getProductById)
    .put(protect, admin, updateProduct)
    .delete(protect, admin, deleteProduct);

// Variation Routes
router.post('/:id/variations', protect, admin, createProductVariation);

module.exports = router;
