import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api';
import { useStore } from '../Store';
import { CheckCircle, Package, Truck, Home, ShoppingCart, Clock, Download } from 'lucide-react';
import './CartPage.css';
import './OrderDetailsPage.css';

const OrderDetailsPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);

    // Return Request States
    const [showReturnForm, setShowReturnForm] = useState(false);
    const [returnType, setReturnType] = useState('return');
    const [returnReason, setReturnReason] = useState('Damaged Product');
    const [returnDescription, setReturnDescription] = useState('');
    const [returnStatusMsg, setReturnStatusMsg] = useState('');

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
            const { data } = await API.get(`/api/orders/${id}`);
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
            await API.put(`/api/orders/${id}/status`, { status: newStatus });
            await fetchOrder();
            setUpdating(false);
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
            setUpdating(false);
        }
    };

    const downloadInvoiceHandler = async () => {
        try {
            const { data } = await API.get(`/api/orders/${id}/invoice`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${id.substring(18, 24).toUpperCase()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            toast.error('Invoice generation failed or unavailable');
        }
    };

    const cancelOrderHandler = async () => {
        if (!window.confirm('Void this transaction and restore inventory?')) return;
        setUpdating(true);
        try {
            await API.put(`/api/orders/${id}/cancel`, {});
            await fetchOrder();
            setUpdating(false);
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
            setUpdating(false);
        }
    };

    const retryPaymentHandler = async () => {
        setUpdating(true);
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const scriptLoaded = await new Promise((resolve) => {
                if (window.Razorpay) return resolve(true);
                const s = document.createElement('script');
                s.src = 'https://checkout.razorpay.com/v1/checkout.js';
                s.onload = () => resolve(true);
                s.onerror = () => resolve(false);
                document.body.appendChild(s);
            });

            if (!scriptLoaded) {
                toast.error('Payment gateway infrastructure offline');
                setUpdating(false);
                return;
            }

            const { data } = await API.post(`/api/orders/${id}/retry-payment`, {});
            const options = {
                key: data.key,
                amount: data.amount,
                currency: data.currency,
                name: 'Student Note Books',
                description: `Settlement Order #${id.slice(-6).toUpperCase()}`,
                order_id: data.razorpayOrderId,
                handler: async function (response) {
                    try {
                        await API.put(`/api/orders/${id}/pay`, {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            paymentMethod: 'Razorpay'
                        }, config);
                        await fetchOrder();
                        toast.success('Funds synchronized successfully');
                    } catch (payErr) {
                        toast.error('Payment reconciliation failed');
                    }
                },
                prefill: { name: userInfo.name, email: userInfo.email },
                theme: { color: '#4f46e5' }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
        setUpdating(false);
    };

    const submitReturnHandler = async (e) => {
        e.preventDefault();
        setReturnStatusMsg('');
        setUpdating(true);
        try {
            await API.post('/api/returns', {
                orderId: id,
                type: returnType,
                reason: returnReason,
                description: returnDescription
            });
            setReturnStatusMsg('✅ Request submitted successfully!');
            setShowReturnForm(false);
            toast.success('Dispute ticket opened');
        } catch (err) {
            setReturnStatusMsg('❌ ' + (err.response?.data?.message || err.message));
        }
        setUpdating(false);
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
            <div className="spinner"></div>
            <p style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Retrieving Transaction Records...</p>
        </div>
    );

    if (error) return (
        <div style={{ padding: '8rem', textAlign: 'center' }}>
            <div style={{ color: '#ef4444', fontSize: '1.2rem', fontWeight: 800 }}>FATAL ERROR: {error}</div>
            <Link to="/admin/orders" style={{ marginTop: '1.5rem', display: 'inline-block', color: 'var(--primary-color)', fontWeight: 700 }}>Return to Safety</Link>
        </div>
    );

    const isAdmin = userInfo && userInfo.role === 'admin';

    return (
        <div className="admin-container" style={{ paddingBottom: '5rem' }}>
            <div className="admin-header" style={{ marginBottom: '2.5rem', background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                            <Link to={isAdmin ? "/admin/orders" : "/myorders"} style={{ textDecoration: 'none', color: 'var(--primary-color)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                &larr; Back to History
                            </Link>
                            <span style={{ color: '#cbd5e1' }}>|</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Manifest #{order._id.substring(18, 24).toUpperCase()}</span>
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--secondary-color)', marginBottom: '0.5rem' }}>Transaction Overview</h1>
                        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Recorded on {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {order.isPaid && (
                            <button
                                onClick={downloadInvoiceHandler}
                                className="auth-btn"
                                style={{ width: 'auto', background: 'white', border: '1px solid #e2e8f0', color: 'var(--secondary-color)', padding: '0.8rem 1.5rem', fontWeight: 800, borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <Download size={18} /> Download Invoice
                            </button>
                        )}
                        {isAdmin && order.orderStatus === 'Pending' && (
                            <button
                                onClick={cancelOrderHandler}
                                className="auth-btn"
                                style={{ width: 'auto', background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', padding: '0.8rem 1.5rem', fontWeight: 800, borderRadius: '12px' }}
                            >
                                Void Order
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Premium Stepper */}
            <div style={{ background: 'white', padding: '3.5rem 2.5rem', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '2.5rem' }}>
                <div className="stepper-wrapper" style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', maxWidth: '900px', margin: '0 auto' }}>
                    <div className="stepper-line" style={{ height: '4px', background: '#f1f5f9', position: 'absolute', top: '22px', left: '0', right: '0', zIndex: 0, borderRadius: '2px' }}></div>
                    <div
                        className="stepper-line-active"
                        style={{ height: '4px', background: 'var(--primary-color)', position: 'absolute', top: '22px', left: '0', zIndex: 1, borderRadius: '2px', transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)', width: `${(getStatusIndex(order.orderStatus) / (statusSteps.length - 1)) * 100}%`, boxShadow: '0 0 10px rgba(79, 70, 229, 0.4)' }}
                    ></div>

                    {statusSteps.map((step, index) => {
                        const statusIdx = getStatusIndex(order.orderStatus);
                        const isCompleted = statusIdx > index || order.orderStatus === step.status;
                        const isActive = statusIdx === index;
                        const StepIcon = step.icon;

                        return (
                            <div key={index} style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: isCompleted ? 'var(--primary-color)' : 'white',
                                    color: isCompleted ? 'white' : '#94a3b8',
                                    border: isCompleted ? 'none' : '2px solid #e2e8f0',
                                    boxShadow: isCompleted ? '0 10px 15px -3px rgba(79, 70, 229, 0.3)' : 'none',
                                    transition: 'all 0.3s ease'
                                }}>
                                    {isCompleted ? <CheckCircle size={24} /> : <StepIcon size={24} />}
                                </div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isActive ? 'var(--primary-color)' : isCompleted ? 'var(--secondary-color)' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                                    {step.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '2.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    {/* Items Card */}
                    <div className="admin-card" style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--secondary-color)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ width: '12px', height: '12px', background: 'var(--primary-color)', borderRadius: '3px' }}></span>
                            Inventory Summary
                        </h2>
                        <div className="table-wrapper">
                            <table style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th style={{ background: '#f8fafc', padding: '1.2rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', borderTopLeftRadius: '12px' }}>Product Detail</th>
                                        <th style={{ background: '#f8fafc', padding: '1.2rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>SKU</th>
                                        <th style={{ background: '#f8fafc', padding: '1.2rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Qty</th>
                                        <th style={{ background: '#f8fafc', padding: '1.2rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right', borderTopRightRadius: '12px' }}>Net Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.orderItems.map((item, index) => (
                                        <tr key={index}>
                                            <td style={{ padding: '1.5rem 1.2rem' }}>
                                                <Link to={`/product/${item.product}`} style={{ fontWeight: 800, color: 'var(--secondary-color)', textDecoration: 'none', fontSize: '1rem', display: 'block' }}>{item.name}</Link>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 700 }}>VERIFIED QUALITY</span>
                                            </td>
                                            <td style={{ padding: '1.5rem 1.2rem' }}>
                                                <code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>{item.sku}</code>
                                            </td>
                                            <td style={{ padding: '1.5rem 1.2rem', fontWeight: 800, color: 'var(--secondary-color)' }}>&times; {item.quantity}</td>
                                            <td style={{ padding: '1.5rem 1.2rem', textAlign: 'right', fontWeight: 900, color: 'var(--primary-color)', fontSize: '1.1rem' }}>₹{(item.quantity * item.pricePaid).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {order.isDelivered && (
                            <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                {!showReturnForm ? (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <p style={{ margin: 0, color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>Experience issues with this package?</p>
                                        <button
                                            onClick={() => setShowReturnForm(true)}
                                            style={{ background: 'white', border: '1px solid #e2e8f0', color: 'var(--primary-color)', fontWeight: 800, padding: '0.6rem 1.2rem', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem' }}
                                        >
                                            Initiate Dispute
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--secondary-color)', marginBottom: '1.5rem' }}>Dispute Resolution Form</h3>
                                        <form onSubmit={submitReturnHandler} style={{ display: 'grid', gap: '1.2rem' }}>
                                            <div className="form-group">
                                                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', marginBottom: '6px', display: 'block' }}>Requested Action</label>
                                                <select value={returnType} onChange={(e) => setReturnType(e.target.value)} style={{ height: '48px', width: '100%', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: 600, padding: '0 1rem' }}>
                                                    <option value="return">Full Refund</option>
                                                    <option value="replacement">Physical Replacement</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', marginBottom: '6px', display: 'block' }}>Cause of Dispute</label>
                                                <select value={returnReason} onChange={(e) => setReturnReason(e.target.value)} style={{ height: '48px', width: '100%', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: 600, padding: '0 1rem' }}>
                                                    <option value="Damaged Product">Physical Damage</option>
                                                    <option value="Item missing from order">Logistics Error (Missing Item)</option>
                                                    <option value="Wrong item sent">Incorrect SKU Received</option>
                                                    <option value="Quality not as expected">Performance Deficiency</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', marginBottom: '6px', display: 'block' }}>Supporting Evidence (Text)</label>
                                                <textarea value={returnDescription} onChange={(e) => setReturnDescription(e.target.value)} placeholder="Please elaborate on the discrepancy..." style={{ width: '100%', minHeight: '100px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', fontWeight: 500 }}></textarea>
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button type="submit" className="auth-btn" style={{ padding: '0.8rem', borderRadius: '10px' }} disabled={updating}>Submit Claim</button>
                                                <button type="button" onClick={() => setShowReturnForm(false)} style={{ flex: 1, background: 'none', border: 'none', color: '#94a3b8', fontWeight: 800, cursor: 'pointer' }}>Discard</button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                                {returnStatusMsg && <div style={{ marginTop: '1rem', color: returnStatusMsg.includes('✅') ? '#059669' : '#dc2626', fontWeight: 800, fontSize: '0.9rem', textAlign: 'center' }}>{returnStatusMsg}</div>}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                        <div className="admin-card" style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>Logistics Payload</h3>
                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontWeight: 900, color: 'var(--secondary-color)', fontSize: '1.1rem', marginBottom: '0.8rem' }}>{order.user?.name}</div>
                                <div style={{ color: '#475569', lineHeight: '1.6', fontWeight: 600 }}>
                                    {order.shippingAddress.street}<br />
                                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                                    India
                                </div>
                                <div style={{ marginTop: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>
                                    <div style={{ width: '18px', height: '18px', background: '#e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>@</div>
                                    {order.user?.email}
                                </div>
                            </div>
                        </div>

                        <div className="admin-card" style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>Payment Status</h3>
                            <div style={{
                                padding: '1.5rem',
                                borderRadius: '12px',
                                border: '1px solid',
                                background: order.isPaid ? 'rgba(16, 185, 129, 0.03)' : 'rgba(239, 68, 68, 0.03)',
                                borderColor: order.isPaid ? '#10b981' : '#fca5a5',
                                color: order.isPaid ? '#047857' : '#991b1b',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontWeight: 900, fontSize: '1.4rem', marginBottom: '0.5rem' }}>{order.isPaid ? 'SETTLED' : 'OUTSTANDING'}</div>
                                <p style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>
                                    Gateway: {order.paymentMethod}<br />
                                    {order.isPaid ? `Verified on ${new Date(order.paidAt).toLocaleDateString()}` : 'Payment action required'}
                                </p>
                            </div>
                            {!order.isPaid && order.paymentMethod === 'Razorpay' && order.orderStatus !== 'Cancelled' && (
                                <button
                                    onClick={retryPaymentHandler}
                                    className="auth-btn"
                                    style={{ marginTop: '1.2rem', padding: '1rem', background: 'var(--primary-color)', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)' }}
                                    disabled={updating}
                                >
                                    {updating ? 'Initializing Gateway...' : '💳 Authorize Transaction'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    <div style={{ background: 'var(--secondary-color)', padding: '2rem', borderRadius: '16px', color: 'white', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ width: '12px', height: '12px', background: 'var(--primary-color)', borderRadius: '3px' }}></span>
                            Ledger Summary
                        </h2>
                        <div style={{ display: 'grid', gap: '1.2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontWeight: 600 }}>
                                <span>Gross Items</span>
                                <span style={{ color: 'white' }}>₹{order.itemsPrice.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontWeight: 600 }}>
                                <span>Logistics Fee</span>
                                <span style={{ color: order.shippingPrice === 0 ? '#10b981' : 'white' }}>{order.shippingPrice === 0 ? 'COMPLIMENTARY' : `₹${order.shippingPrice.toLocaleString()}`}</span>
                            </div>
                            {order.discountPrice > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 800 }}>
                                    <span>Discount Applied</span>
                                    <span>- ₹{order.discountPrice.toLocaleString()}</span>
                                </div>
                            )}
                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '1rem 0' }}></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <span style={{ color: '#94a3b8', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase' }}>Total Amount</span>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ color: 'var(--primary-color)', fontSize: '2rem', fontWeight: 900 }}>₹{order.totalPrice.toLocaleString()}</div>
                                    <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700 }}>INCL. ₹{order.taxPrice.toLocaleString()} GST</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {isAdmin && (
                        <div style={{ background: '#f5f3ff', padding: '2rem', borderRadius: '16px', border: '2px dashed #ddd6fe' }}>
                            <h3 style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Package size={18} /> Administrative Bridge
                            </h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {order.orderStatus === 'Pending' && <button className="auth-btn" onClick={() => updateStatusHandler('Processing')} disabled={updating} style={{ borderRadius: '12px' }}>Authorize Fulfillment</button>}
                                {order.orderStatus === 'Processing' && <button className="auth-btn" style={{ background: '#7c3aed', borderRadius: '12px' }} onClick={() => updateStatusHandler('Packed')} disabled={updating}>Acknowledge Packing</button>}
                                {order.orderStatus === 'Packed' && <button className="auth-btn" style={{ background: '#d97706', borderRadius: '12px' }} onClick={() => updateStatusHandler('Shipped')} disabled={updating}>Dispatch Cargo</button>}
                                {order.orderStatus === 'Shipped' && <button className="auth-btn" style={{ background: '#059669', borderRadius: '12px' }} onClick={() => updateStatusHandler('Delivered')} disabled={updating}>Confirm Terminal Drop</button>}

                                <p style={{ margin: '1rem 0 0', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textAlign: 'center', lineHeight: '1.5' }}>
                                    Updating status will trigger automated notifications and database synchronization for both customer and inventory modules.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;
