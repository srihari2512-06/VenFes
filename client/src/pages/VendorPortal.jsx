import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, Upload, AlertTriangle, TrendingUp, Plus, CheckCircle, RefreshCcw, FileText } from 'lucide-react';

export default function VendorPortal() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('products');

  // KYC state
  const [kycStoreName, setKycStoreName] = useState(user?.vendorProfile?.storeName || '');
  const [kycDesc, setKycDesc] = useState(user?.vendorProfile?.storeDescription || '');
  const [kycFile, setKycFile] = useState('mock_business_license.pdf');
  const [kycHandlingDays, setKycHandlingDays] = useState(user?.vendorProfile?.handlingDays ?? 2);
  const [kycStatus, setKycStatus] = useState(user?.vendorProfile?.status || 'pending');

  // Products state
  const [products, setProducts] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '',
    description: '',
    price: '',
    mrp: '',
    brand: '',
    category: 'Electronics',
    stock: '',
    lowStockThreshold: 5,
    highlights: ['', '', ''],
    specifications: [{ label: '', value: '' }],
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'],
    variants: [{ sku: 'VAR-1', size: 'M', color: 'Black', stock: 10, price: '' }]
  });

  // Orders state
  const [subOrders, setSubOrders] = useState([]);

  // Analytics state
  const [analytics, setAnalytics] = useState(null);

  // CSV state
  const [csvText, setCsvText] = useState(`name,price,category,stock,description\nRunning Sneakers,1499,Footwear,20,Lightweight sports running shoes\nCotton T-Shirt,499,Clothing,50,100% pure combed cotton\nClassic Denim Jacket,2199,Clothing,15,Timeless denim jacket`);
  const [csvResult, setCsvResult] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'products') loadProducts();
    if (activeTab === 'orders') loadOrders();
    if (activeTab === 'analytics') loadAnalytics();
  }, [activeTab]);

  async function loadProducts() {
    setLoading(true);
    try {
      const [prodRes, lowRes] = await Promise.all([
        fetch('/api/products/vendor/mine', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/products/vendor/low-stock', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const prodData = await prodRes.json();
      const lowData = await lowRes.json();
      if (prodData.success) setProducts(prodData.data.products);
      if (lowData.success) setLowStockAlerts(lowData.data.products);
    } finally {
      setLoading(false);
    }
  }

  async function loadOrders() {
    setLoading(true);
    try {
      const res = await fetch('/api/orders/vendor/sub-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setSubOrders(data.data.subOrders);
    } finally {
      setLoading(false);
    }
  }

  async function loadAnalytics() {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/vendor', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAnalytics(data.data);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProduct(e) {
    e.preventDefault();
    if (newProd.mrp && Number(newProd.mrp) < Number(newProd.price)) {
      return alert('MRP must be greater than or equal to selling price');
    }
    try {
      const filteredHighlights = (newProd.highlights || []).map(h => h.trim()).filter(Boolean);
      const filteredSpecs = (newProd.specifications || []).filter(s => s.label.trim() && s.value.trim());

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...newProd,
          price: Number(newProd.price),
          mrp: newProd.mrp ? Number(newProd.mrp) : undefined,
          stock: Number(newProd.stock),
          brand: newProd.brand?.trim() || '',
          highlights: filteredHighlights,
          specifications: filteredSpecs,
          variants: newProd.variants.map(v => ({ ...v, stock: Number(v.stock), price: v.price ? Number(v.price) : undefined }))
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to create product');
      setShowAddModal(false);
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleUpdateOrderStatus(subOrderId, nextStatus) {
    try {
      const res = await fetch(`/api/orders/sub-orders/${subOrderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Transition failed');
      loadOrders();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleBulkUpload() {
    try {
      const res = await fetch('/api/products/bulk-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ csv: csvText })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Import failed');
      setCsvResult(data.data);
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleKycSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/vendors/kyc/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          storeName: kycStoreName,
          storeDescription: kycDesc,
          kycDocumentUrl: kycFile,
          handlingDays: Number(kycHandlingDays)
        })
      });
      const data = await res.json();
      if (data.success) {
        setKycStatus('pending');
        alert('KYC submitted! Awaiting administrator approval.');
      }
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="container" style={{ padding: '24px 16px' }}>
      {/* Vendor Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Vendor Merchant Portal</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Store: <strong>{user?.vendorProfile?.storeName || 'My Store'}</strong> | Status: <span className={`badge badge-${kycStatus}`}>{kycStatus?.toUpperCase()}</span>
          </p>
        </div>
      </div>

      {/* KYC Alert if not approved */}
      {kycStatus !== 'approved' && (
        <div className="card" style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <AlertTriangle color="#d97706" size={24} />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#92400e' }}>
                Store Approval Required ({kycStatus.toUpperCase()})
              </h3>
              <p style={{ fontSize: '13px', color: '#b45309', margin: '4px 0 12px' }}>
                Only approved vendors can publish products to the public storefront. Please confirm your store details below:
              </p>
              <form onSubmit={handleKycSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ fontSize: '12px', display: 'block', color: '#92400e' }}>Store Name:</label>
                  <input value={kycStoreName} onChange={(e) => setKycStoreName(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', display: 'block', color: '#92400e' }}>Description:</label>
                  <input value={kycDesc} onChange={(e) => setKycDesc(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', display: 'block', color: '#92400e' }}>Handling Days (0-7):</label>
                  <input type="number" min="0" max="7" value={kycHandlingDays} onChange={(e) => setKycHandlingDays(e.target.value)} style={{ width: '80px' }} required />
                </div>
                <button type="submit" className="btn btn-primary btn-sm">Submit KYC Details</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
        {[
          { id: 'products', label: 'My Products' },
          { id: 'orders', label: 'Incoming Orders' },
          { id: 'csv', label: 'CSV Bulk Upload' },
          { id: 'analytics', label: 'Sales Analytics' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px',
              fontWeight: '500',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              background: 'none'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: PRODUCTS */}
      {activeTab === 'products' && (
        <div>
          {/* Low stock alerts */}
          {lowStockAlerts.length > 0 && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: 'var(--radius)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#991b1b' }}>
              <AlertTriangle size={18} />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>
                Low Stock Alert: {lowStockAlerts.length} product(s) are below safety threshold! ({lowStockAlerts.map(p => p.name).join(', ')})
              </span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Catalog Items ({products.length})</h3>
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Plus size={16} /> Add Product
            </button>
          </div>

          <div className="card table-responsive" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Variants</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>No products listed yet.</td></tr>
                ) : (
                  products.map((p) => (
                    <tr key={p._id}>
                      <td><strong>{p.name}</strong></td>
                      <td>{p.category}</td>
                      <td>₹{p.price}</td>
                      <td>
                        {p.stock <= (p.lowStockThreshold || 5) ? (
                          <span className="badge badge-pending">{p.stock} (Low)</span>
                        ) : (
                          <span>{p.stock}</span>
                        )}
                      </td>
                      <td>{p.variants?.length || 0} variants</td>
                      <td>★ {p.averageRating || 'New'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Add New Store Product</h2>
            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Product Title:</label>
                <input value={newProd.name} onChange={(e) => setNewProd({ ...newProd, name: e.target.value })} required style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Description:</label>
                <textarea value={newProd.description} onChange={(e) => setNewProd({ ...newProd, description: e.target.value })} required style={{ width: '100%', minHeight: '60px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Selling Price (₹):</label>
                  <input type="number" value={newProd.price} onChange={(e) => setNewProd({ ...newProd, price: e.target.value })} required style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>MRP (₹, optional):</label>
                  <input type="number" value={newProd.mrp} onChange={(e) => setNewProd({ ...newProd, mrp: e.target.value })} placeholder="Must be ≥ Price" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Brand (optional, max 60 chars):</label>
                <input value={newProd.brand} maxLength={60} onChange={(e) => setNewProd({ ...newProd, brand: e.target.value })} placeholder="e.g. Apex Audio" style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Stock Quantity:</label>
                  <input type="number" value={newProd.stock} onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })} required style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Category:</label>
                  <select value={newProd.category} onChange={(e) => setNewProd({ ...newProd, category: e.target.value })} style={{ width: '100%' }}>
                    <option value="Electronics">Electronics</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Books">Books</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              {/* Highlights Editor */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Highlights (up to 6 short bullets):</label>
                  {newProd.highlights.length < 6 && (
                    <button
                      type="button"
                      onClick={() => setNewProd({ ...newProd, highlights: [...newProd.highlights, ''] })}
                      style={{ fontSize: '11px', color: 'var(--primary)', background: 'none', cursor: 'pointer' }}
                    >
                      + Add Bullet
                    </button>
                  )}
                </div>
                {newProd.highlights.map((h, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                    <input
                      value={h}
                      maxLength={120}
                      placeholder={`Highlight bullet #${idx + 1}`}
                      onChange={(e) => {
                        const updated = [...newProd.highlights];
                        updated[idx] = e.target.value;
                        setNewProd({ ...newProd, highlights: updated });
                      }}
                      style={{ width: '100%', fontSize: '13px' }}
                    />
                    {newProd.highlights.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = newProd.highlights.filter((_, i) => i !== idx);
                          setNewProd({ ...newProd, highlights: updated });
                        }}
                        style={{ background: 'none', color: 'var(--danger)', fontSize: '12px', cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Specifications Editor */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Specifications (up to 15 pairs):</label>
                  {newProd.specifications.length < 15 && (
                    <button
                      type="button"
                      onClick={() => setNewProd({ ...newProd, specifications: [...newProd.specifications, { label: '', value: '' }] })}
                      style={{ fontSize: '11px', color: 'var(--primary)', background: 'none', cursor: 'pointer' }}
                    >
                      + Add Spec
                    </button>
                  )}
                </div>
                {newProd.specifications.map((s, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '6px', marginBottom: '6px' }}>
                    <input
                      value={s.label}
                      placeholder="Key (e.g. Material)"
                      onChange={(e) => {
                        const updated = [...newProd.specifications];
                        updated[idx] = { ...updated[idx], label: e.target.value };
                        setNewProd({ ...newProd, specifications: updated });
                      }}
                      style={{ fontSize: '13px' }}
                    />
                    <input
                      value={s.value}
                      placeholder="Value (e.g. 100% Cotton)"
                      onChange={(e) => {
                        const updated = [...newProd.specifications];
                        updated[idx] = { ...updated[idx], value: e.target.value };
                        setNewProd({ ...newProd, specifications: updated });
                      }}
                      style={{ fontSize: '13px' }}
                    />
                    {newProd.specifications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = newProd.specifications.filter((_, i) => i !== idx);
                          setNewProd({ ...newProd, specifications: updated });
                        }}
                        style={{ background: 'none', color: 'var(--danger)', fontSize: '12px', cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: INCOMING SUB-ORDERS */}
      {activeTab === 'orders' && (
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Sub-Order Pipeline Execution</h3>
          <div className="card table-responsive" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Sub-Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Subtotal</th>
                  <th>Payout</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subOrders.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>No orders assigned to your store yet.</td></tr>
                ) : (
                  subOrders.map((s) => (
                    <tr key={s._id}>
                      <td><strong>{s.subOrderNumber}</strong></td>
                      <td>{s.customerId?.name || 'Customer'}</td>
                      <td>{s.items?.map(i => `${i.quantity}x ${i.productName}`).join(', ')}</td>
                      <td>₹{s.subtotal}</td>
                      <td><strong style={{ color: 'var(--success)' }}>₹{s.vendorPayoutAmount}</strong></td>
                      <td><span className={`badge badge-${s.status}`}>{s.status?.toUpperCase()}</span></td>
                      <td>
                        {s.status === 'placed' && (
                          <button onClick={() => handleUpdateOrderStatus(s._id, 'processing')} className="btn btn-primary btn-sm">Process</button>
                        )}
                        {s.status === 'processing' && (
                          <button onClick={() => handleUpdateOrderStatus(s._id, 'shipped')} className="btn btn-primary btn-sm">Ship</button>
                        )}
                        {s.status === 'shipped' && (
                          <button onClick={() => handleUpdateOrderStatus(s._id, 'delivered')} className="btn btn-primary btn-sm">Mark Delivered</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CSV BULK UPLOAD (FR-33, S10) */}
      {activeTab === 'csv' && (
        <div className="card">
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>CSV Bulk Product Upload (FR-33)</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
            Fast bulk inventory ingestion. Valid rows are imported atomically; invalid rows report line-numbered errors.
          </p>

          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            style={{ width: '100%', minHeight: '140px', fontFamily: 'monospace', fontSize: '13px', marginBottom: '12px' }}
          />

          <button onClick={handleBulkUpload} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Upload size={16} /> Import CSV Catalog
          </button>

          {csvResult && (
            <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
                <div>Processed: <strong>{csvResult.totalProcessed}</strong></div>
                <div>Imported: <strong style={{ color: 'var(--success)' }}>{csvResult.importedCount}</strong></div>
                <div>Errors: <strong style={{ color: csvResult.errors?.length ? 'var(--danger)' : 'var(--text-muted)' }}>{csvResult.errors?.length || 0}</strong></div>
              </div>

              {csvResult.errors?.length > 0 && (
                <div style={{ color: 'var(--danger)', fontSize: '13px' }}>
                  <strong>Errors Reported:</strong>
                  <ul>
                    {csvResult.errors.map((err, i) => (
                      <li key={i}>Row {err.row}: {err.reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: VENDOR ANALYTICS (FR-25, FR-27) */}
      {activeTab === 'analytics' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="card">
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Accrued Net Payout</span>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', marginTop: '4px' }}>
                ₹{analytics?.summary?.totalRevenue?.toLocaleString() || 0}
              </h2>
            </div>
            <div className="card">
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Gross Store Sales</span>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '4px' }}>
                ₹{analytics?.summary?.totalSales?.toLocaleString() || 0}
              </h2>
            </div>
            <div className="card">
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Sub-Orders</span>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '4px' }}>
                {analytics?.summary?.orderCount || 0}
              </h2>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Daily Revenue Breakdown</h3>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr><th>Date</th><th>Orders</th><th>Revenue</th></tr>
                  </thead>
                  <tbody>
                    {analytics?.salesTrend?.length === 0 ? (
                      <tr><td colSpan="3">No sales yet</td></tr>
                    ) : (
                      analytics?.salesTrend?.map((t, idx) => (
                        <tr key={idx}><td>{t._id}</td><td>{t.orders}</td><td>₹{t.revenue}</td></tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Top Selling Products</h3>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr><th>Product</th><th>Sold</th><th>Revenue</th></tr>
                  </thead>
                  <tbody>
                    {analytics?.topProducts?.length === 0 ? (
                      <tr><td colSpan="3">No product sales yet</td></tr>
                    ) : (
                      analytics?.topProducts?.map((p, idx) => (
                        <tr key={idx}><td>{p.name}</td><td>{p.quantitySold} units</td><td>₹{p.revenue}</td></tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
