import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import { useStore } from '../Store';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import './Admin.css';

const AdminProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { state } = useStore();
    const { userLogin: { userInfo } } = state;
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [showBulk, setShowBulk] = useState(false);
    const [bulkData, setBulkData] = useState('');

    const fetchProducts = async () => {
        try {
            const { data } = await API.get('/api/products');
            setProducts(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await API.get('/api/products/categories');
            setCategories(data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    useEffect(() => {
        if (!userInfo || userInfo.role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchProducts();
        fetchCategories();
    }, [userInfo, navigate]);

    const deleteHandler = async (id) => {
        if (window.confirm('Requesting Inventory Deactivation: Are you sure?')) {
            try {
                await API.delete(`/api/products/${id}`);
                toast.success('SKU Deprecated Successfully');
                fetchProducts();
            } catch (err) {
                toast.error(err.response?.data?.message || err.message);
            }
        }
    };

    const createProductHandler = async () => {
        if (categories.length === 0) {
            toast.error('Taxonomy Error: Create at least one category first.');
            return;
        }
        try {
            const { data } = await API.post('/api/products', {
                name: 'Draft Product ' + Date.now(),
                basePrice: 0,
                description: 'Enter detailed specifications here...',
                brand: 'Student Note Books',
                category: categories[0]._id,
                gstPercentage: 18,
                slug: 'draft-sku-' + Date.now()
            });
            navigate(`/admin/product/${data._id}/edit`);
            toast.success('Protocol Initiated: New Draft SKU Created');
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    };

    const handleBulkImport = async () => {
        try {
            const parsed = JSON.parse(bulkData);
            const dataToSubmit = Array.isArray(parsed) ? parsed : [parsed];

            const { data } = await API.post('/api/products/bulk', { products: dataToSubmit });
            toast.success(`Ingestion Complete: ${data.created} Managed, ${data.failed} Skipped`);
            if (data.failed > 0) {
                console.error('Bulk Import Errors:', data.errors);
            }
            setBulkData('');
            setShowBulk(false);
            fetchProducts();
        } catch (err) {
            toast.error('Data Corruption: Invalid JSON Syntax');
        }
    };

    const downloadTemplate = () => {
        const template = [
            {
                name: "Classmate Notebook 120 Pages",
                category: "Notebooks",
                basePrice: 45,
                sku: "NB-CLAS-120",
                stockQuantity: 100,
                brand: "Classmate",
                description: "High quality notebook"
            }
        ];
        const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'inventory_template_v1.json');
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className="admin-container" style={{ paddingBottom: '5rem' }}>
            <div className="admin-header" style={{ marginBottom: '3rem', background: 'white', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
                            <div style={{ width: '40px', height: '2px', background: 'var(--primary-color)' }}></div>
                            Global Inventory
                        </div>
                        <h1 style={{ fontSize: '2.4rem', fontWeight: 950, color: 'var(--secondary-color)', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            Catalog Management
                        </h1>
                        <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary-color)' }}>{products.length}</span>
                                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Active SKUs</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#10b981' }}>{categories.length}</span>
                                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Taxonomy Sectors</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1.2rem' }}>
                        <button
                            className="auth-btn"
                            style={{ width: 'auto', background: 'white', color: 'var(--secondary-color)', border: '1.5px solid #e2e8f0', marginTop: 0, padding: '0.8rem 1.8rem', borderRadius: '16px', fontWeight: 800, fontSize: '0.9rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}
                            onClick={() => setShowBulk(!showBulk)}
                        >
                            {showBulk ? 'Discard Ingestion' : 'Bulk Ingest'}
                        </button>
                        <button
                            className="auth-btn"
                            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '10px', marginTop: 0, padding: '0.8rem 2rem', background: 'var(--primary-color)', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)', borderRadius: '16px', fontWeight: 800, fontSize: '0.9rem' }}
                            onClick={createProductHandler}
                        >
                            <Plus size={20} /> Deploy New SKU
                        </button>
                    </div>
                </div>
            </div>

            {showBulk && (
                <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', border: '1px solid #f1f5f9', marginBottom: '3rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 950, color: 'var(--secondary-color)' }}>High-Volume Data Ingestion</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px', fontWeight: 600 }}>Execute batch creation of products via JSON payload protocol</p>
                        </div>
                        <button onClick={downloadTemplate} style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 900, padding: '12px 24px', borderRadius: '14px', transition: 'all 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.background = '#ede9fe'}
                            onMouseOut={e => e.currentTarget.style.background = '#f5f3ff'}
                        >
                            Get Payload Template
                        </button>
                    </div>
                    <textarea
                        value={bulkData}
                        onChange={(e) => setBulkData(e.target.value)}
                        placeholder='[ { "name": "Notebook v2", "sku": "NB-002", ... } ]'
                        style={{ width: '100%', minHeight: '280px', padding: '1.5rem', borderRadius: '16px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--secondary-color)', transition: 'border-color 0.2s' }}
                        onFocus={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                        onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                        <button
                            onClick={handleBulkImport}
                            disabled={!bulkData}
                            className="auth-btn"
                            style={{ width: 'auto', margin: 0, background: '#10b981', padding: '1rem 3rem', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)', borderRadius: '16px', fontWeight: 900 }}
                        >
                            Authorize Ingestion
                        </button>
                    </div>
                </div>
            )}

            <div className="table-wrapper" style={{ background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="spinner"></div>
                        <p style={{ color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Establishing Secure Link to Inventory...</p>
                    </div>
                ) : error ? (
                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                        <div style={{ color: '#ef4444', fontSize: '1.2rem', fontWeight: 950, marginBottom: '1rem' }}>RECOVERY FAILURE</div>
                        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{error}</p>
                    </div>
                ) : (
                    <table style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th style={{ background: '#f8fafc', padding: '1.2rem 2rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid #f1f5f9' }}>SKU Definition</th>
                                <th style={{ background: '#f8fafc', padding: '1.2rem 2rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid #f1f5f9' }}>Market Value</th>
                                <th style={{ background: '#f8fafc', padding: '1.2rem 2rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid #f1f5f9' }}>Sector</th>
                                <th style={{ background: '#f8fafc', padding: '1.2rem 2rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid #f1f5f9' }}>Origin Brand</th>
                                <th style={{ background: '#f8fafc', padding: '1.2rem 2rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>Operations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product._id}
                                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s' }}
                                    onMouseOver={e => e.currentTarget.style.background = '#fcfaff'}
                                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '1.8rem 2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <div style={{ width: '64px', height: '64px', background: '#f8fafc', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                                                {product.images && product.images[0] ? (
                                                    <img src={API.getImageUrl(product.images[0])} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                                ) : (
                                                    <div style={{ color: '#cbd5e1' }}><Plus size={24} /></div>
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 950, color: 'var(--secondary-color)', fontSize: '1rem', letterSpacing: '-0.2px' }}>{product.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 800, marginTop: '4px', fontFamily: 'monospace' }}>ID: {product._id.substring(18, 24).toUpperCase()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.8rem 2rem' }}>
                                        <div style={{ fontWeight: 950, color: 'var(--secondary-color)', fontSize: '1.1rem' }}>₹{product.basePrice.toLocaleString()}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 800 }}>MKT OPTIMAL</div>
                                    </td>
                                    <td style={{ padding: '1.8rem 2rem' }}>
                                        <span style={{ padding: '6px 14px', borderRadius: '10px', background: '#f5f3ff', color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', border: '1px solid #ddd6fe' }}>
                                            {product.category?.name || 'GENERIC'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.8rem 2rem' }}>
                                        <div style={{ fontWeight: 800, color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '8px', height: '8px', background: '#e2e8f0', borderRadius: '2px' }}></div>
                                            {product.brand}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.8rem 2rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                            <Link
                                                to={`/admin/product/${product._id}/edit`}
                                                style={{ width: '42px', height: '42px', background: 'white', color: 'var(--secondary-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                                                title="Edit SKU"
                                                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.color = 'var(--primary-color)'; }}
                                                onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = 'var(--secondary-color)'; }}
                                            >
                                                <Edit size={20} />
                                            </Link>
                                            <button
                                                onClick={() => deleteHandler(product._id)}
                                                style={{ width: '42px', height: '42px', background: 'white', color: '#ef4444', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fee2e2', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                                                title="Decommission SKU"
                                                onMouseOver={e => { e.currentTarget.style.background = '#fef2f2'; }}
                                                onMouseOut={e => { e.currentTarget.style.background = 'white'; }}
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminProductListPage;
