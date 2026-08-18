import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import Skeleton from '../components/Skeleton';

const PolicyPage = () => {
    const { type } = useParams();
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        api.get(`/api/policies/${type}`, { auth: false })
            .then(setPolicy)
            .catch((err) => setError(err.status === 404 ? 'notfound' : err.message))
            .finally(() => setLoading(false));
    }, [type]);

    if (loading) {
        return (
            <div style={{ maxWidth: 820, margin: '3rem auto 4rem', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Skeleton width="55%" height={38} />
                {[...Array(8)].map((_, i) => <Skeleton key={i} height={14} width={i % 3 === 2 ? '75%' : '100%'} />)}
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="state-panel" style={{ minHeight: '50vh' }}>
                    <div className="state-panel__icon">📄</div>
                    <h1 className="state-panel__title">
                        {error === 'notfound' ? 'This policy is not published yet' : 'We could not load this page'}
                    </h1>
                    <p className="state-panel__text">
                        {error === 'notfound' ? 'Please check back soon.' : error}
                    </p>
                    <Link to="/" className="btn btn-primary">Back to home</Link>
                </div>
            </div>
        );
    }

    return (
        <article style={{ maxWidth: 820, margin: '3rem auto 4rem', padding: '0 1.5rem' }}>
            <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.3rem)', fontWeight: 800, marginBottom: '1.75rem' }}>
                {policy?.title}
            </h1>

            {/* Rendered as text, not injected HTML. The content is admin-authored
                but there is no reason for this page to be an HTML sink. */}
            <div style={{ lineHeight: 1.85, color: 'var(--color-text-muted)', fontSize: '1.02rem' }}>
                {String(policy?.content || '').split('\n').map((line, idx) => {
                    const trimmed = line.trim();
                    if (!trimmed) return <div key={idx} style={{ height: '0.9rem' }} />;
                    // Treat an all-caps line as a section heading.
                    const isHeading = trimmed.length > 3 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
                    return isHeading ? (
                        <h2 key={idx} style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', margin: '1.6rem 0 0.6rem' }}>
                            {trimmed}
                        </h2>
                    ) : (
                        <p key={idx} style={{ marginBottom: '0.5rem' }}>{line}</p>
                    );
                })}
            </div>
        </article>
    );
};

export default PolicyPage;
