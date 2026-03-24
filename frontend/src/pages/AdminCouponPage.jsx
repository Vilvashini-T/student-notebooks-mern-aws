import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useStore } from '../Store';
import { Plus, Tag, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import './Admin.css';

const AdminCouponPage = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formError, setFormError] = useState('');

    const [code, setCode] = useState('');
    const [discountType, setDiscountType] = useState('percentage');
    const [discountAmount, setDiscountAmount] = useState('');
    const [minOrderAmount, setMinOrderAmount] = useState('0');
    const [expiryDate, setExpiryDate] = useState('');
    const [usageLimit, setUsageLimit] = useState('');

    const { state } = useStore();
    const { userLogin: { userInfo } } = state;
    const navigate = useNavigate();

    const fetchCoupons = async () => {
        try {
            const { data } = await API.get('/api/coupons');
            setCoupons(data);
            setLoading(false);
        } catch (err) {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!userInfo || (userInfo.role !== 'admin' && userInfo.role !== 'shopkeeper')) {
            navigate('/login');
            return;
        }
        fetchCoupons();
    }, [userInfo, navigate]);

    const createCouponHandler = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!code || !discountAmount || !expiryDate) {
            setFormError('Operational Failure: Required fields are missing.');
            return;
        }

        try {
            await API.post('/api/coupons', {
                code: code.toUpperCase(),
                discountType,
                discountAmount: Number(discountAmount),
                minOrderAmount: Number(minOrderAmount),
                expiryDate,
                usageLimit: usageLimit ? Number(usageLimit) : null
            });

            toast.success(`Protocol Confirmed: Coupon "${code.toUpperCase()}" generated.`);
            setCode('');
            setDiscountAmount('');
            setMinOrderAmount('0');
            setExpiryDate('');
            setUsageLimit('');
            fetchCoupons();
            setShowForm(false);
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setFormError(msg);
            toast.error(msg);
        }
    };

    const isExpired = (date) => new Date(date) < new Date();

    return (
        <div className="admin-container" style={{ paddingBottom: '5rem' }}>
            <div className="admin-header" style={{ marginBottom: '3rem', background: 'white', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
                            <div style={{ width: '40px', height: '2px', background: 'var(--primary-color)' }}></div>
                            Marketing Engineering
                        </div>
                        <h1 style={{ fontSize: '2.4rem', fontWeight: 950, color: 'var(--secondary-color)', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            Promotion Vault
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '4px', fontWeight: 600 }}>Execute high-conversion discount protocols and campaign codes</p>
                    </div>
                    <button
                        className="auth-btn"
                        style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '10px', marginTop: 0, padding: '0.8rem 2rem', background: showForm ? 'white' : 'var(--primary-color)', color: showForm ? 'var(--secondary-color)' : 'white', border: showForm ? '1.5px solid #e2e8f0' : 'none', boxShadow: showForm ? '0 4px 6px -1px rgba(0,0,0,0.02)' : '0 10px 15px -3px rgba(79, 70, 229, 0.3)', borderRadius: '16px', fontWeight: 800, fontSize: '1rem', transition: 'all 0.3s' }}
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? 'Discard Draft' : <><Plus size={22} /> New Protocol</>}
                    </button>
                </div>
            </div>

            {showForm && (
                <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', border: '1px solid #f1f5f9', marginBottom: '3rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2.5rem' }}>
                        <div style={{ background: '#f5f3ff', color: 'var(--primary-color)', padding: '12px', borderRadius: '16px' }}>
                            <Tag size={28} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--secondary-color)', margin: 0 }}>Define Promo Parameters</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, marginTop: '4px' }}>Configure the mathematical constraints for the new coupon code</p>
                        </div>
                    </div>

                    {formError && (
                        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '1.2rem 1.5rem', borderRadius: '16px', marginBottom: '2rem', fontWeight: 800, border: '1px solid #fee2e2', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '8px', height: '8px', background: '#dc2626', borderRadius: '50%' }}></div>
                            {formError}
                        </div>
                    )}

                    <form onSubmit={createCouponHandler}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                            <div className="form-group">
                                <label style={{ fontSize: '0.85rem', fontWeight: 900, color: '#64748b', marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Alpha-Numeric Code *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. STELLAR50"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    style={{ height: '56px', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 950, background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px', fontSize: '1.1rem', color: 'var(--primary-color)', textAlign: 'center' }}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ fontSize: '0.85rem', fontWeight: 900, color: '#64748b', marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Discount Methodology *</label>
                                <select
                                    value={discountType}
                                    onChange={(e) => setDiscountType(e.target.value)}
                                    style={{ height: '56px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px', fontWeight: 800, color: 'var(--secondary-color)', fontSize: '1rem', cursor: 'pointer' }}
                                >
                                    <option value="percentage">Dynamic Percentage (%)</option>
                                    <option value="flat">Fixed Flat Amount (₹)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label style={{ fontSize: '0.85rem', fontWeight: 900, color: '#64748b', marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Inflow Adjustment * {discountType === 'percentage' ? '(%)' : '(₹)'}</label>
                                <input
                                    type="number"
                                    placeholder={discountType === 'percentage' ? 'Max 50' : 'e.g. 250'}
                                    value={discountAmount}
                                    onChange={(e) => setDiscountAmount(e.target.value)}
                                    min="1"
                                    max={discountType === 'percentage' ? '100' : undefined}
                                    required
                                    style={{ height: '56px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px', fontWeight: 800, fontSize: '1.1rem' }}
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ fontSize: '0.85rem', fontWeight: 900, color: '#64748b', marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Activation Threshold (₹)</label>
                                <input
                                    type="number"
                                    placeholder="0 = Universal"
                                    value={minOrderAmount}
                                    onChange={(e) => setMinOrderAmount(e.target.value)}
                                    min="0"
                                    style={{ height: '56px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px', fontWeight: 800 }}
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ fontSize: '0.85rem', fontWeight: 900, color: '#64748b', marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Phase Out Date *</label>
                                <input
                                    type="date"
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                    style={{ height: '56px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px', fontWeight: 800, cursor: 'pointer' }}
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ fontSize: '0.85rem', fontWeight: 900, color: '#64748b', marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Usage Limitation</label>
                                <input
                                    type="number"
                                    placeholder="Leave for ∞"
                                    value={usageLimit}
                                    onChange={(e) => setUsageLimit(e.target.value)}
                                    min="1"
                                    style={{ height: '56px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px', fontWeight: 800 }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem' }}>
                            <button type="submit" className="auth-btn" style={{ margin: 0, padding: '1.2rem 4rem', borderRadius: '16px', background: 'var(--primary-color)', color: 'white', fontWeight: 900, fontSize: '1rem', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)', transition: 'all 0.3s' }}
                                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                GENERATE PROTOCOL
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="table-wrapper" style={{ background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="spinner"></div>
                        <p style={{ color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Retrieving Marketing Ledger...</p>
                    </div>
                ) : coupons.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '8rem 2rem' }}>
                        <div style={{ background: '#f5f3ff', width: '100px', height: '100px', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem', color: 'var(--primary-color)' }}>
                            <Tag size={48} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--secondary-color)', marginBottom: '0.8rem' }}>No Marketing Cycles Detected</h3>
                        <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '1.05rem', maxWidth: '400px', margin: '0 auto' }}>Generate your first high-impact promo code to activate the customer flywheel.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th style={{ background: '#f8fafc', padding: '1.2rem 2.5rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid #f1f5f9' }}>Alpha Code</th>
                                <th style={{ background: '#f8fafc', padding: '1.2rem 2.5rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid #f1f5f9' }}>Campaign Efficiency</th>
                                <th style={{ background: '#f8fafc', padding: '1.2rem 2.5rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid #f1f5f9' }}>Constraints</th>
                                <th style={{ background: '#f8fafc', padding: '1.2rem 2.5rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid #f1f5f9' }}>Utilization</th>
                                <th style={{ background: '#f8fafc', padding: '1.2rem 2.5rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid #f1f5f9' }}>Phase Out</th>
                                <th style={{ background: '#f8fafc', padding: '1.2rem 2.5rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map((coupon) => {
                                const expired = isExpired(coupon.expiryDate);
                                const atLimit = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;
                                const isActive = coupon.isActive && !expired && !atLimit;

                                const statusColors = isActive
                                    ? { bg: '#ecfdf5', text: '#059669', border: '#d1fae5' }
                                    : { bg: '#fff1f2', text: '#e11d48', border: '#fee2e2' };

                                const statusText = expired ? 'EXPIRED' : atLimit ? 'LIMIT CAP' : coupon.isActive ? 'OPERATIONAL' : 'DEACTIVATED';

                                return (
                                    <tr key={coupon._id}
                                        style={{ borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s' }}
                                        onMouseOver={e => e.currentTarget.style.background = '#fcfaff'}
                                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '2rem 2.5rem' }}>
                                            <span style={{ fontFamily: 'monospace', fontWeight: 950, fontSize: '1.1rem', letterSpacing: '2px', background: '#f8fafc', padding: '10px 18px', borderRadius: '12px', border: '1.5px solid #e2e8f0', color: 'var(--primary-color)' }}>
                                                {coupon.code}
                                            </span>
                                        </td>
                                        <td style={{ padding: '2rem 2.5rem' }}>
                                            <div style={{ fontWeight: 950, color: 'var(--secondary-color)', fontSize: '1.2rem' }}>
                                                {coupon.discountType === 'percentage' ? `${coupon.discountPrecentage}% REDUCTION` : `₹${coupon.discountAmount} FLAT`}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, marginTop: '4px', textTransform: 'uppercase' }}>{coupon.discountType} Model</div>
                                        </td>
                                        <td style={{ padding: '2rem 2.5rem' }}>
                                            <div style={{ fontSize: '0.95rem', color: 'var(--secondary-color)', fontWeight: 800 }}>
                                                Min: {coupon.minOrderAmount > 0 ? `₹${coupon.minOrderAmount.toLocaleString()}` : 'UNIVERSAL'}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginTop: '4px' }}>Basket Threshold</div>
                                        </td>
                                        <td style={{ padding: '2rem 2.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
                                                <div style={{ fontWeight: 950, color: 'var(--secondary-color)', fontSize: '1.1rem' }}>{coupon.usedCount}</div>
                                                <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 800 }}>/ {coupon.usageLimit || '∞'}</div>
                                            </div>
                                            <div style={{ width: '120px', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                                                <div style={{
                                                    width: coupon.usageLimit ? `${Math.min(100, (coupon.usedCount / coupon.usageLimit) * 100)}%` : '5%',
                                                    height: '100%',
                                                    background: 'linear-gradient(90deg, var(--primary-color) 0%, var(--primary-light) 100%)',
                                                    borderRadius: '4px'
                                                }}></div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '2rem 2.5rem' }}>
                                            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: expired ? '#ef4444' : 'var(--secondary-color)' }}>
                                                {new Date(coupon.expiryDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginTop: '4px' }}>GMT Termination</div>
                                        </td>
                                        <td style={{ padding: '2rem 2.5rem', textAlign: 'right' }}>
                                            <span style={{
                                                background: statusColors.bg,
                                                color: statusColors.text,
                                                padding: '8px 16px',
                                                borderRadius: '12px',
                                                fontWeight: 900,
                                                fontSize: '0.75rem',
                                                border: `1.5px solid ${statusColors.border}`,
                                                textTransform: 'uppercase',
                                                letterSpacing: '1px'
                                            }}>
                                                {statusText}
                                            </span>
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

export default AdminCouponPage;
