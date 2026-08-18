import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TickerBanner from './components/TickerBanner';
import CartSidebar from './components/CartSidebar';
import CheckoutModal from './components/CheckoutModal';
import Toaster from './components/Toaster';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';

/**
 * Only the home page ships in the initial bundle. Every other route is fetched
 * the first time someone navigates to it, which is the single biggest win for
 * first-load time - the admin dashboard and charts library in particular were
 * being downloaded by every shopper who never opens them.
 */
const Shop = lazy(() => import('./pages/Shop'));
const OurStory = lazy(() => import('./pages/OurStory'));
const Ingredients = lazy(() => import('./pages/Ingredients'));
const Blog = lazy(() => import('./pages/Blog'));
const Wholesale = lazy(() => import('./pages/Wholesale'));
const Login = lazy(() => import('./pages/Login'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const PolicyPage = lazy(() => import('./pages/PolicyPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

const RouteFallback = () => <div className="route-loader" role="progressbar" aria-label="Loading page" />;

const StorefrontLayout = ({ children }) => (
  <>
    <Navbar />
    <main style={{ flex: 1 }}>{children}</main>
    <Footer />
  </>
);

function App() {
  return (
      <Router>
        <AppProvider>
          <div className="App" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
            <ScrollToTop />
            <TickerBanner />
            <CartSidebar />
            <CheckoutModal />
            <Toaster />

            <ErrorBoundary>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  {/* Admin gets its own chrome-free shell. */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />

                  <Route path="/" element={<StorefrontLayout><Home /></StorefrontLayout>} />
                  <Route path="/shop" element={<StorefrontLayout><Shop /></StorefrontLayout>} />
                  <Route path="/our-story" element={<StorefrontLayout><OurStory /></StorefrontLayout>} />
                  <Route path="/ingredients" element={<StorefrontLayout><Ingredients /></StorefrontLayout>} />
                  <Route path="/blog" element={<StorefrontLayout><Blog /></StorefrontLayout>} />
                  <Route path="/wholesale" element={<StorefrontLayout><Wholesale /></StorefrontLayout>} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/my-orders" element={<StorefrontLayout><MyOrders /></StorefrontLayout>} />
                  <Route path="/product/:id" element={<StorefrontLayout><ProductDetails /></StorefrontLayout>} />
                  <Route path="/policy/:type" element={<StorefrontLayout><PolicyPage /></StorefrontLayout>} />
                  <Route path="*" element={<StorefrontLayout><NotFound /></StorefrontLayout>} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </div>
        </AppProvider>
      </Router>
  );
}

export default App;
