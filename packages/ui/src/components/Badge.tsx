import React from 'react';
import { zone, type ZoneNumber } from '../tokens/colors';

// =====================
// ZoneBadge — círculo colorido com número da zona
// =====================

export interface ZoneBadgeProps {
  zoneNumber: ZoneNumber;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles: Record<NonNullable<ZoneBadgeProps['size']>, string> = {
  sm:  'w-5 h-5 text-[0.6rem]',
  md:  'w-7 h-7 text-xs',
  lg:  'w-9 h-9 text-sm',
};

export function ZoneBadge({ zoneNumber, size = 'md', className = '' }: ZoneBadgeProps) {
  const color = zone[zoneNumber];

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold font-[var(--font-mono)] flex-shrink-0 ${sizeStyles[size]} ${className}`}
      style={{ background: `${color}22`, color, border: `1.5px solid ${color}55` }}
      aria-label={`Zona ${zoneNumber}`}
    >
      {zoneNumber}
    </span>
  );
}

// =====================
// StatusBadge — badge de texto genérico
// =====================

type StatusVariant = 'success' | 'warn' | 'danger' | 'neutral';

export interface StatusBadgeProps {
  variant?: StatusVariant;
  children: React.ReactNode;
  className?: string;
}

const statusStyle: Record<StatusVariant, string> = {
  success: 'bg-[var(--pm-accent-muted)] text-[var(--pm-accent)] border-[var(--pm-accent)]',
  warn:    'bg-[var(--pm-warn-muted)] text-[var(--pm-warn)] border-[var(--pm-warn)]',
  danger:  'bg-[var(--pm-danger-muted)] text-[var(--pm-danger)] border-[var(--pm-danger)]',
  neutral: 'bg-[var(--pm-card)] text-[var(--pm-text-2)] border-[var(--pm-border-bright)]',
};

export function StatusBadge({ variant = 'neutral', children, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-semibold font-[var(--font-ui)] uppercase tracking-[0.06em] border ${statusStyle[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
