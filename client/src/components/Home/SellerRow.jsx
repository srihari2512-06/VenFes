import React from 'react';
import { Link } from 'react-router-dom';
import { Store, CheckCircle, ArrowRight } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

export default function SellerRow({ stores = [], loading = false }) {
  if (loading) {
    return (
      <div style={{ marginBottom: '40px' }}>
        <Skeleton width="220px" height="24px" style={{ marginBottom: '16px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Skeleton width="48px" height="48px" borderRadius="50%" />
              <div style={{ flex: 1 }}>
                <Skeleton width="80%" height="16px" />
                <Skeleton width="50%" height="12px" style={{ marginTop: '6px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stores || stores.length === 0) return null;

  return (
    <div style={{ marginBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
            Shop from Our Verified Sellers
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
            Direct storefronts run by approved independent merchants across India
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        {stores.slice(0, 6).map((store) => {
          const initial = (store.name || 'S').charAt(0).toUpperCase();

          return (
            <Link
              key={store.id || store.name}
              to={`/store/${store.id}`}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px',
                textDecoration: 'none',
                color: 'inherit',
                border: '1px solid var(--border)',
                transition: 'border-color 0.15s ease, transform 0.15s ease'
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {initial}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {store.name}
                  </h4>
                  <CheckCircle size={13} color="var(--green)" style={{ flexShrink: 0 }} />
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {store.count} {store.count === 1 ? 'Product' : 'Products'} listed
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
