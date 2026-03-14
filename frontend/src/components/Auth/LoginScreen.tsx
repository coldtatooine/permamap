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
    <div className="pm-animate-in" style={{ width: '100%', maxWidth: '380px', position: 'relative', overflow: 'hidden' }}>
      {loading && <div className="pm-modal-progress" />}

      {/* Heading */}
      <div style={{ marginBottom: '36px' }}>
        <h2
          style={{
            fontFamily:    'var(--font-display)',
            fontSize:      '1.875rem',
            fontWeight:    600,
            color:         'var(--pm-text)',
            lineHeight:    1.2,
            letterSpacing: '-0.01em',
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

      <form onSubmit={handleSubmit} className="space-y-5">
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
        <div style={{ paddingTop: '4px' }}>
          <Button type="submit" disabled={loading} fullWidth>
            Entrar
          </Button>
        </div>
      </form>

      {/* Switch para cadastro */}
      <p style={{ marginTop: '28px', textAlign: 'center', fontSize: '0.875rem', color: 'var(--pm-text-2)' }}>
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
