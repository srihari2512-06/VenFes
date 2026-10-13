import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, DollarSign, Activity, AlertOctagon, CheckCircle2, XCircle, Bell, RefreshCcw } from 'lucide-react';
import { io } from 'socket.io-client';

export default function AdminPortal() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');

  // Vendors state
  const [vendors, setVendors] = useState([]);

  // Analytics & Live Feed state
  const [analytics, setAnalytics] = useState(null);
  const [liveOrders, setLiveOrders] = useState([]);

  // Finance state
  const [commissionRate, setCommissionRate] = useState(0.10);
  const [ledger, setLedger] = useState([]);

  // Moderation state
  const [modQueue, setModQueue] = useState([]);

  // Audit state
  const [auditLogs, setAuditLogs] = useState([]);

  const [loading, setLoading] = useState(false);

  // Setup Socket.io authenticated connection (FR-28, S6)
  useEffect(() => {
    if (!token) return;
    const socket = io('/', {
      auth: { token }
    });

    socket.on('order:created', (newOrder) => {
      setLiveOrders((prev) => [newOrder, ...prev].slice(0, 20));
      // Refresh analytics on new order
      loadAnalytics();
    });

    return () => socket.disconnect();
  }, [token]);

  useEffect(() => {
    if (activeTab === 'analytics') loadAnalytics();
    if (activeTab === 'vendors') loadVendors();
    if (activeTab === 'finance') loadFinance();
    if (activeTab === 'moderation') loadModeration();
    if (activeTab === 'audit') loadAudit();
  }, [activeTab]);

  async function loadAnalytics() {
    try {
      const res = await fetch('/api/analytics/admin', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setAnalytics(data.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadVendors() {
    setLoading(true);
    try {
      const res = await fetch('/api/vendors/admin/vendors', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setVendors(data.data.vendors);
    } finally {
      setLoading(false);
    }
  }

  async function loadFinance() {
    setLoading(true);
    try {
      const [commRes, ledgRes] = await Promise.all([
        fetch('/api/vendors/finance/commission', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/vendors/finance/ledger', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const commData = await commRes.json();
      const ledgData = await ledgRes.json();
      if (commData.success) setCommissionRate(commData.data.commissionRate);
      if (ledgData.success) setLedger(ledgData.data.ledger);
    } finally {
      setLoading(false);
    }
  }

  async function loadModeration() {
    setLoading(true);
    try {
      const res = await fetch('/api/engagement/admin/moderation', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setModQueue(data.data.flags);
    } finally {
      setLoading(false);
    }
  }

  async function loadAudit() {
    setLoading(true);
    try {
      const res = await fetch('/api/vendors/admin/audit-logs', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setAuditLogs(data.data.logs);
    } finally {
      setLoading(false);
    }
  }

  async function handleVendorStatus(vendorId, status) {
    let rejectionReason = '';
    if (status === 'rejected') {
      rejectionReason = prompt('Enter rejection reason:') || 'Documentation incomplete';
    }
    try {
      const res = await fetch(`/api/vendors/admin/vendors/${vendorId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, rejectionReason })
      });
      const data = await res.json();
      if (data.success) loadVendors();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleSaveCommission(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/vendors/finance/commission', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rate: Number(commissionRate) })
      });
      const data = await res.json();
      if (data.success) alert('Platform commission updated successfully!');
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleSettlePayout(ledgerId) {
    try {
      const res = await fetch(`/api/vendors/finance/ledger/${ledgerId}/settle`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) loadFinance();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleModerationAction(flagId, action) {
    try {
      const res = await fetch(`/api/engagement/admin/moderation/${flagId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) loadModeration();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="container" style={{ padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Platform Administrator Portal</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>System oversight, vendor approvals, settlement ledgers, and live feed</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', marginBottom: '20px', overflowX: 'auto' }}>
        {[
          { id: 'analytics', label: 'Live Analytics & Feed' },
          { id: 'vendors', label: 'Vendor KYC Approvals' },
          { id: 'finance', label: 'Finance & Ledger' },
          { id: 'moderation', label: 'Content Moderation' },
          { id: 'audit', label: 'Audit Trail' }
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

      {/* TAB 1: ANALYTICS & LIVE FEED */}
      {activeTab === 'analytics' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="card">
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Gross Merchandise Value (GMV)</span>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', marginTop: '4px' }}>
                ₹{analytics?.summary?.gmv?.toLocaleString() || 0}
              </h2>
            </div>
            <div className="card">
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Paid Orders</span>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '4px' }}>
                {analytics?.summary?.paidOrders || 0}
              </h2>
            </div>
            <div className="card">
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Active Approved Vendors</span>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '4px' }}>
                {analytics?.summary?.activeVendors || 0}
              </h2>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            {/* Live Socket Feed (FR-28, S6) */}
            <div className="card" style={{ borderColor: 'var(--primary)', boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={18} color="var(--primary)" />
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Socket.io Live Order Stream</h3>
                </div>
                <span className="badge badge-paid">Connected</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Real-time WebSocket events pushed immediately on completed checkouts without manual refresh:
              </p>
              {liveOrders.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Waiting for live checkouts... Run a checkout in another tab to observe immediate notification!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {liveOrders.map((ord, idx) => (
                    <div key={idx} style={{ padding: '8px 12px', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius)', border: '1px solid #bbf7d0', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                      <span><strong>{ord.orderNumber}</strong> ({ord.itemCount} sub-orders)</span>
                      <strong style={{ color: 'var(--success)' }}>₹{ord.totalAmount}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category Performance */}
            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Category Revenue Performance</h3>
              <div className="table-responsive">
                <table>
                  <thead><tr><th>Category</th><th>Units Sold</th><th>Revenue</th></tr></thead>
                  <tbody>
                    {analytics?.categoryStats?.length === 0 ? (
                      <tr><td colSpan="3">No sales yet</td></tr>
                    ) : (
                      analytics?.categoryStats?.map((c, i) => (
                        <tr key={i}><td><strong>{c.category}</strong></td><td>{c.unitsSold}</td><td>₹{c.revenue}</td></tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Cohort Retention Table (FR-41) */}
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>Customer Cohort Retention (FR-41)</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Aggregation pipeline grouping customers by their initial acquisition month and repeat purchase frequencies.
            </p>
            <div className="table-responsive">
              <table>
                <thead><tr><th>Cohort Month</th><th>Total Customers</th><th>Repeat Buyers</th><th>Average Lifetime Spend</th></tr></thead>
                <tbody>
                  {analytics?.cohortStats?.length === 0 ? (
                    <tr><td colSpan="4">No customer cohorts formed yet</td></tr>
                  ) : (
                    analytics?.cohortStats?.map((co, i) => (
                      <tr key={i}>
                        <td><strong>{co.cohort}</strong></td>
                        <td>{co.customerCount}</td>
                        <td><span className="badge badge-approved">{co.repeatCustomers}</span></td>
                        <td>₹{Math.round(co.avgSpent || 0)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VENDOR APPROVALS */}
      {activeTab === 'vendors' && (
        <div className="card table-responsive" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Store / Applicant</th>
                <th>Email</th>
                <th>Status</th>
                <th>KYC Document</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>No registered vendors found.</td></tr>
              ) : (
                vendors.map((v) => {
                  const status = v.vendorProfile?.status || 'pending';
                  return (
                    <tr key={v._id}>
                      <td>
                        <strong>{v.vendorProfile?.storeName || v.name}</strong>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{v.vendorProfile?.storeDescription}</div>
                      </td>
                      <td>{v.email}</td>
                      <td><span className={`badge badge-${status}`}>{status.toUpperCase()}</span></td>
                      <td><span style={{ fontSize: '12px', color: 'var(--primary)' }}>{v.vendorProfile?.kycDocumentUrl || 'Uploaded'}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {status !== 'approved' && (
                            <button onClick={() => handleVendorStatus(v._id, 'approved')} className="btn btn-primary btn-sm">Approve</button>
                          )}
                          {status !== 'rejected' && (
                            <button onClick={() => handleVendorStatus(v._id, 'rejected')} className="btn btn-danger btn-sm">Reject</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: FINANCE & SETTLEMENT */}
      {activeTab === 'finance' && (
        <div>
          <div className="card" style={{ marginBottom: '24px', maxWidth: '480px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>Platform Commission Setting (FR-23)</h3>
            <form onSubmit={handleSaveCommission} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', display: 'block', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Commission Rate (0.10 = 10%):
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <button type="submit" className="btn btn-primary">Update Rate</button>
            </form>
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>Vendor Payout Settlement Ledger (FR-22, FR-38)</h3>
          <div className="card table-responsive" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Vendor Store</th>
                  <th>Sub-Order Number</th>
                  <th>Net Payout Amount</th>
                  <th>Platform Fee</th>
                  <th>Ledger Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ledger.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>No ledger entries recorded yet.</td></tr>
                ) : (
                  ledger.map((entry) => (
                    <tr key={entry._id}>
                      <td><strong>{entry.vendorId?.vendorProfile?.storeName || 'Vendor'}</strong></td>
                      <td>{entry.subOrderId?.subOrderNumber}</td>
                      <td><strong style={{ color: 'var(--success)' }}>₹{entry.amount}</strong></td>
                      <td>₹{entry.commission}</td>
                      <td><span className={`badge badge-${entry.status}`}>{entry.status.toUpperCase()}</span></td>
                      <td>
                        {entry.status === 'accrued' && (
                          <button onClick={() => handleSettlePayout(entry._id)} className="btn btn-secondary btn-sm">
                            Mark Settled
                          </button>
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

      {/* TAB 4: MODERATION QUEUE (FR-39) */}
      {activeTab === 'moderation' && (
        <div className="card table-responsive" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Target Type</th>
                <th>Target ID</th>
                <th>Reported Reason</th>
                <th>Reported By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {modQueue.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>Moderation queue is clean.</td></tr>
              ) : (
                modQueue.map((m) => (
                  <tr key={m._id}>
                    <td><span className="badge badge-pending">{m.targetType}</span></td>
                    <td><code>{m.targetId}</code></td>
                    <td>{m.reason}</td>
                    <td>{m.reporterId?.email || 'User'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleModerationAction(m._id, 'hide')} className="btn btn-danger btn-sm">Hide Item</button>
                        <button onClick={() => handleModerationAction(m._id, 'dismiss')} className="btn btn-secondary btn-sm">Dismiss</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: AUDIT TRAIL (FR-42) */}
      {activeTab === 'audit' && (
        <div className="card table-responsive" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Actor</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>No audit logs recorded yet.</td></tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log._id}>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                    <td><strong>{log.action}</strong></td>
                    <td>{log.actorId?.name} ({log.actorRole})</td>
                    <td><code>{JSON.stringify(log.details)}</code></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
