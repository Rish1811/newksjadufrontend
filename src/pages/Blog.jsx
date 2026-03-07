import React from 'react';

const Blog = () => {
    const posts = [
        { title: "5 Tips for a Toxin-Free Home", date: "Jan 10, 2024", excerpt: "Discover simple changes you can make today to reduce chemical exposure in your living space." },
        { title: "Why Plant-Based? The Science Explained", date: "Jan 25, 2024", excerpt: "Understand the mechanism behind natural cleaners and why they are just as effective as chemical ones." },
        { title: "Spring Cleaning Checklist", date: "Feb 01, 2024", excerpt: "Don't miss a spot! Here is your ultimate guide to deep cleaning your home this season." }
    ];

    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <h1 className="section-title">The Clean Blog</h1>
            <div style={{ display: 'grid', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                {posts.map((post, i) => (
                    <div key={i} style={{
                        padding: '2rem',
                        border: '1px solid #eee',
                        borderRadius: '8px',
                        backgroundColor: 'white'
                    }}>
                        <span style={{ fontSize: '0.85rem', color: '#999', textTransform: 'uppercase' }}>{post.date}</span>
                        <h2 style={{ margin: '0.5rem 0', color: 'var(--color-primary)' }}>{post.title}</h2>
                        <p style={{ color: '#666', marginBottom: '1rem' }}>{post.excerpt}</p>
                        <a href="#" style={{ color: 'var(--color-secondary)', fontWeight: '600' }}>Read More →</a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Blog;
