import { useState } from 'react';
import { useMapStore } from '../../store/useMapStore';
import { useProperty } from '../../hooks/useProperty';
import { useGeolocation } from '../../hooks/useGeolocation';
import { Input, Button, Modal, Stepper, Divider, Icon } from '@permamap/ui';
import type { StepperStep } from '@permamap/ui';
import permamapLogo from '../../assets/permamap-logo.svg';

const STEPS: StepperStep[] = [
  { key: 'property', label: 'Propriedade', num: 1 },
  { key: 'location', label: 'Localização',  num: 2 },
  { key: 'zone0',    label: 'Zona 0',       num: 3 },
  { key: 'done',     label: 'Pronto',        num: 4 },
];

export function Wizard() {
  const { isWizardOpen, closeWizard, wizardStep, setWizardStep } = useMapStore();
  const { createProperty } = useProperty();
  const { getCurrentPosition } = useGeolocation();

  const [propName, setPropName]       = useState('');
  const [address, setAddress]         = useState('');
  const [error, setError]             = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating]   = useState(false);

  const currentNum = STEPS.find((s) => s.key === wizardStep)?.num ?? 1;

  async function handleCreateProperty(e: React.FormEvent) {
    e.preventDefault();
    if (!propName.trim()) { setError('Nome é obrigatório.'); return; }
    setError('');
    try {
      await createProperty(propName.trim());
      setWizardStep('location');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar propriedade.');
    }
  }

  function applyLocation(lat: number, lng: number) {
    const { setProperty } = useMapStore.getState();
    const current = useMapStore.getState().property;
    if (current) {
      setProperty({ ...current, location: { type: 'Point', coordinates: [lng, lat] } });
    }
  }

  async function handleUseMyLocation() {
    setIsLocating(true);
    setError('');
    try {
      const { lat, lng } = await getCurrentPosition();
      applyLocation(lat, lng);
      useMapStore.getState().setUserLocation([lat, lng]);
      setWizardStep('zone0');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao obter localização.');
    } finally {
      setIsLocating(false);
    }
  }

  async function handleSearchAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim()) { setWizardStep('zone0'); return; }
    setIsSearching(true);
    setError('');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
      );
      const data = await res.json();
      if (data.length === 0) { setError('Endereço não encontrado. Tente novamente ou pule.'); return; }
      const { lat, lon } = data[0];
      applyLocation(parseFloat(lat), parseFloat(lon));
      setWizardStep('zone0');
    } catch {
      setError('Erro ao buscar endereço.');
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <Modal open={isWizardOpen} onClose={closeWizard} loading={isLocating || isSearching} zIndex={3000} closeOnOverlay={false} maxWidth="440px">
      {/* Stepper */}
      <Stepper steps={STEPS} currentNum={currentNum} className="mb-9" />

      {/* ── Step 1 – Propriedade ── */}
      {wizardStep === 'property' && (
        <form onSubmit={handleCreateProperty} className="space-y-5 pm-animate-in">
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--pm-text)', fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.25 }}>
              Nova Propriedade
            </h2>
            <p style={{ fontSize: '0.875rem', marginTop: '8px', color: 'var(--pm-text-2)' }}>
              Como se chama sua propriedade ou sítio?
            </p>
          </div>

          <Input
            label="Nome"
            value={propName}
            onChange={(e) => setPropName(e.target.value)}
            placeholder="Ex: Sítio Boa Esperança"
            error={error}
            autoFocus
          />

          <Button type="submit">Próximo →</Button>
        </form>
      )}

      {/* ── Step 2 – Localização ── */}
      {wizardStep === 'location' && (
        <div className="space-y-5 pm-animate-in">
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--pm-text)', fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.25 }}>
              Localização
            </h2>
            <p style={{ fontSize: '0.875rem', marginTop: '8px', color: 'var(--pm-text-2)' }}>
              Centralize o mapa na sua propriedade para melhor precisão.
            </p>
          </div>

          {/* Geolocalização */}
          <Button
            variant="ghost"
            onClick={handleUseMyLocation}
            disabled={isLocating}
            fullWidth
          >
            {!isLocating && <Icon name="locate" size={15} color="var(--pm-accent)" />}
            {isLocating ? 'Obtendo localização…' : 'Usar minha localização atual'}
          </Button>

          <Divider label="ou" />

          {/* Busca por endereço */}
          <form onSubmit={handleSearchAddress} className="space-y-4">
            <Input
              label="Buscar por endereço"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: Pirenópolis, GO"
              error={error}
            />

            <div className="flex gap-2">
              <Button variant="ghost" type="button" onClick={() => setWizardStep('zone0')} fullWidth>
                Pular
              </Button>
              <Button type="submit" disabled={isSearching} fullWidth>
                {isSearching ? 'Buscando…' : 'Centralizar →'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ── Step 3 – Zona 0 ── */}
      {wizardStep === 'zone0' && (
        <div className="space-y-5 pm-animate-in">
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--pm-text)', fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.25 }}>
              Desenhe a Zona 0
            </h2>
            <p style={{ fontSize: '0.875rem', marginTop: '8px', color: 'var(--pm-text-2)' }}>
              A Zona 0 representa sua <em>casa</em> ou centro da propriedade.
              Ela é obrigatória para salvar.
            </p>
          </div>

          {/* Chip visual da Zona 0 */}
          <div
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:        '12px',
              borderRadius: '12px',
              padding:    '12px 16px',
              background: 'rgba(255,77,77,0.09)',
              border:     '1px solid rgba(255,77,77,0.28)',
            }}
          >
            <div
              style={{
                width:       '32px',
                height:      '32px',
                borderRadius: '50%',
                display:     'flex',
                alignItems:  'center',
                justifyContent: 'center',
                fontWeight:  700,
                fontSize:    '0.875rem',
                flexShrink:  0,
                background:  'rgba(255,77,77,0.16)',
                border:      '1.5px solid rgba(255,77,77,0.4)',
                color:       '#ff4d4d',
                fontFamily:  'var(--font-mono)',
              }}
            >
              0
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ff4d4d' }}>Zona 0 – Casa</p>
              <p style={{ fontSize: '0.75rem', marginTop: '2px', color: 'var(--pm-text-2)' }}>
                Use <strong>Criar Zona</strong> no mapa e selecione o número 0.
              </p>
            </div>
          </div>

          <Button onClick={closeWizard}>Ir para o mapa →</Button>
        </div>
      )}

      {/* ── Step 4 – Concluído ── */}
      {wizardStep === 'done' && (
        <div className="space-y-5 text-center pm-animate-in">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
            <img src={permamapLogo} alt="Permamap" style={{ height: '56px', width: 'auto' }} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--pm-text)', fontSize: '1.5rem', fontWeight: 600 }}>
              Propriedade criada!
            </h2>
            <p style={{ fontSize: '0.875rem', marginTop: '8px', color: 'var(--pm-text-2)' }}>
              Adicione zonas, culturas e elementos ao seu mapa de permacultura.
            </p>
          </div>
          <Button onClick={closeWizard}>Começar a mapear →</Button>
        </div>
      )}
    </Modal>
  );
}
