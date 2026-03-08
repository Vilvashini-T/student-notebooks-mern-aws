import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, Pencil, Ruler, Backpack, Palette, Sparkles, TrendingUp, Filter, ChevronDown } from 'lucide-react';
import './HomePage.css';

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
    const [sortBy, setSortBy] = useState('newest');

    const location = useLocation();
    const keyword = new URLSearchParams(location.search).get('keyword') || '';

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const { data: catData } = await axios.get('http://localhost:5000/api/products/categories');
                setCategories(catData);
            } catch (err) {
                console.error('Failed to fetch categories');
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let url = `http://localhost:5000/api/products?keyword=${keyword}&sort=${sortBy}`;
                if (selectedCategory) url += `&category=${selectedCategory}`;
                if (selectedBrand) url += `&brand=${selectedBrand}`;
                if (priceRange.min !== '') url += `&minPrice=${priceRange.min}`;
                if (priceRange.max !== '') url += `&maxPrice=${priceRange.max}`;

                const { data } = await axios.get(url);
                setProducts(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchProducts();
    }, [keyword, selectedCategory, selectedBrand, priceRange, sortBy]);

    const handleCategoryRailClick = (catName) => {
        const matchingCat = categories.find(c => c.name.toLowerCase().includes(catName.toLowerCase()));
        if (matchingCat) {
            setSelectedCategory(matchingCat._id);
        } else {
            setSelectedCategory('');
        }
    };

    const staticCategories = [
        { name: 'Notebooks', icon: BookOpen },
        { name: 'Pens & Pencils', icon: Pencil },
        { name: 'Geometry', icon: Ruler },
        { name: 'Bags', icon: Backpack },
        { name: 'Art Supplies', icon: Palette }
    ];

    const brands = ['Classmate', 'Reynolds', 'Camlin', 'Faber-Castell', 'Doms', 'Student Note Books'];

    return (
        <div className="homepage" style={{ padding: '0 2rem' }}>
            <section className="hero">
                <div className="hero-content">
                    <span style={{ background: 'var(--accent-color)', color: 'white', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', display: 'inline-block' }}>
                        New Arrivals 2024
                    </span>
                    <h1>Premium Educational Supplies, <span style={{ color: 'var(--primary-color)' }}>Delivered.</span></h1>
                    <p>Elevate your learning experience with high-quality notebooks, pens, and accessories from Student Note Books, Erode.</p>
                    <button className="cta-btn">Shop Collection Now</button>
                    <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem', color: '#4b5563', fontSize: '0.9rem', fontWeight: 600 }}>
                        <span>🚚 Free Shipping</span>
                        <span>⚡ Rapid Delivery</span>
                        <span>💎 Premium Quality</span>
                    </div>
                </div>
            </section>

            <section className="category-nav-wrapper">
                {staticCategories.map((cat, i) => (
                    <div key={i} className="category-item" onClick={() => handleCategoryRailClick(cat.name)}>
                        <div className="category-icon-circle">
                            <cat.icon size={32} />
                        </div>
                        <span className="category-name">{cat.name}</span>
                    </div>
                ))}
            </section>

            <div className="store-layout">
                {/* Sidebar Filters */}
                <aside className="sidebar-filters">
                    <div className="filter-group">
                        <div className="filter-header">
                            <Filter size={18} />
                            <h3>Filters</h3>
                            <button className="clear-all" onClick={() => {
                                setSelectedCategory('');
                                setSelectedBrand('');
                                setPriceRange({ min: 0, max: 1000 });
                            }}>Clear All</button>
                        </div>
                    </div>

                    <div className="filter-group">
                        <label>Price Range (Rs.)</label>
                        <div className="price-inputs">
                            <input type="number" placeholder="Min" value={priceRange.min} onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })} />
                            <span>-</span>
                            <input type="number" placeholder="Max" value={priceRange.max} onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })} />
                        </div>
                    </div>

                    <div className="filter-group">
                        <label>Categories</label>
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Brands</label>
                        <div className="brand-list">
                            {brands.map(b => (
                                <div key={b} className="brand-item">
                                    <input
                                        type="radio"
                                        name="brand"
                                        id={b}
                                        checked={selectedBrand === b}
                                        onChange={() => setSelectedBrand(b)}
                                    />
                                    <label htmlFor={b}>{b}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Product Section */}
                <section className="featured-categories" style={{ paddingTop: 0, flex: 1 }}>
                    <div className="products-header">
                        <h2 className="section-title" style={{ margin: 0 }}>
                            <TrendingUp style={{ color: 'var(--primary-color)' }} />
                            {keyword ? `Results for "${keyword}"` : 'Latest Arrivals'}
                        </h2>
                        <div className="sort-wrapper">
                            <span>Sort By: </span>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="newest">Newest First</option>
                                <option value="priceLow">Price: Low to High</option>
                                <option value="priceHigh">Price: High to Low</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loader">Loading Products...</div>
                    ) : error ? (
                        <div className="error" style={{ padding: '2rem', background: '#fee2e2', borderRadius: '12px', color: '#dc2626' }}>{error}</div>
                    ) : products.length === 0 ? (
                        <div className="no-products">
                            <Sparkles size={48} style={{ color: 'var(--primary-color)', marginBottom: '1rem' }} />
                            <h3>No products found matching your filters</h3>
                            <p>Try clearing your filters or searching for something else.</p>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {products.map(product => (
                                <div key={product._id} className="product-card">
                                    <Link to={`/product/${product._id}`} className="product-image-container" style={{ position: 'relative' }}>
                                        <img src={product.images[0] || 'https://via.placeholder.com/300x400?text=No+Image'} alt={product.name} className="product-image" />
                                        {product.basePrice < 60 && (
                                            <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--accent-color)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>BEST VALUE</span>
                                        )}
                                    </Link>
                                    <div className="product-info">
                                        <span className="product-category" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Sparkles size={12} style={{ color: 'var(--primary-color)' }} />
                                            {product.category?.name || 'Academic Supply'}
                                        </span>
                                        <Link to={`/product/${product._id}`} className="product-name" style={{ textDecoration: 'none' }}>
                                            <h3 style={{ fontSize: '1.2rem', margin: '0.5rem 0' }}>{product.name}</h3>
                                        </Link>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                            <div className="product-price" style={{ color: 'var(--primary-color)', fontSize: '1.3rem' }}>Rs. {product.basePrice}</div>
                                            <Link to={`/product/${product._id}`} style={{ background: 'var(--accent-color)', color: 'white', padding: '0.5rem 1.2rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 800, fontSize: '0.9rem', boxShadow: '0 4px 10px rgba(56, 178, 172, 0.3)' }}>
                                                ADD +
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default HomePage;
