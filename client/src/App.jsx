import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
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
import NotFoundPage from './pages/NotFoundPage';

export function AppRoutes() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ScrollToTop />
      <Navbar />

      <main style={{ flex: 1 }}>
        <Routes>
          {/* Public Storefront Routes */}
          <Route path="/" element={<Catalog />} />
          <Route path="/products" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/store/:storeId" element={<StorePage />} />
          <Route path="/cart" element={<CartPage />} />

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

      <footer style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface)', padding: '24px 16px', marginTop: 'auto', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
        <div className="container">
          <p><strong>Venfes Multi-Vendor E-Commerce Platform with Analytics</strong></p>
          <p style={{ marginTop: '4px' }}>MERN Stack | Atomic MongoDB Cart-Splitting Checkout | Live Aggregation Pipelines | Socket.io</p>
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
