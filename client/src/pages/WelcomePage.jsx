import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Store,
  Shield,
  Layers,
  MapPin,
  CreditCard,
  TrendingUp,
  Database,
  ArrowRight,
  CheckCircle2,
  Users,
  Sparkles,
  Zap
} from 'lucide-react';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  async function handleQuickLogin(email, password, redirectPath) {
    try {
      await login(email, password);
      navigate(redirectPath);
    } catch (err) {
      navigate('/login');
    }
  }

  return (
    <div style={{ backgroundColor: 'var(--surface-alt)', minHeight: 'calc(100vh - 65px)', paddingBottom: '60px' }}>
      {/* Hero Welcome Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
          color: '#ffffff',
          padding: '64px 20px 54px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="container" style={{ maxWidth: '920px', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '9999px',
              padding: '6px 16px',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '20px',
              backdropFilter: 'blur(8px)'
            }}
          >
            <Sparkles size={16} color="#38bdf8" />
            <span>MERN Multi-Vendor E-Commerce Platform with Live Analytics</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(28px, 5vw, 46px)',
              fontWeight: '800',
              lineHeight: '1.2',
              letterSpacing: '-1px',
              marginBottom: '18px'
            }}
          >
            Welcome to <span style={{ color: '#38bdf8' }}>Venfes</span> Marketplace
          </h1>

          <p
            style={{
              fontSize: 'clamp(15px, 2vw, 18px)',
              color: '#cbd5e1',
              maxWidth: '740px',
              margin: '0 auto 32px',
              lineHeight: '1.6'
            }}
          >
            A high-performance online marketplace where independent vendors run independent storefronts
            under a unified shopping cart, powered by atomic MongoDB transactions, aggregation analytics,
            interactive live order map tracking, and versatile payment options.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link
              to="/products"
              className="btn btn-primary"
              style={{ padding: '14px 28px', fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <ShoppingBag size={18} />
              <span>Explore Marketplace Catalog</span>
            </Link>

            <Link
              to="/track"
              className="btn btn-secondary"
              style={{ padding: '14px 28px', fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              <MapPin size={18} />
              <span>Live Order Map Tracking</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Core Roles Quick-Launchpad */}
      <section className="container" style={{ marginTop: '-32px', position: 'relative', zIndex: 3, maxWidth: '1080px', padding: '0 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {/* Card 1: Shopper Portal */}
          <div
            className="card"
            style={{
              padding: '28px 24px',
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}
              >
                <ShoppingBag size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Customer Storefront</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>
                Browse 33+ real products from verified vendors. Unified cart, coupons, gift cards, and payments via UPI, Cards, or COD.
              </p>
              <ul style={{ fontSize: '12px', color: 'var(--text-main)', paddingLeft: '18px', marginBottom: '20px', lineHeight: '1.8' }}>
                <li>Multi-vendor atomic checkout</li>
                <li>Instant UPI QR & Card verification</li>
                <li>Live GPS vehicle order map tracking</li>
              </ul>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => handleQuickLogin('customer@venfes.com', 'customer123', '/products')}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                1-Click Sign In as Customer
              </button>
              <Link to="/products" style={{ textAlign: 'center', fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>
                Browse Without Login →
              </Link>
            </div>
          </div>

          {/* Card 2: Vendor Merchant Portal */}
          <div
            className="card"
            style={{
              padding: '28px 24px',
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}
              >
                <Store size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Vendor Merchant Portal</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>
                Storefront management for independent sellers. Update inventory, manage product variants, and track incoming sub-orders.
              </p>
              <ul style={{ fontSize: '12px', color: 'var(--text-main)', paddingLeft: '18px', marginBottom: '20px', lineHeight: '1.8' }}>
                <li>Product CRUD & image manager</li>
                <li>CSV bulk inventory upload with validation</li>
                <li>Vendor payout ledger & sales aggregation</li>
              </ul>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => handleQuickLogin('vendor@venfes.com', 'vendor123', '/vendor')}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center', borderColor: '#d97706', color: '#b45309' }}
              >
                1-Click Launch Vendor Portal
              </button>
              <Link to="/register" style={{ textAlign: 'center', fontSize: '12px', color: '#b45309', fontWeight: '600' }}>
                Register New Store →
              </Link>
            </div>
          </div>

          {/* Card 3: Platform Admin Portal */}
          <div
            className="card"
            style={{
              padding: '28px 24px',
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}
              >
                <Shield size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Platform Admin Portal</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>
                Platform governance and live oversight. Real-time GMV calculations, vendor KYC approval queue, and Socket.io order stream.
              </p>
              <ul style={{ fontSize: '12px', color: 'var(--text-main)', paddingLeft: '18px', marginBottom: '20px', lineHeight: '1.8' }}>
                <li>Live aggregation analytics & cohort chart</li>
                <li>Real-time Socket.io order event feed</li>
                <li>Vendor KYC review & commission controller</li>
              </ul>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => handleQuickLogin('admin@venfes.com', 'admin123', '/admin')}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center', borderColor: '#16a34a', color: '#15803d' }}
              >
                1-Click Launch Admin Portal
              </button>
              <Link to="/admin" style={{ textAlign: 'center', fontSize: '12px', color: '#15803d', fontWeight: '600' }}>
                Review System Health →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* System Features & MongoDB Compass Architecture */}
      <section className="container" style={{ marginTop: '54px', maxWidth: '1080px', padding: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '8px' }}>
            Engineered Full-Stack Architecture
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto' }}>
            Built strictly adhering to production software engineering standards, protecting atomic consistency and live data aggregation.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Database size={22} color="var(--primary)" />
              <strong style={{ fontSize: '15px' }}>MongoDB Compass Connected</strong>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Directly connected to local MongoDB Server at <code style={{ fontSize: '11px' }}>mongodb://127.0.0.1:27017/venfes</code>.
              Cart updates, checkouts, and orders immediately appear in Compass collections.
            </p>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Layers size={22} color="var(--primary)" />
              <strong style={{ fontSize: '15px' }}>Atomic Cart-Splitting</strong>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Checkout groups mixed cart items into 1 parent order + 1 sub-order per vendor. Stock decrements atomically with rollback on any constraint violation.
            </p>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <MapPin size={22} color="var(--green)" />
              <strong style={{ fontSize: '15px' }}>Live Order GPS Tracking</strong>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Interactive delivery route map with carrier vehicle animations, highway waypoints, distance remaining, and courier phone simulation.
            </p>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <CreditCard size={22} color="#f59e0b" />
              <strong style={{ fontSize: '15px' }}>Comprehensive Payments</strong>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Supports UPI (Google Pay, PhonePe, Paytm QR), Credit & Debit cards with auto-brand detection, Cash on Delivery (COD), and Razorpay test gateway.
            </p>
          </div>
        </div>

        {/* Demo Credentials Cheat Sheet for Examiners / Evaluators */}
        <div
          className="card"
          style={{
            marginTop: '32px',
            padding: '24px',
            backgroundColor: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <CheckCircle2 size={20} color="var(--green)" />
            <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Review & Demonstration Pre-Configured Accounts</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', fontSize: '13px' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--surface-alt)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <strong>Customer Role:</strong>
              <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Email: <code style={{ color: 'var(--primary)' }}>customer@venfes.com</code></div>
              <div style={{ color: 'var(--text-muted)' }}>Password: <code>customer123</code></div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--surface-alt)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <strong>Vendor Role (TechNova Peripherals):</strong>
              <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Email: <code style={{ color: '#d97706' }}>vendor@venfes.com</code></div>
              <div style={{ color: 'var(--text-muted)' }}>Password: <code>vendor123</code></div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--surface-alt)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <strong>Platform Administrator Role:</strong>
              <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Email: <code style={{ color: '#16a34a' }}>admin@venfes.com</code></div>
              <div style={{ color: 'var(--text-muted)' }}>Password: <code>admin123</code></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
