import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Save, Package, DollarSign, Upload, Trash2, Tag, Layers, Database } from 'lucide-react';
import API from '../api';
import { useStore } from '../Store';
import toast from 'react-hot-toast';
import './AuthPages.css';

const AdminProductEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [basePrice, setBasePrice] = useState(0);
    const [image, setImage] = useState('');
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [gstPercentage, setGstPercentage] = useState(18);
    const [variations, setVariations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [uploading, setUploading] = useState(false);

    // New Variation State
    const [newSku, setNewSku] = useState('');
    const [newType, setNewType] = useState('Standard');
    const [newStock, setNewStock] = useState(10);
    const [newAdjustment, setNewAdjustment] = useState(0);

    const { state } = useStore();
    const { userLogin: { userInfo } } = state;

    useEffect(() => {
        if (!userInfo || userInfo.role !== 'admin') {
            navigate('/login');
            return;
        }

        const fetchCategories = async () => {
            const { data } = await API.get('/api/products/categories');
            setCategories(data);
        };

        const fetchProduct = async () => {
            try {
                const { data } = await API.get(`/api/products/${id}`);
                setName(data.product.name);
                setBasePrice(data.product.basePrice);
                setImage(data.product.images[0] || '');
                setBrand(data.product.brand);
                setCategory(data.product.category?._id || '');
                setDescription(data.product.description);
                setGstPercentage(data.product.gstPercentage);
                setVariations(data.variations || []);
            } catch (err) {
                toast.error(err.response?.data?.message || err.message);
            }
        };

        fetchCategories();
        fetchProduct();
    }, [id, navigate, userInfo]);

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        uploadToServer(file);
    };

    const handlePaste = async (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    uploadToServer(file);
                }
            }
        }
    };

    const uploadToServer = async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);

        try {
            const config = {
                headers: { 'Content-Type': 'multipart/form-data' },
            };

            const { data } = await API.post('/api/upload', formData, config);
            setImage(data);
            setUploading(false);
            toast.success('Resource synchronized with CDN!');
        } catch (err) {
            setUploading(false);
            toast.error('Network protocol error: Storage upload failed');
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            await API.put(
                `/api/products/${id}`,
                {
                    name,
                    basePrice,
                    images: [image],
                    brand,
                    category,
                    description,
                    gstPercentage
                }
            );
            toast.success('Product specification committed to blockchain.');
            navigate('/admin/products');
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    };

    const createVariationHandler = async () => {
        if (!newSku) {
            toast.error('Validation Error: SKU Designation is required.');
            return;
        }
        try {
            const { data } = await API.post(`/api/products/${id}/variations`, {
                sku: newSku,
                attributes: { type: newType },
                priceAdjustment: Number(newAdjustment),
                stockQuantity: Number(newStock)
            });

            setVariations([...variations, data]);
            setNewSku('');
            setNewType('Standard');
            setNewStock(10);
            setNewAdjustment(0);
            toast.success('Inventory cycle initialized.');
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    }

    const deleteVariationHandler = async (variationId) => {
        if (window.confirm('Execute permanent purge of this inventory node?')) {
            try {
                await API.delete(`/api/products/${id}/variations/${variationId}`);
                setVariations(variations.filter(v => v._id !== variationId));
                toast.success('Archive successfully purged.');
            } catch (err) {
                toast.error(err.response?.data?.message || err.message);
            }
        }
    };

    return (
        <div className="admin-container" style={{ paddingBottom: '6rem' }}>
            <div className="admin-header" style={{ marginBottom: '3.5rem', background: 'white', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Link to="/admin/products" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--primary-color)', fontWeight: 900, fontSize: '0.85rem', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                            <ChevronLeft size={18} /> Catalog Matrix
                        </Link>
                        <h1 style={{ fontSize: '2.4rem', fontWeight: 950, color: 'var(--secondary-color)', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                            Design Specification
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '6px', fontWeight: 600 }}>Refining core attributes and logistical parameters for SKU: {id.substring(18, 24).toUpperCase()}</p>
                    </div>
                    <button
                        onClick={submitHandler}
                        className="auth-btn"
                        style={{ width: 'auto', marginTop: 0, height: '56px', padding: '0 3rem', background: 'var(--primary-color)', color: 'white', fontWeight: 950, borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem', transition: 'all 0.3s' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <Save size={20} /> COMMIT CHANGES
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.2fr', gap: '3rem', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    {/* Core Specs */}
                    <div style={{ background: 'white', padding: '3.5rem', borderRadius: '28px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '3rem' }}>
                            <div style={{ background: '#f5f3ff', color: 'var(--primary-color)', padding: '12px', borderRadius: '16px' }}>
                                <Package size={28} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--secondary-color)', margin: 0 }}>Identity Matrix</h2>
                        </div>

                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 900, color: '#64748b', marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Universal Designation</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={{ height: '60px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '18px', fontWeight: 800, fontSize: '1.1rem', color: 'var(--secondary-color)' }}
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                            <div className="form-group">
                                <label style={{ fontSize: '0.85rem', fontWeight: 900, color: '#64748b', marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Manufacturer</label>
                                <input
                                    type="text"
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                    style={{ height: '56px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px', fontWeight: 700, fontSize: '1rem' }}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ fontSize: '0.85rem', fontWeight: 900, color: '#64748b', marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Structural Sector</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    style={{ height: '56px', width: '100%', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px', fontWeight: 700, fontSize: '1rem', padding: '0 1.5rem', cursor: 'pointer' }}
                                >
                                    <option value="">Operational Context...</option>
                                    {categories.map(c => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label style={{ fontSize: '0.85rem', fontWeight: 900, color: '#64748b', marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Logistical Abstract</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                style={{ minHeight: '200px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '18px', fontWeight: 500, padding: '1.5rem', width: '100%', lineHeight: 1.6, fontSize: '1rem', color: 'var(--text-main)', resize: 'none' }}
                                required
                            />
                        </div>
                    </div>

                    {/* Pricing */}
                    <div style={{ background: 'white', padding: '3.5rem', borderRadius: '28px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '3rem' }}>
                            <div style={{ background: '#ecfdf5', color: '#10b981', padding: '12px', borderRadius: '16px' }}>
                                <DollarSign size={28} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--secondary-color)', margin: 0 }}>Revenue Modeling</h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div className="form-group">
                                <label style={{ fontSize: '0.85rem', fontWeight: 900, color: '#64748b', marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Base Valuation (₹)</label>
                                <input
                                    type="number"
                                    value={basePrice}
                                    onChange={(e) => setBasePrice(e.target.value)}
                                    style={{ height: '60px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '18px', fontWeight: 950, fontSize: '1.3rem', color: 'var(--secondary-color)' }}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ fontSize: '0.85rem', fontWeight: 900, color: '#64748b', marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>GST Coefficient (%)</label>
                                <input
                                    type="number"
                                    value={gstPercentage}
                                    onChange={(e) => setGstPercentage(e.target.value)}
                                    style={{ height: '60px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '18px', fontWeight: 950, fontSize: '1.3rem', color: 'var(--secondary-color)' }}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', position: 'sticky', top: '100px' }}>
                    {/* Media */}
                    <div style={{ background: 'white', padding: '3rem', borderRadius: '28px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                            <Upload size={22} style={{ color: 'var(--primary-color)' }} />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 950, color: 'var(--secondary-color)', margin: 0 }}>Visual Asset</h2>
                        </div>

                        <div
                            onPaste={handlePaste}
                            style={{
                                border: '2.5px dashed #e2e8f0',
                                padding: '2.5rem 1.5rem',
                                borderRadius: '24px',
                                background: '#f8fafc',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                            onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                        >
                            {image ? (
                                <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
                                    <img src={API.getImageUrl(image)} alt="Preview" style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', objectFit: 'contain' }} />
                                    <button
                                        onClick={() => setImage('')}
                                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', color: '#ef4444', border: 'none', borderRadius: '12px', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 900, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                                    >
                                        &times;
                                    </button>
                                </div>
                            ) : (
                                <div style={{ padding: '2rem 1rem' }}>
                                    <div style={{ background: 'white', width: '64px', height: '64px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', color: '#cbd5e1' }}>
                                        <Upload size={28} />
                                    </div>
                                    <h4 style={{ color: 'var(--secondary-color)', fontSize: '0.95rem', fontWeight: 900, marginBottom: '8px' }}>Asset Injection</h4>
                                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.5rem' }}>Drop, Paste or Browse Interface</p>
                                    <input
                                        type="file"
                                        onChange={uploadFileHandler}
                                        style={{ display: 'none' }}
                                        id="media-upload"
                                    />
                                    <label
                                        htmlFor="media-upload"
                                        style={{ background: 'var(--primary-color)', padding: '0.8rem 2rem', borderRadius: '14px', cursor: 'pointer', fontWeight: 900, fontSize: '0.85rem', color: 'white', display: 'inline-block', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}
                                    >
                                        Select Binary
                                    </label>
                                </div>
                            )}
                            {uploading && (
                                <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--primary-color)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></div>
                                    CDN Synchronization...
                                </div>
                            )}
                        </div>
                        <div style={{ marginTop: '1.5rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 900, color: '#94a3b8', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Remote Resource Locator</label>
                            <input
                                type="text"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                                placeholder="https://cdn.resource.internal/ext-ref"
                                style={{ height: '48px', fontSize: '0.85rem', background: '#f8fafc', border: '1.5px solid #f1f5f9', borderRadius: '12px', fontWeight: 600, padding: '0 1rem' }}
                            />
                        </div>
                    </div>

                    {/* Inventory */}
                    <div style={{ background: 'white', padding: '3rem', borderRadius: '28px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Database size={22} style={{ color: '#f59e0b' }} />
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 950, color: 'var(--secondary-color)', margin: 0 }}>Active SKUs</h2>
                            </div>
                            <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 900 }}>{variations.length} NODES</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '320px', overflowY: 'auto', paddingRight: '8px', marginBottom: '2.5rem' }}>
                            {variations.map((v) => (
                                <div key={v._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem', background: '#f8fafc', borderRadius: '16px', border: '1.5px solid #f1f5f9', transition: 'all 0.2s' }}>
                                    <div>
                                        <div style={{ fontWeight: 950, color: 'var(--secondary-color)', fontSize: '0.9rem', fontFamily: 'monospace', letterSpacing: '0.5px' }}>{v.sku}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, marginTop: '4px' }}>
                                            {v.attributes?.type || 'Standard'} • <span style={{ color: v.stockQuantity > 5 ? '#10b981' : '#ef4444' }}>{v.stockQuantity} LOG</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ fontWeight: 950, color: v.priceAdjustment >= 0 ? '#10b981' : '#ef4444', fontSize: '0.9rem', textAlign: 'right' }}>
                                            {v.priceAdjustment >= 0 ? `+₹${v.priceAdjustment}` : `-₹${Math.abs(v.priceAdjustment)}`}
                                        </div>
                                        <button
                                            onClick={() => deleteVariationHandler(v._id)}
                                            style={{ width: '32px', height: '32px', background: 'white', color: '#cbd5e1', border: '1.5px solid #f1f5f9', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                            onMouseOver={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fee2e2'; }}
                                            onMouseOut={e => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {variations.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', borderRadius: '20px', border: '1.5px dashed #e2e8f0' }}>
                                    <Layers size={32} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
                                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>No Logical Segments Configured</p>
                                </div>
                            )}
                        </div>

                        <div style={{ background: '#f5f3ff', padding: '2rem', borderRadius: '24px', border: '1px solid #ddd6fe' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                                <Tag size={18} style={{ color: 'var(--primary-color)' }} />
                                <h3 style={{ fontSize: '0.85rem', fontWeight: 950, color: 'var(--primary-color)', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Provision New Node</h3>
                            </div>
                            <div style={{ display: 'grid', gap: '1.2rem' }}>
                                <input
                                    placeholder="Inventory SKU Code"
                                    value={newSku}
                                    onChange={(e) => setNewSku(e.target.value)}
                                    style={{ height: '48px', borderRadius: '14px', border: '1.5px solid #ddd6fe', fontWeight: 700, fontSize: '0.9rem', background: 'white', padding: '0 1.2rem' }}
                                />
                                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
                                    <input
                                        placeholder="Type Designation"
                                        value={newType}
                                        onChange={(e) => setNewType(e.target.value)}
                                        style={{ height: '48px', borderRadius: '14px', border: '1.5px solid #ddd6fe', fontWeight: 700, fontSize: '0.9rem', background: 'white', padding: '0 1.2rem' }}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Base Qty"
                                        value={newStock}
                                        onChange={(e) => setNewStock(e.target.value)}
                                        style={{ height: '48px', borderRadius: '14px', border: '1.5px solid #ddd6fe', fontWeight: 700, fontSize: '0.9rem', background: 'white', padding: '0 1.2rem' }}
                                    />
                                </div>
                                <input
                                    type="number"
                                    placeholder="Price Delta Adjustment (₹)"
                                    value={newAdjustment}
                                    onChange={(e) => setNewAdjustment(e.target.value)}
                                    style={{ height: '48px', borderRadius: '14px', border: '1.5px solid #ddd6fe', fontWeight: 700, fontSize: '0.9rem', background: 'white', padding: '0 1.2rem' }}
                                />
                                <button
                                    onClick={createVariationHandler}
                                    style={{ background: 'var(--primary-color)', color: 'white', height: '52px', borderRadius: '14px', border: 'none', fontWeight: 900, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 8px 15px rgba(79, 70, 229, 0.25)', marginTop: '0.5rem', transition: 'all 0.3s' }}
                                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    AUTHORIZE SKU
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProductEditPage;
