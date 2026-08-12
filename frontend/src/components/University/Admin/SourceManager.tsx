import { useEffect, useState } from 'react';
import { useUniversity } from '../../../hooks/useUniversity';
import type { CuratedSource, CourseCategory, CreateSourceInput } from '../../../types/university';
import { COURSE_CATEGORY_LABELS } from '../../../types/university';
import { SourceForm } from './SourceForm';

type CategoryFilter = CourseCategory | 'all';

type ModalState =
  | { kind: 'none' }
  | { kind: 'create' }
  | { kind: 'edit'; source: CuratedSource }
  | { kind: 'confirm-archive'; sourceId: string; sourceTitle: string };

export function SourceManager() {
  const {
    sources,
    sourcesLoading,
    sourcesError,
    fetchSources,
    createSource,
    updateSource,
    archiveSource,
  } = useUniversity();

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [modal, setModal] = useState<ModalState>({ kind: 'none' });
  const [isSaving, setIsSaving] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  useEffect(() => {
    void fetchSources();
  }, [fetchSources]);

  const filteredSources =
    categoryFilter === 'all'
      ? sources
      : sources.filter((s) => s.category === categoryFilter);

  async function handleCreate(data: CreateSourceInput) {
    setIsSaving(true);
    try {
      await createSource(data);
      setModal({ kind: 'none' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleEdit(source: CuratedSource, data: CreateSourceInput) {
    setIsSaving(true);
    try {
      await updateSource(source.id, data);
      setModal({ kind: 'none' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleArchiveConfirm(sourceId: string) {
    setArchiveError(null);
    try {
      await archiveSource(sourceId);
      setModal({ kind: 'none' });
    } catch (err) {
      setArchiveError(err instanceof Error ? err.message : 'Erro ao arquivar');
    }
  }

  const categories = Object.keys(COURSE_CATEGORY_LABELS) as CourseCategory[];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        {/* Category filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            className={`pm-btn ${categoryFilter === 'all' ? 'pm-btn-primary' : 'pm-btn-ghost'}`}
            style={{ fontSize: '12px', padding: '4px 10px' }}
            onClick={() => setCategoryFilter('all')}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`pm-btn ${categoryFilter === cat ? 'pm-btn-primary' : 'pm-btn-ghost'}`}
              style={{ fontSize: '12px', padding: '4px 10px' }}
              onClick={() => setCategoryFilter(cat)}
            >
              {COURSE_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <button
          className="pm-btn pm-btn-primary"
          style={{ fontSize: '13px' }}
          onClick={() => setModal({ kind: 'create' })}
        >
          + Nova Fonte
        </button>
      </div>

      {/* Error state */}
      {sourcesError && (
        <p style={{ color: 'var(--pm-danger)', fontSize: '13px' }}>{sourcesError}</p>
      )}

      {/* Loading state */}
      {sourcesLoading && (
        <p style={{ color: 'var(--pm-text-3)', fontSize: '13px', textAlign: 'center', padding: '32px' }}>
          Carregando fontes...
        </p>
      )}

      {/* Empty state */}
      {!sourcesLoading && filteredSources.length === 0 && (
        <p style={{ color: 'var(--pm-text-3)', fontSize: '13px', textAlign: 'center', padding: '32px' }}>
          Nenhuma fonte cadastrada ainda
        </p>
      )}

      {/* Source list */}
      {!sourcesLoading && filteredSources.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredSources.map((source) => (
            <SourceRow
              key={source.id}
              source={source}
              onEdit={() => setModal({ kind: 'edit', source })}
              onArchive={() =>
                setModal({ kind: 'confirm-archive', sourceId: source.id, sourceTitle: source.title })
              }
            />
          ))}
        </div>
      )}

      {/* Modal: Create */}
      {modal.kind === 'create' && (
        <div className="pm-overlay" onClick={() => setModal({ kind: 'none' })}>
          <div className="pm-modal pm-animate-in" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: 'var(--pm-text)', marginBottom: '16px', fontFamily: 'var(--font-display)', fontSize: '18px' }}>
              Nova Fonte
            </h3>
            <SourceForm
              onSave={handleCreate}
              onCancel={() => setModal({ kind: 'none' })}
              isLoading={isSaving}
            />
          </div>
        </div>
      )}

      {/* Modal: Edit */}
      {modal.kind === 'edit' && (
        <div className="pm-overlay" onClick={() => setModal({ kind: 'none' })}>
          <div className="pm-modal pm-animate-in" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: 'var(--pm-text)', marginBottom: '16px', fontFamily: 'var(--font-display)', fontSize: '18px' }}>
              Editar Fonte
            </h3>
            <SourceForm
              initial={{
                title: modal.source.title,
                url: modal.source.url,
                category: modal.source.category,
                summary: modal.source.summary,
                tags: modal.source.tags,
              }}
              onSave={(data) => handleEdit(modal.source, data)}
              onCancel={() => setModal({ kind: 'none' })}
              isLoading={isSaving}
            />
          </div>
        </div>
      )}

      {/* Modal: Confirm archive */}
      {modal.kind === 'confirm-archive' && (
        <div className="pm-overlay" onClick={() => setModal({ kind: 'none' })}>
          <div
            className="pm-modal pm-animate-in"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '400px' }}
          >
            <h3 style={{ color: 'var(--pm-text)', marginBottom: '12px', fontFamily: 'var(--font-display)', fontSize: '18px' }}>
              Arquivar Fonte
            </h3>
            <p style={{ color: 'var(--pm-text-2)', fontSize: '14px', marginBottom: '20px' }}>
              Tem certeza que deseja arquivar{' '}
              <strong style={{ color: 'var(--pm-text)' }}>{modal.sourceTitle}</strong>?
              Esta ação pode ser revertida manualmente no banco.
            </p>
            {archiveError && (
              <p style={{ color: 'var(--pm-danger)', fontSize: '13px', marginBottom: '12px' }}>
                {archiveError}
              </p>
            )}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                className="pm-btn pm-btn-ghost"
                onClick={() => { setArchiveError(null); setModal({ kind: 'none' }); }}
              >
                Cancelar
              </button>
              <button
                className="pm-btn pm-btn-danger"
                onClick={() => handleArchiveConfirm(modal.sourceId)}
              >
                Arquivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-component: individual source row ──

interface SourceRowProps {
  source: CuratedSource;
  onEdit: () => void;
  onArchive: () => void;
}

function SourceRow({ source, onEdit, onArchive }: SourceRowProps) {
  const isArchived = source.status === 'archived';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 14px',
        borderRadius: '8px',
        background: 'var(--pm-card)',
        border: '1px solid var(--pm-border)',
        opacity: isArchived ? 0.6 : 1,
      }}
    >
      {/* Category dot — marcador neutro; categoria diferenciada pelo label abaixo */}
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'var(--color-accent)',
          flexShrink: 0,
        }}
        title={COURSE_CATEGORY_LABELS[source.category]}
      />

      {/* Title + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            color: 'var(--pm-text)',
            fontSize: '14px',
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            margin: 0,
          }}
        >
          {source.title}
        </p>
        <p style={{ color: 'var(--pm-text-3)', fontSize: '11px', margin: '2px 0 0' }}>
          {COURSE_CATEGORY_LABELS[source.category]}
        </p>
      </div>

      {/* Status badge */}
      <span
        style={{
          fontSize: '11px',
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: '10px',
          background: isArchived ? 'var(--pm-danger-muted)' : 'var(--pm-accent-muted)',
          color: isArchived ? 'var(--pm-danger)' : 'var(--pm-accent)',
          flexShrink: 0,
        }}
      >
        {isArchived ? 'Arquivada' : 'Ativa'}
      </span>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
        <button
          className="pm-btn pm-btn-ghost"
          style={{ fontSize: '12px', padding: '4px 10px' }}
          onClick={onEdit}
          disabled={isArchived}
        >
          Editar
        </button>
        {!isArchived && (
          <button
            className="pm-btn pm-btn-danger"
            style={{ fontSize: '12px', padding: '4px 10px' }}
            onClick={onArchive}
          >
            Arquivar
          </button>
        )}
      </div>
    </div>
  );
}
