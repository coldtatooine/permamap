import { useState } from 'react';
import { useMapStore } from '../../store/useMapStore';
import { useProperty } from '../../hooks/useProperty';
import { ZoneBadge, Icon, Dialog } from '@permamap/ui';
import { ElementEditForm } from '../Forms/ElementEditForm';
import type { ZoneNumber } from '@permamap/ui';
import type { GeoJSONGeometry } from '../../types';
import { POI_TYPE_DEFINITIONS } from '../../types';

function getElementCenter(geom: GeoJSONGeometry): [number, number] {
  if (geom.type === 'Point') {
    return [geom.coordinates[1], geom.coordinates[0]];
  }
  if (geom.type === 'LineString') {
    const pts = geom.coordinates;
    const mid = pts[Math.floor(pts.length / 2)];
    return [mid[1], mid[0]];
  }
  if (geom.type === 'Polygon') {
    const pts = geom.coordinates[0];
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;
    
    for (const [lng, lat] of pts) {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }
    return [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
  }
  return [0, 0];
}

// Metadados por tipo de elemento
const TYPE_META: Record<string, { label: string; iconName: 'map-pin' | 'layers' | 'hexagon' | 'fence' }> = {
  poi:     { label: 'POI',     iconName: 'map-pin' },
  culture: { label: 'Cultura', iconName: 'layers'  },
  animal:  { label: 'Animal',  iconName: 'hexagon' },
  fence:   { label: 'Cerca',   iconName: 'fence'   },
};

export function ElementPanel() {
  const { elements, zones, setPendingFlyTo } = useMapStore();
  const { deleteElement } = useProperty();
  const [editingElementId, setEditingElementId] = useState<string | null>(null);

  // Dialog state
  const [elementToDelete, setElementToDelete] = useState<{ id: string; label: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const editingElement = elements.find((e) => e.id === editingElementId);

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
            onClick={() => {
              const center = getElementCenter(el.geometry_geojson);
              setPendingFlyTo(center);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const center = getElementCenter(el.geometry_geojson);
                setPendingFlyTo(center);
              }
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
                {el.type === 'poi' && el.metadata_json.poi_type && POI_TYPE_DEFINITIONS[el.metadata_json.poi_type]
                  ? <span style={{ fontSize: '13px', lineHeight: 1 }}>
                      {POI_TYPE_DEFINITIONS[el.metadata_json.poi_type].emoji}
                    </span>
                  : meta && <Icon name={meta.iconName} size={13} color="currentColor" />
                }
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

              <div style={{ display: 'flex', gap: '4px' }}>
                {/* Botão editar */}
                <button
                  className="pm-edit-btn"
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
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--pm-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--pm-text-3)')}
                  onClick={() => setEditingElementId(el.id)}
                  title="Editar"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>

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
                onClick={(e) => {
                  e.stopPropagation();
                  setElementToDelete({ id: el.id, label });
                }}
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
          </div>
        );
      })}

      {editingElement && (
        <ElementEditForm
          element={editingElement}
          onClose={() => setEditingElementId(null)}
        />
      )}

      {/* Confirmação de Exclusão */}
      <Dialog
        open={!!elementToDelete}
        title="Excluir Elemento?"
        description={`Tem certeza que deseja remover o elemento "${elementToDelete?.label}" definitivamente do mapa?`}
        confirmText="Excluir Elemento"
        cancelText="Cancelar"
        variant="danger"
        loading={isDeleting}
        onConfirm={async () => {
          if (!elementToDelete) return;
          setIsDeleting(true);
          const res = await deleteElement(elementToDelete.id);
          setIsDeleting(false);
          if (!res.success) alert(res.error);
          else setElementToDelete(null);
        }}
        onCancel={() => setElementToDelete(null)}
      />
    </div>
  );
}
