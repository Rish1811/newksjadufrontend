import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../api/client';
import ProductCard from './ProductCard';
import { ProductCardSkeleton } from './Skeleton';

/**
 * Horizontal product rail for the home page.
 *
 * All five rails ask for the same product list, so they share one cached
 * request from the API client instead of firing five identical fetches.
 */
const ProductRow = ({ title, section, badgeText }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        const controller = new AbortController();

        api.get('/api/products', { auth: false, signal: controller.signal })
            .then((data) => {
                const all = Array.isArray(data) ? data : [];
                setProducts(section ? all.filter((p) => p.displaySection === section) : all);
            })
            .catch((err) => { if (err.name !== 'AbortError') setProducts([]); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });

        return () => controller.abort();
    }, [section]);

    // Hide an arrow when there is nothing more to scroll to in that direction.
    const updateArrows = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 8);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    }, []);

    useEffect(() => {
        updateArrows();
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener('scroll', updateArrows, { passive: true });
        window.addEventListener('resize', updateArrows);
        return () => {
            el.removeEventListener('scroll', updateArrows);
            window.removeEventListener('resize', updateArrows);
        };
    }, [products, updateArrows]);

    const scroll = (direction) => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: direction === 'left' ? -el.clientWidth * 0.8 : el.clientWidth * 0.8, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <section className="section" style={{ paddingBottom: 0 }}>
                <div className="container">
                    <h2 className="section-title">{title}</h2>
                    <div style={{ display: 'flex', gap: 24, overflow: 'hidden' }}>
                        {[0, 1, 2, 3].map((i) => (
                            <div key={i} style={{ minWidth: 300, flexShrink: 0 }}><ProductCardSkeleton /></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // An empty section simply doesn't render - no bare heading over a gap.
    if (products.length === 0) return null;

    const arrowStyle = (side, enabled) => ({
        position: 'absolute',
        [side]: -18,
        top: '42%',
        transform: 'translateY(-50%)',
        width: 44,
        height: 44,
        borderRadius: '50%',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 10,
        boxShadow: 'var(--shadow-sm)',
        color: 'var(--color-text)',
        opacity: enabled ? 1 : 0,
        pointerEvents: enabled ? 'auto' : 'none',
        transition: 'opacity 200ms ease',
    });

    return (
        <section className="section" style={{ paddingBottom: '2.5rem' }}>
            <div className="container">
                <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', textAlign: 'center' }}>
                    {badgeText && <span className="section-eyebrow">{badgeText}</span>}
                    <h2 className="section-title" style={{ marginBottom: 0 }}>{title}</h2>
                </header>

                <div style={{ position: 'relative' }}>
                    {/* Hidden on small screens: the arrows sit outside the
                        container and pushed the page 3px wider than the
                        viewport, and touch users swipe the rail anyway. */}
                    <button type="button" aria-label="Scroll left" className="rail-arrow" onClick={() => scroll('left')} style={arrowStyle('left', canScrollLeft)}>
                        <ChevronLeft size={22} />
                    </button>
                    <button type="button" aria-label="Scroll right" className="rail-arrow" onClick={() => scroll('right')} style={arrowStyle('right', canScrollRight)}>
                        <ChevronRight size={22} />
                    </button>

                    <div
                        ref={scrollRef}
                        className="no-scrollbar"
                        style={{
                            display: 'flex',
                            gap: 24,
                            overflowX: 'auto',
                            paddingBottom: 16,
                            scrollSnapType: 'x mandatory',
                            WebkitOverflowScrolling: 'touch',
                        }}
                    >
                        {products.map((product) => (
                            <div key={product._id} style={{ minWidth: 'min(300px, 78vw)', flexShrink: 0, scrollSnapAlign: 'start' }}>
                                <ProductCard {...product} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductRow;
