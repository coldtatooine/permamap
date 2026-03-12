import React from 'react';

// =====================
// Alert — mensagem de alerta inline
// =====================

export type AlertVariant = 'warn' | 'danger' | 'info' | 'success';

export interface AlertProps {
  variant?:  AlertVariant;
  icon?:     React.ReactNode;
  children:  React.ReactNode;
  className?: string;
}

const styles: Record<AlertVariant, { bg: string; border: string; color: string; defaultIcon: string }> = {
  warn:    { bg: 'var(--pm-warn-muted)',   border: 'rgba(245,197,24,0.25)',  color: 'var(--pm-warn)',   defaultIcon: '⚠' },
  danger:  { bg: 'var(--pm-danger-muted)', border: 'rgba(255,107,107,0.25)', color: 'var(--pm-danger)', defaultIcon: '✕' },
  info:    { bg: 'var(--pm-accent-muted)', border: 'rgba(247,195,95,0.22)',  color: 'var(--pm-accent)', defaultIcon: 'ℹ' },
  success: { bg: 'var(--pm-accent-muted)', border: 'rgba(247,195,95,0.22)',  color: 'var(--pm-accent)', defaultIcon: '✓' },
};

export function Alert({ variant = 'info', icon, children, className = '' }: AlertProps) {
  const s = styles[variant];
  return (
    <div
      className={`pm-animate-in ${className}`}
      role="alert"
      style={{
        display:       'flex',
        alignItems:    'flex-start',
        gap:           '8px',
        borderRadius:  '8px',
        padding:       '8px 12px',
        fontSize:      '0.75rem',
        lineHeight:    '1.5',
        background:    s.bg,
        border:        `1px solid ${s.border}`,
        color:         s.color,
      }}
    >
      <span aria-hidden style={{ flexShrink: 0, marginTop: '1px' }}>
        {icon ?? s.defaultIcon}
      </span>
      <span>{children}</span>
    </div>
  );
}
