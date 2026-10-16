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
  LogOut,
  MapPin,
  Tag,
  Gift,
  Clock,
  Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import SearchBox from './SearchBox';
import PincodeModal from './PincodeModal';
import MobileDrawer from './MobileDrawer';
import CategoryNavStrip from './CategoryNavStrip';
import { fetchWithCache, getCachedData } from '../../utils/apiCache';

function HeaderComponent() {
  const { user, logout, isVendor, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

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

  // Fetch wishlist count only when authenticated user changes (removes redundant API call on route change)
  useEffect(() => {
    if (user?._id) {
      const cached = getCachedData('/api/engagement/wishlist');
      if (cached?.data?.wishlist) {
        setWishlistCount(cached.data.wishlist.products?.length || 0);
      }
      fetchWithCache('/api/engagement/wishlist', {
        headers: { Authorization: `Bearer ${localStorage.getItem('venfes_token')}` }
      })
        .then(data => {
          if (data?.success && data.data?.wishlist) {
            setWishlistCount(data.data.wishlist.products?.length || 0);
          }
        })
        .catch(() => {});
    } else {
      setWishlistCount(0);
    }
  }, [user?._id]);

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
      <div style={{ borderBottom: !isPortal ? '1px solid var(--border-subtle)' : 'none' }}>
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
                      Hello, {user?.name ? user.name.split(' ')[0] : (user?.email ? user.email.split('@')[0] : 'Shopper')}
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
                  <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <strong>{user?.name || user?.email || 'User'}</strong>
                      <span className="badge badge-accent" style={{ textTransform: 'uppercase', fontSize: '9px', fontWeight: 'bold' }}>
                        {user?.role || 'customer'}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{user?.email || ''}</div>
                  </div>

                  <Link
                    to="/account"
                    onClick={() => setAccountMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', fontSize: '13px', color: 'var(--text-main)' }}
                  >
                    <User size={15} /> My Profile
                  </Link>

                  <Link
                    to="/orders"
                    onClick={() => setAccountMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', fontSize: '13px', color: 'var(--text-main)' }}
                  >
                    <Package size={15} /> My Orders
                  </Link>

                  <Link
                    to="/track"
                    onClick={() => setAccountMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', fontSize: '13px', color: 'var(--primary)', fontWeight: '600' }}
                  >
                    <MapPin size={15} /> Live Order Tracking
                  </Link>

                  <Link
                    to="/coupons"
                    onClick={() => setAccountMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', fontSize: '13px', color: 'var(--text-main)' }}
                  >
                    <Tag size={15} /> Coupons & Deals
                  </Link>

                  <Link
                    to="/gift-cards"
                    onClick={() => setAccountMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', fontSize: '13px', color: 'var(--text-main)' }}
                  >
                    <Gift size={15} /> Gift Cards & Balance
                  </Link>

                  <Link
                    to="/history"
                    onClick={() => setAccountMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', fontSize: '13px', color: 'var(--text-main)' }}
                  >
                    <Clock size={15} /> Browsing History
                  </Link>

                  <Link
                    to="/wishlist"
                    onClick={() => setAccountMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', fontSize: '13px', color: 'var(--text-main)' }}
                  >
                    <Heart size={15} /> Wishlist ({wishlistCount})
                  </Link>

                  {user.role === 'customer' && (
                    <Link
                      to="/register"
                      onClick={() => setAccountMenuOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', fontSize: '13px', color: 'var(--accent)', fontWeight: '600' }}
                    >
                      <Store size={15} /> Sell on Venfes
                    </Link>
                  )}

                  {isVendor && (
                    <Link
                      to="/vendor"
                      onClick={() => setAccountMenuOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', fontSize: '13px', color: 'var(--primary)', fontWeight: '600', backgroundColor: 'var(--primary-light)' }}
                    >
                      <Store size={15} /> Vendor Portal Dashboard
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setAccountMenuOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', fontSize: '13px', color: 'var(--success)', fontWeight: '600', backgroundColor: '#f0fdf4' }}
                    >
                      <Shield size={15} /> Admin Portal Dashboard
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

      {/* Tier 2: Category Strip (Memoized, stably rendered without layout shifts or unmounting) */}
      {!isPortal && <CategoryNavStrip isVisible={!isPortal} />}

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

export default React.memo(HeaderComponent);
