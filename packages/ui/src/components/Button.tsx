import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'circle';
export type ButtonSize    = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  fullWidth?: boolean;
  loading?:   boolean;
}

// Tamanhos do botão círculo (px)
const circleSizePx: Record<ButtonSize, number> = { sm: 35, md: 45, lg: 55 };

// Classes CSS para variantes padrão
const variantClass: Partial<Record<ButtonVariant, string>> = {
  primary:   'pm-btn-primary',
  secondary: 'pm-btn-secondary',
  ghost:     'pm-btn-ghost',
  danger:    'pm-btn-ghost pm-btn-danger',
};

const sizeClass: Record<ButtonSize, string> = {
  sm:  'py-1.5 px-3 text-xs',
  md:  '',           // default do .pm-btn
  lg:  'py-3.5 px-6 text-base',
};

export function Button({
  variant   = 'primary',
  size      = 'md',
  fullWidth = true,
  loading   = false,
  disabled,
  className = '',
  children,
  style,
  ...props
}: ButtonProps) {

  // ── Circle ──────────────────────────────────────────────────────────────
  if (variant === 'circle') {
    const px = circleSizePx[size];
    return (
      <button
        {...props}
        disabled={disabled || loading}
        className={['pm-btn pm-btn-primary', className].filter(Boolean).join(' ')}
        style={{
          width:          px,
          height:         px,
          minWidth:       px,
          borderRadius:   '50%',
          padding:        0,
          display:        'inline-flex',
          alignItems:     'center',
          justifyContent: 'center',
          flexShrink:     0,
          ...style,
        }}
      >
        {loading ? (
          <svg className="animate-spin" width={px * 0.4} height={px * 0.4}
            viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : children}
      </button>
    );
  }

  // ── Standard variants ────────────────────────────────────────────────────
  const classes = [
    'pm-btn',
    variantClass[variant] ?? '',
    sizeClass[size],
    fullWidth ? 'w-full' : 'w-auto',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button {...props} className={classes} disabled={disabled || loading} style={style}>
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          {children}
        </span>
      ) : children}
    </button>
  );
}
