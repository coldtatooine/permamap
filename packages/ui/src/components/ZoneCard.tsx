import React from 'react';
import { zone, type ZoneNumber } from '../tokens/colors';
import { ZoneBadge } from './Badge';

// =====================
// ZoneCard — item de zona na sidebar
// Interatividade (hover/active/delete) via .pm-zone-card e .pm-delete-btn (index.css)
// =====================

export interface ZoneCardProps {
  zoneNumber:    ZoneNumber;
  name:          string;
  active?:       boolean;
  index?:        number;
  elementCount?: number;
  areaHa?:       number;
  onClick?:      () => void;
  onDelete?:     (e: React.MouseEvent) => void;
}

export function ZoneCard({
  zoneNumber,
  name,
  active   = false,
  index    = 0,
  elementCount,
  areaHa,
  onClick,
  onDelete,
}: ZoneCardProps) {
  const zoneColor = zone[zoneNumber];

  const meta = [
    `Zona ${zoneNumber}`,
    elementCount !== undefined
      ? `${elementCount} elemento${elementCount !== 1 ? 's' : ''}`
      : null,
    areaHa !== undefined ? `${areaHa.toFixed(2)} ha` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div
      className={`pm-zone-card pm-animate-in${active ? ' active' : ''}`}
      style={{
        borderLeft:      `3px solid ${zoneColor}`,
        animationDelay:  `${index * 45}ms`,
        padding:         '13px 16px',
        boxShadow:       active ? `0 0 28px -12px ${zoneColor}60` : 'none',
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-pressed={active}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      {/* Número ghost decorativo */}
      <span
        aria-hidden
        style={{
          position:      'absolute',
          right:         '12px',
          top:           '50%',
          transform:     'translateY(-50%)',
          fontFamily:    'var(--font-display)',
          fontSize:      '2.75rem',
          fontWeight:    700,
          lineHeight:    1,
          pointerEvents: 'none',
          userSelect:    'none',
          color:         zoneColor,
          opacity:       0.07,
        }}
      >
        {zoneNumber}
      </span>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ZoneBadge zoneNumber={zoneNumber} size="md" />

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            color:        'var(--pm-text)',
            fontSize:     '0.875rem',
            fontWeight:   600,
            fontFamily:   'var(--font-ui)',
            lineHeight:   1.3,
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
          }}>
            {name}
          </p>
          <p style={{
            color:       'var(--pm-text-3)',
            fontSize:    '0.68rem',
            fontFamily:  'var(--font-ui)',
            marginTop:   '3px',
            letterSpacing: '0.01em',
            lineHeight:  1,
          }}>
            {meta}
          </p>
        </div>

        {onDelete && (
          <button
            className="pm-delete-btn"
            onClick={(e) => { e.stopPropagation(); onDelete(e); }}
            aria-label={`Excluir ${name}`}
            style={{
              background:  'none',
              border:      'none',
              cursor:      'pointer',
              padding:     '5px',
              borderRadius: '5px',
              color:       'var(--var-text-3)',
              display:     'flex',
              alignItems:  'center',
              flexShrink:  0,
              transition:  'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--pm-danger)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
