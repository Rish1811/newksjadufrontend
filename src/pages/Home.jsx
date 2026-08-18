import React from 'react';
import Hero from '../components/Hero';
import CategoryCircles from '../components/CategoryCircles';
import BannerSlider from '../components/BannerSlider';
import VideoReels from '../components/VideoReels';
import ConcernsSection from '../components/ConcernsSection';
import TrustedByFamilies from '../components/TrustedByFamilies';
import ProductRow from '../components/ProductRow';

/**
 * Every ProductRow requests the same product list, and the API client serves
 * them all from one shared, cached response - so this page makes a single
 * /api/products call rather than five.
 */
const Home = () => (
    <div style={{ backgroundColor: 'var(--color-bg)', transition: 'var(--bg-transition)' }}>
        <Hero />
        <CategoryCircles />
        <BannerSlider />

        <ProductRow title="Mom's Favourites" section="moms_favorite" badgeText="Most loved" />
        <ProductRow title="New from K'S JADU" section="new_launch" badgeText="New" />
        <ProductRow title="Mega Saver Packs" section="mega_saver" badgeText="5 litres" />

        <VideoReels />
        <ConcernsSection />

        <ProductRow title="Super Saver Refills" section="super_saver_refills" badgeText="2 litres" />
        <ProductRow title="Best Sellers" section="" />

        <TrustedByFamilies />
    </div>
);

export default Home;
