import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../Store';
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
        <div className="auth-container">
            <div className="auth-card">
                <h2>Payment Method</h2>
                <form onSubmit={submitHandler}>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="radio"
                            id="razorpay"
                            name="paymentMethod"
                            value="Razorpay"
                            checked={paymentMethod === 'Razorpay'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <label htmlFor="razorpay" style={{ margin: 0, cursor: 'pointer', fontSize: '1.1rem' }}>Razorpay (UPI, Credit/Debit Cards, NetBanking)</label>
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="radio"
                            id="cod"
                            name="paymentMethod"
                            value="Cash on Delivery"
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <label htmlFor="cod" style={{ margin: 0, cursor: 'pointer', fontSize: '1.1rem' }}>Cash on Delivery</label>
                    </div>
                    <button type="submit" className="auth-btn">
                        Review Order
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PaymentPage;
