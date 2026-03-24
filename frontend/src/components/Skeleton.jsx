import React from 'react';
import './Skeleton.css';

const Skeleton = ({ width, height, borderRadius = '4px', className = '' }) => {
    return (
        <div
            className={`skeleton-base ${className}`}
            style={{ width, height, borderRadius }}
        ></div>
    );
};

export const ProductSkeleton = () => (
    <div className="product-card skeleton-card">
        <Skeleton height="300px" width="100%" borderRadius="12px" />
        <div className="product-info" style={{ padding: '1rem 0' }}>
            <Skeleton height="15px" width="40%" />
            <Skeleton height="24px" width="80%" className="my-2" />
            <Skeleton height="20px" width="60%" />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <Skeleton height="35px" width="80px" borderRadius="6px" />
            </div>
        </div>
    </div>
);

export default Skeleton;
