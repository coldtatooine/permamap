import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Input, Button, Alert } from '@permamap/ui';
import { useAuth } from '../../hooks/useAuth';

// =====================
// RegisterScreen — formulário de cadastro + confirmação de email
// =====================

interface RegisterScreenProps {
  onSwitchToLogin: () => void;
}

export function RegisterScreen({ onSwitchToLogin }: RegisterScreenProps) {
  const { signUp, resendConfirmation } = useAuth();

  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError]                     = useState('');
  const [loading, setLoading]                 = useState(false);
  const [awaitingConfirmation, setAwaiting]   = useState(false);
  const [resendDone, setResendDone]           = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password || !confirmPassword) {
      setError('Preencha todos os campos.');
      return;
    }
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return; }
    if (password !== confirmPassword) { setError('As senhas não coincidem.'); return; }
    setError('');
    setLoading(true);
    const result = await signUp(email.trim(), password);
    setLoading(false);
    if (!result.success) { setError(result.error ?? 'Erro ao criar conta.'); return; }
    if (result.needsConfirmation) { setAwaiting(true); return; }
    // Sem confirmação: onAuthStateChange no App.tsx cuida do resto
  }

  async function handleResend() {
    setError('');
    setResendDone(false);
    setLoading(true);
    const result = await resendConfirmation(email.trim());
    setLoading(false);
    if (!result.success) setError(result.error ?? 'Erro ao reenviar email.');
    else setResendDone(true);
  }

  // ── Estado: aguardando confirmação de email ──────────────────────────────

  if (awaitingConfirmation) {
    return (
      <div className="pm-animate-in" style={{ width: '100%', maxWidth: '380px', position: 'relative', overflow: 'hidden' }}>
        {loading && <div className="pm-modal-progress" />}

        {/* Ícone de email */}
        <div
          style={{
            width:          '56px',
            height:         '56px',
            borderRadius:   '50%',
            background:     'var(--pm-accent-muted)',
            border:         '1.5px solid rgba(247,195,95,0.35)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            marginBottom:   '28px',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="var(--pm-accent)" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>

        <h2
          style={{
            fontFamily:    'var(--font-display)',
            fontSize:      '1.875rem',
            fontWeight:    600,
            color:         'var(--pm-text)',
            lineHeight:    1.2,
            letterSpacing: '-0.01em',
            marginBottom:  '12px',
          }}
        >
          Confirme seu email
        </h2>
        <p
          style={{
            fontFamily:  'var(--font-ui)',
            fontSize:    '0.875rem',
            color:       'var(--pm-text-2)',
            lineHeight:  1.65,
            marginBottom: '28px',
          }}
        >
          Enviamos um link de ativação para{' '}
          <strong style={{ color: 'var(--pm-accent)', fontWeight: 600 }}>{email}</strong>.{' '}
          Acesse sua caixa de entrada e clique no link para ativar a conta.
        </p>

        {resendDone && (
          <div style={{ marginBottom: '16px' }}>
            <Alert variant="success">Email reenviado com sucesso.</Alert>
          </div>
        )}
        {error && (
          <div style={{ marginBottom: '16px' }}>
            <Alert variant="danger">{error}</Alert>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="ghost" type="button" onClick={onSwitchToLogin} fullWidth>
            ← Voltar ao login
          </Button>
          <Button variant="ghost" type="button" onClick={handleResend} disabled={loading} fullWidth>
            Reenviar email
          </Button>
        </div>
      </div>
    );
  }

  // ── Formulário de cadastro ──────────────────────────────────────────────

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
          Criar conta
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize:   '0.875rem',
            color:      'var(--pm-text-2)',
            marginTop:  '8px',
          }}
        >
          Comece a mapear sua propriedade gratuitamente
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
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
        />
        <Input
          label="Confirmar senha"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
        />
        <div style={{ paddingTop: '4px' }}>
          <Button type="submit" disabled={loading} fullWidth>
            Criar conta
          </Button>
        </div>
      </form>

      {/* Switch para login */}
      <p style={{ marginTop: '28px', textAlign: 'center', fontSize: '0.875rem', color: 'var(--pm-text-2)' }}>
        Já tem uma conta?{' '}
        <SwitchLink onClick={onSwitchToLogin}>Entrar →</SwitchLink>
      </p>
    </div>
  );
}

// ── Link de troca de tela ────────────────────────────────────────────────────

function SwitchLink({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background:  'none',
        border:      'none',
        fontFamily:  'var(--font-ui)',
        fontSize:    '0.875rem',
        fontWeight:  600,
        color:       'var(--pm-accent)',
        cursor:      'pointer',
        padding:     0,
        transition:  'opacity 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.75'; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
    >
      {children}
    </button>
  );
}
