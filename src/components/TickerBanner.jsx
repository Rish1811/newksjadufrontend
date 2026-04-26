import React, { useState, useEffect } from 'react';
import API_BASE from '../config';

const TickerBanner = () => {
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/announcements`);
                if (res.ok) {
                    const data = await res.json();
                    setAnnouncements(data.filter(a => a.isActive));
                }
            } catch (error) {
                console.error('Error fetching announcements:', error);
            }
        };
        fetchAnnouncements();
    }, []);

    if (announcements.length === 0) return null;

    const BubbleIcon = () => (
        <svg width="20" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.8 }}>
            <circle cx="10" cy="14" r="4" stroke="white" strokeWidth="1.8"/>
            <circle cx="18" cy="16" r="3" stroke="white" strokeWidth="1.8"/>
            <circle cx="16" cy="8" r="5" stroke="white" strokeWidth="1.8"/>
        </svg>
    );

    return (
        <div style={{
            backgroundColor: '#8E59A6',
            color: 'white',
            padding: '10px 0',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            position: 'relative',
            fontSize: '1rem',
            fontWeight: '500',
            zIndex: 1000,
            borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
            <div className="marquee" style={{
                display: 'inline-block',
                paddingLeft: '100%',
                animation: 'marquee 40s linear infinite'
            }}>
                {announcements.map((a, index) => (
                    <span key={a._id} style={{ marginRight: '100px', display: 'inline-flex', alignItems: 'center', gap: '20px', letterSpacing: '0.8px', textTransform: 'capitalize' }}>
                        <BubbleIcon />
                        {a.text}
                    </span>
                ))}
                {/* Duplicate for seamless loop */}
                {announcements.map((a, index) => (
                    <span key={`${a._id}-dup`} style={{ marginRight: '100px', display: 'inline-flex', alignItems: 'center', gap: '20px', letterSpacing: '0.8px', textTransform: 'capitalize' }}>
                        <BubbleIcon />
                        {a.text}
                    </span>
                ))}
            </div>
            <style>{`
                @keyframes marquee {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(-100%, 0); }
                }
                .marquee {
                    display: inline-block;
                }
            `}</style>
        </div>
    );
};


export default TickerBanner;
