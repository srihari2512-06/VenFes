import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

/**
 * Seller name linked to store page with verified badge icon
 */
export default function SellerLink({
  storeId,
  name = 'Verified Seller',
  verified = true,
  className = '',
  style = {}
}) {
  const destination = storeId ? `/store/${storeId}` : '#';

  return (
    <Link
      to={destination}
      onClick={(e) => {
        if (!storeId || destination === '#') e.preventDefault();
        e.stopPropagation();
      }}
      className={`seller-link ${className}`.trim()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '12px',
        color: 'var(--primary)',
        fontWeight: '500',
        textDecoration: 'none',
        ...style
      }}
    >
      <span>{name}</span>
      {verified && (
        <CheckCircle2
          size={13}
          color="var(--green)"
          fill="var(--green-light)"
          style={{ flexShrink: 0 }}
          aria-label="Venfes Verified Seller"
        />
      )}
    </Link>
  );
}
