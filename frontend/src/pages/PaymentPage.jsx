import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../Store';
import CheckoutSteps from '../components/CheckoutSteps';
import './AuthPages.css';

const PaymentPage = () => {
    const navigate = useNavigate();
    const { state, dispatch } = useStore();
    const { cart: { shippingAddress } } = state;

    useEffect(() => {
        if (!shippingAddress.street) {
            navigate('/shipping');
        }
    }, [shippingAddress, navigate]);

    const [paymentMethod, setPaymentMethod] = useState('Razorpay');

    const submitHandler = (e) => {
        e.preventDefault();
        dispatch({ type: 'CART_SAVE_PAYMENT_METHOD', payload: paymentMethod });
        localStorage.setItem('paymentMethod', JSON.stringify(paymentMethod));
        navigate('/placeorder');
    };

    return (
        <div className="admin-container">
            <CheckoutSteps step1 step2 step3 />
            <div className="auth-card" style={{ maxWidth: '500px', margin: '2rem auto' }}>
                <h2 style={{ marginBottom: '2rem' }}>Payment Method</h2>
                <form onSubmit={submitHandler}>
                    <div
                        className={`payment-option ${paymentMethod === 'Razorpay' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('Razorpay')}
                        style={{
                            border: paymentMethod === 'Razorpay' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            padding: '1.2rem',
                            marginBottom: '1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: paymentMethod === 'Razorpay' ? '#f5f3ff' : 'white'
                        }}
                    >
                        <input
                            type="radio"
                            id="razorpay"
                            name="paymentMethod"
                            value="Razorpay"
                            checked={paymentMethod === 'Razorpay'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            style={{ width: '20px', height: '20px', accentColor: 'var(--primary-color)' }}
                        />
                        <label htmlFor="razorpay" style={{ margin: 0, cursor: 'pointer', fontSize: '1rem', fontWeight: 600 }}>
                            Razorpay
                            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>UPI, Cards, NetBanking</span>
                        </label>
                    </div>

                    <div
                        className={`payment-option ${paymentMethod === 'Cash on Delivery' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('Cash on Delivery')}
                        style={{
                            border: paymentMethod === 'Cash on Delivery' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            padding: '1.2rem',
                            marginBottom: '2rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: paymentMethod === 'Cash on Delivery' ? '#f5f3ff' : 'white'
                        }}
                    >
                        <input
                            type="radio"
                            id="cod"
                            name="paymentMethod"
                            value="Cash on Delivery"
                            checked={paymentMethod === 'Cash on Delivery'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            style={{ width: '20px', height: '20px', accentColor: 'var(--primary-color)' }}
                        />
                        <label htmlFor="cod" style={{ margin: 0, cursor: 'pointer', fontSize: '1rem', fontWeight: 600 }}>
                            Cash on Delivery
                            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>Pay when you receive the order</span>
                        </label>
                    </div>

                    <button type="submit" className="auth-btn" style={{ background: 'var(--primary-color)', padding: '1rem' }}>
                        Review Order Summary
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PaymentPage;
