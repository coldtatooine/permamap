// =====================
// Permamap U — Tipos da Universidade Permamap
// =====================

export type CourseCategory =
  | 'permacultura'
  | 'agrofloresta'
  | 'bioconstrucao'
  | 'sobrevivencialismo';

export type CourseStatus = 'draft' | 'published' | 'archived' | 'failed';

export type SourceStatus = 'active' | 'archived';

export interface CuratedSource {
  id: string;
  created_by: string;
  title: string;
  url: string;
  category: CourseCategory;
  summary: string;
  tags: string[];
  status: SourceStatus;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  created_by: string;
  title: string;
  slug: string;
  category: CourseCategory;
  description: string | null;
  generated_html: string | null;
  status: CourseStatus;
  generation_error: string | null;
  generation_metadata: {
    model?: string;
    input_tokens?: number;
    output_tokens?: number;
    duration_ms?: number;
    source_count?: number;
  };
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface CreateSourceInput {
  title: string;
  url: string;
  category: CourseCategory;
  summary: string;
  tags?: string[];
}

export type UpdateSourceInput = Partial<CreateSourceInput> & { status?: SourceStatus };

export interface GenerateCourseInput {
  title: string;
  category: CourseCategory;
  source_ids: string[];
}

export const COURSE_CATEGORY_LABELS: Record<CourseCategory, string> = {
  permacultura:       'Permacultura',
  agrofloresta:       'Agrofloresta',
  bioconstrucao:      'Bioconstrução',
  sobrevivencialismo: 'Sobrevivencialismo',
};

/** Estimate reading time in minutes from HTML string (~200 wpm). */
export function estimateReadTime(html: string | null): number {
  if (!html) return 0;
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text.split(' ').length;
  return Math.max(1, Math.ceil(words / 200));
}
