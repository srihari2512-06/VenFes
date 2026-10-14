import React from 'react';
import { PackageOpen } from 'lucide-react';

/**
 * Standard empty state component with informative prompt and next action
 */
export default function EmptyState({
  title = 'Nothing here yet',
  description = 'Try adjusting your filters or browsing other categories.',
  icon: Icon = PackageOpen,
  action = null,
  className = '',
  style = {}
}) {
  return (
    <div
      className={`state-empty card ${className}`.trim()}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        ...style
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--secondary-light)',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}
      >
        {typeof Icon === 'function' ? <Icon size={32} /> : Icon}
      </div>

      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-main)' }}>
        {title}
      </h3>

      <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '400px', marginBottom: action ? '24px' : '0', lineHeight: '1.5' }}>
        {description}
      </p>

      {action && <div>{action}</div>}
    </div>
  );
}
