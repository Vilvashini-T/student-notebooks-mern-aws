import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../Store';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import './ProductPage.css';

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { dispatch } = useStore();

    const [productData, setProductData] = useState(null);
    const [selectedVariation, setSelectedVariation] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
                setProductData(data);
                if (data.variations && data.variations.length > 0) {
                    setSelectedVariation(data.variations[0]);
                }
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const addToCartHandler = () => {
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
                quantity: Number(quantity),
                image: productData.product.images[0] || 'https://via.placeholder.com/300x400?text=No+Image'
            }
        });

        navigate('/cart');
    };

    if (loading) return <div className="loader-container"><h2>Loading product...</h2></div>;
    if (error) return <div className="error-container"><h2>{error}</h2><Link to="/">Go Back</Link></div>;
    if (!productData) return null;

    const { product, variations } = productData;
    const currentPrice = product.basePrice + (selectedVariation ? selectedVariation.priceAdjustment : 0);

    return (
        <div className="product-page-container">
            <nav className="breadcrumbs">
                <Link to="/">Home</Link>
                <span className="separator">/</span>
                <Link to={`/?category=${product.category?._id}`}>{product.category?.name || 'Category'}</Link>
                <span className="separator">/</span>
                <span className="current">{product.name}</span>
            </nav>

            <div className="product-details-grid">
                <div className="product-image-section">
                    <img
                        src={product.images[0] || 'https://via.placeholder.com/500x600?text=Product+Image'}
                        alt={product.name}
                        className="main-product-image"
                    />
                </div>

                <div className="product-info-section">
                    <div className="brand-header">
                        <span className="product-brand-name">{product.brand}</span>
                        <span className="assured-badge-large">✔ Assured</span>
                    </div>
                    <h1 className="product-title">{product.name}</h1>

                    <div className="product-price-section">
                        <div className="main-price-row">
                            <span className="price-large">Rs. {currentPrice.toFixed(2)}</span>
                            <span className="mrp-large">Rs. {(currentPrice * 1.4).toFixed(2)}</span>
                            <span className="discount-large">40% off</span>
                        </div>
                        <div className="gst-tag">Inclusive of {product.gstPercentage}% GST</div>
                    </div>

                    <p className="product-description">{product.description}</p>

                    {variations && variations.length > 0 && (
                        <div className="variations-selector">
                            <h3>Select Option:</h3>
                            <div className="variation-options">
                                {variations.map((v) => (
                                    <button
                                        key={v._id}
                                        className={`variation-btn ${selectedVariation?._id === v._id ? 'active' : ''} ${v.stockQuantity === 0 ? 'out-of-stock' : ''}`}
                                        onClick={() => setSelectedVariation(v)}
                                        disabled={v.stockQuantity === 0}
                                    >
                                        {Object.entries(v.attributes).map(([key, value]) => `${value} `).join(' | ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedVariation && (
                        <div className="stock-status">
                            {selectedVariation.stockQuantity > 0 ? (
                                <span className="in-stock">In Stock ({selectedVariation.stockQuantity} available)</span>
                            ) : (
                                <span className="out-of-stock-text">Out of Stock</span>
                            )}
                        </div>
                    )}

                    <div className="add-to-cart-action">
                        <div className="quantity-selector">
                            <label>Qty:</label>
                            <select
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                disabled={!selectedVariation || selectedVariation.stockQuantity === 0}
                            >
                                {[...Array(selectedVariation ? Math.min(selectedVariation.stockQuantity, 10) : 0).keys()].map(x => (
                                    <option key={x + 1} value={x + 1}>{x + 1}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            className="btn-add-to-cart"
                            onClick={addToCartHandler}
                            disabled={!selectedVariation || selectedVariation.stockQuantity === 0}
                        >
                            <ShoppingCart size={20} /> Add To Cart
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProductPage;
