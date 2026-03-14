import { useState } from 'react';
import { useMapStore } from '../../store/useMapStore';
import { useProperty } from '../../hooks/useProperty';
import { ZONE_COLORS, ZONE_LABELS } from '../../types';
import type { ZoneNumber, GeoJSONPolygon } from '../../types';
import { Modal, Input, Select, Button, ModalFooter, Alert } from '@permamap/ui';

interface Props {
  onClose: () => void;
}

export function ZoneForm({ onClose }: Props) {
  const { zones, pendingGeometry, setPendingGeometry } = useMapStore();
  const { createZone } = useProperty();

  const usedNumbers = zones.map((z) => z.zone_number);
  const availableNumbers = ([0, 1, 2, 3, 4, 5] as ZoneNumber[]).filter(
    (n) => !usedNumbers.includes(n)
  );

  const [zoneNumber, setZoneNumber] = useState<ZoneNumber>(availableNumbers[0] ?? 0);
  const [name, setName]             = useState('');
  const [error, setError]           = useState('');
  const [saving, setSaving]         = useState(false);

  const previewColor = ZONE_COLORS[zoneNumber];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Nome é obrigatório.'); return; }
    if (!pendingGeometry || pendingGeometry.type !== 'Polygon') {
      setError('Geometria inválida.');
      return;
    }
    setSaving(true);
    setError('');
    const result = await createZone({
      zone_number:     zoneNumber,
      name:            name.trim(),
      polygon_geojson: pendingGeometry as GeoJSONPolygon,
    });
    setSaving(false);
    if (!result.success) { setError(result.error ?? 'Erro ao criar zona.'); return; }
    setPendingGeometry(null);
    onClose();
  }

  function handleCancel() {
    setPendingGeometry(null);
    onClose();
  }

  return (
    <Modal open onClose={handleCancel} title="Nova Zona" loading={saving}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Identificador de Criação */}
          <div style={{
            display:      'flex',
            alignItems:   'center',
            gap:          '10px',
            padding:      '10px 12px',
            borderRadius: '8px',
            background:   'var(--pm-card)',
            border:       '1px solid var(--pm-border)',
          }}>
            <div style={{
              width:          '28px',
              height:         '28px',
              borderRadius:   '50%',
              flexShrink:     0,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              background:     `${previewColor}18`,
              border:         `1.5px solid ${previewColor}50`,
              fontFamily:     'var(--font-mono)',
              fontSize:       '13px',
              color:          previewColor,
              fontWeight:     'bold'
            }}>
              {zoneNumber}
            </div>
            <span style={{
              fontSize:      '0.7rem',
              fontWeight:    700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color:         'var(--pm-text-3)',
              fontFamily:    'var(--font-ui)',
            }}>
              Baseada no polígono desenhado
            </span>
          </div>

        {/* Número da zona */}
        {/* @ts-expect-error - Mismatch in Select props with React versions */}
        <Select
          label="Número da Zona"
          value={zoneNumber as any}
          onChange={(e: any) => setZoneNumber(Number(e.target.value) as ZoneNumber)}
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
        {/* @ts-expect-error - Mismatch in Input props */}
        <Input
          label="Nome da Zona"
          value={name as any}
          onChange={(e: any) => setName(e.target.value)}
          placeholder="Ex: Horta Central"
          autoFocus={true as any}
        />

        {error && <Alert variant="danger">{error}</Alert>}

        <ModalFooter>
          <div style={{ display: 'flex', gap: '10px' }}>
            {/* @ts-expect-error - Mismatch in Button props */}
            <Button variant="ghost" type="button" onClick={handleCancel} fullWidth={true as any}>
              Cancelar
            </Button>
            {/* @ts-expect-error - Mismatch in Button props */}
            <Button type="submit" disabled={saving} fullWidth={true as any}>
              {saving ? 'Salvando…' : 'Criar Zona'}
            </Button>
          </div>
        </ModalFooter>
        </div>
      </form>
    </Modal>
  );
}
