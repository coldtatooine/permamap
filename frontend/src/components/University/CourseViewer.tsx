// =====================
// T021 — Visualizador de Curso com HTML sanitizado (DOMPurify)
// =====================

import DOMPurify from 'dompurify';
import type { Course } from '../../types/university';
import { COURSE_CATEGORY_LABELS } from '../../types/university';

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

  const categoryLabel = COURSE_CATEGORY_LABELS[course.category];

  return (
    <div className="pm-course-viewer pm-fade-in">
      {/* Cabeçalho */}
      <div className="pm-course-viewer-header">
        <div
          style={{
            maxWidth: '65ch',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 'var(--space-md)',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <span
              style={{
                display: 'inline-block',
                background: 'var(--color-accent-soft)',
                color: 'var(--color-ink)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
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
                fontSize: 'var(--text-lg)',
                lineHeight: 1.2,
                letterSpacing: 'var(--tracking-display)',
                margin: 0,
              }}
            >
              {course.title}
            </h2>
          </div>
          <button
            className="pm-btn pm-btn-ghost"
            onClick={onClose}
            style={{ flexShrink: 0, width: 'auto', padding: 'var(--space-2xs) var(--space-sm)' }}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Conteúdo gerado — Long Document, measure 65ch */}
      <div className="pm-course-viewer-body">
        <div className="pm-course-viewer-content">
          <div
            className="pm-course-html"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
          />
        </div>
      </div>
    </div>
  );
}
