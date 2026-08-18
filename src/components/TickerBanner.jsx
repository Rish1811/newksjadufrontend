import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

const BubbleIcon = () => (
    <svg width="18" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ opacity: 0.85, flexShrink: 0 }}>
        <circle cx="10" cy="14" r="4" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="16" cy="8" r="5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
);

const TickerBanner = () => {
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        api.get('/api/announcements', { auth: false })
            .then((data) => setAnnouncements((Array.isArray(data) ? data : []).filter((a) => a.isActive)))
            .catch(() => setAnnouncements([]));
    }, []);

    if (announcements.length === 0) return null;

    const item = (a, suffix = '') => (
        <span
            key={`${a._id}${suffix}`}
            style={{ marginRight: 80, display: 'inline-flex', alignItems: 'center', gap: 14, letterSpacing: '0.5px' }}
        >
            <BubbleIcon />
            {a.text}
        </span>
    );

    return (
        <div
            style={{
                backgroundColor: '#8e59a6',
                color: '#fff',
                padding: '9px 0',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                fontSize: '0.92rem',
                fontWeight: 500,
                position: 'relative',
                zIndex: 1000,
            }}
        >
            {/* aria-hidden: the marquee is decorative and unreadable to a
                screen reader, so the same text is exposed statically below. */}
            <div className="marquee" aria-hidden="true" style={{ display: 'inline-block', paddingLeft: '100%' }}>
                {announcements.map((a) => item(a))}
                {announcements.map((a) => item(a, '-dup'))}
            </div>

            <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
                {announcements.map((a) => a.text).join('. ')}
            </span>

            <style>{`
                @keyframes marquee {
                    from { transform: translateX(0); }
                    to   { transform: translateX(-100%); }
                }
                .marquee { animation: marquee 40s linear infinite; }
                .marquee:hover { animation-play-state: paused; }
                @media (prefers-reduced-motion: reduce) {
                    .marquee { animation: none; padding-left: 0 !important; }
                }
            `}</style>
        </div>
    );
};

export default TickerBanner;
