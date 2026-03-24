const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// Category Routes
router.get('/categories', getCategories);
router.post('/categories', protect, admin, createCategory);

// Search Suggestions
router.get('/suggestions', getSearchSuggestions);

// Product Routes
router.route('/').get(getProducts).post(protect, admin, createProduct);
router.post('/bulk', protect, admin, bulkCreateProducts);
router.get('/:id/similar', getSimilarProducts);
router.route('/:id')
    .get(getProductById)
    .put(protect, admin, updateProduct)
    .delete(protect, admin, deleteProduct);

router.post('/:id/reviews', protect, createProductReview);

// Variation Routes
router.post('/:id/variations', protect, admin, createProductVariation);
router.route('/:id/variations/:variationId')
    .put(protect, admin, updateProductVariation)
    .delete(protect, admin, deleteProductVariation);

module.exports = router;
