import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingCart, Star, Clock, ArrowRight, EyeOff } from 'lucide-react';
import { getBrowsingHistory, removeFromBrowsingHistory, clearBrowsingHistory } from '../utils/history';
import { useCart } from '../context/CartContext';
import PriceBlock from '../components/ui/PriceBlock';
import RatingChip from '../components/ui/RatingChip';

export default function BrowsingHistoryPage() {
  const [history, setHistory] = useState([]);
  const { addToCart } = useCart();
  const [toast, setToast] = useState('');

  useEffect(() => {
    setHistory(getBrowsingHistory());
  }, []);

  function handleRemove(id, e) {
    e.preventDefault();
    e.stopPropagation();
    const updated = removeFromBrowsingHistory(id);
    setHistory(updated);
  }

  function handleClear() {
    if (window.confirm('Clear all items from your browsing history?')) {
      clearBrowsingHistory();
      setHistory([]);
    }
  }

  async function handleAddToCart(item, e) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(item._id, null, 1);
      setToast(`Added ${item.name} to cart!`);
      setTimeout(() => setToast(''), 2500);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="container" style={{ padding: '32px 16px', maxWidth: '1180px' }}>
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: 'var(--text-main)',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 'var(--radius)',
            zIndex: 1000,
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="var(--primary)" />
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)' }}>
              Your Browsing History
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Recently viewed products during your shopping session
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--danger)' }}
          >
            <Trash2 size={14} />
            <span>Clear Browsing History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--surface)'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--surface-alt)',
              color: 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}
          >
            <EyeOff size={32} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '6px' }}>
            Your Browsing History is Empty
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px', lineHeight: '1.5' }}>
            As you browse products on Venfes, items you look at will be saved here so you can easily compare, revisit, and purchase them later.
          </p>
          <Link to="/products" className="btn btn-primary" style={{ padding: '10px 20px', fontWeight: '600' }}>
            Explore Marketplace Catalog →
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '16px'
          }}
        >
          {history.map((item) => (
            <div
              key={item._id}
              className="card"
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '14px',
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              {/* Remove cross button */}
              <button
                onClick={(e) => handleRemove(item._id, e)}
                title="Remove from history"
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  border: 'none',
                  zIndex: 2
                }}
              >
                ✕
              </button>

              <Link to={`/product/${item._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div
                  style={{
                    height: '160px',
                    backgroundColor: '#f8fafc',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '10px'
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
                    color: 'var(--text-main)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '36px',
                    lineHeight: '1.3'
                  }}
                >
                  {item.name}
                </strong>

                {item.averageRating > 0 && (
                  <div style={{ marginTop: '6px' }}>
                    <RatingChip rating={item.averageRating} count={item.numReviews} />
                  </div>
                )}

                <div style={{ marginTop: '8px', marginBottom: '12px' }}>
                  <PriceBlock price={item.price} mrp={item.mrp} />
                </div>
              </Link>

              <button
                onClick={(e) => handleAddToCart(item, e)}
                className="btn btn-primary btn-sm"
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <ShoppingCart size={14} />
                <span>Add to Cart</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
