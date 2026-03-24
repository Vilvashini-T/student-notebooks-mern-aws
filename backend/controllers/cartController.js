const Cart = require('../models/Cart');

// @desc    Sync local cart to user cart
// @route   POST /api/cart/sync
// @access  Private
const syncCart = async (req, res) => {
    try {
        const { cartItems } = req.body;

        let cart = await Cart.findOne({ user: req.user._id });

        if (cart) {
            // Intelligent Merge Logic: Local Cart + Server Cart
            let mergedItems = [...cart.cartItems];

            for (const incomingItem of (cartItems || [])) {
                // Try to find the same variation already in the server cart
                const existingIndex = mergedItems.findIndex(i =>
                    i.variation && incomingItem.variation &&
                    i.variation.toString() === incomingItem.variation.toString()
                );

                if (existingIndex > -1) {
                    // Update quantity taking the maximum of local/server to ensure items aren't randomly lost
                    mergedItems[existingIndex].quantity = Math.max(mergedItems[existingIndex].quantity, incomingItem.quantity);
                } else {
                    // It's a brand new item from local, push it to server
                    mergedItems.push(incomingItem);
                }
            }

            cart.cartItems = mergedItems;
            await cart.save();
            res.json(cart);
        } else {
            // Create a new cart if none exists
            cart = new Cart({
                user: req.user._id,
                cartItems: cartItems || []
            });
            await cart.save();
            res.status(201).json(cart);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = new Cart({ user: req.user._id, cartItems: [] });
            await cart.save();
        }

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Clear user cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.cartItems = [];
            await cart.save();
            res.json({ message: 'Cart cleared', cart });
        } else {
            res.status(404).json({ message: 'Cart not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    syncCart,
    getCart,
    clearCart
};
