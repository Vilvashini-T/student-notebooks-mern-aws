import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import toast from 'react-hot-toast';
import './AuthPages.css';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submitHandler = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);
        try {
            const { data } = await API.post('/api/users/forgotpassword', { email });
            setMessage(data.message || 'Email sent successfully.');
            toast.success('Reset link sent to your email!');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            toast.error(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Forgot Password</h2>
                <p style={{ marginBottom: '1.5rem', color: '#666', textAlign: 'center', fontSize: '0.95rem' }}>
                    Enter your email address and we will send you a link to reset your password.
                </p>

                {message && <div className="success-message" style={{ background: '#d1fae5', color: '#065f46', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{message}</div>}
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={submitHandler}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>

                    <div className="auth-footer">
                        Remembered your password? <Link to="/login">Login Here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
