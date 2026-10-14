import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Store, Shield, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AuthPages({ onSuccess, initialMode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const isRegisterRoute = initialMode === 'register' || location.pathname === '/register';
  const [isLogin, setIsLogin] = useState(!isRegisterRoute);
  const [selectedRoleTab, setSelectedRoleTab] = useState('customer'); // 'customer' | 'vendor' | 'admin'

  const [email, setEmail] = useState('customer@venfes.com');
  const [password, setPassword] = useState('customer123');
  const [name, setName] = useState('');
  const [role, setRole] = useState('customer');
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsLogin(location.pathname !== '/register' && initialMode !== 'register');
  }, [location.pathname, initialMode]);

  function handleRoleTabChange(tab) {
    setSelectedRoleTab(tab);
    setError('');
    if (tab === 'admin') {
      setEmail('admin@venfes.com');
      setPassword('admin123');
      setRole('customer'); // Registration won't allow admin
    } else if (tab === 'vendor') {
      setEmail('vendor@venfes.com');
      setPassword('vendor123');
      setRole('vendor');
    } else {
      setEmail('customer@venfes.com');
      setPassword('customer123');
      setRole('customer');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const loggedInUser = await login(email, password);
        if (onSuccess) {
          onSuccess();
        } else {
          // Role-specific redirect for customers, vendors, and admins
          const targetRole = loggedInUser?.role || 'customer';
          const defaultDest = targetRole === 'admin'
            ? '/admin'
            : targetRole === 'vendor'
            ? '/vendor'
            : '/';
          const dest = location.state?.from?.pathname || defaultDest;
          navigate(dest, { replace: true });
        }
      } else {
        const registeredUser = await register({
          name,
          email,
          password,
          role,
          storeName,
          storeDescription
        });
        if (onSuccess) {
          onSuccess();
        } else {
          const dest = role === 'vendor' ? '/vendor' : '/';
          navigate(dest, { replace: true });
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ padding: '40px 16px', maxWidth: '480px' }}>
      <div className="card" style={{ padding: '32px', boxShadow: 'var(--shadow-md)', borderRadius: 'var(--radius-lg)' }}>
        {/* Header Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}
          >
            {selectedRoleTab === 'admin' ? (
              <Shield size={24} />
            ) : selectedRoleTab === 'vendor' ? (
              <Store size={24} />
            ) : (
              <User size={24} />
            )}
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '4px' }}>
            {isLogin ? 'Sign In to Venfes' : 'Join Venfes Marketplace'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            {isLogin
              ? 'Select your user role and sign in to access your dashboard'
              : 'Create an account to shop or sell as an independent vendor'}
          </p>
        </div>

        {/* User Role Switcher Tabs */}
        {isLogin && (
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--surface-alt)',
              padding: '4px',
              borderRadius: 'var(--radius)',
              marginBottom: '20px',
              border: '1px solid var(--border)'
            }}
          >
            {[
              { id: 'customer', label: 'Customer', icon: User },
              { id: 'vendor', label: 'Vendor / Seller', icon: Store },
              { id: 'admin', label: 'Admin', icon: Shield }
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedRoleTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleRoleTabChange(tab.id)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 6px',
                    fontSize: '12px',
                    fontWeight: isSelected ? '700' : '500',
                    color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                    backgroundColor: isSelected ? 'var(--surface)' : 'transparent',
                    boxShadow: isSelected ? 'var(--shadow-xs)' : 'none',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Role Helper Banner */}
        {isLogin && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--primary-light)',
              border: '1px solid var(--primary-border)',
              fontSize: '12px',
              color: 'var(--primary-hover)',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <strong>
                {selectedRoleTab === 'admin'
                  ? 'Admin Portal Access'
                  : selectedRoleTab === 'vendor'
                  ? 'Vendor Store Access'
                  : 'Shopper / Customer Access'}
              </strong>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {selectedRoleTab === 'admin'
                  ? 'Full administrative control, KYC review, commission, and analytics'
                  : selectedRoleTab === 'vendor'
                  ? 'Product management, inventory tracking, order fulfillment, and sales reports'
                  : 'Browse marketplace, multi-vendor cart, coupons, and live order tracking'}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="state-error" style={{ fontSize: '13px', padding: '10px 12px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {!isLogin && (
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                Full Name *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kavita Sundaram"
                required
                style={{ width: '100%', padding: '10px 12px' }}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@venfes.com"
              required
              style={{ width: '100%', padding: '10px 12px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
              Password *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: '100%', padding: '10px 12px' }}
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                  Register As *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px' }}
                >
                  <option value="customer">Customer (Browse and Buy)</option>
                  <option value="vendor">Vendor / Seller (Sell Products on Venfes)</option>
                </select>
              </div>

              {role === 'vendor' && (
                <>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                      Store Name *
                    </label>
                    <input
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="e.g. Silk Route Audio"
                      required
                      style={{ width: '100%', padding: '10px 12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                      Store Description
                    </label>
                    <input
                      value={storeDescription}
                      onChange={(e) => setStoreDescription(e.target.value)}
                      placeholder="Briefly describe what you sell"
                      style={{ width: '100%', padding: '10px 12px' }}
                    />
                  </div>
                </>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              padding: '12px',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: '600'
            }}
          >
            {loading ? (
              'Authenticating...'
            ) : isLogin ? (
              <>
                <span>Sign In as {selectedRoleTab.charAt(0).toUpperCase() + selectedRoleTab.slice(1)}</span>
                <ArrowRight size={16} />
              </>
            ) : (
              'Create My Account'
            )}
          </button>
        </form>

        {/* Toggle between Sign In and Sign Up */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px' }}>
          {isLogin ? (
            <span>
              New to Venfes?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                style={{ background: 'none', color: 'var(--primary)', fontWeight: 'bold' }}
              >
                Create an account
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                style={{ background: 'none', color: 'var(--primary)', fontWeight: 'bold' }}
              >
                Sign In
              </button>
            </span>
          )}
        </div>

        {/* Quick Demo Pre-fills for Testing/Evaluation */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed var(--border)' }}>
          <span
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              display: 'block',
              marginBottom: '10px',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            One-Click Verified Demo Logins:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleRoleTabChange('customer')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', padding: '6px 4px', textAlign: 'center' }}
            >
              👤 Customer
            </button>
            <button
              type="button"
              onClick={() => handleRoleTabChange('vendor')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', padding: '6px 4px', textAlign: 'center' }}
            >
              🏪 Vendor
            </button>
            <button
              type="button"
              onClick={() => handleRoleTabChange('admin')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', padding: '6px 4px', textAlign: 'center' }}
            >
              🛡️ Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
