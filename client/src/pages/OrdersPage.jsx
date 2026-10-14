import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, Store, Clock, CheckCircle, RefreshCcw, ArrowLeft } from 'lucide-react';

export default function OrdersPage({ onSelectProduct }) {
  const { id: orderFilterId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch('/api/orders/customer', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data.orders);
      } else {
        setError(data.error?.message || 'Failed to load orders');
      }
    } catch {
      setError('Network error fetching orders');
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status) {
    const classMap = {
      placed: 'badge-placed',
      processing: 'badge-processing',
      shipped: 'badge-shipped',
      delivered: 'badge-delivered',
      cancelled: 'badge-cancelled',
      refunded: 'badge-refunded'
    };
    return <span className={`badge ${classMap[status] || 'badge-pending'}`}>{status?.toUpperCase()}</span>;
  }

  if (loading) return <div className="state-loading"><div className="spinner"></div><p>Loading your orders...</p></div>;

  return (
    <div className="container" style={{ padding: '24px 16px', maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Order History & Sub-Order Tracking</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Track shipment and delivery status across all independent vendors</p>
        </div>
        <button onClick={fetchOrders} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <RefreshCcw size={14} /> Refresh
        </button>
      </div>

      {orderFilterId && (
        <Link to="/orders" className="btn btn-secondary btn-sm" style={{ marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={14} /> Back to All Orders
        </Link>
      )}

      {error && <div className="state-error">{error}</div>}

      {orders.length === 0 ? (
        <div className="card state-empty">
          <Package size={48} style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
          <h3>No Orders Placed Yet</h3>
          <p>Your completed purchases and sub-order shipment status will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {orders
            .filter((ord) => !orderFilterId || ord._id === orderFilterId || ord.orderNumber === orderFilterId)
            .map((ord) => (
            <div key={ord._id} className="card">
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Link to={`/orders/${ord._id}`} style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--primary)' }}>
                      {ord.orderNumber}
                    </Link>
                    <span className="badge badge-paid">{ord.paymentStatus}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Placed on {new Date(ord.createdAt).toLocaleString()}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)' }}>
                    ₹{ord.totalAmount?.toLocaleString()}
                  </span>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {ord.subOrderIds?.length} Vendor Sub-Orders
                  </div>
                </div>
              </div>

              {/* Sub-Orders List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {ord.subOrderIds?.map((sub) => (
                  <div key={sub._id} style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Store size={16} color="var(--primary)" />
                        <strong style={{ fontSize: '14px' }}>{sub.vendorId?.vendorProfile?.storeName || 'Vendor'}</strong>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({sub.subOrderNumber})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getStatusBadge(sub.status)}
                        <span style={{ fontWeight: '600', fontSize: '14px' }}>₹{sub.subtotal?.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                      {sub.items?.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>
                            {item.quantity}x {item.productName} {item.variantInfo ? `(${item.variantInfo})` : ''}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>₹{item.subtotal}</span>
                            {sub.status === 'delivered' && (
                              <button
                                onClick={() => (onSelectProduct ? onSelectProduct(item.productId) : navigate(`/product/${item.productId}`))}
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: '11px', padding: '2px 6px' }}
                              >
                                Review Product
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
