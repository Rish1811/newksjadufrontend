import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, imageUrl } from '../api/client';

/** Recent customer reviews from across the catalogue. */
const TrustedByFamilies = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/products/all/reviews', { auth: false })
            .then((data) => setReviews(Array.isArray(data) ? data : []))
            .catch(() => setReviews([]))
            .finally(() => setLoading(false));
    }, []);

    if (loading || reviews.length === 0) return null;

    return (
        <section style={{ padding: '4.5rem 0', backgroundColor: '#111827', color: '#fff' }}>
            <div className="container">
                <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: 'clamp(1.9rem, 5vw, 3rem)', fontWeight: 800, fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
                        Trusted by Families
                    </h2>
                    <p style={{ color: '#9ca3af', marginTop: 8 }}>Real reviews from real homes.</p>
                </header>

                <div
                    className="no-scrollbar"
                    style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 16, scrollSnapType: 'x mandatory' }}
                >
                    {reviews.map((review, idx) => {
                        const photo = review.images?.[0];
                        return (
                            <article
                                key={idx}
                                style={{
                                    // Was a fixed 450px, which overflowed every phone screen.
                                    minWidth: 'min(430px, 86vw)',
                                    backgroundColor: '#1f2937',
                                    borderRadius: 22,
                                    overflow: 'hidden',
                                    display: 'flex',
                                    minHeight: 250,
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    flexShrink: 0,
                                    scrollSnapAlign: 'start',
                                }}
                            >
                                {photo && (
                                    <div style={{ width: '38%', flexShrink: 0, position: 'relative', background: '#111827' }}>
                                        <img
                                            src={imageUrl(photo)}
                                            alt=""
                                            loading="lazy"
                                            decoding="async"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
                                        />
                                        {review.images.length > 1 && (
                                            <span style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem' }}>
                                                1/{review.images.length}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div style={{ flex: 1, padding: 22, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 10, lineHeight: 1.35 }}>
                                        {review.title || 'Loved it'}
                                    </h3>
                                    <p
                                        style={{
                                            fontSize: '0.9rem',
                                            color: '#9ca3af',
                                            lineHeight: 1.6,
                                            flex: 1,
                                            overflow: 'hidden',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 4,
                                            WebkitBoxOrient: 'vertical',
                                        }}
                                    >
                                        “{review.comment}”
                                    </p>

                                    <footer style={{ marginTop: 16 }}>
                                        <div style={{ fontWeight: 700, marginBottom: 6 }}>{review.user}</div>
                                        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }} aria-label={`${review.rating} out of 5 stars`}>
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} aria-hidden="true" style={{ color: i < review.rating ? '#fbbf24' : '#4b5563', fontSize: '1rem' }}>★</span>
                                            ))}
                                        </div>
                                        {/* The review names a product, so let people go straight to it. */}
                                        {review.productId && (
                                            <Link
                                                to={`/product/${review.productId}`}
                                                style={{ display: 'inline-block', marginTop: 10, fontSize: '0.82rem', color: '#93c5fd', textDecoration: 'underline' }}
                                            >
                                                {review.productName}
                                            </Link>
                                        )}
                                    </footer>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default TrustedByFamilies;
