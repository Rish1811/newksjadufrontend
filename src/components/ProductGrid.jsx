import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import API_BASE from '../config';
import { loadRazorpayScript } from '../utils/razorpay';

export const ProductCard = ({ _id, name, price, image, rating, category, sizes, onAddToCart, onBuyNow }) => {
    const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
    const activeSize = sizes && sizes.length > 0 ? sizes[selectedSizeIndex] : null;

    const displayPrice = activeSize ? activeSize.price : price;
    const displayOriginalVal = activeSize?.originalPrice ? activeSize.originalPrice : Math.round(displayPrice * 1.5);
    const displayOrigPrice = displayOriginalVal > displayPrice ? displayOriginalVal : displayPrice;
    const displayDiscount = displayOrigPrice > displayPrice ? Math.round(((displayOrigPrice - displayPrice) / displayOrigPrice) * 100) : 0;
    const displayImage = activeSize?.image ? activeSize.image : image;

    const getImageUrl = (path) => {
        if (!path) return '/images/sample.jpg';
        return path.startsWith('http') ? path : `${API_BASE}${path}`;
    };

    const imageUrl = getImageUrl(displayImage);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const navigate = useNavigate();

    const handleAddClick = (e) => {
        e.stopPropagation();
        setIsAnimating(true);
        onAddToCart({ _id, name, price: displayPrice, image: displayImage }, 1); // Fixed quantity to 1

        // Show small toast
        setShowToast(true);

        setTimeout(() => {
            setIsAnimating(false);
        }, 500);

        setTimeout(() => {
            setShowToast(false);
        }, 2000);
    };

    return (
        <div style={{
            backgroundColor: '#FAF9F6',
            borderRadius: '16px',
            overflow: 'hidden',
            transition: 'all 0.4s ease',
            border: '1px solid #ebe9e0',
            position: 'relative',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
        }} className="product-card"
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)';
            }}
        >
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    @keyframes bounceIcon {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.1); }
                        100% { transform: scale(1); }
                    }
                    @keyframes slideInUp {
                        from { transform: translateY(20px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                `}
            </style>

            <div style={{
                position: 'relative',
                height: '260px',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer'
            }}
                onClick={() => navigate(`/product/${_id}`)}
            >
                {!imageLoaded && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10
                    }}>
                        <div style={{
                            border: '4px solid #f3f3f3',
                            borderTop: '4px solid #3498db',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                    </div>
                )}
                <img src={imageUrl} alt={name} style={{
                    height: '100%',
                    width: '100%',
                    objectFit: 'cover',
                    transition: 'opacity 0.5s ease, transform 0.5s ease',
                    opacity: imageLoaded ? 1 : 0
                }}
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                        setImageLoaded(true);
                    }}
                    onMouseOver={(e) => imageLoaded && (e.target.style.transform = 'scale(1.05)')}
                    onMouseOut={(e) => imageLoaded && (e.target.style.transform = 'scale(1)')}
                />
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: '#FFF',
                    color: '#2b7a4b',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                    {category || 'Best Seller'}
                </div>
            </div>

            <div style={{ padding: '1.2rem 1.5rem', textAlign: 'left' }}>
                <div style={{ color: '#2b7a4b', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {'★'.repeat(5)} <span style={{ color: '#555', fontSize: '0.8rem', fontWeight: '500' }}>226 reviews</span>
                </div>
                
                <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#000',
                    minHeight: '2.4em',
                    overflow: 'hidden',
                    lineHeight: '1.2',
                    cursor: 'pointer'
                }}
                    onClick={() => navigate(`/product/${_id}`)}
                >
                    {name}
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '1.2rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#000' }}>Rs. {displayPrice}</span>
                    {displayDiscount > 0 && (
                        <>
                            <span style={{ fontSize: '0.85rem', textDecoration: 'line-through', color: '#888' }}>Rs. {displayOrigPrice}</span>
                            <span style={{ fontSize: '0.8rem', color: '#2b7a4b', fontWeight: '600' }}>Save {displayDiscount}%</span>
                        </>
                    )}
                </div>

                {sizes && sizes.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        {sizes.map((s, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSizeIndex(idx);
                                }}
                                style={{
                                    padding: '8px 16px',
                                    border: selectedSizeIndex === idx ? '1px solid #7BA942' : '1px solid #e5e7eb',
                                    backgroundColor: selectedSizeIndex === idx ? '#7BA942' : '#fff',
                                    color: selectedSizeIndex === idx ? 'white' : '#4b5563',
                                    borderRadius: '12px',
                                    fontSize: '0.9rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    minWidth: '100px',
                                    boxShadow: selectedSizeIndex === idx ? '0 4px 12px rgba(123, 169, 66, 0.2)' : 'none'
                                }}
                            >
                                {s.label && (
                                    <span style={{ 
                                        fontSize: '0.65rem', 
                                        textTransform: 'uppercase', 
                                        marginBottom: '2px',
                                        opacity: selectedSizeIndex === idx ? 0.9 : 0.6,
                                        letterSpacing: '0.5px'
                                    }}>
                                        {s.label}
                                    </span>
                                )}
                                <span>{s.size}</span>
                            </button>
                        ))}
                    </div>
                )}

                <div style={{ position: 'relative' }}>
                    <button
                        onClick={handleAddClick}
                        style={{
                            width: '100%',
                            padding: '12px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: '#000',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '25px',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            animation: isAnimating ? 'bounceIcon 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'none',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#333'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#000'}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                        Add to cart
                    </button>

                    {/* SUCCESS TOOLTIP */}
                    {showToast && (
                        <div style={{
                            position: 'absolute',
                            top: '-45px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: '#28a745',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            zIndex: 100,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            animation: 'slideInUp 0.3s ease-out',
                            whiteSpace: 'nowrap'
                        }}>
                            Added to cart! ✅
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ProductGrid = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCheckout, setShowCheckout] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedQty, setSelectedQty] = useState(1);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [shippingAddress, setShippingAddress] = useState({ address: '', city: '', postalCode: '', phone: '' });
    const [orderStatus, setOrderStatus] = useState(null);
    const [paymentConfig, setPaymentConfig] = useState(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/payment_settings/config`);
                if (res.ok) setPaymentConfig(await res.json());
            } catch (err) { console.error('Config fetch error:', err); }
        };
        fetchConfig();
    }, []);

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchProducts = async () => {
            const queryParams = new URLSearchParams(window.location.search);
            const category = queryParams.get('category');
            
            try {
                let url = `${API_BASE}/api/products`;
                if (category) {
                    url += `?category=${encodeURIComponent(category)}`;
                }
                const response = await fetch(url);
                const data = await response.json();
                setProducts(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
            }
        };

        fetchProducts();
    }, [window.location.search]);

    const handleAddToCart = async (product, quantity = 1, silent = false) => {
        if (!user) {
            alert('Please login to add items to cart');
            navigate('/login');
            return false;
        }

        try {
            const res = await fetch(`${API_BASE}/api/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    product: product._id,
                    name: product.name,
                    image: product.image,
                    price: product.price,
                    originalPrice: product.originalPrice || Math.round(product.price * 1.5),
                    qty: quantity
                })
            });

            if (res.ok) {
                if (!silent) {
                    window.dispatchEvent(new Event('openCart'));
                }
                window.dispatchEvent(new Event('cartUpdated'));
                return true;
            } else {
                const errorData = await res.json();
                alert(errorData.message || 'Failed to add to cart');
                return false;
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Error adding to cart');
            return false;
        }
    };

    const handleBuyNow = async (product, quantity = 1) => {
        const success = await handleAddToCart(product, quantity, true);
        if (success) {
            setSelectedProduct(product);
            setSelectedQty(quantity);
            setShowCheckout(true);
        }
    };

    const handlePlaceOrder = async (e, method = 'cod') => {
        if (e) e.preventDefault();
        const orderData = {
            orderItems: [{
                name: selectedProduct.name,
                qty: selectedQty,
                image: selectedProduct.image,
                price: selectedProduct.price,
                product: selectedProduct._id
            }],
            shippingAddress,
            totalPrice: selectedProduct.price * selectedQty,
            paymentMethod: method
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
                const createdOrder = await res.json();
                
                // If Online Payment is selected and enabled, start payment process
                if (method === 'online' && paymentConfig && paymentConfig.isEnabled) {
                    const scriptLoaded = await loadRazorpayScript();
                    if (!scriptLoaded) {
                        alert('Razorpay SDK failed to load. Are you online?');
                        return;
                    }

                    // Create Razorpay Order
                    const rpRes = await fetch(`${API_BASE}/api/razorpay/create-order`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            amount: orderData.totalPrice,
                            receipt: createdOrder._id
                        })
                    });

                    if (!rpRes.ok) throw new Error('Razorpay order creation failed');
                    const rpOrder = await rpRes.json();

                    const options = {
                        key: paymentConfig.keyId,
                        amount: rpOrder.amount,
                        currency: rpOrder.currency,
                        name: "K'S JADU",
                        description: "Payment for Order #" + createdOrder._id.slice(-6),
                        image: "/logo.png",
                        order_id: rpOrder.id,
                        handler: async (response) => {
                            const verifyRes = await fetch(`${API_BASE}/api/razorpay/verify`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    ...response,
                                    database_order_id: createdOrder._id
                                })
                            });
                            if (verifyRes.ok) {
                                setOrderStatus('success');
                                finalizeOrder();
                            } else {
                                setOrderStatus('error');
                            }
                        },
                        prefill: {
                            name: user.name,
                            email: user.email,
                            contact: shippingAddress.phone
                        },
                        theme: { color: "#6366f1" }
                    };

                    const rzp = new window.Razorpay(options);
                    rzp.open();
                } else {
                    // COD or simple success
                    setOrderStatus('success');
                    finalizeOrder();
                }
            } else {
                setOrderStatus('error');
            }
        } catch (error) {
            console.error('Order error:', error);
            setOrderStatus('error');
        }
    };

    const finalizeOrder = () => {
        setTimeout(() => {
            setShowCheckout(false);
            setOrderStatus(null);
            setShippingAddress({ address: '', city: '', postalCode: '', phone: '' });
        }, 3000);
    };

    return (
        <section style={{ padding: '5rem 0' }}>
            <div className="container">
                <h2 className="section-title">Best Sellers</h2>
                <p className="section-subtitle">Our most loved plant-based cleaning solutions</p>

                <style>
                    {`
                        .responsive-grid {
                            display: grid;
                            gap: 1.5rem;
                            grid-template-columns: repeat(4, 1fr);
                        }
                        @media (max-width: 1024px) {
                            .responsive-grid {
                                grid-template-columns: repeat(3, 1fr);
                            }
                        }
                        @media (max-width: 768px) {
                            .responsive-grid {
                                grid-template-columns: repeat(2, 1fr);
                            }
                        }
                        @media (max-width: 480px) {
                            .responsive-grid {
                                grid-template-columns: repeat(1, 1fr);
                            }
                        }
                    `}
                </style>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>Loading products...</div>
                ) : (
                    <div className="responsive-grid">
                        {products.map(product => (
                            <ProductCard
                                key={product._id}
                                {...product}
                                onAddToCart={handleAddToCart}
                                onBuyNow={handleBuyNow}
                            />
                        ))}
                    </div>
                )}

                {showCheckout && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '15px', width: '90%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                            {orderStatus === 'success' ? (
                                <div style={{ textAlign: 'center', padding: '1rem' }}>
                                    <h2 style={{ color: '#28a745' }}>🎉 Order Placed!</h2>
                                    <p>Your COD order has been received successfully.</p>
                                </div>
                            ) : (
                                <>
                                    <h2 style={{ marginBottom: '1rem', color: 'RGB(0, 0, 128)' }}>Order {selectedProduct.name}</h2>
                                    <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Quantity:</span>
                                        <span>{selectedQty}</span>
                                    </div>
                                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                        <span>Total Price:</span>
                                        <span>₹{selectedProduct.price * selectedQty}</span>
                                    </div>
                                    <form onSubmit={(e) => handlePlaceOrder(e, 'cod')} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                        <input type="text" placeholder="Street Address" required value={shippingAddress.address} onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                                        <input type="text" placeholder="City" required value={shippingAddress.city} onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                                        <input type="text" placeholder="PIN Code" required value={shippingAddress.postalCode} onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                                        <input type="text" placeholder="Phone Number" required value={shippingAddress.phone} onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: 'RGB(0, 0, 128)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Confirm COD</button>
                                                {paymentConfig?.isEnabled && (
                                                    <button type="button" onClick={() => handlePlaceOrder(null, 'online')} style={{ flex: 1, padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Pay Online</button>
                                                )}
                                            </div>
                                            <button type="button" onClick={() => setShowCheckout(false)} style={{ width: '100%', padding: '10px', backgroundColor: '#ccc', color: '#333', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {products.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                        No products available. Check back soon!
                    </div>
                )}

                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <a href="/shop" className="btn btn-primary">View All Products</a>
                </div>
            </div>
        </section>
    );
};

export default ProductGrid;
