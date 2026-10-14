import React from 'react';

/**
 * Reusable Button component
 * Variants: primary, secondary, accent (Buy Now), ghost, danger
 * Sizes: sm, md, lg
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  style = {},
  onClick,
  ...rest
}) {
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        ...style
      }}
      onClick={onClick}
      {...rest}
    >
      {loading ? (
        <>
          <span
            className="spinner spinner-sm"
            style={{
              borderColor: 'currentColor',
              borderTopColor: 'transparent',
              display: 'inline-block'
            }}
          />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
