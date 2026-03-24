import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../api';
import { BookOpen, Pencil, Ruler, Backpack, Palette, Sparkles, TrendingUp, Filter, ChevronDown, Heart } from 'lucide-react';
import { useStore } from '../Store';
import { ProductSkeleton } from '../components/Skeleton';
import ProductCard from '../components/ProductCard';
import './HomePage.css';

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCoupons, setActiveCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchParams, setSearchParams] = useSearchParams();

    // Store context for wishlist
    const { state, dispatch } = useStore();
    const { userLogin: { userInfo } } = state;
    const wishlist = userInfo?.wishlist || [];

    // Parse URL filters (Flipkart-style global linkage)
    const keyword = searchParams.get('keyword') || '';
    const selectedCategory = searchParams.get('category') || '';
    const selectedBrand = searchParams.get('brand') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const sortBy = searchParams.get('sort') || 'newest';

    // Local state for Price inputs to prevent UI lag while typing
    const [localMin, setLocalMin] = useState(minPrice || '0');
    const [localMax, setLocalMax] = useState(maxPrice || '1000');

    // Central Filter Updater Engine
    const updateFilter = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        setSearchParams(newParams);
    };

    const clearAllFilters = () => {
        setSearchParams(new URLSearchParams());
        setLocalMin('0');
        setLocalMax('1000');
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const { data: catData } = await API.get('/api/products/categories');
                setCategories(catData);

                const { data: couponData } = await API.get('/api/coupons/active');
                setActiveCoupons(couponData);
            } catch (err) {
                console.error('Failed to fetch initial data');
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let url = `/api/products?keyword=${keyword}&sort=${sortBy}`;
                if (selectedCategory) url += `&category=${selectedCategory}`;
                if (selectedBrand) url += `&brand=${selectedBrand}`;
                if (minPrice !== '') url += `&minPrice=${minPrice}`;
                if (maxPrice !== '') url += `&maxPrice=${maxPrice}`;

                const { data } = await API.get(url);
                setProducts(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchProducts();
    }, [keyword, selectedCategory, selectedBrand, minPrice, maxPrice, sortBy]);

    const handleCategoryRailClick = (catName) => {
        const matchingCat = categories.find(c => c.name.toLowerCase().includes(catName.toLowerCase()));
        if (matchingCat) {
            updateFilter('category', matchingCat._id);
        } else {
            updateFilter('category', '');
        }
    };

    const toggleWishlistHandler = async (e, productId) => {
        e.preventDefault();
        if (!userInfo) {
            alert('Please login to add items to your wishlist.');
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await API.post('/api/users/profile/wishlist', { productId });
            dispatch({ type: 'USER_UPDATE_WISHLIST', payload: data });
        } catch (err) {
            console.error(err);
        }
    };

    // Removing staticCategories array...

    const brands = ['Classmate', 'Reynolds', 'Camlin', 'Faber-Castell', 'Doms', 'Student Note Books'];

    return (
        <div className="homepage" style={{ padding: '0 2rem' }}>
            <section className="hero">
                <div className="hero-content">
                    <span style={{ background: 'var(--accent-color)', color: 'white', padding: '0.4rem 1.2rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1.5rem', display: 'inline-block', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                        New Arrivals 2024
                    </span>
                    <h1>Premium Educational Supplies, <span style={{ color: 'var(--primary-color)' }}>Delivered.</span></h1>
                    <p>Elevate your learning experience with high-quality notebooks, custom designs, and professional stationery from Student Note Books, Erode.</p>
                    <button className="cta-btn" onClick={() => (window.location.href = '#products')}>Shop Collection Now</button>
                    <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem', color: '#4b5563', fontSize: '0.9rem', fontWeight: 600 }}>
                        <span>🚚 Free Shipping</span>
                        <span>⚡ Rapid Delivery</span>
                        <span>💎 Premium Quality</span>
                    </div>
                </div>
            </section>

            <section className="category-nav-wrapper">
                {categories.map((cat, i) => {
                    // Match icon based on name if possible
                    let Icon = BookOpen;
                    if (cat.name.toLowerCase().includes('pen')) Icon = Pencil;
                    if (cat.name.toLowerCase().includes('ruler') || cat.name.toLowerCase().includes('geometry')) Icon = Ruler;
                    if (cat.name.toLowerCase().includes('bag')) Icon = Backpack;
                    if (cat.name.toLowerCase().includes('art') || cat.name.toLowerCase().includes('palette')) Icon = Palette;

                    return (
                        <div key={cat._id} className="category-item" onClick={() => updateFilter('category', cat._id)}>
                            <div className="category-icon-circle">
                                <Icon size={32} />
                            </div>
                            <span className="category-name">{cat.name}</span>
                        </div>
                    );
                })}
            </section>

            {/* 🎟️ Promo Coupon Banners */}
            {activeCoupons.length > 0 && (
                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', margin: '1.5rem 0' }}>
                    {activeCoupons.slice(0, 3).map((coupon, idx) => {
                        const colors = [
                            { bg: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', label: 'Indigo' },
                            { bg: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', label: 'Cyan' },
                            { bg: 'linear-gradient(135deg, #059669 0%, #047857 100%)', label: 'Green' }
                        ];
                        const promo = colors[idx % colors.length];

                        return (
                            <div key={coupon.code} style={{ background: promo.bg, borderRadius: '12px', padding: '1.2rem 1.5rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', cursor: 'default', transition: 'transform 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                                        {coupon.discountType === 'percentage' ? `${coupon.discountAmount}% OFF` : `Rs. ${coupon.discountAmount} OFF`}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>Min order Rs. {coupon.minOrderAmount}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.8, marginBottom: '4px' }}>USE CODE</div>
                                    <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '2px', background: 'rgba(255,255,255,0.25)', padding: '4px 12px', borderRadius: '6px', border: '1px dashed rgba(255,255,255,0.6)', cursor: 'pointer' }}
                                        onClick={() => { navigator.clipboard?.writeText(coupon.code); alert(`Code "${coupon.code}" copied!`); }}
                                        title="Click to copy"
                                    >
                                        {coupon.code}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </section>
            )}

            <div className="store-layout" id="products" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2.5rem', marginTop: '2rem' }}>
                {/* Sidebar Filters */}
                <aside className="sidebar-filters" style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Filter size={20} style={{ color: 'var(--primary-color)' }} />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--secondary-color)', margin: 0 }}>Filters</h3>
                            </div>
                            <button
                                onClick={clearAllFilters}
                                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', padding: '4px 8px', borderRadius: '6px' }}
                                onMouseOver={e => e.currentTarget.style.background = '#f5f3ff'}
                                onMouseOut={e => e.currentTarget.style.background = 'none'}
                            >Clear All</button>
                        </div>

                        <div style={{ padding: '1.5rem' }}>
                            <div className="filter-group" style={{ marginBottom: '2rem' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--secondary-color)', marginBottom: '1rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price Range</label>
                                <div className="price-inputs" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>₹</span>
                                        <input type="number" placeholder="Min" value={localMin} onChange={(e) => setLocalMin(e.target.value)} onBlur={() => updateFilter('minPrice', localMin)} style={{ width: '100%', padding: '10px 10px 10px 25px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', fontWeight: 600 }} />
                                    </div>
                                    <span style={{ color: '#94a3b8' }}>-</span>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>₹</span>
                                        <input type="number" placeholder="Max" value={localMax} onChange={(e) => setLocalMax(e.target.value)} onBlur={() => updateFilter('maxPrice', localMax)} style={{ width: '100%', padding: '10px 10px 10px 25px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', fontWeight: 600 }} />
                                    </div>
                                </div>
                            </div>

                            <div className="filter-group" style={{ marginBottom: '2rem' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--secondary-color)', marginBottom: '1rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => updateFilter('category', e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--secondary-color)', marginBottom: '1rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Brand</label>
                                <div className="brand-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {brands.map(b => (
                                        <label key={b} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', group: 'brand' }}>
                                            <input
                                                type="radio"
                                                name="brand"
                                                checked={selectedBrand === b}
                                                onChange={() => updateFilter('brand', b)}
                                                style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                                            />
                                            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: selectedBrand === b ? 'var(--primary-color)' : 'var(--text-main)' }}>{b}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', borderRadius: '16px', padding: '1.5rem', color: 'white', textAlign: 'center' }}>
                        <BookOpen size={32} style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 800 }}>Need Custom Books?</h4>
                        <p style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '1.2rem', lineHeight: 1.5 }}>Get personalized notebooks for your school or office.</p>
                        <button style={{ width: '100%', padding: '10px', borderRadius: '10px', border: 'none', background: 'white', color: 'var(--primary-color)', fontWeight: 800, cursor: 'pointer' }}>Contact Us</button>
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
                            <select value={sortBy} onChange={(e) => updateFilter('sort', e.target.value)}>
                                <option value="newest">Newest First</option>
                                <option value="priceLow">Price: Low to High</option>
                                <option value="priceHigh">Price: High to Low</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="products-grid">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <ProductSkeleton key={n} />)}
                        </div>
                    ) : error ? (
                        <div className="error" style={{ padding: '2rem', background: '#fee2e2', borderRadius: '12px', color: '#dc2626' }}>{error}</div>
                    ) : products.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 2rem', background: '#f9fafb', borderRadius: '16px', border: '1px dashed #e5e7eb' }}>
                            <Sparkles size={48} style={{ color: 'var(--primary-color)', marginBottom: '1rem' }} />
                            <h3 style={{ marginBottom: '0.5rem' }}>No products found {keyword && `for "${keyword}"`}</h3>
                            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Try adjusting filters or explore our popular categories below.</p>
                            <button onClick={clearAllFilters} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '0.7rem 1.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, marginBottom: '2rem' }}>
                                Clear All Filters
                            </button>
                            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                {categories.map((cat, i) => (
                                    <button key={i} onClick={() => updateFilter('category', cat._id)} style={{ background: 'white', border: '1px solid #e5e7eb', padding: '0.5rem 1rem', borderRadius: '50px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', transition: 'all 0.2s' }}
                                        onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                                        onMouseOut={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                                    >
                                        <BookOpen size={14} /> {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="product-grid">
                            {products.map((p) => (
                                <ProductCard key={p._id} product={p} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default HomePage;
