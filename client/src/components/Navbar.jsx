import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ShoppingCart, User, Store, Shield, LogOut, Heart, Package } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView }) {
  const { user, logout, isAdmin, isVendor } = useAuth();
  const { itemCount } = useCart();

  return (
    <header style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        {/* Brand */}
        <div 
          onClick={() => setCurrentView('catalog')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '20px', color: 'var(--primary)' }}
        >
          <ShoppingBag size={24} />
          <span>Venfes Marketplace</span>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={() => setCurrentView('catalog')}
            className={`btn ${currentView === 'catalog' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            Storefront
          </button>

          {user && (
            <>
              <button
                onClick={() => setCurrentView('orders')}
                className={`btn ${currentView === 'orders' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Package size={16} />
                <span>My Orders</span>
              </button>

              <button
                onClick={() => setCurrentView('wishlist')}
                className={`btn ${currentView === 'wishlist' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Heart size={16} />
                <span>Wishlist</span>
              </button>
            </>
          )}

          {isVendor && (
            <button
              onClick={() => setCurrentView('vendor')}
              className={`btn ${currentView === 'vendor' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Store size={16} />
              <span>Vendor Portal</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setCurrentView('admin')}
              className={`btn ${currentView === 'admin' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Shield size={16} />
              <span>Admin Portal</span>
            </button>
          )}
        </nav>

        {/* User / Cart actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setCurrentView('cart')}
            className="btn btn-secondary"
            style={{ position: 'relative', padding: '8px 12px' }}
            aria-label="Shopping Cart"
          >
            <ShoppingCart size={18} />
            {itemCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  borderRadius: '50%',
                  fontSize: '11px',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}
              >
                {itemCount}
              </span>
            )}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                <strong>{user.name}</strong> ({user.role})
              </span>
              <button onClick={logout} className="btn btn-secondary btn-sm" title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={() => setCurrentView('auth')} className="btn btn-primary btn-sm">
              <User size={16} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
