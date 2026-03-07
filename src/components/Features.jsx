import React from 'react';

const Features = () => {
    const features = [
        { title: "Plant Based", icon: "🌱", desc: "Derived from natural ingredients" },
        { title: "Baby Safe", icon: "👶", desc: "No harsh chemicals" },
        { title: "Pet Friendly", icon: "🐾", desc: "Safe for your furry friends" },
        { title: "Toxin Free", icon: "✨", desc: "No ammonia, no bleach" },
    ];

    return (
        <section style={{ backgroundColor: '#F0F4F8', padding: '4rem 0' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
                {features.map((f, i) => (
                    <div key={i} style={{
                        flex: '1 1 200px',
                        textAlign: 'center',
                        padding: '2rem',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{f.icon}</div>
                        <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>{f.title}</h3>
                        <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>{f.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Features;
