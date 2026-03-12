import { useState } from 'react';
import { useMapStore } from '../../store/useMapStore';
import { useProperty } from '../../hooks/useProperty';
import { ZoneCard, Icon, Dialog } from '@permamap/ui';
import { ZoneEditForm } from '../Forms/ZoneEditForm';
import type { ZoneNumber } from '@permamap/ui';

export function ZonePanel() {
  const { zones, elements, setActiveZone, activeZoneId } = useMapStore();
  const { deleteZone } = useProperty();
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  
  // Dialog state
  const [zoneToDelete, setZoneToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    <div>
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
              setZoneToDelete(zone.id);
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

      {/* Confirmação de Exclusão */}
      <Dialog
        open={!!zoneToDelete}
        title="Excluir Zona?"
        description={`Remover zona "${zones.find(z => z.id === zoneToDelete)?.name}" e todos seus elementos associados?`}
        confirmText="Excluir Zona"
        cancelText="Cancelar"
        variant="danger"
        loading={isDeleting}
        onConfirm={async () => {
          if (!zoneToDelete) return;
          setIsDeleting(true);
          const res = await deleteZone(zoneToDelete);
          setIsDeleting(false);
          if (!res.success) alert(res.error);
          else setZoneToDelete(null);
        }}
        onCancel={() => setZoneToDelete(null)}
      />
    </div>
  );
}
