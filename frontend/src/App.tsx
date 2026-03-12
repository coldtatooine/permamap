import { useEffect, useState } from 'react';
import { MapView } from './components/Map/MapView';
import { PropertyListPanel } from './components/Sidebar/PropertyListPanel';
import { PropertyConfigPanel } from './components/Sidebar/PropertyConfigPanel';
import { Wizard } from './components/UI/Wizard';
import { useMapStore } from './store/useMapStore';
import { useGeolocation } from './hooks/useGeolocation';
import { Icon, Sidebar, SidebarHeader, SidebarToggle } from '@permamap/ui';

const LEFT_WIDTH  = 220;
const RIGHT_WIDTH = 280;

export default function App() {
  const { property, isLoading } = useMapStore();
  const { getCurrentPosition } = useGeolocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    getCurrentPosition()
      .then(({ lat, lng }) => {
        const { setUserLocation, setPendingFlyTo, property } = useMapStore.getState();
        setUserLocation([lat, lng]);
        if (!property?.location) setPendingFlyTo([lat, lng]);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--pm-void)' }}>
      {/* ── Global Top Progress Bar ── */}
      {isLoading && <div className="pm-top-progress" />}

      {/* ── Left Sidebar — lista de propriedades ── */}
      <Sidebar open={sidebarOpen} width={LEFT_WIDTH} side="left">
        <SidebarHeader>
          <div
            style={{
              width:          '28px',
              height:         '28px',
              borderRadius:   '50%',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              flexShrink:     0,
              background:     'var(--pm-accent-muted)',
              border:         '1.5px solid rgba(247,195,95,0.35)',
            }}
          >
            <Icon name="hexagon" size={14} color="var(--pm-accent)" />
          </div>
          <span
            style={{
              fontFamily:    'var(--font-display)',
              color:         'var(--pm-text)',
              fontWeight:    600,
              fontSize:      '1rem',
              letterSpacing: '0.04em',
            }}
          >
            Permamap
          </span>
        </SidebarHeader>

        <PropertyListPanel />
      </Sidebar>

      {/* ── Toggle da left sidebar ── */}
      <SidebarToggle
        open={sidebarOpen}
        offset={LEFT_WIDTH}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title={sidebarOpen ? 'Fechar painel' : 'Abrir painel'}
      />

      {/* ── Mapa ── */}
      <main className="flex-1 relative overflow-hidden">
        <MapView />
      </main>

      {/* ── Right Sidebar — configuração da propriedade selecionada ── */}
      <Sidebar open={!!property} width={RIGHT_WIDTH} side="right">
        <PropertyConfigPanel />
      </Sidebar>

      {/* ── Wizard overlay ── */}
      <Wizard />
    </div>
  );
}
