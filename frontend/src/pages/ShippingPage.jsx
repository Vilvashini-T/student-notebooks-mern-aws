import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../Store';
import CheckoutSteps from '../components/CheckoutSteps';
import API from '../api';
import toast from 'react-hot-toast';
import './AuthPages.css';

const ShippingPage = () => {
    const { state, dispatch } = useStore();
    const { userLogin: { userInfo }, cart: { shippingAddress } } = state;
    const navigate = useNavigate();

    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showNewForm, setShowNewForm] = useState(false);

    // New Address Form State
    const [label, setLabel] = useState('Home');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [stateName, setStateName] = useState('');

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userInfo) {
            navigate('/login?redirect=shipping');
            return;
        }

        const fetchAddresses = async () => {
            try {
                const { data } = await API.get('/api/users/profile');
                setSavedAddresses(data.addresses || []);

                // Set default selection if exists in memory
                if (data.addresses && data.addresses.length > 0) {
                    if (shippingAddress && shippingAddress.street) {
                        const matched = data.addresses.find(a => a.street === shippingAddress.street);
                        if (matched) setSelectedAddressId(matched._id);
                        else setSelectedAddressId(data.addresses[0]._id);
                    } else {
                        setSelectedAddressId(data.addresses[0]._id);
                    }
                } else {
                    setShowNewForm(true); // Force form if no addresses
                }
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch addresses', error);
                setLoading(false);
            }
        };

        fetchAddresses();
    }, [userInfo, navigate, shippingAddress]);

    const submitNewAddressHandler = async (e) => {
        e.preventDefault();
        try {
            const newAddress = { label, street, city, postalCode, state: stateName };
            const { data } = await API.post('/api/users/profile/address', newAddress);

            setSavedAddresses(data);
            const added = data[data.length - 1]; // Last added
            setSelectedAddressId(added._id);
            setShowNewForm(false);
            toast.success('Address saved!');

            // clear form
            setStreet(''); setCity(''); setPostalCode(''); setStateName('');
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    };

    const continueCheckoutHandler = () => {
        let chosen;
        if (savedAddresses.length > 0 && selectedAddressId && !showNewForm) {
            chosen = savedAddresses.find(a => a._id === selectedAddressId);
        } else {
            // Unlikely to hit unless user forces continue on blank form
            chosen = { street, city, postalCode, state: stateName };
        }

        if (!chosen || !chosen.street) {
            toast.error('Please select or add a valid shipping address.');
            return;
        }

        const addressData = {
            street: chosen.street,
            city: chosen.city,
            postalCode: chosen.postalCode,
            state: chosen.state
        };

        dispatch({ type: 'CART_SAVE_SHIPPING_ADDRESS', payload: addressData });
        localStorage.setItem('shippingAddress', JSON.stringify(addressData));
        navigate('/payment');
    };

    if (loading) return <div>Loading Address Book...</div>;

    return (
        <div className="admin-container">
            <CheckoutSteps step1 step2 />

            <div className="store-layout" style={{ marginTop: '2rem' }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        Choose Delivery Address
                    </h2>

                    {savedAddresses.length > 0 && !showNewForm && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                            {savedAddresses.map(addr => (
                                <div
                                    key={addr._id}
                                    onClick={() => setSelectedAddressId(addr._id)}
                                    className={`address-card ${selectedAddressId === addr._id ? 'active' : ''}`}
                                    style={{
                                        border: selectedAddressId === addr._id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: '1.5rem',
                                        cursor: 'pointer',
                                        backgroundColor: selectedAddressId === addr._id ? '#f5f3ff' : 'white',
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '1rem', color: 'var(--secondary-color)' }}>{addr.label || 'Home'}</span>
                                        {selectedAddressId === addr._id && <span style={{ color: 'var(--primary-color)', fontSize: '0.8rem' }}>✓ DELIVERING HERE</span>}
                                    </div>
                                    <div style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                        {addr.street}<br />
                                        {addr.city}, {addr.state} {addr.postalCode}
                                    </div>
                                </div>
                            ))}

                            <div
                                onClick={() => setShowNewForm(true)}
                                style={{
                                    border: '2px dashed var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '1.5rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--primary-color)',
                                    fontWeight: 600,
                                    gap: '0.5rem',
                                    minHeight: '120px'
                                }}
                            >
                                <Plus size={24} /> Add New Address
                            </div>
                        </div>
                    )}

                    {(showNewForm || savedAddresses.length === 0) && (
                        <div className="auth-card" style={{ maxWidth: '600px', margin: '0 0 2rem 0' }}>
                            <h3>Add a New Address</h3>
                            <form onSubmit={submitNewAddressHandler}>
                                <div className="form-group">
                                    <label>Label</label>
                                    <select value={label} onChange={(e) => setLabel(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                                        <option value="Home">Home</option>
                                        <option value="Work">Work</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Full Address</label>
                                    <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} required placeholder="House No, Building Name, Street" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label>City</label>
                                        <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required />
                                    </div>
                                    <div className="form-group">
                                        <label>State</label>
                                        <input type="text" value={stateName} onChange={(e) => setStateName(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>PIN Code</label>
                                    <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="submit" className="auth-btn">Save This Address</button>
                                    {savedAddresses.length > 0 && (
                                        <button type="button" onClick={() => setShowNewForm(false)} className="nav-link" style={{ flex: 1, border: '1px solid #ddd', borderRadius: '4px' }}>Back to Saved</button>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                <div style={{ width: '380px' }}>
                    <div style={{ position: 'sticky', top: '100px', background: 'white', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Delivery Selection</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                            Your items will be delivered to the selected address. You can change this later in your profile.
                        </p>
                        <button
                            type="button"
                            onClick={continueCheckoutHandler}
                            className="auth-btn"
                            style={{ background: 'var(--primary-color)', fontSize: '1.1rem', padding: '1rem' }}
                            disabled={showNewForm && savedAddresses.length === 0}
                        >
                            Proceed to Payment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingPage;
