import { useState } from 'react';
import { useMapStore } from '../../store/useMapStore';
import { useProperty } from '../../hooks/useProperty';
import { Icon, Dialog } from '@permamap/ui';
import { ElementEditForm } from '../Forms/ElementEditForm';
import { POI_TYPE_DEFINITIONS } from '../../types';
import type { GeoJSONGeometry } from '../../types';

function getElementCenter(geom: GeoJSONGeometry): [number, number] {
  if (geom.type === 'Point') return [geom.coordinates[1], geom.coordinates[0]];
  if (geom.type === 'LineString') {
    const mid = geom.coordinates[Math.floor(geom.coordinates.length / 2)];
    return [mid[1], mid[0]];
  }
  if (geom.type === 'Polygon') {
    const pts = geom.coordinates[0];
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    for (const [lng, lat] of pts) {
      if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng; if (lng > maxLng) maxLng = lng;
    }
    return [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
  }
  return [0, 0];
}

function formatArea(m2: number): string {
  if (m2 >= 10_000) return `${(m2 / 10_000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ha`;
  return `${m2.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} m²`;
}

const TYPE_ICON: Record<string, 'map-pin' | 'layers' | 'hexagon' | 'fence'> = {
  poi:     'map-pin',
  culture: 'layers',
  animal:  'hexagon',
  fence:   'fence',
};

const TYPE_LABEL: Record<string, string> = {
  poi:     'POI',
  culture: 'Cultura',
  animal:  'Animal',
  fence:   'Cerca',
};

export function ElementPanel() {
  const { elements, zones, setPendingFlyTo } = useMapStore();
  const { deleteElement } = useProperty();
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [elementToDelete, setElementToDelete]   = useState<{ id: string; label: string } | null>(null);
  const [isDeleting, setIsDeleting]             = useState(false);

  if (elements.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: '10px', textAlign: 'center',
        padding: '40px 24px', minHeight: '160px',
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'var(--pm-card)', border: '1px solid var(--pm-border-bright)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
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

  const sorted = [...elements].sort((a, b) => {
    const za = zones.find((z) => z.id === a.zone_id)?.zone_number ?? 99;
    const zb = zones.find((z) => z.id === b.zone_id)?.zone_number ?? 99;
    return za - zb;
  });

  return (
    <div>
      {sorted.map((el, i) => {
        const zone      = zones.find((z) => z.id === el.zone_id);
        const zoneColor = zone?.color ?? 'var(--pm-border-bright)';
        const label     = el.metadata_json.name
          ?? el.metadata_json.poi_type
          ?? TYPE_LABEL[el.type]
          ?? el.type;

        // Emoji para POI, ícone SVG para outros tipos
        const poiDef    = el.type === 'poi' && el.metadata_json.poi_type
          ? POI_TYPE_DEFINITIONS[el.metadata_json.poi_type]
          : null;

        const area = el.metadata_json.area_m2;

        return (
          <div
            key={el.id}
            className="pm-zone-card pm-animate-in"
            style={{ borderLeft: `3px solid ${zoneColor}`, animationDelay: `${i * 30}ms` }}
            onClick={() => setPendingFlyTo(getElementCenter(el.geometry_geojson))}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setPendingFlyTo(getElementCenter(el.geometry_geojson))}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px 10px 14px' }}>

              {/* ── Badge emoji / ícone ── */}
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${zoneColor}15`,
                border: `1.5px solid ${zoneColor}35`,
              }}>
                {poiDef
                  ? <span style={{ fontSize: '15px', lineHeight: 1 }}>{poiDef.emoji}</span>
                  : <Icon name={TYPE_ICON[el.type] ?? 'map-pin'} size={14} color={zoneColor} />
                }
              </div>

              {/* ── Conteúdo ── */}
              <div style={{ flex: 1, minWidth: 0 }}>

                {/* Nome */}
                <p style={{
                  fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'var(--font-ui)',
                  color: 'var(--pm-text)', lineHeight: 1.3,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {label}
                </p>

                {/* Zona + Área */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  marginTop: '3px', overflow: 'hidden',
                }}>
                  {/* Ponto colorido */}
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: zoneColor, flexShrink: 0,
                  }} />

                  {/* Número da zona */}
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                    fontWeight: 700, color: zoneColor, flexShrink: 0,
                  }}>
                    Z{zone?.zone_number ?? '?'}
                  </span>

                  {/* Nome da zona */}
                  {zone && (
                    <span style={{
                      fontSize: '0.68rem', color: 'var(--pm-text-3)', fontFamily: 'var(--font-ui)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      · {zone.name}
                    </span>
                  )}

                  {/* Área */}
                  {area != null && (
                    <span style={{
                      fontSize: '0.68rem', color: 'var(--pm-text-2)',
                      fontFamily: 'var(--font-mono)', flexShrink: 0, marginLeft: '2px',
                    }}>
                      · {formatArea(area)}
                    </span>
                  )}
                </div>
              </div>

              {/* ── Ações (hover) ── */}
              <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                <button
                  className="pm-edit-btn"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '5px', borderRadius: '5px', color: 'var(--pm-text-3)',
                    display: 'flex', alignItems: 'center', transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--pm-text)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--pm-text-3)')}
                  onClick={(e) => { e.stopPropagation(); setEditingElementId(el.id); }}
                  title="Editar"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>

                <button
                  className="pm-delete-btn"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '5px', borderRadius: '5px', color: 'var(--pm-text-3)',
                    display: 'flex', alignItems: 'center', transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--pm-danger)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--pm-text-3)')}
                  onClick={(e) => { e.stopPropagation(); setElementToDelete({ id: el.id, label }); }}
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
        <ElementEditForm element={editingElement} onClose={() => setEditingElementId(null)} />
      )}

      <Dialog
        open={!!elementToDelete}
        title="Excluir Elemento?"
        description={`Tem certeza que deseja remover "${elementToDelete?.label}" definitivamente do mapa?`}
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
