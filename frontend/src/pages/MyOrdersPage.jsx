import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import { useStore } from '../Store';
import { Package } from 'lucide-react';

const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { state: { userLogin: { userInfo } } } = useStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!userInfo) {
            navigate('/login?redirect=myorders');
            return;
        }

        const fetchMyOrders = async () => {
            try {
                const { data } = await API.get('/api/orders/myorders');
                setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        fetchMyOrders();
    }, [userInfo, navigate]);

    return (
        <div className="admin-container" style={{ maxWidth: '1100px', padding: '3rem 2rem' }}>
            <div className="admin-header" style={{ marginBottom: '3rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '2rem' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '2.2rem', fontWeight: 900, color: 'var(--secondary-color)' }}>
                        <div style={{ background: '#f5f3ff', color: 'var(--primary-color)', padding: '10px', borderRadius: '12px' }}>
                            <Package size={32} />
                        </div>
                        Purchase History
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '8px', fontWeight: 600 }}>Track, manage and review your legacy with Student Note Books</p>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    <div className="spinner" style={{ marginBottom: '1rem' }}></div>
                    Fetching your order history...
                </div>
            ) : error ? (
                <div style={{ color: '#dc2626', padding: '2rem', background: '#fef2f2', borderRadius: '16px', border: '1px solid #fee2e2', textAlign: 'center', fontWeight: 700 }}>
                    {error}
                </div>
            ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <div style={{ background: '#f8fafc', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                        <Package size={48} style={{ color: '#cbd5e1' }} />
                    </div>
                    <h2 style={{ color: 'var(--secondary-color)', fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem' }}>No orders recorded</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '450px', margin: '0 auto 2.5rem', fontSize: '1.1rem', lineHeight: '1.6', fontWeight: 500 }}>
                        It looks like you haven't started your collection yet. Our premium stationery is waiting for your first masterpiece.
                    </p>
                    <Link to="/" className="auth-btn" style={{ width: 'auto', display: 'inline-block', padding: '1rem 3.5rem', fontSize: '1rem', borderRadius: '14px', background: 'var(--primary-color)', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)' }}>
                        Explore the Catalog
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {orders.map(order => (
                        <div key={order._id} style={{
                            border: '1px solid #f1f5f9',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            background: 'white',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
                        }}
                            onMouseOver={e => {
                                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.05)';
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.borderColor = '#ddd6fe';
                            }}
                            onMouseOut={e => {
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = '#f1f5f9';
                            }}
                            onClick={() => navigate(`/order/${order._id}`)}
                        >
                            <div style={{ background: '#f8fafc', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                                    <div>
                                        <div style={{ color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 800, fontSize: '0.7rem', letterSpacing: '1px' }}>Date Placed</div>
                                        <div style={{ fontWeight: 800, color: 'var(--secondary-color)', fontSize: '1rem' }}>
                                            {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 800, fontSize: '0.7rem', letterSpacing: '1px' }}>Total Net Worth</div>
                                        <div style={{ fontWeight: 900, color: 'var(--primary-color)', fontSize: '1.1rem' }}>₹{order.totalPrice.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div style={{ color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 800, fontSize: '0.7rem', letterSpacing: '1px' }}>Recipient</div>
                                        <div style={{ fontWeight: 800, color: 'var(--secondary-color)', fontSize: '1rem' }}>{userInfo.name.split(' ')[0]}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', minWidth: '150px' }}>
                                    <div style={{ color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 800, fontSize: '0.7rem', letterSpacing: '1px' }}>Reference: <span style={{ fontFamily: 'monospace', color: 'var(--secondary-color)' }}>#{order._id.substring(18, 24).toUpperCase()}</span></div>
                                    <span style={{ color: 'var(--primary-color)', fontWeight: 900, textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                        Full Details &rarr;
                                    </span>
                                </div>
                            </div>

                            <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
                                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                    <div style={{ background: '#f5f3ff', width: '60px', height: '60px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                                        <Package size={28} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--secondary-color)', margin: 0 }}>
                                            {order.orderItems.length} {order.orderItems.length === 1 ? 'Premium Item' : 'Collection Items'}
                                        </h3>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600, maxWidth: '600px', display: '-webkit-box', WebkitLineClamp: '1', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {order.orderItems.map(item => item.name).join(' • ')}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '0.6rem 1.5rem',
                                        borderRadius: '12px',
                                        fontWeight: 900,
                                        fontSize: '0.8rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        background: order.isDelivered ? '#ecfdf5' : order.orderStatus === 'Shipped' ? '#fff7ed' : '#f8fafc',
                                        color: order.isDelivered ? '#059669' : order.orderStatus === 'Shipped' ? '#d97706' : '#64748b',
                                        border: `1px solid ${order.isDelivered ? '#d1fae5' : order.orderStatus === 'Shipped' ? '#ffedd5' : '#e2e8f0'}`,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                    }}>
                                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'currentColor', boxShadow: '0 0 8px currentColor' }}></span>
                                        {order.isDelivered ? 'Delivered' : order.orderStatus}
                                    </span>
                                    {order.isPaid ? (
                                        <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div>
                                            Settled & Invoiced
                                        </span>
                                    ) : (
                                        <span style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }}></div>
                                            Payment Outstanding
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrdersPage;
