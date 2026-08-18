import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, imageUrl, formatPrice, invalidateCache } from '../api/client';
import { useApp } from '../context/AppContext';
import { loadRazorpayScript } from '../utils/razorpay';

const EMPTY_ADDRESS = { fullName: '', address: '', city: '', postalCode: '', phone: '' };
const ADDRESS_KEY = 'lastShippingAddress';

/** Mirrors the server-side rules in routes/orders.js so the user is told what
 *  is wrong before a round trip, not after. */
const validate = ({ address, city, postalCode, phone }) => {
    const errors = {};
    if (!address.trim()) errors.address = 'Street address is required.';
    if (!city.trim()) errors.city = 'City is required.';
    if (!/^\d{6}$/.test(postalCode.trim())) errors.postalCode = 'Enter a 6-digit PIN code.';
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''))) errors.phone = 'Enter a valid 10-digit mobile number.';
    return errors;
};

const CheckoutModal = () => {
    const navigate = useNavigate();
    const { user, cartItems, cartSummary, clearCart, refreshCart, toast } = useApp();

    const [isOpen, setOpen] = useState(false);
    const [shippingAddress, setShippingAddress] = useState(EMPTY_ADDRESS);
    const [errors, setErrors] = useState({});
    const [paymentConfig, setPaymentConfig] = useState(null);
    const [loading, setLoading] = useState(false);
    const [placedOrder, setPlacedOrder] = useState(null);

    useEffect(() => {
        const open = () => setOpen(true);
        window.addEventListener('openCheckout', open);
        return () => window.removeEventListener('openCheckout', open);
    }, []);

    // Remember the last address used so repeat customers don't retype it.
    useEffect(() => {
        if (!isOpen) return;
        try {
            const saved = localStorage.getItem(ADDRESS_KEY);
            if (saved) setShippingAddress({ ...EMPTY_ADDRESS, ...JSON.parse(saved) });
        } catch { /* ignore malformed storage */ }

        api.get('/api/payment_settings/config', { auth: false })
            .then(setPaymentConfig)
            .catch(() => setPaymentConfig(null));
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previous; };
    }, [isOpen]);

    const close = useCallback(() => {
        setOpen(false);
        setErrors({});
        setPlacedOrder(null);
        setLoading(false);
    }, []);

    const setField = (key, value) => {
        setShippingAddress((a) => ({ ...a, [key]: value }));
        setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
    };

    const finishSuccessfully = (order) => {
        clearCart();
        invalidateCache('/api/orders', '/api/products');
        setPlacedOrder(order);
        setLoading(false);
    };

    const handlePlaceOrder = async (method) => {
        if (!user) {
            close();
            navigate('/login?redirect=cart');
            return;
        }
        if (cartItems.length === 0) {
            toast('Your cart is empty.', 'error');
            return;
        }

        // Both buttons validate. The old "Pay Online" button was type="button",
        // so it skipped the form's own required-field checks entirely.
        const validationErrors = validate(shippingAddress);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast('Please correct the highlighted fields.', 'error');
            return;
        }

        setLoading(true);
        try {
            localStorage.setItem(ADDRESS_KEY, JSON.stringify(shippingAddress));

            // The server re-prices every line from the database, so the totals
            // shown here are advisory only and cannot be tampered with.
            const order = await api.post('/api/orders', {
                orderItems: cartItems.map((i) => ({ product: i.product, qty: i.qty, size: i.size })),
                shippingAddress,
                paymentMethod: method,
            });

            if (method === 'cod') {
                finishSuccessfully(order);
                return;
            }

            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                toast('Could not load the payment window. Please try Cash on Delivery.', 'error');
                setLoading(false);
                return;
            }

            // Amount comes from our own order record on the server side.
            const rpOrder = await api.post('/api/razorpay/create-order', { orderId: order._id });

            const rzp = new window.Razorpay({
                key: paymentConfig.keyId,
                amount: rpOrder.amount,
                currency: rpOrder.currency,
                name: "K'S JADU",
                description: `Order ${order.orderNumber || ''}`.trim(),
                image: '/logo.png',
                order_id: rpOrder.id,
                handler: async (response) => {
                    try {
                        const result = await api.post('/api/razorpay/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId: order._id,
                        });
                        finishSuccessfully(result.order || order);
                    } catch (err) {
                        toast(err.message || 'Payment could not be verified.', 'error');
                        setLoading(false);
                    }
                },
                modal: {
                    // Closing the payment window must not leave the UI stuck on
                    // "Processing..." forever.
                    ondismiss: () => {
                        setLoading(false);
                        refreshCart();
                        toast('Payment cancelled. Your order is awaiting payment.', 'info');
                    },
                },
                prefill: { name: user.name, email: user.email, contact: shippingAddress.phone },
                theme: { color: '#101c4e' },
            });

            rzp.on('payment.failed', (resp) => {
                toast(resp?.error?.description || 'Payment failed.', 'error');
                setLoading(false);
            });

            rzp.open();
        } catch (err) {
            toast(err.message || 'We could not place your order.', 'error');
            setLoading(false);
            // A stock rejection means the cart is stale; resync it.
            if (err.status === 409) refreshCart();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && !loading && close()}>
            <div className="modal" role="dialog" aria-modal="true" aria-labelledby="checkout-heading">
                <button type="button" className="modal__close" onClick={close} aria-label="Close checkout">✕</button>

                {placedOrder ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🎉</div>
                        <h2 id="checkout-heading" style={{ color: 'var(--color-success)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                            Order placed
                        </h2>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                            Order <strong>{placedOrder.orderNumber || `#${String(placedOrder._id).slice(-8)}`}</strong>
                        </p>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.75rem' }}>
                            {placedOrder.paymentMethod === 'cod'
                                ? 'Pay in cash when it arrives.'
                                : 'Payment received. Thank you.'}
                        </p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button type="button" className="btn btn-primary" onClick={() => { close(); navigate('/my-orders'); }}>
                                Track my order
                            </button>
                            <button type="button" className="btn btn-outline" onClick={() => { close(); navigate('/shop'); }}>
                                Continue shopping
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <header style={{ marginBottom: '1.5rem' }}>
                            <h2 id="checkout-heading" style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 6 }}>Checkout</h2>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>Where should we deliver this?</p>
                        </header>

                        <section
                            style={{
                                backgroundColor: 'var(--color-surface-alt)',
                                borderRadius: 'var(--radius-lg)',
                                padding: '1.1rem',
                                marginBottom: '1.5rem',
                                border: '1px solid var(--color-border)',
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10, maxHeight: 150, overflowY: 'auto' }}>
                                {cartItems.map((item) => (
                                    <div key={`${item.product}-${item.size || ''}`} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.88rem' }}>
                                        <img
                                            src={imageUrl(item.image)}
                                            alt=""
                                            loading="lazy"
                                            style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', background: 'var(--color-surface)', flexShrink: 0 }}
                                        />
                                        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.name}{item.size ? ` · ${item.size}` : ''} × {item.qty}
                                        </span>
                                        <span style={{ fontWeight: 600 }}>{formatPrice(item.price * item.qty)}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--color-text-muted)', paddingTop: 10, borderTop: '1px dashed var(--color-border)' }}>
                                <span>Delivery</span>
                                <span style={{ color: cartSummary.shipping === 0 ? 'var(--color-accent)' : 'inherit', fontWeight: 600 }}>
                                    {cartSummary.shipping === 0 ? 'FREE' : formatPrice(cartSummary.shipping)}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontWeight: 800, fontSize: '1.1rem' }}>
                                <span>Total</span><span>{formatPrice(cartSummary.total)}</span>
                            </div>
                        </section>

                        <form
                            onSubmit={(e) => { e.preventDefault(); handlePlaceOrder('cod'); }}
                            noValidate
                            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                        >
                            <div className="field">
                                <label className="field__label" htmlFor="co-name">Full name</label>
                                <input
                                    id="co-name" className="input" autoComplete="name"
                                    placeholder={user?.name || 'Your name'}
                                    value={shippingAddress.fullName}
                                    onChange={(e) => setField('fullName', e.target.value)}
                                />
                            </div>

                            <div className="field">
                                <label className="field__label" htmlFor="co-address">Street address</label>
                                <input
                                    id="co-address" className="input" autoComplete="street-address"
                                    placeholder="Flat / house no. and street"
                                    aria-invalid={Boolean(errors.address)}
                                    value={shippingAddress.address}
                                    onChange={(e) => setField('address', e.target.value)}
                                />
                                {errors.address && <span className="field__error">{errors.address}</span>}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="field">
                                    <label className="field__label" htmlFor="co-city">City</label>
                                    <input
                                        id="co-city" className="input" autoComplete="address-level2" placeholder="City"
                                        aria-invalid={Boolean(errors.city)}
                                        value={shippingAddress.city}
                                        onChange={(e) => setField('city', e.target.value)}
                                    />
                                    {errors.city && <span className="field__error">{errors.city}</span>}
                                </div>
                                <div className="field">
                                    <label className="field__label" htmlFor="co-pin">PIN code</label>
                                    <input
                                        id="co-pin" className="input" inputMode="numeric" maxLength={6}
                                        autoComplete="postal-code" placeholder="6 digits"
                                        aria-invalid={Boolean(errors.postalCode)}
                                        value={shippingAddress.postalCode}
                                        onChange={(e) => setField('postalCode', e.target.value.replace(/\D/g, ''))}
                                    />
                                    {errors.postalCode && <span className="field__error">{errors.postalCode}</span>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="field__label" htmlFor="co-phone">Phone number</label>
                                <input
                                    id="co-phone" className="input" type="tel" inputMode="numeric" maxLength={10}
                                    autoComplete="tel" placeholder="10-digit mobile number"
                                    aria-invalid={Boolean(errors.phone)}
                                    value={shippingAddress.phone}
                                    onChange={(e) => setField('phone', e.target.value.replace(/\D/g, ''))}
                                />
                                {errors.phone && <span className="field__error">{errors.phone}</span>}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: '0.5rem' }}>
                                <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                                    {loading ? 'Processing…' : `Place order · ${formatPrice(cartSummary.total)}`}
                                </button>

                                {paymentConfig?.isEnabled && paymentConfig?.keyId && (
                                    <button
                                        type="button"
                                        className="btn btn-outline btn-block btn-lg"
                                        disabled={loading}
                                        onClick={() => handlePlaceOrder('online')}
                                    >
                                        💳 Pay securely online
                                    </button>
                                )}
                            </div>

                            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-faint)', textAlign: 'center' }}>
                                Cash on delivery available. Your details are only used for this delivery.
                            </p>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default CheckoutModal;
