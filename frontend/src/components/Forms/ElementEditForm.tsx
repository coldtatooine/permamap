import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMapStore } from '../../store/useMapStore';
import { useProperty } from '../../hooks/useProperty';
import { POI_TYPES } from '../../types';
import type { Element, POIType } from '../../types';
import { Modal, Input, Select, Textarea, Button, ModalFooter, Alert } from '@permamap/ui';

interface Props {
  element:  Element;
  onClose:  () => void;
}

export function ElementEditForm({ element, onClose }: Props) {
  const { zones } = useMapStore();
  const { updateElement } = useProperty();

  const [name,   setName]   = useState(element.metadata_json.name   ?? '');
  const [zoneId, setZoneId] = useState(element.zone_id);
  const [notes,  setNotes]  = useState(element.metadata_json.notes  ?? '');
  const [areaM2, setAreaM2] = useState(element.metadata_json.area_m2?.toString() ?? '');
  const [poiType, setPoiType] = useState<POIType>(
    element.metadata_json.poi_type ?? POI_TYPES[0],
  );

  const [error,   setError]   = useState('');
  const [saving,  setSaving]  = useState(false);

  const selectedZone = zones.find((z) => z.id === zoneId);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Nome é obrigatório.'); return; }
    if (!zoneId)      { setError('Selecione uma zona.'); return; }

    setSaving(true);
    setError('');

    const metadata = {
      ...element.metadata_json,
      name:     name.trim(),
      notes:    notes.trim() || undefined,
      area_m2:  areaM2 ? parseFloat(areaM2) : undefined,
      ...(element.type === 'poi' ? { poi_type: poiType } : {}),
    };

    const result = await updateElement(element.id, { zone_id: zoneId, metadata_json: metadata });

    setSaving(false);

    if (!result.success) {
      setError(result.error ?? 'Erro ao salvar.');
      return;
    }

    onClose();
  }

  return (
    <Modal open onClose={onClose} loading={saving} title="Editar elemento">
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Identificador do tipo */}
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
              background:     selectedZone ? `${selectedZone.color}18` : 'var(--pm-card)',
              border:         `1.5px solid ${selectedZone ? `${selectedZone.color}50` : 'var(--pm-border-bright)'}`,
            }}>
              <span style={{ fontSize: '12px', color: selectedZone?.color ?? 'var(--pm-text-2)' }}>
                {{ poi: '⬟', culture: '⬡', animal: '♦', fence: '⬡' }[element.type] ?? '·'}
              </span>
            </div>
            <span style={{
              fontSize:      '0.7rem',
              fontWeight:    700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color:         'var(--pm-text-3)',
              fontFamily:    'var(--font-ui)',
            }}>
              {{ poi: 'POI', culture: 'Cultura', animal: 'Animal', fence: 'Cerca' }[element.type]}
            </span>
          </div>

          <Input
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do elemento"
            autoFocus
          />

          {element.type === 'poi' && (
            <Select
              label="Tipo de POI"
              value={poiType}
              onChange={(e) => setPoiType(e.target.value as POIType)}
            >
              {POI_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          )}

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
              <div style={{
                marginTop:   '6px',
                height:      '2px',
                borderRadius: '2px',
                background:  selectedZone.color,
                opacity:     0.6,
                transition:  'background 0.2s ease',
              }} />
            )}
          </div>

          <Textarea
            label="Observações (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Notas sobre este elemento…"
          />

          <Input
            label="Área estimada (m² — opcional)"
            type="number"
            value={areaM2}
            onChange={(e) => setAreaM2(e.target.value)}
            min="0"
            placeholder="Ex: 50"
          />

          {error && <Alert variant="danger">{error}</Alert>}

          <ModalFooter>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button variant="ghost" type="button" onClick={onClose} fullWidth>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} fullWidth>
                Salvar
              </Button>
            </div>
          </ModalFooter>
        </div>
      </form>
    </Modal>
  );
}
