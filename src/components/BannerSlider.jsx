import React, { useState, useEffect } from 'react';
import API_BASE from '../config';

const BannerSlider = () => {
    const [banners, setBanners] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const getImageUrl = (path) => {
        if (!path) return '';
        return path.startsWith('http') ? path : `${API_BASE}${path}`;
    };

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/banners`);
                const data = await response.json();
                setBanners(data);
            } catch (error) {
                console.error('Error fetching banners:', error);
            }
        };

        fetchBanners();
    }, []);

    useEffect(() => {
        if (banners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
        }, 3000); // 3 second interval

        return () => clearInterval(interval);
    }, [banners]);

    if (!banners || banners.length === 0) {
        return null;
    }

    return (
        <div style={{
            width: '100%',
            height: '400px',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#f0f0f0'
        }}>
            <div style={{
                display: 'flex',
                height: '100%',
                transition: 'transform 0.8s ease-in-out',
                transform: `translateX(-${currentIndex * 100}%)`
            }}>
                {banners.map((banner) => (
                    <div
                        key={banner._id}
                        style={{
                            minWidth: '100%',
                            height: '100%',
                            backgroundImage: `url(${getImageUrl(banner.image)})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {banner.title && (
                            <div style={{
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                padding: '1rem 2rem',
                                borderRadius: '50px',
                                color: 'white',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                            }}>
                                {banner.title}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '10px',
                zIndex: 10
            }}>
                {banners.map((_, index) => (
                    <div
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: index === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
                            cursor: 'pointer',
                            transition: 'background 0.3s'
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default BannerSlider;
