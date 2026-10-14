import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Wallet, Check, Sparkles, CreditCard, Send, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CARD_THEMES = [
  { id: 'festival', label: 'Festival & Celebrations', bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', icon: '✨' },
  { id: 'birthday', label: 'Happy Birthday', bg: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', icon: '🎂' },
  { id: 'shopping', label: 'Shopping Spree', bg: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', icon: '🛍️' },
  { id: 'thanks', label: 'Thank You', bg: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', icon: '🙏' }
];

const PRESET_AMOUNTS = [500, 1000, 2500, 5000];

export default function GiftCardsPage() {
  const { user } = useAuth();

  const [balance, setBalance] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState(CARD_THEMES[0]);
  const [amount, setAmount] = useState(1000);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [personalMessage, setPersonalMessage] = useState('Enjoy shopping top artisanal gear and electronics on Venfes!');

  const [redeemCode, setRedeemCode] = useState('');
  const [redeemFeedback, setRedeemFeedback] = useState(null);
  const [purchasedCode, setPurchasedCode] = useState(null);

  // Load wallet balance from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('venfes_gift_card_balance');
    setBalance(saved ? Number(saved) : 1000); // Default ₹1000 gift balance for demo shoppers!
  }, []);

  function handleRedeem(e) {
    e.preventDefault();
    setRedeemFeedback(null);
    if (!redeemCode.trim()) return;

    const code = redeemCode.trim().toUpperCase();
    let addAmount = 500;
    if (code.includes('1000')) addAmount = 1000;
    else if (code.includes('2500') || code.includes('2000')) addAmount = 2000;
    else if (code.includes('5000')) addAmount = 5000;
    else if (code.startsWith('GIFT')) addAmount = 750;

    const newBalance = balance + addAmount;
    setBalance(newBalance);
    localStorage.setItem('venfes_gift_card_balance', newBalance.toString());
    setRedeemFeedback({
      success: true,
      message: `Success! Added ₹${addAmount.toLocaleString()} to your Venfes Gift Card Balance.`
    });
    setRedeemCode('');
  }

  function handlePurchase(e) {
    e.preventDefault();
    const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const generated = `GIFT-${selectedTheme.id.toUpperCase()}-${amount}-${randPart}`;
    setPurchasedCode(generated);
  }

  return (
    <div className="container" style={{ padding: '32px 16px', maxWidth: '1080px' }}>
      {/* Top Wallet Balance Strip */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '20px 24px',
          marginBottom: '32px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Wallet size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Your Venfes Gift Card Wallet
            </span>
            <div style={{ fontSize: '26px', fontWeight: 'bold', color: 'var(--text-main)' }}>
              ₹{balance.toLocaleString()}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/cart" className="btn btn-primary btn-sm" style={{ padding: '9px 16px', fontWeight: '600' }}>
            Use at Checkout →
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        {/* Left Column: Create & Personalize Gift Card */}
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
            Give a Venfes Digital Gift Card
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Delivered instantly by email. Valid across all 30+ catalog products and approved stores.
          </p>

          <form onSubmit={handlePurchase} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 1. Select Theme */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                1. Select Card Theme:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {CARD_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedTheme(theme)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius)',
                      border: '2px solid',
                      borderColor: selectedTheme.id === theme.id ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: selectedTheme.id === theme.id ? 'var(--primary-light)' : 'var(--surface)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      fontWeight: selectedTheme.id === theme.id ? '700' : '500',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{theme.icon}</span>
                    <span>{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Select Amount */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                2. Select Denomination:
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius)',
                      border: '1px solid',
                      borderColor: amount === amt ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: amount === amt ? 'var(--primary)' : 'var(--surface)',
                      color: amount === amt ? '#ffffff' : 'var(--text-main)',
                      fontSize: '13px',
                      fontWeight: '700'
                    }}
                  >
                    ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Recipient Info */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                Recipient Name:
              </label>
              <input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Sridhar Raman"
                style={{ width: '100%', padding: '10px 12px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                Recipient Email:
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="recipient@example.com"
                style={{ width: '100%', padding: '10px 12px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                Personal Message:
              </label>
              <textarea
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                rows={2}
                style={{ width: '100%', padding: '10px 12px' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '12px', fontWeight: 'bold' }}>
              Generate & Purchase Gift Card (₹{amount.toLocaleString()})
            </button>
          </form>

          {purchasedCode && (
            <div
              style={{
                marginTop: '16px',
                padding: '16px',
                backgroundColor: 'var(--green-light)',
                border: '1px solid #86efac',
                borderRadius: 'var(--radius)',
                fontSize: '13px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--green)', fontWeight: 'bold', marginBottom: '4px' }}>
                <Check size={16} /> Gift Card Created Successfully!
              </div>
              <p style={{ color: 'var(--text-main)', marginBottom: '8px' }}>
                Voucher Code: <strong style={{ fontFamily: 'monospace', fontSize: '15px' }}>{purchasedCode}</strong>
              </p>
              <button
                type="button"
                onClick={() => {
                  setRedeemCode(purchasedCode);
                  setPurchasedCode(null);
                }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11px' }}
              >
                Copy to Redeem Box Below ↓
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Live Card Preview & Redeem Voucher */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
              Digital Card Live Preview
            </h3>
            {/* The Visual Gift Card */}
            <div
              style={{
                background: selectedTheme.bg,
                color: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                padding: '28px',
                boxShadow: 'var(--shadow-lg)',
                minHeight: '210px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                    VENFES GIFT CARD
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>
                    Multi-Vendor Marketplace Voucher
                  </div>
                </div>
                <span style={{ fontSize: '32px' }}>{selectedTheme.icon}</span>
              </div>

              <div>
                <p style={{ fontSize: '13px', fontStyle: 'italic', opacity: 0.95, marginBottom: '10px' }}>
                  "{personalMessage}"
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.8 }}>For:</span>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{recipientName || 'Valued Shopper'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.8 }}>Value:</span>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{amount.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Redeem Voucher Card */}
          <div
            className="card"
            style={{
              padding: '24px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
              Redeem a Gift Card Voucher
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Already have a gift voucher or received one? Enter the code below to credit your balance.
            </p>

            {redeemFeedback && (
              <div
                style={{
                  padding: '10px 12px',
                  backgroundColor: redeemFeedback.success ? 'var(--green-light)' : 'var(--danger-bg)',
                  color: redeemFeedback.success ? 'var(--green)' : 'var(--danger)',
                  borderRadius: 'var(--radius)',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '14px'
                }}
              >
                {redeemFeedback.message}
              </div>
            )}

            <form onSubmit={handleRedeem} style={{ display: 'flex', gap: '8px' }}>
              <input
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value)}
                placeholder="e.g. GIFT-FEST-2026-X8Y2"
                style={{ flex: 1, padding: '10px 12px', fontFamily: 'monospace' }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 18px', fontWeight: 'bold' }}>
                Redeem Code
              </button>
            </form>

            {/* Quick Demo Pre-fills for testing */}
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed var(--border)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Demo codes to test:
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['GIFT500', 'GIFT1000', 'GIFT2500'].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setRedeemCode(code)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                  >
                    + {code}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
