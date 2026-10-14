import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Clock, X, ArrowRight, Tag } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

const RECENT_KEY = 'venfes_recent_searches';

export default function SearchBox({ className = '', style = {} }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [suggestions, setSuggestions] = useState({ products: [], categories: [], brands: [] });
  const [recentSearches, setRecentSearches] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);
  const debounceTimer = useRef(null);

  // Sync category or query from URL if on /products
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qParam = params.get('q');
    const catParam = params.get('category');
    if (qParam !== null) setQuery(qParam);
    if (catParam) setCategory(catParam);
  }, [location.search]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      }
    } catch {
      // safe fallback
    }
  }, []);

  function saveRecentSearch(term) {
    if (!term || !term.trim()) return;
    try {
      const trimmed = term.trim();
      const updated = [trimmed, ...recentSearches.filter(s => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch {
      // safe fallback
    }
  }

  function clearRecentSearches(e) {
    e.stopPropagation();
    try {
      setRecentSearches([]);
      localStorage.removeItem(RECENT_KEY);
    } catch {
      // safe fallback
    }
  }

  // Handle Debounced Suggestion Fetching
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions({ products: [], categories: [], brands: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/suggest?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (data.success) {
          setSuggestions(data.data);
          setActiveIndex(-1);
        }
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute total list items for keyboard navigation
  const isShowingRecent = query.trim().length < 2 && recentSearches.length > 0;
  const productList = suggestions.products || [];
  const categoryList = suggestions.categories || [];
  const brandList = suggestions.brands || [];

  const totalInteractiveItems = isShowingRecent
    ? recentSearches.length
    : productList.length + categoryList.length + brandList.length;

  function handleSubmit(e, directQuery = null, directCategory = null) {
    if (e) e.preventDefault();
    const finalQ = directQuery !== null ? directQuery : query;
    const finalCat = directCategory !== null ? directCategory : category;

    if (finalQ && finalQ.trim()) {
      saveRecentSearch(finalQ.trim());
    }

    setIsOpen(false);
    let targetUrl = `/products?`;
    const params = new URLSearchParams();
    if (finalQ && finalQ.trim()) params.set('q', finalQ.trim());
    if (finalCat && finalCat !== 'All') params.set('category', finalCat);

    navigate(`/products?${params.toString()}`);
  }

  function handleKeyDown(e) {
    if (!isOpen) {
      if (e.key === 'ArrowDown') setIsOpen(true);
      return;
    }

    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1 < totalInteractiveItems ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 >= 0 ? prev - 1 : totalInteractiveItems - 1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0) {
        e.preventDefault();
        if (isShowingRecent) {
          const selected = recentSearches[activeIndex];
          setQuery(selected);
          handleSubmit(null, selected);
        } else {
          // Select from products, categories, or brands
          if (activeIndex < productList.length) {
            const p = productList[activeIndex];
            setIsOpen(false);
            navigate(`/product/${p.id}`);
          } else if (activeIndex < productList.length + categoryList.length) {
            const cat = categoryList[activeIndex - productList.length];
            setCategory(cat);
            handleSubmit(null, query, cat);
          } else {
            const br = brandList[activeIndex - productList.length - categoryList.length];
            setIsOpen(false);
            navigate(`/products?brand=${encodeURIComponent(br)}`);
          }
        }
      } else {
        handleSubmit(e);
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className={`search-box-wrapper ${className}`.trim()}
      style={{ position: 'relative', width: '100%', maxWidth: '640px', ...style }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          alignItems: 'stretch',
          backgroundColor: 'var(--surface)',
          border: '2px solid var(--primary)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden'
        }}
      >
        {/* Category selector on left */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            backgroundColor: 'var(--secondary-light)',
            border: 'none',
            borderRight: '1px solid var(--border)',
            borderRadius: 0,
            fontSize: '13px',
            color: 'var(--text-main)',
            padding: '0 8px',
            cursor: 'pointer',
            maxWidth: '120px',
            outline: 'none'
          }}
          aria-label="Filter category"
        >
          <option value="All">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Footwear">Footwear</option>
          <option value="Clothing">Clothing</option>
          <option value="Books">Books</option>
          <option value="Accessories">Accessories</option>
        </select>

        {/* Search input */}
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search for products, brands, and categories..."
            style={{
              width: '100%',
              border: 'none',
              borderRadius: 0,
              padding: '10px 12px',
              fontSize: '14px',
              outline: 'none'
            }}
            aria-autocomplete="list"
            aria-expanded={isOpen}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions({ products: [], categories: [], brands: [] });
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px 8px',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
              aria-label="Clear search input"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Search submit button */}
        <button
          type="submit"
          style={{
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 0,
            padding: '0 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          aria-label="Submit search"
        >
          <Search size={18} />
        </button>
      </form>

      {/* Dropdown for suggestions and recent searches */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            maxHeight: '400px',
            overflowY: 'auto'
          }}
        >
          {/* Recent Searches */}
          {isShowingRecent && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  backgroundColor: 'var(--secondary-light)',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-muted)'
                }}
              >
                <span>Recent Searches</span>
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '11px' }}
                >
                  Clear All
                </button>
              </div>
              {recentSearches.map((term, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setQuery(term);
                    handleSubmit(null, term);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    cursor: 'pointer',
                    backgroundColor: activeIndex === idx ? 'var(--primary-light)' : 'transparent',
                    fontSize: '13px'
                  }}
                >
                  <Clock size={14} color="var(--text-muted)" />
                  <span>{term}</span>
                </div>
              ))}
            </div>
          )}

          {/* Product Suggestions */}
          {!isShowingRecent && productList.length > 0 && (
            <div style={{ borderBottom: '1px solid var(--border)' }}>
              <div style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Products
              </div>
              {productList.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setIsOpen(false);
                    saveRecentSearch(p.title);
                    navigate(`/product/${p.id}`);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 14px',
                    cursor: 'pointer',
                    backgroundColor: activeIndex === idx ? 'var(--primary-light)' : 'transparent'
                  }}
                >
                  <div style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                    {p.thumbnail ? (
                      <img src={p.thumbnail} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Search size={16} color="var(--text-muted)" />
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.title}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>
                      {formatINR(p.price)}
                    </div>
                  </div>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </div>
              ))}
            </div>
          )}

          {/* Category Suggestions */}
          {!isShowingRecent && categoryList.length > 0 && (
            <div style={{ borderBottom: '1px solid var(--border)', padding: '8px 12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Categories
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {categoryList.map((cat, idx) => {
                  const itemIndex = productList.length + idx;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setCategory(cat);
                        handleSubmit(null, query, cat);
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '16px',
                        border: '1px solid var(--border)',
                        backgroundColor: activeIndex === itemIndex ? 'var(--primary-light)' : 'var(--secondary-light)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Tag size={12} color="var(--primary)" />
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Brand Suggestions */}
          {!isShowingRecent && brandList.length > 0 && (
            <div style={{ padding: '8px 12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Brands
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {brandList.map((br, idx) => {
                  const itemIndex = productList.length + categoryList.length + idx;
                  return (
                    <button
                      key={br}
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        navigate(`/products?brand=${encodeURIComponent(br)}`);
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '16px',
                        border: '1px solid var(--border)',
                        backgroundColor: activeIndex === itemIndex ? 'var(--primary-light)' : 'var(--surface)',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {br}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State when no results found */}
          {!isShowingRecent && query.trim().length >= 2 && !loading && productList.length === 0 && categoryList.length === 0 && brandList.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No matches found for "{query}". Press Enter to search all products.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
