import React, { createContext, useContext, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { api, getStoredUser, invalidateCache } from '../api/client';

/**
 * Application state: signed-in user, cart, theme and toasts.
 *
 * Previously each component read localStorage directly and refetched the cart
 * on its own, so the header count and the sidebar could disagree. One provider
 * means one source of truth.
 */

const AppContext = createContext(null);

export const useApp = () => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
    return ctx;
};

let toastId = 0;

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(() => getStoredUser());
    const [cartItems, setCartItems] = useState([]);
    const [cartLoading, setCartLoading] = useState(false);
    const [isCartOpen, setCartOpen] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    const timers = useRef(new Map());

    /* ------------------------------ toasts ------------------------------ */

    const dismissToast = useCallback((id) => {
        setToasts((current) => current.filter((t) => t.id !== id));
        const timer = timers.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timers.current.delete(id);
        }
    }, []);

    const toast = useCallback((message, type = 'success', duration = 3200) => {
        const id = ++toastId;
        setToasts((current) => [...current, { id, message, type }]);
        timers.current.set(id, setTimeout(() => dismissToast(id), duration));
        return id;
    }, [dismissToast]);

    // Clear any pending timers if the provider ever unmounts.
    useEffect(() => () => timers.current.forEach(clearTimeout), []);

    /* ------------------------------- theme ------------------------------ */

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme((t) => (t === 'light' ? 'dark' : 'light'));
    }, []);

    /* -------------------------------- auth ------------------------------ */

    const login = useCallback((userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        invalidateCache('/api/cart');
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('user');
        setUser(null);
        setCartItems([]);
        setCartOpen(false);
        invalidateCache();
    }, []);

    // The API client fires this when a request comes back 401.
    useEffect(() => {
        const onAuthChanged = () => {
            const stored = getStoredUser();
            setUser(stored);
            if (!stored) {
                setCartItems([]);
                setCartOpen(false);
            }
        };
        window.addEventListener('authChanged', onAuthChanged);
        // 'storage' fires when another tab signs in or out.
        window.addEventListener('storage', onAuthChanged);
        return () => {
            window.removeEventListener('authChanged', onAuthChanged);
            window.removeEventListener('storage', onAuthChanged);
        };
    }, []);

    /* -------------------------------- cart ------------------------------ */

    const refreshCart = useCallback(async () => {
        if (!user) {
            setCartItems([]);
            return;
        }
        setCartLoading(true);
        try {
            const items = await api.get('/api/cart', { fresh: true });
            setCartItems(Array.isArray(items) ? items : []);
        } catch (err) {
            if (err.status !== 401) console.error('Cart fetch failed:', err.message);
        } finally {
            setCartLoading(false);
        }
    }, [user]);

    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    const addToCart = useCallback(
        async (productId, { qty = 1, size, openCart = true, silent = false } = {}) => {
            if (!user) {
                toast('Please sign in to add items to your cart.', 'info');
                return false;
            }
            try {
                const items = await api.post('/api/cart', { product: productId, qty, size });
                setCartItems(items);
                invalidateCache('/api/cart');
                if (!silent) toast('Added to cart');
                if (openCart) setCartOpen(true);
                return true;
            } catch (err) {
                toast(err.message, 'error');
                return false;
            }
        },
        [user, toast]
    );

    const updateCartQty = useCallback(
        async (productId, qty, size) => {
            // Optimistic update keeps the +/- buttons feeling instant.
            const previous = cartItems;
            setCartItems((items) =>
                items.map((i) => (i.product === productId && (i.size || '') === (size || '') ? { ...i, qty } : i))
            );
            try {
                const items = await api.put(`/api/cart/${productId}`, { qty, size });
                setCartItems(items);
                invalidateCache('/api/cart');
            } catch (err) {
                setCartItems(previous); // roll back
                toast(err.message, 'error');
            }
        },
        [cartItems, toast]
    );

    const removeFromCart = useCallback(
        async (productId) => {
            const previous = cartItems;
            setCartItems((items) => items.filter((i) => i.product !== productId));
            try {
                const items = await api.del(`/api/cart/${productId}`);
                setCartItems(items);
                invalidateCache('/api/cart');
            } catch (err) {
                setCartItems(previous);
                toast(err.message, 'error');
            }
        },
        [cartItems, toast]
    );

    const clearCart = useCallback(() => {
        setCartItems([]);
        invalidateCache('/api/cart');
    }, []);

    /* ------------------------------ derived ----------------------------- */

    const cartSummary = useMemo(() => {
        const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.qty, 0);
        const mrp = cartItems.reduce((acc, i) => acc + (i.originalPrice || i.price) * i.qty, 0);
        const itemCount = cartItems.reduce((acc, i) => acc + i.qty, 0);
        // Must mirror FREE_SHIPPING_THRESHOLD / SHIPPING_FEE on the server.
        const shipping = subtotal === 0 || subtotal >= 499 ? 0 : 49;
        return {
            subtotal,
            mrp,
            savings: Math.max(0, mrp - subtotal),
            shipping,
            total: subtotal + shipping,
            itemCount,
        };
    }, [cartItems]);

    const value = useMemo(
        () => ({
            user, login, logout,
            cartItems, cartSummary, cartLoading,
            addToCart, updateCartQty, removeFromCart, clearCart, refreshCart,
            isCartOpen, openCart: () => setCartOpen(true), closeCart: () => setCartOpen(false),
            toasts, toast, dismissToast,
            theme, toggleTheme,
        }),
        [
            user, login, logout, cartItems, cartSummary, cartLoading,
            addToCart, updateCartQty, removeFromCart, clearCart, refreshCart,
            isCartOpen, toasts, toast, dismissToast, theme, toggleTheme,
        ]
    );

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
