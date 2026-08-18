import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import ProductCard from './ProductCard';
import { ProductGridSkeleton } from './Skeleton';

/**
 * The catalogue grid used by the Shop page.
 *
 * The buy-now checkout that used to live in here was a second, diverging copy
 * of CheckoutModal - it is gone, and the cart drawer is now the only path to
 * checkout, so there is one flow to keep correct.
 */
const ProductGrid = ({ title, subtitle, showViewAll = false }) => {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const category = searchParams.get('category');
    const keyword = searchParams.get('keyword');

    useEffect(() => {
        const controller = new AbortController();

        const query = new URLSearchParams();
        if (category) query.set('category', category);
        if (keyword) query.set('keyword', keyword);
        const url = `/api/products${query.toString() ? `?${query}` : ''}`;

        setLoading(true);
        setError(null);

        api.get(url, { auth: false, signal: controller.signal })
            .then((data) => setProducts(Array.isArray(data) ? data : []))
            .catch((err) => {
                if (err.name !== 'AbortError') setError(err.message);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [category, keyword]);

    const heading = title || (keyword ? `Results for “${keyword}”` : category || 'All products');

    return (
        <section className="section" style={{ paddingTop: '2rem' }}>
            <div className="container">
                <h2 className="section-title">{heading}</h2>
                {subtitle && <p className="section-subtitle">{subtitle}</p>}

                {loading ? (
                    <ProductGridSkeleton count={8} />
                ) : error ? (
                    <div className="state-panel">
                        <div className="state-panel__icon">📡</div>
                        <p className="state-panel__title">We couldn't load the products</p>
                        <p className="state-panel__text">{error}</p>
                        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
                            Try again
                        </button>
                    </div>
                ) : products.length === 0 ? (
                    <div className="state-panel">
                        <div className="state-panel__icon">🔍</div>
                        <p className="state-panel__title">Nothing here yet</p>
                        <p className="state-panel__text">
                            {keyword || category
                                ? 'Try a different search or browse the full range.'
                                : 'New products are on the way — check back soon.'}
                        </p>
                        {(keyword || category) && <Link to="/shop" className="btn btn-primary">View all products</Link>}
                    </div>
                ) : (
                    <div className="responsive-grid">
                        {products.map((product) => <ProductCard key={product._id} {...product} />)}
                    </div>
                )}

                {showViewAll && !loading && products.length > 0 && (
                    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                        <Link to="/shop" className="btn btn-primary">View all products</Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProductGrid;
export { default as ProductCard } from './ProductCard';
