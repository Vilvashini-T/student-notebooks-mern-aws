import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { useStore } from '../Store';
import API from '../api';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
    const { state, dispatch } = useStore();
    const { userLogin: { userInfo } } = state;
    const navigate = useNavigate();

    const isWishlisted = userInfo?.wishlist?.includes(product._id);

    const toggleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!userInfo) {
            toast.error('Please login to use wishlist');
            navigate('/login');
            return;
        }

        try {
            const { data } = await API.post('/api/users/profile/wishlist', { productId: product._id });
            dispatch({ type: 'USER_UPDATE_WISHLIST', payload: data });
            toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
        } catch (err) {
            toast.error('Failed to update wishlist');
        }
    };

    return (
        <Link to={`/product/${product._id}`} className="product-card">
            <div className="product-card-image">
                <img src={API.getImageUrl(product.images[0])} alt={product.name} />
                <button
                    className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                    onClick={toggleWishlist}
                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                    <Heart size={20} fill={isWishlisted ? "#ef4444" : "none"} color={isWishlisted ? "#ef4444" : "#6b7280"} />
                </button>
            </div>

            <div className="product-card-content">
                <div className="brand-badge">{product.brand}</div>
                <h3 className="product-name">{product.name}</h3>

                <div className="rating-row">
                    <div className="rating-badge">
                        {product.averageRating > 0 ? product.averageRating.toFixed(1) : 'New'} <Star size={12} fill="white" />
                    </div>
                    <span className="review-count">({product.numOfReviews})</span>
                    <span className="assured-badge">✔ Assured</span>
                </div>

                <div className="price-row">
                    <span className="current-price">Rs. {product.basePrice.toFixed(2)}</span>
                    <span className="mrp">Rs. {(product.basePrice * 1.4).toFixed(0)}</span>
                    <span className="discount-percent">40% off</span>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
