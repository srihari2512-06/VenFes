import React from 'react';
import { formatINR, calcDiscountPercent } from '../../utils/formatters';

/**
 * Standard marketplace price display
 * Current price in bold, struck MRP in muted text, and discount % in green
 * Only shows MRP and discount when mrp > price
 *
 * @param {object} props
 * @param {number|string} props.price - Current selling price
 * @param {number|string} [props.mrp] - Maximum retail price
 * @param {'card'|'detail'|'cart'} [props.size='card'] - Display size variant
 */
export default function PriceBlock({
  price = 0,
  mrp = null,
  size = 'card',
  className = '',
  style = {}
}) {
  const discountPercent = calcDiscountPercent(mrp, price);
  const hasDiscount = discountPercent > 0;

  // Font size profiles based on size prop
  const sizeStyles = {
    card: {
      price: { fontSize: '16px', fontWeight: '700' },
      mrp: { fontSize: '13px' },
      discount: { fontSize: '13px', fontWeight: '700' }
    },
    detail: {
      price: { fontSize: '28px', fontWeight: '700' },
      mrp: { fontSize: '16px' },
      discount: { fontSize: '16px', fontWeight: '700' }
    },
    cart: {
      price: { fontSize: '16px', fontWeight: '700' },
      mrp: { fontSize: '13px' },
      discount: { fontSize: '12px', fontWeight: '700' }
    }
  };

  const currentSize = sizeStyles[size] || sizeStyles.card;

  return (
    <div
      className={`price-block price-block-${size} ${className}`.trim()}
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: '8px',
        flexWrap: 'wrap',
        fontVariantNumeric: 'tabular-nums',
        ...style
      }}
    >
      {/* Current Selling Price */}
      <span
        style={{
          color: 'var(--text-main)',
          ...currentSize.price
        }}
      >
        {formatINR(price)}
      </span>

      {/* Struck-through MRP */}
      {hasDiscount && (
        <span
          style={{
            textDecoration: 'line-through',
            color: 'var(--text-muted)',
            ...currentSize.mrp
          }}
        >
          {formatINR(mrp)}
        </span>
      )}

      {/* Discount Percentage */}
      {hasDiscount && (
        <span
          style={{
            color: 'var(--green)',
            ...currentSize.discount
          }}
        >
          {discountPercent}% off
        </span>
      )}
    </div>
  );
}
