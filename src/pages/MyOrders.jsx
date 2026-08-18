import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, imageUrl, formatPrice, invalidateCache } from '../api/client';
import { useApp } from '../context/AppContext';
import Skeleton from '../components/Skeleton';

const STATUS_STYLE = {
    Pending: 'badge--warning',
    Accepted: 'badge--success',
    Shipped: 'badge--info',
    Delivered: 'badge--neutral',
    Rejected: 'badge--danger',
    Cancelled: 'badge--danger',
};

const STATUS_STEPS = ['Pending', 'Accepted', 'Shipped', 'Delivered'];

const MyOrders = () => {
    const navigate = useNavigate();
    const { user, toast, addToCart } = useApp();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [busyOrderId, setBusyOrderId] = useState(null);
    const [reviewModal, setReviewModal] = useState({ open: false, item: null });
    const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '', images: null });
    const [submittingReview, setSubmittingReview] = useState(false);

    const loadOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.get('/api/orders/myorders', { fresh: true });
            setOrders(Array.isArray(data?.orders) ? data.orders : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!user) {
            navigate('/login?redirect=orders', { replace: true });
            return;
        }
        loadOrders();
    }, [user, navigate, loadOrders]);

    const handleCancel = async (order) => {
        if (!window.confirm(`Cancel order ${order.orderNumber}? This cannot be undone.`)) return;
        setBusyOrderId(order._id);
        try {
            await api.put(`/api/orders/${order._id}/cancel`);
            invalidateCache('/api/orders', '/api/products');
            toast('Order cancelled.');
            await loadOrders();
        } catch (err) {
            toast(err.message, 'error');
        } finally {
            setBusyOrderId(null);
        }
    };

    const handleBuyAgain = async (item) => {
        const ok = await addToCart(item.product, { qty: item.qty, size: item.size });
        if (ok) toast('Added to your cart');
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        const productId = reviewModal.item?.product;
        if (!productId) {
            toast('Could not identify the product for this review.', 'error');
            return;
        }

        setSubmittingReview(true);
        const formData = new FormData();
        formData.append('rating', reviewForm.rating);
        formData.append('comment', reviewForm.comment);
        formData.append('title', reviewForm.title);
        for (const file of reviewForm.images || []) formData.append('images', file);

        try {
            await api.upload(`/api/products/${productId}/reviews`, formData);
            invalidateCache('/api/products');
            toast('Thanks for your review!');
            setReviewModal({ open: false, item: null });
        } catch (err) {
            toast(err.message, 'error');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (!user) return null;

    return (
        <div className="container" style={{ padding: '2.5rem 1rem 4rem', maxWidth: 1000 }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800 }}>Your orders</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Track deliveries and reorder your favourites.</p>
            </header>

            {loading ? (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {[0, 1].map((i) => <Skeleton key={i} height={190} radius={20} />)}
                </div>
            ) : error ? (
                <div className="state-panel">
                    <div className="state-panel__icon">📡</div>
                    <p className="state-panel__title">We couldn't load your orders</p>
                    <p className="state-panel__text">{error}</p>
                    <button type="button" className="btn btn-primary" onClick={loadOrders}>Try again</button>
                </div>
            ) : orders.length === 0 ? (
                <div className="state-panel">
                    <div className="state-panel__icon">📦</div>
                    <p className="state-panel__title">No orders yet</p>
                    <p className="state-panel__text">When you place your first order it will show up here.</p>
                    <Link to="/shop" className="btn btn-primary">Start shopping</Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {orders.map((order) => {
                        const stepIndex = STATUS_STEPS.indexOf(order.status);
                        const isClosed = ['Rejected', 'Cancelled'].includes(order.status);
                        const canCancel = ['Pending', 'Accepted'].includes(order.status);

                        return (
                            <article key={order._id} className="card" style={{ padding: '1.5rem' }}>
                                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: '1.2rem', paddingBottom: '1.2rem', borderBottom: '1px solid var(--color-border)' }}>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{order.orderNumber}</div>
                                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                            Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                        <span className={`badge ${STATUS_STYLE[order.status] || 'badge--neutral'}`}>{order.status}</span>
                                        <span className="badge badge--neutral">
                                            {order.paymentMethod === 'cod' ? 'Cash on delivery' : order.isPaid ? 'Paid online' : 'Payment pending'}
                                        </span>
                                    </div>
                                </header>

                                {/* Progress rail makes "where is my order" answerable at a glance. */}
                                {!isClosed && (
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.4rem' }}>
                                        {STATUS_STEPS.map((step, i) => {
                                            const done = i <= stepIndex;
                                            return (
                                                <React.Fragment key={step}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                                        <span style={{ width: 22, height: 22, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: '0.7rem', fontWeight: 800, background: done ? 'var(--color-accent)' : 'var(--color-surface-sunken)', color: done ? '#fff' : 'var(--color-text-faint)' }}>
                                                            {done ? '✓' : i + 1}
                                                        </span>
                                                        <span style={{ fontSize: '0.72rem', color: done ? 'var(--color-text)' : 'var(--color-text-faint)', fontWeight: done ? 600 : 400 }}>{step}</span>
                                                    </div>
                                                    {i < STATUS_STEPS.length - 1 && (
                                                        <div style={{ flex: 1, height: 2, background: i < stepIndex ? 'var(--color-accent)' : 'var(--color-border)', marginBottom: 18 }} />
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                            {order.orderItems.map((item, idx) => (
                                                <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                                    <img
                                                        src={imageUrl(item.image)}
                                                        alt=""
                                                        loading="lazy"
                                                        decoding="async"
                                                        style={{ width: 52, height: 52, borderRadius: 'var(--radius-sm)', objectFit: 'cover', background: 'var(--color-surface-alt)', flexShrink: 0 }}
                                                    />
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>{item.name}</div>
                                                        <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                                                            {item.size ? `${item.size} · ` : ''}{formatPrice(item.price)} × {item.qty}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                                        {order.status === 'Delivered' && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-ghost"
                                                                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                                                                onClick={() => {
                                                                    setReviewModal({ open: true, item });
                                                                    setReviewForm({ rating: 5, title: '', comment: '', images: null });
                                                                }}
                                                            >
                                                                Review
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline"
                                                            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                                                            onClick={() => handleBuyAgain(item)}
                                                        >
                                                            Buy again
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ marginTop: '1.2rem', paddingTop: '0.9rem', borderTop: '1px dashed var(--color-border)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                                                <span>Items</span><span>{formatPrice(order.itemsPrice ?? order.totalPrice)}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                                                <span>Delivery</span>
                                                <span>{order.shippingPrice ? formatPrice(order.shippingPrice) : 'FREE'}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.05rem', marginTop: 4 }}>
                                                <span>Total</span><span>{formatPrice(order.totalPrice)}</span>
                                            </div>
                                        </div>

                                        {canCancel && (
                                            <button
                                                type="button"
                                                className="btn btn-outline"
                                                style={{ marginTop: '1rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger)', padding: '8px 16px', fontSize: '0.85rem' }}
                                                disabled={busyOrderId === order._id}
                                                onClick={() => handleCancel(order)}
                                            >
                                                {busyOrderId === order._id ? 'Cancelling…' : 'Cancel order'}
                                            </button>
                                        )}
                                    </div>

                                    <div style={{ padding: '1.1rem', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
                                        <h3 style={{ marginBottom: '0.7rem', fontSize: '0.95rem', fontWeight: 700 }}>Delivery</h3>

                                        <address style={{ fontStyle: 'normal', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '0.9rem' }}>
                                            {order.shippingAddress?.fullName && <div>{order.shippingAddress.fullName}</div>}
                                            <div>{order.shippingAddress?.address}</div>
                                            <div>{order.shippingAddress?.city} — {order.shippingAddress?.postalCode}</div>
                                            <div>📞 {order.shippingAddress?.phone}</div>
                                        </address>

                                        {isClosed ? (
                                            <div style={{ color: 'var(--color-danger)' }}>
                                                This order was {order.status.toLowerCase()}.
                                            </div>
                                        ) : order.tracking?.shippingDate || order.tracking?.deliveryDate ? (
                                            <div style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
                                                {order.tracking.shippingDate && <div>📅 Shipped: {order.tracking.shippingDate}</div>}
                                                {order.tracking.deliveryDate && <div>🚚 Expected: {order.tracking.deliveryDate}</div>}
                                                {order.tracking.deliveryTime && <div>🕙 {order.tracking.deliveryTime}</div>}
                                                {order.tracking.details && <div style={{ fontStyle: 'italic', marginTop: 6 }}>{order.tracking.details}</div>}
                                            </div>
                                        ) : (
                                            <div style={{ color: 'var(--color-text-faint)', fontStyle: 'italic' }}>
                                                Tracking details will appear once your order is dispatched.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {reviewModal.open && (
                <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setReviewModal({ open: false, item: null })}>
                    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="review-heading">
                        <button type="button" className="modal__close" onClick={() => setReviewModal({ open: false, item: null })} aria-label="Close">✕</button>

                        <header style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <h2 id="review-heading" style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 6 }}>Share your experience</h2>
                            <p style={{ color: 'var(--color-text-muted)' }}>Reviewing {reviewModal.item?.name}</p>
                        </header>

                        <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }} role="radiogroup" aria-label="Rating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        role="radio"
                                        aria-checked={star === reviewForm.rating}
                                        aria-label={`${star} star${star === 1 ? '' : 's'}`}
                                        onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                                        style={{ fontSize: '2.2rem', color: star <= reviewForm.rating ? 'var(--color-star)' : 'var(--color-border-strong)', lineHeight: 1 }}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>

                            <div className="field">
                                <label className="field__label" htmlFor="rv-title">Review title</label>
                                <input
                                    id="rv-title" className="input" required maxLength={80}
                                    placeholder="e.g. Best cleaner I've used"
                                    value={reviewForm.title}
                                    onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                                />
                            </div>

                            <div className="field">
                                <label className="field__label" htmlFor="rv-comment">Your thoughts</label>
                                <textarea
                                    id="rv-comment" className="input" required rows={4} maxLength={800}
                                    placeholder="Tell us about the quality, scent and how well it worked…"
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>

                            <div className="field">
                                <label className="field__label" htmlFor="rv-photos">Add photos (optional)</label>
                                <input
                                    id="rv-photos" type="file" multiple accept="image/*"
                                    onChange={(e) => setReviewForm((f) => ({ ...f, images: e.target.files }))}
                                    style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={submittingReview}>
                                    {submittingReview ? 'Submitting…' : 'Submit review'}
                                </button>
                                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setReviewModal({ open: false, item: null })}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyOrders;
