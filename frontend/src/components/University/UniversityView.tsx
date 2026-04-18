// =====================
// T027 — UniversityView: listagem pública de cursos da Permamap U
// =====================

import { useEffect, useState, lazy, Suspense } from 'react';
import { useUniversity } from '../../hooks/useUniversity';
import { CourseCard } from './CourseCard';
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--pm-void)' }}>
      {/* Cabeçalho */}
      <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid var(--pm-border)' }}>
        <h1 style={{ color: 'var(--pm-text)', fontFamily: 'var(--font-display)', fontSize: '26px', marginBottom: '4px' }}>
          Permamap U
        </h1>
        <p style={{ color: 'var(--pm-text-3)', fontSize: '14px' }}>
          Universidade Permamap — cursos sobre permacultura, agrofloresta e mais
        </p>

        {/* Filtros de categoria */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '14px', flexWrap: 'wrap' }}>
          <button
            className={`pm-btn ${categoryFilter === 'all' ? 'pm-btn-primary' : 'pm-btn-ghost'}`}
            style={{ fontSize: '13px' }}
            onClick={() => setCategoryFilter('all')}
          >
            Todos
          </button>
          {(Object.entries(COURSE_CATEGORY_LABELS) as [CourseCategory, string][]).map(([v, l]) => (
            <button
              key={v}
              className={`pm-btn ${categoryFilter === v ? 'pm-btn-primary' : 'pm-btn-ghost'}`}
              style={{ fontSize: '13px' }}
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
          // Skeleton cards
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: 'var(--pm-card)', borderRadius: '10px', padding: '18px', border: '1px solid var(--pm-border)', opacity: 0.5, height: '140px' }} />
            ))}
          </div>
        ) : coursesError ? (
          <p style={{ color: 'var(--pm-danger)', textAlign: 'center', padding: '40px' }}>{coursesError}</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ color: 'var(--pm-text-2)', fontSize: '16px', marginBottom: '8px' }}>
              {categoryFilter === 'all' ? 'Em breve novos cursos' : `Nenhum curso de ${COURSE_CATEGORY_LABELS[categoryFilter as CourseCategory]} disponível`}
            </p>
            <p style={{ color: 'var(--pm-text-3)', fontSize: '13px' }}>
              Estamos preparando o material para você.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {filtered.map((course: Course) => (
              <div key={course.id} style={{ position: 'relative' }}>
                <CourseCard course={course} onClick={handleCourseClick} />
                {loadingCourseId === course.id && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: 'var(--pm-text-3)', fontSize: '12px' }}>Carregando...</p>
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
