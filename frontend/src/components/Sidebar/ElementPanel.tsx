import { useEffect, useRef, useState } from 'react';
import { useMapStore } from '../../store/useMapStore';
import { useProperty } from '../../hooks/useProperty';
import { Icon, Alert } from '@permamap/ui';
import { ElementEditForm } from '../Forms/ElementEditForm';
import type { Element, GeoJSONGeometry } from '../../types';

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
  const [pendingDelete, setPendingDelete] = useState<{ element: Element; label: string } | null>(null);
  const [deleteError, setDeleteError]     = useState<string | null>(null);
  const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (deleteTimer.current) clearTimeout(deleteTimer.current);
  }, []);

  // Delete otimista + Undo (8s) — sem confirmation dialog (design.md § Microinteractions)
  function handleDelete(id: string, label: string) {
    const snapshot = useMapStore.getState().elements.find((el) => el.id === id);
    if (!snapshot) return;
    if (pendingDelete) void commitDelete(pendingDelete);
    if (deleteTimer.current) clearTimeout(deleteTimer.current);
    useMapStore.getState().removeElement(id);
    setDeleteError(null);
    setPendingDelete({ element: snapshot, label });
    deleteTimer.current = setTimeout(() => { void commitDelete({ element: snapshot, label }); }, 8000);
  }

  async function commitDelete(pending: { element: Element; label: string }) {
    const res = await deleteElement(pending.element.id);
    if (!res.success) {
      useMapStore.getState().setElements([...useMapStore.getState().elements, pending.element]);
      setDeleteError(res.error ?? 'Erro ao excluir elemento.');
    }
    setPendingDelete((cur) => (cur?.element.id === pending.element.id ? null : cur));
  }

  function handleUndo() {
    if (deleteTimer.current) clearTimeout(deleteTimer.current);
    if (pendingDelete) {
      useMapStore.getState().setElements([...useMapStore.getState().elements, pendingDelete.element]);
    }
    setPendingDelete(null);
  }

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', padding: 'var(--space-sm)' }}>

      {/* Barra de Undo — delete otimista (8s) */}
      {pendingDelete && (
        <div
          className="pm-animate-in"
          role="status"
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
            padding: 'var(--space-xs) var(--space-sm)',
            background: 'var(--pm-card)', border: '1px solid var(--color-rule)',
            borderRadius: 'var(--radius-input)',
            fontSize: '0.8125rem', color: 'var(--pm-text-2)', fontFamily: 'var(--font-ui)',
          }}
        >
          <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            “{pendingDelete.label}” removido
          </span>
          <button
            onClick={handleUndo}
            style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              color: 'var(--color-accent-deep)', fontWeight: 700, fontSize: 'inherit',
              fontFamily: 'inherit', flexShrink: 0,
            }}
          >
            Desfazer
          </button>
        </div>
      )}

      {deleteError && <Alert variant="danger">{deleteError}</Alert>}

      {sorted.map((el, i) => {
        const zone      = zones.find((z) => z.id === el.zone_id);
        const zoneColor = zone?.color ?? 'var(--pm-border-bright)';
        const label     = el.metadata_json.name
          ?? el.metadata_json.poi_type
          ?? TYPE_LABEL[el.type]
          ?? el.type;

        const area = el.metadata_json.area_m2;

        return (
          <div
            key={el.id}
            className="pm-zone-card pm-animate-in"
            style={{ animationDelay: `${i * 30}ms` }}
            onClick={() => setPendingFlyTo(getElementCenter(el.geometry_geojson))}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setPendingFlyTo(getElementCenter(el.geometry_geojson))}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-xs) var(--space-sm)' }}>

              {/* ── Badge com ícone (emoji de POI só no marker do mapa) ── */}
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `color-mix(in oklch, ${zoneColor} 12%, transparent)`,
                border: `1.5px solid color-mix(in oklch, ${zoneColor} 35%, transparent)`,
              }}>
                <Icon name={TYPE_ICON[el.type] ?? 'map-pin'} size={14} color={zoneColor} />
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
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                    fontWeight: 700, color: zoneColor, flexShrink: 0,
                  }}>
                    Z{zone?.zone_number ?? '?'}
                  </span>

                  {/* Nome da zona */}
                  {zone && (
                    <span style={{
                      fontSize: '0.8125rem', color: 'var(--pm-text-3)', fontFamily: 'var(--font-ui)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      · {zone.name}
                    </span>
                  )}

                  {/* Área */}
                  {area != null && (
                    <span style={{
                      fontSize: '0.8125rem', color: 'var(--pm-text-2)',
                      fontFamily: 'var(--font-mono)', flexShrink: 0, marginLeft: '2px',
                    }}>
                      · {formatArea(area)}
                    </span>
                  )}
                </div>
              </div>

              {/* ── Ações (hover / focus-within / touch) ── */}
              <div style={{ display: 'flex', gap: 'var(--space-3xs)', flexShrink: 0 }}>
                <button
                  className="pm-edit-btn"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '5px', borderRadius: '5px', color: 'var(--pm-text-3)',
                    display: 'flex', alignItems: 'center',
                    transition: 'color var(--dur-micro) var(--ease-out)',
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
                    display: 'flex', alignItems: 'center',
                    transition: 'color var(--dur-micro) var(--ease-out)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--pm-danger)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--pm-text-3)')}
                  onClick={(e) => { e.stopPropagation(); handleDelete(el.id, label); }}
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
    </div>
  );
}
