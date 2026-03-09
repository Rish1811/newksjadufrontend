import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../config';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartItems, setCartItems] = useState([]);
    const [showCheckout, setShowCheckout] = useState(false);
    const [isCartCheckout, setIsCartCheckout] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedQty, setSelectedQty] = useState(1);
    const [shippingAddress, setShippingAddress] = useState({ address: '', city: '', postalCode: '', phone: '' });
    const [orderStatus, setOrderStatus] = useState(null);
    const [reviewModal, setReviewModal] = useState({ open: false, product: null });
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', images: null });
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const fetchCart = async () => {
        if (!user) return;
        try {
            const response = await fetch(`${API_BASE}/api/cart`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCartItems(data);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/orders/myorders`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                const data = await response.json();
                setOrders(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching orders:', error);
                setLoading(false);
            }
        };

        fetchOrders();
        fetchCart();

        window.addEventListener('cartUpdated', fetchCart);
        return () => window.removeEventListener('cartUpdated', fetchCart);
    }, [navigate, user]);

    const handleBuyNowItem = (item) => {
        setSelectedProduct({
            _id: item.product,
            name: item.name,
            price: item.price,
            image: item.image
        });
        setSelectedQty(item.qty);
        setIsCartCheckout(false);
        setShowCheckout(true);
    };

    const handleBuyNowCart = () => {
        if (cartItems.length === 0) return;
        setIsCartCheckout(true);
        setShowCheckout(true);
    };

    const removeFromCart = async (productId) => {
        try {
            const res = await fetch(`${API_BASE}/api/cart/${productId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                fetchCart();
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
        }
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        let orderItems = [];
        let totalPrice = 0;

        if (isCartCheckout) {
            orderItems = cartItems.map(item => ({
                name: item.name,
                qty: item.qty,
                image: item.image,
                price: item.price,
                product: item.product
            }));
            totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
        } else {
            orderItems = [{
                name: selectedProduct.name,
                qty: selectedQty,
                image: selectedProduct.image,
                price: selectedProduct.price,
                product: selectedProduct._id
            }];
            totalPrice = selectedProduct.price * selectedQty;
        }

        const orderData = {
            orderItems,
            shippingAddress,
            totalPrice
        };

        try {
            const res = await fetch(`${API_BASE}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                setOrderStatus('success');
                if (isCartCheckout) {
                    // Clear cart in backend
                    await fetch(`${API_BASE}/api/cart`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${user.token}` }
                    });
                    setCartItems([]);
                    window.dispatchEvent(new Event('cartUpdated'));
                }
                setTimeout(() => {
                    setShowCheckout(false);
                    setOrderStatus(null);
                    setShippingAddress({ address: '', city: '', postalCode: '', phone: '' });
                    // Refresh orders list instead of full reload if possible, but reload is safer for state
                    window.location.reload();
                }, 3000);
            } else {
                setOrderStatus('error');
            }
        } catch (error) {
            console.error(error);
            setOrderStatus('error');
        }
    };

    const handleOpenReview = (item) => {
        setReviewModal({ open: true, product: item });
        setReviewForm({ rating: 5, comment: '', images: null });
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();

        // Debug: log the full item object to see what fields are available
        console.log('🔍 Review modal product item:', reviewModal.product);
        console.log('🔍 Product ID being used:', reviewModal.product?.product);
        console.log('🔍 Full product keys:', Object.keys(reviewModal.product || {}));

        const productId = reviewModal.product?.product || reviewModal.product?._id;
        if (!productId) {
            alert('Error: Cannot determine product ID. Check console for details.');
            return;
        }

        const formData = new FormData();
        formData.append('rating', reviewForm.rating);
        formData.append('comment', reviewForm.comment);
        if (reviewForm.images) {
            for (let i = 0; i < reviewForm.images.length; i++) {
                formData.append('images', reviewForm.images[i]);
            }
        }

        try {
            console.log('📤 Submitting review to:', `${API_BASE}/api/products/${productId}/reviews`);
            const res = await fetch(`${API_BASE}/api/products/${productId}/reviews`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${user.token}` },
                body: formData
            });
            const data = await res.json();
            console.log('📥 Review response:', res.status, data);
            if (res.ok) {
                alert('Review submitted successfully!');
                setReviewModal({ open: false, product: null });
            } else {
                alert(data.message || 'Error submitting review');
            }
        } catch (error) {
            console.error('❌ Review submission error:', error);
            alert(`Review Error: ${error.message || error.toString()}`);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '80px auto', minHeight: '80vh' }}>
            {/* Cart Section */}
            {cartItems.length > 0 && (
                <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '3rem', border: '2px solid rgb(0, 0, 128)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ color: 'rgb(0, 0, 128)', margin: 0 }}>🛒 My Cart ({cartItems.length} items)</h2>
                        <button
                            onClick={handleBuyNowCart}
                            style={{ padding: '12px 25px', backgroundColor: 'rgb(0, 0, 128)', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 4px 15px rgba(27,54,93,0.3)' }}
                        >
                            BUY ALL NOW (COD)
                        </button>
                    </div>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {cartItems.map((item) => (
                            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #eee' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ width: '60px', height: '60px', backgroundColor: '#f9f9f9', borderRadius: '8px', padding: '5px' }}>
                                        <img src={item.image && item.image.startsWith('http') ? item.image : `${API_BASE}${item.image}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0' }}>{item.name}</h4>
                                        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>₹{item.price} x {item.qty}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <span style={{ fontWeight: 'bold' }}>₹{item.price * item.qty}</span>
                                    <button
                                        onClick={() => removeFromCart(item.product)}
                                        style={{ backgroundColor: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '1.2rem' }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '1.5rem', textAlign: 'right', fontSize: '1.4rem', fontWeight: 'bold', color: 'rgb(0, 0, 128)' }}>
                        Total: ₹{cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0)}
                    </div>
                </div>
            )}

            <h1 style={{ color: 'rgb(0, 0, 128)', marginBottom: '2rem' }}>Order History</h1>

            {loading ? (
                <div>Loading your orders...</div>
            ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '15px' }}>
                    <h3>No orders found.</h3>
                    <p>Go to shop to place your first order!</p>
                    <button onClick={() => navigate('/shop')} style={{ marginTop: '1rem', padding: '10px 20px', backgroundColor: 'rgb(0, 0, 128)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Shop Now</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {orders.map(order => (
                        <div key={order._id} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderLeft: `5px solid ${order.status === 'Accepted' ? '#28a745' : order.status === 'Rejected' ? '#dc3545' : '#ffc107'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                                <div>
                                    <span style={{ color: '#666', fontSize: '0.9rem' }}>Order ID:</span>
                                    <span style={{ fontWeight: 'bold', marginLeft: '5px' }}>#{order._id.slice(-8)}</span>
                                </div>
                                <div style={{
                                    padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold',
                                    backgroundColor: order.status === 'Delivered' ? '#e2e3e5' : order.status === 'Accepted' ? '#d4edda' : order.status === 'Rejected' ? '#f8d7da' : '#fff3cd',
                                    color: order.status === 'Delivered' ? '#383d41' : order.status === 'Accepted' ? '#155724' : order.status === 'Rejected' ? '#721c24' : '#856404'
                                }}>
                                    {order.status}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <h4 style={{ marginBottom: '0.5rem' }}>Items:</h4>
                                    {order.orderItems.map((item, idx) => (
                                        <div key={idx} style={{ fontSize: '0.95rem', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ flex: 1 }}>{item.name} x {item.qty} - ₹{item.price}</span>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                {order.status === 'Delivered' && (
                                                    <button
                                                        onClick={() => handleOpenReview(item)}
                                                        style={{ padding: '4px 10px', backgroundColor: 'rgb(0, 0, 128)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                    >
                                                        Review Product
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleBuyNowItem(item)}
                                                    style={{ padding: '4px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                >
                                                    Buy Again
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <div style={{ marginTop: '1rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                        Total: ₹{order.totalPrice} (COD)
                                    </div>
                                </div>

                                <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '10px' }}>
                                    <h4 style={{ marginBottom: '0.5rem' }}>Tracking Details:</h4>
                                    {(order.status === 'Accepted' || order.status === 'Delivered') && order.tracking ? (
                                        <>
                                            <div style={{ marginBottom: '5px' }}>📅 <strong>Shipped:</strong> {order.tracking.shippingDate || 'TBA'}</div>
                                            <div style={{ marginBottom: '5px' }}>🚚 <strong>Est. Delivery:</strong> {order.tracking.deliveryDate || 'TBA'}</div>
                                            <div style={{ marginBottom: '5px' }}>🕙 <strong>Time:</strong> {order.tracking.deliveryTime || 'TBA'}</div>
                                            <div style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#555' }}>
                                                {order.status === 'Delivered' ? 'Delivered successfully ✅' : (order.tracking.details || 'Your order is on the way!')}
                                            </div>
                                        </>
                                    ) : order.status === 'Rejected' ? (
                                        <div style={{ color: '#dc3545' }}>Your order has been declined by the store.</div>
                                    ) : (
                                        <div style={{ color: '#888', fontStyle: 'italic' }}>Waiting for admin confirmation...</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCheckout && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '15px', width: '90%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                        {orderStatus === 'success' ? (
                            <div style={{ textAlign: 'center', padding: '1rem' }}>
                                <h1 style={{ fontSize: '4rem' }}>🎉</h1>
                                <h2 style={{ color: '#28a745' }}>Order Placed!</h2>
                                <p>Your COD order has been received successfully.</p>
                            </div>
                        ) : (
                            <>
                                <h2 style={{ marginBottom: '1rem', color: 'rgb(0, 0, 128)' }}>Checkout Summary</h2>

                                {isCartCheckout ? (
                                    <div style={{ marginBottom: '1rem', maxHeight: '150px', overflowY: 'auto', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                                        {cartItems.map(item => (
                                            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '5px' }}>
                                                <span>{item.name} x {item.qty}</span>
                                                <span>₹{item.price * item.qty}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Product:</span>
                                            <span>{selectedProduct?.name}</span>
                                        </div>
                                        <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Quantity:</span>
                                            <span>{selectedQty}</span>
                                        </div>
                                    </>
                                )}

                                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', color: 'rgb(0, 0, 128)' }}>
                                    <span>Total Amount:</span>
                                    <span>₹{isCartCheckout
                                        ? cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0)
                                        : selectedProduct?.price * selectedQty} (COD)</span>
                                </div>

                                <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    <input type="text" placeholder="Street Address" required value={shippingAddress.address} onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                    <input type="text" placeholder="City" required value={shippingAddress.city} onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                    <input type="text" placeholder="PIN Code" required value={shippingAddress.postalCode} onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                    <input type="text" placeholder="Phone Number" required value={shippingAddress.phone} onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />

                                    <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                                        <button type="submit" style={{ flex: 1, padding: '14px', backgroundColor: 'rgb(0, 0, 128)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>Confirm COD Order</button>
                                        <button type="button" onClick={() => setShowCheckout(false)} style={{ flex: 1, padding: '14px', backgroundColor: '#f0f0f0', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {reviewModal.open && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '15px', width: '90%', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                        <h2 style={{ marginBottom: '1rem', color: 'rgb(0, 0, 128)' }}>Review {reviewModal.product.name}</h2>
                        <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Rating (Out of 5)</label>
                                <select value={reviewForm.rating} onChange={e => setReviewForm({ ...reviewForm, rating: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}>
                                    {[5, 4, 3, 2, 1].map(num => <option key={num} value={num}>{num} Stars</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Review Feedback</label>
                                <textarea required rows="4" value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="Tell us what you think..." style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', resize: 'vertical' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Attach Photos (Optional)</label>
                                <input type="file" multiple accept="image/*" onChange={e => setReviewForm({ ...reviewForm, images: e.target.files })} />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                                <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: 'rgb(0, 0, 128)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Submit Review</button>
                                <button type="button" onClick={() => setReviewModal({ open: false, product: null })} style={{ padding: '12px 20px', backgroundColor: '#ccc', color: '#333', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyOrders;
