import React from 'react';
import ProductGrid from '../components/ProductGrid';

const Shop = () => {
    return (
        <div style={{ paddingTop: '2rem' }}>
            <div className="container">
                <h1 className="section-title">All Products</h1>
                <p className="section-subtitle">Everything you need for a sparkling clean home</p>
            </div>
            <ProductGrid />
            <div className="container" style={{ textAlign: 'center', padding: '2rem 0' }}>
                <p>More products coming soon...</p>
            </div>
        </div>
    );
};

export default Shop;
