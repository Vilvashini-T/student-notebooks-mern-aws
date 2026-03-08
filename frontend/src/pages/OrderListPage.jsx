import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../Store';
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
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };

                const { data } = await axios.get('http://localhost:5000/api/orders', config);
                setOrders(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        fetchOrders();
    }, [userInfo, navigate]);

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Orders Management Dashboard</h1>
                <span className="role-badge">{userInfo.role}</span>
            </div>

            {loading ? (
                <div>Loading orders...</div>
            ) : error ? (
                <div className="error-box">{error}</div>
            ) : (
                <div className="table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>CUSTOMER</th>
                                <th>DATE</th>
                                <th>TOTAL</th>
                                <th>PAID</th>
                                <th>STATUS</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    <td>{order._id.substring(18, 24)}</td>
                                    <td>{order.user && order.user.name}</td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>Rs. {order.totalPrice}</td>
                                    <td>
                                        {order.isPaid ? (
                                            <span className="status-success">Yes</span>
                                        ) : (
                                            <span className="status-fail">No</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`order-status badge-${order.orderStatus.toLowerCase()}`}>
                                            {order.orderStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <Link to={`/order/${order._id}`} className="btn-details">
                                            Details / Process
                                        </Link>
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

export default OrderListPage;
