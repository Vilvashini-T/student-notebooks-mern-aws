import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { useStore } from '../Store';
import toast from 'react-hot-toast';
import './AuthPages.css';

const ResetPasswordPage = () => {
    const { resettoken } = useParams();
    const navigate = useNavigate();
    const { dispatch } = useStore();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submitHandler = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        try {
            const { data } = await API.put(`/api/users/resetpassword/${resettoken}`, { password });

            // Automatically log them in with the new token
            dispatch({ type: 'USER_LOGIN', payload: data });
            localStorage.setItem('userInfo', JSON.stringify(data));

            toast.success('Password reset successfully!');
            setMessage('Password reset successfully. Redirecting...');
            setTimeout(() => {
                navigate('/');
            }, 2000);

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
                <h2>Set New Password</h2>
                <p style={{ marginBottom: '1.5rem', color: '#666', textAlign: 'center', fontSize: '0.95rem' }}>
                    Enter your new secure password below.
                </p>

                {message && <div className="success-message" style={{ background: '#d1fae5', color: '#065f46', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{message}</div>}
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={submitHandler}>
                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Processing...' : 'Reset Password'}
                    </button>

                    <div className="auth-footer">
                        Remembered your password? <Link to="/login">Login Here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
