import React from 'react';

// =====================
// Divider — separador horizontal com label opcional
// =====================

export interface DividerProps {
  label?:    string;
  className?: string;
}

export function Divider({ label, className = '' }: DividerProps) {
  return (
    <div
      className={className}
      style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
    >
      <div style={{ flex: 1, height: '1px', background: 'var(--pm-border-bright)' }} />
      {label && (
        <span style={{ fontSize: '0.75rem', color: 'var(--pm-text-3)', flexShrink: 0 }}>
          {label}
        </span>
      )}
      <div style={{ flex: 1, height: '1px', background: 'var(--pm-border-bright)' }} />
    </div>
  );
}
