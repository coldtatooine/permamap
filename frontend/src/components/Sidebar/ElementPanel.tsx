import { useMapStore } from '../../store/useMapStore';
import { ZoneBadge, Icon } from '@permamap/ui';
import type { ZoneNumber } from '@permamap/ui';

// Metadados por tipo de elemento
const TYPE_META: Record<string, { label: string; iconName: 'map-pin' | 'layers' | 'hexagon' | 'fence' }> = {
  poi:     { label: 'POI',     iconName: 'map-pin' },
  culture: { label: 'Cultura', iconName: 'layers'  },
  animal:  { label: 'Animal',  iconName: 'hexagon' },
  fence:   { label: 'Cerca',   iconName: 'fence'   },
};

export function ElementPanel() {
  const { elements, zones, removeElement } = useMapStore();

  if (elements.length === 0) {
    return (
      <div style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            '10px',
        textAlign:      'center',
        padding:        '40px 24px',
        minHeight:      '160px',
      }}>
        <div style={{
          width:          '40px',
          height:         '40px',
          borderRadius:   '50%',
          background:     'var(--pm-card)',
          border:         '1px solid var(--pm-border-bright)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
        }}>
          <Icon name="map-pin" size={18} color="var(--pm-text-3)" />
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--pm-text-3)', maxWidth: '160px', lineHeight: 1.5 }}>
          Adicione POIs e elementos às zonas do mapa
        </p>
      </div>
    );
  }

  return (
    <div>
      {elements.map((el, i) => {
        const zone  = zones.find((z) => z.id === el.zone_id);
        const meta  = TYPE_META[el.type];
        const label = el.metadata_json.name
          ?? el.metadata_json.poi_type
          ?? meta?.label
          ?? el.type;
        const zoneColor = zone?.color ?? 'var(--pm-border-bright)';

        return (
          <div
            key={el.id}
            className="pm-zone-card pm-animate-in"
            style={{
              borderLeft:     `3px solid ${zoneColor}`,
              animationDelay: `${i * 30}ms`,
              padding:        '13px 16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

              {/* Ícone de tipo */}
              <div style={{
                width:          '28px',
                height:         '28px',
                borderRadius:   '50%',
                flexShrink:     0,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                background:     zone ? `${zone.color}18` : 'var(--pm-card)',
                border:         `1.5px solid ${zone ? `${zone.color}40` : 'var(--pm-border-bright)'}`,
                color:          zone?.color ?? 'var(--pm-text-3)',
              }}>
                {meta && (
                  <Icon name={meta.iconName} size={13} color="currentColor" />
                )}
              </div>

              {/* Texto */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize:     '0.875rem',
                  fontWeight:   600,
                  fontFamily:   'var(--font-ui)',
                  color:        'var(--pm-text)',
                  lineHeight:   1.3,
                  overflow:     'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace:   'nowrap',
                }}>
                  {label}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                  {/* Tipo */}
                  <span style={{
                    fontSize:      '0.65rem',
                    fontFamily:    'var(--font-ui)',
                    fontWeight:    600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color:         'var(--pm-text-3)',
                  }}>
                    {meta?.label ?? el.type}
                  </span>

                  {/* Zona */}
                  {zone && (
                    <>
                      <span style={{ color: 'var(--pm-border-bright)', fontSize: '0.6rem' }}>·</span>
                      <ZoneBadge zoneNumber={zone.zone_number as ZoneNumber} size="sm" />
                    </>
                  )}

                  {/* Nota */}
                  {el.metadata_json.notes && (
                    <>
                      <span style={{ color: 'var(--pm-border-bright)', fontSize: '0.6rem' }}>·</span>
                      <span style={{
                        fontSize:     '0.68rem',
                        color:        'var(--pm-text-3)',
                        overflow:     'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace:   'nowrap',
                        maxWidth:     '80px',
                      }}>
                        {el.metadata_json.notes}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Botão remover */}
              <button
                className="pm-delete-btn"
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
                  transition:  'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--pm-danger)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--pm-text-3)')}
                onClick={() => { if (confirm(`Remover "${label}"?`)) removeElement(el.id); }}
                title="Remover"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4h6v2"/>
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
