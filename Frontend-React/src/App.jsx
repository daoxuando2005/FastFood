import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CartSidebar from './components/layout/CartSidebar';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Home from './pages/Home/Home';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Profile from './pages/Customer/Profile';
import Orders from './pages/Customer/Orders';
import Checkout from './pages/Checkout/Checkout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import OwnerDashboard from './pages/Restaurant/OwnerDashboard';

// Import CSS
import './assets/css/style.css';
import './assets/css/detail.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="app-wrapper">
            <Header />
            <main style={{ minHeight: '70vh' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/detail/:resId/:dishId" element={<ProductDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/customer/profile" element={<Profile />} />
                <Route path="/customer/orders" element={<Orders />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
                <Route path="/restaurant-admin/*" element={<OwnerDashboard />} />
              </Routes>
            </main>
            <CartSidebar />
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
