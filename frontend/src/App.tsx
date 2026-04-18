import { useEffect, useRef, useState } from 'react';
import { MapView } from './components/Map/MapView';
import { PropertyListPanel } from './components/Sidebar/PropertyListPanel';
import { PropertyConfigPanel } from './components/Sidebar/PropertyConfigPanel';
import { Wizard } from './components/UI/Wizard';
import { MobileNav, type MobilePanel } from './components/UI/MobileNav';
import { AuthScreen } from './components/Auth/AuthScreen';
import { useMapStore } from './store/useMapStore';
import { useAuthStore } from './store/useAuthStore';
import { useGeolocation } from './hooks/useGeolocation';
import { useResponsive } from './hooks/useResponsive';
import { supabase } from './lib/supabase';
import { Sidebar, SidebarHeader, SidebarToggle } from '@permamap/ui';
import { UserFooter } from './components/Sidebar/UserFooter';
import { UniversityAdmin } from './components/University/Admin/UniversityAdmin';
import { UniversityView } from './components/University/UniversityView';
import permamapLogo from './assets/permamap-logo-full.svg';

const LEFT_WIDTH  = 220;
const RIGHT_WIDTH = 280;

export default function App() {
  const { property, isLoading, activePanel, setActivePanel } = useMapStore();
  const { user, isAuthReady, isAdmin, setSession, setAuthReady } = useAuthStore();
  const { getCurrentPosition } = useGeolocation();
  const { isMobile } = useResponsive();
  const [sidebarOpen, setSidebarOpen]       = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [mobilePanel, setMobilePanel]       = useState<MobilePanel>('none');
  const prevPropertyId = useRef<string | null>(null);

  // ── Listener de autenticação ──
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setAuthReady();
        if (session !== null) {
          const { data } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', session.user.id)
            .maybeSingle();
          useAuthStore.getState().setIsAdmin(data?.is_admin ?? false);
        } else {
          useAuthStore.getState().setIsAdmin(false);
        }
      },
    );
    return () => subscription.unsubscribe();
  }, []);

  // ── Geolocalização ──
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

  // ── Quando propriedade muda: abre painéis e reseta estados ──
  useEffect(() => {
    if (property && property.id !== prevPropertyId.current) {
      // Nova propriedade selecionada
      setRightSidebarOpen(true);
      if (isMobile) setMobilePanel('right');
    } else if (!property) {
      if (isMobile) setMobilePanel('none');
    }
    prevPropertyId.current = property?.id ?? null;
  }, [property?.id, isMobile]);

  // ── Loading — Supabase resolvendo sessão ──
  if (!isAuthReady) {
    return (
      <div
        style={{
          position:       'fixed',
          inset:          0,
          background:     'var(--pm-void)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
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

  if (!user) return <AuthScreen />;

  // ════════════════════════════════════════════════
  //  Layout Mobile (< 768px)
  // ════════════════════════════════════════════════
  if (isMobile) {
    return (
      <div
        style={{
          position:   'relative',
          height:     '100dvh',
          overflow:   'hidden',
          background: 'var(--pm-void)',
        }}
      >
        {isLoading && <div className="pm-top-progress" />}

        {/* ── Conteúdo principal — Mapa ou Permamap U ── */}
        <main
          style={{
            position: 'absolute',
            top:      0,
            left:     0,
            right:    0,
            bottom:   '60px',  /* altura da nav */
          }}
        >
          {activePanel === 'university'
            ? (isAdmin ? <UniversityAdmin /> : <UniversityView />)
            : <MapView />
          }
        </main>

        {/* ── Backdrop — fecha painéis ao tocar fora ── */}
        {mobilePanel !== 'none' && (
          <div
            className="pm-mobile-backdrop"
            onClick={() => setMobilePanel('none')}
            aria-hidden="true"
          />
        )}

        {/* ── Painel Esquerdo — drawer bottom sheet ── */}
        <div className={`pm-mobile-bottom-sheet${mobilePanel === 'left' ? ' open' : ''}`}>
          <div className="pm-sheet-handle" />
          <SidebarHeader>
            <img
              src={permamapLogo}
              alt="Permamap"
              style={{ height: '28px', width: 'auto', display: 'block' }}
            />
          </SidebarHeader>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <PropertyListPanel />
          </div>
          <button
            className="pm-btn pm-btn-ghost"
            onClick={() => setActivePanel(activePanel === 'university' ? 'map' : 'university')}
            style={{ margin: '8px 12px', fontSize: '13px' }}
          >
            {activePanel === 'university' ? '← Mapa' : '🎓 Permamap U'}
          </button>
          <UserFooter />
        </div>

        {/* ── Painel Direito — bottom sheet ── */}
        {property && (
          <div className={`pm-mobile-bottom-sheet${mobilePanel === 'right' ? ' open' : ''}`}>
            {/* Handle de arraste visual */}
            <div className="pm-sheet-handle" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <PropertyConfigPanel />
            </div>
          </div>
        )}

        {/* ── Navegação inferior ── */}
        <MobileNav
          activePanel={mobilePanel}
          onPanel={setMobilePanel}
          hasProperty={!!property}
        />

        <Wizard />
      </div>
    );
  }

  // ════════════════════════════════════════════════
  //  Layout Desktop / Tablet (≥ 768px)
  // ════════════════════════════════════════════════
  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--pm-void)' }}>
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
        <button
          className="pm-btn pm-btn-ghost"
          onClick={() => setActivePanel(activePanel === 'university' ? 'map' : 'university')}
          style={{ margin: '8px 12px', fontSize: '13px' }}
        >
          {activePanel === 'university' ? '← Mapa' : '🎓 Permamap U'}
        </button>
        <UserFooter />
      </Sidebar>

      {/* ── Toggle da left sidebar ── */}
      <SidebarToggle
        open={sidebarOpen}
        offset={LEFT_WIDTH}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title={sidebarOpen ? 'Fechar painel' : 'Abrir painel'}
      />

      {/* ── Conteúdo principal — Mapa ou Permamap U ── */}
      <main className="flex-1 relative overflow-hidden">
        {activePanel === 'university'
          ? (isAdmin ? <UniversityAdmin /> : <UniversityView />)
          : <MapView />
        }
      </main>

      {/* ── Right Sidebar — configuração da propriedade ── */}
      <Sidebar open={!!property && rightSidebarOpen} width={RIGHT_WIDTH} side="right">
        <PropertyConfigPanel />
      </Sidebar>

      {/* ── Toggle da right sidebar (só quando property selecionada) ── */}
      {!!property && (
        <SidebarToggle
          open={rightSidebarOpen}
          offset={RIGHT_WIDTH}
          side="right"
          onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
          title={rightSidebarOpen ? 'Fechar painel' : 'Abrir painel'}
        />
      )}

      <Wizard />
    </div>
  );
}
