# Implementation Plan: Permamap U — Universidade Permamap

**Branch**: `main` | **Date**: 2026-03-22 | **Spec**: specs/main/spec.md
**Input**: Feature specification from `specs/main/spec.md`

## Summary

Criar a Permamap U: área educacional dentro da plataforma com (1) painel de administração
para curadoria de fontes de conteúdo e (2) gerador de cursos via IA (Anthropic Claude).
Os cursos são páginas HTML geradas pela IA a partir de resumos curados pelo admin,
armazenadas no Supabase e renderizadas de forma segura com DOMPurify para os usuários.

## Technical Context

**Language/Version**: TypeScript 5.x (strict), Deno 2 (Edge Functions)
**Primary Dependencies**: React 19, Vite, Supabase JS v2, Zustand, Framer Motion,
  dompurify@^3.0.9 (new), @anthropic-ai/sdk via JSR Deno (new)
**Storage**: PostgreSQL (Supabase) — novos tables: `curated_sources`, `courses`, `course_sources`
**Testing**: Vitest + @testing-library/react + Playwright
**Target Platform**: Web (browser, desktop + mobile ≥ 375px)
**Project Type**: Web application — nova feature dentro de app React existente
**Performance Goals**: LCP ≤ 2.5s para páginas de curso; geração IA ≤ 60s p95
**Constraints**: Bundle ≤ 500KB gzipped (DOMPurify + lazy-load), HTML gerado ≤ 100KB,
  mobile ≥ 375px, TypeScript strict (no any), todas as mensagens em pt-BR
**Scale/Scope**: MVP — 1 admin, dezenas de fontes, dezenas de cursos inicialmente

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. Code Quality | TypeScript strict em todos os arquivos novos | ✅ PASS |
| I. Code Quality | Supabase queries apenas via `useUniversity` hook | ✅ PASS |
| I. Code Quality | Sem `console.log` — erros via error state do hook | ✅ PASS |
| II. Testing Standards | Business rules (validação de fontes, slug) com Vitest | ✅ PASS |
| II. Testing Standards | `useUniversity` hook com integration test (real Supabase) | ✅ PASS |
| II. Testing Standards | Happy path (cadastrar fonte → gerar curso → publicar) com Playwright | ✅ PASS |
| III. UX Consistency | Tokens `--pm-*` para componentes da área app; nunca `--ds-*` | ✅ PASS |
| III. UX Consistency | Ações destrutivas (remover fonte) DEVEM ter modal de confirmação | ✅ PASS |
| III. UX Consistency | Estado vazio explícito quando sem cursos publicados | ✅ PASS |
| III. UX Consistency | Mensagens de erro em português (pt-BR) | ✅ PASS |
| IV. Performance | `CourseViewer` + DOMPurify lazy-loaded (não no bundle principal) | ✅ PASS |
| IV. Performance | HTML gerado limitado a 100KB no banco + validado na Edge Function | ✅ PASS |
| IV. Performance | Rota/painel da Permamap U lazy-loaded | ✅ PASS |

**Post-design re-check**: ✅ Todos os gates passam após Phase 1. Sem violações a justificar.

## Project Structure

### Documentation (this feature)

```text
specs/main/
├── spec.md              ← Feature specification
├── plan.md              ← This file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   ├── edge-function-generate-course.md
│   └── supabase-rest-university.md
└── tasks.md             ← Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
frontend/src/
├── components/University/
│   ├── UniversityView.tsx          ← Listagem pública de cursos (US3)
│   ├── CourseViewer.tsx            ← Renderizador HTML seguro (DOMPurify, lazy)
│   ├── CourseCard.tsx              ← Card na listagem
│   └── Admin/
│       ├── UniversityAdmin.tsx     ← Container painel admin
│       ├── SourceManager.tsx       ← CRUD de fontes curadas (US1)
│       ├── SourceForm.tsx          ← Form criar/editar fonte
│       ├── CourseGenerator.tsx     ← Seletor de fontes + botão gerar (US2)
│       └── CourseAdminList.tsx     ← Lista cursos do admin (rascunhos + publicados)
├── hooks/
│   └── useUniversity.ts            ← Typed Supabase hook (CuratedSources + Courses)
└── types/
    └── university.ts               ← CourseCategory, CourseStatus, CuratedSource, Course, etc.

supabase/
├── migrations/
│   └── 008_university_schema.sql   ← Enums + tabelas + RLS (ver data-model.md)
└── functions/
    └── generate-course/
        ├── index.ts                 ← Edge Function Deno (Claude API)
        └── deno.json                ← JSR imports (@anthropic-ai/sdk)

frontend/src/tests/
├── unit/
│   └── university/
│       ├── slugGenerator.test.ts   ← Business rule: geração de slug
│       └── sourceValidation.test.ts ← Business rule: validação de URL + campos
├── integration/
│   └── useUniversity.test.ts       ← Integration test (real Supabase)
└── e2e/
    └── university.spec.ts          ← Playwright: happy path completo
```

**Structure Decision**: Web application — nova feature integrada ao frontend React existente
e nova Edge Function no Supabase. Sem novo projeto separado.

## Complexity Tracking

> Nenhuma violação de constituição identificada. Tabela de justificativas não necessária.
