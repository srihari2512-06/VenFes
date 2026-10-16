import React, { useMemo, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchWithCache, getCachedData } from '../../utils/apiCache';

export const DEFAULT_CATEGORIES = [
  { label: 'Welcome', path: '/welcome', key: 'welcome' },
  { label: 'All Products', path: '/products', key: 'all' },
  { label: 'Electronics', path: '/products?category=Electronics', key: 'electronics' },
  { label: 'Footwear', path: '/products?category=Footwear', key: 'footwear' },
  { label: 'Clothing', path: '/products?category=Clothing', key: 'clothing' },
  { label: 'Accessories', path: '/products?category=Accessories', key: 'accessories' },
  { label: 'Books', path: '/products?category=Books', key: 'books' },
  { label: 'Home & Kitchen', path: '/products?category=Home%20%26%20Kitchen', key: 'home & kitchen' },
  { label: 'Coupons', path: '/coupons', key: 'coupons', highlight: true },
  { label: 'Gift Cards', path: '/gift-cards', key: 'gift-cards', highlight: true },
  { label: 'Live Tracking', path: '/track', key: 'track', highlight: true },
  { label: 'Browsing History', path: '/history', key: 'history' }
];

// Memoized single category link item to avoid unnecessary re-renders
const CategoryNavItem = React.memo(function CategoryNavItem({ cat, isActive }) {
  return (
    <Link
      to={cat.path}
      style={{
        padding: '6px 12px',
        fontSize: '13px',
        fontWeight: isActive ? '700' : '500',
        color: isActive ? 'var(--primary)' : 'var(--text-main)',
        borderRadius: 'var(--radius)',
        backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
        textDecoration: 'none',
        flexShrink: 0,
        transition: 'background-color 0.12s ease, color 0.12s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}
    >
      {cat.label}
    </Link>
  );
});

function CategoryNavStripComponent({ isVisible = true }) {
  const location = useLocation();

  // Load initial categories synchronously from cache or fallback to static defaults
  const [categories, setCategories] = useState(() => {
    const cached = getCachedData('/api/products?limit=1');
    if (cached?.data?.facets?.categories?.length) {
      const dynamicCats = cached.data.facets.categories.map((c) => ({
        label: c.value,
        path: `/products?category=${encodeURIComponent(c.value)}`,
        key: c.value.toLowerCase()
      }));
      const welcomeLink = DEFAULT_CATEGORIES.find((c) => c.key === 'welcome');
      const staticFeatureLinks = DEFAULT_CATEGORIES.filter((c) => c.highlight || c.key === 'history');
      return [welcomeLink, { label: 'All Products', path: '/products', key: 'all' }, ...dynamicCats, ...staticFeatureLinks].filter(Boolean);
    }
    return DEFAULT_CATEGORIES;
  });

  // Cached, single-invocation fetch for facets/categories on mount
  useEffect(() => {
    let isMounted = true;
    fetchWithCache('/api/products?limit=1')
      .then((json) => {
        if (!isMounted) return;
        if (json?.success && json.data?.facets?.categories?.length) {
          const dynamicCats = json.data.facets.categories.map((c) => ({
            label: c.value,
            path: `/products?category=${encodeURIComponent(c.value)}`,
            key: c.value.toLowerCase()
          }));
          const welcomeLink = DEFAULT_CATEGORIES.find((c) => c.key === 'welcome');
          const staticFeatureLinks = DEFAULT_CATEGORIES.filter((c) => c.highlight || c.key === 'history');
          setCategories([welcomeLink, { label: 'All Products', path: '/products', key: 'all' }, ...dynamicCats, ...staticFeatureLinks].filter(Boolean));
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array ensures no repeated fetches on render or route change

  // Memoize the active category calculation once per location change
  const activeKey = useMemo(() => {
    const pathname = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    const categoryQuery = searchParams.get('category')?.toLowerCase();

    if (pathname === '/welcome') return 'welcome';
    if (pathname === '/coupons') return 'coupons';
    if (pathname === '/gift-cards') return 'gift-cards';
    if (pathname === '/track') return 'track';
    if (pathname === '/history') return 'history';
    if (pathname === '/products') {
      return categoryQuery || 'all';
    }
    return '';
  }, [location.pathname, location.search]);

  // Memoize rendered category items to avoid recreating DOM elements on unrelated state changes
  const renderedItems = useMemo(() => {
    return categories.map((cat) => (
      <CategoryNavItem
        key={cat.key}
        cat={cat}
        isActive={activeKey === cat.key}
      />
    ));
  }, [categories, activeKey]);

  return (
    <nav
      aria-label="Category and features navigation"
      style={{
        backgroundColor: 'var(--surface-alt)',
        borderBottom: '1px solid var(--border)',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        display: isVisible ? 'block' : 'none',
        contain: 'layout style paint'
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '6px 16px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {renderedItems}
      </div>
    </nav>
  );
}

// React.memo prevents re-rendering CategoryNavStrip when parent Header re-renders on typing in search, pincode modal open, etc.
export const CategoryNavStrip = React.memo(CategoryNavStripComponent);
export default CategoryNavStrip;
