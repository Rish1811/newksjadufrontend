import React, { useState, useEffect } from 'react';
import API_BASE from '../config';

const TrustedByFamilies = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/products/all/reviews`);
                if (response.ok) {
                    const data = await response.json();
                    setReviews(data);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    if (loading || reviews.length === 0) return null;

    return (
        <div style={{ 
            padding: '5rem 0', 
            backgroundColor: '#111827', // Dark background as seen in screenshot
            color: '#fff'
        }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ 
                        fontSize: '3rem', 
                        fontWeight: '800', 
                        fontFamily: "'Outfit', sans-serif",
                        letterSpacing: '-1px'
                    }}>
                        Trusted by Families
                    </h2>
                </div>

                <div style={{ 
                    display: 'flex', 
                    gap: '24px', 
                    overflowX: 'auto', 
                    paddingBottom: '20px',
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none',
                    WebkitOverflowScrolling: 'touch'
                }}>
                    {reviews.map((review, idx) => (
                        <div 
                            key={idx} 
                            style={{ 
                                minWidth: '450px', 
                                backgroundColor: '#1f2937', 
                                borderRadius: '24px', 
                                overflow: 'hidden', 
                                display: 'flex',
                                height: '280px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                flexShrink: 0
                            }}
                        >
                            {/* Left: Review Image */}
                            <div style={{ width: '40%', height: '100%', position: 'relative' }}>
                                <img 
                                    src={review.images && review.images[0] ? (review.images[0].startsWith('http') ? review.images[0] : `${API_BASE}${review.images[0]}`) : '/images/sample-user.jpg'} 
                                    alt="Review" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                                {review.images && review.images.length > 1 && (
                                    <div style={{ 
                                        position: 'absolute', 
                                        top: '12px', 
                                        right: '12px', 
                                        backgroundColor: 'rgba(0,0,0,0.5)', 
                                        padding: '2px 8px', 
                                        borderRadius: '4px', 
                                        fontSize: '0.7rem' 
                                    }}>
                                        1/{review.images.length}
                                    </div>
                                )}
                            </div>

                            {/* Right: Review Text */}
                            <div style={{ width: '60%', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ 
                                    fontSize: '1.2rem', 
                                    fontWeight: '700', 
                                    marginBottom: '12px',
                                    lineHeight: '1.4'
                                }}>
                                    {review.title || 'Amazing Product!'}
                                </h3>
                                <p style={{ 
                                    fontSize: '0.9rem', 
                                    color: '#9ca3af', 
                                    lineHeight: '1.6',
                                    flex: 1,
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 4,
                                    WebkitBoxOrient: 'vertical'
                                }}>
                                    "{review.comment}"
                                </p>
                                
                                <div style={{ marginTop: '16px' }}>
                                    <p style={{ fontWeight: '700', marginBottom: '8px' }}>{review.user}</p>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} style={{ 
                                                color: i < review.rating ? '#fbbf24' : '#4b5563', 
                                                fontSize: '1.1rem' 
                                            }}>
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination Dots Indicator */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#fff' }}></div>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4b5563' }}></div>
                </div>
            </div>
            <style>{`
                div::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default TrustedByFamilies;
