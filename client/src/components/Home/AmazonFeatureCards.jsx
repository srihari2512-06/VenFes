import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Tag, Gift, Truck, ArrowRight, ShieldCheck, Search, Check, Copy } from 'lucide-react';
import { AVAILABLE_COUPONS } from '../../utils/coupons';

export default function AmazonFeatureCards({ products = [] }) {
  const navigate = useNavigate();
  const [quickOrderTrack, setQuickOrderTrack] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  // Pick top 4 electronics products or fallbacks for Card 1
  const techItems = Array.isArray(products)
    ? products.filter(p => p && p.category === 'Electronics').slice(0, 4)
    : [];

  function handleTrackSubmit(e) {
    e.preventDefault();
    if (quickOrderTrack.trim()) {
      navigate(`/track/${encodeURIComponent(quickOrderTrack.trim())}`);
    } else {
      navigate('/track');
    }
  }

  function handleCopy(code, e) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
        marginBottom: '36px'
      }}
    >
      {/* Card 1: 4-Quadrant Electronics Showcase */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <div>
          <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '12px' }}>
            Up to 50% Off | Tech & Peripherals
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              marginBottom: '16px'
            }}
          >
            {[
              {
                title: 'Audio & ANC',
                img: techItems[0]?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80',
                link: '/products?category=Electronics'
              },
              {
                title: 'Keyboards',
                img: techItems[1]?.images?.[0] || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&q=80',
                link: '/products?category=Electronics'
              },
              {
                title: 'Displays',
                img: techItems[2]?.images?.[0] || 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&q=80',
                link: '/products?category=Electronics'
              },
              {
                title: 'Studio Mics',
                img: techItems[3]?.images?.[0] || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&q=80',
                link: '/products?category=Electronics'
              }
            ].map((quad, idx) => (
              <Link
                key={idx}
                to={quad.link}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                <div
                  style={{
                    height: '90px',
                    backgroundColor: '#f8fafc',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '4px'
                  }}
                >
                  <img
                    src={quad.img}
                    alt={quad.title}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{quad.title}</span>
              </Link>
            ))}
          </div>
        </div>

        <Link
          to="/products?category=Electronics"
          style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600' }}
        >
          Explore All Tech Deals →
        </Link>
      </div>

      {/* Card 2: Exclusive Promo Coupons */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Tag size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: 'var(--text-main)' }}>
              Claim Promo Coupons
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Instant discount vouchers ready to copy & apply at checkout:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {AVAILABLE_COUPONS.slice(0, 3).map((coupon) => {
              const isCopied = copiedCode === coupon.code;
              return (
                <div
                  key={coupon.code}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius)',
                    backgroundColor: 'var(--surface-alt)',
                    border: '1px dashed var(--primary-border)'
                  }}
                >
                  <div>
                    <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '13px', color: 'var(--primary-hover)' }}>
                      {coupon.code}
                    </span>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}% Off` : `₹${coupon.discountValue} Off`} (Min ₹{coupon.minOrderValue})
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleCopy(coupon.code, e)}
                    style={{
                      background: 'none',
                      color: isCopied ? 'var(--green)' : 'var(--primary)',
                      fontSize: '11px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      padding: '3px 6px'
                    }}
                  >
                    {isCopied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <Link to="/coupons" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600' }}>
          View All Active Coupons →
        </Link>
      </div>

      {/* Card 3: Venfes Gift Cards & Wallet */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Gift size={18} color="#ec4899" />
            <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: 'var(--text-main)' }}>
              Venfes Gift Cards
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Instant digital gifts for birthdays, festivals, and achievements.
          </p>

          {/* Mini Card Graphic */}
          <div
            style={{
              background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
              color: '#ffffff',
              padding: '16px',
              borderRadius: 'var(--radius)',
              marginBottom: '14px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', opacity: 0.9 }}>
              <span>VENFES DIGITAL CARD</span>
              <span>🎁</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', margin: '8px 0 4px' }}>
              ₹1,000 - ₹5,000
            </div>
            <div style={{ fontSize: '10px', opacity: 0.85 }}>
              Redeemable across all 30+ catalog products
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/gift-cards" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600' }}>
            Send or Redeem Gift Card →
          </Link>
        </div>
      </div>

      {/* Card 4: Live Order Tracking */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Truck size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: 'var(--text-main)' }}>
              Live Order Tracking
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Track vendor dispatch, carrier hub transfer, and out-for-delivery status:
          </p>

          <form onSubmit={handleTrackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                value={quickOrderTrack}
                onChange={(e) => setQuickOrderTrack(e.target.value)}
                placeholder="Enter your Order #"
                style={{ width: '100%', padding: '8px 10px 8px 30px', fontSize: '12px' }}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '8px', fontSize: '12px', fontWeight: '600' }}>
              Track Package Live →
            </button>
          </form>
        </div>

        <Link to="/track" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600' }}>
          Open Order Tracking Hub →
        </Link>
      </div>
    </div>
  );
}
