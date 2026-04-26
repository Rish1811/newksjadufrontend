import React, { useState, useEffect } from 'react';
import API_BASE from '../config';
import { loadRazorpayScript } from '../utils/razorpay';

const CheckoutModal = ({ isOpen, onClose, cartItems, totalPrice, user }) => {
    const [shippingAddress, setShippingAddress] = useState({ 
        address: '', 
        city: '', 
        postalCode: '', 
        phone: '' 
    });
    const [orderStatus, setOrderStatus] = useState(null);
    const [paymentConfig, setPaymentConfig] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/payment_settings/config`);
                if (res.ok) setPaymentConfig(await res.json());
            } catch (err) { console.error('Config fetch error:', err); }
        };
        if (isOpen) fetchConfig();
    }, [isOpen]);

    const handlePlaceOrder = async (e, method = 'cod') => {
        if (e) e.preventDefault();
        setLoading(true);

        const orderItems = cartItems.map(item => ({
            name: item.name,
            qty: item.qty,
            image: item.image,
            price: item.price,
            product: item.product
        }));

        const orderData = {
            orderItems,
            shippingAddress,
            totalPrice,
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

                if (method === 'online' && paymentConfig?.isEnabled) {
                    const scriptLoaded = await loadRazorpayScript();
                    if (!scriptLoaded) {
                        alert('Razorpay SDK failed to load. Are you online?');
                        setLoading(false);
                        return;
                    }

                    const rpRes = await fetch(`${API_BASE}/api/razorpay/create-order`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ amount: orderData.totalPrice, receipt: createdOrder._id })
                    });

                    if (!rpRes.ok) throw new Error('Razorpay order creation failed');
                    const rpOrder = await rpRes.json();

                    const options = {
                        key: paymentConfig.keyId,
                        amount: rpOrder.amount,
                        currency: rpOrder.currency,
                        name: "K'S JADU",
                        description: "Order #" + createdOrder._id.slice(-6),
                        image: "/logo.png",
                        order_id: rpOrder.id,
                        handler: async (response) => {
                            const verifyRes = await fetch(`${API_BASE}/api/razorpay/verify`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ ...response, database_order_id: createdOrder._id })
                            });
                            if (verifyRes.ok) {
                                setOrderStatus('success');
                                finalizeOrder();
                            } else {
                                setOrderStatus('error');
                            }
                        },
                        prefill: { name: user.name, email: user.email, contact: shippingAddress.phone },
                        theme: { color: "rgb(0, 0, 128)" }
                    };

                    const rzp = new window.Razorpay(options);
                    rzp.open();
                } else {
                    setOrderStatus('success');
                    finalizeOrder();
                }
            } else {
                setOrderStatus('error');
            }
        } catch (error) {
            console.error(error);
            setOrderStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const finalizeOrder = async () => {
        // Clear cart
        await fetch(`${API_BASE}/api/cart`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${user.token}` }
        });
        window.dispatchEvent(new Event('cartUpdated'));
        
        setTimeout(() => {
            onClose();
            setOrderStatus(null);
            setShippingAddress({ address: '', city: '', postalCode: '', phone: '' });
            window.location.reload();
        }, 3000);
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '32px',
                width: '100%',
                maxWidth: '500px',
                padding: '2.5rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                position: 'relative',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: '#f3f4f6',
                        border: 'none',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '18px',
                        color: '#6b7280'
                    }}
                >✕</button>

                {orderStatus === 'success' ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🎉</div>
                        <h2 style={{ color: '#059669', fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Order Placed!</h2>
                        <p style={{ color: '#4b5563', fontSize: '1.1rem' }}>Your order has been received successfully. Redirecting you shortly...</p>
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111827', margin: '0 0 8px 0' }}>Checkout Details</h2>
                            <p style={{ color: '#6b7280', margin: 0 }}>Please provide your shipping information</p>
                        </div>

                        {/* Order Summary Mini */}
                        <div style={{ 
                            backgroundColor: '#f9fafb', 
                            borderRadius: '20px', 
                            padding: '1.5rem', 
                            marginBottom: '2rem',
                            border: '1px solid #e5e7eb'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ color: '#6b7280', fontWeight: '500' }}>Items ({cartItems.length})</span>
                                <span style={{ color: '#111827', fontWeight: '700' }}>₹{totalPrice}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px dashed #d1d5db' }}>
                                <span style={{ color: '#111827', fontWeight: '800' }}>Grand Total</span>
                                <span style={{ color: '#111827', fontWeight: '800', fontSize: '1.2rem' }}>₹{totalPrice}</span>
                            </div>
                        </div>

                        <form onSubmit={(e) => handlePlaceOrder(e, 'cod')} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div style={{ position: 'relative' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#374151', marginBottom: '6px', marginLeft: '4px' }}>Street Address</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter your flat/house no. and street" 
                                    required 
                                    value={shippingAddress.address} 
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })} 
                                    style={{ 
                                        width: '100%', 
                                        padding: '14px 18px', 
                                        borderRadius: '16px', 
                                        border: '2px solid #e5e7eb',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        transition: 'all 0.2s'
                                    }} 
                                    onFocus={(e) => e.target.style.borderColor = '#000'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#374151', marginBottom: '6px', marginLeft: '4px' }}>City</label>
                                    <input 
                                        type="text" 
                                        placeholder="City" 
                                        required 
                                        value={shippingAddress.city} 
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })} 
                                        style={{ 
                                            width: '100%', 
                                            padding: '14px 18px', 
                                            borderRadius: '16px', 
                                            border: '2px solid #e5e7eb',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }} 
                                        onFocus={(e) => e.target.style.borderColor = '#000'}
                                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#374151', marginBottom: '6px', marginLeft: '4px' }}>PIN Code</label>
                                    <input 
                                        type="text" 
                                        placeholder="6 digits" 
                                        required 
                                        maxLength="6"
                                        value={shippingAddress.postalCode} 
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })} 
                                        style={{ 
                                            width: '100%', 
                                            padding: '14px 18px', 
                                            borderRadius: '16px', 
                                            border: '2px solid #e5e7eb',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }} 
                                        onFocus={(e) => e.target.style.borderColor = '#000'}
                                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#374151', marginBottom: '6px', marginLeft: '4px' }}>Phone Number</label>
                                <input 
                                    type="tel" 
                                    placeholder="10-digit mobile number" 
                                    required 
                                    maxLength="10"
                                    value={shippingAddress.phone} 
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })} 
                                    style={{ 
                                        width: '100%', 
                                        padding: '14px 18px', 
                                        borderRadius: '16px', 
                                        border: '2px solid #e5e7eb',
                                        fontSize: '1rem',
                                        outline: 'none'
                                    }} 
                                    onFocus={(e) => e.target.style.borderColor = '#000'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '1.5rem' }}>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    style={{ 
                                        width: '100%', 
                                        padding: '18px', 
                                        backgroundColor: '#000', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '20px', 
                                        cursor: loading ? 'not-allowed' : 'pointer', 
                                        fontWeight: '800', 
                                        fontSize: '1.1rem',
                                        transition: 'transform 0.2s',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                    onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'scale(1.02)')}
                                    onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'scale(1)')}
                                >
                                    {loading ? 'Processing...' : 'Confirm Cash on Delivery'}
                                </button>
                                
                                {paymentConfig?.isEnabled && (
                                    <button 
                                        type="button" 
                                        disabled={loading}
                                        onClick={(e) => handlePlaceOrder(null, 'online')} 
                                        style={{ 
                                            width: '100%', 
                                            padding: '18px', 
                                            backgroundColor: '#fff', 
                                            color: '#000', 
                                            border: '2px solid #000', 
                                            borderRadius: '20px', 
                                            cursor: loading ? 'not-allowed' : 'pointer', 
                                            fontWeight: '800', 
                                            fontSize: '1.1rem',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}
                                    >
                                        <span style={{ fontSize: '1.2rem' }}>💳</span> Pay Securely Online
                                    </button>
                                )}
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default CheckoutModal;
