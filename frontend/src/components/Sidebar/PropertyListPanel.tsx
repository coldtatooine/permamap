import { useState, useEffect } from 'react';
import { useProperty } from '../../hooks/useProperty';
import { useMapStore } from '../../store/useMapStore';
import { Button, SidebarSection, SidebarContent, Icon } from '@permamap/ui';
import type { Property } from '../../types';

export function PropertyListPanel() {
  const { property, startPlacingProperty } = useMapStore();
  const { listProperties, loadProperty } = useProperty();
  const [properties, setProperties] = useState<Property[]>([]);

  // Re-carrega a lista ao montar e quando a propriedade ativa muda
  // (ex: após criar uma nova via wizard)
  useEffect(() => {
    listProperties().then(setProperties).catch(() => {});
  }, [property?.id]);

  return (
    <>
      <SidebarSection>
        <Button onClick={() => startPlacingProperty()}>+ Nova Propriedade</Button>
      </SidebarSection>

      <SidebarContent>
        <div style={{ padding: '16px 20px 8px' }}>
          <p className="pm-label">Propriedades salvas</p>
        </div>

        {properties.length === 0 ? (
          <div
            style={{
              padding:   '12px 20px',
              fontSize:  '0.75rem',
              fontStyle: 'italic',
              color:     'var(--pm-text-3)',
            }}
          >
            Nenhuma propriedade salva.
          </div>
        ) : (
          <div>
            {properties.map((p) => {
              const isActive = p.id === property?.id;
              return (
                <button
                  key={p.id}
                  onClick={() => loadProperty(p.id)}
                  title={p.name}
                  style={{
                    display:      'flex',
                    alignItems:   'center',
                    gap:          '10px',
                    width:        '100%',
                    textAlign:    'left',
                    padding:      '10px 20px',
                    fontSize:     '0.875rem',
                    fontFamily:   'var(--font-ui)',
                    fontWeight:   isActive ? 600 : 400,
                    color:        isActive ? 'var(--pm-accent)' : 'var(--pm-text)',
                    background:   isActive ? 'var(--pm-accent-muted)' : 'transparent',
                    border:       'none',
                    borderLeft:   isActive ? '2px solid var(--pm-accent)' : '2px solid transparent',
                    cursor:       'pointer',
                    transition:   'background-color var(--dur-micro) var(--ease-out), color var(--dur-micro) var(--ease-out)',
                    overflow:     'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace:   'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'var(--pm-card)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Icon
                    name="hexagon"
                    size={12}
                    color={isActive ? 'var(--pm-accent)' : 'var(--pm-text-3)'}
                  />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </SidebarContent>
    </>
  );
}
