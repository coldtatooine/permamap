import { useMapStore } from '../../store/useMapStore';
import { ZoneCard, Icon } from '@permamap/ui';
import type { ZoneNumber } from '@permamap/ui';

export function ZonePanel() {
  const { zones, elements, removeZone, setActiveZone, activeZoneId } = useMapStore();

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
            onDelete={(e) => {
              e.stopPropagation();
              if (confirm(`Remover zona "${zone.name}" e todos seus elementos?`)) {
                removeZone(zone.id);
              }
            }}
          />
        );
      })}
    </div>
  );
}
