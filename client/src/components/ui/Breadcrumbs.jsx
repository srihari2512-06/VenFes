import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * Standard accessible breadcrumb navigation
 * @param {object} props
 * @param {Array<{ label: string, href?: string }>} props.items
 */
export default function Breadcrumbs({
  items = [],
  className = '',
  style = {}
}) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`breadcrumbs ${className}`.trim()}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        color: 'var(--text-muted)',
        flexWrap: 'wrap',
        marginBottom: '12px',
        ...style
      }}
    >
      <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
        Home
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <React.Fragment key={idx}>
            <ChevronRight size={12} color="var(--border)" />
            {item.href && !isLast ? (
              <Link
                to={item.href}
                style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={isLast ? 'page' : undefined}
                style={{
                  color: isLast ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: isLast ? '600' : 'normal'
                }}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
