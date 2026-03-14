import { useState } from 'react';
import type { FormEvent } from 'react';
import { useProperty } from '../../hooks/useProperty';
import type { Zone, ZoneNumber } from '../../types';
import { ZONE_LABELS } from '../../types';
import { Modal, Input, Select, Button, ModalFooter, Alert } from '@permamap/ui';

interface Props {
  zone:    Zone;
  onClose: () => void;
}

export function ZoneEditForm({ zone, onClose }: Props) {
  const { updateZone } = useProperty();

  const [name, setName] = useState(zone.name);
  const [zoneNumber, setZoneNumber] = useState<string>(zone.zone_number.toString());

  const [error,   setError]   = useState('');
  const [saving,  setSaving]  = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Nome é obrigatório.'); return; }

    setSaving(true);
    setError('');

    const zNum = parseInt(zoneNumber, 10) as ZoneNumber;

    const result = await updateZone(zone.id, {
      name: name.trim(),
      zone_number: zNum,
    });

    setSaving(false);

    if (!result.success) {
      setError(result.error ?? 'Erro ao salvar.');
      return;
    }

    onClose();
  }

  return (
    <Modal open onClose={onClose} loading={saving} title={`Editar Zona (${zone.name})`}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <Input
            label="Nome da Zona"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da zona"
            autoFocus
          />

          <Select
            label="Tipo de Zona"
            value={zoneNumber}
            onChange={(e) => setZoneNumber(e.target.value)}
          >
            {Object.entries(ZONE_LABELS).map(([numStr, label]) => (
              <option key={numStr} value={numStr}>
                {label}
              </option>
            ))}
          </Select>

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
