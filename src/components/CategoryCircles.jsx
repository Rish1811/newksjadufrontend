import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../config';

const CategoryCircles = () => {
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/categories`);
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    if (categories.length === 0) return null;

    return (
        <div style={{ 
            padding: '3rem 1rem', 
            maxWidth: '1200px', 
            margin: '0 auto',
            overflowX: 'auto',
            display: 'flex',
            justifyContent: 'center',
            gap: '2.5rem',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            flexWrap: 'wrap'
        }}>
            {categories.map((cat) => (
                <div 
                    key={cat._id} 
                    onClick={() => navigate(`/shop?category=${cat.name}`)}
                    style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        width: '110px'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <div style={{ 
                        width: '90px', 
                        height: '90px', 
                        borderRadius: '50%', 
                        backgroundColor: cat.bgColor || '#f3e8ff', // Custom Background
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden',
                        marginBottom: '15px',
                        border: `3px solid ${cat.borderColor || '#8E59A6'}`, // Custom Border
                        boxShadow: `0 4px 12px ${cat.borderColor ? cat.borderColor + '26' : 'rgba(142, 89, 166, 0.15)'}`,
                        paddingTop: '40px', // Reduced padding for zoom effect
                        transition: 'var(--bg-transition)'
                    }}>
                        {cat.image ? (
                            <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(3.15)' }} />
                        ) : (
                            <div style={{ fontSize: '2rem', filter: 'grayscale(0.5)' }}>🌿</div>
                        )}
                    </div>
                    <span style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: '700', 
                        color: 'var(--color-text-main)', // Theme aware
                        textAlign: 'center',
                        lineHeight: '1.2',
                        textTransform: 'lowercase',
                        letterSpacing: '0.2px'
                    }}>
                        {cat.name}
                    </span>
                </div>
            ))}
        </div>
    );
};


export default CategoryCircles;
