import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, imageUrl, formatPrice } from '../api/client';
import { useApp } from '../context/AppContext';
import Skeleton from '../components/Skeleton';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useApp();

    const [product, setProduct] = useState(null);
    const [siblings, setSiblings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState('');
    const [openAccordion, setOpenAccordion] = useState('');
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setNotFound(false);
        setSelectedSizeIndex(0);
        setQuantity(1);

        Promise.all([
            api.get(`/api/products/${id}`, { auth: false, signal: controller.signal }),
            api.get('/api/products', { auth: false, signal: controller.signal }).catch(() => []),
        ])
            .then(([data, all]) => {
                setProduct(data);
                setMainImage(data.image);
                setSiblings(Array.isArray(all) ? all : []);
            })
            .catch((err) => {
                if (err.name === 'AbortError') return;
                setNotFound(true);
            })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });

        return () => controller.abort();
    }, [id]);

    const { prevProduct, nextProduct } = useMemo(() => {
        const index = siblings.findIndex((p) => p._id === id);
        return {
            prevProduct: index > 0 ? siblings[index - 1] : null,
            nextProduct: index !== -1 && index < siblings.length - 1 ? siblings[index + 1] : null,
        };
    }, [siblings, id]);

    const activeSize = product?.sizes?.length ? product.sizes[selectedSizeIndex] : null;
    const unitPrice = activeSize ? activeSize.price : product?.price ?? 0;
    const originalPrice = activeSize?.originalPrice > unitPrice ? activeSize.originalPrice : null;
    const inStock = (product?.countInStock ?? 0) > 0;
    const maxQty = Math.min(product?.countInStock ?? 1, 20);

    const handleAddToCart = async () => {
        setAdding(true);
        await addToCart(product._id, { qty: quantity, size: activeSize?.size });
        setAdding(false);
    };

    if (loading) {
        return (
            <div className="container" style={{ padding: '2rem 1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '3rem' }}>
                    <Skeleton height={480} radius={20} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <Skeleton width="35%" height={22} />
                        <Skeleton width="80%" height={40} />
                        <Skeleton height={80} />
                        <Skeleton width="45%" height={32} />
                        <Skeleton height={52} radius={30} />
                    </div>
                </div>
            </div>
        );
    }

    if (notFound || !product) {
        return (
            <div className="container">
                <div className="state-panel" style={{ minHeight: '60vh' }}>
                    <div className="state-panel__icon">🧴</div>
                    <h2 className="state-panel__title">Product not found</h2>
                    <p className="state-panel__text">This product may have been removed from the store.</p>
                    <Link to="/shop" className="btn btn-primary">Back to shop</Link>
                </div>
            </div>
        );
    }

    const allImages = [product.image, ...(product.additionalImages || [])].filter(Boolean);
    const ratingValue = Number(product.rating || 0);

    return (
        <div className="container" style={{ padding: '2rem 1rem 4rem' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.9rem', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/shop" style={{ color: 'var(--color-text-muted)' }}>
                    ← Back to <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Shop All</span>
                </Link>
                <div style={{ display: 'flex', gap: 12, color: 'var(--color-primary)' }}>
                    {prevProduct && <button type="button" onClick={() => navigate(`/product/${prevProduct._id}`)} style={{ fontWeight: 600 }}>Previous</button>}
                    {prevProduct && nextProduct && <span style={{ color: 'var(--color-border-strong)' }}>|</span>}
                    {nextProduct && <button type="button" onClick={() => navigate(`/product/${nextProduct._id}`)} style={{ fontWeight: 600 }}>Next</button>}
                </div>
            </nav>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '3rem' }}>
                <div>
                    <div style={{ backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-lg)', padding: '2rem', display: 'grid', placeItems: 'center', minHeight: 420, border: '1px solid var(--color-border)' }}>
                        <img
                            src={imageUrl(mainImage)}
                            alt={product.name}
                            // The hero image is what the visitor came to see, so it
                            // loads eagerly at high priority rather than lazily.
                            fetchPriority="high"
                            decoding="async"
                            style={{ width: '80%', height: 'auto', objectFit: 'contain' }}
                        />
                    </div>

                    {allImages.length > 1 && (
                        <div className="no-scrollbar" style={{ display: 'flex', gap: 10, marginTop: '1rem', overflowX: 'auto' }}>
                            {allImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setMainImage(img)}
                                    aria-label={`View image ${idx + 1}`}
                                    aria-pressed={mainImage === img}
                                    style={{
                                        width: 76, height: 76, flexShrink: 0,
                                        borderRadius: 'var(--radius-sm)',
                                        border: `2px solid ${mainImage === img ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                        overflow: 'hidden', backgroundColor: 'var(--color-surface-alt)', padding: 5,
                                    }}
                                >
                                    <img src={imageUrl(img)} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem', flexWrap: 'wrap' }}>
                        {/* Real numbers from the product, not the fixed 4.70 / 376 that
                            used to appear on every single product page. */}
                        {product.numReviews > 0 ? (
                            <>
                                <span className="badge badge--success">
                                    <span style={{ color: 'var(--color-star)' }}>★</span> {ratingValue.toFixed(2)}/5
                                </span>
                                <span className="badge badge--neutral">{product.numReviews} review{product.numReviews === 1 ? '' : 's'}</span>
                            </>
                        ) : (
                            <span className="badge badge--neutral">No reviews yet</span>
                        )}
                        {inStock ? (
                            product.countInStock <= 5 && <span className="badge badge--warning">Only {product.countInStock} left</span>
                        ) : (
                            <span className="badge badge--danger">Out of stock</span>
                        )}
                    </div>

                    <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', marginBottom: '1rem', lineHeight: 1.2, fontWeight: 800 }}>
                        {product.name}{activeSize ? ` — ${activeSize.size}` : ''}
                    </h1>

                    <div style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                        {product.overview && <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text)' }}>{product.overview}</p>}
                        <p>{product.description}</p>
                    </div>

                    {product.bulletPoints?.length > 0 && (
                        <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.9rem', marginBottom: '2rem', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '1.4rem 0' }}>
                            {product.bulletPoints.map((point, idx) => (
                                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.95rem' }}>
                                    <span style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: 'var(--color-accent-soft)', color: 'var(--color-accent)', display: 'grid', placeItems: 'center', fontSize: '0.75rem', flexShrink: 0 }}>✓</span>
                                    {point}
                                </li>
                            ))}
                        </ul>
                    )}

                    {product.sizes?.length > 0 ? (
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ fontWeight: 700, marginBottom: '0.9rem' }}>Size</div>
                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }} role="group" aria-label="Choose a size">
                                {product.sizes.map((s, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        aria-pressed={selectedSizeIndex === idx}
                                        onClick={() => setSelectedSizeIndex(idx)}
                                        style={{
                                            position: 'relative', padding: '14px 12px',
                                            borderRadius: 'var(--radius-md)', width: 122, textAlign: 'center',
                                            border: `2px solid ${selectedSizeIndex === idx ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                            backgroundColor: 'var(--color-surface)',
                                        }}
                                    >
                                        {s.label && (
                                            <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', fontSize: '0.65rem', padding: '2px 9px', borderRadius: 'var(--radius-pill)', whiteSpace: 'nowrap', fontWeight: 700 }}>
                                                {s.label}
                                            </span>
                                        )}
                                        <div style={{ fontWeight: 700, marginTop: 4 }}>{s.size}</div>
                                        <div style={{ marginTop: 4, fontSize: '1.05rem', fontWeight: 800 }}>{formatPrice(s.price)}</div>
                                        {s.originalPrice > s.price && (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-faint)', textDecoration: 'line-through' }}>{formatPrice(s.originalPrice)}</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'baseline', gap: 12 }}>
                            <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{formatPrice(unitPrice)}</span>
                            {originalPrice && <span style={{ fontSize: '1rem', color: 'var(--color-text-faint)', textDecoration: 'line-through' }}>{formatPrice(originalPrice)}</span>}
                        </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-pill)', height: 52, background: 'var(--color-surface)' }}>
                            <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} aria-label="Decrease quantity" style={{ padding: '0 18px', fontSize: '1.2rem', height: '100%' }}>−</button>
                            <span aria-live="polite" style={{ padding: '0 6px', fontWeight: 700, minWidth: 34, textAlign: 'center' }}>{quantity}</span>
                            {/* Capped at available stock so the user can't queue up a
                                quantity the server is going to reject. */}
                            <button type="button" onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))} disabled={quantity >= maxQty} aria-label="Increase quantity" style={{ padding: '0 18px', fontSize: '1.2rem', height: '100%' }}>+</button>
                        </div>

                        <button
                            type="button"
                            className="btn btn-accent btn-lg"
                            onClick={handleAddToCart}
                            disabled={!inStock || adding}
                            style={{ flex: 1, minWidth: 200, height: 52 }}
                        >
                            {!inStock ? 'Out of stock' : adding ? 'Adding…' : `Add to cart · ${formatPrice(unitPrice * quantity)}`}
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: 14, marginBottom: '2rem' }}>
                        {[['🚚', 'Cash on delivery'], ['⚡', 'Fast dispatch'], ['🌿', 'Plant based']].map(([icon, label]) => (
                            <div key={label} style={{ flex: 1, textAlign: 'center', padding: '14px 8px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ fontSize: '1.4rem' }}>{icon}</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: 4 }}>{label}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ borderTop: '1px solid var(--color-border)' }}>
                        {[
                            ['overview', 'Overview', product.overview],
                            ['howto', 'How to use', product.howToUse],
                        ].map(([key, label, content]) => (
                            <div key={key}>
                                <button
                                    type="button"
                                    onClick={() => setOpenAccordion((cur) => (cur === key ? '' : key))}
                                    aria-expanded={openAccordion === key}
                                    style={{ width: '100%', padding: '1.1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', fontWeight: 700, fontSize: '1.05rem' }}
                                >
                                    {label}
                                    <span>{openAccordion === key ? '−' : '+'}</span>
                                </button>
                                {openAccordion === key && (
                                    <div style={{ padding: '1rem 0', color: 'var(--color-text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                                        {content || 'Not provided for this product yet.'}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <section style={{ marginTop: '4rem', borderTop: '1px solid var(--color-border)', paddingTop: '2.5rem' }}>
                <h2 className="section-title" style={{ fontSize: '1.7rem' }}>Customer reviews</h2>

                {product.reviews?.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.5rem' }}>
                        {product.reviews.map((review, idx) => (
                            <article key={idx} className="card" style={{ padding: '1.4rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                                    <span style={{ fontWeight: 700 }}>{review.name}</span>
                                    <span style={{ color: 'var(--color-star)', flexShrink: 0 }} aria-label={`${review.rating} out of 5`}>
                                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                    </span>
                                </div>
                                {review.title && <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>{review.title}</h3>}
                                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-faint)', marginBottom: 12 }}>
                                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                                </div>
                                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.55, fontSize: '0.95rem', marginBottom: review.images?.length ? '1rem' : 0 }}>
                                    {review.comment}
                                </p>
                                {review.images?.length > 0 && (
                                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                        {review.images.map((img, i) => (
                                            <img key={i} src={imageUrl(img)} alt="" loading="lazy" decoding="async" style={{ width: 74, height: 74, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                                        ))}
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="state-panel" style={{ padding: '2rem' }}>
                        <p className="state-panel__text">No reviews yet — be the first once your order arrives.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default ProductDetails;
