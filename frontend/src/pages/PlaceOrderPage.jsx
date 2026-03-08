import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../Store';
import axios from 'axios';
import './CartPage.css'; // Reusing layout CSS

const PlaceOrderPage = () => {
    const navigate = useNavigate();
    const { state, dispatch } = useStore();
    const { cart, userLogin: { userInfo } } = state;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!cart.paymentMethod) {
            navigate('/payment');
        } else if (!cart.shippingAddress.street) {
            navigate('/shipping');
        } else if (!userInfo) {
            navigate('/login');
        }
    }, [cart, navigate, userInfo]);

    // Calculations
    const addDecimals = (num) => (Math.round(num * 100) / 100).toFixed(2);

    cart.itemsPrice = addDecimals(cart.cartItems.reduce((acc, item) => acc + item.pricePaid * item.quantity, 0));

    // Calculate GST based on individual item gstPercentages
    let taxObj = cart.cartItems.reduce((acc, item) => {
        let price = item.pricePaid * item.quantity;
        let taxAmt = price * (item.gstPercentage / 100);
        return acc + taxAmt;
    }, 0);

    cart.taxPrice = addDecimals(taxObj);
    cart.shippingPrice = parseInt(cart.itemsPrice) > 500 ? addDecimals(0) : addDecimals(50);
    cart.totalPrice = (Number(cart.itemsPrice) + Number(cart.taxPrice) + Number(cart.shippingPrice)).toFixed(2);

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
            const { data: order } = await axios.post(
                'http://localhost:5000/api/orders',
                {
                    orderItems: formattedCartItems,
                    shippingAddress: cart.shippingAddress,
                    paymentMethod: cart.paymentMethod,
                    itemsPrice: cart.itemsPrice,
                    taxPrice: cart.taxPrice,
                    shippingPrice: cart.shippingPrice,
                    totalPrice: cart.totalPrice,
                },
                config
            );

            if (cart.paymentMethod === 'Razorpay') {
                // MOCK PAYMENT GATEWAY - Bypassing Razorpay due to KYC
                const simulatePayment = window.confirm(
                    `Payment Gateway Simulation\n\nTotal Due: Rs. ${cart.totalPrice}\n\nClick "OK" to simulate a successful payment transaction, or "Cancel" to simulate a failure.`
                );

                if (simulatePayment) {
                    // Payment Success Mock -> Mark order as paid
                    const paymentResult = {
                        id: `mock_pay_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                        status: 'completed',
                        update_time: new Date().toISOString(),
                        payer: { email_address: userInfo.email }
                    };

                    await axios.put(`http://localhost:5000/api/orders/${order._id}/pay`, paymentResult, config);

                    dispatch({ type: 'CART_CLEAR_ITEMS' });
                    localStorage.removeItem('cartItems');
                    navigate(`/order/${order._id}`);
                } else {
                    setError('Payment was cancelled or failed.');
                    setLoading(false);
                    return;
                }
            } else {
                // Cash on delivery scenario
                dispatch({ type: 'CART_CLEAR_ITEMS' });
                localStorage.removeItem('cartItems');
                navigate(`/order/${order._id}`);
            }
            setLoading(false);

        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    return (
        <div className="cart-page-container">
            <h1 className="cart-title">Order Summary</h1>

            <div className="cart-content-grid">
                <div className="cart-items-list">
                    <div className="cart-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <h2>Shipping</h2>
                        <p>
                            <strong>Address: </strong>
                            {cart.shippingAddress.street}, {cart.shippingAddress.city}, {cart.shippingAddress.state} {cart.shippingAddress.postalCode}
                        </p>
                    </div>

                    <div className="cart-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <h2>Payment Method</h2>
                        <p><strong>Method: </strong>{cart.paymentMethod}</p>
                    </div>

                    <div className="cart-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <h2>Order Items</h2>
                        {cart.cartItems.length === 0 ? (
                            <p>Your cart is empty.</p>
                        ) : (
                            <div style={{ width: '100%' }}>
                                {cart.cartItems.map((item, index) => (
                                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '10px 0' }}>
                                        <div>
                                            <img src={item.image} alt={item.name} style={{ width: '30px', marginRight: '10px', verticalAlign: 'middle' }} />
                                            <span style={{ fontWeight: 600 }}>{item.name}</span>
                                            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>SKU: {item.sku}</div>
                                        </div>
                                        <div>
                                            {item.quantity} x Rs. {item.pricePaid} = Rs. {(item.quantity * item.pricePaid).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="cart-summary-card">
                    <h2>Order Totals</h2>
                    {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
                    <div className="summary-row">
                        <span>Items</span>
                        <span>Rs. {cart.itemsPrice}</span>
                    </div>
                    <div className="summary-row">
                        <span>Shipping</span>
                        <span>Rs. {cart.shippingPrice}</span>
                    </div>
                    <div className="summary-row" style={{ fontSize: '0.9rem' }}>
                        <span>Estimated GST</span>
                        <span>Rs. {cart.taxPrice}</span>
                    </div>
                    <div className="summary-row total">
                        <span>Total</span>
                        <span>Rs. {cart.totalPrice}</span>
                    </div>

                    <button
                        type="button"
                        className="btn-checkout"
                        disabled={cart.cartItems.length === 0 || loading}
                        onClick={placeOrderHandler}
                    >
                        {loading ? 'Processing...' : 'Place Order & Pay'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrderPage;
