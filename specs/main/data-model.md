# Data Model: Permamap U

**Feature**: Permamap U — Universidade Permamap
**Date**: 2026-03-22

## Entities

### 1. `curated_sources`

Fontes de conteúdo curado registradas pelo administrador.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Identificador único |
| `created_by` | `uuid` | FK → `auth.users(id)`, NOT NULL | Admin que cadastrou |
| `title` | `text` | NOT NULL, max 255 | Título da fonte |
| `url` | `text` | NOT NULL | URL de origem do conteúdo |
| `category` | `course_category` | NOT NULL | Enum de categoria |
| `summary` | `text` | NOT NULL | Resumo manual fornecido pelo admin |
| `tags` | `text[]` | default `'{}'` | Tags para filtragem |
| `status` | `source_status` | NOT NULL, default `'active'` | `active` ou `archived` |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | Auto-updated via trigger |

**Indexes**: `(category)`, `(status)`, `(created_by)`
**RLS**: Admin pode INSERT/UPDATE/DELETE próprias fontes; todos os autenticados podem SELECT ativas.

---

### 2. `courses`

Cursos gerados por IA e suas páginas HTML.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Identificador único |
| `created_by` | `uuid` | FK → `auth.users(id)`, NOT NULL | Admin que gerou |
| `title` | `text` | NOT NULL, max 255 | Título do curso |
| `slug` | `text` | UNIQUE, NOT NULL | URL-friendly identifier |
| `category` | `course_category` | NOT NULL | Enum de categoria |
| `description` | `text` | | Descrição curta para listagem (gerada pela IA ou manual) |
| `generated_html` | `text` | CHECK length ≤ 102400 | HTML gerado pela IA (max 100KB) |
| `status` | `course_status` | NOT NULL, default `'draft'` | `draft`, `published`, `archived`, `failed` |
| `generation_error` | `text` | | Mensagem de erro caso status = `failed` |
| `generation_metadata` | `jsonb` | default `'{}'` | Modelo usado, tokens, duração |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | Auto-updated via trigger |
| `published_at` | `timestamptz` | | Preenchido quando status → `published` |

**Indexes**: `(category)`, `(status)`, `(slug)`, `(created_by)`
**RLS**: Admin pode INSERT/UPDATE/DELETE; autenticados podem SELECT onde `status = 'published'`.

---

### 3. `course_sources`

Tabela de junção — rastreia quais fontes foram usadas para gerar cada curso.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `course_id` | `uuid` | FK → `courses(id)` ON DELETE CASCADE | |
| `source_id` | `uuid` | FK → `curated_sources(id)` ON DELETE RESTRICT | |

**PK**: `(course_id, source_id)`
**RLS**: Segue permissões de `courses`.

---

### 4. Enums (PostgreSQL)

```sql
CREATE TYPE course_category AS ENUM (
  'permacultura',
  'agrofloresta',
  'bioconstrucao',
  'sobrevivencialismo'
);

CREATE TYPE course_status AS ENUM (
  'draft',
  'published',
  'archived',
  'failed'
);

CREATE TYPE source_status AS ENUM (
  'active',
  'archived'
);
```

---

### 5. `users` table amendment

A coluna `is_admin` deve ser adicionada à tabela `public.users` existente (migration 008):

```sql
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;
```

---

## Relationships

```text
auth.users (1) ──< curated_sources (N)   [created_by]
auth.users (1) ──< courses (N)           [created_by]
courses    (N) >──< curated_sources (N)  [via course_sources]
```

## State Transitions

### `courses.status`

```text
(Edge Function success) → draft
draft → published        (admin action: "Publicar")
draft → failed           (Edge Function error)
published → archived     (admin action: "Arquivar")
draft → draft            (admin action: "Regenerar" — overwrites generated_html)
failed → draft           (admin action: "Tentar novamente")
```

### `curated_sources.status`

```text
active → archived   (admin action: "Arquivar fonte")
archived → active   (admin action: "Reativar")
```

## Migration File

**File**: `supabase/migrations/008_university_schema.sql`

```sql
-- Enums
CREATE TYPE course_category AS ENUM (
  'permacultura', 'agrofloresta', 'bioconstrucao', 'sobrevivencialismo'
);
CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived', 'failed');
CREATE TYPE source_status AS ENUM ('active', 'archived');

-- Admin flag on users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- Curated sources
CREATE TABLE public.curated_sources (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by   uuid NOT NULL REFERENCES auth.users(id),
  title        text NOT NULL CHECK (char_length(title) <= 255),
  url          text NOT NULL,
  category     course_category NOT NULL,
  summary      text NOT NULL,
  tags         text[] NOT NULL DEFAULT '{}',
  status       source_status NOT NULL DEFAULT 'active',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Courses
CREATE TABLE public.courses (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by           uuid NOT NULL REFERENCES auth.users(id),
  title                text NOT NULL CHECK (char_length(title) <= 255),
  slug                 text NOT NULL UNIQUE,
  category             course_category NOT NULL,
  description          text,
  generated_html       text CHECK (octet_length(generated_html) <= 102400),
  status               course_status NOT NULL DEFAULT 'draft',
  generation_error     text,
  generation_metadata  jsonb NOT NULL DEFAULT '{}',
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  published_at         timestamptz
);

-- Course ↔ Source join
CREATE TABLE public.course_sources (
  course_id  uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  source_id  uuid NOT NULL REFERENCES public.curated_sources(id) ON DELETE RESTRICT,
  PRIMARY KEY (course_id, source_id)
);

-- Indexes
CREATE INDEX ON public.curated_sources (category);
CREATE INDEX ON public.curated_sources (status);
CREATE INDEX ON public.courses (category);
CREATE INDEX ON public.courses (status);
CREATE INDEX ON public.courses (slug);

-- updated_at triggers (reuse existing trigger function if available)
CREATE TRIGGER set_curated_sources_updated_at
  BEFORE UPDATE ON public.curated_sources
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.curated_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_sources ENABLE ROW LEVEL SECURITY;

-- curated_sources policies
CREATE POLICY "admins manage sources"
  ON public.curated_sources FOR ALL
  USING ((SELECT is_admin FROM public.users WHERE id = auth.uid()));

CREATE POLICY "authenticated users read active sources"
  ON public.curated_sources FOR SELECT
  USING (auth.uid() IS NOT NULL AND status = 'active');

-- courses policies
CREATE POLICY "admins manage courses"
  ON public.courses FOR ALL
  USING ((SELECT is_admin FROM public.users WHERE id = auth.uid()));

CREATE POLICY "authenticated users read published courses"
  ON public.courses FOR SELECT
  USING (auth.uid() IS NOT NULL AND status = 'published');

-- course_sources policies (inherits from courses)
CREATE POLICY "admins manage course_sources"
  ON public.course_sources FOR ALL
  USING ((SELECT is_admin FROM public.users WHERE id = auth.uid()));

CREATE POLICY "authenticated users read course_sources"
  ON public.course_sources FOR SELECT
  USING (auth.uid() IS NOT NULL);
```
