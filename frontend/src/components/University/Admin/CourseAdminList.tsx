// =====================
// T020 — Lista de Cursos (admin) com status e ações
// =====================

import { useEffect, useState } from 'react';
import { useUniversity } from '../../../hooks/useUniversity';
import type { Course, CourseStatus } from '../../../types/university';
import { COURSE_CATEGORY_LABELS, COURSE_CATEGORY_COLORS } from '../../../types/university';
import { CourseViewer } from '../CourseViewer';

const STATUS_LABELS: Record<CourseStatus, string> = {
  draft:     'Rascunho',
  published: 'Publicado',
  archived:  'Arquivado',
  failed:    'Falha',
};

const STATUS_COLORS: Record<CourseStatus, string> = {
  draft:     '#6b7280',
  published: '#22c55e',
  archived:  '#d97706',
  failed:    '#ef4444',
};

export function CourseAdminList() {
  const {
    courses,
    coursesLoading,
    fetchCourses,
    publishCourse,
    archiveCourse,
    regenerateCourse,
    fetchCourseById,
  } = useUniversity();

  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    void fetchCourses();
  }, [fetchCourses]);

  async function handlePublish(id: string) {
    try {
      await publishCourse(id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erro ao publicar');
    }
  }

  async function handleArchive(id: string) {
    try {
      await archiveCourse(id);
      setConfirmArchiveId(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erro ao arquivar');
    }
  }

  async function handleRegenerate(id: string) {
    try {
      await regenerateCourse(id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erro ao regenerar');
    }
  }

  async function handlePreview(id: string) {
    try {
      const c = await fetchCourseById(id);
      setPreviewCourse(c);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erro ao carregar');
    }
  }

  if (coursesLoading) {
    return <p style={{ color: 'var(--pm-text-3)', padding: '16px' }}>Carregando cursos...</p>;
  }

  if (courses.length === 0) {
    return <p style={{ color: 'var(--pm-text-3)', padding: '16px' }}>Nenhum curso criado ainda.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Erro de ação */}
      {actionError && (
        <div
          style={{
            background: 'var(--pm-danger-muted)',
            borderRadius: '6px',
            padding: '10px',
            marginBottom: '8px',
          }}
        >
          <p style={{ color: 'var(--pm-danger)', fontSize: '13px', margin: 0 }}>{actionError}</p>
          <button
            className="pm-btn pm-btn-ghost"
            style={{ fontSize: '11px', marginTop: '4px' }}
            onClick={() => setActionError(null)}
          >
            Fechar
          </button>
        </div>
      )}

      {/* Lista de cursos */}
      {courses.map((course: Course) => (
        <div
          key={course.id}
          style={{
            background: 'var(--pm-card)',
            borderRadius: '8px',
            padding: '14px 16px',
            border: '1px solid var(--pm-border)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            {/* Metadados */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  marginBottom: '4px',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    background: COURSE_CATEGORY_COLORS[course.category],
                    color: '#fff',
                    fontSize: '10px',
                    padding: '2px 7px',
                    borderRadius: '4px',
                  }}
                >
                  {COURSE_CATEGORY_LABELS[course.category]}
                </span>
                <span
                  style={{
                    background: STATUS_COLORS[course.status] + '33',
                    color: STATUS_COLORS[course.status],
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: `1px solid ${STATUS_COLORS[course.status]}55`,
                  }}
                >
                  {STATUS_LABELS[course.status]}
                </span>
              </div>
              <p style={{ color: 'var(--pm-text)', fontSize: '14px', fontWeight: 500, margin: 0 }}>
                {course.title}
              </p>
              {course.generation_error && (
                <p style={{ color: 'var(--pm-danger)', fontSize: '12px', marginTop: '4px', marginBottom: 0 }}>
                  {course.generation_error}
                </p>
              )}
            </div>

            {/* Ações */}
            <div
              style={{
                display: 'flex',
                gap: '6px',
                flexShrink: 0,
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
              }}
            >
              <button
                className="pm-btn pm-btn-ghost"
                style={{ fontSize: '12px', padding: '4px 10px' }}
                onClick={() => void handlePreview(course.id)}
              >
                Pré-visualizar
              </button>
              {course.status === 'draft' && (
                <button
                  className="pm-btn pm-btn-primary"
                  style={{ fontSize: '12px', padding: '4px 10px' }}
                  onClick={() => void handlePublish(course.id)}
                >
                  Publicar
                </button>
              )}
              {(course.status === 'draft' || course.status === 'failed') && (
                <button
                  className="pm-btn pm-btn-secondary"
                  style={{ fontSize: '12px', padding: '4px 10px' }}
                  onClick={() => void handleRegenerate(course.id)}
                >
                  Regenerar
                </button>
              )}
              {course.status === 'published' && (
                <button
                  className="pm-btn pm-btn-ghost"
                  style={{ fontSize: '12px', padding: '4px 10px' }}
                  onClick={() => setConfirmArchiveId(course.id)}
                >
                  Arquivar
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Modal: Confirmar arquivamento */}
      {confirmArchiveId && (
        <div className="pm-overlay" onClick={() => setConfirmArchiveId(null)}>
          <div
            className="pm-modal pm-animate-in"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '400px' }}
          >
            <h3 style={{ color: 'var(--pm-text)', marginBottom: '12px', fontFamily: 'var(--font-display)', fontSize: '18px' }}>
              Arquivar Curso
            </h3>
            <p style={{ color: 'var(--pm-text-2)', fontSize: '14px', marginBottom: '20px' }}>
              Tem certeza que deseja arquivar este curso? Ele não será mais visível para os usuários.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                className="pm-btn pm-btn-ghost"
                onClick={() => setConfirmArchiveId(null)}
              >
                Cancelar
              </button>
              <button
                className="pm-btn pm-btn-danger"
                onClick={() => void handleArchive(confirmArchiveId)}
              >
                Arquivar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pré-visualização */}
      {previewCourse && (
        <CourseViewer course={previewCourse} onClose={() => setPreviewCourse(null)} />
      )}
    </div>
  );
}
