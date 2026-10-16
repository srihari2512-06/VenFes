import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  ExternalLink,
  Store
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LiveOrderMap from '../components/LiveOrderMap';

const STAGES = [
  { id: 'placed', label: 'Order Placed', desc: 'Payment verified & order assigned to vendor', icon: CheckCircle2 },
  { id: 'processing', label: 'Packed & Ready', desc: 'Securely packaged at vendor fulfillment center', icon: Package },
  { id: 'in_transit', label: 'Handed to Courier', desc: 'Picked up by Venfes Express Logistics', icon: Truck },
  { id: 'out_for_delivery', label: 'Out for Delivery', desc: 'With delivery executive for final drop-off', icon: MapPin },
  { id: 'delivered', label: 'Delivered', desc: 'Package delivered & signed for', icon: ShieldCheck }
];

export default function OrderTrackingPage() {
  const params = useParams();
  const { user, token } = useAuth();

  const [activeOrder, setActiveOrder] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stageIndex, setStageIndex] = useState(2);
  const [searchQuery, setSearchQuery] = useState(params.orderId || '');

  // Load customer's real orders from database
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch('/api/orders/customer', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data?.orders)) {
          const orders = data.data.orders;
          setCustomerOrders(orders);

          // Select matching order from URL params or default to most recent real order
          let matched = null;
          if (params.orderId) {
            matched = orders.find(
              (o) => o.orderNumber === params.orderId || o._id === params.orderId
            );
          } else if (orders.length > 0) {
            matched = orders[0];
          }

          if (matched) {
            selectOrder(matched);
          } else {
            setActiveOrder(null);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load customer orders:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, params.orderId]);

  function selectOrder(order) {
    setActiveOrder(order);
    setSearchQuery(order.orderNumber);

    // Map database status to stage index
    const subStatus = order.subOrderIds?.[0]?.status || 'processing';
    if (subStatus === 'placed') setStageIndex(0);
    else if (subStatus === 'processing') setStageIndex(1);
    else if (subStatus === 'shipped') setStageIndex(3);
    else if (subStatus === 'delivered') setStageIndex(4);
    else setStageIndex(2);
  }

  function handleSearch(e) {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    const matched = customerOrders.find(
      (o) => o.orderNumber === query || o._id === query
    );
    if (matched) {
      selectOrder(matched);
    } else {
      setActiveOrder(null);
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '48px 16px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Checking your order status...</p>
      </div>
    );
  }

  // State 1: User not logged in
  if (!user && !token) {
    return (
      <div className="container" style={{ padding: '60px 16px', maxWidth: '560px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '36px 24px' }}>
          <ShieldCheck size={48} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
            Sign In to Track Your Orders
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.5' }}>
            Live realistic maps and delivery vehicle telemetry are available for your verified purchases. Please sign in to view your orders.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ padding: '10px 24px' }}>
            Sign In to Your Account
          </Link>
        </div>
      </div>
    );
  }

  // State 2: Customer has NOT bought any product (0 orders)
  if (customerOrders.length === 0) {
    return (
      <div className="container" style={{ padding: '60px 16px', maxWidth: '600px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '40px 28px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}
          >
            <ShoppingBag size={32} />
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '10px' }}>
            No Active Orders to Track
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px', lineHeight: '1.6' }}>
            You haven't placed any orders yet. Once you buy a product from any verified marketplace seller, the realistic delivery map, highway polyline routing, and courier GPS tracking will appear here automatically.
          </p>

          <Link
            to="/products"
            className="btn btn-primary btn-md"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 28px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            <Package size={16} />
            <span>Browse Products & Shop Now</span>
          </Link>
        </div>
      </div>
    );
  }

  // State 3: Customer has bought products -> Show Real Order with Realistic Leaflet Map
  return (
    <div className="container" style={{ padding: '28px 16px', maxWidth: '1080px' }}>
      {/* Page Title & Search Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '-0.4px', color: 'var(--text-main)' }}>
            Live Order Tracking
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Realistic GPS map tracking with real-time highway telemetry and dispatch milestones
          </p>
        </div>

        {/* Search / Select real order */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
          <select
            value={activeOrder?.orderNumber || ''}
            onChange={(e) => {
              const matched = customerOrders.find((o) => o.orderNumber === e.target.value);
              if (matched) selectOrder(matched);
            }}
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              fontWeight: '500'
            }}
          >
            {customerOrders.map((ord) => (
              <option key={ord._id} value={ord.orderNumber}>
                Order #{ord.orderNumber} (₹{ord.totalAmount?.toLocaleString()})
              </option>
            ))}
          </select>

          <Link
            to="/orders"
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>All Orders ({customerOrders.length})</span>
          </Link>
        </form>
      </div>

      {activeOrder ? (
        <>
          {/* Active Order Summary Card */}
          <div
            className="card"
            style={{
              padding: '18px 22px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              backgroundColor: 'var(--surface)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <strong style={{ fontSize: '16px', color: 'var(--primary)' }}>
                  {activeOrder.orderNumber}
                </strong>
                <span className="badge badge-paid" style={{ textTransform: 'uppercase', fontSize: '10px' }}>
                  {activeOrder.paymentMethod || 'Paid'}
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Purchased on {new Date(activeOrder.createdAt).toLocaleDateString()} at{' '}
                {new Date(activeOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                ₹{activeOrder.totalAmount?.toLocaleString()}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--green)', fontWeight: '600' }}>
                ● Verified In Transit
              </span>
            </div>
          </div>

          {/* REALISTIC LEAFLET OPENSTREETMAP */}
          <LiveOrderMap
            orderNumber={activeOrder.orderNumber}
            destinationAddress={activeOrder.shippingAddress}
            stageIndex={stageIndex}
          />

          {/* 5-Stage Progression Timeline */}
          <div
            className="card"
            style={{
              padding: '24px 20px',
              marginBottom: '28px',
              backgroundColor: 'var(--surface)'
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--text-main)' }}>
              Shipment Progression Milestones
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '12px',
                position: 'relative'
              }}
            >
              {STAGES.map((stg, idx) => {
                const isPassed = idx <= stageIndex;
                const isCurrent = idx === stageIndex;
                const IconComponent = stg.icon;

                return (
                  <div
                    key={stg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      padding: '12px 8px',
                      borderRadius: 'var(--radius)',
                      backgroundColor: isCurrent ? 'var(--primary-light)' : 'transparent',
                      border: isCurrent ? '1px solid var(--primary-border)' : '1px solid transparent',
                      position: 'relative'
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: isPassed ? 'var(--primary)' : 'var(--surface-alt)',
                        color: isPassed ? '#ffffff' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '8px',
                        boxShadow: isCurrent ? '0 0 0 4px var(--primary-light)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <IconComponent size={18} />
                    </div>

                    <strong
                      style={{
                        fontSize: '12px',
                        fontWeight: isPassed ? '700' : '500',
                        color: isPassed ? 'var(--text-main)' : 'var(--text-muted)',
                        marginBottom: '4px'
                      }}
                    >
                      {stg.label}
                    </strong>

                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                      {stg.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sub-Orders & Product Items Breakdown */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '14px', color: 'var(--text-main)' }}>
              Packages in this Shipment
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {activeOrder.subOrderIds?.map((sub, idx) => (
                <div
                  key={sub._id || idx}
                  style={{
                    backgroundColor: 'var(--surface-alt)',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Store size={16} color="var(--primary)" />
                      <strong style={{ fontSize: '14px' }}>
                        {sub.vendorId?.vendorProfile?.storeName || sub.vendorId?.name || 'Verified Vendor'}
                      </strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        ({sub.subOrderNumber || `Package #${idx + 1}`})
                      </span>
                    </div>

                    <span className="badge badge-paid" style={{ textTransform: 'uppercase', fontSize: '11px' }}>
                      {sub.status || 'In Transit'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {sub.items?.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '13px',
                          color: 'var(--text-main)'
                        }}
                      >
                        <span>
                          {item.quantity}× {item.productName}{' '}
                          {item.variantInfo ? `(${item.variantInfo})` : ''}
                        </span>
                        <strong>₹{(item.subtotal || item.price * item.quantity).toLocaleString()}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="card state-empty" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <Package size={42} style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
          <h3>Order #{searchQuery} Not Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
            Please select one of your real orders from the dropdown above.
          </p>
        </div>
      )}
    </div>
  );
}
