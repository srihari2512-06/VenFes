import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import HomePage from './pages/HomePage';
import WelcomePage from './pages/WelcomePage';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import WishlistPage from './pages/WishlistPage';
import AccountPage from './pages/AccountPage';
import StorePage from './pages/StorePage';
import VendorPortal from './pages/VendorPortal';
import AdminPortal from './pages/AdminPortal';
import AuthPages from './pages/AuthPages';
import CouponsPage from './pages/CouponsPage';
import GiftCardsPage from './pages/GiftCardsPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import BrowsingHistoryPage from './pages/BrowsingHistoryPage';
import NotFoundPage from './pages/NotFoundPage';

export function AppRoutes() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ScrollToTop />
      <Navbar />

      <main style={{ flex: 1 }}>
        <Routes>
          {/* Public Storefront Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/products" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/store/:storeId" element={<StorePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/coupons" element={<CouponsPage />} />
          <Route path="/gift-cards" element={<GiftCardsPage />} />
          <Route path="/track" element={<OrderTrackingPage />} />
          <Route path="/track/:orderId" element={<OrderTrackingPage />} />
          <Route path="/history" element={<BrowsingHistoryPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<AuthPages initialMode="login" />} />
          <Route path="/register" element={<AuthPages initialMode="register" />} />

          {/* Customer / Authenticated Protected Routes */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
                <WishlistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
                <AccountPage />
              </ProtectedRoute>
            }
          />

          {/* Role Protected Portals */}
          <Route
            path="/vendor/*"
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <VendorPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPortal />
              </ProtectedRoute>
            }
          />

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Amazon & Flipkart-Style Multi-Column Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', backgroundColor: '#0f172a', color: '#cbd5e1', marginTop: 'auto' }}>
        {/* Back to top strip */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            width: '100%',
            backgroundColor: '#1e293b',
            color: '#f8fafc',
            border: 'none',
            padding: '12px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            textAlign: 'center'
          }}
        >
          Back to Top ↑
        </button>

        <div className="container" style={{ padding: '40px 16px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '32px', fontSize: '13px' }}>
            <div>
              <strong style={{ color: '#ffffff', display: 'block', marginBottom: '12px', fontSize: '14px' }}>Get to Know Venfes</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link to="/welcome" style={{ color: '#94a3b8' }}>Platform Overview & Welcome</Link>
                <Link to="/products" style={{ color: '#94a3b8' }}>All Verified Marketplace Products</Link>
                <Link to="/coupons" style={{ color: '#94a3b8' }}>Discount Coupons & Vouchers</Link>
                <Link to="/gift-cards" style={{ color: '#94a3b8' }}>Venfes Gift Cards & Wallet</Link>
              </div>
            </div>

            <div>
              <strong style={{ color: '#ffffff', display: 'block', marginBottom: '12px', fontSize: '14px' }}>Sell on Venfes</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link to="/register" style={{ color: '#94a3b8' }}>Vendor Registration & KYC</Link>
                <Link to="/vendor" style={{ color: '#94a3b8' }}>Vendor Merchant Portal</Link>
                <Link to="/admin" style={{ color: '#94a3b8' }}>Platform Admin Governance</Link>
                <span style={{ color: '#64748b', fontSize: '12px' }}>10% Platform Commission Rate</span>
              </div>
            </div>

            <div>
              <strong style={{ color: '#ffffff', display: 'block', marginBottom: '12px', fontSize: '14px' }}>Customer Service & Tracking</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link to="/account" style={{ color: '#94a3b8' }}>Your Account Settings</Link>
                <Link to="/orders" style={{ color: '#94a3b8' }}>Your Orders & Receipts</Link>
                <Link to="/track" style={{ color: '#94a3b8' }}>Live GPS Vehicle Map Tracking</Link>
                <Link to="/wishlist" style={{ color: '#94a3b8' }}>Saved Wishlist</Link>
              </div>
            </div>

            <div>
              <strong style={{ color: '#ffffff', display: 'block', marginBottom: '12px', fontSize: '14px' }}>Payments & Database</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ color: '#94a3b8' }}>Instant UPI (GPay, PhonePe, Paytm)</span>
                <span style={{ color: '#94a3b8' }}>Credit / Debit Cards (Visa, RuPay)</span>
                <span style={{ color: '#94a3b8' }}>Cash on Delivery (Doorstep COD)</span>
                <span style={{ color: '#38bdf8', fontSize: '12px', fontWeight: 'bold' }}>MongoDB Compass Connected</span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#f8fafc' }}>
              Venfes — Multi-Vendor E-Commerce Platform with Analytics
            </p>
            <p style={{ marginTop: '4px', color: '#64748b' }}>
              Full-Stack MERN (MongoDB Atlas / Compass, Express.js, React 18, Node.js) • Department of Information Technology • Atomic Cart-Splitting & Aggregation Analytics
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
