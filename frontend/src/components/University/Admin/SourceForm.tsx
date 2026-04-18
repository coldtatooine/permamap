import { useState } from 'react';
import type { CreateSourceInput, CourseCategory } from '../../../types/university';
import { COURSE_CATEGORY_LABELS } from '../../../types/university';
import { validateCreateSource, type SourceValidationErrors } from '../../../lib/university/sourceValidation';

interface SourceFormProps {
  initial?: Partial<CreateSourceInput>;
  onSave: (data: CreateSourceInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SourceForm({ initial, onSave, onCancel, isLoading = false }: SourceFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [url, setUrl] = useState(initial?.url ?? '');
  const [category, setCategory] = useState<CourseCategory>(initial?.category ?? 'permacultura');
  const [summary, setSummary] = useState(initial?.summary ?? '');
  const [tags, setTags] = useState((initial?.tags ?? []).join(', '));
  const [errors, setErrors] = useState<SourceValidationErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input = { title: title.trim(), url: url.trim(), category, summary: summary.trim() };
    const validationErrors = validateCreateSource(input);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitError(null);
    try {
      await onSave({
        ...input,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label className="pm-label">Título *</label>
        <input
          className="pm-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nome da fonte de conteúdo"
          maxLength={255}
        />
        {errors.title && (
          <p style={{ color: 'var(--pm-danger)', fontSize: '12px', marginTop: '4px' }}>
            {errors.title}
          </p>
        )}
      </div>

      <div>
        <label className="pm-label">URL *</label>
        <input
          className="pm-input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          type="url"
        />
        {errors.url && (
          <p style={{ color: 'var(--pm-danger)', fontSize: '12px', marginTop: '4px' }}>
            {errors.url}
          </p>
        )}
      </div>

      <div>
        <label className="pm-label">Categoria *</label>
        <select
          className="pm-select"
          value={category}
          onChange={(e) => setCategory(e.target.value as CourseCategory)}
        >
          {(Object.entries(COURSE_CATEGORY_LABELS) as [CourseCategory, string][]).map(
            ([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            )
          )}
        </select>
        {errors.category && (
          <p style={{ color: 'var(--pm-danger)', fontSize: '12px', marginTop: '4px' }}>
            {errors.category}
          </p>
        )}
      </div>

      <div>
        <label className="pm-label">Resumo *</label>
        <textarea
          className="pm-input"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Descreva o conteúdo desta fonte..."
          rows={4}
          style={{ resize: 'vertical', minHeight: '80px' }}
        />
        {errors.summary && (
          <p style={{ color: 'var(--pm-danger)', fontSize: '12px', marginTop: '4px' }}>
            {errors.summary}
          </p>
        )}
      </div>

      <div>
        <label className="pm-label">Tags (separadas por vírgula)</label>
        <input
          className="pm-input"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="permacultura, design, zones"
        />
      </div>

      {submitError && (
        <p style={{ color: 'var(--pm-danger)', fontSize: '13px' }}>{submitError}</p>
      )}

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          className="pm-btn pm-btn-ghost"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button type="submit" className="pm-btn pm-btn-primary" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
