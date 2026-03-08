import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../Store';
import './AuthPages.css';

const ShippingPage = () => {
    const { state, dispatch } = useStore();
    const { userLogin: { userInfo }, cart: { shippingAddress } } = state;
    const navigate = useNavigate();

    useEffect(() => {
        if (!userInfo) {
            navigate('/login?redirect=shipping');
        }
    }, [userInfo, navigate]);

    const [street, setStreet] = useState(shippingAddress.street || '');
    const [city, setCity] = useState(shippingAddress.city || '');
    const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
    const [stateName, setStateName] = useState(shippingAddress.state || '');

    const submitHandler = (e) => {
        e.preventDefault();
        const addressData = { street, city, postalCode, state: stateName };
        dispatch({ type: 'CART_SAVE_SHIPPING_ADDRESS', payload: addressData });
        localStorage.setItem('shippingAddress', JSON.stringify(addressData));
        navigate('/payment');
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Shipping Address</h2>
                <form onSubmit={submitHandler}>
                    <div className="form-group">
                        <label htmlFor="street">Street Address</label>
                        <input type="text" id="street" value={street} onChange={(e) => setStreet(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="city">City</label>
                        <input type="text" id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="stateName">State</label>
                        <input type="text" id="stateName" value={stateName} onChange={(e) => setStateName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="postalCode">Postal Code / PIN</label>
                        <input type="text" id="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
                    </div>
                    <button type="submit" className="auth-btn">
                        Continue to Payment
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ShippingPage;
