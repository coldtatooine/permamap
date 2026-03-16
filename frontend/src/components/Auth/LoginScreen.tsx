import { useState } from 'react';
import type { FormEvent } from 'react';
import { Input, Button, Alert } from '@permamap/ui';
import { useAuth } from '../../hooks/useAuth';

// =====================
// LoginScreen — formulário de acesso
// =====================

interface LoginScreenProps {
  onSwitchToRegister: () => void;
}

export function LoginScreen({ onSwitchToRegister }: LoginScreenProps) {
  const { signIn } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) { setError('Preencha email e senha.'); return; }
    setError('');
    setLoading(true);
    const result = await signIn(email.trim(), password);
    setLoading(false);
    // Erro → exibe inline. Sucesso → onAuthStateChange no App.tsx desmonta esta tela.
    if (!result.success) setError(result.error ?? 'Erro ao entrar.');
  }

  return (
    <div className="pm-animate-in" style={{ width: '100%', maxWidth: '420px', position: 'relative', overflow: 'hidden' }}>
      {loading && <div className="pm-modal-progress" />}

      {/* Heading — tipografia alinhada ao padrão de títulos dos modais */}
      <div style={{ marginBottom: '28px' }}>
        <h2
          style={{
            fontFamily:    'var(--font-display)',
            fontSize:      'clamp(1.375rem, 3vw, 1.875rem)',
            fontWeight:    700,
            color:         'var(--pm-text)',
            lineHeight:    1.25,
            letterSpacing: '-0.02em',
          }}
        >
          Bem-vindo de volta
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize:   '0.875rem',
            color:      'var(--pm-text-2)',
            marginTop:  '8px',
            lineHeight: 1.6,
          }}
        >
          Acesse sua conta para continuar mapeando
        </p>
      </div>

      {error && (
        <div style={{ marginBottom: '20px' }}>
          <Alert variant="danger">{error}</Alert>
        </div>
      )}

      {/* Campos com gap: 16px — padrão dos form modals da área logada */}
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          autoFocus
          autoComplete="email"
        />
        <Input
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
        />
        <Button type="submit" disabled={loading} fullWidth>
          Entrar
        </Button>
      </form>

      {/* Switch para cadastro — marginTop alinhado ao ModalFooter (24px) */}
      <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.875rem', color: 'var(--pm-text-2)' }}>
        Não tem uma conta?{' '}
        <SwitchLink onClick={onSwitchToRegister}>Criar conta →</SwitchLink>
      </p>
    </div>
  );
}

// ── Link de troca de tela ────────────────────────────────────────────────────

function SwitchLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background:    'none',
        border:        'none',
        fontFamily:    'var(--font-ui)',
        fontSize:      '0.875rem',
        fontWeight:    600,
        color:         'var(--pm-accent)',
        cursor:        'pointer',
        padding:       0,
        transition:    'opacity 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.75'; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
    >
      {children}
    </button>
  );
}
