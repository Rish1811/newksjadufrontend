import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../config';
import Hero from '../components/Hero';
import CategoryCircles from '../components/CategoryCircles';
import ProductGrid from '../components/ProductGrid';
import BannerSlider from '../components/BannerSlider';
import VideoReels from '../components/VideoReels';
import ConcernsSection from '../components/ConcernsSection';
import TrustedByFamilies from '../components/TrustedByFamilies';
import ProductRow from '../components/ProductRow';

const Home = () => {
    const [recentReviews, setRecentReviews] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/products/all/reviews`);
                if (res.ok) {
                    const data = await res.json();
                    setRecentReviews(data);
                }
            } catch (error) {
                console.error('Failed to fetch global reviews:', error);
            }
        };
        fetchReviews();
    }, []);

    return (
        <div style={{ backgroundColor: 'var(--color-white)', transition: 'var(--bg-transition)' }}>
            <Hero />
            <CategoryCircles />
            <BannerSlider />
            
            <ProductRow title="Mom's Favorites" section="moms_favorite" badgeText="Most Loved" />
            <ProductRow title="New Launched by K'sjadu" section="new_launch" badgeText="New" />
            <ProductRow title="Mega Saver Packs" section="mega_saver" badgeText="5 Litres" />

            <VideoReels />
            <ConcernsSection />
            <ProductRow title="Super Saver Refills" section="super_saver_refills" badgeText="2 Litres" />
            <ProductRow title="Best Sellers" section="" />
            <TrustedByFamilies />
        </div>
    );
};

export default Home;
