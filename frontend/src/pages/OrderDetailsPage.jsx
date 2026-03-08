import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../Store';
import { CheckCircle, Package, Truck, Home, ShoppingCart, Clock } from 'lucide-react';
import './CartPage.css';
import './OrderDetailsPage.css';

const OrderDetailsPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);

    const { state: { userLogin: { userInfo } } } = useStore();

    const statusSteps = [
        { label: 'Confirmed', status: 'Pending', icon: Clock },
        { label: 'Processing', status: 'Processing', icon: ShoppingCart },
        { label: 'Packed', status: 'Packed', icon: Package },
        { label: 'Shipped', status: 'Shipped', icon: Truck },
        { label: 'Delivered', status: 'Delivered', icon: Home }
    ];

    const getStatusIndex = (status) => {
        const index = statusSteps.findIndex(s => s.status === status);
        return index === -1 ? 0 : index;
    };

    const fetchOrder = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`http://localhost:5000/api/orders/${id}`, config);
            setOrder(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id, userInfo.token]);

    const updateStatusHandler = async (newStatus) => {
        setUpdating(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            await axios.put(`http://localhost:5000/api/orders/${id}/status`, { status: newStatus }, config);
            await fetchOrder();
            setUpdating(false);
        } catch (err) {
            alert(err.response?.data?.message || err.message);
            setUpdating(false);
        }
    };

    if (loading) return <div style={{ padding: '8rem', textAlign: 'center' }}>Loading Order...</div>;
    if (error) return <div style={{ padding: '8rem', textAlign: 'center', color: 'red' }}>{error}</div>;

    const isAdmin = userInfo && userInfo.role === 'admin';

    return (
        <div className="cart-page-container">
            <h1 className="cart-title" style={{ marginBottom: '1rem' }}>Order {order._id.substring(18, 24).toUpperCase()}</h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Placed on {new Date(order.createdAt).toLocaleDateString()}</p>

            {/* Premium Flipkart-style Stepper */}
            <div className="order-tracking-container">
                <div className="stepper-wrapper">
                    <div className="stepper-line"></div>
                    <div
                        className="stepper-line-active"
                        style={{ width: `${(getStatusIndex(order.orderStatus) / (statusSteps.length - 1)) * 90}%` }}
                    ></div>

                    {statusSteps.map((step, index) => {
                        const isCompleted = getStatusIndex(order.orderStatus) > index;
                        const isActive = getStatusIndex(order.orderStatus) === index;
                        const StepIcon = step.icon;

                        return (
                            <div key={index} className={`step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                                <div className="step-icon-box">
                                    {isCompleted ? <CheckCircle size={24} /> : <StepIcon size={24} />}
                                </div>
                                <div className="step-label">{step.label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="cart-content-grid">
                {/* Left Side: Order Information */}
                <div className="cart-items-list">
                    <div className="cart-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <h2 style={{ marginBottom: '1.5rem', color: 'var(--secondary-color)' }}>Shipping Details</h2>
                        <div style={{ lineHeight: '1.8' }}>
                            <p><strong>Name:</strong> {order.user?.name}</p>
                            <p><strong>Email:</strong> <a href={`mailto:${order.user?.email}`} style={{ color: 'var(--primary-color)' }}>{order.user?.email}</a></p>
                            <p><strong>Address:</strong> {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
                        </div>
                        <div style={{ marginTop: '1.5rem', width: '100%', padding: '1rem', background: order.isDelivered ? 'var(--bg-light)' : '#fff5f5', borderRadius: '8px', color: order.isDelivered ? 'var(--primary-color)' : '#e53e3e', fontWeight: 700, border: `1px solid ${order.isDelivered ? 'var(--primary-color)' : '#feb2b2'}` }}>
                            {order.isDelivered ? `Delivered on ${new Date(order.deliveredAt).toLocaleString()}` : 'Package is in transit / pending delivery'}
                        </div>
                    </div>

                    <div className="cart-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <h2 style={{ marginBottom: '1.5rem', color: 'var(--secondary-color)' }}>Payment Information</h2>
                        <p><strong>Method:</strong> {order.paymentMethod}</p>
                        <div style={{ marginTop: '1.5rem', width: '100%', padding: '1rem', background: order.isPaid ? 'var(--accent-color)' : '#fff5f5', borderRadius: '8px', color: order.isPaid ? 'white' : '#e53e3e', fontWeight: 700 }}>
                            {order.isPaid ? `Payment Successful on ${new Date(order.paidAt).toLocaleString()}` : 'Awaiting Payment Confirmation'}
                        </div>
                    </div>

                    <div className="cart-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <h2 style={{ marginBottom: '1.5rem', color: 'var(--secondary-color)' }}>Order Items</h2>
                        <div style={{ width: '100%' }}>
                            {order.orderItems.map((item, index) => (
                                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{item.name}</div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>SKU: {item.sku}</div>
                                    </div>
                                    <div style={{ fontWeight: 600 }}>
                                        {item.quantity} x Rs.{item.pricePaid} = <span style={{ color: 'var(--primary-color)' }}>Rs.{(item.quantity * item.pricePaid).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Summary & Actions */}
                <div className="cart-summary-card" style={{ top: '100px' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Price Details</h2>
                    <div className="summary-row">
                        <span>Price ({order.orderItems.length} items)</span>
                        <span>Rs. {order.itemsPrice.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                        <span>Delivery Charges</span>
                        <span style={{ color: order.shippingPrice === 0 ? 'var(--accent-color)' : 'inherit' }}>
                            {order.shippingPrice === 0 ? 'FREE' : `Rs. ${order.shippingPrice.toFixed(2)}`}
                        </span>
                    </div>
                    <div className="summary-row">
                        <span>GST (Estimated)</span>
                        <span>Rs. {order.taxPrice.toFixed(2)}</span>
                    </div>
                    <div className="summary-row total">
                        <span>Total Amount</span>
                        <span style={{ color: 'var(--primary-color)' }}>Rs. {order.totalPrice.toFixed(2)}</span>
                    </div>

                    {/* Admin Management Block */}
                    {isAdmin && !order.isDelivered && (
                        <div style={{ marginTop: '2.5rem', borderTop: '2px dashed var(--border-color)', paddingTop: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Controls</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {order.orderStatus === 'Pending' && (
                                    <button className="btn-checkout" style={{ background: 'var(--primary-color)' }} onClick={() => updateStatusHandler('Processing')} disabled={updating}>
                                        Confirm & Process Order
                                    </button>
                                )}
                                {order.orderStatus === 'Processing' && (
                                    <button className="btn-checkout" style={{ background: '#8b5cf6' }} onClick={() => updateStatusHandler('Packed')} disabled={updating}>
                                        Mark as Packed
                                    </button>
                                )}
                                {order.orderStatus === 'Packed' && (
                                    <button className="btn-checkout" style={{ background: '#f59e0b' }} onClick={() => updateStatusHandler('Shipped')} disabled={updating}>
                                        Mark as Shipped
                                    </button>
                                )}
                                {order.orderStatus === 'Shipped' && (
                                    <button className="btn-checkout" style={{ background: 'var(--accent-color)' }} onClick={() => updateStatusHandler('Delivered')} disabled={updating}>
                                        Mark as Delivered
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;
