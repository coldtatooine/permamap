import React from 'react';
import { zone, type ZoneNumber } from '../tokens/colors';
import { ZoneBadge } from './Badge';

// =====================
// ZoneCard — card de zona na sidebar
// Animação via CSS (pm-animate-in + animationDelay por index)
// =====================

export interface ZoneCardProps {
  zoneNumber:    ZoneNumber;
  name:          string;
  active?:       boolean;
  index?:        number;       // para stagger via animationDelay
  elementCount?: number;
  areaHa?:       number;
  onClick?:      () => void;
  onDelete?:     (e: React.MouseEvent) => void;
}

export function ZoneCard({
  zoneNumber,
  name,
  active = false,
  index = 0,
  elementCount,
  areaHa,
  onClick,
  onDelete,
}: ZoneCardProps) {
  const zoneColor = zone[zoneNumber];

  return (
    <div
      className={`pm-zone-card pm-animate-in p-3 ${active ? 'active' : ''}`}
      style={{
        borderLeft: `3px solid ${zoneColor}`,
        animationDelay: `${index * 45}ms`,
        boxShadow: active
          ? `inset 3px 0 0 ${zoneColor}, 0 0 24px -10px ${zoneColor}50`
          : `inset 3px 0 0 ${zoneColor}`,
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-pressed={active}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      {/* Ghost número decorativo */}
      <span
        aria-hidden
        className="absolute right-2 top-1/2 -translate-y-1/2 font-['Lora'] text-5xl font-bold leading-none pointer-events-none select-none"
        style={{ color: zoneColor, opacity: 0.06 }}
      >
        {zoneNumber}
      </span>

      <div className="relative flex items-center gap-2.5">
        <ZoneBadge zoneNumber={zoneNumber} size="md" />

        <div className="flex-1 min-w-0">
          <p className="text-[var(--pm-text)] text-sm font-semibold truncate leading-tight">
            {name}
          </p>
          <p className="text-[var(--pm-text-3)] text-[0.65rem] font-[var(--font-ui)] mt-0.5">
            Zona {zoneNumber}
            {elementCount !== undefined && ` · ${elementCount} elemento${elementCount !== 1 ? 's' : ''}`}
            {areaHa !== undefined && ` · ${areaHa.toFixed(2)} ha`}
          </p>
        </div>

        {onDelete && (
          <button
            className="pm-delete-btn p-1 rounded text-[var(--pm-text-3)] hover:text-[var(--pm-danger)] transition-colors"
            onClick={(e) => { e.stopPropagation(); onDelete(e); }}
            aria-label={`Excluir ${name}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
