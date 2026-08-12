// =====================
// T027 — UniversityView: listagem pública de cursos da Permamap U
// =====================

import { useEffect, useState, lazy, Suspense } from 'react';
import { useUniversity } from '../../hooks/useUniversity';
import { CourseCard } from './CourseCard';
import { CourseCardSkeleton } from './CourseCardSkeleton';
import { EmptyState } from './EmptyState';
import type { Course, CourseCategory } from '../../types/university';
import { COURSE_CATEGORY_LABELS } from '../../types/university';

// Lazy-load o CourseViewer pesado (contém DOMPurify)
const CourseViewer = lazy(() => import('./CourseViewer').then(m => ({ default: m.CourseViewer })));

export function UniversityView() {
  const { courses, coursesLoading, coursesError, fetchCourses, fetchCourseById } = useUniversity();
  const [categoryFilter, setCategoryFilter] = useState<CourseCategory | 'all'>('all');
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);

  useEffect(() => { fetchCourses({ status: 'published' }); }, []);

  const filtered = categoryFilter === 'all'
    ? courses
    : courses.filter(c => c.category === categoryFilter);

  async function handleCourseClick(course: Course) {
    setLoadingCourseId(course.id);
    try {
      const full = await fetchCourseById(course.id);
      setViewingCourse(full);
    } catch {
      // usa dados parciais se o fetch falhar
      setViewingCourse(course);
    } finally {
      setLoadingCourseId(null);
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--pm-void)', position: 'relative' }}>
      {/* Cabeçalho */}
      <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid var(--pm-border)' }}>
        <div style={{ maxWidth: '65ch' }}>
          <h1 style={{ color: 'var(--pm-text)', fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', letterSpacing: 'var(--tracking-display)', lineHeight: 1.1, marginBottom: '4px' }}>
            Permamap U
          </h1>
          <p style={{ color: 'var(--pm-text-3)', fontSize: 'var(--text-sm)' }}>
            Universidade Permamap — cursos sobre permacultura, agrofloresta e mais
          </p>
        </div>

        {/* Filtros de categoria */}
        <div className="pm-category-chips" style={{ marginTop: '14px' }}>
          <button
            className={`pm-category-chip${categoryFilter === 'all' ? ' active' : ''}`}
            onClick={() => setCategoryFilter('all')}
          >
            Todos
          </button>
          {(Object.entries(COURSE_CATEGORY_LABELS) as [CourseCategory, string][]).map(([v, l]) => (
            <button
              key={v}
              className={`pm-category-chip${categoryFilter === v ? ' active' : ''}`}
              onClick={() => setCategoryFilter(v)}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Grade de cursos */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px' }}>
        {coursesLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {[1, 2, 3].map(i => <CourseCardSkeleton key={i} />)}
          </div>
        ) : coursesError ? (
          <p style={{ color: 'var(--pm-danger)', textAlign: 'center', padding: '40px' }}>{coursesError}</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={categoryFilter === 'all' ? 'Em breve novos cursos' : `Nenhum curso de ${COURSE_CATEGORY_LABELS[categoryFilter as CourseCategory]} disponível`}
            subtitle="Estamos preparando o material para você."
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {filtered.map((course: Course) => (
              <div key={course.id} style={{ position: 'relative' }}>
                <CourseCard course={course} onClick={handleCourseClick} />
                {loadingCourseId === course.id && (
                  <div style={{ position: 'absolute', inset: 0, background: 'color-mix(in oklch, var(--color-paper) 55%, transparent)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: 'var(--pm-text-2)', fontSize: '12px' }}>Carregando…</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visualizador de curso (lazy) */}
      {viewingCourse && (
        <Suspense fallback={null}>
          <CourseViewer course={viewingCourse} onClose={() => setViewingCourse(null)} />
        </Suspense>
      )}
    </div>
  );
}
