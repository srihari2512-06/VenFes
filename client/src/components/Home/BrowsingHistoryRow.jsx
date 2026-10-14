import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, ShoppingCart } from 'lucide-react';
import { getBrowsingHistory } from '../../utils/history';
import { useCart } from '../../context/CartContext';
import PriceBlock from '../ui/PriceBlock';
import RatingChip from '../ui/RatingChip';

export default function BrowsingHistoryRow() {
  const [history, setHistory] = useState([]);
  const { addToCart } = useCart();
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    setHistory(getBrowsingHistory());
  }, []);

  function scroll(offset) {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  }

  if (!history || history.length === 0) return null;

  return (
    <div style={{ marginBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color="var(--primary)" />
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-main)' }}>
            Your Browsing History
          </h2>
        </div>
        <Link to="/history" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600' }}>
          View or Edit History ({history.length}) →
        </Link>
      </div>

      <div style={{ position: 'relative' }}>
        <button
          onClick={() => scroll(-300)}
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
            justifyContent: 'center',
            color: 'var(--text-main)'
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
          {history.map((item) => (
            <div
              key={item._id}
              className="card"
              style={{
                width: '210px',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '12px',
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)'
              }}
            >
              <Link to={`/product/${item._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
                  {item.images && item.images[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No image</span>
                  )}
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                  {item.brand || item.category}
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
                  {item.name}
                </strong>

                <div style={{ marginTop: '4px' }}>
                  <PriceBlock price={item.price} mrp={item.mrp} />
                </div>
              </Link>

              <button
                onClick={async () => {
                  try {
                    await addToCart(item._id, null, 1);
                    alert(`Added ${item.name} to cart!`);
                  } catch (err) {
                    alert(err.message);
                  }
                }}
                className="btn btn-secondary btn-sm"
                style={{
                  marginTop: '8px',
                  width: '100%',
                  fontSize: '11px',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <ShoppingCart size={12} />
                <span>Add to Cart</span>
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll(300)}
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
            justifyContent: 'center',
            color: 'var(--text-main)'
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
