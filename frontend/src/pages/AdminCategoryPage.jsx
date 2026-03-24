import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useStore } from '../Store';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import './AuthPages.css';

const AdminCategoryPage = () => {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);

    const { state } = useStore();
    const { userLogin: { userInfo } } = state;
    const navigate = useNavigate();

    const fetchCategories = async () => {
        try {
            const { data } = await API.get('/api/products/categories');
            setCategories(data);
            setLoading(false);
        } catch (err) {
            toast.error(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!userInfo || userInfo.role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchCategories();
    }, [userInfo, navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            await API.post('/api/products/categories', { name, description });
            setName('');
            setDescription('');
            toast.success('Category successfully established!');
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    };

    return (
        <div className="admin-container" style={{ paddingBottom: '5rem' }}>
            <div className="admin-header" style={{ marginBottom: '3rem', background: 'white', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
                            <div style={{ width: '40px', height: '2px', background: 'var(--primary-color)' }}></div>
                            Taxonomy Forge
                        </div>
                        <h1 style={{ fontSize: '2.4rem', fontWeight: 950, color: 'var(--secondary-color)', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            Sector Management
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '4px', fontWeight: 600 }}>Master the structural organization of your product portfolio</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '3rem', alignItems: 'start' }}>
                <div>
                    <div className="table-wrapper" style={{ background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                        <table style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th style={{ background: '#f8fafc', padding: '1.2rem 2rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid #f1f5f9' }}>Identity</th>
                                    <th style={{ background: '#f8fafc', padding: '1.2rem 2rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid #f1f5f9' }}>Operational Scope</th>
                                    <th style={{ background: '#f8fafc', padding: '1.2rem 2rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map(cat => (
                                    <tr key={cat._id}
                                        style={{ borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s' }}
                                        onMouseOver={e => e.currentTarget.style.background = '#fcfaff'}
                                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '2rem' }}>
                                            <div style={{ fontWeight: 950, color: 'var(--secondary-color)', fontSize: '1.1rem', letterSpacing: '-0.2px' }}>{cat.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: 800, marginTop: '4px', textTransform: 'uppercase' }}>Active Sector</div>
                                        </td>
                                        <td style={{ padding: '2rem', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, fontWeight: 500 }}>
                                            {cat.description}
                                        </td>
                                        <td style={{ padding: '2rem', textAlign: 'right' }}>
                                            <button
                                                style={{ width: '42px', height: '42px', background: '#f8fafc', color: '#cbd5e1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f1f5f9', cursor: 'not-allowed', margin: '0 0 0 auto', transition: 'all 0.2s' }}
                                                title="Decommissioning Locked: Core Sector"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!loading && categories.length === 0 && (
                            <div style={{ padding: '6rem 2rem', textAlign: 'center' }}>
                                <div style={{ background: '#f8fafc', width: '80px', height: '80px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: '#cbd5e1' }}>
                                    <Plus size={40} />
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 950, color: 'var(--secondary-color)', marginBottom: '0.5rem' }}>No Structural Segments Detected</h3>
                                <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Initialize your first category to begin portfolio mapping.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ position: 'sticky', top: '100px' }}>
                    <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 950, color: 'var(--secondary-color)' }}>Provision Sector</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px', fontWeight: 600 }}>Register a new taxonomy segment in the core ledger</p>
                        </div>
                        <form onSubmit={submitHandler}>
                            <div className="form-group" style={{ marginBottom: '1.8rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 900, color: '#64748b', marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Sector Designation</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    placeholder="e.g. Premium Stationery"
                                    style={{ height: '56px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px', fontSize: '1rem', fontWeight: 600, color: 'var(--secondary-color)', transition: 'all 0.2s' }}
                                    onFocus={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                                    onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 900, color: '#64748b', marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Functional Scope</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    placeholder="Define the scope of this categorization..."
                                    style={{
                                        width: '100%',
                                        padding: '1.5rem',
                                        borderRadius: '16px',
                                        border: '1.5px solid #e2e8f0',
                                        background: '#f8fafc',
                                        minHeight: '160px',
                                        fontFamily: 'inherit',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        color: 'var(--secondary-color)',
                                        lineHeight: 1.6,
                                        resize: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                                    onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                                />
                            </div>
                            <button type="submit" className="auth-btn"
                                style={{ margin: 0, height: '56px', borderRadius: '16px', background: 'var(--primary-color)', color: 'white', fontWeight: 900, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)', transition: 'all 0.3s' }}
                                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <Plus size={22} /> AUTHORIZE SECTOR
                            </button>
                        </form>
                    </div>

                    <div style={{ marginTop: '2rem', background: '#f8fafc', pdding: '1.5rem', borderRadius: '16px', border: '1px dashed #e2e8f0', padding: '1.5rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Pro Tip: Logical Grouping</div>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                            Keep sector designation concise. This helps in visual navigation for users on the marketplace frontend.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCategoryPage;
