import React from 'react';
import { zone, type ZoneNumber } from '../tokens/colors';

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
  onEdit?:       (e: React.MouseEvent) => void;
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
  onEdit,
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
        animationDelay:  `${index * 45}ms`,
        padding:         'var(--space-sm) var(--space-md)',
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-pressed={active}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        {/* Numeral em ink + swatch quadrado com a cor funcional da zona */}
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', flexShrink: 0 }}>
          <span
            aria-hidden
            style={{
              fontFamily:    'var(--font-display)',
              fontSize:      '2.75rem',
              fontWeight:    800,
              lineHeight:    1,
              pointerEvents: 'none',
              userSelect:    'none',
              color:         'var(--color-ink)',
              opacity:       0.8,
            }}
          >
            {zoneNumber}
          </span>
          <span
            aria-hidden
            style={{
              width:        '8px',
              height:       '8px',
              borderRadius: '2px',
              background:   zoneColor,
              flexShrink:   0,
            }}
          />
        </span>

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
            fontSize:    '0.8125rem',
            fontFamily:  'var(--font-ui)',
            marginTop:   '3px',
            letterSpacing: '0.01em',
            lineHeight:  1.2,
          }}>
            {meta}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2xs)' }}>
          {onEdit && (
            <button
              className="pm-edit-btn"
              onClick={(e) => { e.stopPropagation(); onEdit(e); }}
              aria-label={`Editar ${name}`}
              style={{
                background:  'none',
                border:      'none',
                cursor:      'pointer',
                padding:     '5px',
                borderRadius: '5px',
                color:       'var(--pm-text-3)',
                display:     'flex',
                alignItems:  'center',
                flexShrink:  0,
                transition:  'color var(--dur-micro) var(--ease-out)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent-deep)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--pm-text-3)')}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          )}

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
                color:       'var(--pm-text-3)',
                display:     'flex',
                alignItems:  'center',
                flexShrink:  0,
                transition:  'color var(--dur-micro) var(--ease-out)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--pm-danger)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--pm-text-3)')}
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
    </div>
  );
}
