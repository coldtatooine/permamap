// =====================
// Permamap U — CourseCardSkeleton: placeholder animado durante carregamento
// =====================

export function CourseCardSkeleton() {
  return (
    <div
      style={{
        background: 'var(--pm-card)',
        borderRadius: '10px',
        border: '1px solid var(--pm-border)',
        overflow: 'hidden',
      }}
    >
      {/* Banner placeholder */}
      <div
        className="pm-skeleton"
        style={{ height: '160px', borderRadius: 0 }}
      />

      {/* Body placeholder */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Category pill */}
        <div className="pm-skeleton" style={{ height: '20px', width: '90px', borderRadius: '4px' }} />
        {/* Title line 1 */}
        <div className="pm-skeleton" style={{ height: '16px', width: '85%' }} />
        {/* Title line 2 */}
        <div className="pm-skeleton" style={{ height: '16px', width: '60%' }} />
        {/* Description */}
        <div className="pm-skeleton" style={{ height: '13px', width: '100%' }} />
        <div className="pm-skeleton" style={{ height: '13px', width: '75%' }} />
        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
          <div className="pm-skeleton" style={{ height: '12px', width: '80px' }} />
          <div className="pm-skeleton" style={{ height: '30px', width: '80px', borderRadius: '6px' }} />
        </div>
      </div>
    </div>
  );
}
