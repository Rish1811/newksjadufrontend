import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../config';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import BannerSlider from '../components/BannerSlider';

const Home = () => {
    const [recentReviews, setRecentReviews] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/products/all/reviews`);
                if (res.ok) {
                    const data = await res.json();
                    setRecentReviews(data);
                }
            } catch (error) {
                console.error('Failed to fetch global reviews:', error);
            }
        };
        fetchReviews();
    }, []);

    return (
        <div style={{ backgroundColor: '#fdfdfd' }}>
            <Hero />
            <BannerSlider />
            <ProductGrid />

            {recentReviews.length > 0 && (
                <div style={{ padding: '4rem 1rem', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '15px', marginBottom: '4rem' }}>
                    <h2 style={{ color: 'rgb(0, 0, 128)', textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>See What Families Say</h2>

                    <div style={{ display: 'flex', gap: '2rem', overflowX: 'auto', paddingBottom: '1rem', WebkitOverflowScrolling: 'touch' }}>
                        {recentReviews.map((review, idx) => (
                            <div key={idx} style={{
                                minWidth: '320px',
                                padding: '2rem',
                                border: '1px solid #eee',
                                borderRadius: '15px',
                                backgroundColor: '#fafafa',
                                flexShrink: 0,
                                boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{review.user}</span>
                                    <span style={{ color: '#FFB800', fontSize: '1.2rem' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1.5rem', fontWeight: 'bold' }}>
                                    Reviewed <span onClick={() => navigate(`/product/${review.productId}`)} style={{ color: 'rgb(0, 0, 128)', cursor: 'pointer', textDecoration: 'underline' }}>{review.productName}</span>
                                </div>
                                <p style={{ color: '#444', lineHeight: '1.6', fontSize: '0.95rem', minHeight: '60px' }}>
                                    "{review.comment}"
                                </p>

                                {review.images && review.images.length > 0 && (
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '1rem' }}>
                                        {review.images.map((img, i) => (
                                            <div key={i} style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                                                <img src={`${API_BASE}${img}`} alt="Review" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
