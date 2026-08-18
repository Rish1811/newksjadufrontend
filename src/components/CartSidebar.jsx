import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, imageUrl, formatPrice } from '../api/client';
import { useApp } from '../context/AppContext';

const FREE_SHIPPING_THRESHOLD = 499;

const CartSidebar = () => {
    const navigate = useNavigate();
    const {
        user, cartItems, cartSummary, cartLoading,
        isCartOpen, closeCart, updateCartQty, removeFromCart, addToCart,
    } = useApp();

    const [suggestions, setSuggestions] = useState([]);
    const [isBreakdownOpen, setBreakdownOpen] = useState(false);

    // Lock background scrolling while the drawer is open.
    useEffect(() => {
        if (!isCartOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKeyDown = (e) => e.key === 'Escape' && closeCart();
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = previous;
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [isCartOpen, closeCart]);

    useEffect(() => {
        if (!isCartOpen) return;
        api.get('/api/products?limit=20', { auth: false })
            .then((all) => setSuggestions(Array.isArray(all) ? all : []))
            .catch(() => setSuggestions([]));
    }, [isCartOpen]);

    // Recomputed from the live cart so an item disappears from the
    // suggestion rail the moment it is added.
    const visibleSuggestions = useMemo(() => {
        const inCart = new Set(cartItems.map((i) => i.product));
        return suggestions.filter((p) => !inCart.has(p._id) && p.countInStock > 0).slice(0, 6);
    }, [suggestions, cartItems]);

    const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSummary.subtotal);

    const handleCheckout = () => {
        if (!user) {
            closeCart();
            navigate('/login?redirect=cart');
            return;
        }
        closeCart();
        window.dispatchEvent(new Event('openCheckout'));
    };

    return (
        <>
            {isCartOpen && <div className="overlay" onClick={closeCart} aria-hidden="true" />}

            <aside
                className={`drawer ${isCartOpen ? 'drawer--open' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-label="Shopping cart"
                aria-hidden={!isCartOpen}
            >
                <header
                    style={{
                        padding: '1.1rem 1.4rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid var(--color-border)',
                    }}
                >
                    <h2 style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                        Your Cart ({cartSummary.itemCount})
                    </h2>
                    <button type="button" onClick={closeCart} aria-label="Close cart" style={{ fontSize: '1.2rem', padding: 6, color: 'var(--color-text-muted)' }}>
                        ✕
                    </button>
                </header>

                {/* Progress toward free delivery gives the shopper a concrete
                    reason to add one more item. */}
                {cartItems.length > 0 && (
                    <div style={{ padding: '10px 1.4rem', background: 'var(--color-accent-soft)', color: 'var(--color-accent)', fontSize: '0.85rem', fontWeight: 600 }}>
                        {amountToFreeShipping > 0
                            ? `Add ${formatPrice(amountToFreeShipping)} more for free delivery`
                            : '✓ You have unlocked free delivery'}
                        <div style={{ height: 4, background: 'var(--color-surface-sunken)', borderRadius: 4, marginTop: 6, overflow: 'hidden' }}>
                            <div
                                style={{
                                    height: '100%',
                                    width: `${Math.min(100, (cartSummary.subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%`,
                                    background: 'var(--color-accent)',
                                    transition: 'width 300ms ease',
                                }}
                            />
                        </div>
                    </div>
                )}

                <div style={{ flex: 1, overflowY: 'auto', padding: '1.2rem' }}>
                    {cartLoading && cartItems.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[0, 1].map((i) => <span key={i} className="skeleton" style={{ height: 130, borderRadius: 'var(--radius-lg)' }} />)}
                        </div>
                    ) : cartItems.length === 0 ? (
                        <div className="state-panel" style={{ padding: '3rem 1rem' }}>
                            <div className="state-panel__icon">🛒</div>
                            <p className="state-panel__title" style={{ fontSize: '1.1rem' }}>Your cart is empty</p>
                            <p className="state-panel__text" style={{ fontSize: '0.9rem' }}>
                                {user ? 'Add a few products to get started.' : 'Sign in to see items you saved earlier.'}
                            </p>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => { closeCart(); navigate(user ? '/shop' : '/login'); }}
                            >
                                {user ? 'Browse products' : 'Sign in'}
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {cartItems.map((item) => (
                                <article
                                    key={`${item.product}-${item.size || ''}`}
                                    style={{
                                        backgroundColor: 'var(--color-surface-alt)',
                                        borderRadius: 'var(--radius-lg)',
                                        padding: '1rem',
                                        display: 'flex',
                                        gap: '1rem',
                                        border: '1px solid var(--color-border)',
                                    }}
                                >
                                    <div style={{ width: 88, height: 88, backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0 }}>
                                        <img
                                            src={imageUrl(item.image)}
                                            alt={item.name}
                                            loading="lazy"
                                            decoding="async"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>

                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                                            <div style={{ minWidth: 0 }}>
                                                <h3 style={{ fontSize: '0.92rem', fontWeight: 700, lineHeight: 1.25, marginBottom: 2 }}>{item.name}</h3>
                                                {/* Real variant label, not the hardcoded "750ml" this used to print. */}
                                                {item.size && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{item.size}</span>}
                                            </div>
                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                <div style={{ fontSize: '1rem', fontWeight: 800 }}>{formatPrice(item.price * item.qty)}</div>
                                                {item.originalPrice > item.price && (
                                                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-faint)', textDecoration: 'line-through' }}>
                                                        {formatPrice(item.originalPrice * item.qty)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' }}>
                                            <button
                                                type="button"
                                                onClick={() => removeFromCart(item.product)}
                                                aria-label={`Remove ${item.name} from cart`}
                                                style={{
                                                    backgroundColor: 'var(--color-surface)',
                                                    border: '1.5px solid var(--color-border)',
                                                    borderRadius: 'var(--radius-md)',
                                                    width: 40,
                                                    height: 40,
                                                    display: 'grid',
                                                    placeItems: 'center',
                                                    color: 'var(--color-text-muted)',
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                </svg>
                                            </button>

                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    border: '1.5px solid var(--color-border)',
                                                    borderRadius: 'var(--radius-md)',
                                                    backgroundColor: 'var(--color-surface)',
                                                    height: 40,
                                                }}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => (item.qty <= 1 ? removeFromCart(item.product) : updateCartQty(item.product, item.qty - 1, item.size))}
                                                    aria-label={item.qty <= 1 ? `Remove ${item.name}` : `Decrease quantity of ${item.name}`}
                                                    style={{ width: 34, height: '100%', fontSize: '1.2rem' }}
                                                >
                                                    −
                                                </button>
                                                <span aria-live="polite" style={{ minWidth: 32, textAlign: 'center', fontWeight: 700 }}>{item.qty}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => updateCartQty(item.product, item.qty + 1, item.size)}
                                                    aria-label={`Increase quantity of ${item.name}`}
                                                    style={{ width: 34, height: '100%', fontSize: '1.2rem' }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    {cartItems.length > 0 && visibleSuggestions.length > 0 && (
                        <section style={{ marginTop: '1.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.1rem' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-accent)', marginBottom: '0.9rem' }}>
                                You might also like
                            </h3>
                            <div className="no-scrollbar" style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: 4 }}>
                                {visibleSuggestions.map((product) => (
                                    <div key={product._id} style={{ minWidth: 150, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ height: 84, display: 'grid', placeItems: 'center', marginBottom: 8, backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)', padding: 8 }}>
                                            <img src={imageUrl(product.image)} alt={product.name} loading="lazy" decoding="async" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                                        </div>
                                        <h4 style={{ fontSize: '0.75rem', fontWeight: 600, height: '2.4em', overflow: 'hidden', marginBottom: 2 }}>{product.name}</h4>
                                        <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 8 }}>{formatPrice(product.price)}</p>
                                        <button
                                            type="button"
                                            className="btn btn-outline"
                                            onClick={() => addToCart(product._id, { openCart: false })}
                                            style={{ padding: '7px', fontSize: '0.78rem', color: 'var(--color-accent)', borderColor: 'var(--color-accent)' }}
                                        >
                                            + Add
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {cartItems.length > 0 && (
                    <footer style={{ padding: '1.1rem 1.4rem', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                        <button
                            type="button"
                            onClick={() => setBreakdownOpen((v) => !v)}
                            aria-expanded={isBreakdownOpen}
                            style={{ width: '100%', marginBottom: '1rem', textAlign: 'left' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                                    Estimated total <span style={{ fontSize: '0.65rem' }}>{isBreakdownOpen ? '▲' : '▼'}</span>
                                </span>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{formatPrice(cartSummary.total)}</div>
                                    {cartSummary.savings > 0 && (
                                        <div style={{ fontSize: '0.78rem', color: 'var(--color-accent)', fontWeight: 600 }}>
                                            You saved {formatPrice(cartSummary.savings)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isBreakdownOpen && (
                                <div style={{ marginTop: '0.9rem', paddingTop: '0.9rem', borderTop: '1px dashed var(--color-border)', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                                        <span>Item total</span><span>{formatPrice(cartSummary.mrp)}</span>
                                    </div>
                                    {cartSummary.savings > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-accent)', fontWeight: 600 }}>
                                            <span>Discount</span><span>− {formatPrice(cartSummary.savings)}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                                        <span>Delivery</span>
                                        <span style={{ color: cartSummary.shipping === 0 ? 'var(--color-accent)' : 'inherit', fontWeight: 600 }}>
                                            {cartSummary.shipping === 0 ? 'FREE' : formatPrice(cartSummary.shipping)}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, paddingTop: 8, borderTop: '1px solid var(--color-border)' }}>
                                        <span>Grand total</span><span>{formatPrice(cartSummary.total)}</span>
                                    </div>
                                </div>
                            )}
                        </button>

                        <button type="button" className="btn btn-primary btn-block btn-lg" onClick={handleCheckout}>
                            {user ? 'Proceed to checkout' : 'Sign in to checkout'}
                        </button>
                    </footer>
                )}
            </aside>
        </>
    );
};

export default CartSidebar;
