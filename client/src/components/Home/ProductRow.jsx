import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import PriceBlock from '../ui/PriceBlock';
import RatingChip from '../ui/RatingChip';
import SellerLink from '../ui/SellerLink';
import { Skeleton } from '../ui/Skeleton';
import ErrorState from '../ui/ErrorState';

export default function ProductRow({
  title,
  subtitle = '',
  viewAllLink = '/products',
  products = [],
  loading = false,
  error = null,
  onRetry = null
}) {
  const scrollContainerRef = useRef(null);

  function scroll(offset) {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  }

  // Loading skeleton state
  if (loading) {
    return (
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <Skeleton width="180px" height="22px" />
            <Skeleton width="120px" height="14px" style={{ marginTop: '6px' }} />
          </div>
          <Skeleton width="80px" height="20px" />
        </div>
        <div style={{ display: 'flex', gap: '16px', overflowX: 'hidden' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card" style={{ width: '220px', flexShrink: 0 }}>
              <Skeleton height="150px" borderRadius="var(--radius)" />
              <Skeleton width="70%" height="16px" style={{ marginTop: '10px' }} />
              <Skeleton width="40%" height="14px" style={{ marginTop: '6px' }} />
              <Skeleton width="50%" height="18px" style={{ marginTop: '10px' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state for this specific row
  if (error) {
    return (
      <div style={{ marginBottom: '36px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>{title}</h3>
        <ErrorState
          title={`Unable to load ${title}`}
          message="Could not load these products. Other sections of the store remain available."
          onRetry={onRetry}
        />
      </div>
    );
  }

  // Requirement: Rows with fewer than 4 products are hidden
  if (!products || products.length < 4) {
    return null;
  }

  return (
    <div style={{ marginBottom: '36px', position: 'relative' }}>
      {/* Row Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
              {subtitle}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            to={viewAllLink}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--primary)',
              textDecoration: 'none'
            }}
          >
            <span>See all</span>
            <ArrowRight size={14} />
          </Link>

          {/* Desktop scroll arrows */}
          <div className="product-row-arrows" style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => scroll(-260)}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-xs)'
              }}
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => scroll(260)}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-xs)'
              }}
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollContainerRef}
        style={{
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          paddingBottom: '12px',
          scrollbarWidth: 'none'
        }}
      >
        {products.map((p) => {
          const sellerName = p.vendorId?.vendorProfile?.storeName || p.vendorId?.name || 'Verified Seller';
          const sellerId = p.vendorId?._id || p.vendorId;

          return (
            <Link
              key={p._id}
              to={`/product/${p._id}`}
              className="card"
              style={{
                width: '220px',
                flexShrink: 0,
                scrollSnapAlign: 'start',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '12px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <div>
                {/* Fixed aspect ratio image */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '1 / 1',
                    backgroundColor: 'var(--surface-alt)',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    marginBottom: '10px'
                  }}
                >
                  {p.images && p.images[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                      No image
                    </div>
                  )}

                  {/* Stock tag if low */}
                  {p.stock > 0 && p.stock <= (p.lowStockThreshold || 5) && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '6px',
                        left: '6px',
                        backgroundColor: 'var(--warning-bg)',
                        color: '#92400e',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}
                    >
                      Only {p.stock} left
                    </span>
                  )}
                </div>

                {/* Seller & Brand */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <SellerLink storeId={sellerId} name={sellerName} />
                  {p.brand && <span style={{ fontWeight: '500' }}>{p.brand}</span>}
                </div>

                {/* Product Title (2-line clamp) */}
                <h4
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    lineHeight: '1.3',
                    marginBottom: '8px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    height: '34px'
                  }}
                  title={p.name}
                >
                  {p.name}
                </h4>

                {/* Rating */}
                <div style={{ marginBottom: '8px' }}>
                  <RatingChip rating={p.averageRating} count={p.numReviews} size="sm" />
                </div>
              </div>

              {/* Price Block */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', marginTop: '4px' }}>
                <PriceBlock price={p.price} mrp={p.mrp} size="card" />
              </div>
            </Link>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .product-row-arrows {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
