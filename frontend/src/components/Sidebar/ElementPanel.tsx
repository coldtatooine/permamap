import { useMapStore } from '../../store/useMapStore';
import { ZoneBadge, StatusBadge, Icon } from '@permamap/ui';
import type { ZoneNumber } from '@permamap/ui';

const TYPE_META: Record<string, { label: string; icon: React.ReactNode }> = {
  poi:     { label: 'POI',     icon: <Icon name="map-pin" size={14} color="currentColor" /> },
  culture: { label: 'Cultura', icon: <Icon name="layers"  size={14} color="currentColor" /> },
  animal:  { label: 'Animal',  icon: <Icon name="hexagon" size={14} color="currentColor" /> },
  fence:   { label: 'Cerca',   icon: <Icon name="fence"   size={14} color="currentColor" /> },
};

export function ElementPanel() {
  const { elements, zones, removeElement } = useMapStore();

  if (elements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 text-center p-6"
        style={{ minHeight: '140px' }}>
        <Icon name="map-pin" size={28} color="var(--pm-text-3)" />
        <p className="text-xs leading-relaxed" style={{ color: 'var(--pm-text-3)', maxWidth: '180px' }}>
          Adicione POIs e elementos às zonas do mapa
        </p>
      </div>
    );
  }

  return (
    <div>
      {elements.map((el, i) => {
        const zone  = zones.find((z) => z.id === el.zone_id);
        const label = el.metadata_json.name ?? el.metadata_json.poi_type ?? TYPE_META[el.type]?.label ?? el.type;
        const meta  = TYPE_META[el.type];

        return (
          <div
            key={el.id}
            className="pm-zone-card pm-animate-in"
            style={{
              animationDelay: `${i * 30}ms`,
              borderLeft: zone ? `3px solid ${zone.color}` : '3px solid var(--pm-border)',
            }}
          >
            <div className="flex items-center gap-3 px-4 py-[13px]">

              {/* Ícone de tipo com cor da zona */}
              <span
                className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-sm"
                style={{
                  color:      zone?.color ?? 'var(--pm-text-2)',
                  background: zone ? `${zone.color}14` : 'var(--pm-card)',
                }}
              >
                {meta?.icon}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate leading-tight"
                  style={{ color: 'var(--pm-text)' }}>
                  {label}
                </p>

                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <StatusBadge variant="neutral">{meta?.label ?? el.type}</StatusBadge>
                  {zone && (
                    <ZoneBadge zoneNumber={zone.zone_number as ZoneNumber} size="sm" />
                  )}
                  {el.metadata_json.notes && (
                    <span className="text-[10px] truncate" style={{ color: 'var(--pm-text-3)' }}>
                      {el.metadata_json.notes}
                    </span>
                  )}
                </div>
              </div>

              {/* Botão remover — visível no hover via .pm-delete-btn */}
              <button
                className="pm-delete-btn w-6 h-6 flex items-center justify-center rounded flex-shrink-0"
                style={{ color: 'var(--pm-text-3)', background: 'none', border: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--pm-danger)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--pm-text-3)')}
                onClick={() => { if (confirm(`Remover "${label}"?`)) removeElement(el.id); }}
                title="Remover"
              >
                <Icon name="trash" size={13} color="currentColor" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
