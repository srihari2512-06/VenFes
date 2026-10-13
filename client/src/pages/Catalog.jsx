import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Search, Heart, Star, AlertTriangle, Check, ShoppingCart } from 'lucide-react';

export default function Catalog({ onSelectProduct }) {
  const { addToCart } = useCart();
  const { user, token } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All', 'Electronics', 'Footwear', 'Clothing', 'Books', 'Accessories']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVariants, setSelectedVariants] = useState({});
  const [addingId, setAddingId] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, search]);

  async function fetchProducts() {
    setLoading(true);
    setError('');
    try {
      let url = '/api/products?limit=24';
      if (selectedCategory !== 'All') {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data.products);
      } else {
        setError(data.error?.message || 'Failed to load products');
      }
    } catch (err) {
      setError('Network error loading products');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToCart(product, e) {
    e.stopPropagation();
    const variantId = selectedVariants[product._id] || (product.variants?.[0]?._id ?? null);
    setAddingId(product._id);
    try {
      await addToCart(product._id, variantId, 1);
      setToast(`Added "${product.name}" to cart!`);
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setAddingId(null);
    }
  }

  async function handleToggleWishlist(productId, e) {
    e.stopPropagation();
    if (!token) {
      alert('Please sign in to save items to your wishlist');
      return;
    }
    try {
      const res = await fetch('/api/engagement/wishlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      if (data.success) {
        setToast(data.data.inWishlist ? 'Saved to Wishlist!' : 'Removed from Wishlist');
        setTimeout(() => setToast(''), 2500);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="container" style={{ padding: '24px 16px' }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: 'var(--text-main)', color: '#fff', padding: '12px 20px', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} color="var(--success)" />
          <span>{toast}</span>
        </div>
      )}

      {/* Hero / Filter Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Multi-Vendor Storefront</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Browse products from independent verified sellers in one checkout</p>
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search products or descriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '38px' }}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '9999px', padding: '6px 14px' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State (NFR-12) */}
      {loading && (
        <div className="state-loading">
          <div className="spinner"></div>
          <p>Loading marketplace catalog...</p>
        </div>
      )}

      {/* Error State (NFR-12) */}
      {!loading && error && (
        <div className="state-error">
          <p><strong>Error:</strong> {error}</p>
          <button onClick={fetchProducts} className="btn btn-secondary btn-sm" style={{ marginTop: '8px' }}>Retry</button>
        </div>
      )}

      {/* Empty State (NFR-12) */}
      {!loading && !error && products.length === 0 && (
        <div className="state-empty card">
          <h3>No products found</h3>
          <p>Try clearing your search query or choosing another category.</p>
        </div>
      )}

      {/* Product Grid */}
      {!loading && !error && products.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
          {products.map((p) => {
            const hasVariants = p.variants && p.variants.length > 0;
            const isLowStock = p.stock > 0 && p.stock <= (p.lowStockThreshold || 5);
            const isOutOfStock = p.stock <= 0;

            return (
              <div
                key={p._id}
                className="card"
                onClick={() => onSelectProduct(p._id)}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.15s, box-shadow 0.15s'
                }}
              >
                <div>
                  {/* Thumbnail / Placeholder */}
                  <div style={{ position: 'relative', width: '100%', height: '180px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                    {p.images && p.images[0] ? (
                      <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                        <span>No Image</span>
                      </div>
                    )}
                    <button
                      onClick={(e) => handleToggleWishlist(p._id, e)}
                      style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}
                      title="Add to Wishlist"
                    >
                      <Heart size={16} color="var(--danger)" />
                    </button>
                  </div>

                  {/* Category and Store */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span>{p.category}</span>
                    <span>By: {p.vendorId?.vendorProfile?.storeName || p.vendorId?.name || 'Vendor'}</span>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '6px', lineHeight: '1.3' }}>
                    {p.name}
                  </h3>

                  {/* Rating */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#b45309', marginBottom: '8px' }}>
                    <Star size={14} fill="#f59e0b" color="#f59e0b" />
                    <span>{p.averageRating > 0 ? p.averageRating : 'New'}</span>
                    {p.numReviews > 0 && <span style={{ color: 'var(--text-muted)' }}>({p.numReviews})</span>}
                  </div>

                  {/* Price & Stock Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                      ₹{p.price.toLocaleString()}
                    </span>
                    {isOutOfStock ? (
                      <span className="badge badge-rejected">Out of stock</span>
                    ) : isLowStock ? (
                      <span className="badge badge-pending" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <AlertTriangle size={12} /> Only {p.stock} left
                      </span>
                    ) : (
                      <span className="badge badge-approved">In stock</span>
                    )}
                  </div>

                  {/* Variant Selector (FR-30) */}
                  {hasVariants && (
                    <div style={{ marginBottom: '12px' }} onClick={(e) => e.stopPropagation()}>
                      <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Select Variant:</label>
                      <select
                        value={selectedVariants[p._id] || p.variants[0]._id}
                        onChange={(e) => setSelectedVariants({ ...selectedVariants, [p._id]: e.target.value })}
                        style={{ width: '100%', fontSize: '13px' }}
                      >
                        {p.variants.map((v) => (
                          <option key={v._id} value={v._id}>
                            {[v.size, v.color].filter(Boolean).join(' / ')} {v.price ? `(₹${v.price})` : ''} - {v.stock} in stock
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Add to Cart button */}
                <button
                  disabled={isOutOfStock || addingId === p._id}
                  onClick={(e) => handleAddToCart(p, e)}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  <ShoppingCart size={16} />
                  <span>{isOutOfStock ? 'Sold Out' : addingId === p._id ? 'Adding...' : 'Add to Cart'}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
