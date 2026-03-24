import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../api';
import { useStore } from '../Store';
import toast from 'react-hot-toast';
import './AuthPages.css';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { state, dispatch } = useStore();
    const { userLogin } = state;

    const rawRedirect = location.search ? location.search.split('=')[1] : '/';
    const redirect = rawRedirect.startsWith('/') ? rawRedirect : `/${rawRedirect}`;

    useEffect(() => {
        if (userLogin.userInfo) {
            navigate(redirect);
        }
    }, [navigate, userLogin.userInfo, redirect]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await API.post('/api/users/login', { email, password });
            dispatch({ type: 'USER_LOGIN', payload: data });
            toast.success(`Welcome back, ${data.name}!`);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            toast.error(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%)', minHeight: '90vh' }}>
            <div className="auth-card" style={{ padding: '3.5rem', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', maxWidth: '480px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <img src="/navbar_logo.png" alt="Student Note Books Logo" style={{ height: '90px', margin: '0 auto 1.5rem', display: 'block', objectFit: 'contain' }} />
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary-color)', marginBottom: '0.5rem' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Please enter your details to sign in</p>
                </div>

                {error && (
                    <div className="auth-error" style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 600 }}>
                        {error}
                    </div>
                )}

                <form onSubmit={submitHandler}>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="email" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--secondary-color)', marginBottom: '8px', display: 'block' }}>Email Address</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ height: '52px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '1rem' }}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label htmlFor="password" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--secondary-color)', marginBottom: '8px', display: 'block' }}>Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ height: '52px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '1rem' }}
                        />
                    </div>
                    <div style={{ textAlign: 'right', marginBottom: '2rem' }}>
                        <Link to="/forgotpassword" style={{ color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>Forgot password?</Link>
                    </div>
                    <button type="submit" className="auth-btn" disabled={loading} style={{ height: '54px', borderRadius: '12px', fontSize: '1rem', background: 'var(--primary-color)', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}>
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-redirect" style={{ marginTop: '2.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                    Don't have an account? <Link to={redirect ? `/register?redirect=${redirect}` : '/register'} style={{ fontWeight: 800 }}>Create an account</Link>
                </div>
            </div>
        </div>
    );
};

export const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { state, dispatch } = useStore();
    const { userLogin } = state;

    const rawRedirect = location.search ? location.search.split('=')[1] : '/';
    const redirect = rawRedirect.startsWith('/') ? rawRedirect : `/${rawRedirect}`;

    useEffect(() => {
        if (userLogin.userInfo) {
            navigate(redirect);
        }
    }, [navigate, userLogin.userInfo, redirect]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const { data } = await API.post('/api/users/register', { name, email, phone, password });
            dispatch({ type: 'USER_LOGIN', payload: data });
            toast.success(`Account created! Welcome, ${data.name}!`);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            toast.error(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%)', minHeight: '100vh', padding: '4rem 2rem' }}>
            <div className="auth-card" style={{ padding: '3.5rem', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', maxWidth: '520px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <img src="/navbar_logo.png" alt="Student Note Books Logo" style={{ height: '90px', margin: '0 auto 1.5rem', display: 'block', objectFit: 'contain' }} />
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary-color)', marginBottom: '0.5rem' }}>Create Account</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Join Student Note Books today</p>
                </div>

                {error && (
                    <div className="auth-error" style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 600 }}>
                        {error}
                    </div>
                )}

                <form onSubmit={submitHandler}>
                    <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                        <label htmlFor="name" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary-color)', marginBottom: '6px', display: 'block' }}>Full Name</label>
                        <input
                            type="text"
                            id="name"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{ height: '50px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label htmlFor="email" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary-color)', marginBottom: '6px', display: 'block' }}>Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="name@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ height: '50px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label htmlFor="phone" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary-color)', marginBottom: '6px', display: 'block' }}>Phone</label>
                            <input
                                type="tel"
                                id="phone"
                                placeholder="10-digit number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                style={{ height: '50px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                            />
                        </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                        <label htmlFor="password" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary-color)', marginBottom: '6px', display: 'block' }}>Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="At least 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ height: '50px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label htmlFor="confirmPassword" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary-color)', marginBottom: '6px', display: 'block' }}>Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            placeholder="Repeat password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            style={{ height: '50px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                        />
                    </div>
                    <button type="submit" className="auth-btn" disabled={loading} style={{ height: '54px', borderRadius: '12px', background: 'var(--accent-color)', boxShadow: '0 4px 12px rgba(251, 100, 27, 0.2)' }}>
                        {loading ? 'Creating Account...' : 'Register Now'}
                    </button>
                </form>

                <div className="auth-redirect" style={{ marginTop: '2.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                    Already have an account? <Link to={redirect ? `/login?redirect=${redirect}` : '/login'} style={{ fontWeight: 800 }}>Sign In</Link>
                </div>
            </div>
        </div>
    );
};
