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

function App() {
  return (
    <Router>
      <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
  );
}

export default App;
