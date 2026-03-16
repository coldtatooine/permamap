import { useState } from 'react';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';
import permamapLogo from '../../assets/permamap-logo-full.svg';

// =====================
// AuthScreen — layout split-screen (painel de marca + formulário)
// =====================
// Exibida quando o usuário não está autenticado. Não pode ser dispensada.

type AuthMode = 'login' | 'register';

// Cores e rótulos das zonas de permacultura
const ZONES = [
  { color: 'var(--z0)', label: 'Z0' },
  { color: 'var(--z1)', label: 'Z1' },
  { color: 'var(--z2)', label: 'Z2' },
  { color: 'var(--z3)', label: 'Z3' },
  { color: 'var(--z4)', label: 'Z4' },
  { color: 'var(--z5)', label: 'Z5' },
];

// Raios dos anéis decorativos (concêntrico, de fora para dentro)
const RING_RADII = [220, 178, 136, 96, 60, 30];

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login');

  return (
    <div
      style={{
        position:   'fixed',
        inset:      0,
        zIndex:     9999,
        display:    'flex',
        background: 'var(--pm-void)',
        overflow:   'hidden',
      }}
    >
      {/* ══════════════════════════════════════════════════════
          PAINEL ESQUERDO — Identidade Visual da Marca
          Oculto em telas pequenas via classe auth-brand-panel
          ══════════════════════════════════════════════════════ */}
      <div
        className="auth-brand-panel"
        style={{
          width:          '44%',
          minWidth:       '340px',
          maxWidth:       '560px',
          background:     'var(--ds-gradient-hero)',
          display:        'flex',
          flexDirection:  'column',
          padding:        '48px 52px',
          position:       'relative',
          overflow:       'hidden',
          flexShrink:     0,
        }}
      >
        {/* Decoração: diagrama de zonas concêntrico (watermark) */}
        <div
          aria-hidden
          style={{
            position:      'absolute',
            bottom:        '-140px',
            right:         '-120px',
            width:         '460px',
            height:        '460px',
            pointerEvents: 'none',
          }}
        >
          {RING_RADII.map((r, i) => (
            <div
              key={i}
              style={{
                position:     'absolute',
                width:        r * 2,
                height:       r * 2,
                borderRadius: '50%',
                border:       `1.5px solid ${ZONES[i].color}`,
                opacity:      0.14,
                top:          '50%',
                left:         '50%',
                transform:    'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>

        {/* Logo */}
        <img
          src={permamapLogo}
          alt="Permamap"
          style={{ height: '64px', width: 'auto', position: 'relative' }}
        />

        {/* Conteúdo central */}
        <div
          style={{
            flex:          1,
            display:       'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position:      'relative',
          }}
        >
          {/* Eyebrow */}
          <p
            style={{
              fontFamily:    'var(--font-ui)',
              fontSize:      '0.65rem',
              fontWeight:    700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color:         'var(--pm-accent)',
              marginBottom:  '16px',
            }}
          >
            Zoneamento em permacultura
          </p>

          {/* Headline principal */}
          <h1
            style={{
              fontFamily:    'var(--font-display)',
              fontSize:      'clamp(1.6rem, 2.2vw, 2.1rem)',
              fontWeight:    600,
              color:         'var(--pm-text)',
              lineHeight:    1.25,
              letterSpacing: '-0.01em',
            }}
          >
            Mapeie sua propriedade com sabedoria.
          </h1>

          {/* Separador dourado */}
          <div
            style={{
              width:        '40px',
              height:       '2px',
              background:   'var(--pm-accent)',
              borderRadius: '2px',
              margin:       '24px 0',
              opacity:      0.8,
            }}
          />

          {/* Descrição */}
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize:   '0.875rem',
              color:      'rgba(255,255,255,0.60)',
              lineHeight: 1.65,
              maxWidth:   '320px',
            }}
          >
            Desenhe zonas, adicione elementos e planeje seu sítio com base nos princípios da permacultura.
          </p>

          {/* Badges de zona */}
          <div
            style={{
              display:    'flex',
              gap:        '10px',
              marginTop:  '36px',
              alignItems: 'center',
            }}
          >
            {ZONES.map(({ color, label }) => (
              <div
                key={label}
                style={{
                  display:        'flex',
                  flexDirection:  'column',
                  alignItems:     'center',
                  gap:            '5px',
                }}
              >
                <div
                  style={{
                    width:        '24px',
                    height:       '24px',
                    borderRadius: '50%',
                    background:   color,
                    opacity:      0.8,
                  }}
                />
                <span
                  style={{
                    fontFamily:    'var(--font-mono)',
                    fontSize:      '0.6rem',
                    color:         'rgba(255,255,255,0.38)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Citação de rodapé */}
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize:   '0.8125rem',
            fontStyle:  'italic',
            color:      'rgba(255,255,255,0.35)',
            lineHeight: 1.6,
            position:   'relative',
          }}
        >
          "A permacultura é a arte de criar ecossistemas
          <br />que trabalham com a natureza, não contra ela."
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════
          PAINEL DIREITO — Formulário
          ══════════════════════════════════════════════════════ */}
      <div
        className="auth-panel-right"
        style={{
          flex:            1,
          display:         'flex',
          flexDirection:   'column',
          alignItems:      'center',
          justifyContent:  'center',
          padding:         'clamp(32px, 5vw, 60px) clamp(20px, 4vw, 40px)',
          overflowY:       'auto',
          background:      'var(--pm-void)',
          // Separador sutil à esquerda (visível apenas quando o painel de marca está presente)
          borderLeft:      '1px solid var(--pm-border)',
        }}
      >
        {/* Logo mobile — visível apenas quando painel de marca está oculto */}
        <div className="auth-logo-mobile" style={{ marginBottom: '28px' }}>
          <img src={permamapLogo} alt="Permamap" style={{ height: '32px', width: 'auto' }} />
        </div>

        {/* Card wrapper — transparente no desktop, modal-like no mobile */}
        <div className="auth-form-card">
          {mode === 'login'
            ? <LoginScreen    onSwitchToRegister={() => setMode('register')} />
            : <RegisterScreen onSwitchToLogin={() => setMode('login')} />
          }
        </div>
      </div>
    </div>
  );
}
