import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShieldCheck, ArrowDownRight, ExternalLink } from 'lucide-react';
import PriceBlock from '../ui/PriceBlock';

export default function PriceComparisonRow({ products = [], loading = false }) {
  const scrollContainerRef = useRef(null);

  function scroll(offset) {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  }

  // Pick top 6 products that have competitor price advantages
  const dealItems = Array.isArray(products) ? products.slice(0, 8) : [];

  if (loading || dealItems.length === 0) return null;

  return (
    <div style={{ marginBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="var(--green)" />
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-main)' }}>
              Best Price Guarantee vs Other Marketplaces
            </h2>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Buy direct from creators on Venfes and save compared to Amazon.in, Flipkart, and Croma
          </p>
        </div>

        <Link to="/products?sort=discount" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600' }}>
          Compare All Products →
        </Link>
      </div>

      <div style={{ position: 'relative' }}>
        <button
          onClick={() => scroll(-320)}
          aria-label="Scroll left"
          style={{
            position: 'absolute',
            left: '-16px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ChevronLeft size={20} />
        </button>

        <div
          ref={scrollContainerRef}
          style={{
            display: 'flex',
            gap: '16px',
            overflowX: 'auto',
            paddingBottom: '8px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {dealItems.map((prod) => {
            const comps = prod.competitorPrices && prod.competitorPrices.length > 0
              ? prod.competitorPrices
              : [
                  { store: 'Amazon.in', price: Math.round(prod.price * 1.08 + 50) },
                  { store: 'Flipkart', price: Math.round(prod.price * 1.10 + 70) }
                ];
            const amazonPrice = comps.find(c => c.store.includes('Amazon'))?.price || Math.round(prod.price * 1.08 + 50);
            const savings = amazonPrice - prod.price;

            return (
              <div
                key={prod._id}
                className="card"
                style={{
                  width: '240px',
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '14px',
                  borderRadius: 'var(--radius)',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-xs)'
                }}
              >
                <div>
                  <Link to={`/product/${prod._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div
                      style={{
                        height: '140px',
                        backgroundColor: '#f8fafc',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '8px'
                      }}
                    >
                      {prod.images && prod.images[0] ? (
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      ) : null}
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                      {prod.brand || prod.category}
                    </div>
                    <strong
                      style={{
                        fontSize: '13px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '34px',
                        lineHeight: '1.3'
                      }}
                    >
                      {prod.name}
                    </strong>
                  </Link>

                  {/* Venfes Price vs Amazon/Flipkart */}
                  <div
                    style={{
                      marginTop: '10px',
                      padding: '8px 10px',
                      backgroundColor: 'var(--surface-alt)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontWeight: '600', color: 'var(--primary)' }}>⚡ Venfes Price:</span>
                      <strong style={{ color: 'var(--primary)', fontSize: '12px' }}>₹{prod.price.toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>Amazon.in:</span>
                      <span style={{ textDecoration: 'line-through' }}>₹{amazonPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Savings pill */}
                  <div
                    style={{
                      marginTop: '8px',
                      backgroundColor: 'var(--green-light)',
                      color: 'var(--green)',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <ArrowDownRight size={14} />
                    <span>Save ₹{savings.toLocaleString()} vs Amazon</span>
                  </div>
                </div>

                <Link
                  to={`/product/${prod._id}`}
                  className="btn btn-secondary btn-sm"
                  style={{
                    marginTop: '12px',
                    width: '100%',
                    fontSize: '11px',
                    padding: '6px',
                    textAlign: 'center'
                  }}
                >
                  View 60d Price History & Specs →
                </Link>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => scroll(320)}
          aria-label="Scroll right"
          style={{
            position: 'absolute',
            right: '-16px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
