import { useState } from 'react';
import { useMapStore } from '../../store/useMapStore';
import { ZONE_COLORS, ZONE_LABELS } from '../../types';
import type { ZoneNumber, GeoJSONPolygon } from '../../types';
import { Modal, Input, Select, Button, ModalFooter } from '@permamap/ui';

interface Props {
  onClose: () => void;
}

export function ZoneForm({ onClose }: Props) {
  const { zones, pendingGeometry, addZone, setPendingGeometry } = useMapStore();

  const usedNumbers = zones.map((z) => z.zone_number);
  const availableNumbers = ([0, 1, 2, 3, 4, 5] as ZoneNumber[]).filter(
    (n) => !usedNumbers.includes(n)
  );

  const [zoneNumber, setZoneNumber] = useState<ZoneNumber>(availableNumbers[0] ?? 0);
  const [name, setName]             = useState('');
  const [error, setError]           = useState('');

  const previewColor = ZONE_COLORS[zoneNumber];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Nome é obrigatório.'); return; }
    if (!pendingGeometry || pendingGeometry.type !== 'Polygon') {
      setError('Geometria inválida.');
      return;
    }
    const result = addZone({
      zone_number: zoneNumber,
      name: name.trim(),
      polygon_geojson: pendingGeometry as GeoJSONPolygon,
    });
    if (!result.success) { setError(result.error ?? 'Erro ao criar zona.'); return; }
    setPendingGeometry(null);
    onClose();
  }

  function handleCancel() {
    setPendingGeometry(null);
    onClose();
  }

  return (
    <Modal open onClose={handleCancel}>
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold flex-shrink-0"
            style={{
              background: `${previewColor}18`,
              border: `2px solid ${previewColor}55`,
              color: previewColor,
              fontFamily: 'var(--font-mono)',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            {zoneNumber}
          </div>
          <div>
            <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--pm-text)' }}>
              Nova Zona
            </h2>
            <p className="text-xs" style={{ color: 'var(--pm-text-2)' }}>
              Polígono desenhado no mapa
            </p>
          </div>
        </div>

        {/* Número da zona */}
        <Select
          label="Número da Zona"
          value={zoneNumber}
          onChange={(e) => setZoneNumber(Number(e.target.value) as ZoneNumber)}
        >
          {availableNumbers.map((n) => (
            <option key={n} value={n}>{ZONE_LABELS[n]}</option>
          ))}
        </Select>

        {/* Barra de cor preview */}
        <div
          className="h-1 w-full rounded-full transition-all duration-300"
          style={{ background: `linear-gradient(to right, ${previewColor}60, ${previewColor})` }}
        />

        {/* Nome */}
        <Input
          label="Nome da Zona"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Horta Central"
          error={error}
          autoFocus
        />

        <ModalFooter>
          <div className="flex gap-3">
            <Button variant="ghost" type="button" onClick={handleCancel} fullWidth>
              Cancelar
            </Button>
            <Button type="submit" fullWidth>
              Criar Zona
            </Button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
}
