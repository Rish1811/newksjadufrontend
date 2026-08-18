import React from 'react';

/** Shimmer placeholder shown while data loads, instead of a "Loading..." line. */
export const Skeleton = ({ width = '100%', height = 16, radius = 8, style }) => (
    <span className="skeleton" style={{ width, height, borderRadius: radius, ...style }} aria-hidden="true" />
);

export const ProductCardSkeleton = () => (
    <div className="product-card" aria-hidden="true">
        <Skeleton height={260} radius={0} style={{ display: 'block' }} />
        <div style={{ padding: '1.2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Skeleton width="40%" height={12} />
            <Skeleton width="85%" height={18} />
            <Skeleton width="50%" height={22} />
            <Skeleton height={44} radius={25} style={{ marginTop: 8 }} />
        </div>
    </div>
);

export const ProductGridSkeleton = ({ count = 4 }) => (
    <div className="responsive-grid">
        {Array.from({ length: count }, (_, i) => <ProductCardSkeleton key={i} />)}
    </div>
);

export default Skeleton;
