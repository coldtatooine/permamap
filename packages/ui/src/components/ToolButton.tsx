import React from 'react';

// =====================
// ToolButton — botão de ferramenta para toolbar do mapa
// =====================

export interface ToolButtonProps {
  active?:    boolean;
  disabled?:  boolean;
  onClick?:   () => void;
  title?:     string;
  children:   React.ReactNode;
  className?: string;
}

export function ToolButton({
  active   = false,
  disabled = false,
  onClick,
  title,
  children,
  className = '',
}: ToolButtonProps) {
  const base: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    gap:            'var(--space-xs)',
    padding:        'var(--space-xs) var(--space-sm)',
    borderRadius:   '8px',
    fontSize:       '0.8125rem',
    fontWeight:     600,
    fontFamily:     'var(--font-ui)',
    letterSpacing:  '0.04em',
    cursor:         disabled ? 'not-allowed' : 'pointer',
    transition:     'background-color var(--dur-micro) var(--ease-out), color var(--dur-micro) var(--ease-out), border-color var(--dur-micro) var(--ease-out), opacity var(--dur-micro) var(--ease-out)',
    border:         '1px solid transparent',
    whiteSpace:     'nowrap',
    opacity:        disabled ? 0.55 : 1,
  };

  const activeStyle: React.CSSProperties = {
    background: 'var(--color-accent)',
    color:      'var(--color-accent-ink)',
    border:     '1px solid var(--color-accent)',
  };

  const defaultStyle: React.CSSProperties = {
    background: 'var(--color-paper-2)',
    color:      'var(--pm-text)',
    border:     '1px solid var(--color-rule)',
  };

  const disabledStyle: React.CSSProperties = {
    background: 'var(--color-paper-2)',
    color:      'var(--color-muted)',
    border:     '1px solid var(--color-rule)',
  };

  const computed = disabled ? disabledStyle : active ? activeStyle : defaultStyle;

  return (
    <button
      onClick={disabled ? undefined : onClick}
      title={title}
      disabled={disabled}
      className={className}
      style={{ ...base, ...computed }}
    >
      {children}
    </button>
  );
}
