import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Search, Heart, Star, AlertTriangle, Check, ShoppingCart } from 'lucide-react';
import { fetchWithCache, getCachedData } from '../utils/apiCache';
import { SkeletonCard } from '../components/ui/Skeleton';

export default function Catalog({ onSelectProduct, initialVendorId }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { token } = useAuth();

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const urlCategory = searchParams.get('category') || 'All';
  const urlSearch = searchParams.get('q') || searchParams.get('search') || '';

  const buildUrl = useCallback((cat, q) => {
    let url = '/api/products?limit=24';
    if (initialVendorId) url += `&vendorId=${encodeURIComponent(initialVendorId)}`;
    if (cat && cat !== 'All') url += `&category=${encodeURIComponent(cat)}`;
    if (q && q.trim()) url += `&search=${encodeURIComponent(q.trim())}`;
    return url;
  }, [initialVendorId]);

  const activeUrl = useMemo(() => buildUrl(urlCategory, urlSearch), [buildUrl, urlCategory, urlSearch]);

  // Synchronous cache read for instant rendering on navigation
  const [products, setProducts] = useState(() => {
    const cached = getCachedData(activeUrl);
    return cached?.data?.products || [];
  });

  const categories = useMemo(() => [
    'All', 'Electronics', 'Footwear', 'Clothing', 'Books', 'Accessories', 'Home & Kitchen'
  ], []);

  const [search, setSearch] = useState(urlSearch);
  const [loading, setLoading] = useState(() => !getCachedData(activeUrl));
  const [error, setError] = useState('');
  const [selectedVariants, setSelectedVariants] = useState({});
  const [addingId, setAddingId] = useState(null);
  const [toast, setToast] = useState('');

  // Sync internal search input with URL search param
  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  // Data fetching effect with caching and zero layout flicker
  useEffect(() => {
    let isMounted = true;
    const cached = getCachedData(activeUrl);

    if (cached?.data?.products) {
      setProducts(cached.data.products);
      setLoading(false);
      setError('');
    } else {
      setLoading(true);
      setError('');
    }

    fetchWithCache(activeUrl)
      .then((data) => {
        if (!isMounted) return;
        if (data.success) {
          setProducts(data.data.products);
          setError('');
        } else {
          setError(data.error?.message || 'Failed to load products');
        }
      })
      .catch(() => {
        if (isMounted) setError('Network error loading products');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeUrl]);

  function handleCategoryClick(cat) {
    const params = new URLSearchParams(location.search);
    if (cat === 'All') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    const newQuery = params.toString();
    navigate(`/products${newQuery ? `?${newQuery}` : ''}`);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams(location.search);
    if (search.trim()) {
      params.set('q', search.trim());
    } else {
      params.delete('q');
      params.delete('search');
    }
    const newQuery = params.toString();
    navigate(`/products${newQuery ? `?${newQuery}` : ''}`);
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
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search products or descriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '38px' }}
            />
          </form>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`btn btn-sm ${urlCategory.toLowerCase() === cat.toLowerCase() ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '9999px', padding: '6px 14px' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeletons when no products in cache */}
      {loading && products.length === 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
          {Array.from({ length: 8 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="state-error">
          <p><strong>Error:</strong> {error}</p>
          <button onClick={() => navigate(0)} className="btn btn-secondary btn-sm" style={{ marginTop: '8px' }}>Retry</button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="state-empty card">
          <h3>No products found</h3>
          <p>Try clearing your search query or choosing another category.</p>
        </div>
      )}

      {/* Product Grid */}
      {products.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
          {products.map((p) => {
            const hasVariants = p.variants && p.variants.length > 0;
            const isLowStock = p.stock > 0 && p.stock <= (p.lowStockThreshold || 5);
            const isOutOfStock = p.stock <= 0;

            return (
              <div
                key={p._id}
                className="card"
                onClick={() => {
                  if (onSelectProduct) onSelectProduct(p._id);
                  else navigate(`/product/${p._id}`);
                }}
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
