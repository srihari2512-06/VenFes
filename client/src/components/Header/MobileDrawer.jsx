import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, User, ShoppingBag, Package, Heart, Store, Shield, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['All', 'Electronics', 'Footwear', 'Clothing', 'Books', 'Accessories'];

export default function MobileDrawer({ isOpen, onClose }) {
  const { user, logout, isVendor, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex'
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(2px)'
        }}
      />

      {/* Slide-over panel */}
      <div
        style={{
          position: 'relative',
          width: '82%',
          maxWidth: '320px',
          height: '100%',
          backgroundColor: 'var(--surface)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 2001,
          overflowY: 'auto'
        }}
      >
        {/* Header / Account banner */}
        <div style={{ backgroundColor: 'var(--primary)', color: '#ffffff', padding: '20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 'bold' }}>
                {user ? user.name : 'Welcome, Shopper'}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>
                {user ? `${user.email} (${user.role})` : 'Sign in for best deals'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation list */}
        <div style={{ padding: '16px 0', flex: 1 }}>
          {/* Auth shortcut if guest */}
          {!user && (
            <div style={{ padding: '0 16px 16px', borderBottom: '1px solid var(--border)' }}>
              <Link
                to="/login"
                onClick={onClose}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Sign In / Register
              </Link>
            </div>
          )}

          {/* Categories Section */}
          <div style={{ padding: '12px 16px 6px', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Categories
          </div>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={cat === 'All' ? '/products' : `/products?category=${encodeURIComponent(cat)}`}
              onClick={onClose}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 16px',
                fontSize: '14px',
                color: 'var(--text-main)',
                borderBottom: '1px solid var(--border-subtle)'
              }}
            >
              <span>{cat}</span>
              <ChevronRight size={14} color="var(--text-muted)" />
            </Link>
          ))}

          {/* Account & Orders Section */}
          <div style={{ padding: '20px 16px 6px', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            My Account & Orders
          </div>
          <Link
            to="/orders"
            onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', fontSize: '14px' }}
          >
            <Package size={18} color="var(--primary)" />
            <span>My Orders & Tracking</span>
          </Link>
          <Link
            to="/wishlist"
            onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', fontSize: '14px' }}
          >
            <Heart size={18} color="var(--danger)" />
            <span>Wishlist</span>
          </Link>
          <Link
            to="/account"
            onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', fontSize: '14px' }}
          >
            <User size={18} color="var(--secondary)" />
            <span>Account Settings</span>
          </Link>

          {/* Portal Links */}
          <div style={{ padding: '20px 16px 6px', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Sell & Administer
          </div>
          {isVendor ? (
            <Link
              to="/vendor"
              onClick={onClose}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', fontSize: '14px' }}
            >
              <Store size={18} color="var(--accent)" />
              <span>Vendor Merchant Portal</span>
            </Link>
          ) : (
            <Link
              to="/register"
              onClick={onClose}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', fontSize: '14px' }}
            >
              <Store size={18} color="var(--accent)" />
              <span>Sell on Venfes</span>
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={onClose}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', fontSize: '14px' }}
            >
              <Shield size={18} color="var(--success)" />
              <span>Platform Admin Portal</span>
            </Link>
          )}
        </div>

        {/* Footer */}
        {user && (
          <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
            <button
              onClick={() => {
                logout();
                onClose();
                navigate('/login');
              }}
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center', gap: '6px' }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
