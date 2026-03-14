import { useState } from 'react';
import { useProperty } from '../../hooks/useProperty';
import { useMapStore } from '../../store/useMapStore';
import {
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
  const { property, isLoading, clearProperty } = useMapStore();
  const { deleteProperty: del } = useProperty();

  const [tab, setTab] = useState('zonas');

  // Dialog state
  const [showConfirm, setShowConfirm] = useState(false);

  if (!property) return null;

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

      {/* Abas */}
      <SidebarTabs tabs={TABS} active={tab} onChange={setTab} />

      {/* Conteúdo */}
      <SidebarContent>
        {tab === 'zonas' ? <ZonePanel /> : <ElementPanel />}
      </SidebarContent>

      {/* Botão excluir — fixo no bottom */}
      <SidebarSection bordered={false} style={{ marginTop: 'auto', borderTop: '1px solid var(--pm-border)' }}>
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
