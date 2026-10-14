import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="container" style={{ padding: '80px 16px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div className="card" style={{ padding: '48px 24px' }}>
        <Compass size={64} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>404 - Page Not Found</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '28px', lineHeight: '1.6' }}>
          We couldn't find the page you're looking for. The link might be outdated or the product may have been moved.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Home size={18} /> Back to Storefront
          </Link>
          <Link to="/products" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Search size={18} /> Browse Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
