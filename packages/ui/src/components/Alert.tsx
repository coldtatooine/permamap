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
  warn:    { bg: 'var(--pm-warn-muted)',   border: 'color-mix(in oklch, var(--color-warn-deep) 30%, transparent)',   color: 'var(--color-warn-deep)',   defaultIcon: '⚠' },
  danger:  { bg: 'var(--pm-danger-muted)', border: 'color-mix(in oklch, var(--color-danger-deep) 30%, transparent)', color: 'var(--color-danger-deep)', defaultIcon: '✕' },
  info:    { bg: 'var(--pm-accent-muted)', border: 'color-mix(in oklch, var(--color-accent-deep) 30%, transparent)', color: 'var(--color-accent-deep)', defaultIcon: 'ℹ' },
  success: { bg: 'var(--pm-accent-muted)', border: 'color-mix(in oklch, var(--color-accent-deep) 30%, transparent)', color: 'var(--color-accent-deep)', defaultIcon: '✓' },
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
        borderRadius:  'var(--radius-input)',
        padding:       '8px 12px',
        fontSize:      'var(--text-xs)',
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
