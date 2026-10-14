import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ShoppingCart, User, Store, Shield, LogOut, Heart, Package } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin, isVendor } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        {/* Brand */}
        <Link 
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '20px', color: 'var(--primary)' }}
        >
          <ShoppingBag size={24} />
          <span>Venfes Marketplace</span>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <NavLink
            to="/products"
            className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            Storefront
          </NavLink>

          {user && (
            <>
              <NavLink
                to="/orders"
                className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Package size={16} />
                <span>My Orders</span>
              </NavLink>

              <NavLink
                to="/wishlist"
                className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Heart size={16} />
                <span>Wishlist</span>
              </NavLink>

              <NavLink
                to="/account"
                className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <User size={16} />
                <span>Account</span>
              </NavLink>
            </>
          )}

          {isVendor && (
            <NavLink
              to="/vendor"
              className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Store size={16} />
              <span>Vendor Portal</span>
            </NavLink>
          )}

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Shield size={16} />
              <span>Admin Portal</span>
            </NavLink>
          )}
        </nav>

        {/* User / Cart actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            to="/cart"
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
          </Link>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                <strong>{user.name}</strong> ({user.role})
              </span>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              <User size={16} />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
