import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  ShoppingCart,
  Heart,
  Package,
  User,
  ChevronDown,
  Menu,
  Store,
  Shield,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import SearchBox from './SearchBox';
import PincodeModal from './PincodeModal';
import MobileDrawer from './MobileDrawer';

const CATEGORIES = [
  { label: 'All Categories', path: '/products' },
  { label: 'Electronics', path: '/products?category=Electronics' },
  { label: 'Footwear', path: '/products?category=Footwear' },
  { label: 'Clothing', path: '/products?category=Clothing' },
  { label: 'Books', path: '/products?category=Books' },
  { label: 'Accessories', path: '/products?category=Accessories' }
];

export default function Header() {
  const { user, logout, isVendor, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showCategoryStrip, setShowCategoryStrip] = useState(true);
  const [wishlistCount, setWishlistCount] = useState(0);

  const lastScrollY = useRef(0);
  const accountMenuRef = useRef(null);

  // Close account menu on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch wishlist count if logged in
  useEffect(() => {
    if (user) {
      fetch('/api/engagement/wishlist', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data.wishlist) {
            setWishlistCount(data.data.wishlist.products?.length || 0);
          }
        })
        .catch(() => {});
    } else {
      setWishlistCount(0);
    }
  }, [user, location.pathname]);

  // Scroll listener: second row hides on scroll down, returns on scroll up
  useEffect(() => {
    function handleScroll() {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 100 && currentScrollY > lastScrollY.current) {
        setShowCategoryStrip(false);
      } else {
        setShowCategoryStrip(true);
      }
      lastScrollY.current = currentScrollY;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // If in Vendor or Admin portal, render clean portal header
  const isPortal = location.pathname.startsWith('/vendor') || location.pathname.startsWith('/admin');

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-xs)',
        transition: 'all 0.2s ease-in-out'
      }}
    >
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Tier 1: Main Top Bar */}
      <div style={{ borderBottom: showCategoryStrip && !isPortal ? '1px solid var(--border-subtle)' : 'none' }}>
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            minHeight: '64px',
            paddingTop: '8px',
            paddingBottom: '8px'
          }}
        >
          {/* Left: Mobile Menu Toggle & Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                padding: '4px',
                cursor: 'pointer',
                color: 'var(--text-main)'
              }}
              className="mobile-menu-btn"
              aria-label="Open navigation menu"
            >
              <Menu size={24} />
            </button>

            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                color: 'var(--primary)',
                fontWeight: '800',
                fontSize: '22px',
                letterSpacing: '-0.5px'
              }}
            >
              <ShoppingBag size={26} strokeWidth={2.5} />
              <span>Venfes</span>
            </Link>

            {/* Delivery Pincode Chip (Desktop only or responsive) */}
            <div className="header-pincode-desktop">
              <PincodeModal />
            </div>
          </div>

          {/* Center: Wide Search Bar */}
          {!isPortal && (
            <div className="header-search-container" style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 8px' }}>
              <SearchBox />
            </div>
          )}

          {/* Right: Actions (Account, Orders, Wishlist, Cart) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            {/* Account Menu */}
            <div ref={accountMenuRef} style={{ position: 'relative' }}>
              {user ? (
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setAccountMenuOpen(false);
                    if (e.key === 'ArrowDown') setAccountMenuOpen(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'none',
                    border: 'none',
                    padding: '6px 10px',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius)',
                    textAlign: 'left'
                  }}
                  aria-expanded={accountMenuOpen}
                  aria-haspopup="true"
                >
                  <User size={18} color="var(--primary)" />
                  <div>
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>
                      Hello, {user.name.split(' ')[0]}
                    </span>
                    <strong style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      Account <ChevronDown size={12} />
                    </strong>
                  </div>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <User size={16} />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Account Dropdown Menu */}
              {user && accountMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    right: 0,
                    width: '210px',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '8px 0',
                    zIndex: 1100
                  }}
                >
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', fontSize: '12px' }}>
                    <strong>{user.name}</strong>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{user.email}</div>
                  </div>

                  <Link
                    to="/account"
                    onClick={() => setAccountMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '13px', color: 'var(--text-main)' }}
                  >
                    <User size={15} /> My Profile
                  </Link>

                  <Link
                    to="/orders"
                    onClick={() => setAccountMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '13px', color: 'var(--text-main)' }}
                  >
                    <Package size={15} /> My Orders
                  </Link>

                  <Link
                    to="/wishlist"
                    onClick={() => setAccountMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '13px', color: 'var(--text-main)' }}
                  >
                    <Heart size={15} /> Wishlist ({wishlistCount})
                  </Link>

                  {user.role === 'customer' && (
                    <Link
                      to="/register"
                      onClick={() => setAccountMenuOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '13px', color: 'var(--accent)', fontWeight: '500' }}
                    >
                      <Store size={15} /> Sell on Venfes
                    </Link>
                  )}

                  {isVendor && (
                    <Link
                      to="/vendor"
                      onClick={() => setAccountMenuOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '13px', color: 'var(--primary)', fontWeight: '500' }}
                    >
                      <Store size={15} /> Vendor Portal
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setAccountMenuOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '13px', color: 'var(--success)', fontWeight: '500' }}
                    >
                      <Shield size={15} /> Admin Portal
                    </Link>
                  )}

                  <div style={{ borderTop: '1px solid var(--border)', marginTop: '4px', paddingTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--danger)',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Orders link (desktop) */}
            <Link
              to="/orders"
              className="header-link-desktop"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '600',
                padding: '6px 8px',
                color: 'var(--text-main)'
              }}
            >
              <Package size={18} />
              <span>Orders</span>
            </Link>

            {/* Wishlist Link with count */}
            <Link
              to="/wishlist"
              className="header-link-desktop"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                padding: '6px 8px',
                color: 'var(--text-main)'
              }}
              aria-label={`Wishlist with ${wishlistCount} items`}
            >
              <Heart size={20} color="var(--danger)" />
              {wishlistCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '0px',
                    right: '0px',
                    backgroundColor: 'var(--danger)',
                    color: '#fff',
                    borderRadius: '50%',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button with live count */}
            <Link
              to="/cart"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                padding: '8px 14px',
                borderRadius: 'var(--radius)',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
              aria-label={`Shopping Cart with ${itemCount} items`}
            >
              <ShoppingCart size={19} />
              <span className="cart-label-desktop">Cart</span>
              {itemCount > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    padding: '1px 6px',
                    minWidth: '18px',
                    textAlign: 'center',
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search Row (visible on small screens) */}
        {!isPortal && (
          <div className="mobile-search-row" style={{ padding: '0 16px 10px', display: 'none' }}>
            <SearchBox style={{ maxWidth: '100%' }} />
          </div>
        )}
      </div>

      {/* Tier 2: Category Strip (Hidden on scroll-down, shown on scroll-up) */}
      {!isPortal && showCategoryStrip && (
        <div
          style={{
            backgroundColor: 'var(--surface-alt)',
            borderBottom: '1px solid var(--border)',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}
        >
          <div
            className="container"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 16px'
            }}
          >
            {CATEGORIES.map((cat) => {
              const currentCategoryParam = new URLSearchParams(location.search).get('category') || '';
              const isActive = (cat.label === 'All Categories' && (!currentCategoryParam || currentCategoryParam === 'All')) ||
                currentCategoryParam.toLowerCase() === cat.label.toLowerCase();

              return (
                <NavLink
                  key={cat.label}
                  to={cat.path}
                  style={{
                    padding: '6px 12px',
                    fontSize: '13px',
                    fontWeight: isActive ? '700' : '500',
                    color: isActive ? 'var(--primary)' : 'var(--text-main)',
                    borderRadius: 'var(--radius)',
                    backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat.label}
                </NavLink>
              );
            })}
          </div>
        </div>
      )}

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block !important;
          }
          .header-pincode-desktop,
          .header-link-desktop,
          .header-search-container,
          .cart-label-desktop {
            display: none !important;
          }
          .mobile-search-row {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}
