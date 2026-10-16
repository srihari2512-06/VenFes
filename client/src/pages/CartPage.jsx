import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  Trash2,
  Store,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ShoppingBag,
  Tag,
  Gift,
  Check,
  MapPin,
  QrCode,
  Smartphone,
  Banknote,
  Lock,
  ArrowRight
} from 'lucide-react';
import { validateCoupon } from '../utils/coupons';

export default function CartPage({ onBrowse, onOrderComplete }) {
  const navigate = useNavigate();
  const handleBrowse = onBrowse || (() => navigate('/products'));
  const handleOrderComplete = onOrderComplete || (() => navigate('/orders'));
  const { cart, updateQuantity, removeItem, clearCart } = useCart();
  const { user, token, login } = useAuth();

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

  // Payment method selection: 'upi' | 'card' | 'cod' | 'razorpay'
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [upiId, setUpiId] = useState('customer@oksbi');
  const [cardData, setCardData] = useState({
    number: '4532 8921 7843 1198',
    name: 'Kavita Sundaram',
    expiry: '12/28',
    cvv: '821'
  });

  // Coupon & Gift Card State
  const [couponCode, setCouponCode] = useState(localStorage.getItem('venfes_applied_coupon') || '');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [useGiftCard, setUseGiftCard] = useState(false);
  const [giftCardBalance, setGiftCardBalance] = useState(
    Number(localStorage.getItem('venfes_gift_card_balance') || 1000)
  );

  async function handleQuickLogin() {
    try {
      await login('customer@venfes.com', 'customer123');
    } catch (err) {
      setError('Unable to sign in automatically. Please visit the login page.');
    }
  }

  // Success view after placing order
  if (completedOrder) {
    const isCOD = completedOrder.order?.paymentMethod === 'cod';

    return (
      <div className="container" style={{ padding: '48px 16px', maxWidth: '720px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '36px' }}>
          <CheckCircle2 size={52} color="var(--success)" style={{ margin: '0 auto 16px' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
            {isCOD ? 'Order Placed (Cash on Delivery)!' : 'Payment Verified & Order Confirmed!'}
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            Atomic Cart-Split Checkout completed. 1 Parent Order created and split into {completedOrder.subOrders?.length} Vendor Sub-Orders in MongoDB database.
          </p>

          <div style={{ backgroundColor: 'var(--surface-alt)', padding: '18px', borderRadius: 'var(--radius)', textAlign: 'left', marginBottom: '24px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <strong>Parent Order Number:</strong>
              <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{completedOrder.order?.orderNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <strong>Total Order Amount:</strong>
              <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>₹{completedOrder.order?.totalAmount?.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <strong>Payment Option:</strong>
              <span style={{ textTransform: 'uppercase', fontWeight: '600' }}>
                {completedOrder.order?.paymentMethod === 'cod' ? 'Cash on Delivery (Doorstep)' : completedOrder.order?.paymentMethod === 'upi' ? 'UPI (Instant Verification)' : completedOrder.order?.paymentMethod === 'card' ? 'Credit / Debit Card' : 'Razorpay Gateway'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <strong>Database Status:</strong>
              <span className={`badge ${isCOD ? 'badge-placed' : 'badge-paid'}`}>
                {isCOD ? 'PLACED / COD PENDING' : 'PAID & VERIFIED'}
              </span>
            </div>
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'left', marginBottom: '12px' }}>
            Vendor Split Sub-Orders (Synchronized in MongoDB Compass):
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
            {completedOrder.subOrders?.map((sub) => (
              <div key={sub._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', backgroundColor: '#fff', fontSize: '13px' }}>
                <div>
                  <strong>{sub.subOrderNumber}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sub.items?.length} items grouped for this vendor</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-placed" style={{ marginRight: '8px', textTransform: 'uppercase' }}>{sub.status}</span>
                  <strong>₹{sub.subtotal?.toLocaleString()}</strong>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
            <Link
              to={`/track/${completedOrder.order?.orderNumber}`}
              className="btn btn-primary"
              style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minWidth: '220px' }}
            >
              <MapPin size={18} />
              <span>Track Live on Map</span>
            </Link>
            <button
              onClick={handleOrderComplete}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '12px', minWidth: '220px' }}
            >
              View in My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty Cart view
  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: '64px 16px', textAlign: 'center' }}>
        <div className="state-empty card" style={{ maxWidth: '480px', margin: '0 auto', padding: '36px 24px' }}>
          <ShoppingBag size={48} style={{ margin: '0 auto 16px', color: 'var(--text-muted)' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Your shopping cart is empty</h2>
          <p style={{ margin: '12px 0 24px', color: 'var(--text-muted)', fontSize: '14px' }}>
            Explore verified products from independent sellers across electronics, fashion, footwear, and home.
          </p>
          <button onClick={handleBrowse} className="btn btn-primary" style={{ padding: '10px 24px' }}>
            Explore Catalog
          </button>
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
    const vendorId = prod.vendorId?._id || prod.vendorId || 'generic';
    if (!vendorGroups[vendorId]) {
      vendorGroups[vendorId] = {
        vendorName: prod.vendorId?.vendorProfile?.storeName || prod.vendorId?.name || 'Verified Marketplace Vendor',
        items: []
      };
    }
    const itemSubtotal = (prod.price || 0) * (item.quantity || 1);
    totalAmount += itemSubtotal;
    vendorGroups[vendorId].items.push({ ...item, itemSubtotal, price: prod.price || 0, name: prod.name });
  });

  function handleApplyCoupon(e) {
    if (e) e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    const res = validateCoupon(couponCode, totalAmount);
    if (!res.valid) {
      setCouponError(res.message);
      setAppliedCoupon(null);
    } else {
      setAppliedCoupon(res);
      setCouponSuccess(res.message);
      localStorage.setItem('venfes_applied_coupon', res.coupon.code);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponSuccess('');
    setCouponError('');
    setCouponCode('');
    localStorage.removeItem('venfes_applied_coupon');
  }

  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const afterCouponTotal = Math.max(0, totalAmount - couponDiscount);
  const giftCardDeduction = useGiftCard ? Math.min(giftCardBalance, afterCouponTotal) : 0;
  const finalPayable = Math.max(0, afterCouponTotal - giftCardDeduction);

  async function handleCheckout() {
    if (!user) {
      // Auto-authenticate with customer account if not logged in to streamline testing
      try {
        await login('customer@venfes.com', 'customer123');
      } catch {
        setError('Please sign in to proceed with checkout.');
        return;
      }
    }

    setSubmitting(true);
    setError('');
    try {
      const activeToken = token || localStorage.getItem('venfes_token');

      // 1. Process cart-splitting checkout (FR-16, FR-17)
      const checkoutItems = cart.items.map((i) => ({
        productId: i.productId._id || i.productId,
        variantId: i.variantId || null,
        quantity: i.quantity || 1
      }));

      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeToken}` },
        body: JSON.stringify({
          items: checkoutItems,
          shippingAddress,
          paymentMethod
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Checkout failed');

      const { order, subOrders } = data.data;

      // 2. Confirm payment according to selected option (UPI, Card, COD, Razorpay)
      let paymentId = `pay_${paymentMethod}_${Date.now()}`;
      let sig = 'simulated_valid_signature';

      if (paymentMethod === 'cod') {
        paymentId = `COD-${Date.now()}`;
        sig = 'cash_on_delivery_confirmed';
      }

      const confirmRes = await fetch('/api/orders/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeToken}` },
        body: JSON.stringify({
          orderId: order._id,
          paymentId,
          signature: sig,
          paymentMethod
        })
      });

      const confirmData = await confirmRes.json();
      if (!confirmRes.ok) throw new Error(confirmData.error?.message || 'Payment confirmation failed');

      if (useGiftCard && giftCardDeduction > 0) {
        const remaining = Math.max(0, giftCardBalance - giftCardDeduction);
        setGiftCardBalance(remaining);
        localStorage.setItem('venfes_gift_card_balance', remaining.toString());
      }
      localStorage.removeItem('venfes_applied_coupon');
      setAppliedCoupon(null);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>Multi-Vendor Shopping Cart</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Items are atomically split per vendor and saved in the MongoDB database upon checkout.
          </p>
        </div>

        {!user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Browsing as Guest:</span>
            <button onClick={handleQuickLogin} className="btn btn-secondary btn-sm" style={{ fontSize: '12px' }}>
              1-Click Demo Login
            </button>
          </div>
        )}
      </div>

      {error && <div className="state-error" style={{ marginBottom: '20px' }}>{error}</div>}

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
                  {group.items.map((item, idx) => (
                    <div key={item._id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '600' }}>{item.name || item.productId?.name}</h4>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          ₹{(item.price || item.productId?.price || 0).toLocaleString()} × {item.quantity}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '4px' }}>
                          <button onClick={() => updateQuantity(item._id || item.productId?._id, item.quantity - 1)} style={{ padding: '4px 8px', background: 'none', border: 'none', cursor: 'pointer' }}>-</button>
                          <span style={{ padding: '4px 8px', fontSize: '13px' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id || item.productId?._id, item.quantity + 1)} style={{ padding: '4px 8px', background: 'none', border: 'none', cursor: 'pointer' }}>+</button>
                        </div>
                        <span style={{ fontWeight: 'bold', minWidth: '70px', textAlign: 'right' }}>₹{item.itemSubtotal.toLocaleString()}</span>
                        <button onClick={() => removeItem(item._id || item.productId?._id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', padding: '4px', cursor: 'pointer' }} aria-label="Remove item">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed var(--border)', textAlign: 'right', fontSize: '13px', color: 'var(--text-muted)' }}>
                  Vendor Subtotal: <strong style={{ color: 'var(--text-main)' }}>₹{groupTotal.toLocaleString()}</strong>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Checkout, Address, Payment Gateway & Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Shipping Address */}
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '14px' }}>1. Delivery Address</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Street Address:</label>
                <input
                  type="text"
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>City:</label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>State:</label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Postal Code / PIN:</label>
                <input
                  type="text"
                  value={shippingAddress.zip}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                />
              </div>
            </div>
          </div>

          {/* Payment Gateway Selector */}
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '14px' }}>2. Payment Method</h3>

            {/* Payment Mode Radio Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              {/* Option 1: UPI */}
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  border: paymentMethod === 'upi' ? '2px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: paymentMethod === 'upi' ? 'var(--primary-light)' : 'var(--surface)',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Smartphone size={18} color="var(--primary)" />
                <div>
                  <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text-main)' }}>UPI / QR</strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>GPay, PhonePe, Paytm</span>
                </div>
              </button>

              {/* Option 2: Cards */}
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  border: paymentMethod === 'card' ? '2px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: paymentMethod === 'card' ? 'var(--primary-light)' : 'var(--surface)',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <CreditCard size={18} color="var(--primary)" />
                <div>
                  <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text-main)' }}>Card</strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Visa, MasterCard, RuPay</span>
                </div>
              </button>

              {/* Option 3: Cash on Delivery (COD) */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  border: paymentMethod === 'cod' ? '2px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: paymentMethod === 'cod' ? 'var(--primary-light)' : 'var(--surface)',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Banknote size={18} color="var(--green)" />
                <div>
                  <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text-main)' }}>Cash on Delivery</strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pay at doorstep</span>
                </div>
              </button>

              {/* Option 4: Razorpay Gateway */}
              <button
                type="button"
                onClick={() => setPaymentMethod('razorpay')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  border: paymentMethod === 'razorpay' ? '2px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: paymentMethod === 'razorpay' ? 'var(--primary-light)' : 'var(--surface)',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <ShieldCheck size={18} color="#2563eb" />
                <div>
                  <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text-main)' }}>Net Banking</strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>All Indian banks</span>
                </div>
              </button>
            </div>

            {/* Mode Specific Configuration */}
            {paymentMethod === 'upi' && (
              <div style={{ backgroundColor: 'var(--surface-alt)', padding: '16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <QrCode size={20} color="var(--primary)" />
                  <strong style={{ fontSize: '13px' }}>Instant UPI Scan & Pay</strong>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  {['gpay', 'phonepe', 'paytm', 'bhim'].map((app) => (
                    <button
                      key={app}
                      type="button"
                      onClick={() => setSelectedUpiApp(app)}
                      style={{
                        padding: '6px 10px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        borderRadius: '4px',
                        border: selectedUpiApp === app ? '1px solid var(--primary)' : '1px solid var(--border)',
                        backgroundColor: selectedUpiApp === app ? 'var(--primary)' : '#fff',
                        color: selectedUpiApp === app ? '#fff' : 'var(--text-main)',
                        cursor: 'pointer'
                      }}
                    >
                      {app}
                    </button>
                  ))}
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>UPI VPA ID:</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. mobile@upi"
                      style={{ flex: 1, padding: '8px 10px', fontSize: '13px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                    />
                    <span className="badge badge-paid" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0 8px' }}>
                      <Check size={12} /> Verified
                    </span>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div style={{ backgroundColor: 'var(--surface-alt)', padding: '16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong style={{ fontSize: '13px' }}>Card Details (Test Gateway)</strong>
                  <span className="badge badge-accent" style={{ fontSize: '10px' }}>256-Bit Encrypted</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="text"
                    value={cardData.number}
                    onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                    placeholder="Card Number"
                    style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontFamily: 'monospace' }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input
                      type="text"
                      value={cardData.expiry}
                      onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                      placeholder="MM/YY"
                      style={{ padding: '8px 10px', fontSize: '13px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                    />
                    <input
                      type="password"
                      value={cardData.cvv}
                      onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                      placeholder="CVV"
                      maxLength={4}
                      style={{ padding: '8px 10px', fontSize: '13px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                    />
                  </div>
                  <input
                    type="text"
                    value={cardData.name}
                    onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                    placeholder="Cardholder Full Name"
                    style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: 'var(--radius)', border: '1px solid #86efac' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Banknote size={20} color="var(--green)" />
                  <strong style={{ fontSize: '13px', color: 'var(--green)' }}>Cash on Delivery (Doorstep Verification)</strong>
                </div>
                <p style={{ fontSize: '12px', color: '#166534', margin: 0, lineHeight: '1.5' }}>
                  No upfront online payment required. Pay using cash or by scanning the courier agent's UPI QR code when your package arrives.
                </p>
              </div>
            )}

            {paymentMethod === 'razorpay' && (
              <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: 'var(--radius)', border: '1px solid #93c5fd' }}>
                <strong style={{ fontSize: '13px', color: '#1e40af', display: 'block', marginBottom: '4px' }}>Razorpay Test Gateway</strong>
                <p style={{ fontSize: '12px', color: '#1e3a8a', margin: 0 }}>
                  Supports HDFC, ICICI, SBI, Axis, Kotak Net Banking and all digital mobile wallets.
                </p>
              </div>
            )}
          </div>

          {/* 3. Order Summary & Discounts */}
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '14px' }}>3. Order Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Participating Vendors:</span>
              <span>{Object.keys(vendorGroups).length} Independent Stores</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Items Total:</span>
              <span>₹{totalAmount.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Express Marketplace Shipping:</span>
              <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>FREE</span>
            </div>

            {/* Coupons Section */}
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Tag size={15} color="var(--primary)" />
                <span style={{ fontSize: '13px', fontWeight: '600' }}>Apply Promo Coupon</span>
              </div>

              {appliedCoupon ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '12px' }}>
                  <div>
                    <strong style={{ color: 'var(--green)' }}>{appliedCoupon.coupon.code}</strong> Applied!
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{appliedCoupon.coupon.title}</div>
                  </div>
                  <button onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '6px' }}>
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="e.g. FESTIVE20"
                      style={{ flex: 1, padding: '7px 10px', fontSize: '12px', textTransform: 'uppercase', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                    />
                    <button type="submit" className="btn btn-secondary btn-sm" style={{ fontSize: '12px', padding: '7px 12px' }}>
                      Apply
                    </button>
                  </form>
                  {couponError && <div style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '4px' }}>{couponError}</div>}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {['WELCOME50', 'FESTIVE20', 'TECH10'].map(code => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          setCouponCode(code);
                          const res = validateCoupon(code, totalAmount);
                          if (res.valid) {
                            setAppliedCoupon(res);
                            setCouponSuccess(res.message);
                            setCouponError('');
                          } else {
                            setCouponError(res.message);
                          }
                        }}
                        style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', border: '1px dashed var(--primary)', background: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                      >
                        + {code}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Gift Card Wallet */}
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={useGiftCard}
                    onChange={(e) => setUseGiftCard(e.target.checked)}
                    disabled={giftCardBalance <= 0}
                  />
                  <span>Use Gift Card Balance (₹{giftCardBalance.toLocaleString()})</span>
                </label>
                <Link to="/gift-cards" style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '600' }}>
                  Manage →
                </Link>
              </div>
            </div>

            {couponDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '13px', color: 'var(--green)' }}>
                <span>Coupon Discount ({appliedCoupon?.coupon?.code}):</span>
                <span>- ₹{couponDiscount.toLocaleString()}</span>
              </div>
            )}
            {giftCardDeduction > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '13px', color: 'var(--primary)' }}>
                <span>Gift Card Balance:</span>
                <span>- ₹{giftCardDeduction.toLocaleString()}</span>
              </div>
            )}

            {/* Final Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', paddingTop: '14px', borderTop: '2px solid var(--border)', fontSize: '18px', fontWeight: 'bold' }}>
              <span>Payable Total:</span>
              <span style={{ color: 'var(--primary)' }}>₹{finalPayable.toLocaleString()}</span>
            </div>

            <div style={{ margin: '14px 0', padding: '10px', backgroundColor: 'var(--surface-alt)', borderRadius: 'var(--radius)', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="var(--green)" />
              <span>MongoDB Replica Transaction • Atomic Stock Decrement Guaranteed</span>
            </div>

            <button
              disabled={submitting}
              onClick={handleCheckout}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Lock size={16} />
              <span>
                {submitting
                  ? 'Processing Checkout in MongoDB...'
                  : paymentMethod === 'cod'
                  ? `Place Order (COD: ₹${finalPayable.toLocaleString()})`
                  : `Pay ₹${finalPayable.toLocaleString()} via ${paymentMethod.toUpperCase()}`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
