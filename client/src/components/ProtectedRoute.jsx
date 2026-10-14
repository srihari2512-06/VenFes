import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="state-loading">
        <div className="spinner" />
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="container" style={{ padding: '64px 16px', maxWidth: '540px', margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '36px 24px' }}>
          <ShieldAlert size={48} color="var(--danger)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>
            Your account ({user.role}) does not have permission to view this page. Required role: {allowedRoles.join(' or ')}.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/" className="btn btn-primary btn-sm">
              <ArrowLeft size={16} /> Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
