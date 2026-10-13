import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';

export default function WishlistPage({ onSelectProduct }) {
  const { token } = useAuth();
  const { addToCart } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  async function fetchWishlist() {
    setLoading(true);
    try {
      const res = await fetch('/api/engagement/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.data.wishlist.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(productId) {
    try {
      await fetch('/api/engagement/wishlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId })
      });
      setItems(items.filter((i) => i._id !== productId));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleMoveToCart(item) {
    try {
      await addToCart(item._id, null, 1);
      await handleRemove(item._id);
      alert('Moved to cart!');
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <div className="state-loading"><div className="spinner"></div><p>Loading wishlist...</p></div>;

  return (
    <div className="container" style={{ padding: '24px 16px', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>My Saved Wishlist</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Items you've bookmarked to purchase later</p>

      {items.length === 0 ? (
        <div className="card state-empty">
          <Heart size={48} style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
          <h3>Your wishlist is empty</h3>
          <p>Click the heart icon on any product in the catalog to save it here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((item) => (
            <div key={item._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => onSelectProduct(item._id)}>
                <div style={{ width: '64px', height: '64px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  {item.images?.[0] ? <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '600' }}>{item.name}</h4>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.category}</span>
                  <div style={{ fontWeight: 'bold', marginTop: '4px' }}>₹{item.price}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => handleMoveToCart(item)} className="btn btn-primary btn-sm">
                  <ShoppingCart size={14} /> Add to Cart
                </button>
                <button onClick={() => handleRemove(item._id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
