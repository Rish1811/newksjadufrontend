import React, { useState, useEffect, useRef } from 'react';
import API_BASE from '../config';

const VideoReels = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/videos`);
                if (response.ok) {
                    const data = await response.json();
                    setVideos(data);
                }
            } catch (error) {
                console.error('Error fetching videos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    if (loading) return null;
    if (videos.length === 0) return null;

    return (
        <div style={{ padding: '4rem 0', backgroundColor: '#fff' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ 
                        fontSize: '2.5rem', 
                        fontWeight: '800', 
                        color: '#111827',
                        fontFamily: "'Outfit', sans-serif"
                    }}>
                        Our Happy Families
                    </h2>
                </div>

                <div 
                    ref={scrollRef}
                    style={{ 
                        display: 'flex', 
                        gap: '20px', 
                        overflowX: 'auto', 
                        paddingBottom: '20px',
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none',
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                    {videos.map((video) => (
                        <div 
                            key={video._id} 
                            style={{ 
                                minWidth: '300px', 
                                height: '530px', 
                                borderRadius: '24px', 
                                overflow: 'hidden', 
                                position: 'relative',
                                flexShrink: 0,
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                            }}
                        >
                            {/* Video Player */}
                            <video 
                                src={video.videoUrl} 
                                loop 
                                muted 
                                autoPlay
                                playsInline 
                                style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover',
                                    cursor: 'pointer'
                                }}
                            />

                            {/* Product Info Overlay */}
                            {video.productLink && (
                                <div style={{ 
                                    position: 'absolute', 
                                    bottom: '0', 
                                    left: '0', 
                                    right: '0', 
                                    padding: '20px',
                                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    color: 'white'
                                }}>
                                    <div style={{ 
                                        width: '45px', 
                                        height: '45px', 
                                        backgroundColor: 'white', 
                                        borderRadius: '8px',
                                        padding: '4px',
                                        flexShrink: 0
                                    }}>
                                        <img 
                                            src={video.productLink.image.startsWith('http') ? video.productLink.image : `${API_BASE}${video.productLink.image}`} 
                                            alt={video.productLink.name} 
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                                        />
                                    </div>
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <h4 style={{ 
                                            fontSize: '0.85rem', 
                                            fontWeight: '700', 
                                            margin: '0',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {video.productLink.name}
                                        </h4>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                                            <span style={{ fontWeight: '800', fontSize: '0.95rem' }}>₹{video.productLink.price}</span>
                                            <span style={{ 
                                                textDecoration: 'line-through', 
                                                fontSize: '0.75rem', 
                                                opacity: 0.7 
                                            }}>
                                                ₹{Math.round(video.productLink.price * 1.5)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Play Icon Placeholder */}
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                color: 'white',
                                fontSize: '3rem',
                                opacity: 0.5,
                                pointerEvents: 'none'
                            }}>
                                ▶
                            </div>
                        </div>
                    ))}
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

export default VideoReels;
