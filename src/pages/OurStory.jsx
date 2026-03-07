import React from 'react';

const OurStory = () => {
    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <h1 className="section-title">Our Story</h1>
            <div style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
                <p style={{ marginBottom: '1.5rem' }}>
                    At K'S JADU, we believe that a clean home shouldn't come at the cost of your health or the environment. It all started when our founder realized that most cleaning products on the market were filled with harsh chemicals that triggered allergies and were harmful to pets.
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                    We set out on a mission to create effective, plant-based cleaners that actually work. After months of research and testing, we developed our proprietary blend of natural enzymes and plant extracts that tackle tough stains while being gentle on your skin.
                </p>
                <p>
                    Today, thousands of homes trust K'S JADU for a safe, sparkling clean. We are proud to be 100% toxin-free, cruelty-free, and made with love.
                </p>
                <img
                    src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=60"
                    alt="Our Story Team"
                    style={{ width: '100%', borderRadius: '12px', marginTop: '3rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                />
            </div>
        </div>
    );
};

export default OurStory;
