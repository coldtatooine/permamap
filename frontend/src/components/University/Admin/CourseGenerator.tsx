// =====================
// T019 — Gerador de Cursos com IA (admin)
// =====================

import { useState, useEffect } from 'react';
import { useUniversity } from '../../../hooks/useUniversity';
import type { CourseCategory, CuratedSource, Course } from '../../../types/university';
import { COURSE_CATEGORY_LABELS } from '../../../types/university';
import { CourseViewer } from '../CourseViewer';

interface CourseGeneratorProps {
  onCourseGenerated?: (course: Course) => void;
}

export function CourseGenerator({ onCourseGenerated }: CourseGeneratorProps) {
  const { sources, fetchSources, sourcesLoading, generateCourse } = useUniversity();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CourseCategory>('permacultura');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState<CourseCategory | 'all'>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);

  useEffect(() => {
    void fetchSources({ status: 'active' });
  }, [fetchSources]);

  const filteredSources: CuratedSource[] =
    categoryFilter === 'all'
      ? sources
      : sources.filter((s) => s.category === categoryFilter);

  function toggleSource(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleGenerate() {
    if (!title.trim() || selectedIds.size === 0) return;
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const course = await generateCourse({
        title: title.trim(),
        category,
        source_ids: Array.from(selectedIds),
      });
      setPreviewCourse(course);
      onCourseGenerated?.(course);
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : 'Falha ao gerar o curso. Tente novamente.'
      );
    } finally {
      setIsGenerating(false);
    }
  }

  const canGenerate = title.trim().length > 0 && selectedIds.size > 0 && !isGenerating;

  const categoryEntries = Object.entries(COURSE_CATEGORY_LABELS) as [CourseCategory, string][];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '640px' }}>
      {/* Título */}
      <div>
        <label className="pm-label">Título do Curso *</label>
        <input
          className="pm-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Fundamentos da Permacultura"
          maxLength={255}
        />
      </div>

      {/* Categoria */}
      <div>
        <label className="pm-label">Categoria *</label>
        <select
          className="pm-select"
          value={category}
          onChange={(e) => setCategory(e.target.value as CourseCategory)}
        >
          {categoryEntries.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {/* Fontes curadas */}
      <div>
        <label className="pm-label" style={{ marginBottom: '10px', display: 'block' }}>
          Fontes Curadas ({selectedIds.size} selecionada{selectedIds.size !== 1 ? 's' : ''})
        </label>

        {/* Filtro de categoria */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <button
            className={`pm-btn ${categoryFilter === 'all' ? 'pm-btn-primary' : 'pm-btn-ghost'}`}
            style={{ fontSize: '12px', padding: '4px 10px' }}
            onClick={() => setCategoryFilter('all')}
          >
            Todas
          </button>
          {categoryEntries.map(([v, l]) => (
            <button
              key={v}
              className={`pm-btn ${categoryFilter === v ? 'pm-btn-primary' : 'pm-btn-ghost'}`}
              style={{ fontSize: '12px', padding: '4px 10px' }}
              onClick={() => setCategoryFilter(v)}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Lista de fontes */}
        {sourcesLoading ? (
          <p style={{ color: 'var(--pm-text-3)', fontSize: '14px' }}>Carregando fontes...</p>
        ) : filteredSources.length === 0 ? (
          <p style={{ color: 'var(--pm-text-3)', fontSize: '14px' }}>
            Nenhuma fonte disponível. Cadastre fontes primeiro.
          </p>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              maxHeight: '240px',
              overflow: 'auto',
            }}
          >
            {filteredSources.map((s) => (
              <label
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px',
                  background: selectedIds.has(s.id) ? 'var(--pm-accent-muted)' : 'var(--pm-card)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  border: `1px solid ${selectedIds.has(s.id) ? 'var(--pm-accent)' : 'var(--pm-border)'}`,
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(s.id)}
                  onChange={() => toggleSource(s.id)}
                  style={{ marginTop: '2px', accentColor: 'var(--pm-accent)' }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'var(--pm-text)', fontSize: '13px', fontWeight: 500, margin: 0 }}>
                    {s.title}
                  </p>
                  <p style={{ color: 'var(--pm-text-3)', fontSize: '11px', marginTop: '2px', marginBottom: 0 }}>
                    {COURSE_CATEGORY_LABELS[s.category]}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Erro de geração */}
      {generateError && (
        <div
          style={{
            background: 'var(--pm-danger-muted)',
            border: '1px solid var(--pm-danger)',
            borderRadius: '6px',
            padding: '10px 14px',
          }}
        >
          <p style={{ color: 'var(--pm-danger)', fontSize: '13px', margin: 0 }}>{generateError}</p>
        </div>
      )}

      {/* Botão de geração */}
      <button
        className="pm-btn pm-btn-primary"
        onClick={() => void handleGenerate()}
        disabled={!canGenerate}
        style={{ alignSelf: 'flex-start', minWidth: '160px' }}
      >
        {isGenerating
          ? 'Gerando curso com IA… isso pode levar até 60 segundos'
          : 'Gerar Curso'}
      </button>

      {/* Pré-visualização do curso gerado */}
      {previewCourse && (
        <CourseViewer course={previewCourse} onClose={() => setPreviewCourse(null)} />
      )}
    </div>
  );
}
