import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../Store';
import './AuthPages.css';

const AdminProductEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [basePrice, setBasePrice] = useState(0);
    const [image, setImage] = useState('');
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState('');
    const [countInStock, setCountInStock] = useState(0);
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
            const { data } = await axios.get('http://localhost:5000/api/products/categories');
            setCategories(data);
        };

        const fetchProduct = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
                setName(data.product.name);
                setBasePrice(data.product.basePrice);
                setImage(data.product.images[0] || '');
                setBrand(data.product.brand);
                setCategory(data.product.category?._id || '');
                setDescription(data.product.description);
                setGstPercentage(data.product.gstPercentage);
                setVariations(data.variations || []);
            } catch (err) {
                alert(err.response?.data?.message || err.message);
            }
        };

        fetchCategories();
        fetchProduct();
    }, [id, navigate, userInfo]);

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);

        try {
            const config = {
                headers: { 'Content-Type': 'multipart/form-data' },
            };

            const { data } = await axios.post('http://localhost:5000/api/upload', formData, config);

            // Note: Data returns like '/uploads/image-12345.jpg'
            setImage(`http://localhost:5000${data}`);
            setUploading(false);
        } catch (err) {
            console.error(err);
            setUploading(false);
            alert('Error uploading image');
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            await axios.put(
                `http://localhost:5000/api/products/${id}`,
                {
                    name,
                    basePrice,
                    images: [image],
                    brand,
                    category,
                    description,
                    gstPercentage
                },
                config
            );
            navigate('/admin/products');
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const createVariationHandler = async () => {
        if (!newSku) {
            alert('Please provide an SKU for the variation.');
            return;
        }
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            const { data } = await axios.post(`http://localhost:5000/api/products/${id}/variations`, {
                sku: newSku,
                attributes: { type: newType },
                priceAdjustment: Number(newAdjustment),
                stockQuantity: Number(newStock)
            }, config);

            setVariations([...variations, data]);
            setNewSku('');
            setNewType('Standard');
            setNewStock(10);
            setNewAdjustment(0);
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    }

    return (
        <div className="auth-container" style={{ alignItems: 'flex-start', minHeight: '100vh', marginTop: '2rem' }}>
            <div className="auth-card" style={{ maxWidth: '800px', width: '100%' }}>
                <Link to="/admin/products" style={{ textDecoration: 'none', color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem', display: 'inline-block' }}>
                    &larr; Back to Products
                </Link>
                <h2>Edit Product</h2>

                <form onSubmit={submitHandler}>
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="basePrice">Base Price (Rs)</label>
                        <input type="number" id="basePrice" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="image">Image Path</label>
                        <input type="text" id="image" value={image} onChange={(e) => setImage(e.target.value)} />
                        <input type="file" id="image-file" label="Choose File" onChange={uploadFileHandler} style={{ marginTop: '0.8rem', padding: '0.5rem', background: '#f3f4f6' }} />
                        {uploading && <div style={{ fontSize: '0.85rem', color: '#10b981', marginTop: '0.5rem' }}>Uploading...</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="brand">Brand</label>
                        <input type="text" id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '0.8rem', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                            <option value="">Select Category...</option>
                            {categories.map(c => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="gstPercentage">GST Percentage (%)</label>
                        <input type="number" id="gstPercentage" value={gstPercentage} onChange={(e) => setGstPercentage(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem', border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '100px' }}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-btn" style={{ marginBottom: '2rem' }}>
                        Update Product Profile
                    </button>
                </form>

                <hr style={{ borderColor: '#e5e7eb', margin: '2rem 0' }} />

                <h3>Inventory Variations (SKUs)</h3>

                {variations.length > 0 ? (
                    <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                        {variations.map((v) => (
                            <div key={v._id} style={{ display: 'flex', justifyContent: 'space-between', background: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                <div>
                                    <h4 style={{ margin: 0 }}>{v.sku}</h4>
                                    <p style={{ margin: '0.2rem 0', fontSize: '0.9rem', color: '#6b7280' }}>
                                        {Object.entries(v.attributes).map(([key, val]) => `${key}: ${val}`).join(', ')}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold' }}>Stock: {v.stockQuantity}</div>
                                    <div style={{ fontSize: '0.9rem', color: v.priceAdjustment > 0 ? '#10b981' : '#6b7280' }}>
                                        {v.priceAdjustment > 0 ? `+ Rs. ${v.priceAdjustment}` : 'Base Price'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>No variations exist yet. Create one below.</p>
                )}

                <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f3f4f6', borderRadius: '8px' }}>
                    <h4 style={{ marginBottom: '1rem' }}>Add New Variation</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>SKU (e.g. SN-NB-100P)</label>
                            <input type="text" value={newSku} onChange={(e) => setNewSku(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginTop: '0.3rem' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Type (e.g. Ruled, Unruled)</label>
                            <input type="text" value={newType} onChange={(e) => setNewType(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginTop: '0.3rem' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Stock Quantity</label>
                            <input type="number" value={newStock} onChange={(e) => setNewStock(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginTop: '0.3rem' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Price Adjustment (+/- Rs)</label>
                            <input type="number" value={newAdjustment} onChange={(e) => setNewAdjustment(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginTop: '0.3rem' }} />
                        </div>
                    </div>
                    <button type="button" onClick={createVariationHandler} style={{ marginTop: '1rem', width: '100%', padding: '0.8rem', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                        + Save New Variation
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminProductEditPage;
