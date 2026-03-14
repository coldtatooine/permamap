import { useEffect, useState } from 'react';
import { MapView } from './components/Map/MapView';
import { PropertyListPanel } from './components/Sidebar/PropertyListPanel';
import { PropertyConfigPanel } from './components/Sidebar/PropertyConfigPanel';
import { Wizard } from './components/UI/Wizard';
import { AuthScreen } from './components/Auth/AuthScreen';
import { useMapStore } from './store/useMapStore';
import { useAuthStore } from './store/useAuthStore';
import { useGeolocation } from './hooks/useGeolocation';
import { supabase } from './lib/supabase';
import { Sidebar, SidebarHeader, SidebarToggle } from '@permamap/ui';
import { UserFooter } from './components/Sidebar/UserFooter';
import permamapLogo from './assets/permamap-logo.svg';

const LEFT_WIDTH  = 220;
const RIGHT_WIDTH = 280;

export default function App() {
  const { property, isLoading } = useMapStore();
  const { user, isAuthReady, setSession, setAuthReady } = useAuthStore();
  const { getCurrentPosition } = useGeolocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Listener de autenticação — deve ser o primeiro efeito ──
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setAuthReady();
      },
    );
    return () => subscription.unsubscribe();
  }, []);

  // ── Geolocalização — só executa após autenticação ──
  useEffect(() => {
    if (!user) return;
    getCurrentPosition()
      .then(({ lat, lng }) => {
        const { setUserLocation, setPendingFlyTo, property } = useMapStore.getState();
        setUserLocation([lat, lng]);
        if (!property?.location) setPendingFlyTo([lat, lng]);
      })
      .catch(() => {});
  }, [user]);

  // ── Loading enquanto o Supabase resolve a sessão ──
  if (!isAuthReady) {
    return (
      <div
        style={{
          position:        'fixed',
          inset:           0,
          background:      'var(--pm-void)',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
        }}
      >
        <img
          src={permamapLogo}
          alt="Permamap"
          style={{ height: '40px', width: 'auto', opacity: 0.6 }}
          className="pm-fade-in"
        />
      </div>
    );
  }

  // ── Tela de autenticação ──
  if (!user) return <AuthScreen />;

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--pm-void)' }}>
      {/* ── Global Top Progress Bar ── */}
      {isLoading && <div className="pm-top-progress" />}

      {/* ── Left Sidebar — lista de propriedades ── */}
      <Sidebar open={sidebarOpen} width={LEFT_WIDTH} side="left">
        <SidebarHeader>
          <img
            src={permamapLogo}
            alt="Permamap"
            style={{ height: '32px', width: 'auto', display: 'block' }}
          />
        </SidebarHeader>

        <PropertyListPanel />

        {/* Rodapé fixo com usuário + logout */}
        <UserFooter />
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
