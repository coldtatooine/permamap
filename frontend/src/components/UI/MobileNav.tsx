import { Icon } from '@permamap/ui';

export type MobilePanel = 'none' | 'left' | 'right';

interface MobileNavProps {
  activePanel: MobilePanel;
  onPanel: (p: MobilePanel) => void;
  hasProperty: boolean;
}

const NAV_ITEMS = [
  { id: 'left'  as const, label: 'Propriedades', icon: 'layers'  as const },
  { id: 'none'  as const, label: 'Mapa',         icon: 'hexagon' as const },
  { id: 'right' as const, label: 'Zonas',         icon: 'map-pin' as const },
] as const;

export function MobileNav({ activePanel, onPanel, hasProperty }: MobileNavProps) {
  return (
    <nav className="pm-mobile-nav" role="navigation" aria-label="Navegação principal">
      {NAV_ITEMS.map(({ id, label, icon }) => {
        const disabled = id === 'right' && !hasProperty;
        const active   = activePanel === id;
        const color    = active ? 'var(--pm-accent)' : disabled ? 'var(--pm-text-3)' : 'var(--pm-text-2)';

        function handleClick() {
          if (disabled) return;
          // Toggle: clicar na aba ativa fecha o painel (exceto "Mapa" que sempre vai para o mapa)
          onPanel(active && id !== 'none' ? 'none' : id);
        }

        return (
          <button
            key={id}
            className={`pm-mobile-nav-btn${active ? ' active' : ''}`}
            onClick={handleClick}
            disabled={disabled}
            aria-label={label}
            aria-pressed={active}
          >
            <Icon name={icon} size={20} color={color} />
            <span className="pm-mobile-nav-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
