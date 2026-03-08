import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../Store';
import { Plus, Edit, Trash2 } from 'lucide-react';
import './Admin.css';

const AdminProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { state } = useStore();
    const { userLogin: { userInfo } } = state;
    const navigate = useNavigate();

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/products');
            setProducts(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!userInfo || userInfo.role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchProducts();
    }, [userInfo, navigate]);

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to deactivate this product?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                await axios.delete(`http://localhost:5000/api/products/${id}`, config);
                fetchProducts();
            } catch (err) {
                alert(err.response?.data?.message || err.message);
            }
        }
    };

    const createProductHandler = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            // Passing default generic info to create a placeholder product first
            const { data } = await axios.post('http://localhost:5000/api/products', {
                name: 'Sample Product ' + Date.now(),
                basePrice: 0,
                description: 'Sample description',
                brand: 'Student Note Books',
                gstPercentage: 18,
                slug: 'sample-product-' + Date.now()
            }, config);
            navigate(`/admin/product/${data._id}/edit`);
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Products Inventory</h1>
                <button className="auth-btn" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }} onClick={createProductHandler}>
                    <Plus size={18} /> Create Product
                </button>
            </div>

            {loading ? (
                <div>Loading products...</div>
            ) : error ? (
                <div className="error-box">{error}</div>
            ) : (
                <div className="table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>NAME</th>
                                <th>BASE PRICE</th>
                                <th>CATEGORY</th>
                                <th>BRAND</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product._id}>
                                    <td>{product._id.substring(18, 24)}</td>
                                    <td>{product.name}</td>
                                    <td>Rs. {product.basePrice}</td>
                                    <td>{product.category?.name || 'Uncategorized'}</td>
                                    <td>{product.brand}</td>
                                    <td style={{ display: 'flex', gap: '10px' }}>
                                        <Link to={`/admin/product/${product._id}/edit`} className="btn-details" style={{ padding: '0.4rem', background: '#f3f4f6', color: '#374151' }}>
                                            <Edit size={16} />
                                        </Link>
                                        <button onClick={() => deleteHandler(product._id)} className="cart-delete-btn" style={{ padding: '0.4rem' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminProductListPage;
