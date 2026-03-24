import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../api';
import { useStore } from '../Store';
import { ShoppingCart, ArrowLeft, Star, Heart, Zap } from 'lucide-react';
import { ProductSkeleton } from '../components/Skeleton';
import toast from 'react-hot-toast';
import './ProductPage.css';

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state, dispatch } = useStore();

    const [productData, setProductData] = useState(null);
    const [selectedVariation, setSelectedVariation] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [similarProducts, setSimilarProducts] = useState([]);

    // Review State
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [reviewSuccess, setReviewSuccess] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await API.get(`/api/products/${id}`);
                setProductData(data);
                if (data.variations && data.variations.length > 0) {
                    setSelectedVariation(data.variations[0]);
                }

                // Fetch similar products
                try {
                    const { data: similarData } = await API.get(`/api/products/${id}/similar`);
                    setSimilarProducts(similarData);
                } catch (simErr) {
                    console.error("Could not fetch similar products", simErr);
                }

                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const addToCartHandler = (quiet = false) => {
        if (!productData || !selectedVariation) return;
        const pricePaid = productData.product.basePrice + selectedVariation.priceAdjustment;
        dispatch({
            type: 'CART_ADD_ITEM',
            payload: {
                product: productData.product._id,
                variation: selectedVariation._id,
                name: productData.product.name,
                sku: selectedVariation.sku,
                attributes: selectedVariation.attributes,
                pricePaid: pricePaid,
                gstPercentage: productData.product.gstPercentage,
                gstAmountPaid: Number((pricePaid * (productData.product.gstPercentage / 100)).toFixed(2)),
                quantity: quantity,
                image: API.getImageUrl(productData.product.images[0])
            }
        });
        if (!quiet) {
            toast.success('Added to cart!');
            navigate('/cart');
        }
    };

    const buyNowHandler = () => {
        addToCartHandler(true);
        navigate('/shipping');
    };

    const toggleWishlist = async () => {
        if (!state.userLogin.userInfo) {
            toast.error('Please login to use wishlist');
            navigate('/login');
            return;
        }
        try {
            const { data } = await API.post('/api/users/profile/wishlist', { productId: productData.product._id });
            dispatch({ type: 'USER_UPDATE_WISHLIST', payload: data });
            toast.success('Wishlist updated');
        } catch (err) {
            toast.error('Failed to update wishlist');
        }
    };

    // Reset quantity when a new variation is selected
    useEffect(() => {
        if (selectedVariation) {
            setQuantity(1);
        }
    }, [selectedVariation]);

    const handleQuantityChange = (e) => {
        setQuantity(parseInt(e.target.value, 10));
    };

    const submitReviewHandler = async (e) => {
        e.preventDefault();
        if (!state.userLogin.userInfo) {
            alert('Please login to submit a review.');
            return;
        }

        try {
            await API.post(`/api/products/${id}/reviews`, { rating, comment });
            setReviewSuccess(true);
            setRating(5);
            setComment('');

            // Refetch product data cleanly
            const { data } = await API.get(`/api/products/${id}`);
            setProductData(data);
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };
    if (loading) return (
        <div className="product-page-container">
            <div className="product-details-grid">
                <ProductSkeleton />
                <div className="product-info-section">
                    <ProductSkeleton />
                </div>
            </div>
        </div>
    );
    if (error) return <div className="error-container"><h2>{error}</h2><Link to="/">Go Back</Link></div>;
    if (!productData) return null;

    const { product, variations } = productData;
    const currentPrice = product.basePrice + (selectedVariation ? selectedVariation.priceAdjustment : 0);

    return (
        <div className="product-page-container">
            <nav className="breadcrumbs" style={{ padding: '1rem 0', display: 'flex', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
                <span>/</span>
                <Link to={`/?category=${product.category?._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{product.category?.name || 'Category'}</Link>
                <span>/</span>
                <span style={{ color: 'var(--secondary-color)', fontWeight: 600 }}>{product.name}</span>
            </nav>

            <div className="product-details-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1.2fr', gap: '3rem', alignItems: 'start' }}>
                <div className="product-image-section" style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                            src={API.getImageUrl(product.images[0])}
                            alt={product.name}
                            style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
                            className="main-product-image"
                        />
                    </div>
                </div>

                <div className="product-info-section" style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div className="brand-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '1px' }}>{product.brand}</span>
                            <span style={{ marginLeft: '12px', background: '#f5f3ff', color: 'var(--primary-color)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>✔ QUALITY ASSURED</span>
                        </div>
                        <button
                            onClick={toggleWishlist}
                            style={{ background: '#f8fafc', border: 'none', cursor: 'pointer', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                        >
                            <Heart
                                size={24}
                                fill={state.userLogin.userInfo?.wishlist?.includes(product._id) ? '#ef4444' : 'none'}
                                color={state.userLogin.userInfo?.wishlist?.includes(product._id) ? '#ef4444' : '#94a3b8'}
                            />
                        </button>
                    </div>

                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary-color)', marginBottom: '1.2rem', lineHeight: 1.2 }}>{product.name}</h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                        <div style={{ background: '#10b981', color: 'white', padding: '4px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', fontSize: '1rem', fontWeight: 800 }}>
                            {product.averageRating > 0 ? product.averageRating.toFixed(1) : 'New'} <Star size={16} fill="white" style={{ marginLeft: '6px' }} />
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600 }}>
                            {product.numOfReviews} Ratings & Reviews
                        </span>
                    </div>

                    <div style={{ background: '#f8fbfc', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--secondary-color)' }}>Rs. {currentPrice.toFixed(2)}</span>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '1rem' }}>Rs. {(currentPrice * 1.4).toFixed(0)}</span>
                                <span style={{ color: '#16a34a', fontWeight: 800, fontSize: '0.9rem' }}>40% SPECIAL DISCOUNT</span>
                            </div>
                        </div>
                        <div style={{ color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 700, marginTop: '8px' }}>Inclusive of {product.gstPercentage}% GST</div>
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--secondary-color)', marginBottom: '1rem' }}>Description</h3>
                        <p style={{ color: 'var(--text-main)', lineHeight: 1.7, fontSize: '1rem' }}>{product.description}</p>
                    </div>

                    {variations && variations.length > 0 && (
                        <div className="variations-selector" style={{ marginBottom: '2.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--secondary-color)', marginBottom: '1rem' }}>Available Options:</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {variations.map((v) => (
                                    <button
                                        key={v._id}
                                        style={{
                                            padding: '12px 20px',
                                            borderRadius: '10px',
                                            border: selectedVariation?._id === v._id ? '2px solid var(--primary-color)' : '1px solid #e2e8f0',
                                            background: selectedVariation?._id === v._id ? '#f5f3ff' : 'white',
                                            color: selectedVariation?._id === v._id ? 'var(--primary-color)' : 'var(--text-main)',
                                            fontWeight: 700,
                                            cursor: v.stockQuantity > 0 ? 'pointer' : 'not-allowed',
                                            opacity: v.stockQuantity > 0 ? 1 : 0.5,
                                            transition: 'all 0.2s',
                                            fontSize: '0.9rem'
                                        }}
                                        className={selectedVariation?._id === v._id ? 'active' : ''}
                                        onClick={() => setSelectedVariation(v)}
                                        disabled={v.stockQuantity === 0}
                                    >
                                        {Object.entries(v.attributes).map(([key, value]) => `${value}`).join(' | ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedVariation && (
                        <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: selectedVariation.stockQuantity > 0 ? '#10b981' : '#ef4444' }}></div>
                            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: selectedVariation.stockQuantity > 0 ? '#10b981' : '#ef4444' }}>
                                {selectedVariation.stockQuantity > 0 ? `Highly Recommended • ${selectedVariation.stockQuantity} in stock` : 'Out of Stock'}
                            </span>
                        </div>
                    )}

                    <div className="add-to-cart-action" style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '5px', background: '#f8fafc' }}>
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                style={{ width: '45px', height: '45px', border: 'none', background: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary-color)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                disabled={quantity <= 1}
                            >-</button>
                            <span style={{ width: '50px', textAlign: 'center', fontWeight: 800, fontSize: '1.2rem' }}>{quantity}</span>
                            <button
                                onClick={() => setQuantity(q => q + 1)}
                                style={{ width: '45px', height: '45px', border: 'none', background: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary-color)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                disabled={quantity >= (selectedVariation?.stockQuantity || 0)}
                            >+</button>
                        </div>

                        <button
                            className="auth-btn"
                            disabled={!selectedVariation || selectedVariation.stockQuantity === 0}
                            onClick={() => addToCartHandler(false)}
                            style={{ margin: 0, padding: '1.1rem 2rem', fontSize: '1rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#ff9f00', boxShadow: '0 4px 12px rgba(255, 159, 0, 0.2)' }}
                        >
                            <ShoppingCart size={22} /> ADD TO CART
                        </button>

                        <button
                            className="auth-btn"
                            disabled={!selectedVariation || selectedVariation.stockQuantity === 0}
                            onClick={buyNowHandler}
                            style={{ margin: 0, padding: '1.1rem 2rem', fontSize: '1rem', flex: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'var(--accent-color)', boxShadow: '0 4px 12px rgba(251, 100, 27, 0.2)' }}
                        >
                            <Zap size={22} /> BUY NOW
                        </button>
                    </div>

                </div>
            </div>

            {/* Flipkart Style Reviews Section */}
            <div className="reviews-section" style={{ marginTop: '3rem', padding: '2.5rem', background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--secondary-color)', margin: 0 }}>Ratings & Reviews</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--secondary-color)' }}>{product.averageRating.toFixed(1)} <Star size={20} fill="#10b981" color="#10b981" style={{ verticalAlign: 'middle' }} /></div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{product.numOfReviews} verified ratings</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4rem' }}>
                    {/* Write Review Form */}
                    <div className="write-review">
                        <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--secondary-color)' }}>Share your experience</h3>
                            {reviewSuccess && <div style={{ color: '#065f46', background: '#d1fae5', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600, border: '1px solid #10b981' }}>✓ Review submitted successfully!</div>}

                            {state.userLogin.userInfo ? (
                                <form onSubmit={submitReviewHandler} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px', display: 'block' }}>Rating</label>
                                        <select value={rating} onChange={(e) => setRating(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', fontWeight: 600 }}>
                                            <option value="5">⭐⭐⭐⭐⭐ (Excellent)</option>
                                            <option value="4">⭐⭐⭐⭐ (Very Good)</option>
                                            <option value="3">⭐⭐⭐ (Good)</option>
                                            <option value="2">⭐⭐ (Fair)</option>
                                            <option value="1">⭐ (Poor)</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px', display: 'block' }}>Your Comment</label>
                                        <textarea
                                            rows="4"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            required
                                            placeholder="What did you like or dislike about this product? We value your feedback."
                                            style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical', fontSize: '0.95rem' }}
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="auth-btn" style={{ margin: 0, padding: '1rem' }}>Submit Feedback</button>
                                </form>
                            ) : (
                                <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                                    <p style={{ margin: '0 0 1rem 0', fontWeight: 600 }}>Bought this product?</p>
                                    <Link to={`/login?redirect=product/${id}`} className="auth-btn" style={{ textDecoration: 'none', display: 'inline-block', width: 'auto', padding: '0.6rem 1.5rem', margin: 0 }}>Login to Review</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Display Reviews */}
                    <div className="reviews-list">
                        {product.reviews.length === 0 ? (
                            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '4rem 0' }}>
                                <Star size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                                <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No reviews yet</p>
                                <p style={{ fontSize: '0.9rem' }}>Be the first one to share your thoughts!</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                {product.reviews.map((review) => (
                                    <div key={review._id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1rem' }}>
                                            <div style={{ background: '#10b981', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {review.rating} <Star size={14} fill="white" />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--secondary-color)' }}>{review.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{new Date(review.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                            </div>
                                        </div>
                                        <p style={{ color: 'var(--text-main)', lineHeight: 1.6, fontSize: '1rem', margin: 0 }}>{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Similar Products Section */}
            {similarProducts && similarProducts.length > 0 && (
                <div className="similar-products-section" style={{ marginTop: '3rem', padding: '2.5rem', background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--secondary-color)', margin: 0 }}>You might also like</h2>
                        <Link to="/" style={{ color: 'var(--primary-color)', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' }}>View All →</Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '2rem' }}>
                        {similarProducts.map((p) => (
                            <Link to={`/product/${p._id}`} key={p._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{
                                    border: '1px solid #f1f5f9',
                                    borderRadius: '12px',
                                    padding: '1.2rem',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    background: '#fff',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = 'var(--primary-color)22'; }}
                                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#f1f5f9'; }}>
                                    <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '8px', marginBottom: '1.2rem', padding: '15px' }}>
                                        <img src={API.getImageUrl(p.images[0])} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                    </div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.8rem 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.8rem', color: 'var(--secondary-color)', lineHeight: 1.4 }}>{p.name}</h3>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                                        <div style={{ background: '#10b981', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                            {p.averageRating > 0 ? p.averageRating.toFixed(1) : 'New'} <Star size={10} fill="white" />
                                        </div>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>({p.numOfReviews})</span>
                                    </div>
                                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--secondary-color)' }}>Rs. {p.basePrice?.toFixed(0)}</div>
                                        <div style={{ color: '#16a34a', fontSize: '0.75rem', fontWeight: 800 }}>40% OFF</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductPage;
