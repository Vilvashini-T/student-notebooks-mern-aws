import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import { Search, ShoppingCart, User, LogOut } from 'lucide-react';
import { useStore } from '../Store';
import './Navbar.css';
import './Navbar2.css';

const Navbar = () => {
    const { state, dispatch } = useStore();
    const { cart, userLogin } = state;
    const [keyword, setKeyword] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showAdminDropdown, setShowAdminDropdown] = useState(false);
    const navigate = useNavigate();

    const submitHandler = (e) => {
        if (e) e.preventDefault();
        setShowSuggestions(false);
        if (keyword.trim()) {
            navigate(`/?keyword=${keyword}`);
        } else {
            navigate('/');
        }
    };

    const fetchSuggestions = async (q) => {
        if (!q.trim()) {
            setSuggestions([]);
            return;
        }
        try {
            const { data } = await API.get(`/api/products/suggestions?q=${q}`);
            setSuggestions(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setKeyword(value);
        fetchSuggestions(value);
    };

    const handleLogout = () => {
        dispatch({ type: 'USER_LOGOUT' });
        navigate('/login');
    };

    return (
        <header className="navbar" style={{ background: 'white', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 1000, padding: '0.8rem 0' }}>
            <div className="navbar-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
                <Link to="/" className="navbar-brand" style={{ flexShrink: 0, textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <img src="/navbar_logo.png" alt="Student Note Books Logo" style={{ height: '130px', width: 'auto', objectFit: 'contain', margin: '-40px 0 -40px 20px' }} />
                    </div>
                </Link>

                <div className="search-container" style={{ position: 'relative', flex: 1, maxWidth: '600px' }}>
                    <form className="navbar-search" onSubmit={submitHandler} style={{ position: 'relative', width: '100%' }}>
                        <input
                            type="text"
                            placeholder="Search for books, pens, geography tools..."
                            value={keyword}
                            onChange={handleInputChange}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            style={{ width: '100%', height: '48px', padding: '0 50px 0 20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: 600, transition: 'all 0.2s' }}
                        />
                        <button type="submit" style={{ position: 'absolute', right: '5px', top: '5px', height: '38px', width: '38px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <Search size={18} />
                        </button>
                    </form>

                    {showSuggestions && suggestions.length > 0 && (
                        <div className="search-suggestions" style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', borderRadius: '12px', boxShadow: '0 15px 30px -5px rgba(0,0,0,0.1)', marginTop: '8px', border: '1px solid #f1f5f9', padding: '0.5rem' }}>
                            {suggestions.map((s, i) => (
                                <div key={i} className="suggestion-item" onClick={() => { setKeyword(s); navigate(`/?keyword=${s}`); }} style={{ padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                    <Search size={14} style={{ opacity: 0.4 }} />
                                    {s}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <nav className="navbar-links" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0, marginRight: '30px' }}>
                    <Link to="/cart" className="nav-link" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary-color)', fontWeight: 700, textDecoration: 'none' }}>
                        <ShoppingCart size={22} />
                        <span style={{ fontSize: '0.95rem' }}>Cart</span>
                        {cart.cartItems.length > 0 && (
                            <span style={{ position: 'absolute', top: '-8px', left: '12px', background: '#ef4444', color: 'white', fontSize: '0.7rem', fontWeight: 900, height: '18px', minWidth: '18px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', border: '2px solid white' }}>
                                {cart.cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                            </span>
                        )}
                    </Link>

                    {userLogin.userInfo ? (
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px 12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
                                onMouseEnter={() => userLogin.userInfo.role === 'admin' && setShowAdminDropdown(true)}
                                onMouseLeave={() => setShowAdminDropdown(false)}
                            >
                                <div style={{ background: 'var(--primary-color)', width: '30px', height: '30px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 800 }}>
                                    {userLogin.userInfo.name.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--secondary-color)' }}>{userLogin.userInfo.name.split(' ')[0]}</span>

                                {userLogin.userInfo.role === 'admin' && (
                                    <div style={{ position: 'relative' }}>
                                        {showAdminDropdown && (
                                            <div style={{ position: 'absolute', top: '100%', right: '-12px', width: '220px', background: 'white', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9', marginTop: '15px', overflow: 'hidden', padding: '8px' }}>
                                                <div style={{ padding: '10px 15px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Panel</div>
                                                <Link to="/admin/dashboard" className="dropdown-item" style={{ padding: '12px 15px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '10px', textDecoration: 'none', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600 }}>Dashboard</Link>
                                                <Link to="/admin/orders" className="dropdown-item" style={{ padding: '12px 15px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '10px', textDecoration: 'none', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600 }}>Manage Orders</Link>
                                                <Link to="/admin/products" className="dropdown-item" style={{ padding: '12px 15px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '10px', textDecoration: 'none', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600 }}>Products Inventory</Link>
                                                <Link to="/admin/categories" className="dropdown-item" style={{ padding: '12px 15px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '10px', textDecoration: 'none', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600 }}>Categories</Link>
                                                <Link to="/admin/coupons" className="dropdown-item" style={{ padding: '12px 15px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '10px', textDecoration: 'none', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600 }}>Coupons</Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {userLogin.userInfo.role !== 'admin' && (
                                <Link to="/myorders" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--secondary-color)', textDecoration: 'none' }}>Orders</Link>
                            )}

                            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center' }} title="Logout">
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--primary-color)', color: 'white', padding: '10px 20px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}>
                            <User size={18} />
                            <span>Sign In</span>
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
