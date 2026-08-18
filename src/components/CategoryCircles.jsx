import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, imageUrl } from '../api/client';

const CategoryCircles = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        // Shares the cached response with the Navbar's category dropdown.
        api.get('/api/categories', { auth: false })
            .then((data) => setCategories(Array.isArray(data) ? data : []))
            .catch(() => setCategories([]));
    }, []);

    if (categories.length === 0) return null;

    return (
        <nav aria-label="Shop by category" style={{ padding: '2.5rem 1rem' }}>
            <ul
                className="no-scrollbar"
                style={{
                    maxWidth: 1200,
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: '2rem',
                    overflowX: 'auto',
                }}
            >
                {categories.map((cat) => (
                    <li key={cat._id}>
                        {/* encodeURIComponent matters: category names contain
                            spaces and ampersands that would otherwise break the URL. */}
                        <Link
                            to={`/shop?category=${encodeURIComponent(cat.name)}`}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 108 }}
                            className="category-circle"
                        >
                            <span
                                style={{
                                    width: 88,
                                    height: 88,
                                    borderRadius: '50%',
                                    backgroundColor: cat.bgColor || 'var(--color-surface-alt)',
                                    display: 'grid',
                                    placeItems: 'center',
                                    overflow: 'hidden',
                                    marginBottom: 12,
                                    border: `3px solid ${cat.borderColor || 'var(--color-border-strong)'}`,
                                    transition: 'transform 220ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 220ms',
                                }}
                            >
                                {cat.image ? (
                                    <img
                                        src={imageUrl(cat.image)}
                                        alt=""
                                        loading="lazy"
                                        decoding="async"
                                        style={{ width: '78%', height: '78%', objectFit: 'contain' }}
                                    />
                                ) : (
                                    <span style={{ fontSize: '1.9rem' }} aria-hidden="true">🌿</span>
                                )}
                            </span>
                            <span
                                style={{
                                    fontSize: '0.83rem',
                                    fontWeight: 700,
                                    color: 'var(--color-text)',
                                    textAlign: 'center',
                                    lineHeight: 1.25,
                                }}
                            >
                                {cat.name}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>

            <style>{`
                .category-circle:hover span:first-child {
                    transform: translateY(-6px);
                    box-shadow: var(--shadow-md);
                }
            `}</style>
        </nav>
    );
};

export default CategoryCircles;
