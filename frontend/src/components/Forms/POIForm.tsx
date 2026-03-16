import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMapStore } from '../../store/useMapStore';
import { useProperty } from '../../hooks/useProperty';
import { POI_TYPES, POI_CATEGORIES, POI_TYPE_DEFINITIONS } from '../../types';
import type { POIType, GeoJSONPoint } from '../../types';
import { Modal, Input, Select, Textarea, Button, ModalFooter, Alert } from '@permamap/ui';

interface Props {
  onClose: () => void;
}

export function POIForm({ onClose }: Props) {
  const { zones, activeZoneId, pendingGeometry, setPendingGeometry } = useMapStore();
  const { createElement } = useProperty();

  // ── Controle de etapas ──────────────────────────────────────────────────
  const [step, setStep]       = useState<1 | 2>(1);
  const [poiType, setPoiType] = useState<POIType | null>(null);

  // ── Campos do formulário (etapa 2) ──────────────────────────────────────
  // Prioriza a zona ativa no mapa; fallback para a primeira da lista
  const [name,    setName]    = useState('');
  const [zoneId,  setZoneId]  = useState(activeZoneId ?? zones[0]?.id ?? '');
  const [notes,   setNotes]   = useState('');
  const [areaM2,  setAreaM2]  = useState('');
  const [error,   setError]   = useState('');
  const [saving,  setSaving]  = useState(false);

  const selectedZone = zones.find((z) => z.id === zoneId);

  // ── Submit final (etapa 2) ───────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!poiType)         { setError('Tipo inválido.'); return; }
    if (!name.trim())     { setError('Nome é obrigatório.'); return; }
    if (!zoneId)          { setError('Selecione uma zona.'); return; }
    if (!pendingGeometry || pendingGeometry.type !== 'Point') {
      setError('Geometria inválida.'); return;
    }
    setSaving(true);
    setError('');
    const result = await createElement({
      zone_id:          zoneId,
      type:             'poi',
      geometry_geojson: pendingGeometry as GeoJSONPoint,
      metadata_json: {
        name:     name.trim(),
        poi_type: poiType,
        notes:    notes.trim() || undefined,
        area_m2:  areaM2 ? parseFloat(areaM2) : undefined,
      },
    });
    setSaving(false);
    if (!result.success) { setError(result.error ?? 'Erro ao criar POI.'); return; }
    setPendingGeometry(null);
    onClose();
  }

  function handleCancel() {
    setPendingGeometry(null);
    onClose();
  }

  // ── Definição selecionada ────────────────────────────────────────────────
  const def = poiType ? POI_TYPE_DEFINITIONS[poiType] : null;

  return (
    <Modal
      open
      onClose={handleCancel}
      loading={saving}
      maxWidth="500px"
      title={step === 1 ? 'Novo Ponto de Interesse' : `${def?.label ?? ''}`}
    >
      {/* ── ETAPA 1 — Seleção do tipo ──────────────────────────────────── */}
      {step === 1 && (
        <div className="pm-animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Instrução */}
          <p style={{ fontSize: '0.8125rem', color: 'var(--pm-text-2)', marginTop: '-4px' }}>
            Escolha o tipo de elemento que você está adicionando ao mapa.
          </p>

          {/* Grade de tipos agrupada por categoria */}
          <div style={{ maxHeight: '340px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '4px' }}>
            {POI_CATEGORIES.map((cat) => {
              const catTypes = POI_TYPES.filter((t) => POI_TYPE_DEFINITIONS[t].category === cat);
              if (catTypes.length === 0) return null;
              return (
                <div key={cat}>
                  {/* Cabeçalho da categoria */}
                  <div style={{
                    fontSize:      '0.65rem',
                    fontWeight:    700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color:         'var(--pm-text-3)',
                    fontFamily:    'var(--font-ui)',
                    marginBottom:  '8px',
                  }}>
                    {cat}
                  </div>
                  {/* Chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {catTypes.map((t) => {
                      const selected = poiType === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setPoiType(t)}
                          style={{
                            display:       'flex',
                            alignItems:    'center',
                            gap:           '5px',
                            padding:       '5px 12px',
                            borderRadius:  '20px',
                            border:        `1.5px solid ${selected ? 'var(--pm-accent)' : 'var(--pm-border-bright)'}`,
                            background:    selected ? 'var(--pm-accent-muted)' : 'transparent',
                            color:         selected ? 'var(--pm-accent)' : 'var(--pm-text-2)',
                            fontSize:      '0.8rem',
                            fontFamily:    'var(--font-ui)',
                            fontWeight:    selected ? 600 : 400,
                            cursor:        'pointer',
                            transition:    'all 0.15s ease',
                            whiteSpace:    'nowrap',
                          }}
                        >
                          <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>
                            {POI_TYPE_DEFINITIONS[t].emoji}
                          </span>
                          {POI_TYPE_DEFINITIONS[t].label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Caixa de descrição — aparece ao selecionar */}
          <div style={{
            minHeight:    '72px',
            borderRadius: '8px',
            padding:      def ? '12px 14px' : '0',
            background:   def ? 'var(--pm-card)' : 'transparent',
            border:       def ? '1px solid var(--pm-border-bright)' : 'none',
            borderLeft:   def ? '3px solid var(--pm-accent)' : 'none',
            transition:   'all 0.2s ease',
            overflow:     'hidden',
          }}>
            {def && (
              <div className="pm-fade-in">
                <div style={{
                  fontSize:      '0.65rem',
                  fontWeight:    700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color:         'var(--pm-accent)',
                  marginBottom:  '5px',
                  fontFamily:    'var(--font-ui)',
                }}>
                  {def.zones}
                </div>
                <p style={{
                  fontSize:   '0.8125rem',
                  color:      'var(--pm-text-2)',
                  lineHeight: 1.55,
                  margin:     0,
                  fontFamily: 'var(--font-ui)',
                }}>
                  {def.description}
                </p>
              </div>
            )}
          </div>

          {/* Botões etapa 1 */}
          <ModalFooter>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button variant="ghost" type="button" onClick={handleCancel} fullWidth>
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={() => setStep(2)}
                disabled={!poiType}
                fullWidth
              >
                Próximo →
              </Button>
            </div>
          </ModalFooter>
        </div>
      )}

      {/* ── ETAPA 2 — Configurações ────────────────────────────────────── */}
      {step === 2 && (
        <form onSubmit={handleSubmit}>
          <div className="pm-animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Badge do tipo selecionado */}
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
                <span style={{ fontSize: '14px', lineHeight: 1 }}>{def?.emoji}</span>
              </div>
              <div>
                <div style={{
                  fontSize:      '0.8125rem',
                  fontWeight:    600,
                  color:         'var(--pm-text)',
                  fontFamily:    'var(--font-ui)',
                }}>
                  {def?.label}
                </div>
                <div style={{
                  fontSize:      '0.7rem',
                  color:         'var(--pm-text-3)',
                  fontFamily:    'var(--font-ui)',
                  marginTop:     '1px',
                }}>
                  {def?.zones}
                </div>
              </div>
            </div>

            {/* Nome */}
            <Input
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Ex: ${def?.label ?? 'Elemento'} Principal`}
              autoFocus
            />

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
                <div style={{
                  marginTop:    '6px',
                  height:       '2px',
                  borderRadius: '2px',
                  background:   selectedZone.color,
                  opacity:      0.6,
                  transition:   'background 0.2s ease',
                }} />
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
            />

            {error && <Alert variant="danger">{error}</Alert>}

            <ModalFooter>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  fullWidth
                >
                  ← Voltar
                </Button>
                <Button type="submit" disabled={saving} fullWidth>
                  {saving ? 'Salvando…' : 'Adicionar POI'}
                </Button>
              </div>
            </ModalFooter>
          </div>
        </form>
      )}
    </Modal>
  );
}
