import { useAuthStore } from '../../store/useAuthStore';
import { useAuth } from '../../hooks/useAuth';

// =====================
// UserFooter — rodapé fixo da sidebar esquerda
// =====================
// Exibe avatar com inicial, nome/email do usuário logado e botão de logout.
// Funciona como rodapé por ser o último filho de um flex-column com SidebarContent flex:1.

export function UserFooter() {
  const { user } = useAuthStore();
  const { signOut } = useAuth();

  if (!user) return null;

  // Nome de exibição: parte antes do @ no email
  const emailPrefix  = user.email?.split('@')[0] ?? 'usuário';
  const displayName  = user.user_metadata?.full_name ?? emailPrefix;
  const initial      = displayName[0].toUpperCase();

  return (
    <div
      style={{
        flexShrink:  0,
        borderTop:   '1px solid var(--pm-border)',
        padding:     'var(--space-sm) var(--space-md)',
        display:     'flex',
        alignItems:  'center',
        gap:         'var(--space-sm)',
        background:  'var(--pm-panel)',
      }}
    >
      {/* ── Avatar com inicial ── */}
      <div
        style={{
          width:          '32px',
          height:         '32px',
          borderRadius:   '50%',
          background:     'var(--pm-accent-muted)',
          border:         '1.5px solid var(--color-accent)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          flexShrink:     0,
          fontFamily:     'var(--font-ui)',
          fontWeight:     700,
          fontSize:       '0.8rem',
          color:          'var(--color-accent-deep)',
          letterSpacing:  '0.02em',
          userSelect:     'none',
        }}
      >
        {initial}
      </div>

      {/* ── Nome e email ── */}
      <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
        <p
          style={{
            fontFamily:   'var(--font-ui)',
            fontWeight:   600,
            fontSize:     '0.8rem',
            color:        'var(--pm-text)',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
            lineHeight:   1.3,
          }}
        >
          {displayName}
        </p>
        <p
          style={{
            fontFamily:   'var(--font-ui)',
            fontSize:     '0.65rem',
            color:        'var(--pm-text-3)',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
            marginTop:    '1px',
            lineHeight:   1.3,
          }}
        >
          {user.email}
        </p>
      </div>

      {/* ── Botão de logout ── */}
      <button
        onClick={signOut}
        title="Sair"
        style={{
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          width:           '28px',
          height:          '28px',
          borderRadius:    '6px',
          background:      'transparent',
          border:          '1px solid transparent',
          cursor:          'pointer',
          color:           'var(--pm-text-3)',
          flexShrink:      0,
          transition:      'background 0.15s, color 0.15s, border-color 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background   = 'var(--pm-danger-muted)';
          e.currentTarget.style.color        = 'var(--pm-danger)';
          e.currentTarget.style.borderColor  = 'rgba(255,107,107,0.22)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background   = 'transparent';
          e.currentTarget.style.color        = 'var(--pm-text-3)';
          e.currentTarget.style.borderColor  = 'transparent';
        }}
      >
        {/* Ícone: seta saindo pela porta */}
        <svg
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor"
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </div>
  );
}
