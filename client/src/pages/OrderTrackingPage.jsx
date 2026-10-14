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
  Phone,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

  const [orderQuery, setOrderQuery] = useState(params.orderId || 'ORD-20261014-2002');
  const [activeOrder, setActiveOrder] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [simulatedStageIndex, setSimulatedStageIndex] = useState(2); // In transit default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load customer orders if logged in
  useEffect(() => {
    if (token) {
      fetch('/api/orders/customer', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data.orders) {
            setCustomerOrders(data.data.orders);
            if (!params.orderId && data.data.orders.length > 0) {
              setOrderQuery(data.data.orders[0].orderNumber);
              loadOrder(data.data.orders[0].orderNumber);
            }
          }
        })
        .catch(() => {});
    }
  }, [token, params.orderId]);

  useEffect(() => {
    if (orderQuery) {
      loadOrder(orderQuery);
    }
  }, [params.orderId]);

  async function loadOrder(queryNumber) {
    if (!queryNumber) return;
    setLoading(true);
    setError('');
    try {
      // Find matching order in customer orders or simulate realistic tracking payload
      let matched = customerOrders.find(o => o.orderNumber === queryNumber || o._id === queryNumber);
      if (!matched && token) {
        const res = await fetch('/api/orders/customer', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data.orders) {
          setCustomerOrders(data.data.orders);
          matched = data.data.orders.find(o => o.orderNumber === queryNumber || o._id === queryNumber);
        }
      }

      if (matched) {
        setActiveOrder(matched);
        // Map status to stage index
        const subStatus = matched.subOrderIds?.[0]?.status || 'processing';
        if (subStatus === 'placed') setSimulatedStageIndex(0);
        else if (subStatus === 'processing') setSimulatedStageIndex(1);
        else if (subStatus === 'shipped') setSimulatedStageIndex(3);
        else if (subStatus === 'delivered') setSimulatedStageIndex(4);
        else setSimulatedStageIndex(2);
      } else {
        // Fallback demo order payload
        setActiveOrder({
          orderNumber: queryNumber,
          totalAmount: 6499,
          paymentStatus: 'paid',
          createdAt: new Date().toISOString(),
          shippingAddress: {
            street: '45 Residency Road',
            city: 'Bengaluru',
            state: 'Karnataka',
            zip: '560025',
            country: 'India'
          },
          subOrderIds: [
            {
              subOrderNumber: `${queryNumber}-1`,
              status: 'shipped',
              vendorId: { name: 'TechNova Peripherals', vendorProfile: { storeName: 'TechNova Peripherals' } },
              items: [
                { productName: 'Custom 75% Mechanical Keyboard', price: 6499, quantity: 1 }
              ]
            }
          ]
        });
        setSimulatedStageIndex(2);
      }
    } catch {
      setError('Unable to fetch order tracking details. Please verify your order number.');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    loadOrder(orderQuery.trim());
  }

  function advanceStage() {
    setSimulatedStageIndex((prev) => (prev + 1) % STAGES.length);
  }

  const currentStage = STAGES[simulatedStageIndex];

  return (
    <div className="container" style={{ padding: '32px 16px', maxWidth: '960px' }}>
      {/* Title & Search bar */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '8px' }}>
          Live Order Tracking
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Monitor your package in real-time across vendor fulfillment, carrier dispatch, and delivery.
        </p>

        {/* Search Input Box */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', maxWidth: '520px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              placeholder="Enter Order ID (e.g. ORD-20261014-2002)"
              style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: 'var(--radius)' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 18px', fontWeight: '600' }}>
            Track Package
          </button>
        </form>

        {/* Quick Recent Order Chips */}
        {customerOrders.length > 0 && (
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Your Recent Orders:</span>
            {customerOrders.slice(0, 3).map((ord) => (
              <button
                key={ord._id}
                type="button"
                onClick={() => {
                  setOrderQuery(ord.orderNumber);
                  loadOrder(ord.orderNumber);
                }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11px', padding: '3px 8px' }}
              >
                {ord.orderNumber} (₹{ord.totalAmount?.toLocaleString()})
              </button>
            ))}
          </div>
        )}
      </div>

      {activeOrder && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Main Tracking Stepper Card */}
          <div
            className="card"
            style={{
              padding: '28px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {/* Top Status Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
              <div>
                <span
                  style={{
                    backgroundColor: simulatedStageIndex === 4 ? 'var(--green-light)' : 'var(--primary-light)',
                    color: simulatedStageIndex === 4 ? 'var(--green)' : 'var(--primary)',
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    textTransform: 'uppercase'
                  }}
                >
                  {currentStage.label}
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '6px' }}>
                  {simulatedStageIndex === 4
                    ? 'Delivered Successfully'
                    : simulatedStageIndex === 3
                    ? 'Out for Delivery — Arriving Today'
                    : 'In Transit — Estimated Arrival in 2 Days'}
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Carrier: <strong>Venfes Express (Waybill #VN-98234-EXP)</strong>
                </p>
              </div>

              {/* Simulation Controller for review/demo */}
              <div style={{ textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={advanceStage}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', padding: '6px 12px' }}
                >
                  <Play size={12} fill="currentColor" />
                  <span>Advance Stage Demo ({simulatedStageIndex + 1}/{STAGES.length})</span>
                </button>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Click to simulate live tracking progression
                </div>
              </div>
            </div>

            {/* Stepper Visual Timeline */}
            <div style={{ position: 'relative', marginBottom: '32px' }}>
              {/* Desktop Progress Bar Line */}
              <div
                style={{
                  position: 'absolute',
                  top: '20px',
                  left: '40px',
                  right: '40px',
                  height: '4px',
                  backgroundColor: 'var(--border)',
                  zIndex: 1
                }}
              >
                <div
                  style={{
                    height: '100%',
                    backgroundColor: 'var(--green)',
                    width: `${(simulatedStageIndex / (STAGES.length - 1)) * 100}%`,
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>

              {/* Steps Icons & Labels */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${STAGES.length}, 1fr)`,
                  position: 'relative',
                  zIndex: 2,
                  textAlign: 'center'
                }}
              >
                {STAGES.map((stage, idx) => {
                  const isDone = idx <= simulatedStageIndex;
                  const isCurrent = idx === simulatedStageIndex;
                  const Icon = stage.icon;

                  return (
                    <div key={stage.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: isDone ? 'var(--green)' : 'var(--surface)',
                          border: isDone ? '2px solid var(--green)' : '2px solid var(--border)',
                          color: isDone ? '#ffffff' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '10px',
                          boxShadow: isCurrent ? '0 0 0 4px var(--primary-light)' : 'none',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <Icon size={18} />
                      </div>
                      <strong style={{ fontSize: '12px', color: isDone ? 'var(--text-main)' : 'var(--text-muted)' }}>
                        {stage.label}
                      </strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'none', maxWidth: '120px' }}>
                        {stage.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current Stage Detailed Description Callout */}
            <div
              style={{
                backgroundColor: 'var(--surface-alt)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>Latest Carrier Update:</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {currentStage.desc}
                </p>
              </div>

              {simulatedStageIndex >= 3 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-main)' }}>
                    Delivery PIN / OTP: <strong style={{ fontFamily: 'monospace', fontSize: '14px', color: 'var(--primary)' }}>4821</strong>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Order Details & Items Split Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* Delivery Address */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <MapPin size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>Shipping Destination</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.5' }}>
                {activeOrder.shippingAddress?.street}<br />
                {activeOrder.shippingAddress?.city}, {activeOrder.shippingAddress?.state} - {activeOrder.shippingAddress?.zip}<br />
                {activeOrder.shippingAddress?.country || 'India'}
              </p>
            </div>

            {/* Vendor Package Details */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Package size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>Package Items & Vendor</h3>
              </div>
              {activeOrder.subOrderIds?.map((sub, i) => (
                <div key={i} style={{ fontSize: '13px', marginBottom: '8px' }}>
                  <div style={{ color: 'var(--primary)', fontWeight: '600' }}>
                    Store: {sub.vendorId?.vendorProfile?.storeName || sub.vendorId?.name || 'Verified Vendor'}
                  </div>
                  {sub.items?.map((it, idx) => (
                    <div key={idx} style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
                      • {it.productName} (Qty: {it.quantity}) - ₹{it.price?.toLocaleString()}
                    </div>
                  ))}
                </div>
              ))}
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border)', fontSize: '13px' }}>
                Total Paid: <strong>₹{activeOrder.totalAmount?.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
