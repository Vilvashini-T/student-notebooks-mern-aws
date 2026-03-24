import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import { useStore } from '../Store';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import './Admin.css';

const OrderListPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { state } = useStore();
    const { userLogin: { userInfo } } = state;
    const navigate = useNavigate();

    useEffect(() => {
        if (!userInfo || (userInfo.role !== 'admin' && userInfo.role !== 'shopkeeper')) {
            navigate('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                const { data } = await API.get('/api/orders');
                setOrders(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        fetchOrders();
    }, [userInfo, navigate]);

    const getStatusStyles = (status) => {
        switch (status.toLowerCase()) {
            case 'delivered': return { bg: '#ecfdf5', text: '#059669', border: '#d1fae5' };
            case 'dispatched': return { bg: '#eff6ff', text: '#2563eb', border: '#dbeafe' };
            case 'processing': return { bg: '#fff7ed', text: '#d97706', border: '#ffedd5' };
            default: return { bg: '#f9fafb', text: '#4b5563', border: '#f3f4f6' };
        }
    };

    return (
        <div className="admin-container" style={{ paddingBottom: '5rem' }}>
            <div className="admin-header" style={{ marginBottom: '3rem', background: 'white', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
                            <div style={{ width: '40px', height: '2px', background: 'var(--primary-color)' }}></div>
                            Fulfillment Center
                        </div>
                        <h1 style={{ fontSize: '2.4rem', fontWeight: 950, color: 'var(--secondary-color)', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            Registry Ledger
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '4px', fontWeight: 600 }}>Real-time synchronization of customer acquisitions and logistics</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '1rem 1.5rem', borderRadius: '16px', border: '1.5px solid #e2e8f0' }}>
                        <div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.1)' }}></div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Authorized: {userInfo.role}</span>
                    </div>
                </div>
            </div>

            <div className="table-wrapper" style={{ background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="spinner"></div>
                        <p style={{ color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Acquiring Order Data...</p>
                    </div>
                ) : error ? (
                    <div style={{ padding: '3rem', background: '#fef2f2', color: '#dc2626', margin: '2.5rem', borderRadius: '20px', textAlign: 'center', fontWeight: 800, border: '1.5px solid #fee2e2' }}>
                        {error}
                    </div>
                ) : (
                    <table style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th style={{ background: '#f8fafc', padding: '1.2rem 2rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid #f1f5f9' }}>Trace ID</th>
                                <th style={{ background: '#f8fafc', padding: '1.2rem 2rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid #f1f5f9' }}>Acquisition</th>
                                <th style={{ background: '#f8fafc', padding: '1.2rem 2rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid #f1f5f9' }}>Timestamp</th>
                                <th style={{ background: '#f8fafc', padding: '1.2rem 2rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid #f1f5f9' }}>Revenue</th>
                                <th style={{ background: '#f8fafc', padding: '1.2rem 2rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid #f1f5f9' }}>Settlement</th>
                                <th style={{ background: '#f8fafc', padding: '1.2rem 2rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid #f1f5f9' }}>Operations</th>
                                <th style={{ background: '#f8fafc', padding: '1.2rem 2rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => {
                                const status = getStatusStyles(order.orderStatus);
                                return (
                                    <tr key={order._id}
                                        style={{ borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s' }}
                                        onMouseOver={e => e.currentTarget.style.background = '#fcfaff'}
                                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '2rem' }}>
                                            <div style={{ fontFamily: 'monospace', fontWeight: 950, fontSize: '1.1rem', color: 'var(--primary-color)', letterSpacing: '1px', background: '#f5f3ff', padding: '6px 12px', borderRadius: '10px', display: 'inline-block' }}>
                                                #{order._id.substring(18, 24).toUpperCase()}
                                            </div>
                                        </td>
                                        <td style={{ padding: '2rem' }}>
                                            <div style={{ fontWeight: 950, color: 'var(--secondary-color)', fontSize: '1rem', letterSpacing: '-0.2px' }}>{order.user?.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>{order.user?.email}</div>
                                        </td>
                                        <td style={{ padding: '2rem' }}>
                                            <div style={{ color: 'var(--secondary-color)', fontWeight: 800, fontSize: '0.95rem' }}>
                                                {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, marginTop: '4px' }}>REGISTERED</div>
                                        </td>
                                        <td style={{ padding: '2rem' }}>
                                            <div style={{ fontWeight: 950, color: 'var(--secondary-color)', fontSize: '1.1rem' }}>₹{order.totalPrice.toLocaleString()}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 800, marginTop: '4px' }}>GROSS VALUE</div>
                                        </td>
                                        <td style={{ padding: '2rem' }}>
                                            <span style={{
                                                padding: '6px 14px',
                                                borderRadius: '12px',
                                                fontSize: '0.7rem',
                                                fontWeight: 900,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                background: order.isPaid ? '#ecfdf5' : '#fff1f2',
                                                color: order.isPaid ? '#059669' : '#e11d48',
                                                border: `1.5px solid ${order.isPaid ? '#d1fae5' : '#fee2e2'}`
                                            }}>
                                                {order.isPaid ? 'Settled' : 'Unpaid'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '2rem' }}>
                                            <span style={{
                                                padding: '6px 14px',
                                                borderRadius: '12px',
                                                fontSize: '0.7rem',
                                                fontWeight: 900,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                background: status.bg,
                                                color: status.text,
                                                border: `1.5px solid ${status.border}`
                                            }}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td style={{ padding: '2rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                <Link
                                                    to={`/order/${order._id}`}
                                                    style={{ height: '42px', padding: '0 20px', background: 'white', color: 'var(--secondary-color)', borderRadius: '12px', textDecoration: 'none', fontWeight: 900, fontSize: '0.85rem', border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
                                                    onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.color = 'var(--primary-color)'; }}
                                                    onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = 'var(--secondary-color)'; }}
                                                >
                                                    Inspect
                                                </Link>
                                                {order.isPaid && (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const { data } = await API.get(`/api/orders/${order._id}/invoice`, { responseType: 'blob' });
                                                                const url = window.URL.createObjectURL(new Blob([data]));
                                                                const link = document.createElement('a');
                                                                link.href = url;
                                                                link.setAttribute('download', `invoice_${order._id}.pdf`);
                                                                document.body.appendChild(link);
                                                                link.click();
                                                                toast.success('Generating secure invoice...');
                                                            } catch (err) {
                                                                toast.error('Invoice system offline');
                                                            }
                                                        }}
                                                        style={{ width: '42px', height: '42px', background: '#f8fafc', color: '#10b981', border: '1.5px solid #d1fae5', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                                        title="Export Financial Evidence"
                                                        onMouseOver={e => e.currentTarget.style.background = '#ecfdf5'}
                                                        onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}
                                                    >
                                                        <Download size={20} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default OrderListPage;
