import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMapStore } from '../../store/useMapStore';
import { useProperty } from '../../hooks/useProperty';
import { Input, Button, Modal, ModalFooter, Stepper, Alert, Icon } from '@permamap/ui';
import type { StepperStep } from '@permamap/ui';
import permamapLogo from '../../assets/permamap-logo-full.svg';

const STEPS: StepperStep[] = [
  { key: 'property', label: 'Propriedade', num: 1 },
  { key: 'zone0',    label: 'Zona 0',      num: 2 },
  { key: 'done',     label: 'Pronto',      num: 3 },
];

export function Wizard() {
  const { isWizardOpen, closeWizard, wizardStep, setWizardStep, pendingPropertyLocation } = useMapStore();
  const { createProperty } = useProperty();

  const [propName, setPropName] = useState('');
  const [error, setError]       = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const currentNum = STEPS.find((s) => s.key === wizardStep)?.num ?? 1;

  async function handleCreateProperty(e: FormEvent) {
    e.preventDefault();
    if (!propName.trim()) { setError('Nome é obrigatório.'); return; }
    setError('');
    setIsSaving(true);
    try {
      const [lat, lng] = pendingPropertyLocation ?? [undefined, undefined] as [undefined, undefined];
      await createProperty(propName.trim(), lat, lng);
      setWizardStep('zone0');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar propriedade.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      open={isWizardOpen}
      onClose={closeWizard}
      loading={isSaving}
      closeOnOverlay={false}
      maxWidth="440px"
    >
      {/* Stepper */}
      <Stepper steps={STEPS} currentNum={currentNum} className="mb-9" />

      {/* ── Step 1 – Propriedade ── */}
      {wizardStep === 'property' && (
        <form onSubmit={handleCreateProperty}>
          <div className="pm-animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--pm-text)',
                fontSize: '1.5rem',
                fontWeight: 600,
                lineHeight: 1.25,
              }}>
                Nova Propriedade
              </h2>
              <p style={{ fontSize: '0.875rem', marginTop: '8px', color: 'var(--pm-text-2)', lineHeight: 1.5 }}>
                Como se chama sua propriedade ou sítio?
              </p>
            </div>

            {/* Badge de localização definida */}
            {pendingPropertyLocation && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'var(--pm-accent-muted)',
                border: '1px solid var(--pm-accent)',
                opacity: 0.85,
              }}>
                <Icon name="map-pin" size={15} color="var(--color-accent-deep)" />
                <span style={{ fontSize: '0.8rem', color: 'var(--color-accent-deep)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
                  {pendingPropertyLocation[0].toFixed(5)}, {pendingPropertyLocation[1].toFixed(5)}
                </span>
              </div>
            )}

            <Input
              label="Nome"
              value={propName}
              onChange={(e) => setPropName(e.target.value)}
              placeholder="Ex: Sítio Boa Esperança"
              autoFocus
            />

            {error && <Alert variant="danger">{error}</Alert>}

            <ModalFooter>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button variant="ghost" type="button" onClick={closeWizard} fullWidth>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving} fullWidth>
                  {isSaving ? 'Criando…' : 'Próximo →'}
                </Button>
              </div>
            </ModalFooter>
          </div>
        </form>
      )}

      {/* ── Step 2 – Zona 0 ── */}
      {wizardStep === 'zone0' && (
        <div className="pm-animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--pm-text)',
              fontSize: '1.5rem',
              fontWeight: 600,
              lineHeight: 1.25,
            }}>
              Desenhe a Zona 0
            </h2>
            <p style={{ fontSize: '0.875rem', marginTop: '8px', color: 'var(--pm-text-2)', lineHeight: 1.5 }}>
              A Zona 0 representa sua <em>casa</em> ou centro da propriedade.
              Ela é obrigatória para salvar.
            </p>
          </div>

          {/* Chip visual da Zona 0 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderRadius: '12px',
            padding: '12px 16px',
            background: 'var(--color-danger-soft)',
            border: '1px solid var(--color-rule)',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.875rem',
              flexShrink: 0,
              background: 'var(--color-danger-soft)',
              border: '1.5px solid var(--color-rule-2)',
              color: 'var(--color-danger-deep)',
              fontFamily: 'var(--font-mono)',
            }}>
              0
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-danger-deep)' }}>Zona 0 – Casa</p>
              <p style={{ fontSize: '0.75rem', marginTop: '2px', color: 'var(--pm-text-2)' }}>
                Use <strong>Criar Zona</strong> no mapa e selecione o número 0.
              </p>
            </div>
          </div>

          <ModalFooter>
            <Button onClick={closeWizard} fullWidth>
              Ir para o mapa →
            </Button>
          </ModalFooter>
        </div>
      )}

      {/* ── Step 3 – Concluído ── */}
      {wizardStep === 'done' && (
        <div className="pm-animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
            <img src={permamapLogo} alt="Permamap" style={{ height: '56px', width: 'auto' }} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--pm-text)', fontSize: '1.5rem', fontWeight: 600 }}>
              Propriedade criada!
            </h2>
            <p style={{ fontSize: '0.875rem', marginTop: '8px', color: 'var(--pm-text-2)', lineHeight: 1.5 }}>
              Adicione zonas, culturas e elementos ao seu mapa de permacultura.
            </p>
          </div>
          <ModalFooter>
            <Button onClick={closeWizard} fullWidth>
              Começar a mapear →
            </Button>
          </ModalFooter>
        </div>
      )}
    </Modal>
  );
}
