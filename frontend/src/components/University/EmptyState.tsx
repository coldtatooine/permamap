// =====================
// Permamap U — EmptyState: estado vazio reutilizável
// =====================

interface EmptyStateProps {
  emoji?: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ emoji = '🌿', title, subtitle }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        gap: '12px',
        textAlign: 'center',
      }}
    >
      <span style={{ fontSize: '48px', lineHeight: 1, marginBottom: '4px' }}>{emoji}</span>
      <p
        style={{
          color: 'var(--pm-text-2)',
          fontSize: '16px',
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          margin: 0,
        }}
      >
        {title}
      </p>
      {subtitle && (
        <p style={{ color: 'var(--pm-text-3)', fontSize: '13px', margin: 0, maxWidth: '320px' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
