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
    gap:            '6px',
    padding:        '7px 13px',
    borderRadius:   '8px',
    fontSize:       '0.72rem',
    fontWeight:     600,
    fontFamily:     'var(--font-ui)',
    letterSpacing:  '0.04em',
    cursor:         disabled ? 'not-allowed' : 'pointer',
    transition:     'all 0.15s ease',
    border:         '1px solid transparent',
    whiteSpace:     'nowrap',
    opacity:        disabled ? 0.45 : 1,
  };

  const activeStyle: React.CSSProperties = {
    background: 'var(--pm-accent)',
    color:      '#1A1A1A',
    border:     '1px solid var(--pm-accent)',
  };

  const defaultStyle: React.CSSProperties = {
    background: 'rgba(38,60,40,0.94)',
    color:      'var(--pm-text)',
    border:     '1px solid var(--pm-border-bright)',
    backdropFilter: 'blur(8px)',
  };

  const disabledStyle: React.CSSProperties = {
    background: 'rgba(38,60,40,0.6)',
    color:      'var(--pm-text-3)',
    border:     '1px solid var(--pm-border)',
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
