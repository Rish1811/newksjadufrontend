import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../config';
import { ProductCard } from './ProductGrid';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ProductRow = ({ title, section, badgeText, products: initialProducts }) => {
    const [products, setProducts] = useState(initialProducts || []);
    const [loading, setLoading] = useState(!initialProducts);
    const scrollRef = useRef(null);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (initialProducts) return;
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/products`);
                if (response.ok) {
                    const data = await response.json();
                    const filtered = section ? data.filter(p => p.displaySection === section) : data;
                    setProducts(filtered);
                }
            } catch (error) {
                console.error(`Error fetching products for ${section}:`, error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [section, initialProducts]);

    const scroll = (direction) => {
        const { current } = scrollRef;
        if (current) {
            const scrollAmount = 340; // Card width + gap
            current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const handleAddToCart = async (product, quantity = 1, silent = false) => {
        if (!user) { navigate('/login'); return false; }
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
                    qty: quantity
                })
            });
            if (res.ok) {
                if (!silent) window.dispatchEvent(new Event('openCart'));
                window.dispatchEvent(new Event('cartUpdated'));
                return true;
            }
        } catch (error) { console.error(error); }
        return false;
    };

    if (loading || (products && products.length === 0)) return null;

    return (
        <div style={{ padding: '4rem 0', backgroundColor: '#fff', position: 'relative' }}>
            <div className="container">
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    marginBottom: '2.5rem',
                    textAlign: 'center'
                }}>
                    {badgeText && (
                        <span style={{ 
                            backgroundColor: '#FEF3C7', 
                            color: '#92400E', 
                            padding: '4px 12px', 
                            borderRadius: '20px', 
                            fontSize: '0.75rem', 
                            fontWeight: '700',
                            marginBottom: '0.8rem'
                        }}>
                            {badgeText}
                        </span>
                    )}
                    <h2 style={{ 
                        fontSize: '2.2rem', 
                        fontWeight: '800', 
                        color: '#111827',
                        fontFamily: "'Outfit', sans-serif"
                    }}>
                        {title}
                    </h2>
                </div>

                <div style={{ position: 'relative' }}>
                    {/* Navigation Buttons */}
                    <button 
                        onClick={() => scroll('left')}
                        style={{
                            position: 'absolute',
                            left: '-20px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '45px',
                            height: '45px',
                            borderRadius: '50%',
                            backgroundColor: '#fff',
                            border: '1px solid #eee',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 10,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            color: '#333'
                        }}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    
                    <button 
                        onClick={() => scroll('right')}
                        style={{
                            position: 'absolute',
                            right: '-20px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '45px',
                            height: '45px',
                            borderRadius: '50%',
                            backgroundColor: '#fff',
                            border: '1px solid #eee',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 10,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            color: '#333'
                        }}
                    >
                        <ChevronRight size={24} />
                    </button>

                    <div 
                        ref={scrollRef}
                        style={{ 
                            display: 'flex', 
                            gap: '24px', 
                            overflowX: 'auto', 
                            paddingBottom: '20px',
                            msOverflowStyle: 'none',
                            scrollbarWidth: 'none',
                            WebkitOverflowScrolling: 'touch',
                            scrollSnapType: 'x mandatory'
                        }}
                    >
                        {products.map(product => (
                            <div key={product._id} style={{ minWidth: '320px', flexShrink: 0, scrollSnapAlign: 'start' }}>
                                <ProductCard 
                                    {...product} 
                                    onAddToCart={handleAddToCart} 
                                    onBuyNow={() => navigate(`/product/${product._id}`)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <style>{`
                div::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
};

export default ProductRow;
