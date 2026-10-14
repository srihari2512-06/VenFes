import React from 'react';
import { Star } from 'lucide-react';

/**
 * Compact rating pill with a number and star icon
 * Green at 4.0+, amber 3.0-3.9, red below 3.0
 * Followed by "(count)" in muted text
 * Hidden when count is 0
 */
export default function RatingChip({
  rating = 0,
  count = 0,
  showCount = true,
  size = 'md',
  className = '',
  style = {}
}) {
  const numCount = Number(count) || 0;
  if (numCount === 0) {
    return null;
  }

  const numRating = Number(rating) || 0;
  let bg = 'var(--rating-high)';
  if (numRating < 3.0) {
    bg = 'var(--rating-low)';
  } else if (numRating < 4.0) {
    bg = 'var(--rating-mid)';
  }

  const isSmall = size === 'sm';

  return (
    <div
      className={`rating-chip-container ${className}`.trim()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: isSmall ? '11px' : '12px',
        ...style
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '2px',
          backgroundColor: bg,
          color: '#ffffff',
          fontWeight: '700',
          padding: isSmall ? '1px 5px' : '2px 6px',
          borderRadius: '4px',
          lineHeight: '1',
          fontVariantNumeric: 'tabular-nums'
        }}
      >
        <span>{numRating.toFixed(1)}</span>
        <Star size={isSmall ? 10 : 11} fill="#ffffff" color="#ffffff" />
      </span>

      {showCount && (
        <span style={{ color: 'var(--text-muted)', fontSize: isSmall ? '11px' : '12px', fontVariantNumeric: 'tabular-nums' }}>
          ({numCount.toLocaleString('en-IN')})
        </span>
      )}
    </div>
  );
}
