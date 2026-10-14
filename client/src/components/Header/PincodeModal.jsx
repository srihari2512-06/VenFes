import React, { useState, useEffect, useRef } from 'react';
import { MapPin, X, Check } from 'lucide-react';

const PINCODE_KEY = 'venfes_pincode';

export default function PincodeModal() {
  const [pincode, setPincode] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const popoverRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PINCODE_KEY);
      if (saved && /^[1-9][0-9]{5}$/.test(saved)) {
        setPincode(saved);
        setInputValue(saved);
      }
    } catch {
      // safe fallback
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  function handleSave(e) {
    e.preventDefault();
    const clean = inputValue.trim();
    if (!/^[1-9][0-9]{5}$/.test(clean)) {
      setError('Please enter a valid 6-digit Indian PIN code');
      return;
    }

    try {
      localStorage.setItem(PINCODE_KEY, clean);
      setPincode(clean);
      setError('');
      setIsOpen(false);
      // Dispatch storage event so product detail pages listen
      window.dispatchEvent(new Event('venfes-pincode-change'));
    } catch {
      // safe fallback
    }
  }

  return (
    <div ref={popoverRef} style={{ position: 'relative' }}>
      {/* Pincode trigger chip */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          padding: '4px 8px',
          color: 'var(--text-main)',
          fontSize: '12px',
          cursor: 'pointer',
          borderRadius: 'var(--radius)',
          textAlign: 'left',
          lineHeight: 1.2
        }}
        aria-label="Delivery location"
      >
        <MapPin size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
        <div>
          <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>
            Deliver to
          </span>
          <strong style={{ fontSize: '13px', fontVariantNumeric: 'tabular-nums' }}>
            {pincode ? pincode : 'Select pincode'}
          </strong>
        </div>
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            width: '280px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-lg)',
            padding: '16px',
            zIndex: 1050
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold' }}>Choose your location</h4>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Enter your 6-digit PIN code to personalize delivery estimates.
          </p>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="text"
              maxLength={6}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value.replace(/\D/g, ''));
                setError('');
              }}
              placeholder="e.g. 600089"
              style={{
                width: '100%',
                padding: '8px 10px',
                fontSize: '14px',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '1px'
              }}
              autoFocus
            />

            {error && <span style={{ color: 'var(--danger)', fontSize: '11px' }}>{error}</span>}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <Check size={14} /> Apply
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
