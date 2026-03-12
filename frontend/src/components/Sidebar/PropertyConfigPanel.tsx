import { useState } from 'react';
import { useProperty } from '../../hooks/useProperty';
import { useMapStore } from '../../store/useMapStore';
import {
  Alert,
  Button,
  SidebarHeader,
  SidebarTabs,
  SidebarContent,
  SidebarSection,
  Icon,
  Dialog,
} from '@permamap/ui';
import { ZonePanel } from './ZonePanel';
import { ElementPanel } from './ElementPanel';
import type { SidebarTab } from '@permamap/ui';

const TABS: SidebarTab[] = [
  { key: 'zonas',     label: 'Zonas'     },
  { key: 'elementos', label: 'Elementos' },
];

export function PropertyConfigPanel() {
  const { property, zones, isLoading, error, clearProperty } = useMapStore();
  const { saveProperty: save, deleteProperty: del } = useProperty();

  const [tab, setTab]       = useState('zonas');
  const [saveMsg, setSaveMsg] = useState('');
  
  // Dialog state
  const [showConfirm, setShowConfirm] = useState(false);

  if (!property) return null;

  const hasZone0 = zones.some((z) => z.zone_number === 0);

  async function handleSave() {
    setSaveMsg('');
    const result = await save();
    if (result.success) {
      setSaveMsg('Salvo!');
      setTimeout(() => setSaveMsg(''), 2800);
    }
  }

  return (
    <>
      {/* Cabeçalho: nome + botão voltar */}
      <SidebarHeader>
        <button
          onClick={clearProperty}
          title="Voltar à lista"
          style={{
            background:  'none',
            border:      'none',
            cursor:      'pointer',
            padding:     '4px',
            borderRadius: '6px',
            color:       'var(--pm-text-3)',
            display:     'flex',
            alignItems:  'center',
            flexShrink:  0,
            transition:  'color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--pm-text)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--pm-text-3)')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="pm-label" style={{ marginBottom: '1px' }}>Propriedade</p>
          <p style={{
            fontFamily:   'var(--font-display)',
            color:        'var(--pm-text)',
            fontWeight:   600,
            fontSize:     '0.95rem',
            lineHeight:   1.25,
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
          }}>
            {property.name}
          </p>
        </div>

        <Icon name="hexagon" size={16} color="var(--pm-accent)" />
      </SidebarHeader>

      {/* Seção salvar */}
      <SidebarSection>
        {!hasZone0 && (
          <div style={{ marginBottom: '12px' }}>
            <Alert variant="warn">Zona 0 é obrigatória para salvar.</Alert>
          </div>
        )}

        {/* @ts-expect-error type inference mismatch em Button */}
        <Button
          onClick={handleSave}
          disabled={isLoading || !hasZone0}
        >
          {saveMsg || 'Salvar propriedade'}
        </Button>

        {error && (
          <p style={{ fontSize: '0.75rem', color: 'var(--pm-danger)', marginTop: '6px' }}>
            {error}
          </p>
        )}
      </SidebarSection>

      {/* Abas */}
      <SidebarTabs tabs={TABS} active={tab} onChange={setTab} />

      {/* Conteúdo */}
      <SidebarContent>
        {tab === 'zonas' ? <ZonePanel /> : <ElementPanel />}
      </SidebarContent>

      {/* Botão excluir — fixo no bottom */}
      <SidebarSection bordered={false} style={{ marginTop: 'auto', borderTop: '1px solid var(--pm-border)' }}>
        {/* @ts-expect-error type inference mismatch em Button */}
        <Button
          variant="danger"
          onClick={() => setShowConfirm(true)}
          disabled={isLoading}
        >
          Excluir propriedade
        </Button>
      </SidebarSection>

      <Dialog
        open={showConfirm}
        title="Excluir propriedade?"
        description={`Tem certeza que deseja excluir "${property.name}" e todas as suas zonas e elementos? Esta ação não pode ser desfeita.`}
        confirmText="Excluir DEFINITIVAMENTE"
        cancelText="Cancelar"
        variant="danger"
        loading={isLoading}
        onConfirm={async () => {
          await del();
          setShowConfirm(false);
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
