import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../Store';
import { Plus, Trash2 } from 'lucide-react';
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
            const { data } = await axios.get('http://localhost:5000/api/products/categories');
            setCategories(data);
            setLoading(false);
        } catch (err) {
            alert(err.message);
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
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            await axios.post('http://localhost:5000/api/products/categories', { name, description }, config);
            setName('');
            setDescription('');
            fetchCategories();
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    return (
        <div className="auth-container" style={{ alignItems: 'flex-start', minHeight: '100vh', marginTop: '2rem' }}>
            <div className="auth-card" style={{ maxWidth: '800px', width: '100%' }}>
                <h2>Category Management</h2>

                <form onSubmit={submitHandler} style={{ marginBottom: '3rem', background: '#f9fafb', padding: '1.5rem', borderRadius: '12px' }}>
                    <h3>Add New Category</h3>
                    <div className="form-group">
                        <label>Category Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g., Drawing Books" />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Brief description..." />
                    </div>
                    <button type="submit" className="auth-btn" style={{ width: 'auto', padding: '0.8rem 2rem' }}>
                        <Plus size={18} style={{ marginRight: '8px' }} /> Create Category
                    </button>
                </form>

                <h3>Existing Categories</h3>
                {loading ? <p>Loading...</p> : (
                    <div className="table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>NAME</th>
                                    <th>DESCRIPTION</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map(cat => (
                                    <tr key={cat._id}>
                                        <td style={{ fontWeight: 700 }}>{cat.name}</td>
                                        <td>{cat.description}</td>
                                        <td>
                                            <button className="cart-delete-btn" style={{ padding: '0.4rem' }} title="Delete feature in progress">
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
        </div>
    );
};

export default AdminCategoryPage;
