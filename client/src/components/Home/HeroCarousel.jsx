import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';

export default function HeroCarousel({ dealsProducts = [], newArrivals = [], topRated = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);

  // 3 Slides built from real API collections
  const slides = [
    {
      id: 'deals',
      tag: 'Deals of the Season',
      title: 'Mega Marketplace Discounts',
      description: 'Save up to 40% on top audio gear, footwear, and essentials from verified sellers.',
      link: '/products?minDiscount=20',
      buttonText: 'Shop Deals',
      accentColor: 'var(--accent)',
      images: dealsProducts.slice(0, 3).map(p => p.images?.[0]).filter(Boolean)
    },
    {
      id: 'new',
      tag: 'Fresh Catalog Drops',
      title: 'Discover New Arrivals',
      description: 'Explore the latest handcrafted gear, ergonomic accessories, and streetwear.',
      link: '/products?sort=newest',
      buttonText: 'Browse Newest',
      accentColor: 'var(--primary)',
      images: newArrivals.slice(0, 3).map(p => p.images?.[0]).filter(Boolean)
    },
    {
      id: 'top-rated',
      tag: 'Customer Favorites',
      title: 'Highest Rated by Shoppers',
      description: 'Authentic 4★ and 5★ verified purchases backed by real community reviews.',
      link: '/products?sort=rating&minRating=4',
      buttonText: 'Explore Top Rated',
      accentColor: 'var(--green)',
      images: topRated.slice(0, 3).map(p => p.images?.[0]).filter(Boolean)
    },
    {
      id: 'coupons',
      tag: 'Instant Savings Vouchers',
      title: 'Collect Promo Coupons',
      description: 'Claim exclusive codes like FESTIVE20 and WELCOME50 for instant discounts at checkout.',
      link: '/coupons',
      buttonText: 'Claim Coupons',
      accentColor: '#ec4899',
      images: ['https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80']
    },
    {
      id: 'giftcards',
      tag: 'Gifting Made Easy',
      title: 'Venfes Digital Gift Cards',
      description: 'Give the gift of choice for any celebration with instant digital delivery and wallet redemption.',
      link: '/gift-cards',
      buttonText: 'Buy Gift Card',
      accentColor: '#10b981',
      images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80']
    }
  ];

  // Auto-advance every 6 seconds, respecting prefers-reduced-motion and hover/focus pause
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (diff > 50) {
      // Swiped left -> next
      setCurrentSlide(prev => (prev + 1) % slides.length);
    } else if (diff < -50) {
      // Swiped right -> prev
      setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
    }
    touchStartX.current = null;
  }

  const active = slides[currentSlide];

  return (
    <div
      className="hero-carousel-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'relative',
        backgroundColor: '#0f172a',
        color: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        marginBottom: '32px'
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          alignItems: 'center',
          gap: '24px',
          padding: '40px 32px',
          minHeight: '340px'
        }}
      >
        {/* Left Column: Heading, description, CTA */}
        <div style={{ zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              color: active.accentColor,
              marginBottom: '16px'
            }}
          >
            <Sparkles size={14} />
            <span>{active.tag}</span>
          </div>

          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '800', lineHeight: 1.2, marginBottom: '12px', color: '#ffffff' }}>
            {active.title}
          </h2>

          <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '440px', marginBottom: '24px', lineHeight: 1.5 }}>
            {active.description}
          </p>

          <Link
            to={active.link}
            className="btn btn-accent btn-md"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
            }}
          >
            <span>{active.buttonText}</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Right Column: Collage of real product images from API */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            position: 'relative'
          }}
        >
          {active.images.length > 0 ? (
            active.images.map((imgUrl, idx) => (
              <div
                key={idx}
                style={{
                  width: idx === 1 ? '160px' : '130px',
                  height: idx === 1 ? '200px' : '160px',
                  borderRadius: 'var(--radius)',
                  backgroundColor: '#ffffff',
                  padding: '6px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  transform: idx === 0 ? 'rotate(-6deg)' : idx === 2 ? 'rotate(6deg)' : 'none',
                  transition: 'transform 0.3s ease',
                  flexShrink: 0
                }}
              >
                <img
                  src={imgUrl}
                  alt="Product preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                />
              </div>
            ))
          ) : (
            <div style={{ width: '160px', height: '180px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <span>Catalog items</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        type="button"
        onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)}
        style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          color: '#ffffff',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10
        }}
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        type="button"
        onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
        style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          color: '#ffffff',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10
        }}
        aria-label="Next slide"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots Indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '8px',
          zIndex: 10
        }}
      >
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentSlide(idx)}
            style={{
              width: currentSlide === idx ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              backgroundColor: currentSlide === idx ? active.accentColor : 'rgba(255,255,255,0.3)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
