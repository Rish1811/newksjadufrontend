import React, { useState, useEffect, useRef } from 'react';
import { api, imageUrl } from '../api/client';

const SLIDE_INTERVAL_MS = 6000;

const BannerSlider = () => {
    const [banners, setBanners] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setPaused] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        api.get('/api/banners', { auth: false })
            .then((data) => setBanners(Array.isArray(data) ? data : []))
            .catch(() => setBanners([]));
    }, []);

    useEffect(() => {
        // Pausing on hover/focus stops the banner sliding out from under
        // someone who is reading or tabbing through it.
        if (banners.length <= 1 || isPaused) return undefined;
        const interval = setInterval(() => {
            setCurrentIndex((i) => (i + 1) % banners.length);
        }, SLIDE_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [banners.length, isPaused]);

    if (banners.length === 0) return null;

    const go = (delta) => setCurrentIndex((i) => (i + delta + banners.length) % banners.length);

    return (
        <section
            ref={containerRef}
            aria-roledescription="carousel"
            aria-label="Promotions"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
            onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') go(-1);
                if (e.key === 'ArrowRight') go(1);
            }}
            tabIndex={0}
            style={{
                width: '100%',
                // Scales with the viewport instead of a fixed 400px that
                // letterboxed on desktop and cropped badly on phones.
                aspectRatio: '16 / 6',
                minHeight: 200,
                maxHeight: 440,
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: 'var(--color-surface-alt)',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    height: '100%',
                    transition: 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: `translateX(-${currentIndex * 100}%)`,
                }}
            >
                {banners.map((banner, index) => (
                    <div
                        key={banner._id}
                        role="group"
                        aria-roledescription="slide"
                        aria-label={`${index + 1} of ${banners.length}`}
                        aria-hidden={index !== currentIndex}
                        style={{ minWidth: '100%', height: '100%', position: 'relative', display: 'grid', placeItems: 'center' }}
                    >
                        <img
                            src={imageUrl(banner.image)}
                            alt={banner.title || ''}
                            // Only the first slide is worth fetching eagerly.
                            loading={index === 0 ? 'eager' : 'lazy'}
                            fetchPriority={index === 0 ? 'high' : 'low'}
                            decoding="async"
                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {banner.title && (
                            <span
                                style={{
                                    position: 'relative',
                                    backgroundColor: 'rgba(0,0,0,0.55)',
                                    padding: '0.8rem 1.8rem',
                                    borderRadius: 'var(--radius-pill)',
                                    color: '#fff',
                                    fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
                                    fontWeight: 700,
                                }}
                            >
                                {banner.title}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {banners.length > 1 && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 16,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: 8,
                        zIndex: 10,
                    }}
                >
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setCurrentIndex(index)}
                            aria-label={`Go to slide ${index + 1}`}
                            aria-current={index === currentIndex}
                            style={{
                                width: index === currentIndex ? 24 : 10,
                                height: 10,
                                borderRadius: 'var(--radius-pill)',
                                backgroundColor: index === currentIndex ? '#fff' : 'rgba(255,255,255,0.55)',
                                transition: 'all 250ms ease',
                            }}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default BannerSlider;
