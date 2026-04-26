import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_BASE from '../config';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState('');
    const [openAccordion, setOpenAccordion] = useState('');
    const [prevProduct, setPrevProduct] = useState(null);
    const [nextProduct, setNextProduct] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const getImageUrl = (path) => {
        if (!path) return '';
        return path.startsWith('http') ? path : `${API_BASE}${path}`;
    };

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/api/products/${id}`);
                const data = await res.json();

                // Fetch all products to determine prev/next sequence
                const allRes = await fetch(`${API_BASE}/api/products`);
                const allData = await allRes.json();

                if (res.ok) {
                    setProduct(data);
                    setMainImage(data.image);

                    if (allRes.ok && Array.isArray(allData)) {
                        const currentIndex = allData.findIndex(p => p._id === id);
                        if (currentIndex > 0) {
                            setPrevProduct(allData[currentIndex - 1]);
                        } else {
                            setPrevProduct(null);
                        }

                        if (currentIndex !== -1 && currentIndex < allData.length - 1) {
                            setNextProduct(allData[currentIndex + 1]);
                        } else {
                            setNextProduct(null);
                        }
                    }
                } else {
                    console.error('Failed to fetch product');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            navigate('/login');
            return;
        }

        const activeSize = product.sizes && product.sizes.length > 0 ? product.sizes[selectedSizeIndex] : null;
        const priceToAdd = activeSize ? activeSize.price : product.price;
        const originalPriceToAdd = activeSize?.originalPrice ? activeSize.originalPrice : Math.round(priceToAdd * 1.5);

        setIsAnimating(true);

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
                    price: priceToAdd,
                    originalPrice: originalPriceToAdd,
                    qty: quantity
                })
            });

            if (res.ok) {
                // Dispatch event so Navbar/others update
                window.dispatchEvent(new Event('cartUpdated'));
                window.dispatchEvent(new Event('openCart'));

                setShowToast(true);

                setTimeout(() => {
                    setIsAnimating(false);
                }, 500);

                setTimeout(() => {
                    setShowToast(false);
                }, 2000);
            } else {
                alert('Error adding to cart');
                setIsAnimating(false);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong');
            setIsAnimating(false);
        }
    };

    if (loading) return <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading product details...</div>;
    if (!product) return <div style={{ minHeight: '80vh', textAlign: 'center', padding: '4rem' }}><h2>Product not found</h2><button onClick={() => navigate('/shop')} className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Shop</button></div>;

    const allImages = [product.image, ...(product.additionalImages || [])].filter(Boolean);
    const activeSize = product.sizes && product.sizes.length > 0 ? product.sizes[selectedSizeIndex] : null;

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                <div style={{ color: '#666' }}>
                    <span style={{ cursor: 'pointer' }} onClick={() => navigate('/shop')}>Back to: <span style={{ textDecoration: 'underline', color: 'rgb(0, 0, 128)', fontWeight: 'bold' }}>Shop All</span></span>
                </div>

                <div style={{ display: 'flex', gap: '8px', fontSize: '1rem', color: 'rgb(0, 0, 128)', alignItems: 'center' }}>
                    {prevProduct && (
                        <span style={{ cursor: 'pointer', borderBottom: '1px solid #aaa', paddingBottom: '1px' }} onClick={() => navigate(`/product/${prevProduct._id}`)}>Previous</span>
                    )}

                    {prevProduct && nextProduct && (
                        <span style={{ color: '#000', margin: '0 2px' }}>/</span>
                    )}

                    {nextProduct && (
                        <span style={{ cursor: 'pointer', borderBottom: '1px solid #aaa', paddingBottom: '1px' }} onClick={() => navigate(`/product/${nextProduct._id}`)}>Next</span>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '4rem' }}>
                {/* Left Side: Images */}
                <div style={{ position: 'relative' }}>
                    <div style={{ backgroundColor: '#EDF5FD', borderRadius: '15px', padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px', position: 'relative', overflow: 'hidden' }}>
                        <img src={getImageUrl(mainImage)} alt={product.name} style={{ width: '80%', height: 'auto', objectFit: 'contain', zIndex: 2 }} />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '1rem', overflowX: 'auto', paddingBottom: '10px' }}>
                        {allImages.map((img, idx) => (
                            <div key={idx} onClick={() => setMainImage(img)} style={{
                                width: '80px', height: '80px', flexShrink: 0, borderRadius: '8px', border: mainImage === img ? '2px solid rgb(0, 0, 128)' : '1px solid #ddd',
                                overflow: 'hidden', cursor: 'pointer', backgroundColor: '#f9f9f9', padding: '5px'
                            }}>
                                <img src={getImageUrl(img)} alt={`Thumbnail ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Details */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                        <div style={{ backgroundColor: '#F0F9ED', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', color: '#333' }}>
                            <span style={{ color: '#FFB800' }}>★★★★☆</span> 4.70/5
                        </div>
                        <span style={{ fontSize: '0.85rem', color: '#666', backgroundColor: '#f0f0f0', padding: '4px 10px', borderRadius: '20px' }}>376 reviews</span>
                    </div>

                    <h1 style={{ fontSize: '2.2rem', color: 'rgb(0, 0, 128)', marginBottom: '1rem', lineHeight: 1.2 }}>
                        {product.name} {activeSize ? `- ${activeSize.size}` : ''}
                    </h1>

                    <div style={{ marginBottom: '1.5rem', color: '#444', fontSize: '1.05rem', lineHeight: 1.6 }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#111' }}>{product.overview || 'The perfect solution for your home.'}</p>
                        <p>{product.description}</p>
                    </div>

                    {product.howToUse && (
                        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748B', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>How to Use</h4>
                            <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.5 }}>{product.howToUse}</p>
                        </div>
                    )}

                    {product.bulletPoints && product.bulletPoints.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', padding: '1.5rem 0' }}>
                            {product.bulletPoints.map((point, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', color: '#333' }}>
                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#E8F5E9', color: '#4CAF50', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem' }}>✓</div>
                                    {point}
                                </div>
                            ))}
                        </div>
                    )}

                    {product.sizes && product.sizes.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '1rem', fontSize: '1.1rem' }}>Size</div>
                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                {product.sizes.map((s, idx) => (
                                    <div key={idx} onClick={() => setSelectedSizeIndex(idx)} style={{
                                        position: 'relative', padding: '15px', borderRadius: '8px', cursor: 'pointer', width: '120px', textAlign: 'center',
                                        border: selectedSizeIndex === idx ? '2px solid rgb(0, 0, 128)' : '1px solid #ddd', backgroundColor: 'white'
                                    }}>
                                        {s.label && (
                                            <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#9B51E0', color: 'white', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', whiteSpace: 'nowrap' }}>
                                                {s.label}
                                            </div>
                                        )}
                                        <div style={{ fontWeight: 'bold', marginTop: '5px' }}>{s.size}</div>
                                        <div style={{ marginTop: '5px', fontSize: '1.1rem', fontWeight: '900' }}>₹ {s.price}</div>
                                        {s.originalPrice && <div style={{ fontSize: '0.85rem', color: '#999', textDecoration: 'line-through' }}>₹ {s.originalPrice}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {(!product.sizes || product.sizes.length === 0) && (
                        <div style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 'bold', color: 'rgb(0, 0, 128)' }}>
                            ₹ {product.price}
                        </div>
                    )}

                    <style>
                        {`
                            @keyframes bounceIcon {
                                0% { transform: scale(1); }
                                50% { transform: scale(1.05); }
                                100% { transform: scale(1); }
                            }
                            @keyframes slideInUp {
                                from { transform: translateY(10px); opacity: 0; }
                                to { transform: translateY(0); opacity: 1; }
                            }
                        `}
                    </style>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '30px', overflow: 'hidden', height: '50px' }}>
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '0 15px', border: 'none', backgroundColor: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>-</button>
                            <div style={{ padding: '0 15px', fontWeight: 'bold', fontSize: '1.1rem', width: '40px', textAlign: 'center' }}>{quantity}</div>
                            <button onClick={() => setQuantity(quantity + 1)} style={{ padding: '0 15px', border: 'none', backgroundColor: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>+</button>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            style={{
                                flex: 1,
                                height: '50px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '30px',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '10px',
                                transition: 'all 0.3s ease',
                                animation: isAnimating ? 'bounceIcon 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'none',
                                boxShadow: '0 4px 10px rgba(40, 167, 69, 0.3)'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                            Add to cart
                        </button>

                        {/* SUCCESS TOOLTIP */}
                        {showToast && (
                            <div style={{
                                position: 'absolute',
                                bottom: '-35px',
                                right: '0',
                                backgroundColor: '#28a745',
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                fontWeight: 'bold',
                                zIndex: 100,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                animation: 'slideInUp 0.3s ease-out',
                                whiteSpace: 'nowrap'
                            }}>
                                Added in card! ✅
                            </div>
                        )}
                    </div>

                    <div style={{ padding: '15px', backgroundColor: '#F8F9FA', borderRadius: '8px', marginBottom: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                        <img src="/visa.png" alt="Visa" style={{ height: '20px', filter: 'grayscale(0)', opacity: 0.8 }} onError={(e) => e.target.style.display = "none"} />
                        <span style={{ fontWeight: 'bold', color: '#1434CB', display: 'none' }}>VISA</span>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', fontWeight: 'bold', color: '#666', fontSize: '0.9rem' }}>
                            <span>💳 VISA</span>
                            <span>🔴🟡 MC</span>
                            <span>Paytm</span>
                            <span>UPI</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginBottom: '2rem' }}>
                        <div style={{ flex: 1, textAlign: 'center', padding: '15px', border: '1px solid #eee', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                            <div style={{ fontSize: '1.5rem' }}>🚚</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>COD Available</div>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center', padding: '15px', border: '1px solid #eee', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                            <div style={{ fontSize: '1.5rem' }}>⚡</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Fast Delivery</div>
                        </div>
                    </div>

                    {/* Accordions */}
                    <div style={{ borderTop: '1px solid #ddd' }}>
                        <div onClick={() => setOpenAccordion(openAccordion === 'overview' ? '' : 'overview')} style={{ padding: '1.2rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: '1px solid #ddd', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            Overview
                            <span>{openAccordion === 'overview' ? '−' : '+'}</span>
                        </div>
                        {openAccordion === 'overview' && (
                            <div style={{ padding: '1rem 0', color: '#555', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                {product.overview ? product.overview : 'No overview provided.'}
                            </div>
                        )}

                        <div onClick={() => setOpenAccordion(openAccordion === 'howto' ? '' : 'howto')} style={{ padding: '1.2rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: '1px solid #ddd', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            How To Use
                            <span>{openAccordion === 'howto' ? '−' : '+'}</span>
                        </div>
                        {openAccordion === 'howto' && (
                            <div style={{ padding: '1rem 0', color: '#555', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                {product.howToUse ? product.howToUse : 'No instructions provided.'}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Product Reviews Section */}
            <div style={{ marginTop: '5rem', borderTop: '1px solid #eee', paddingTop: '3rem' }}>
                <h2 style={{ color: 'rgb(0, 0, 128)', marginBottom: '1.5rem', textAlign: 'center' }}>Customer Reviews</h2>

                {product.reviews && product.reviews.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {product.reviews.map((review, idx) => (
                            <div key={idx} style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '15px', backgroundColor: '#fafafa' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ fontWeight: 'bold' }}>{review.name}</span>
                                    <span style={{ color: '#FFB800' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1rem' }}>
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </div>
                                <p style={{ color: '#444', lineHeight: '1.5', fontSize: '0.95rem', marginBottom: '1rem' }}>
                                    {review.comment}
                                </p>
                                {review.images && review.images.length > 0 && (
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        {review.images.map((img, i) => (
                                            <div key={i} style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden' }}>
                                                <img src={getImageUrl(img)} alt="Review photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', padding: '2rem' }}>
                        No reviews yet. Be the first to review this product after purchase!
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetails;
