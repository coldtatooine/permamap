import { useState } from 'react';
import { useMapStore } from '../../store/useMapStore';
import { POI_TYPES } from '../../types';
import type { POIType, GeoJSONPoint } from '../../types';
import { Modal, Input, Select, Textarea, Button, ModalFooter } from '@permamap/ui';

interface Props {
  onClose: () => void;
}

export function POIForm({ onClose }: Props) {
  const { zones, pendingGeometry, addElement, setPendingGeometry } = useMapStore();

  const [name, setName]       = useState('');
  const [poiType, setPoiType] = useState<POIType>(POI_TYPES[0]);
  const [zoneId, setZoneId]   = useState(zones[0]?.id ?? '');
  const [notes, setNotes]     = useState('');
  const [areaM2, setAreaM2]   = useState('');
  const [error, setError]     = useState('');

  const selectedZone = zones.find((z) => z.id === zoneId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Nome é obrigatório.'); return; }
    if (!zoneId) { setError('Selecione uma zona.'); return; }
    if (!pendingGeometry || pendingGeometry.type !== 'Point') {
      setError('Geometria inválida.');
      return;
    }
    const result = addElement({
      zone_id: zoneId,
      type: 'poi',
      geometry_geojson: pendingGeometry as GeoJSONPoint,
      metadata_json: {
        name: name.trim(),
        poi_type: poiType,
        notes: notes.trim() || undefined,
        area_m2: areaM2 ? parseFloat(areaM2) : undefined,
      },
    });
    if (!result.success) { setError(result.error ?? 'Erro ao criar POI.'); return; }
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
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-base"
            style={{
              background: selectedZone ? `${selectedZone.color}18` : 'var(--pm-card)',
              border: `2px solid ${selectedZone ? `${selectedZone.color}55` : 'var(--pm-border-bright)'}`,
              color: selectedZone?.color ?? 'var(--pm-text-2)',
              transition: 'all 0.2s ease',
            }}
          >
            ⬟
          </div>
          <div>
            <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--pm-text)' }}>
              Novo Ponto de Interesse
            </h2>
            <p className="text-xs" style={{ color: 'var(--pm-text-2)' }}>
              Marcador posicionado no mapa
            </p>
          </div>
        </div>

        {/* Nome */}
        <Input
          label="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Horta da Cozinha"
          autoFocus
        />

        {/* Tipo de POI */}
        <Select
          label="Tipo"
          value={poiType}
          onChange={(e) => setPoiType(e.target.value as POIType)}
        >
          {POI_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Select>

        {/* Zona vinculada */}
        <div>
          <Select
            label="Zona"
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value)}
          >
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                Zona {z.zone_number} – {z.name}
              </option>
            ))}
          </Select>
          {selectedZone && (
            <div
              className="mt-2 h-0.5 rounded-full transition-all duration-300"
              style={{ background: selectedZone.color, opacity: 0.7 }}
            />
          )}
        </div>

        {/* Observações */}
        <Textarea
          label="Observações (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Notas sobre este elemento…"
        />

        {/* Área */}
        <Input
          label="Área estimada (m² — opcional)"
          type="number"
          value={areaM2}
          onChange={(e) => setAreaM2(e.target.value)}
          min="0"
          placeholder="Ex: 50"
          error={error}
        />

        <ModalFooter>
          <div className="flex gap-3">
            <Button variant="ghost" type="button" onClick={handleCancel} fullWidth>
              Cancelar
            </Button>
            <Button type="submit" fullWidth>
              Adicionar POI
            </Button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
}
