import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../Store';
import { Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import API from '../api';
import toast from 'react-hot-toast';
import CheckoutSteps from '../components/CheckoutSteps';
import './CartPage.css';

const CartPage = () => {
    const { state, dispatch } = useStore();
    const { cart: { cartItems } } = state;
    const navigate = useNavigate();

    const [stockWarnings, setStockWarnings] = useState({}); // { variationId: message }
    const [validating, setValidating] = useState(false);

    // ✅ Live stock revalidation on Cart open (Edge Case from spec)
    useEffect(() => {
        const validateStock = async () => {
            if (cartItems.length === 0) return;
            setValidating(true);
            const warnings = {};

            for (const item of cartItems) {
                try {
                    const { data } = await API.get(`/api/products/${item.product}`);
                    const variation = data.variations?.find(v => v._id === item.variation);

                    if (!variation) {
                        warnings[item.variation] = 'This item/variation is no longer available.';
                    } else if (variation.stockQuantity === 0) {
                        warnings[item.variation] = 'This item is now out of stock.';
                    } else if (item.quantity > variation.stockQuantity) {
                        warnings[item.variation] = `Only ${variation.stockQuantity} available. Your quantity has been adjusted.`;
                        // Auto-correct qty to max available
                        dispatch({
                            type: 'CART_ADD_ITEM',
                            payload: { ...item, quantity: variation.stockQuantity }
                        });
                    }
                } catch {
                    // silently skip if API error
                }
            }

            setStockWarnings(warnings);
            setValidating(false);
        };

        validateStock();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const removeFromCartHandler = (variationId) => {
        dispatch({ type: 'CART_REMOVE_ITEM', payload: variationId });
    };

    const updateQtyHandler = (item, newQty) => {
        if (newQty < 1) return;
        dispatch({ type: 'CART_ADD_ITEM', payload: { ...item, quantity: newQty } });
    };

    const checkoutHandler = () => {
        navigate('/login?redirect=shipping');
    };

    const subtotalCart = cartItems.reduce((acc, item) => acc + item.pricePaid * item.quantity, 0);
    const hasWarnings = Object.keys(stockWarnings).length > 0;

    return (
        <div className="admin-container">
            <CheckoutSteps step1 />

            <div className="admin-header" style={{ margin: '2rem 0' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <ShoppingCart size={32} style={{ color: 'var(--primary-color)' }} />
                    My Shopping Cart
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>{cartItems.length} items currently in your bag</p>
            </div>

            {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'white', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                    <ShoppingCart size={64} style={{ color: '#e5e7eb', marginBottom: '1.5rem' }} />
                    <h2 style={{ color: 'var(--secondary-color)', marginBottom: '0.8rem' }}>Your cart is empty</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Looks like you haven't added anything to your cart yet.</p>
                    <Link to="/" className="auth-btn" style={{ width: 'auto', display: 'inline-block', padding: '0.8rem 2.5rem' }}>Start Shopping</Link>
                </div>
            ) : (
                <div className="store-layout">
                    <div style={{ flex: 1 }}>
                        {/* Stock Warning Banner */}
                        {hasWarnings && (
                            <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 'var(--radius-md)', padding: '1.2rem', marginBottom: '1.5rem', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                <AlertTriangle size={24} color="#d97706" />
                                <div>
                                    <strong style={{ color: '#92400e', display: 'block' }}>Stock Alert</strong>
                                    <span style={{ color: '#b45309', fontSize: '0.9rem' }}>Some items in your cart have availability changes. Please review.</span>
                                </div>
                            </div>
                        )}

                        {validating && (
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                                ⟳ Authenticating live stock availability...
                            </div>
                        )}

                        <div style={{ background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                            {cartItems.map((item, index) => (
                                <div key={item.variation} style={{
                                    padding: '1.5rem',
                                    borderBottom: index < cartItems.length - 1 ? '1px solid #f1f5f9' : 'none',
                                    display: 'flex',
                                    gap: '1.5rem',
                                    position: 'relative'
                                }}>
                                    <div style={{ width: '120px', height: '120px', background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <img src={API.getImageUrl(item.image)} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <Link to={`/product/${item.product}`} style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--secondary-color)', textDecoration: 'none' }}>{item.name}</Link>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                    Variant: {Object.values(item.attributes).join(' | ')} (SKU: {item.sku})
                                                </p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--secondary-color)' }}>
                                                    Rs. {(item.pricePaid * item.quantity).toFixed(2)}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    Rs. {item.pricePaid.toFixed(2)} / unit
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginRight: '8px' }}>Quantity:</span>
                                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#f8fafc', padding: '2px' }}>
                                                    <button
                                                        style={{ width: '32px', height: '32px', border: 'none', background: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 800, color: 'var(--primary-color)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                                        onClick={() => updateQtyHandler(item, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                    >-</button>
                                                    <span style={{ width: '40px', textAlign: 'center', fontWeight: 800, fontSize: '1rem' }}>{item.quantity}</span>
                                                    <button
                                                        style={{ width: '32px', height: '32px', border: 'none', background: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 800, color: 'var(--primary-color)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                                        onClick={() => updateQtyHandler(item, item.quantity + 1)}
                                                    >+</button>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removeFromCartHandler(item.variation)}
                                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 700 }}
                                            >
                                                <Trash2 size={18} /> REMOVE
                                            </button>
                                        </div>

                                        {stockWarnings[item.variation] && (
                                            <div style={{ marginTop: '1rem', padding: '0.8rem', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '6px', color: '#b91c1c', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <AlertTriangle size={16} />
                                                {stockWarnings[item.variation]}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ width: '380px' }}>
                        <div style={{ position: 'sticky', top: '100px', background: 'white', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>Order Price Details</h2>

                            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                                <span style={{ color: 'var(--text-main)' }}>Price ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                                <span>Rs. {subtotalCart.toFixed(2)}</span>
                            </div>

                            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                                <span style={{ color: 'var(--text-main)' }}>Delivery Charges</span>
                                <span style={{ color: subtotalCart > 500 ? 'var(--success-color)' : 'inherit', fontWeight: subtotalCart > 500 ? 700 : 400 }}>
                                    {subtotalCart > 500 ? 'FREE' : 'Rs. 50.00'}
                                </span>
                            </div>

                            <div className="summary-row total" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border-color)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--secondary-color)' }}>
                                <span>Total Amount</span>
                                <span>Rs. {(subtotalCart + (subtotalCart > 500 ? 0 : 50)).toFixed(2)}</span>
                            </div>

                            {subtotalCart <= 500 && (
                                <div style={{ marginTop: '1.5rem', padding: '0.8rem', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #dcfce7', color: '#166534', fontSize: '0.85rem', textAlign: 'center' }}>
                                    Add <strong>Rs. {(500 - subtotalCart).toFixed(2)}</strong> more for <strong>FREE Delivery</strong>!
                                </div>
                            )}

                            <button
                                type="button"
                                className="auth-btn"
                                disabled={cartItems.length === 0 || hasWarnings}
                                onClick={checkoutHandler}
                                style={{ marginTop: '2rem', padding: '1.1rem', fontSize: '1.1rem', background: 'var(--accent-color)', boxShadow: '0 4px 12px rgba(251, 100, 27, 0.2)' }}
                            >
                                PROCEED TO CHECKOUT
                            </button>

                            <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                                <Link to="/" style={{ color: 'var(--primary-color)', fontSize: '0.95rem', fontWeight: 700, textDecoration: 'none' }}>
                                    CONTINUE SHOPPING
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
