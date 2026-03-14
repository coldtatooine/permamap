// =====================
// Stepper — indicador de progresso por passos
// =====================

export interface StepperStep {
  key:   string;
  label: string;
  num:   number;
}

export interface StepperProps {
  steps:      StepperStep[];
  currentNum: number;
  className?: string;
}

export function Stepper({ steps, currentNum, className = '' }: StepperProps) {
  return (
    <div className={`flex items-center justify-center gap-0 ${className}`}>
      {steps.map((step, i) => {
        const done    = currentNum > step.num;
        const current = currentNum === step.num;

        return (
          <div key={step.key} className="flex items-center">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div
                style={{
                  width:      '28px',
                  height:     '28px',
                  borderRadius: '50%',
                  display:    'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize:   '0.7rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  transition: 'all 0.3s ease',
                  background: done
                    ? 'var(--pm-accent)'
                    : current
                    ? 'var(--pm-accent-muted)'
                    : 'var(--pm-card)',
                  border: `1.5px solid ${done || current ? 'var(--pm-accent)' : 'var(--pm-border-bright)'}`,
                  color: done
                    ? '#1A1A1A'
                    : current
                    ? 'var(--pm-accent)'
                    : 'var(--pm-text-3)',
                  boxShadow: current ? '0 0 12px var(--pm-accent-muted)' : 'none',
                }}
              >
                {done ? '✓' : step.num}
              </div>
              <span
                style={{
                  fontSize:      '9px',
                  fontWeight:    600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color:         current ? 'var(--pm-accent)' : 'var(--pm-text-3)',
                }}
              >
                {step.label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div
                style={{
                  width:      '40px',
                  height:     '1px',
                  margin:     '0 4px 16px',
                  transition: 'background 0.5s ease',
                  background: done ? 'var(--pm-accent)' : 'var(--pm-border-bright)',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
