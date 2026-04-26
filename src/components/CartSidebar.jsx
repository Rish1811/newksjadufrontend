import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../config';

// Import local payment icons
import phonepayIcon from '../assets/product_image/phonepay.png';
import paytmIcon from '../assets/product_image/paytm.png';
import googlepayIcon from '../assets/product_image/googlepay.png';
import bhimIcon from '../assets/product_image/bhim.png';


const CartSidebar = ({ isOpen, onClose }) => {
    const [cartItems, setCartItems] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const fetchCart = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/cart`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCartItems(data);
                fetchSuggestions(data);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuggestions = async (currentCart) => {
        try {
            const response = await fetch(`${API_BASE}/api/products`);
            if (response.ok) {
                const allProducts = await response.json();
                // Filter out products already in cart
                const cartIds = currentCart.map(item => item.product);
                const recommended = allProducts
                    .filter(p => !cartIds.includes(p._id))
                    .sort(() => 0.5 - Math.random()) // Shuffle
                    .slice(0, 5); // Take top 5
                setSuggestions(recommended);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const handleAddSuggestion = async (product) => {
        if (!user) {
            navigate('/login');
            return;
        }

        const price = product.price;
        const originalPrice = product.sizes && product.sizes[0]?.originalPrice 
            ? product.sizes[0].originalPrice 
            : Math.round(price * 1.5);

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
                    price: price,
                    originalPrice: originalPrice,
                    qty: 1
                })
            });

            if (res.ok) {
                fetchCart();
                window.dispatchEvent(new Event('cartUpdated'));
            }
        } catch (error) {
            console.error('Error adding suggestion:', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchCart();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleCartUpdate = () => {
            if (isOpen) fetchCart();
        };
        window.addEventListener('cartUpdated', handleCartUpdate);
        return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }, [isOpen]);

    const updateQty = async (productId, newQty) => {
        if (newQty < 1) return;
        try {
            const response = await fetch(`${API_BASE}/api/cart/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({ qty: newQty })
            });
            if (response.ok) {
                fetchCart();
                window.dispatchEvent(new Event('cartUpdated'));
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    };

    const removeItem = async (productId) => {
        try {
            const response = await fetch(`${API_BASE}/api/cart/${productId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (response.ok) {
                fetchCart();
                window.dispatchEvent(new Event('cartUpdated'));
            }
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const totalMRP = cartItems.reduce((acc, item) => {
        const itemMRP = item.originalPrice || Math.round(item.price * 1.5);
        return acc + itemMRP * item.qty;
    }, 0);
    const totalSavings = totalMRP - totalPrice;
    const savingsPercent = totalMRP > 0 ? Math.round((totalSavings / totalMRP) * 100) : 0;

    const getImageUrl = (path) => {
        if (!path) return '/images/sample.jpg';
        return path.startsWith('http') ? path : `${API_BASE}${path}`;
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div 
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 1001,
                        transition: 'opacity 0.3s ease'
                    }}
                />
            )}

            {/* Sidebar */}
            <div style={{
                position: 'fixed',
                top: 0,
                right: isOpen ? 0 : '-450px',
                width: '100%',
                maxWidth: '420px',
                height: '100vh',
                backgroundColor: 'white',
                boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
                transition: 'right 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                zIndex: 1002,
                display: 'flex',
                flexDirection: 'column',
                fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                borderTopLeftRadius: '30px',
                borderBottomLeftRadius: '30px',
                overflow: 'hidden'
            }}>

                {/* Header */}
                <div style={{
                    padding: '1.2rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#000', margin: 0, textTransform: 'uppercase' }}>
                        YOUR CART ({cartItems.length})
                    </h2>
                    <button 
                        onClick={onClose}
                        style={{ 
                            background: 'none', 
                            border: 'none', 
                            fontSize: '1.4rem', 
                            cursor: 'pointer',
                            color: '#000',
                            padding: '5px'
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Promo Banner */}
                <div style={{ 
                    backgroundColor: '#8E59A6', 
                    color: 'white', 
                    padding: '10px', 
                    textAlign: 'center', 
                    fontSize: '0.85rem', 
                    fontWeight: '700',
                    letterSpacing: '0.5px'
                }}>
                    FLAT 30% OFF ON ORDERS ₹1199+
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1.2rem' }}>
                    {/* Cart Items List */}
                    {cartItems.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {cartItems.map((item) => (
                                <div key={item.product} style={{ 
                                    backgroundColor: '#F3F4F6', 
                                    borderRadius: '24px', 
                                    padding: '1.2rem',
                                    display: 'flex',
                                    gap: '1.2rem',
                                    border: '1px solid #E5E7EB'
                                }}>
                                    <div style={{ 
                                        width: '100px', 
                                        height: '100px', 
                                        backgroundColor: '#fff', 
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        flexShrink: 0
                                    }}>
                                        <img 
                                            src={getImageUrl(item.image)} 
                                            alt={item.name} 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        />
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ flex: 1, paddingRight: '10px' }}>
                                                <h3 style={{ fontSize: '0.95rem', fontWeight: '700', margin: '0 0 4px 0', color: '#1F2937', lineHeight: '1.2' }}>
                                                    {item.name}
                                                </h3>
                                                <span style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: '500' }}>750ml</span>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#111827' }}>₹{item.price * item.qty}</div>
                                                {item.originalPrice && (
                                                    <div style={{ fontSize: '0.8rem', color: '#9CA3AF', textDecoration: 'line-through', fontWeight: '500' }}>₹{item.originalPrice * item.qty}</div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div style={{ display: 'flex', gap: '12px', marginTop: '12px', alignItems: 'center' }}>
                                            {/* Trash Button */}
                                            <button 
                                                onClick={() => removeItem(item.product)}
                                                style={{ 
                                                    backgroundColor: '#fff', 
                                                    border: '1.5px solid #E5E7EB', 
                                                    borderRadius: '12px', 
                                                    width: '42px',
                                                    height: '42px',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    cursor: 'pointer',
                                                    color: '#6B7280',
                                                    fontSize: '1.2rem',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.borderColor = '#9CA3AF'}
                                                onMouseOut={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                            </button>

                                            {/* Quantity Selector */}
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                border: '1.5px solid #E5E7EB', 
                                                borderRadius: '12px',
                                                backgroundColor: '#fff',
                                                padding: '4px',
                                                height: '42px'
                                            }}>
                                                <button 
                                                    onClick={() => updateQty(item.product, item.qty - 1)}
                                                    style={{ background: 'none', border: 'none', width: '32px', height: '100%', cursor: 'pointer', fontSize: '1.4rem', color: '#374151', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                                >−</button>
                                                <span style={{ minWidth: '36px', textAlign: 'center', fontSize: '1rem', fontWeight: '700', color: '#111827' }}>{item.qty}</span>
                                                <button 
                                                    onClick={() => updateQty(item.product, item.qty + 1)}
                                                    style={{ background: 'none', border: 'none', width: '32px', height: '100%', cursor: 'pointer', fontSize: '1.4rem', color: '#374151', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                                >+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                        </div>
                    ) : !loading && (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
                            <p style={{ color: '#666' }}>Your cart is empty</p>
                        </div>
                    )}

                    {/* Coupon Section */}
                    {cartItems.length > 0 && (
                        <div style={{ 
                            marginTop: '1.5rem', 
                            border: '1px solid #e2e8f0', 
                            borderRadius: '20px', 
                            padding: '1.2rem',
                            backgroundColor: '#f8fafc'
                        }}>
                            <div style={{ marginBottom: '12px' }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#334155', margin: 0 }}>Apply Coupon</h3>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input 
                                    type="text" 
                                    placeholder="Enter coupon code" 
                                    style={{ 
                                        flex: 1, 
                                        padding: '10px 14px', 
                                        borderRadius: '12px', 
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.9rem',
                                        outline: 'none'
                                    }} 
                                />
                                <button style={{ 
                                    backgroundColor: '#000', 
                                    color: '#fff', 
                                    border: 'none', 
                                    padding: '8px 16px', 
                                    borderRadius: '12px', 
                                    fontWeight: '700',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer'
                                }}>
                                    Apply
                                </button>
                            </div>
                            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                                <span style={{ fontSize: '1rem' }}>🎁</span>
                                <span>Check available offers</span>
                            </div>
                        </div>
                    )}

                    {/* Suggestion Section */}
                    {cartItems.length > 0 && suggestions.length > 0 && (
                        <div style={{ 
                            marginTop: '1.5rem', 
                            border: '1px solid #f0f1f2', 
                            borderRadius: '16px', 
                            padding: '1.2rem',
                            backgroundColor: '#fff'
                        }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#2b7a4b', margin: 0, display: 'inline-block', borderBottom: '2px solid #2b7a4b', paddingBottom: '4px' }}>
                                    You might also like
                                </h3>
                            </div>
                            <div style={{ 
                                display: 'flex', 
                                gap: '1rem', 
                                overflowX: 'auto', 
                                paddingBottom: '5px',
                                msOverflowStyle: 'none',
                                scrollbarWidth: 'none',
                            }}>
                                {suggestions.map((product) => (
                                    <div 
                                        key={product._id} 
                                        style={{ 
                                            minWidth: '160px', 
                                            backgroundColor: '#fff', 
                                            padding: '5px',
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}
                                    >
                                        <div style={{ height: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '8px', backgroundColor: '#f8f9fa', borderRadius: '12px', padding: '10px' }}>
                                            <img 
                                                src={getImageUrl(product.image)} 
                                                alt={product.name} 
                                                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} 
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ 
                                                fontSize: '0.75rem', 
                                                fontWeight: '600', 
                                                margin: '0 0 2px 0',
                                                height: '2.4em',
                                                overflow: 'hidden',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                color: '#333'
                                            }}>
                                                {product.name}
                                            </h4>
                                            <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000', margin: '0 0 10px 0' }}>₹{product.price}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleAddSuggestion(product)}
                                            style={{
                                                width: '100%',
                                                padding: '7px',
                                                backgroundColor: '#fff',
                                                color: '#2b7a4b',
                                                border: '1px solid #2b7a4b',
                                                borderRadius: '8px',
                                                fontSize: '0.8rem',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            <span>+</span> ADD
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Section */}
                {cartItems.length > 0 && (
                    <div style={{ 
                        padding: '1.2rem 1.5rem', 
                        borderTop: '1px solid #f0f0f0',
                        backgroundColor: '#fff'
                    }}>
                        {/* Estimated Total */}
                        <div 
                            onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
                            style={{ 
                                cursor: 'pointer',
                                marginBottom: '1.2rem'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '1.2rem', color: '#666' }}>💬</span>
                                    <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#000' }}>Estimated total</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#000' }}>
                                        ₹{totalPrice} <span style={{ fontSize: '0.7rem' }}>{isBreakdownOpen ? '▲' : '▼'}</span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#2b7a4b', fontWeight: '600' }}>
                                        You saved ₹{totalSavings}!
                                    </div>
                                </div>
                            </div>

                            {/* Breakdown */}
                            {isBreakdownOpen && (
                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #ddd', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666' }}>
                                        <span>Total MRP</span>
                                        <span>₹{totalMRP}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666' }}>
                                        <span>Delivery fee</span>
                                        <span style={{ color: totalPrice >= 1199 ? '#2b7a4b' : '#666' }}>
                                            {totalPrice >= 1199 ? 'FREE' : 'To be calculated'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#2b7a4b', fontWeight: '600' }}>
                                        <span>Discount on MRP</span>
                                        <span>- ₹{totalSavings}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666' }}>
                                        <span>Coupon discount</span>
                                        <span style={{ color: '#2b7a4b' }}>₹0</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: '700', color: '#000', marginTop: '4px', paddingTop: '8px', borderTop: '1px solid #f0f0f0' }}>
                                        <span>Grand total</span>
                                        <span>₹{totalPrice}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Button */}
                        <button 
                            onClick={() => {
                                if (!user) {
                                    onClose();
                                    navigate('/login?redirect=cart');
                                } else {
                                    window.dispatchEvent(new CustomEvent('openCheckout', { 
                                        detail: { items: cartItems, total: totalPrice } 
                                    }));
                                }
                            }}
                            style={{
                                width: '100%',
                                padding: '16px 20px',
                                backgroundColor: '#000',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '16px',
                                fontSize: '1.05rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <span>{user ? 'Add address' : 'Login to Checkout'}</span>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ position: 'relative', width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #fff', backgroundColor: '#fff', overflow: 'hidden', zIndex: 4 }}>
                                    <img src={paytmIcon} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }} alt="Paytm" />
                                </div>
                                <div style={{ position: 'relative', width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #fff', backgroundColor: '#fff', overflow: 'hidden', marginLeft: '-12px', zIndex: 3 }}>
                                    <img src={phonepayIcon} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }} alt="PhonePe" />
                                </div>
                                <div style={{ position: 'relative', width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #fff', backgroundColor: '#fff', overflow: 'hidden', marginLeft: '-12px', zIndex: 2 }}>
                                    <img src={googlepayIcon} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }} alt="GPay" />
                                </div>
                                <div style={{ position: 'relative', width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #fff', backgroundColor: '#fff', overflow: 'hidden', marginLeft: '-12px', zIndex: 1 }}>
                                    <img src={bhimIcon} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }} alt="BHIM" />
                                </div>
                            </div>
                        </button>


                        
                        <div style={{ textAlign: 'center', marginTop: '1rem', opacity: 0.5 }}>
                            <span style={{ fontSize: '0.7rem', color: '#888' }}>Powered by <b>shopflo</b></span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartSidebar;
