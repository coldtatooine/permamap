-- =====================
-- Migration 008: Permamap U — Universidade Permamap
-- =====================
-- Cria a infraestrutura de banco para a Universidade Permamap:
--   - Tabela pública de perfis de usuários (public.users) com flag is_admin
--   - Enums de categoria, status de curso e status de fonte
--   - Tabelas curated_sources, courses, course_sources
--   - RLS policies para acesso admin vs. usuário autenticado

-- ── Função auxiliar: atualiza updated_at automaticamente ──
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- ── Tabela de perfis públicos ──
-- Criada automaticamente no signup via trigger
CREATE TABLE IF NOT EXISTS public.users (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin   boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger: cria perfil público no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS em public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- ── Enums ──
DO $$ BEGIN
  CREATE TYPE course_category AS ENUM (
    'permacultura', 'agrofloresta', 'bioconstrucao', 'sobrevivencialismo'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE source_status AS ENUM ('active', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Fontes curadas ──
CREATE TABLE IF NOT EXISTS public.curated_sources (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  title      text NOT NULL CHECK (char_length(title) <= 255),
  url        text NOT NULL,
  category   course_category NOT NULL,
  summary    text NOT NULL,
  tags       text[] NOT NULL DEFAULT '{}',
  status     source_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_curated_sources_category   ON public.curated_sources (category);
CREATE INDEX IF NOT EXISTS idx_curated_sources_status     ON public.curated_sources (status);
CREATE INDEX IF NOT EXISTS idx_curated_sources_created_by ON public.curated_sources (created_by);

CREATE TRIGGER set_curated_sources_updated_at
  BEFORE UPDATE ON public.curated_sources
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Cursos ──
CREATE TABLE IF NOT EXISTS public.courses (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by          uuid NOT NULL REFERENCES auth.users(id),
  title               text NOT NULL CHECK (char_length(title) <= 255),
  slug                text NOT NULL UNIQUE,
  category            course_category NOT NULL,
  description         text,
  generated_html      text CHECK (octet_length(generated_html) <= 102400),
  status              course_status NOT NULL DEFAULT 'draft',
  generation_error    text,
  generation_metadata jsonb NOT NULL DEFAULT '{}',
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  published_at        timestamptz
);

CREATE INDEX IF NOT EXISTS idx_courses_category   ON public.courses (category);
CREATE INDEX IF NOT EXISTS idx_courses_status     ON public.courses (status);
CREATE INDEX IF NOT EXISTS idx_courses_slug       ON public.courses (slug);
CREATE INDEX IF NOT EXISTS idx_courses_created_by ON public.courses (created_by);

CREATE TRIGGER set_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Junção curso ↔ fonte ──
CREATE TABLE IF NOT EXISTS public.course_sources (
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES public.curated_sources(id) ON DELETE RESTRICT,
  PRIMARY KEY (course_id, source_id)
);

-- ── RLS: curated_sources ──
ALTER TABLE public.curated_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage sources"
  ON public.curated_sources FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "authenticated users read active sources"
  ON public.curated_sources FOR SELECT
  USING (auth.uid() IS NOT NULL AND status = 'active');

-- ── RLS: courses ──
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage courses"
  ON public.courses FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "authenticated users read published courses"
  ON public.courses FOR SELECT
  USING (auth.uid() IS NOT NULL AND status = 'published');

-- ── RLS: course_sources ──
ALTER TABLE public.course_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage course_sources"
  ON public.course_sources FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "authenticated users read course_sources"
  ON public.course_sources FOR SELECT
  USING (auth.uid() IS NOT NULL);
