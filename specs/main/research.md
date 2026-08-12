# Research: Permamap U — Universidade Permamap

**Feature**: Permamap U — AI-powered course generation
**Date**: 2026-03-22
**Phase**: 0 — Research complete

## Findings

### R-001: AI SDK / HTTP Client

- **Finding**: No AI SDK currently installed in `frontend/package.json`.
- **Decision**: Use `@anthropic-ai/sdk` (JSR) inside a Supabase Edge Function (Deno). No AI SDK needed on the React client — all AI work is server-side.
- **Rationale**: Keeps API keys server-side; Supabase Edge Functions run on Deno which supports JSR imports natively; no additional hosting cost.
- **Alternatives considered**: Vercel AI SDK inside Edge Function (adds abstraction without benefit for single-provider MVP); direct `fetch` to Anthropic REST API (less ergonomic than SDK).

### R-002: Supabase Edge Functions

- **Finding**: No Edge Functions exist yet. `supabase/functions/` directory does not exist.
- **Decision**: Create the first Edge Function at `supabase/functions/generate-course/index.ts`.
- **Rationale**: Natural extension of the existing Supabase stack; Edge Function can access DB with service role key, enforce RLS, and call Claude API — all in one server-side execution unit.
- **Alternatives considered**: Separate Node.js/Express backend (extra hosting, separate infrastructure, violates project simplicity constraint).

### R-003: Client-Side Routing

- **Finding**: No routing library installed. App.tsx uses Zustand state + conditional rendering for all navigation (map view, sidebars, auth screen).
- **Decision**: Keep Zustand-based navigation for MVP. Permamap U renders as a new full-screen panel / view managed by store state. Dedicated URLs deferred to post-MVP.
- **Rationale**: Zero new dependencies; consistent with existing architecture; shareable course URLs are not a MVP requirement.
- **Alternatives considered**: TanStack Router (recommended for post-MVP if shareable URLs required); react-router-dom v6 (heavier, more opinionated than needed for MVP).

### R-004: HTML Sanitization

- **Finding**: `dompurify` not installed. No HTML sanitization exists in the codebase.
- **Decision**: Install `dompurify@^3.0.9` in `frontend/`. All AI-generated HTML MUST pass through `DOMPurify.sanitize()` before `dangerouslySetInnerHTML`.
- **Rationale**: Industry-standard, browser-native approach; handles XSS comprehensively; 20KB gzipped (within bundle budget with lazy loading of the course viewer component).
- **Alternatives considered**: `isomorphic-dompurify` (less maintained); `html-react-parser` (converts to React elements — good alternative but higher complexity); server-side sanitization in Edge Function only (insufficient — defense-in-depth requires client-side too).

### R-005: Storage of Generated HTML

- **Decision**: Store generated HTML in `courses.generated_html TEXT` column in PostgreSQL (Supabase). No Supabase Storage needed for MVP.
- **Rationale**: Course pages are expected to be < 50KB each; PostgreSQL text column is fast to query and avoids extra Storage API calls; simplifies the architecture.
- **Constraint**: Enforce 100KB hard limit in Edge Function before inserting — reject and return error if exceeded.
- **Alternatives considered**: Supabase Storage (overkill for text content, adds a second data access pattern); Markdown in DB + client-side render (requires client-side markdown parser, loses structured HTML formatting from Claude).

### R-006: Admin Authentication

- **Finding**: Supabase Auth is already implemented (migrations 004, 005, 007). Auth trigger creates `public.users` record. RLS is enabled on existing tables.
- **Decision**: Admin area protected by Supabase Auth + `is_admin` flag on the `users` table. Edge Function validates admin role via `auth.uid()` check.
- **Rationale**: Leverages existing auth infrastructure; no new auth dependency; can promote any registered user to admin via Supabase Dashboard.
- **Note**: `is_admin` column must be added to `users` table via migration 008.

### R-007: Course HTML Structure from Claude

- **Decision**: Prompt Claude to generate a self-contained HTML `<article>` fragment (no `<html>`, `<head>`, `<body>` tags). The fragment MUST use only inline Tailwind-compatible CSS classes and semantic HTML5 tags.
- **Rationale**: Allows the fragment to be safely inserted inside the React layout without style conflicts; DOMPurify can strip script tags and non-semantic attributes.
- **Prompt strategy**: Provide Claude with: (1) course title, (2) category, (3) concatenated summaries of curated sources, (4) instruction to generate an interactive, well-structured HTML article in Portuguese (pt-BR) using only safe HTML5 + data attributes.

## Dependency Changes

| Package | Environment | Action |
|---------|-------------|--------|
| `dompurify` | `frontend/` pnpm | ADD `pnpm --filter frontend add dompurify @types/dompurify` |
| `@anthropic-ai/sdk` | `supabase/functions/` Deno | ADD via `deno.json` imports (JSR) |
