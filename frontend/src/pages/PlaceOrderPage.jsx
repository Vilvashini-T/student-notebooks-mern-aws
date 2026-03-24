import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../Store';
import API from '../api';
import CheckoutSteps from '../components/CheckoutSteps';
import toast from 'react-hot-toast';
import './CartPage.css'; // Reusing layout CSS

const PlaceOrderPage = () => {
    const navigate = useNavigate();
    const { state, dispatch } = useStore();
    const { cart, userLogin: { userInfo } } = state;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Coupon State
    const [couponCode, setCouponCode] = useState(cart.appliedCoupon ? cart.appliedCoupon.code : '');
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');
    const [activeCoupons, setActiveCoupons] = useState([]);

    useEffect(() => {
        if (!cart.cartItems || cart.cartItems.length === 0) {
            navigate('/cart');
        } else if (!cart.paymentMethod) {
            navigate('/payment');
        } else if (!cart.shippingAddress.street) {
            navigate('/shipping');
        } else if (!userInfo) {
            navigate('/login');
        } else {
            const fetchCoupons = async () => {
                try {
                    const { data } = await API.get('/api/coupons/active');
                    setActiveCoupons(data);
                } catch (error) {
                    console.error('Failed to fetch coupons', error);
                }
            };
            fetchCoupons();
        }
    }, [cart, navigate, userInfo]);

    // Calculations
    const addDecimals = (num) => (Math.round(num * 100) / 100).toFixed(2);

    cart.itemsPrice = addDecimals(cart.cartItems.reduce((acc, item) => acc + item.pricePaid * item.quantity, 0));

    // Calculate GST *included* in the price (since listing prices are GST inclusive)
    let taxObj = cart.cartItems.reduce((acc, item) => {
        let price = item.pricePaid * item.quantity;
        // Formula: Price - (Price / (1 + GST_RATE))
        let taxAmt = price - (price / (1 + item.gstPercentage / 100));
        return acc + taxAmt;
    }, 0);

    cart.taxPrice = addDecimals(taxObj);
    cart.shippingPrice = parseInt(cart.itemsPrice) > 500 ? addDecimals(0) : addDecimals(50);
    cart.totalPriceObj = Number(cart.itemsPrice) + Number(cart.shippingPrice);

    // Process Coupon Discount mathematically
    if (cart.appliedCoupon) {
        cart.totalPriceObj -= cart.appliedCoupon.calculatedDiscount;
    }

    cart.totalPrice = Math.max(0, cart.totalPriceObj).toFixed(2);

    const applyCouponHandler = async () => {
        setCouponError('');
        setCouponSuccess('');
        if (!couponCode) return;

        try {
            const { data } = await API.post('/api/coupons/validate', {
                code: couponCode,
                cartTotal: Number(cart.itemsPrice)
            });

            dispatch({ type: 'CART_APPLY_COUPON', payload: data });
            setCouponSuccess(`Coupon applied! You saved Rs. ${data.calculatedDiscount.toFixed(2)}`);
            toast.success(`Coupon Applied! Saved Rs. ${data.calculatedDiscount.toFixed(2)}`);
        } catch (err) {
            setCouponError(err.response?.data?.message || err.message);
            toast.error(err.response?.data?.message || err.message);
            dispatch({ type: 'CART_REMOVE_COUPON' });
        }
    };

    const removeCouponHandler = () => {
        dispatch({ type: 'CART_REMOVE_COUPON' });
        setCouponCode('');
        setCouponSuccess('');
        setCouponError('');
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const placeOrderHandler = async () => {
        setLoading(true);
        setError(null);
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            const formattedCartItems = cart.cartItems.map(item => ({
                ...item,
                gstAmountPaid: Number((item.pricePaid * item.quantity * (item.gstPercentage / 100)).toFixed(2))
            }));

            // 1. Create order in Database First
            const { data: order } = await API.post(
                '/api/orders',
                {
                    orderItems: formattedCartItems,
                    shippingAddress: cart.shippingAddress,
                    paymentMethod: cart.paymentMethod,
                    itemsPrice: cart.itemsPrice,
                    taxPrice: cart.taxPrice,
                    shippingPrice: cart.shippingPrice,
                    discountPrice: cart.appliedCoupon ? cart.appliedCoupon.calculatedDiscount : 0,
                    totalPrice: cart.totalPrice,
                    coupon: cart.appliedCoupon ? cart.appliedCoupon._id : null,
                }
            );

            if (cart.paymentMethod === 'Razorpay') {
                const res = await loadRazorpayScript();

                if (!res) {
                    setError('Razorpay SDK failed to load. Are you online?');
                    setLoading(false);
                    return;
                }

                // Call backend to create Razorpay "order" instance based on total
                const { data: configOrder } = await API.post(`/api/config/razorpayUrl`, { amount: cart.totalPrice });
                const { data: { key } } = await API.get('/api/config/razorpay');

                const options = {
                    key: key,
                    amount: configOrder.amount,
                    currency: configOrder.currency,
                    name: 'Student Note Books',
                    description: 'Order Payment',
                    order_id: configOrder.id,
                    handler: async function (response) {
                        try {
                            const paymentResult = {
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature
                            };

                            // Send signature back to backend for cryptographic verification
                            await API.put(`/api/orders/${order._id}/pay`, {
                                ...paymentResult,
                                paymentMethod: 'Razorpay'
                            });

                            dispatch({ type: 'CART_CLEAR_ITEMS' });
                            localStorage.removeItem('cartItems');
                            toast.success('Payment Successful!');
                            navigate(`/order/${order._id}`);
                        } catch (paymentErr) {
                            setError(paymentErr.response?.data?.message || 'Payment Verification Failed');
                            toast.error('Payment Verification Failed');
                        }
                    },
                    prefill: {
                        name: userInfo.name,
                        email: userInfo.email,
                    },
                    theme: {
                        color: '#4f46e5'
                    }
                };

                const paymentObject = new window.Razorpay(options);
                paymentObject.open();

            } else {
                // Cash on delivery scenario
                dispatch({ type: 'CART_CLEAR_ITEMS' });
                localStorage.removeItem('cartItems');
                toast.success('Order placed successfully!');
                navigate(`/order/${order._id}`);
            }
            setLoading(false);

        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    return (
        <div className="admin-container">
            <CheckoutSteps step1 step2 step3 step4 />

            <div className="store-layout" style={{ marginTop: '2rem' }}>
                <div style={{ flex: 1 }}>
                    <div className="auth-card" style={{ marginBottom: '2rem', padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>Delivery & Payment</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delivery Address</h3>
                                <p style={{ lineHeight: '1.6', color: 'var(--text-main)' }}>
                                    <strong>{userInfo.name.split(' ')[0]}</strong><br />
                                    {cart.shippingAddress.street}<br />
                                    {cart.shippingAddress.city}, {cart.shippingAddress.state} {cart.shippingAddress.postalCode}
                                </p>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Method</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontWeight: 600 }}>
                                    {cart.paymentMethod === 'Razorpay' ? 'Secure Online Payment (Razorpay)' : 'Cash on Delivery'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="auth-card" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>Review Items</h2>
                        {cart.cartItems.length === 0 ? (
                            <p>Your cart is empty.</p>
                        ) : (
                            <div>
                                {cart.cartItems.map((item, index) => (
                                    <div key={index} style={{ display: 'flex', gap: '1.5rem', padding: '1.2rem 0', borderBottom: index < cart.cartItems.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                                        <div style={{ width: '80px', height: '80px', background: '#fff', border: '1px solid #eee', borderRadius: '4px', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <img src={API.getImageUrl(item.image)} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <Link to={`/product/${item._id}`} style={{ fontWeight: 600, color: 'var(--secondary-color)', fontSize: '1rem' }}>{item.name}</Link>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Sold by: Student Note Books</div>
                                            <div style={{ marginTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                                <span style={{ fontSize: '1rem', fontWeight: 700 }}>Rs. {item.pricePaid}</span>
                                                <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Qty: {item.quantity}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ width: '380px' }}>
                    <div style={{ position: 'sticky', top: '100px', background: 'white', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>Order Price Details</h2>

                        <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ color: 'var(--text-main)' }}>Price ({cart.cartItems.length} items)</span>
                            <span>Rs. {cart.itemsPrice}</span>
                        </div>
                        <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ color: 'var(--text-main)' }}>Delivery Charges</span>
                            <span style={{ color: Number(cart.shippingPrice) === 0 ? 'var(--success-color)' : 'inherit' }}>
                                {Number(cart.shippingPrice) === 0 ? 'FREE' : `Rs. ${cart.shippingPrice}`}
                            </span>
                        </div>

                        {cart.appliedCoupon && (
                            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--success-color)', fontWeight: 600 }}>
                                <span>Coupon Discount</span>
                                <span>- Rs. {cart.appliedCoupon.calculatedDiscount.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="summary-row total" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border-color)', fontSize: '1.25rem', fontWeight: 800 }}>
                            <span>Total Amount</span>
                            <span>Rs. {cart.totalPrice}</span>
                        </div>

                        <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '0.9rem', marginBottom: '0.8rem', fontWeight: 700 }}>Apply Promo Code</h3>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="Enter code"
                                    disabled={cart.appliedCoupon !== null}
                                    style={{ flex: 1, padding: '0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none' }}
                                />
                                {cart.appliedCoupon ? (
                                    <button type="button" onClick={removeCouponHandler} style={{ padding: '0.6rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Remove</button>
                                ) : (
                                    <button type="button" onClick={applyCouponHandler} style={{ padding: '0.6rem 1rem', background: 'var(--secondary-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Apply</button>
                                )}
                            </div>
                            {couponError && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>{couponError}</div>}

                            {activeCoupons.length > 0 && !cart.appliedCoupon && (
                                <div style={{ marginTop: '1rem' }}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Best Offer For You:</p>
                                    <div style={{ padding: '0.8rem', border: '1px solid #388e3c', borderRadius: '4px', background: '#f0fdf4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setCouponCode(activeCoupons[0].code)}>
                                        <div>
                                            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#166534' }}>{activeCoupons[0].code}</span>
                                            <span style={{ display: 'block', fontSize: '0.7rem', color: '#166534' }}>Save extra on this order</span>
                                        </div>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534' }}>APPLY</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {error && <div style={{ color: '#ef4444', padding: '1rem', background: '#fef2f2', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

                        <button
                            type="button"
                            className="auth-btn"
                            disabled={cart.cartItems.length === 0 || loading}
                            onClick={placeOrderHandler}
                            style={{ background: 'var(--accent-color)', fontSize: '1.2rem', padding: '1.2rem', boxShadow: '0 4px 12px rgba(251, 100, 27, 0.2)' }}
                        >
                            {loading ? 'Processing...' : 'CONFIRM & PLACE ORDER'}
                        </button>

                        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                            Safe & Secure Payments. 100% Authentic products.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrderPage;
