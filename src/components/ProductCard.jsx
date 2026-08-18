import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { imageUrl, formatPrice } from '../api/client';
import { useApp } from '../context/AppContext';

/** Five stars filled to the nearest half, from the product's real rating. */
const Stars = ({ rating = 0, count = 0 }) => {
    const rounded = Math.round(rating * 2) / 2;
    return (
        <div
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}
            aria-label={count > 0 ? `Rated ${rating.toFixed(1)} out of 5 from ${count} reviews` : 'No reviews yet'}
        >
            <span aria-hidden="true" style={{ color: 'var(--color-star)', letterSpacing: '1px' }}>
                {[1, 2, 3, 4, 5].map((i) => (rounded >= i ? '★' : rounded >= i - 0.5 ? '⯨' : '☆')).join('')}
            </span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
                {count > 0 ? `${rating.toFixed(1)} (${count})` : 'New'}
            </span>
        </div>
    );
};

/**
 * A single product tile.
 *
 * The star rating and review count come from the product document; the old
 * version printed a hardcoded five stars and "226 reviews" on every card.
 */
const ProductCard = ({ _id, name, price, image, rating = 0, numReviews = 0, category, sizes, countInStock = 0 }) => {
    const { addToCart } = useApp();
    const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [adding, setAdding] = useState(false);

    const activeSize = sizes?.length ? sizes[selectedSizeIndex] : null;

    const { displayPrice, originalPrice, discount, displayImage } = useMemo(() => {
        const current = activeSize ? activeSize.price : price;
        // Only show a strike-through price when a real one is configured -
        // the old code invented "price × 1.5" and advertised a fake 33% saving.
        const original = activeSize?.originalPrice || null;
        return {
            displayPrice: current,
            originalPrice: original && original > current ? original : null,
            discount: original && original > current ? Math.round(((original - current) / original) * 100) : 0,
            displayImage: activeSize?.image || image,
        };
    }, [activeSize, price, image]);

    const outOfStock = countInStock <= 0;

    const handleAdd = async () => {
        setAdding(true);
        await addToCart(_id, { qty: 1, size: activeSize?.size });
        setAdding(false);
    };

    return (
        <article className="product-card">
            <Link
                to={`/product/${_id}`}
                style={{ position: 'relative', height: 250, overflow: 'hidden', display: 'block', background: 'var(--color-surface-alt)' }}
            >
                {!imageLoaded && <span className="skeleton" style={{ position: 'absolute', inset: 0 }} />}
                <img
                    src={imageUrl(displayImage)}
                    alt={name}
                    loading="lazy"
                    decoding="async"
                    style={{
                        height: '100%',
                        width: '100%',
                        objectFit: 'cover',
                        transition: 'opacity 300ms ease, transform 400ms ease',
                        opacity: imageLoaded ? 1 : 0,
                    }}
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => { e.currentTarget.src = '/logo.png'; setImageLoaded(true); }}
                />

                {category && (
                    <span
                        className="badge"
                        style={{ position: 'absolute', top: 12, left: 12, background: 'var(--color-surface)', color: 'var(--color-accent)', boxShadow: 'var(--shadow-xs)' }}
                    >
                        {category}
                    </span>
                )}

                {outOfStock && (
                    <span className="badge badge--danger" style={{ position: 'absolute', top: 12, right: 12 }}>Out of stock</span>
                )}
                {!outOfStock && countInStock <= 5 && (
                    <span className="badge badge--warning" style={{ position: 'absolute', top: 12, right: 12 }}>Only {countInStock} left</span>
                )}
            </Link>

            <div style={{ padding: '1.1rem 1.25rem', textAlign: 'left', display: 'flex', flexDirection: 'column', flex: 1, gap: 8 }}>
                <Stars rating={rating} count={numReviews} />

                <h3 style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.3, minHeight: '2.6em', overflow: 'hidden' }}>
                    <Link to={`/product/${_id}`}>{name}</Link>
                </h3>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{formatPrice(displayPrice)}</span>
                    {originalPrice && (
                        <>
                            <span style={{ fontSize: '0.85rem', textDecoration: 'line-through', color: 'var(--color-text-faint)' }}>
                                {formatPrice(originalPrice)}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-accent)', fontWeight: 700 }}>Save {discount}%</span>
                        </>
                    )}
                </div>

                {sizes?.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} role="group" aria-label="Choose a size">
                        {sizes.map((s, idx) => (
                            <button
                                key={`${s.size}-${idx}`}
                                type="button"
                                aria-pressed={selectedSizeIndex === idx}
                                onClick={() => setSelectedSizeIndex(idx)}
                                style={{
                                    padding: '7px 14px',
                                    border: `1.5px solid ${selectedSizeIndex === idx ? 'var(--color-highlight)' : 'var(--color-border)'}`,
                                    backgroundColor: selectedSizeIndex === idx ? 'var(--color-highlight)' : 'var(--color-surface)',
                                    color: selectedSizeIndex === idx ? 'var(--color-on-highlight)' : 'var(--color-text-muted)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    transition: 'var(--transition)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    lineHeight: 1.2,
                                }}
                            >
                                {s.label && <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', opacity: 0.85 }}>{s.label}</span>}
                                <span>{s.size}</span>
                            </button>
                        ))}
                    </div>
                )}

                <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={handleAdd}
                    disabled={outOfStock || adding}
                    style={{ marginTop: 'auto' }}
                >
                    {outOfStock ? 'Out of stock' : adding ? 'Adding…' : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                            Add to cart
                        </>
                    )}
                </button>
            </div>
        </article>
    );
};

export default ProductCard;
