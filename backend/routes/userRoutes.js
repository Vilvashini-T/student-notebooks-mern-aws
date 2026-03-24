const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
    addUserAddress,
    deleteUserAddress,
    toggleWishlist,
    forgotPassword,
    resetPassword
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.post('/profile/address', protect, addUserAddress);
router.delete('/profile/address/:addressId', protect, deleteUserAddress);
router.post('/profile/wishlist', protect, toggleWishlist);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;
