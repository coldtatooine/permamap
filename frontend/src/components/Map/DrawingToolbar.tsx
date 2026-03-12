import { useMapStore } from '../../store/useMapStore';
import { Icon, ToolButton } from '@permamap/ui';
import type { DrawingMode } from '../../store/useMapStore';
import type { IconName } from '@permamap/ui';

interface Props {
  onActivate: (mode: DrawingMode) => void;
}

const TOOLS: Array<{ mode: DrawingMode; label: string; icon: IconName; tip?: string }> = [
  { mode: 'zone',  label: 'Criar Zona',    icon: 'hexagon' },
  { mode: 'poi',   label: 'Adicionar POI', icon: 'map-pin' },
  { mode: 'fence', label: 'Cerca',         icon: 'fence'   },
];

export function DrawingToolbar({ onActivate }: Props) {
  const { zones, drawingMode, property } = useMapStore();
  const canAddZone = zones.length < 5;

  return (
    <div
      style={{
        position:   'absolute',
        top:        '16px',
        left:       '50%',
        transform:  'translateX(-50%)',
        zIndex:     1000,
        display:    'flex',
        gap:        '6px',
      }}
    >
      {TOOLS.map(({ mode, label, icon }) => {
        const disabled = !property || (mode === 'zone' && !canAddZone);
        const active   = drawingMode === mode;
        const iconColor = active ? '#1A1A1A' : disabled ? 'var(--pm-text-3)' : 'var(--pm-text)';

        return (
          <ToolButton
            key={mode}
            active={active}
            disabled={disabled}
            onClick={() => !disabled && onActivate(active ? null : mode)}
            title={mode === 'zone' && !canAddZone ? 'Máximo de 5 zonas atingido' : label}
          >
            <Icon name={icon} size={15} color={iconColor} />
            {label}
          </ToolButton>
        );
      })}
    </div>
  );
}
