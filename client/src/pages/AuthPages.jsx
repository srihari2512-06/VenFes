import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Store, Shield } from 'lucide-react';

export default function AuthPages({ onSuccess }) {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('customer');
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({
          name,
          email,
          password,
          role,
          storeName,
          storeDescription
        });
      }
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function loadDemo(demoRole) {
    if (demoRole === 'admin') {
      setEmail('admin@venfes.com');
      setPassword('admin123');
    } else if (demoRole === 'vendor') {
      setEmail('vendor@venfes.com');
      setPassword('vendor123');
    } else {
      setEmail('customer@venfes.com');
      setPassword('customer123');
    }
    setIsLogin(true);
  }

  return (
    <div className="container" style={{ padding: '48px 16px', maxWidth: '460px' }}>
      <div className="card" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
          {isLogin ? 'Sign In to Venfes' : 'Create an Account'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginBottom: '24px' }}>
          {isLogin ? 'Enter your credentials to access your marketplace profile' : 'Join as a buyer or independent seller'}
        </p>

        {error && <div className="state-error" style={{ fontSize: '13px', padding: '10px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {!isLogin && (
            <div>
              <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Full Name:</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%' }} />
            </div>
          )}

          <div>
            <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Email Address:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Password:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%' }} />
          </div>

          {!isLogin && (
            <>
              <div>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Account Role:</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%' }}>
                  <option value="customer">Customer (Buy Products)</option>
                  <option value="vendor">Vendor (Sell & Open Store)</option>
                </select>
              </div>

              {role === 'vendor' && (
                <>
                  <div>
                    <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Store Name:</label>
                    <input value={storeName} onChange={(e) => setStoreName(e.target.value)} required style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Store Description:</label>
                    <input value={storeDescription} onChange={(e) => setStoreDescription(e.target.value)} style={{ width: '100%' }} />
                  </div>
                </>
              )}
            </>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '10px', marginTop: '8px' }}>
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Register Account'}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '13px' }}>
          {isLogin ? (
            <span>Don't have an account? <button onClick={() => setIsLogin(false)} style={{ background: 'none', color: 'var(--primary)', fontWeight: 'bold' }}>Sign Up</button></span>
          ) : (
            <span>Already have an account? <button onClick={() => setIsLogin(true)} style={{ background: 'none', color: 'var(--primary)', fontWeight: 'bold' }}>Sign In</button></span>
          )}
        </div>

        {/* Demo Fast Fill Section */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed var(--border)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textAlign: 'center' }}>
            DEMO PREVIEW SHORTCUTS (FOR REVIEW PRESENTATION):
          </span>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
            <button onClick={() => loadDemo('customer')} className="btn btn-secondary btn-sm" style={{ fontSize: '11px' }}>Customer</button>
            <button onClick={() => loadDemo('vendor')} className="btn btn-secondary btn-sm" style={{ fontSize: '11px' }}>Vendor</button>
            <button onClick={() => loadDemo('admin')} className="btn btn-secondary btn-sm" style={{ fontSize: '11px' }}>Admin</button>
          </div>
        </div>
      </div>
    </div>
  );
}
