// =====================
// T021 — Visualizador de Curso com HTML sanitizado (DOMPurify)
// =====================

import DOMPurify from 'dompurify';
import type { Course } from '../../types/university';
import { COURSE_CATEGORY_LABELS, COURSE_CATEGORY_COLORS } from '../../types/university';

interface CourseViewerProps {
  course: Course;
  onClose: () => void;
}

const ALLOWED_TAGS = [
  'article', 'section', 'h1', 'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li',
  'blockquote', 'code', 'pre', 'figure', 'figcaption', 'strong', 'em',
  'a', 'br', 'hr', 'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
];
const ALLOWED_ATTR = ['href', 'class', 'id', 'data-section', 'target', 'rel'];

export function CourseViewer({ course, onClose }: CourseViewerProps) {
  const cleanHtml = DOMPurify.sanitize(course.generated_html ?? '', {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });

  const categoryColor = COURSE_CATEGORY_COLORS[course.category];
  const categoryLabel = COURSE_CATEGORY_LABELS[course.category];

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div
        className="pm-modal pm-animate-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '780px',
          width: '90vw',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Cabeçalho */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '16px',
            gap: '12px',
          }}
        >
          <div style={{ flex: 1 }}>
            <span
              style={{
                display: 'inline-block',
                background: categoryColor,
                color: '#fff',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '4px',
                marginBottom: '8px',
              }}
            >
              {categoryLabel}
            </span>
            <h2
              style={{
                color: 'var(--pm-text)',
                fontFamily: 'var(--font-display)',
                fontSize: '22px',
                lineHeight: 1.3,
                margin: 0,
              }}
            >
              {course.title}
            </h2>
          </div>
          <button
            className="pm-btn pm-btn-ghost"
            onClick={onClose}
            style={{ flexShrink: 0, padding: '4px 10px' }}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Conteúdo gerado */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            color: 'var(--pm-text-2)',
            lineHeight: 1.7,
            fontSize: '15px',
          }}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: cleanHtml }}
        />
      </div>
    </div>
  );
}
