import React from 'react';

/**
 * Basic Skeleton placeholder with shimmer animation
 */
export function Skeleton({
  width = '100%',
  height = '16px',
  borderRadius = 'var(--radius-sm)',
  className = '',
  style = {}
}) {
  return (
    <div
      className={`skeleton ${className}`.trim()}
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
    />
  );
}

/**
 * Product Card skeleton matching standard listing card layout
 */
export function SkeletonCard() {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Skeleton height="180px" borderRadius="var(--radius)" />
      <Skeleton width="60%" height="14px" />
      <Skeleton width="90%" height="16px" />
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Skeleton width="48px" height="20px" borderRadius="4px" />
        <Skeleton width="40px" height="14px" />
      </div>
      <Skeleton width="50%" height="22px" />
    </div>
  );
}

/**
 * Text row skeleton
 */
export function SkeletonText({ lines = 3, gap = '8px' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, width: '100%' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '70%' : '100%'}
          height="14px"
        />
      ))}
    </div>
  );
}

export default Skeleton;
