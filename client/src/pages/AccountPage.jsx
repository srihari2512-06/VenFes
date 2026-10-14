import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { User, Package, Heart, Store, Shield, LogOut } from 'lucide-react';

export default function AccountPage() {
  const { user, logout, isVendor, isAdmin } = useAuth();

  if (!user) return null;

  return (
    <div className="container" style={{ padding: '32px 16px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <User size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>{user.name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{user.email}</p>
            <span className="badge badge-placed" style={{ marginTop: '6px', textTransform: 'capitalize' }}>
              {user.role}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '20px' }}>
          <Link to="/orders" className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border)' }}>
            <Package size={24} color="var(--primary)" />
            <div>
              <strong style={{ display: 'block', fontSize: '15px' }}>My Orders</strong>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Track packages & history</span>
            </div>
          </Link>

          <Link to="/wishlist" className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border)' }}>
            <Heart size={24} color="var(--danger)" />
            <div>
              <strong style={{ display: 'block', fontSize: '15px' }}>Wishlist</strong>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Saved products</span>
            </div>
          </Link>

          {isVendor && (
            <Link to="/vendor" className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border)' }}>
              <Store size={24} color="var(--accent)" />
              <div>
                <strong style={{ display: 'block', fontSize: '15px' }}>Vendor Portal</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Manage store & products</span>
              </div>
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin" className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border)' }}>
              <Shield size={24} color="var(--success)" />
              <div>
                <strong style={{ display: 'block', fontSize: '15px' }}>Admin Portal</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Platform moderation</span>
              </div>
            </Link>
          )}
        </div>

        <div style={{ marginTop: '28px', borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={logout} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
