import { useState, useEffect, useRef } from 'react';
import { useMapStore } from '../../store/useMapStore';
import { Icon, ToolButton } from '@permamap/ui';
import type { DrawingMode } from '../../store/useMapStore';
import type { IconName } from '@permamap/ui';

interface Props {
  onActivate: (mode: DrawingMode) => void;
}

const OTHER_TOOLS: Array<{ mode: DrawingMode; label: string; icon: IconName }> = [
  { mode: 'poi',   label: 'Adicionar POI', icon: 'map-pin' },
  { mode: 'fence', label: 'Cerca',         icon: 'fence'   },
];

export function DrawingToolbar({ onActivate }: Props) {
  const { zones, drawingMode, property } = useMapStore();
  const [showZonePicker, setShowZonePicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const canAddZone  = zones.length < 5;
  const zoneDisabled = !property || !canAddZone;
  const zoneIsActive = drawingMode === 'zone' || drawingMode === 'zone-circle';

  // Fecha picker quando modo de desenho é ativado
  useEffect(() => {
    if (zoneIsActive) setShowZonePicker(false);
  }, [zoneIsActive]);

  // Fecha picker ao clicar fora
  useEffect(() => {
    if (!showZonePicker) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowZonePicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showZonePicker]);

  function handleZoneClick() {
    if (zoneDisabled) return;
    if (zoneIsActive) {
      onActivate(null);
    } else {
      setShowZonePicker((v) => !v);
    }
  }

  const zoneIconColor = zoneIsActive ? 'var(--color-accent-ink)'
    : zoneDisabled ? 'var(--pm-text-3)'
    : 'var(--pm-text)';

  return (
    <div className="pm-drawing-toolbar-wrapper">
      {/* Nome da propriedade — visível só no mobile */}
      {property && (
        <div className="pm-toolbar-property-name">
          <Icon name="hexagon" size={10} color="var(--pm-accent)" />
          <span>{property.name}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>

        {/* ── Criar Zona (com picker polígono / círculo) ── */}
        <div ref={pickerRef} style={{ position: 'relative' }}>
          <ToolButton
            active={zoneIsActive || showZonePicker}
            disabled={zoneDisabled}
            onClick={handleZoneClick}
            title={!canAddZone ? 'Máximo de 5 zonas atingido' : 'Criar Zona'}
          >
            <Icon name="hexagon" size={15} color={zoneIconColor} />
            <span className="pm-tool-label">Criar Zona</span>
          </ToolButton>

          {showZonePicker && (
            <div className="pm-zone-type-picker pm-animate-in">
              <button
                className="pm-zone-type-option"
                onClick={() => onActivate('zone')}
              >
                <Icon name="hexagon" size={14} color="currentColor" />
                Polígono
              </button>
              <button
                className="pm-zone-type-option"
                onClick={() => onActivate('zone-circle')}
              >
                <Icon name="circle" size={14} color="currentColor" />
                Círculo
              </button>
            </div>
          )}
        </div>

        {/* ── POI e Cerca ── */}
        {OTHER_TOOLS.map(({ mode, label, icon }) => {
          const disabled  = !property;
          const active    = drawingMode === mode;
          const iconColor = active ? 'var(--color-accent-ink)' : disabled ? 'var(--pm-text-3)' : 'var(--pm-text)';

          return (
            <ToolButton
              key={mode as string}
              active={active}
              disabled={disabled}
              onClick={() => !disabled && onActivate(active ? null : mode)}
              title={label}
            >
              <Icon name={icon} size={15} color={iconColor} />
              <span className="pm-tool-label">{label}</span>
            </ToolButton>
          );
        })}
      </div>
    </div>
  );
}
