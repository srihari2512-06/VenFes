import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Tag, Copy, Check, Sparkles, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { AVAILABLE_COUPONS } from '../utils/coupons';

export default function CouponsPage() {
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Electronics', 'Footwear', 'Clothing', 'Multi-Vendor'];

  const filteredCoupons = activeCategory === 'All'
    ? AVAILABLE_COUPONS
    : AVAILABLE_COUPONS.filter(c => c.category === activeCategory || c.badge === activeCategory || c.category === 'All');

  function handleCopy(code) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  }

  function handleApplyAndGoToCart(code) {
    localStorage.setItem('venfes_applied_coupon', code);
    navigate('/cart');
  }

  return (
    <div className="container" style={{ padding: '32px 16px', maxWidth: '1080px' }}>
      {/* Banner / Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '36px 28px',
          marginBottom: '32px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '12px'
            }}
          >
            <Sparkles size={14} color="#fcd34d" /> Marketplace Savings Zone
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
            Venfes Coupons & Promo Codes
          </h1>
          <p style={{ fontSize: '14px', opacity: 0.9, lineHeight: '1.5' }}>
            Collect exclusive vendor coupons, instant checkout discounts, and festival vouchers. Apply verified codes during checkout to maximize your savings.
          </p>
        </div>

        <Link
          to="/products"
          className="btn"
          style={{
            backgroundColor: '#ffffff',
            color: 'var(--primary)',
            fontWeight: 'bold',
            padding: '12px 20px',
            borderRadius: 'var(--radius)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ShoppingBag size={18} />
          <span>Shop Marketplace Deals</span>
        </Link>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: activeCategory === cat ? '700' : '500',
              backgroundColor: activeCategory === cat ? 'var(--primary)' : 'var(--surface)',
              color: activeCategory === cat ? '#ffffff' : 'var(--text-main)',
              border: '1px solid',
              borderColor: activeCategory === cat ? 'var(--primary)' : 'var(--border)',
              transition: 'all 0.15s ease'
            }}
          >
            {cat === 'All' ? 'All Verified Coupons' : cat}
          </button>
        ))}
      </div>

      {/* Coupons Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredCoupons.map((coupon) => {
          const isCopied = copiedCode === coupon.code;
          return (
            <div
              key={coupon.code}
              className="card"
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--surface)',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <div>
                {/* Badge & Expiry Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span
                    style={{
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      textTransform: 'uppercase'
                    }}
                  >
                    {coupon.badge}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {coupon.expiry}
                  </span>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '4px' }}>
                  {coupon.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.4' }}>
                  {coupon.description}
                </p>
              </div>

              <div>
                {/* Coupon Code Box */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    border: '2px dashed var(--primary-border)',
                    borderRadius: 'var(--radius)',
                    backgroundColor: 'var(--primary-light)',
                    marginBottom: '14px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={16} color="var(--primary)" />
                    <span style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: 'bold', letterSpacing: '1px', color: 'var(--primary-hover)' }}>
                      {coupon.code}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopy(coupon.code)}
                    style={{
                      background: 'none',
                      color: isCopied ? 'var(--green)' : 'var(--primary)',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px'
                    }}
                  >
                    {isCopied ? (
                      <>
                        <Check size={14} color="var(--green)" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copy
                      </>
                    )}
                  </button>
                </div>

                {/* Bottom Action Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleApplyAndGoToCart(coupon.code)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, padding: '9px 12px', fontSize: '12px', fontWeight: '600' }}
                  >
                    Apply to Cart →
                  </button>
                  <Link
                    to={`/products?category=${encodeURIComponent(coupon.category === 'All' ? '' : coupon.category)}`}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '9px 12px', fontSize: '12px' }}
                  >
                    View Items
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Callout */}
      <div
        className="card"
        style={{
          marginTop: '36px',
          padding: '20px',
          backgroundColor: 'var(--surface-alt)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}
      >
        <ShieldCheck size={28} color="var(--green)" />
        <div style={{ fontSize: '13px', color: 'var(--text-main)' }}>
          <strong>How to redeem coupons:</strong> Copy any code above or click "Apply to Cart". When you checkout, the discount is automatically recalculated against your total before Razorpay payment authorization.
        </div>
      </div>
    </div>
  );
}
