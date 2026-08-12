// =====================
// T026 — CourseCard: card público de curso com animação Framer Motion
// =====================

import { motion } from 'framer-motion';
import type { Course } from '../../types/university';
import { COURSE_CATEGORY_LABELS } from '../../types/university';

interface CourseCardProps {
  course: Course;
  onClick: (course: Course) => void;
}

export function CourseCard({ course, onClick }: CourseCardProps) {
  const categoryLabel = COURSE_CATEGORY_LABELS[course.category];
  const description = course.description ?? '';
  const truncated = description.length > 120 ? description.slice(0, 120) + '…' : description;
  const publishedDate = course.published_at
    ? new Date(course.published_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '';

  return (
    <motion.div
      whileHover={{ backgroundColor: 'var(--pm-card-hover)' }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onClick(course)}
      style={{
        background: 'var(--pm-card)',
        borderRadius: '10px',
        padding: '18px',
        border: '1px solid var(--pm-border)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <span style={{
        display: 'inline-block',
        background: 'var(--color-accent-soft)',
        color: 'var(--color-ink)',
        fontSize: '11px',
        fontWeight: 600,
        padding: '3px 10px',
        borderRadius: '4px',
        alignSelf: 'flex-start',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}>
        {categoryLabel}
      </span>

      <h3 style={{
        color: 'var(--pm-text)',
        fontFamily: 'var(--font-display)',
        fontSize: '17px',
        lineHeight: 1.35,
        margin: 0,
      }}>
        {course.title}
      </h3>

      {truncated && (
        <p style={{ color: 'var(--pm-text-2)', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
          {truncated}
        </p>
      )}

      {publishedDate && (
        <p style={{ color: 'var(--pm-text-3)', fontSize: '11px', margin: 0 }}>
          Publicado em {publishedDate}
        </p>
      )}
    </motion.div>
  );
}
