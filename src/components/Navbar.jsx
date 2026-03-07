import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API_BASE from '../config';

import ProfileSidebar from './ProfileSidebar';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    const fetchCartCount = React.useCallback(async () => {
        if (!user) {
            setCartCount(0);
            return;
        }
        try {
            const response = await fetch(`${API_BASE}/api/cart`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCartCount(data.length);
            }
        } catch (error) {
            console.error('Error fetching cart count:', error);
        }
    }, [user]);

    // Update user state if localStorage changes (e.g. after login)
    React.useEffect(() => {
        const handleStorageChange = () => {
            setUser(JSON.parse(localStorage.getItem('user')));
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('cartUpdated', fetchCartCount);

        fetchCartCount();

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('cartUpdated', fetchCartCount);
        };
    }, [fetchCartCount]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setCartCount(0);
        setIsProfileOpen(false);
        window.location.href = '/login';
    };

    const handleUserIconClick = (e) => {
        if (user) {
            e.preventDefault(); // Prevent navigation if logged in
            setIsProfileOpen(true);
        }
        // else let Link take us to /login
    };

    return (
        <>
            <nav style={{
                borderBottom: '1px solid #eee',
                position: 'sticky',
                top: 0,
                backgroundColor: 'white',
                zIndex: 1000
            }}>
                <div className="container" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '80px'
                }}>
                    <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                        <img src="/logo.png" alt="K'S JADU Utils" className="nav-logo-img" style={{ height: '50px', transition: 'transform 0.5s ease' }} />
                        <span className="brand-name" style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '1px' }}>K'S JADU</span>
                    </Link>

                    <div className={`nav-links ${isOpen ? 'open' : ''}`} style={{ display: 'flex', gap: '2rem', transition: 'all 0.3s ease', alignItems: 'center' }}>
                        <Link to="/shop" className="nav-item" style={{ fontWeight: '500', color: 'var(--color-text-main)', fontSize: '0.95rem' }}>Shop</Link>
                        <Link to="/our-story" className="nav-item" style={{ fontWeight: '500', color: 'var(--color-text-main)', fontSize: '0.95rem' }}>Our Story</Link>
                        <Link to="/ingredients" className="nav-item" style={{ fontWeight: '500', color: 'var(--color-text-main)', fontSize: '0.95rem' }}>Ingredients</Link>
                        <Link to="/blog" className="nav-item" style={{ fontWeight: '500', color: 'var(--color-text-main)', fontSize: '0.95rem' }}>Blog</Link>
                        <Link to="/wholesale" className="nav-item" style={{ fontWeight: '500', color: 'var(--color-text-main)', fontSize: '0.95rem' }}>Wholesale</Link>
                        {user && <Link to="/my-orders" className="nav-item" style={{ fontWeight: '500', color: 'var(--color-text-main)', fontSize: '0.95rem' }}>My Orders</Link>}

                        {/* Icons moved inside nav-links for mobile responsiveness */}
                        <div className="icons" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginLeft: '1rem' }}>
                            <span style={{ cursor: 'pointer' }} onClick={() => setIsSearchOpen(!isSearchOpen)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </span>

                            {user ? (
                                <div
                                    onClick={handleUserIconClick}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        cursor: 'pointer',
                                        border: '1px solid #ddd',
                                        padding: '4px 12px 4px 4px',
                                        borderRadius: '20px',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        backgroundColor: '#f1f5f9',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        {user.image ? (
                                            <img
                                                src={`${API_BASE}${user.image}`}
                                                alt={user.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                            />
                                        ) : null}
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="#94a3b8"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            style={{ width: '20px', height: '20px', display: user.image ? 'none' : 'block' }}
                                        >
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                    </div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-primary)' }}>
                                        {user.name.split(' ')[0]}
                                    </span>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    style={{ cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center' }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                </Link>
                            )}

                            <Link
                                to={user ? "/my-orders" : "/login"}
                                style={{
                                    cursor: 'pointer',
                                    position: 'relative',
                                    color: 'inherit',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                                <span style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    right: '-8px',
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '16px',
                                    height: '16px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    fontSize: '0.65rem'
                                }}>{cartCount}</span>
                            </Link>
                        </div>
                    </div>

                    <div className="mobile-menu-btn" style={{ display: 'none', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setIsOpen(!isOpen)}>
                        ☰
                    </div>
                </div>
                {/* Search Overlay */}
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    width: '100%',
                    backgroundColor: 'white',
                    padding: isSearchOpen ? '1rem 0' : '0',
                    height: isSearchOpen ? 'auto' : '0',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    boxShadow: isSearchOpen ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
                    borderTop: '1px solid #f0f0f0'
                }}>
                    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <input
                            type="text"
                            placeholder="Search for products..."
                            style={{
                                width: '100%',
                                maxWidth: '600px',
                                padding: '12px 20px',
                                borderRadius: '30px',
                                border: '1px solid #ddd',
                                outline: 'none',
                                fontSize: '1rem',
                                backgroundColor: '#f8f9fa'
                            }}
                        />
                        <span
                            style={{ cursor: 'pointer', marginLeft: '-40px', color: '#666' }}
                            onClick={() => setIsSearchOpen(false)}
                        >
                            ✕
                        </span>
                    </div>
                </div>
            </nav>

            <ProfileSidebar
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={user}
                onLogout={handleLogout}
                onUpdateUser={setUser}
            />
        </>
    );
};

export default Navbar;
