import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, imageUrl } from '../api/client';

const ConcernsSection = () => {
    const [concerns, setConcerns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/concerns', { auth: false })
            .then((data) => setConcerns(Array.isArray(data) ? data : []))
            .catch(() => setConcerns([]))
            .finally(() => setLoading(false));
    }, []);

    if (loading || concerns.length === 0) return null;

    return (
        <section className="section" style={{ backgroundColor: 'var(--color-bg)' }}>
            <div className="container">
                <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <span className="section-eyebrow">Shop by concern</span>
                    <h2 className="section-title" style={{ marginBottom: 0 }}>Which mess matters?</h2>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                    {concerns.map((concern) => (
                        <Link
                            key={concern._id}
                            // A concern with no link should still be a valid target
                            // rather than a dead click that navigates to undefined.
                            to={concern.linkUrl || '/shop'}
                            className="concern-card"
                            style={{
                                backgroundColor: 'var(--color-surface-alt)',
                                borderRadius: 'var(--radius-xl)',
                                padding: 22,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 16,
                                border: '1px solid var(--color-border)',
                                transition: 'transform 250ms ease, box-shadow 250ms ease',
                            }}
                        >
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, lineHeight: 1.2 }}>
                                    {concern.title}
                                </h3>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                                    View products <span aria-hidden="true">›</span>
                                </span>
                            </div>

                            {concern.image && (
                                <img
                                    src={imageUrl(concern.image)}
                                    alt=""
                                    loading="lazy"
                                    decoding="async"
                                    style={{ width: 112, height: 112, objectFit: 'contain', flexShrink: 0 }}
                                />
                            )}
                        </Link>
                    ))}
                </div>
            </div>

            <style>{`
                .concern-card:hover {
                    transform: translateY(-5px);
                    box-shadow: var(--shadow-md);
                }
            `}</style>
        </section>
    );
};

export default ConcernsSection;
