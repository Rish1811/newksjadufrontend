import React from 'react';

const Ingredients = () => {
    const ingredients = [
        { name: "Coconut Based Cleansers", desc: "Naturally cuts through grease and grime without stripping surfaces.", img: "/ingredient-coconut.png" },
        { name: "Citric Acid (Lemon)", desc: "A powerful natural disinfectant and tough stain remover.", img: "/ingredient-lemon.png" },
        { name: "Essential Oils", desc: "Provides fresh, natural fragrance without artificial perfumes.", img: "/ingredient-lavender.png" },
        { name: "Plant Enzymes", desc: "Breaks down organic waste and odors at a molecular level.", img: "/ingredient-enzyme.png" }
    ];

    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <h1 className="section-title">Clean Ingredients</h1>
            <p className="section-subtitle">Transparency is our promise. Here is what goes into our bottles.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                {ingredients.map((ing, i) => (
                    <div key={i} style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                        textAlign: 'center'
                    }}>
                        <img src={ing.img} alt={ing.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>{ing.name}</h3>
                            <p style={{ color: '#666', fontSize: '0.95rem' }}>{ing.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Ingredients;
