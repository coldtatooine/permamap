import React from 'react';

// =====================
// Sidebar — container lateral colapsável
// =====================

export interface SidebarProps {
  open?:     boolean;
  width?:    number;
  children:  React.ReactNode;
  className?: string;
  /** Lado da sidebar: define qual borda é desenhada (padrão: 'left') */
  side?:     'left' | 'right';
}

export function Sidebar({ open = true, width = 280, children, className, side = 'left' }: SidebarProps) {
  return (
    <aside
      className={className}
      style={{
        width:           open ? width : 0,
        background:      'var(--pm-panel)',
        borderRight:     side === 'left'  ? '1px solid var(--pm-border)' : 'none',
        borderLeft:      side === 'right' ? '1px solid var(--pm-border)' : 'none',
        display:         'flex',
        flexDirection:   'column',
        flexShrink:      0,
        transition:      'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow:        'hidden',
      }}
    >
      {children}
    </aside>
  );
}

// ── SidebarHeader ─────────────────────────────────────────────────────────

export interface SidebarHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function SidebarHeader({ children, className }: SidebarHeaderProps) {
  return (
    <div
      className={className}
      style={{
        display:       'flex',
        alignItems:    'center',
        gap:           '12px',
        padding:       '16px 20px',
        flexShrink:    0,
        borderBottom:  '1px solid var(--pm-border)',
      }}
    >
      {children}
    </div>
  );
}

// ── SidebarTabs ───────────────────────────────────────────────────────────

export interface SidebarTab {
  key:   string;
  label: string;
}

export interface SidebarTabsProps {
  tabs:     SidebarTab[];
  active:   string;
  onChange: (key: string) => void;
  className?: string;
}

export function SidebarTabs({ tabs, active, onChange, className }: SidebarTabsProps) {
  return (
    <div
      className={className}
      style={{ display: 'flex', flexShrink: 0, borderBottom: '1px solid var(--pm-border)' }}
    >
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          style={{
            flex:           1,
            padding:        '11px 0',
            fontSize:       '0.7rem',
            fontWeight:     700,
            fontFamily:     'var(--font-ui)',
            letterSpacing:  '0.1em',
            textTransform:  'uppercase',
            background:     'transparent',
            border:         'none',
            borderBottom:   active === tab.key
              ? '2px solid var(--pm-accent)'
              : '2px solid transparent',
            color:          active === tab.key ? 'var(--pm-accent)' : 'var(--pm-text-3)',
            cursor:         'pointer',
            transition:     'color 0.18s ease',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ── SidebarContent ────────────────────────────────────────────────────────

export function SidebarContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className} style={{ flex: 1, overflowY: 'auto' }}>
      {children}
    </div>
  );
}

// ── SidebarSection ────────────────────────────────────────────────────────

export interface SidebarSectionProps {
  children:  React.ReactNode;
  bordered?: boolean;
  className?: string;
}

export function SidebarSection({ children, bordered = true, className }: SidebarSectionProps) {
  return (
    <div
      className={className}
      style={{
        flexShrink:    0,
        padding:       '20px',
        ...(bordered ? { borderBottom: '1px solid var(--pm-border)' } : {}),
      }}
    >
      {children}
    </div>
  );
}

// ── SidebarToggle ─────────────────────────────────────────────────────────

export interface SidebarToggleProps {
  open:     boolean;
  offset:   number;      // posição left em px (= width da sidebar quando aberta)
  onClick:  () => void;
  title?:   string;
}

export function SidebarToggle({ open, offset, onClick, title }: SidebarToggleProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        position:       'absolute',
        top:            '50%',
        transform:      'translateY(-50%)',
        left:           open ? offset : 0,
        zIndex:         1500,
        width:          '14px',
        height:         '44px',
        background:     'var(--pm-panel)',
        border:         '1px solid var(--pm-border-bright)',
        borderLeft:     'none',
        borderRadius:   '0 6px 6px 0',
        cursor:         'pointer',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        transition:     'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Chevron inline — sem importar Icon para evitar dependência circular */}
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
        stroke="var(--pm-text-3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {open
          ? <polyline points="15 18 9 12 15 6" />
          : <polyline points="9 18 15 12 9 6" />
        }
      </svg>
    </button>
  );
}
