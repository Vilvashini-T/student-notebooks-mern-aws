import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../Store';
import { Trash2 } from 'lucide-react';
import './CartPage.css';

const CartPage = () => {
    const { state, dispatch } = useStore();
    const { cart: { cartItems } } = state;
    const navigate = useNavigate();

    const removeFromCartHandler = (variationId) => {
        dispatch({ type: 'CART_REMOVE_ITEM', payload: variationId });
    };

    const checkoutHandler = () => {
        navigate('/login?redirect=shipping'); // Simple redirect logic prioritizing authentication
    };

    const subtotalCart = cartItems.reduce((acc, item) => acc + item.pricePaid * item.quantity, 0);

    return (
        <div className="cart-page-container">
            <h1 className="cart-title">Shopping Cart</h1>

            {cartItems.length === 0 ? (
                <div className="empty-cart">
                    <p>Your cart is empty.</p>
                    <Link to="/" className="continue-shopping">Go Back, Shop Collection</Link>
                </div>
            ) : (
                <div className="cart-content-grid">
                    <div className="cart-items-list">
                        {cartItems.map(item => (
                            <div key={item.variation} className="cart-item">
                                <div className="cart-item-image">
                                    <img src={item.image} alt={item.name} />
                                </div>

                                <div className="cart-item-details">
                                    <Link to={`/product/${item.product}`} className="cart-item-name">{item.name}</Link>
                                    <p className="cart-item-variation">
                                        Option: {Object.values(item.attributes).join(' | ')} (SKU: {item.sku})
                                    </p>
                                </div>

                                <div className="cart-item-price">
                                    Rs. {item.pricePaid.toFixed(2)}
                                </div>

                                <div className="cart-item-qty">
                                    Qty: {item.quantity}
                                </div>

                                <button
                                    type="button"
                                    className="cart-delete-btn"
                                    onClick={() => removeFromCartHandler(item.variation)}
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary-card">
                        <h2>Order Summary</h2>
                        <div className="summary-row">
                            <span>Items ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})</span>
                            <span>Rs. {subtotalCart.toFixed(2)}</span>
                        </div>
                        {/* Note: In a full app, you'd calculate GST and Shipping here properly */}
                        <div className="summary-row total">
                            <span>Subtotal</span>
                            <span>Rs. {subtotalCart.toFixed(2)}</span>
                        </div>

                        <button
                            type="button"
                            className="btn-checkout"
                            disabled={cartItems.length === 0}
                            onClick={checkoutHandler}
                        >
                            Proceed To Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
