import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../config';

const ConcernsSection = () => {
    const [concerns, setConcerns] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchConcerns = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/concerns`);
                if (response.ok) {
                    const data = await response.json();
                    setConcerns(data);
                }
            } catch (error) {
                console.error('Error fetching concerns:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchConcerns();
    }, []);

    if (loading || concerns.length === 0) return null;

    return (
        <div style={{ padding: '4rem 0', backgroundColor: '#fff' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <span style={{ 
                        backgroundColor: '#FEF3C7', 
                        color: '#92400E', 
                        padding: '4px 16px', 
                        borderRadius: '20px', 
                        fontSize: '0.85rem', 
                        fontWeight: '700',
                        marginBottom: '1rem',
                        display: 'inline-block'
                    }}>
                        Shop by Concern
                    </span>
                    <h2 style={{ 
                        fontSize: '2.5rem', 
                        fontWeight: '800', 
                        color: '#111827',
                        fontFamily: "'Outfit', sans-serif",
                        marginTop: '0.5rem'
                    }}>
                        Which Mess Matters?
                    </h2>
                </div>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                    gap: '24px',
                    justifyContent: 'center'
                }}>
                    {concerns.map((concern) => (
                        <div 
                            key={concern._id} 
                            onClick={() => concern.linkUrl && navigate(concern.linkUrl)}
                            style={{ 
                                backgroundColor: '#f9f9f5', 
                                borderRadius: '24px', 
                                padding: '24px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                border: '1px solid rgba(0,0,0,0.03)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.05)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <h3 style={{ 
                                    fontSize: '1.5rem', 
                                    fontWeight: '800', 
                                    color: '#111827',
                                    marginBottom: '12px',
                                    lineHeight: '1.2'
                                }}>
                                    {concern.title}
                                </h3>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '4px',
                                    color: '#111827',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    textDecoration: 'underline'
                                }}>
                                    View Products <span>›</span>
                                </div>
                            </div>
                            
                            <div style={{ width: '120px', height: '120px', flexShrink: 0 }}>
                                <img 
                                    src={concern.image} 
                                    alt={concern.title} 
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ConcernsSection;
