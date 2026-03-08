import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, LogOut } from 'lucide-react';
import { useStore } from '../Store';
import './Navbar.css';
import './Navbar2.css';

const Navbar = () => {
    const { state, dispatch } = useStore();
    const { cart, userLogin } = state;
    const [keyword, setKeyword] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions] = useState(['Long Size Notebook', 'Unruled King Size', '172 Pages Notebook', 'Drawing Book', 'Graph Note']);
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

    const handleLogout = () => {
        dispatch({ type: 'USER_LOGOUT' });
        navigate('/login');
    };

    return (
        <header className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <span className="brand-highlight">Student</span> Note Books
                </Link>

                <div className="search-container" style={{ position: 'relative', flex: 0.55 }}>
                    <form className="navbar-search" onSubmit={submitHandler} onFocus={() => setShowSuggestions(true)}>
                        <input
                            type="text"
                            placeholder="Try 'King Size Notebook'..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        />
                        <button type="submit" className="search-btn">
                            <Search size={18} />
                        </button>
                    </form>

                    {showSuggestions && (
                        <div className="search-suggestions">
                            <div className="suggestion-header">POPULAR SEARCHES</div>
                            {suggestions.map((s, i) => (
                                <div key={i} className="suggestion-item" onClick={() => { setKeyword(s); navigate(`/?keyword=${s}`); }}>
                                    <Search size={14} style={{ marginRight: '10px', opacity: 0.5 }} />
                                    {s}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <nav className="navbar-links">
                    <Link to="/cart" className="nav-link cart-link">
                        <ShoppingCart size={24} />
                        {cart.cartItems.length > 0 && (
                            <span className="cart-badge">{cart.cartItems.reduce((acc, item) => acc + item.quantity, 0)}</span>
                        )}
                    </Link>

                    {userLogin.userInfo ? (
                        <div className="nav-user-menu">
                            <span className="nav-greeting">Hi, {userLogin.userInfo.name.split(' ')[0]}</span>
                            {userLogin.userInfo.role === 'admin' && (
                                <Link to="/admin/orders" className="nav-link dashboard-link" style={{ marginRight: '10px' }}>
                                    Orders
                                </Link>
                            )}
                            {userLogin.userInfo.role === 'admin' && (
                                <Link to="/admin/products" className="nav-link dashboard-link" style={{ background: 'var(--accent-color)', color: 'white', marginRight: '10px', padding: '0.4rem 0.8rem', borderRadius: '8px' }}>
                                    Inventory
                                </Link>
                            )}
                            {userLogin.userInfo.role === 'admin' && (
                                <Link to="/admin/categories" className="nav-link dashboard-link" style={{ marginRight: '10px' }}>
                                    Categories
                                </Link>
                            )}
                            <button onClick={handleLogout} className="nav-link logout-btn" title="Logout">
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="nav-link user-link">
                            <User size={24} />
                            <span>Sign In</span>
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
