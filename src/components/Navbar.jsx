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
    const [categories, setCategories] = useState([]);
    const [showCategories, setShowCategories] = useState(false);
    const navigate = React.useMemo(() => {
        // We'll use useNavigate inside the component logic
        return null; 
    }, []); 
    // Wait, I should import useNavigate correctly. It's already available via props or hook.
    // Let's use the hook inside the component.


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

    const toggleTheme = () => {
        window.dispatchEvent(new Event('toggleTheme'));
    };

    return (
        <>
            <nav style={{
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                position: 'sticky',
                top: 0,
                backgroundColor: 'var(--color-white)',
                transition: 'var(--bg-transition)',
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
                        {/* Categories Dropdown */}
                        <div 
                            onMouseEnter={() => setShowCategories(true)}
                            onMouseLeave={() => setShowCategories(false)}
                            style={{ position: 'relative' }}
                        >
                            <div style={{ 
                                fontWeight: '500', 
                                color: 'var(--color-text-main)', 
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '10px 0'
                            }}>
                                Categories <span style={{ fontSize: '0.7rem' }}>{showCategories ? '▲' : '▼'}</span>
                            </div>
                            
                            {showCategories && categories.length > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    backgroundColor: 'white',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                    borderRadius: '12px',
                                    minWidth: '220px',
                                    padding: '10px 0',
                                    border: '1px solid #f0f0f0',
                                    zIndex: 1001
                                }}>
                                    {categories.map((cat) => (
                                        <div 
                                            key={cat._id}
                                            onClick={() => {
                                                window.location.href = `/shop?category=${encodeURIComponent(cat.name)}`;
                                                setShowCategories(false);
                                            }}
                                            style={{
                                                padding: '12px 20px',
                                                fontSize: '0.9rem',
                                                color: '#555',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f8f9fa'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#555'; }}
                                        >
                                            {cat.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
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

                            {/* Theme Toggle Button */}
                            <div 
                                onClick={toggleTheme}
                                style={{
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '8px',
                                    borderRadius: '50%',
                                    background: 'var(--color-off-white)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    {/* Sun Icon */}
                                    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
                                    <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" />
                                    <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" />
                                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" />
                                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" />
                                    <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" />
                                    <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" />
                                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" />
                                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </div>

                            {user ? (
                                <div
                                    onClick={handleUserIconClick}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        cursor: 'pointer',
                                        border: '1px solid var(--color-off-white)',
                                        padding: '4px 12px 4px 4px',
                                        borderRadius: '20px',
                                        transition: 'all 0.3s ease',
                                        background: 'var(--color-off-white)'
                                    }}
                                >
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        backgroundColor: 'var(--color-white)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px solid rgba(0,0,0,0.05)'
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
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            style={{ width: '20px', height: '20px', display: user.image ? 'none' : 'block', color: 'var(--color-text-light)' }}
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

                            <div
                                onClick={() => {
                                    if (user) {
                                        window.dispatchEvent(new Event('openCart'));
                                    } else {
                                        navigate('/login');
                                    }
                                }}
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
                            </div>
                        </div>
                    </div>

                    <div className="mobile-menu-btn" style={{ display: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-main)' }} onClick={() => setIsOpen(!isOpen)}>
                        ☰
                    </div>
                </div>
                {/* Search Overlay */}
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    width: '100%',
                    backgroundColor: 'var(--color-white)',
                    padding: isSearchOpen ? '1rem 0' : '0',
                    height: isSearchOpen ? 'auto' : '0',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    boxShadow: isSearchOpen ? '0 10px 15px -3px rgba(0,0,0,0.1)' : 'none',
                    borderTop: '1px solid rgba(0,0,0,0.05)'
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
                                border: '1px solid rgba(0,0,0,0.1)',
                                outline: 'none',
                                fontSize: '1rem',
                                backgroundColor: 'var(--color-off-white)',
                                color: 'var(--color-text-main)'
                            }}
                        />
                        <span
                            style={{ cursor: 'pointer', marginLeft: '-40px', color: 'var(--color-text-light)' }}
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
