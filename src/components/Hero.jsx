import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <section className="hero-section">
            <div className="container hero-container">
                <div className="hero-content" style={{ maxWidth: '500px', zIndex: 2 }}>
                    <span style={{
                        color: 'var(--color-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        marginBottom: '1rem',
                        display: 'block'
                    }}>
                        Plant-Based Power
                    </span>
                    <h1 style={{
                        fontSize: '3.5rem',
                        color: 'var(--color-primary)',
                        lineHeight: 1.1,
                        marginBottom: '1.5rem'
                    }}>
                        Tough on Stains, <br /> Safe for Loved Ones.
                    </h1>
                    <p style={{
                        fontSize: '1.1rem',
                        color: 'var(--color-text-light)',
                        marginBottom: '2rem'
                    }}>
                        Experience the power of nature with our range of toxin-free, eco-friendly cleaning products designed for modern homes.
                    </p>
                    <Link to="/shop" className="btn btn-primary">Shop Bestsellers</Link>
                </div>

                <div className="hero-image" style={{
                    position: 'relative',
                    width: '50%',
                    height: '600px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <div className="orbit-container">
                        {/* Background Bubbles */}
                        {[...Array(15)].map((_, i) => {
                            const size = Math.random() * 30 + 10; // 10px to 40px
                            const isDark = Math.random() > 0.5;
                            const color = isDark ? 'rgb(0, 0, 80)' : 'rgb(0, 0, 128)';
                            const duration = Math.random() * 5 + 3; // 3s to 8s
                            const delay = Math.random() * 5;
                            const left = Math.random() * 100; // 0% to 100% relative to container
                            const top = Math.random() * 80 + 20; // Start lower down

                            return (
                                <div key={`bubble-${i}`} className="background-bubble" style={{
                                    width: `${size}px`,
                                    height: `${size}px`,
                                    background: color,
                                    left: `${left}%`,
                                    top: `${top}%`,
                                    animationDuration: `${duration}s`,
                                    animationDelay: `-${delay}s` // Negative delay to start mid-animation
                                }}></div>
                            );
                        })}

                        {/* Center Logo */}
                        <div className="center-logo">
                            <img src="/logo.png" alt="K'S JADU" style={{ width: '80%', height: 'auto' }} />
                        </div>

                        <div className="orbit-ring">
                            {[
                                "/product-sanitizer.png",
                                "/product-black-cleaner.png",
                                "/product-dishwash.png",
                                "/product-floor-cleaner.png",
                                "/product-glass-cleaner.png",
                                "/product-new-handwash.png"
                            ].map((imgSrc, index) => (
                                <div key={index} className="orbit-item">
                                    <img src={imgSrc} alt={`Product ${index + 1}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
