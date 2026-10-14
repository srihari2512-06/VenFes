import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroCarousel from '../components/Home/HeroCarousel';
import AmazonFeatureCards from '../components/Home/AmazonFeatureCards';
import ProductRow from '../components/Home/ProductRow';
import PriceComparisonRow from '../components/Home/PriceComparisonRow';
import BrowsingHistoryRow from '../components/Home/BrowsingHistoryRow';
import SellerRow from '../components/Home/SellerRow';
import { fetchWithCache, getCachedData } from '../utils/apiCache';
import {
  Headphones,
  Shirt,
  Footprints,
  BookOpen,
  Briefcase,
  UtensilsCrossed,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard
} from 'lucide-react';

const CATEGORY_ICONS = {
  Electronics: Headphones,
  Footwear: Footprints,
  Clothing: Shirt,
  Accessories: Briefcase,
  Books: BookOpen,
  'Home & Kitchen': UtensilsCrossed
};

const URL_DEALS = '/api/products?sort=discount&minDiscount=15&limit=12';
const URL_TOP_RATED = '/api/products?sort=rating&limit=12';
const URL_NEW_ARRIVALS = '/api/products?sort=newest&limit=12';
const URL_BUDGET = '/api/products?maxPrice=2500&limit=12';
const URL_FACETS = '/api/products?limit=1';

export default function HomePage() {
  // Row 1: Deals (with synchronous cache read to eliminate skeleton flashing)
  const [deals, setDeals] = useState(() => {
    const cached = getCachedData(URL_DEALS);
    return { data: cached?.data?.products || [], loading: !cached, error: null };
  });

  // Row 2: Top Rated
  const [topRated, setTopRated] = useState(() => {
    const cached = getCachedData(URL_TOP_RATED);
    return { data: cached?.data?.products || [], loading: !cached, error: null };
  });

  // Row 3: New Arrivals
  const [newArrivals, setNewArrivals] = useState(() => {
    const cached = getCachedData(URL_NEW_ARRIVALS);
    return { data: cached?.data?.products || [], loading: !cached, error: null };
  });

  // Row 4: Budget Picks (under ₹2500)
  const [budgetPicks, setBudgetPicks] = useState(() => {
    const cached = getCachedData(URL_BUDGET);
    return { data: cached?.data?.products || [], loading: !cached, error: null };
  });

  // Stores and Category Facets
  const [facets, setFacets] = useState(() => {
    const cached = getCachedData(URL_FACETS);
    return {
      stores: cached?.data?.facets?.stores || [],
      categories: cached?.data?.facets?.categories || []
    };
  });
  const [facetsLoading, setFacetsLoading] = useState(() => !getCachedData(URL_FACETS));

  useEffect(() => {
    loadDeals();
    loadTopRated();
    loadNewArrivals();
    loadBudgetPicks();
    loadFacets();
  }, []);

  async function loadDeals() {
    try {
      const json = await fetchWithCache(URL_DEALS);
      if (json.success) {
        setDeals({ data: json.data.products, loading: false, error: null });
      } else {
        setDeals(prev => ({ ...prev, loading: false, error: json.error?.message || 'Failed to load deals' }));
      }
    } catch {
      setDeals(prev => ({ ...prev, loading: false, error: 'Network error loading deals' }));
    }
  }

  async function loadTopRated() {
    try {
      const json = await fetchWithCache(URL_TOP_RATED);
      if (json.success) {
        setTopRated({ data: json.data.products, loading: false, error: null });
      } else {
        setTopRated(prev => ({ ...prev, loading: false, error: json.error?.message || 'Failed to load top rated' }));
      }
    } catch {
      setTopRated(prev => ({ ...prev, loading: false, error: 'Network error loading top rated' }));
    }
  }

  async function loadNewArrivals() {
    try {
      const json = await fetchWithCache(URL_NEW_ARRIVALS);
      if (json.success) {
        setNewArrivals({ data: json.data.products, loading: false, error: null });
      } else {
        setNewArrivals(prev => ({ ...prev, loading: false, error: json.error?.message || 'Failed to load new arrivals' }));
      }
    } catch {
      setNewArrivals(prev => ({ ...prev, loading: false, error: 'Network error loading new arrivals' }));
    }
  }

  async function loadBudgetPicks() {
    try {
      const json = await fetchWithCache(URL_BUDGET);
      if (json.success) {
        setBudgetPicks({ data: json.data.products, loading: false, error: null });
      } else {
        setBudgetPicks(prev => ({ ...prev, loading: false, error: json.error?.message || 'Failed to load budget picks' }));
      }
    } catch {
      setBudgetPicks(prev => ({ ...prev, loading: false, error: 'Network error loading budget picks' }));
    }
  }

  async function loadFacets() {
    try {
      const json = await fetchWithCache(URL_FACETS);
      if (json.success && json.data.facets) {
        setFacets({
          stores: json.data.facets.stores || [],
          categories: json.data.facets.categories || []
        });
      }
    } catch {
      // safe fallback
    } finally {
      setFacetsLoading(false);
    }
  }

  return (
    <div style={{ paddingBottom: '48px' }}>
      <div className="container" style={{ paddingTop: '16px' }}>
        {/* 1. Amazon-Style Hero Carousel */}
        <HeroCarousel
          dealsProducts={deals.data}
          newArrivals={newArrivals.data}
          topRated={topRated.data}
        />

        {/* 2. Signature Amazon 4-Card Feature Grid */}
        <AmazonFeatureCards products={deals.data.concat(newArrivals.data)} />

        {/* 3. Product Row: Deals of the Day with High Discounts */}
        <ProductRow
          title="🔥 Deals of the Day"
          subtitle="Highest discount percentages on verified marketplace products"
          viewAllLink="/products?sort=discount&minDiscount=15"
          products={deals.data}
          loading={deals.loading}
          error={deals.error}
          onRetry={loadDeals}
        />

        {/* 4. Best Price Guarantee: Venfes vs Other Websites (Amazon, Flipkart) */}
        <PriceComparisonRow products={deals.data} loading={deals.loading} />

        {/* 5. Popular Categories Showcase */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-main)' }}>
              Explore Popular Marketplace Categories
            </h2>
            <Link to="/products" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600' }}>
              All 6 Categories →
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px'
            }}
          >
            {['Electronics', 'Footwear', 'Clothing', 'Accessories', 'Books', 'Home & Kitchen'].map((cat) => {
              const IconComponent = CATEGORY_ICONS[cat] || Sparkles;

              return (
                <Link
                  key={cat}
                  to={`/products?category=${encodeURIComponent(cat)}`}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '18px 12px',
                    textAlign: 'center',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                  }}
                >
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '10px'
                    }}
                  >
                    <IconComponent size={24} />
                  </div>
                  <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{cat}</strong>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 6. Product Row: Top Rated Customer Favorites */}
        <ProductRow
          title="⭐ Top Rated Products"
          subtitle="Highest reviewed items backed by authentic customer ratings"
          viewAllLink="/products?sort=rating&minRating=4"
          products={topRated.data}
          loading={topRated.loading}
          error={topRated.error}
          onRetry={loadTopRated}
        />

        {/* 7. Product Row: New Arrivals */}
        <ProductRow
          title="✨ Fresh Catalog Drops & New Arrivals"
          subtitle="Recently listed products from independent makers and artisanal creators"
          viewAllLink="/products?sort=newest"
          products={newArrivals.data}
          loading={newArrivals.loading}
          error={newArrivals.error}
          onRetry={loadNewArrivals}
        />

        {/* 8. Product Row: Under ₹2,499 / Budget Finds */}
        <ProductRow
          title="🏷️ Affordable Finds Under ₹2,499"
          subtitle="Quality essentials that deliver high value without breaking the bank"
          viewAllLink="/products?maxPrice=2500"
          products={budgetPicks.data}
          loading={budgetPicks.loading}
          error={budgetPicks.error}
          onRetry={loadBudgetPicks}
        />

        {/* 9. Your Browsing History (Persisted & Dynamic) */}
        <BrowsingHistoryRow />

        {/* 10. Approved Sellers Showcase */}
        <SellerRow
          stores={facets.stores}
          loading={facetsLoading}
        />

        {/* 11. Amazon-Style Trust & Security Banner */}
        <div
          className="card"
          style={{
            marginTop: '32px',
            padding: '24px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            textAlign: 'center'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Truck size={28} color="var(--primary)" style={{ marginBottom: '8px' }} />
            <strong style={{ fontSize: '14px', marginBottom: '2px' }}>Fast Delivery</strong>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Reliable carrier delivery across all pin codes</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <RotateCcw size={28} color="var(--primary)" style={{ marginBottom: '8px' }} />
            <strong style={{ fontSize: '14px', marginBottom: '2px' }}>7-Day Replacement</strong>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Easy returns & refunds on damaged items</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CreditCard size={28} color="var(--primary)" style={{ marginBottom: '8px' }} />
            <strong style={{ fontSize: '14px', marginBottom: '2px' }}>100% Secure Checkout</strong>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Razorpay test gateway with atomic stock hold</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ShieldCheck size={28} color="var(--green)" style={{ marginBottom: '8px' }} />
            <strong style={{ fontSize: '14px', marginBottom: '2px' }}>Vetted Independent Vendors</strong>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Admin approved KYC for genuine creators</span>
          </div>
        </div>
      </div>
    </div>
  );
}
