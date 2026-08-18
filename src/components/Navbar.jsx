import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { api, imageUrl } from '../api/client';
import { useApp } from '../context/AppContext';
import ProfileSidebar from './ProfileSidebar';

const NAV_LINKS = [
    { to: '/shop', label: 'Shop' },
    { to: '/our-story', label: 'Our Story' },
    { to: '/ingredients', label: 'Ingredients' },
    { to: '/blog', label: 'Blog' },
    { to: '/wholesale', label: 'Wholesale' },
];

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout, cartSummary, openCart, theme, toggleTheme } = useApp();

    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isProfileOpen, setProfileOpen] = useState(false);
    const [showCategories, setShowCategories] = useState(false);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const searchInputRef = useRef(null);
    const categoryRef = useRef(null);

    useEffect(() => {
        api.get('/api/categories', { auth: false })
            .then((data) => setCategories(Array.isArray(data) ? data : []))
            .catch(() => setCategories([]));
    }, []);

    // Focus the field as soon as the search panel opens.
    useEffect(() => {
        if (isSearchOpen) searchInputRef.current?.focus();
    }, [isSearchOpen]);

    // Close the categories dropdown on outside click / Escape, so it isn't
    // stranded open on touch devices where there is no mouseleave.
    useEffect(() => {
        if (!showCategories) return;
        const onPointerDown = (e) => {
            if (categoryRef.current && !categoryRef.current.contains(e.target)) setShowCategories(false);
        };
        const onKeyDown = (e) => e.key === 'Escape' && setShowCategories(false);
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [showCategories]);

    const closeMenu = () => setMenuOpen(false);

    const handleLogout = () => {
        logout();
        setProfileOpen(false);
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const term = searchTerm.trim();
        if (!term) return;
        navigate(`/shop?keyword=${encodeURIComponent(term)}`);
        setSearchOpen(false);
        setSearchTerm('');
        closeMenu();
    };

    const goToCategory = (name) => {
        navigate(`/shop?category=${encodeURIComponent(name)}`);
        setShowCategories(false);
        closeMenu();
    };

    const handleCartClick = () => {
        // This used to call a `navigate` that was initialised to null, which
        // threw a TypeError and killed the whole header for signed-out users.
        if (user) openCart();
        else navigate('/login?redirect=cart');
    };

    const iconProps = {
        xmlns: 'http://www.w3.org/2000/svg',
        width: 20,
        height: 20,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
    };

    return (
        <>
            <nav
                style={{
                    borderBottom: '1px solid var(--color-border)',
                    position: 'sticky',
                    top: 0,
                    backgroundColor: 'var(--color-surface)',
                    transition: 'var(--bg-transition)',
                    zIndex: 1000,
                }}
            >
                <div
                    className="container"
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        height: 'var(--header-height)',
                        gap: '1rem',
                    }}
                >
                    <Link to="/" className="logo" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <img src="/logo.png" alt="" className="nav-logo-img" width="48" height="48" style={{ height: 48, width: 'auto' }} />
                        <span className="brand-name" style={{ fontSize: '1.6rem' }}>K'S JADU</span>
                    </Link>

                    {/* Layout lives in CSS, not an inline style: an inline
                        display:flex outranks the media query and would leave the
                        full desktop nav on screen next to the hamburger. */}
                    <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
                        <div
                            ref={categoryRef}
                            onMouseEnter={() => setShowCategories(true)}
                            onMouseLeave={() => setShowCategories(false)}
                            style={{ position: 'relative' }}
                        >
                            <button
                                type="button"
                                className="nav-item"
                                aria-expanded={showCategories}
                                aria-haspopup="true"
                                onClick={() => setShowCategories((v) => !v)}
                                style={{ display: 'flex', alignItems: 'center', gap: 5, width: '100%' }}
                            >
                                Categories
                                <span style={{ fontSize: '0.6rem', transform: showCategories ? 'rotate(180deg)' : 'none', transition: 'transform 180ms' }}>▼</span>
                            </button>

                            {showCategories && categories.length > 0 && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        backgroundColor: 'var(--color-surface)',
                                        boxShadow: 'var(--shadow-md)',
                                        borderRadius: 'var(--radius-md)',
                                        minWidth: 230,
                                        padding: '8px 0',
                                        border: '1px solid var(--color-border)',
                                        zIndex: 1001,
                                    }}
                                >
                                    {categories.map((cat) => (
                                        <button
                                            key={cat._id}
                                            type="button"
                                            onClick={() => goToCategory(cat.name)}
                                            style={{
                                                display: 'block',
                                                width: '100%',
                                                textAlign: 'left',
                                                padding: '11px 20px',
                                                fontSize: '0.9rem',
                                                color: 'var(--color-text-muted)',
                                                transition: 'var(--transition)',
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.backgroundColor = 'var(--color-surface-alt)';
                                                e.currentTarget.style.color = 'var(--color-primary)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = 'var(--color-text-muted)';
                                            }}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {NAV_LINKS.map(({ to, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                onClick={closeMenu}
                                className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
                            >
                                {label}
                            </NavLink>
                        ))}

                        {user && (
                            <NavLink to="/my-orders" onClick={closeMenu} className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}>
                                My Orders
                            </NavLink>
                        )}

                        <div className="icons" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginLeft: '0.5rem' }}>
                            <button type="button" aria-label="Search products" onClick={() => setSearchOpen((v) => !v)} style={{ display: 'flex' }}>
                                <svg {...iconProps}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                            </button>

                            <button
                                type="button"
                                onClick={toggleTheme}
                                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                                style={{
                                    display: 'grid',
                                    placeItems: 'center',
                                    padding: 8,
                                    borderRadius: '50%',
                                    background: 'var(--color-surface-alt)',
                                }}
                            >
                                {theme === 'light' ? (
                                    <svg {...iconProps}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                                ) : (
                                    <svg {...iconProps}>
                                        <circle cx="12" cy="12" r="5" />
                                        <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                        <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                    </svg>
                                )}
                            </button>

                            {user ? (
                                <button
                                    type="button"
                                    onClick={() => setProfileOpen(true)}
                                    aria-label="Open your profile"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '4px 14px 4px 4px',
                                        borderRadius: 'var(--radius-pill)',
                                        background: 'var(--color-surface-alt)',
                                    }}
                                >
                                    <span
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            backgroundColor: 'var(--color-surface)',
                                            display: 'grid',
                                            placeItems: 'center',
                                            border: '1px solid var(--color-border)',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {user.image ? (
                                            // imageUrl leaves absolute Google avatar URLs alone; the old code
                                            // prefixed them with the API host and produced a broken image.
                                            <img
                                                src={imageUrl(user.image)}
                                                alt=""
                                                referrerPolicy="no-referrer"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <svg {...iconProps} width="18" height="18" style={{ color: 'var(--color-text-muted)' }}>
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                            </svg>
                                        )}
                                    </span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                                        {String(user.name || 'Account').split(' ')[0]}
                                    </span>
                                </button>
                            ) : (
                                <Link to="/login" onClick={closeMenu} aria-label="Sign in" style={{ display: 'flex' }}>
                                    <svg {...iconProps}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                </Link>
                            )}

                            <button
                                type="button"
                                onClick={handleCartClick}
                                aria-label={`Open cart, ${cartSummary.itemCount} item${cartSummary.itemCount === 1 ? '' : 's'}`}
                                style={{ position: 'relative', display: 'flex' }}
                            >
                                <svg {...iconProps}>
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                    <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                                </svg>
                                {cartSummary.itemCount > 0 && (
                                    <span
                                        style={{
                                            position: 'absolute',
                                            top: -7,
                                            right: -9,
                                            backgroundColor: 'var(--color-accent)',
                                            color: '#fff',
                                            borderRadius: 'var(--radius-pill)',
                                            minWidth: 18,
                                            height: 18,
                                            padding: '0 5px',
                                            display: 'grid',
                                            placeItems: 'center',
                                            fontSize: '0.65rem',
                                            fontWeight: 700,
                                        }}
                                    >
                                        {cartSummary.itemCount > 99 ? '99+' : cartSummary.itemCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="mobile-menu-btn"
                        aria-label="Toggle navigation menu"
                        aria-expanded={isMenuOpen}
                        onClick={() => setMenuOpen((v) => !v)}
                    >
                        {isMenuOpen ? '✕' : '☰'}
                    </button>
                </div>

                {isSearchOpen && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            width: '100%',
                            backgroundColor: 'var(--color-surface)',
                            padding: '1rem 0',
                            boxShadow: 'var(--shadow-md)',
                            borderTop: '1px solid var(--color-border)',
                        }}
                    >
                        <form className="container" onSubmit={handleSearch} style={{ display: 'flex', gap: 10, justifyContent: 'center' }} role="search">
                            <input
                                ref={searchInputRef}
                                type="search"
                                className="input"
                                placeholder="Search for products..."
                                aria-label="Search for products"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ maxWidth: 560, borderRadius: 'var(--radius-pill)' }}
                            />
                            <button type="submit" className="btn btn-primary">Search</button>
                            <button type="button" className="btn btn-ghost" onClick={() => setSearchOpen(false)} aria-label="Close search">✕</button>
                        </form>
                    </div>
                )}
            </nav>

            <ProfileSidebar isOpen={isProfileOpen} onClose={() => setProfileOpen(false)} onLogout={handleLogout} />
        </>
    );
};

export default Navbar;
