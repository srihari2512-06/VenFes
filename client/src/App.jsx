import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import WishlistPage from './pages/WishlistPage';
import VendorPortal from './pages/VendorPortal';
import AdminPortal from './pages/AdminPortal';
import AuthPages from './pages/AuthPages';

function MainApp() {
  const [currentView, setCurrentView] = useState('catalog');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      <main style={{ flex: 1 }}>
        {currentView === 'catalog' && (
          <Catalog
            onSelectProduct={(id) => {
              setSelectedProductId(id);
              setCurrentView('product-detail');
            }}
          />
        )}

        {currentView === 'product-detail' && (
          <ProductDetail
            productId={selectedProductId}
            onBack={() => setCurrentView('catalog')}
          />
        )}

        {currentView === 'cart' && (
          <CartPage
            onBrowse={() => setCurrentView('catalog')}
            onOrderComplete={() => setCurrentView('orders')}
          />
        )}

        {currentView === 'orders' && (
          <OrdersPage
            onSelectProduct={(id) => {
              setSelectedProductId(id);
              setCurrentView('product-detail');
            }}
          />
        )}

        {currentView === 'wishlist' && (
          <WishlistPage
            onSelectProduct={(id) => {
              setSelectedProductId(id);
              setCurrentView('product-detail');
            }}
          />
        )}

        {currentView === 'vendor' && <VendorPortal />}

        {currentView === 'admin' && <AdminPortal />}

        {currentView === 'auth' && (
          <AuthPages onSuccess={() => setCurrentView('catalog')} />
        )}
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
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
