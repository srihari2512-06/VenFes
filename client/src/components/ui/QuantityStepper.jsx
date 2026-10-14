import React from 'react';
import { Minus, Plus } from 'lucide-react';

/**
 * Accessible QuantityStepper component for buy boxes and carts
 */
export default function QuantityStepper({
  value = 1,
  min = 1,
  max = 10,
  onChange,
  disabled = false,
  size = 'md',
  className = '',
  style = {}
}) {
  const isSm = size === 'sm';
  const buttonSize = isSm ? '24px' : '30px';
  const iconSize = isSm ? 12 : 14;

  function handleDecrement(e) {
    e.stopPropagation();
    if (value > min && onChange && !disabled) {
      onChange(value - 1);
    }
  }

  function handleIncrement(e) {
    e.stopPropagation();
    if (value < max && onChange && !disabled) {
      onChange(value + 1);
    }
  }

  return (
    <div
      className={`quantity-stepper ${className}`.trim()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        backgroundColor: 'var(--surface)',
        overflow: 'hidden',
        userSelect: 'none',
        ...style
      }}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        style={{
          width: buttonSize,
          height: buttonSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          border: 'none',
          color: value <= min ? 'var(--border)' : 'var(--text-main)',
          cursor: value <= min || disabled ? 'not-allowed' : 'pointer'
        }}
      >
        <Minus size={iconSize} />
      </button>

      <span
        style={{
          minWidth: isSm ? '28px' : '36px',
          textAlign: 'center',
          fontWeight: '600',
          fontSize: isSm ? '12px' : '14px',
          fontVariantNumeric: 'tabular-nums',
          padding: '0 4px'
        }}
      >
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        style={{
          width: buttonSize,
          height: buttonSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          border: 'none',
          color: value >= max ? 'var(--border)' : 'var(--text-main)',
          cursor: value >= max || disabled ? 'not-allowed' : 'pointer'
        }}
      >
        <Plus size={iconSize} />
      </button>
    </div>
  );
}
