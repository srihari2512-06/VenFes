import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Star, ShieldCheck, Flag, ArrowLeft, ShoppingCart, Check, AlertCircle } from 'lucide-react';
import PriceHistoryChart from '../components/ui/PriceHistoryChart';
import PriceComparisonTable from '../components/ui/PriceComparisonTable';
import { addToBrowsingHistory } from '../utils/history';

export default function ProductDetail({ productId, onBack }) {
  const params = useParams();
  const navigate = useNavigate();
  const effectiveProductId = productId || params.id;
  const handleBack = onBack || (() => navigate(-1));

  const { addToCart } = useCart();
  const { user, token } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState('');

  // Review state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    if (effectiveProductId) {
      loadData();
    }
  }, [effectiveProductId]);

  async function loadData() {
    setLoading(true);
    try {
      const [prodRes, revRes] = await Promise.all([
        fetch(`/api/products/${effectiveProductId}`),
        fetch(`/api/engagement/reviews/${effectiveProductId}`)
      ]);
      const prodData = await prodRes.json();
      const revData = await revRes.json();

      if (prodData.success) {
        setProduct(prodData.data.product);
        addToBrowsingHistory(prodData.data.product);
        if (prodData.data.product.variants?.length > 0) {
          setSelectedVariant(prodData.data.product.variants[0]);
        }
      } else {
        setError(prodData.error?.message || 'Product not found');
      }

      if (revData.success) {
        setReviews(revData.data.reviews);
      }
    } catch {
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    try {
      await addToCart(product._id, selectedVariant?._id, quantity);
      setToast('Added to cart!');
      setTimeout(() => setToast(''), 2500);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleSubmitReview(e) {
    e.preventDefault();
    if (!token) return alert('Please log in to submit a review');
    setSubmittingReview(true);
    setReviewError('');
    try {
      const res = await fetch('/api/engagement/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          productId: product._id,
          rating: newRating,
          comment: newComment
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to submit review');
      }
      setToast('Review submitted!');
      setNewComment('');
      loadData();
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setSubmittingReview(false);
    }
  }

  async function handleFlag(targetId, targetType) {
    if (!token) return alert('Please log in to report content');
    const reason = prompt('Please specify why this content is being flagged for moderation:');
    if (!reason) return;
    try {
      const res = await fetch('/api/engagement/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetId, targetType, reason })
      });
      const data = await res.json();
      if (data.success) {
        alert('Thank you. Content flagged for administrative moderation.');
      }
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <div className="state-loading"><div className="spinner"></div><p>Loading product...</p></div>;
  if (error || !product) return <div className="state-error container" style={{ marginTop: '24px' }}>{error || 'Not found'}</div>;

  const currentPrice = selectedVariant?.price || product.price;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

  return (
    <div className="container" style={{ padding: '24px 16px' }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: 'var(--text-main)', color: '#fff', padding: '12px 20px', borderRadius: 'var(--radius)', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} color="var(--success)" />
          <span>{toast}</span>
        </div>
      )}

      <button onClick={handleBack} className="btn btn-secondary btn-sm" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '40px' }}>
        {/* Left: Product Image */}
        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '340px', backgroundColor: '#f8fafc' }}>
          {product.images && product.images[0] ? (
            <img src={product.images[0]} alt={product.name} style={{ maxWidth: '100%', maxHeight: '380px', objectFit: 'contain' }} />
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>No Image Provided</span>
          )}
        </div>

        {/* Right: Info & Purchase */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <span className="badge badge-placed" style={{ marginBottom: '8px' }}>{product.category}</span>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>{product.name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Sold by: <strong>{product.vendorId?.vendorProfile?.storeName || product.vendorId?.name || 'Verified Vendor'}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--primary)' }}>₹{currentPrice.toLocaleString()}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#b45309' }}>
              <Star size={16} fill="#f59e0b" color="#f59e0b" />
              <span>{product.averageRating > 0 ? product.averageRating : 'New'}</span>
              <span style={{ color: 'var(--text-muted)' }}>({product.numReviews} verified reviews)</span>
            </div>
          </div>

          <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)' }}>{product.description}</p>

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Select Variant:</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {product.variants.map((v) => (
                  <button
                    key={v._id}
                    onClick={() => setSelectedVariant(v)}
                    className={`btn btn-sm ${selectedVariant?._id === v._id ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {[v.size, v.color].filter(Boolean).join(' / ')} {v.price ? `(₹${v.price})` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock state */}
          <div style={{ fontSize: '14px' }}>
            Status: {currentStock > 0 ? (
              <span style={{ color: 'var(--success)', fontWeight: '600' }}>In Stock ({currentStock} units remaining)</span>
            ) : (
              <span style={{ color: 'var(--danger)', fontWeight: '600' }}>Out of Stock</span>
            )}
          </div>

          {/* Quantity & Buy */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '8px 12px', background: 'none' }}>-</button>
              <span style={{ padding: '8px 12px', minWidth: '32px', textAlign: 'center' }}>{quantity}</span>
              <button onClick={() => setQuantity(Math.min(currentStock, quantity + 1))} style={{ padding: '8px 12px', background: 'none' }}>+</button>
            </div>

            <button
              disabled={currentStock <= 0}
              onClick={handleAdd}
              className="btn btn-primary"
              style={{ flex: 1, padding: '12px' }}
            >
              <ShoppingCart size={18} />
              <span>{currentStock > 0 ? 'Add to Shopping Cart' : 'Sold Out'}</span>
            </button>
          </div>

          <button
            onClick={() => handleFlag(product._id, 'Product')}
            style={{ background: 'none', color: 'var(--text-muted)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', alignSelf: 'flex-start', marginTop: '8px' }}
          >
            <Flag size={12} /> Report product
          </button>
        </div>
      </div>

      {/* Multi-Store Competitor Price Comparison */}
      <PriceComparisonTable product={product} currentPrice={currentPrice} />

      {/* 60-Day Price Trend History Chart */}
      <PriceHistoryChart product={product} currentPrice={currentPrice} />

      {/* Verified Reviews Section (FR-31) */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Verified Purchase Customer Reviews</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Reviews are strictly restricted to verified buyers after order delivery (FR-31)</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={20} color="var(--success)" />
            <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--success)' }}>Verified Buyer Only</span>
          </div>
        </div>

        {/* Submit Review Form */}
        <form onSubmit={handleSubmitReview} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: 'var(--radius)', marginBottom: '24px' }}>
          <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Leave a verified review:</h4>
          {reviewError && (
            <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertCircle size={14} /> {reviewError}
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '13px' }}>Rating:</label>
            <select value={newRating} onChange={(e) => setNewRating(Number(e.target.value))}>
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Good</option>
              <option value="3">3 - Average</option>
              <option value="2">2 - Poor</option>
              <option value="1">1 - Terrible</option>
            </select>
          </div>
          <textarea
            placeholder="Write your detailed review about product quality, sizing, and vendor shipping..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{ width: '100%', minHeight: '60px', marginBottom: '8px' }}
          />
          <button type="submit" disabled={submittingReview} className="btn btn-primary btn-sm">
            {submittingReview ? 'Submitting...' : 'Post Verified Review'}
          </button>
        </form>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>
            No verified reviews for this product yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reviews.map((r) => (
              <div key={r._id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong>{r.customerId?.name || 'Customer'}</strong>
                    <div style={{ display: 'flex', color: '#f59e0b' }}>
                      {[...Array(r.rating)].map((_, i) => <Star key={i} size={14} fill="#f59e0b" />)}
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-main)' }}>{r.comment}</p>
                <button
                  onClick={() => handleFlag(r._id, 'Review')}
                  style={{ background: 'none', color: 'var(--text-muted)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}
                >
                  <Flag size={10} /> Report review
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
