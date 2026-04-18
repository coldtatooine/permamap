# Contract: Supabase REST — University Data Access

Todos os acessos ao banco de dados da Permamap U DEVEM usar helpers tipados definidos em
`frontend/src/hooks/useUniversity.ts`. Chamadas diretas a `supabase.from(...)` fora deste
hook são proibidas (conforme Princípio I da Constituição).

---

## Hook API: `useUniversity()`

```typescript
// frontend/src/hooks/useUniversity.ts

interface UseUniversity {
  // ── Curated Sources ───────────────────────────────────────────────
  sources: CuratedSource[];
  sourcesLoading: boolean;
  sourcesError: string | null;

  fetchSources: (filters?: { category?: CourseCategory; status?: SourceStatus }) => Promise<void>;
  createSource: (input: CreateSourceInput) => Promise<CuratedSource>;
  updateSource: (id: string, input: UpdateSourceInput) => Promise<CuratedSource>;
  archiveSource: (id: string) => Promise<void>;

  // ── Courses ───────────────────────────────────────────────────────
  courses: Course[];
  coursesLoading: boolean;
  coursesError: string | null;
  selectedCourse: Course | null;

  fetchCourses: (filters?: { category?: CourseCategory; status?: CourseStatus }) => Promise<void>;
  fetchCourseById: (id: string) => Promise<Course>;
  generateCourse: (input: GenerateCourseInput) => Promise<Course>;
  publishCourse: (id: string) => Promise<void>;
  archiveCourse: (id: string) => Promise<void>;
  regenerateCourse: (id: string) => Promise<Course>;
  selectCourse: (course: Course | null) => void;
}
```

---

## TypeScript Types

```typescript
// frontend/src/types/university.ts

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
```

---

## Supabase Queries (internal to hook — not called directly)

### fetchSources

```sql
SELECT * FROM public.curated_sources
WHERE status = $1 AND category = $2  -- filters optional
ORDER BY created_at DESC;
```

### fetchCourses (public — published only)

```sql
SELECT id, title, slug, category, description, status, created_at, published_at
FROM public.courses
WHERE status = 'published'
  AND (category = $1 OR $1 IS NULL)
ORDER BY published_at DESC;
```

### fetchCourses (admin — all statuses)

```sql
SELECT * FROM public.courses
WHERE created_by = auth.uid()
  AND (status = $1 OR $1 IS NULL)
ORDER BY created_at DESC;
```

### fetchCourseById (includes generated_html)

```sql
SELECT * FROM public.courses WHERE id = $1;
```

### publishCourse

```sql
UPDATE public.courses
SET status = 'published', published_at = now()
WHERE id = $1 AND created_by = auth.uid();
```
