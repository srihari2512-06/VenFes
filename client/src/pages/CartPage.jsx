import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, Store, CreditCard, ShieldCheck, CheckCircle2, ShoppingBag } from 'lucide-react';

export default function CartPage({ onBrowse, onOrderComplete }) {
  const navigate = useNavigate();
  const handleBrowse = onBrowse || (() => navigate('/products'));
  const handleOrderComplete = onOrderComplete || (() => navigate('/orders'));
  const { cart, updateQuantity, removeItem, clearCart } = useCart();
  const { user, token } = useAuth();

  const [shippingAddress, setShippingAddress] = useState({
    street: '12 IT Highway, OMR',
    city: 'Chennai',
    state: 'Tamil Nadu',
    zip: '600089',
    country: 'India'
  });
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className="container" style={{ padding: '48px 16px', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '480px', margin: '0 auto', padding: '32px' }}>
          <h2>Sign In Required</h2>
          <p style={{ color: 'var(--text-muted)', margin: '16px 0' }}>Please log in to your account to view your cart and proceed with checkout.</p>
          <button onClick={handleBrowse} className="btn btn-primary">Sign In / Browse Catalog</button>
        </div>
      </div>
    );
  }

  // Success view
  if (completedOrder) {
    return (
      <div className="container" style={{ padding: '48px 16px', maxWidth: '720px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '36px' }}>
          <CheckCircle2 size={48} color="var(--success)" style={{ margin: '0 auto 16px' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Order Successfully Placed!</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            Atomic Cart-Split Checkout completed. 1 Parent Order created and split into {completedOrder.subOrders?.length} Vendor Sub-Orders.
          </p>

          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: 'var(--radius)', textAlign: 'left', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong>Parent Order Number:</strong>
              <span>{completedOrder.order?.orderNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong>Total Amount Paid:</strong>
              <span>₹{completedOrder.order?.totalAmount?.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong>Payment Status:</strong>
              <span className="badge badge-paid">PAID (Test Mode)</span>
            </div>
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'left', marginBottom: '12px' }}>Split Sub-Orders Breakdown:</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
            {completedOrder.subOrders?.map((sub) => (
              <div key={sub._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', backgroundColor: '#fff', fontSize: '13px' }}>
                <div>
                  <strong>{sub.subOrderNumber}</strong> ({sub.items?.length} items)
                </div>
                <div>
                  <span className="badge badge-placed" style={{ marginRight: '8px' }}>{sub.status}</span>
                  <strong>₹{sub.subtotal?.toLocaleString()}</strong>
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleOrderComplete} className="btn btn-primary" style={{ width: '100%' }}>
            View in My Orders
          </button>
        </div>
      </div>
    );
  }

  // Empty Cart
  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: '64px 16px', textAlign: 'center' }}>
        <div className="state-empty card" style={{ maxWidth: '480px', margin: '0 auto' }}>
          <ShoppingBag size={48} style={{ margin: '0 auto 16px', color: 'var(--text-muted)' }} />
          <h3>Your shopping cart is empty</h3>
          <p style={{ margin: '12px 0 20px' }}>Explore products from independent verified sellers and add items to your cart.</p>
          <button onClick={handleBrowse} className="btn btn-primary">Start Shopping</button>
        </div>
      </div>
    );
  }

  // Group items by vendor store
  const vendorGroups = {};
  let totalAmount = 0;

  cart.items.forEach((item) => {
    const prod = item.productId;
    if (!prod) return;
    const vendorId = prod.vendorId || 'generic';
    if (!vendorGroups[vendorId]) {
      vendorGroups[vendorId] = {
        vendorName: prod.vendorId?.vendorProfile?.storeName || 'Independent Vendor',
        items: []
      };
    }
    const itemSubtotal = prod.price * item.quantity;
    totalAmount += itemSubtotal;
    vendorGroups[vendorId].items.push({ ...item, itemSubtotal });
  });

  async function handleCheckout() {
    setSubmitting(true);
    setError('');
    try {
      // 1. Process cart-splitting checkout (FR-16, FR-17)
      const checkoutItems = cart.items.map((i) => ({
        productId: i.productId._id || i.productId,
        variantId: i.variantId || null,
        quantity: i.quantity
      }));

      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: checkoutItems,
          shippingAddress,
          paymentMethod: 'razorpay'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Checkout failed');

      const { order, subOrders } = data.data;

      // 2. Simulate Razorpay Test Mode Payment Confirmation (FR-21)
      const confirmRes = await fetch('/api/orders/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          orderId: order._id,
          paymentId: `pay_mock_${Date.now()}`,
          signature: 'simulated_valid_signature'
        })
      });

      const confirmData = await confirmRes.json();
      if (!confirmRes.ok) throw new Error(confirmData.error?.message || 'Payment confirmation failed');

      clearCart();
      setCompletedOrder({ order: confirmData.data.order, subOrders });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container" style={{ padding: '24px 16px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Multi-Vendor Shopping Cart</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
        Items from different vendors will be processed in one single atomic checkout and split into dedicated sub-orders.
      </p>

      {error && <div className="state-error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Left: Vendor-split item groups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Object.entries(vendorGroups).map(([vendorId, group]) => {
            const groupTotal = group.items.reduce((acc, curr) => acc + curr.itemSubtotal, 0);

            return (
              <div key={vendorId} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '12px' }}>
                  <Store size={18} color="var(--primary)" />
                  <span style={{ fontWeight: '600', fontSize: '15px' }}>Store: {group.vendorName}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {group.items.map((item) => (
                    <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '600' }}>{item.productId?.name}</h4>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          ₹{item.productId?.price} x {item.quantity}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '4px' }}>
                          <button onClick={() => updateQuantity(item._id, item.quantity - 1)} style={{ padding: '4px 8px', background: 'none' }}>-</button>
                          <span style={{ padding: '4px 8px', fontSize: '13px' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id, item.quantity + 1)} style={{ padding: '4px 8px', background: 'none' }}>+</button>
                        </div>
                        <span style={{ fontWeight: 'bold', minWidth: '60px', textAlign: 'right' }}>₹{item.itemSubtotal}</span>
                        <button onClick={() => removeItem(item._id)} style={{ background: 'none', color: 'var(--danger)', padding: '4px' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed var(--border)', textAlign: 'right', fontSize: '13px', color: 'var(--text-muted)' }}>
                  Vendor Subtotal: <strong style={{ color: 'var(--text-main)' }}>₹{groupTotal}</strong>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Checkout & Address Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Shipping Address</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Street Address:</label>
                <input
                  type="text"
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>City:</label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>State:</label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Postal Code / Zip:</label>
                <input
                  type="text"
                  value={shippingAddress.zip}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Order Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Participating Vendors:</span>
              <span>{Object.keys(vendorGroups).length} Vendors</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Items Total:</span>
              <span>₹{totalAmount.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Platform Delivery:</span>
              <span style={{ color: 'var(--success)' }}>FREE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)', fontSize: '18px', fontWeight: 'bold' }}>
              <span>Grand Total:</span>
              <span style={{ color: 'var(--primary)' }}>₹{totalAmount.toLocaleString()}</span>
            </div>

            <div style={{ margin: '16px 0', padding: '10px', backgroundColor: '#eff6ff', borderRadius: 'var(--radius)', fontSize: '12px', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} />
              <span>Razorpay Test Gateway Mode: Atomic Stock Lock & Split Ledger</span>
            </div>

            <button
              disabled={submitting}
              onClick={handleCheckout}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            >
              <CreditCard size={18} />
              <span>{submitting ? 'Executing Atomic Checkout...' : `Pay ₹${totalAmount.toLocaleString()} & Place Order`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
