import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Standard error state component with retry action
 */
export default function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an error while loading this content. Please try again.',
  onRetry = null,
  action = null,
  className = '',
  style = {}
}) {
  return (
    <div
      className={`card ${className}`.trim()}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 24px',
        textAlign: 'center',
        backgroundColor: 'var(--danger-bg)',
        border: '1px solid var(--danger-border)',
        ...style
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#fee2e2',
          color: 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}
      >
        <AlertTriangle size={28} />
      </div>

      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--danger)' }}>
        {title}
      </h3>

      <p style={{ color: '#7f1d1d', fontSize: '14px', maxWidth: '420px', marginBottom: (onRetry || action) ? '20px' : '0' }}>
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} /> Retry
        </button>
      )}

      {action && !onRetry && <div>{action}</div>}
    </div>
  );
}
