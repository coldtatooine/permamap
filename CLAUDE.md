# Permamap — Claude Code Context

## Project Overview

Permamap é um app web de zoneamento em permacultura (Zonas 0–5) com mapa interativo
baseado em Leaflet.js + Supabase.

## Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript (strict mode) |
| Package Manager | pnpm 11 (workspace) |
| UI Framework | React 19 |
| Build Tool | Vite + @tailwindcss/vite (TailwindCSS v4) |
| State | Zustand |
| Map | Leaflet.js + react-leaflet + leaflet-draw |
| Animation | Framer Motion |
| Backend | Supabase Remote (project: `lwimazukgvzssazdfbmi`) |
| Database | PostgreSQL + PostGIS |
| Testing | Vitest + Testing Library + Playwright |
| Design System | packages/ui (@permamap/ui) |

## Key Directories

```
frontend/src/
├── components/Map/      ← MapView, ZoneLayer, ElementLayer, DrawingToolbar
├── components/Sidebar/  ← PropertyPanel, ZonePanel, ElementPanel
├── components/Forms/    ← ZoneForm, POIForm, PropertyForm
├── hooks/               ← useProperty.ts (Supabase CRUD)
├── store/               ← useMapStore.ts (Zustand)
├── lib/supabase.ts
└── types/index.ts

packages/ui/src/
├── tokens/              ← brand.ts (--ds-* vars), app uses --pm-* in index.css
├── motion/              ← Framer Motion variants
└── components/          ← Button, Input, Select, Textarea, Badge, ZoneCard, Modal

supabase/
├── migrations/          ← 001–007 applied; 008 pending (Permamap U)
└── functions/           ← generate-course (to be created)
```

## Active Feature: Permamap U

<!-- BEGIN AUTO-MANAGED: permamap-u -->
**Branch**: main
**Spec**: specs/main/spec.md
**Plan**: specs/main/plan.md

New technologies introduced:
- `dompurify@^3.0.9` — HTML sanitization in frontend
- `@anthropic-ai/sdk` (JSR, Deno) — inside `supabase/functions/generate-course/`
- Supabase Edge Functions — first function: `generate-course`
- New DB tables: `curated_sources`, `courses`, `course_sources`
- New enums: `course_category`, `course_status`, `source_status`
- New column: `users.is_admin boolean`
<!-- END AUTO-MANAGED: permamap-u -->

## Design Tokens

- **App/Map context**: `--pm-*` CSS variables + `.pm-*` utility classes (in `frontend/src/index.css`)
- **Brand/Marketing context**: `--ds-*` vars + `packages/ui` brand components
- Do NOT mix token namespaces within the same screen.

## Constitution

See `.specify/memory/constitution.md` for non-negotiable rules.
Key gates: TypeScript strict, Vitest+Playwright tests, DOMPurify for AI HTML, --pm-* tokens
in app context, LCP ≤ 2.5s, bundle ≤ 500KB gzipped, mobile ≥ 375px.

## Useful Commands

```bash
pnpm install                       # Instalar dependências (raiz do workspace)
pnpm dev                           # Start dev server
pnpm exec supabase db push         # Apply DB migrations
pnpm exec supabase functions deploy generate-course
pnpm --filter frontend exec tsc --noEmit    # Type check
pnpm --filter frontend exec vitest run      # Unit tests
pnpm --filter frontend exec playwright test # E2E tests
```
