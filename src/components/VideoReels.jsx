import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api, imageUrl, formatPrice } from '../api/client';

/**
 * Short product videos.
 *
 * Every reel used to carry `autoPlay` with no preload hint, so opening the
 * home page started downloading and decoding all of them at once - easily
 * tens of megabytes. Now a video only loads and plays while it is actually
 * on screen, and pauses again as soon as it scrolls away.
 */
const VideoReels = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const videoRefs = useRef(new Map());

    useEffect(() => {
        api.get('/api/videos', { auth: false })
            .then((data) => setVideos(Array.isArray(data) ? data : []))
            .catch(() => setVideos([]))
            .finally(() => setLoading(false));
    }, []);

    const registerVideo = useCallback((id, node) => {
        if (node) videoRefs.current.set(id, node);
        else videoRefs.current.delete(id);
    }, []);

    useEffect(() => {
        if (videos.length === 0) return undefined;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    const video = entry.target;
                    if (entry.isIntersecting) {
                        if (!video.src && video.dataset.src) video.src = video.dataset.src;
                        video.play().catch(() => { /* autoplay can be blocked; harmless */ });
                    } else {
                        video.pause();
                    }
                }
            },
            { threshold: 0.5 }
        );

        videoRefs.current.forEach((node) => observer.observe(node));
        return () => observer.disconnect();
    }, [videos]);

    if (loading || videos.length === 0) return null;

    return (
        <section className="section" style={{ backgroundColor: 'var(--color-bg)' }}>
            <div className="container">
                <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h2 className="section-title" style={{ marginBottom: 0 }}>Our Happy Families</h2>
                </header>

                <div
                    className="no-scrollbar"
                    style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 16, scrollSnapType: 'x mandatory' }}
                >
                    {videos.map((video) => {
                        const product = video.productLink;
                        return (
                            <div
                                key={video._id}
                                style={{
                                    minWidth: 'min(290px, 78vw)',
                                    aspectRatio: '9 / 16',
                                    maxHeight: 520,
                                    borderRadius: 22,
                                    overflow: 'hidden',
                                    position: 'relative',
                                    flexShrink: 0,
                                    boxShadow: 'var(--shadow-md)',
                                    backgroundColor: '#000',
                                    scrollSnapAlign: 'start',
                                }}
                            >
                                <video
                                    ref={(node) => registerVideo(video._id, node)}
                                    data-src={video.videoUrl}
                                    loop
                                    muted
                                    playsInline
                                    preload="none"
                                    aria-label={video.title || 'Product video'}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />

                                {product && (
                                    <Link
                                        to={`/product/${product._id}`}
                                        style={{
                                            position: 'absolute',
                                            insetInline: 0,
                                            bottom: 0,
                                            padding: 16,
                                            background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12,
                                            color: '#fff',
                                        }}
                                    >
                                        <span style={{ width: 44, height: 44, backgroundColor: '#fff', borderRadius: 8, padding: 4, flexShrink: 0 }}>
                                            <img
                                                src={imageUrl(product.image)}
                                                alt=""
                                                loading="lazy"
                                                decoding="async"
                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                            />
                                        </span>
                                        <span style={{ flex: 1, overflow: 'hidden' }}>
                                            <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {product.name}
                                            </span>
                                            {/* Only the real price - the old overlay invented a
                                                "was" price of price × 1.5 for every product. */}
                                            <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{formatPrice(product.price)}</span>
                                        </span>
                                        <span aria-hidden="true" style={{ fontSize: '1.2rem', opacity: 0.85 }}>›</span>
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default VideoReels;
