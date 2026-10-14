import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store, CheckCircle, Package, ArrowLeft } from 'lucide-react';
import Catalog from './Catalog';

export default function StorePage() {
  const { storeId } = useParams();
  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In current model, storeId is vendor user ID or store ID
    async function loadStore() {
      try {
        const res = await fetch(`/api/products?vendorId=${storeId}&limit=1`);
        const data = await res.json();
        if (data.success && data.data.products.length > 0) {
          const sampleProd = data.data.products[0];
          setStoreInfo({
            name: sampleProd.vendorId?.vendorProfile?.storeName || sampleProd.vendorId?.name || 'Verified Store',
            description: sampleProd.vendorId?.vendorProfile?.storeDescription || 'Independent verified seller on Venfes'
          });
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    loadStore();
  }, [storeId]);

  return (
    <div style={{ minHeight: '80vh', paddingBottom: '40px' }}>
      <div style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '24px 0', marginBottom: '24px' }}>
        <div className="container">
          <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            <ArrowLeft size={14} /> Back to Catalog
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Store size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>{storeInfo?.name || 'Vendor Store'}</h1>
                <span className="badge badge-approved" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={12} /> Venfes Verified
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                {storeInfo?.description || 'Browse exclusive products from this independent vendor'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <Catalog initialVendorId={storeId} />
      </div>
    </div>
  );
}
