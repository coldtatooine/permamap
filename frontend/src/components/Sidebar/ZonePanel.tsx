import { useMapStore } from '../../store/useMapStore';
import { ZoneCard, Icon } from '@permamap/ui';
import type { ZoneNumber } from '@permamap/ui';

export function ZonePanel() {
  const { zones, elements, removeZone, setActiveZone, activeZoneId } = useMapStore();

  if (zones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 text-center p-6"
        style={{ minHeight: '140px' }}>
        <Icon name="hexagon" size={28} color="var(--pm-text-3)" />
        <p className="text-xs leading-relaxed" style={{ color: 'var(--pm-text-3)', maxWidth: '180px' }}>
          Use <span className="font-semibold" style={{ color: 'var(--pm-text-2)' }}>Criar Zona</span> no mapa para começar
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
