import { useEffect, useRef, useState } from 'react';
import { useMapStore } from '../../store/useMapStore';
import { useProperty } from '../../hooks/useProperty';
import { ZoneCard, Icon, Alert } from '@permamap/ui';
import { ZoneEditForm } from '../Forms/ZoneEditForm';
import type { ZoneNumber } from '@permamap/ui';
import type { Element, Zone } from '../../types';

export function ZonePanel() {
  const { zones, elements, setActiveZone, activeZoneId } = useMapStore();
  const { deleteZone } = useProperty();
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);

  // Delete otimista + Undo (8s) — sem confirmation dialog (design.md § Microinteractions)
  const [pendingDelete, setPendingDelete] = useState<{ zone: Zone; zoneElements: Element[] } | null>(null);
  const [deleteError, setDeleteError]     = useState<string | null>(null);
  const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (deleteTimer.current) clearTimeout(deleteTimer.current);
  }, []);

  function handleDelete(zoneId: string) {
    const state = useMapStore.getState();
    const zone = state.zones.find((z) => z.id === zoneId);
    if (!zone) return;
    const zoneElements = state.elements.filter((e) => e.zone_id === zoneId);
    if (pendingDelete) void commitDelete(pendingDelete);
    if (deleteTimer.current) clearTimeout(deleteTimer.current);
    state.removeZone(zoneId);
    setDeleteError(null);
    setPendingDelete({ zone, zoneElements });
    deleteTimer.current = setTimeout(() => { void commitDelete({ zone, zoneElements }); }, 8000);
  }

  async function commitDelete(pending: { zone: Zone; zoneElements: Element[] }) {
    const res = await deleteZone(pending.zone.id);
    if (!res.success) {
      rollback(pending);
      setDeleteError(res.error ?? 'Erro ao excluir zona.');
    }
    setPendingDelete((cur) => (cur?.zone.id === pending.zone.id ? null : cur));
  }

  function rollback(pending: { zone: Zone; zoneElements: Element[] }) {
    const state = useMapStore.getState();
    state.setZones([...state.zones, pending.zone]);
    state.setElements([...state.elements, ...pending.zoneElements]);
  }

  function handleUndo() {
    if (deleteTimer.current) clearTimeout(deleteTimer.current);
    if (pendingDelete) rollback(pendingDelete);
    setPendingDelete(null);
  }

  if (zones.length === 0) {
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
          <Icon name="hexagon" size={18} color="var(--pm-text-3)" />
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--pm-text-3)', maxWidth: '160px', lineHeight: 1.5 }}>
          Use <strong style={{ color: 'var(--pm-text-2)', fontWeight: 600 }}>Criar Zona</strong> no mapa para começar
        </p>
      </div>
    );
  }

  const sorted = [...zones].sort((a, b) => a.zone_number - b.zone_number);

  const editingZone = zones.find((z) => z.id === editingZoneId);

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
            Zona “{pendingDelete.zone.name}” excluída
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

      {sorted.map((zone, i) => {
        const count    = elements.filter((e) => e.zone_id === zone.id).length;
        const isActive = activeZoneId === zone.id;

        return (
          <ZoneCard
            key={zone.id}
            zoneNumber={zone.zone_number as ZoneNumber}
            name={zone.name}
            active={isActive}
            index={i}
            elementCount={count}
            onClick={() => setActiveZone(isActive ? null : zone.id)}
            onEdit={(e) => {
              e.stopPropagation();
              setEditingZoneId(zone.id);
            }}
            onDelete={(e) => {
              e.stopPropagation();
              handleDelete(zone.id);
            }}
          />
        );
      })}

      {editingZone && (
        <ZoneEditForm
          zone={editingZone}
          onClose={() => setEditingZoneId(null)}
        />
      )}
    </div>
  );
}
