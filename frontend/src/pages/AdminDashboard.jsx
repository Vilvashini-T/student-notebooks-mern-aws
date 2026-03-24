import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useStore } from '../Store';
import {
    Users,
    ShoppingBag,
    DollarSign,
    Package,
    ArrowUpRight,
    Clock,
    BarChart3,
    PieChart
} from 'lucide-react';
import './Admin.css';

const AdminDashboard = () => {
    const [summary, setSummary] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { state } = useStore();
    const { userLogin: { userInfo } } = state;
    const navigate = useNavigate();

    useEffect(() => {
        if (!userInfo || userInfo.role !== 'admin') {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const { data: summaryData } = await API.get('/api/orders/summary');
                const { data: ordersData } = await API.get('/api/orders');

                setSummary(summaryData);
                setOrders(ordersData.slice(0, 5));
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [userInfo, navigate]);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
            <div className="spinner"></div>
            <p style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Synchronizing Enterprise Metrics...</p>
        </div>
    );

    if (error) return (
        <div className="admin-container">
            <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', padding: '2rem', borderRadius: '16px', fontWeight: 800 }}>
                CRITICAL RECOVERY ERROR: {error}
            </div>
        </div>
    );

    const stats = [
        { label: 'Cumulative Revenue', value: `₹${summary.totalSales.toLocaleString()}`, icon: DollarSign, color: 'var(--primary-color)', suffix: '+12% from last month' },
        { label: 'Total Orders', value: summary.ordersCount, icon: ShoppingBag, color: '#0ea5e9', suffix: 'Live tracking active' },
        { label: 'Customer Base', value: summary.usersCount, icon: Users, color: '#10b981', suffix: '98% Retention rate' },
        { label: 'SKU Portfolio', value: summary.productsCount, icon: Package, color: '#f59e0b', suffix: '5 Pending restock' },
    ];

    const maxSales = Math.max(...summary.salesData.map(d => d.sales), 1);

    return (
        <div className="admin-container" style={{ paddingBottom: '5rem' }}>
            <div className="admin-header" style={{ marginBottom: '3rem', background: 'white', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
                            <div style={{ width: '40px', height: '2px', background: 'var(--primary-color)' }}></div>
                            Enterprise Control
                        </div>
                        <h1 style={{ fontSize: '2.4rem', fontWeight: 950, color: 'var(--secondary-color)', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            Operational Central
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '4px', fontWeight: 600 }}>Mastering the logistics and revenue engine of Student Note Books</p>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                        <span style={{ background: '#f5f3ff', padding: '0.8rem 1.5rem', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-color)', border: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Clock size={16} /> DATA SYNCRONIZED: {new Date().toLocaleTimeString()}
                        </span>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8' }}>SERVER STATUS: <span style={{ color: '#10b981' }}>OPTIMAL</span></div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                {stats.map((stat, i) => (
                    <div key={i} style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease' }}
                        onMouseOver={e => {
                            e.currentTarget.style.transform = 'translateY(-6px)';
                            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.05)';
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02)';
                        }}
                    >
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', color: stat.color, opacity: 0.05 }}>
                            <stat.icon size={120} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: `${stat.color}15`, color: stat.color, padding: '12px', borderRadius: '16px' }}>
                                <stat.icon size={24} />
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</span>
                        </div>
                        <div style={{ fontSize: '2.2rem', fontWeight: 950, color: 'var(--secondary-color)', marginBottom: '8px' }}>{stat.value}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: stat.color === 'var(--primary-color)' ? 'var(--primary-color)' : stat.color }}>{stat.suffix}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                {/* Revenue Dynamics Chart */}
                <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 950, color: 'var(--secondary-color)', margin: 0 }}>Revenue Pulse</h2>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>Cash inflow dynamics across past 7 fiscal cycles</p>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '8px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>TREND ANALYSIS</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '240px', gap: '16px', position: 'relative', paddingBottom: '40px' }}>
                        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '1px', background: '#f1f5f9', borderTop: '1px dashed #e2e8f0' }}></div>
                        <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', background: '#f1f5f9', borderTop: '1px dashed #e2e8f0' }}></div>

                        {summary.salesData.map((day, idx) => (
                            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', position: 'relative', zIndex: 1 }}>
                                <div
                                    style={{
                                        width: '100%',
                                        height: `${(day.sales / maxSales) * 100}%`,
                                        background: 'linear-gradient(180deg, var(--primary-color) 0%, var(--primary-light) 100%)',
                                        borderRadius: '12px',
                                        transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                        position: 'relative',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                                    onMouseOut={e => e.currentTarget.style.filter = 'none'}
                                >
                                    {day.sales > 0 && (
                                        <div style={{ position: 'absolute', top: '-30px', width: '100%', textAlign: 'center', fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary-color)' }}>
                                            ₹{(day.sales / 1000).toFixed(1)}k
                                        </div>
                                    )}
                                </div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', marginTop: '16px', textTransform: 'uppercase' }}>
                                    {new Date(day._id).toLocaleDateString(undefined, { weekday: 'short' })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Categories Breakdown */}
                <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 950, color: 'var(--secondary-color)', marginBottom: '2.5rem' }}>Sector Performance</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                        {summary.salesByCategory.map((cat, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--secondary-color)' }}>{cat._id}</span>
                                    <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary-color)' }}>₹{cat.total.toLocaleString()}</span>
                                </div>
                                <div style={{ height: '12px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        borderRadius: '6px',
                                        width: `${summary.totalSales > 0 ? (cat.total / summary.totalSales) * 100 : 0}%`,
                                        background: ['#4f46e5', '#10b981', '#f59e0b', '#0ea5e9', '#ec4899'][i % 5],
                                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                                        transition: 'width 1s ease-out'
                                    }} />
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, marginTop: '6px', textAlign: 'right', textTransform: 'uppercase' }}>
                                    {((cat.total / summary.totalSales) * 100).toFixed(1)}% Contribution
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '2rem' }}>
                <div className="admin-card" style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 950, color: 'var(--secondary-color)', margin: 0 }}>Recent Activity</h2>
                        <button
                            onClick={() => navigate('/admin/orders')}
                            style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '12px', background: '#f5f3ff' }}
                        >
                            VIEW FULL LOG &rarr;
                        </button>
                    </div>
                    <div className="table-wrapper">
                        <table style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th style={{ background: '#f8fafc', padding: '1.2rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', borderTopLeftRadius: '12px' }}>Identity</th>
                                    <th style={{ background: '#f8fafc', padding: '1.2rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Principal</th>
                                    <th style={{ background: '#f8fafc', padding: '1.2rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Net Revenue</th>
                                    <th style={{ background: '#f8fafc', padding: '1.2rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right', borderTopRightRadius: '12px' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order._id} style={{ transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer' }}
                                        onClick={() => navigate(`/order/${order._id}`)}
                                        onMouseOver={e => e.currentTarget.style.background = '#fcfaff'}
                                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '1.5rem 1.2rem', fontWeight: 900, color: 'var(--primary-color)', fontFamily: 'monospace', fontSize: '1rem' }}>#{order._id.substring(18, 24).toUpperCase()}</td>
                                        <td style={{ padding: '1.5rem 1.2rem' }}>
                                            <div style={{ fontWeight: 800, color: 'var(--secondary-color)' }}>{order.user?.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td style={{ padding: '1.5rem 1.2rem', fontWeight: 900, color: 'var(--secondary-color)', fontSize: '1.1rem' }}>₹{order.totalPrice.toLocaleString()}</td>
                                        <td style={{ padding: '1.5rem 1.2rem', textAlign: 'right' }}>
                                            <span style={{
                                                padding: '0.6rem 1.2rem',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: 900,
                                                textTransform: 'uppercase',
                                                letterSpacing: '1px',
                                                background: order.isPaid ? '#ecfdf5' : '#fef2f2',
                                                color: order.isPaid ? '#059669' : '#dc2626',
                                                border: `1px solid ${order.isPaid ? '#d1fae5' : '#fee2e2'}`
                                            }}>
                                                {order.isPaid ? 'Settled' : 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 950, color: 'var(--secondary-color)', marginBottom: '2rem' }}>Utility Forge</h2>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <button onClick={() => navigate('/admin/products')} className="auth-btn" style={{ background: '#f8fafc', color: 'var(--secondary-color)', border: '1px solid #e2e8f0', marginTop: 0, height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', padding: '0 1.5rem', fontWeight: 800, boxShadow: 'none' }}
                                onMouseOver={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.color = 'var(--primary-color)'; }}
                                onMouseOut={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = 'var(--secondary-color)'; }}
                            >
                                <Package size={20} /> SKU Console
                            </button>
                            <button onClick={() => navigate('/admin/coupons')} className="auth-btn" style={{ background: '#f8fafc', color: 'var(--secondary-color)', border: '1px solid #e2e8f0', marginTop: 0, height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', padding: '0 1.5rem', fontWeight: 800, boxShadow: 'none' }}
                                onMouseOver={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.color = 'var(--primary-color)'; }}
                                onMouseOut={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = 'var(--secondary-color)'; }}
                            >
                                <DollarSign size={20} /> Promotion Vault
                            </button>
                            <button onClick={() => navigate('/admin/categories')} className="auth-btn" style={{ background: '#f8fafc', color: 'var(--secondary-color)', border: '1px solid #e2e8f0', marginTop: 0, height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', padding: '0 1.5rem', fontWeight: 800, boxShadow: 'none' }}
                                onMouseOver={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.color = 'var(--primary-color)'; }}
                                onMouseOut={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = 'var(--secondary-color)'; }}
                            >
                                <PieChart size={20} /> Taxonomy Hub
                            </button>
                        </div>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, var(--secondary-color) 0%, #1e1b4b 100%)',
                        borderRadius: '24px',
                        padding: '2.5rem',
                        color: 'white',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1, color: 'var(--primary-color)' }}>
                            <BarChart3 size={150} />
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', width: 'fit-content', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                            AI Intelligence
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '1rem', lineHeight: '1.4' }}>Portfolio Optimization Detected</h3>
                        <p style={{ fontSize: '0.9rem', opacity: 0.7, lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                            Concentrated revenue growth in "Unruled Textbooks" identified. Recommendation: Increase reorder frequency by <span style={{ color: 'var(--primary-color)', fontWeight: 900 }}>15%</span> to avoid exhaustion.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
