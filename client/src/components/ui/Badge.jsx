import React from 'react';

/**
 * Reusable Badge component
 * Variants: neutral, success, warning, danger, info
 */
export default function Badge({
  children,
  variant = 'neutral',
  className = '',
  style = {},
  ...rest
}) {
  return (
    <span
      className={`badge badge-${variant} ${className}`.trim()}
      style={style}
      {...rest}
    >
      {children}
    </span>
  );
}
