import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import OurStory from './pages/OurStory';
import Ingredients from './pages/Ingredients';
import Blog from './pages/Blog';
import Wholesale from './pages/Wholesale';
import Login from './pages/Login';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

import MyOrders from './pages/MyOrders';
import ProductDetails from './pages/ProductDetails';
import PolicyPage from './pages/PolicyPage';

import CartSidebar from './components/CartSidebar';
import TickerBanner from './components/TickerBanner';
import CheckoutModal from './components/CheckoutModal';
import API_BASE from './config';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [cartData, setCartData] = React.useState({ items: [], total: 0 });
  const [theme, setTheme] = React.useState(localStorage.getItem('theme') || 'light');
  const user = JSON.parse(localStorage.getItem('user'));

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  React.useEffect(() => {
    const handleOpenCart = () => setIsCartOpen(true);
    const handleToggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    const handleOpenCheckout = (e) => {
      setCartData(e.detail);
      setIsCartOpen(false); // Close cart when opening checkout
      setIsCheckoutOpen(true);
    };
    
    window.addEventListener('openCart', handleOpenCart);
    window.addEventListener('toggleTheme', handleToggleTheme);
    window.addEventListener('openCheckout', handleOpenCheckout);

    // Check for auto-open cart flag
    if (localStorage.getItem('autoOpenCart') === 'true') {
      setIsCartOpen(true);
      localStorage.removeItem('autoOpenCart');
    }
    
    return () => {
      window.removeEventListener('openCart', handleOpenCart);
      window.removeEventListener('toggleTheme', handleToggleTheme);
      window.removeEventListener('openCheckout', handleOpenCheckout);
    };
  }, []);

  return (
    <GoogleOAuthProvider clientId="1070866083693-kc2hs31jq8p8rbvc27sibmg9nt3taekp.apps.googleusercontent.com">
      <Router>
        <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <TickerBanner />
          <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
          <CheckoutModal 
            isOpen={isCheckoutOpen} 
            onClose={() => setIsCheckoutOpen(false)} 
            cartItems={cartData.items}
            totalPrice={cartData.total}
            user={user}
          />
          <Routes>
            {/* Admin Routes - No Navbar/Footer for dedicated admin feeling */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* User Routes */}
            <Route path="*" element={
              <>
                <Navbar />
                <div style={{ flex: 1 }}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/our-story" element={<OurStory />} />
                    <Route path="/ingredients" element={<Ingredients />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/wholesale" element={<Wholesale />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/my-orders" element={<MyOrders />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/policy/:type" element={<PolicyPage />} />
                  </Routes>
                </div>
                <Footer />
              </>
            } />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
