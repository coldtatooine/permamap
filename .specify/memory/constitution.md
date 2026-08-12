<!--
SYNC IMPACT REPORT
==================
Version change: [TEMPLATE] → 1.0.0
Modified principles: N/A (initial ratification — all principles are new)
Added sections:
  - Core Principles (I. Code Quality, II. Testing Standards, III. UX Consistency, IV. Performance)
  - Technology Stack
  - Development Workflow
  - Governance
Removed sections: N/A
Templates updated:
  - .specify/templates/plan-template.md ✅ (Constitution Check section already present — gates now defined)
  - .specify/templates/spec-template.md ✅ (Success Criteria section aligns with SC performance/quality metrics)
  - .specify/templates/tasks-template.md ✅ (Polish phase tasks align with principles)
Deferred TODOs: None
-->

# Permamap Constitution

## Core Principles

### I. Code Quality

All production code MUST be written in TypeScript with strict mode enabled (`strict: true`
in `tsconfig.json`). The `any` type is forbidden except in explicitly justified, narrowly
scoped adapter layers (require inline comment with rationale). Every module, component, and
hook MUST have a single, clearly defined responsibility. Shared logic MUST live in the
`packages/ui` design system or a dedicated `frontend/src/lib/` utility — never duplicated
across feature files.

**Non-negotiables**:
- TypeScript `strict: true` — no escape hatches without justification comment.
- No `console.log` in committed code; use structured error boundaries or Supabase logging.
- Zustand store slices MUST enforce business-rule validation (e.g., max zones, zone ordering).
- All Supabase queries MUST be wrapped in typed helpers — raw `supabase.from(...)` calls
  outside `frontend/src/hooks/` or `frontend/src/lib/` are prohibited.
- `packages/ui` components MUST export typed props interfaces — no implicit prop drilling.

**Rationale**: Permamap handles geospatial state and complex zone rules. Type safety and
clear module boundaries prevent silent data corruption and make the codebase maintainable
as the feature set grows toward V1 (crops, animals, PDF export).

### II. Testing Standards

Every feature MUST include at minimum: (a) unit tests for business-rule logic (zone
validation, property constraints) and (b) integration smoke tests covering the primary
user journey end-to-end. Tests MUST be written before implementation (TDD) when adding
new business rules to the Zustand store or Supabase hooks.

**Non-negotiables**:
- Business rule functions (e.g., `validateZoneLimit`, `canAddElement`) MUST have unit tests
  with both passing and failing cases using Vitest.
- Supabase CRUD hooks (`useProperty`, future `useCrops`) MUST have integration tests against
  a real Supabase instance or a local emulator — no mocking the database client.
- UI components in `packages/ui` MUST have snapshot or interaction tests (Vitest + Testing
  Library) before being promoted to stable.
- End-to-end critical paths (create property → draw zone → save) MUST be covered by at least
  one Playwright test per feature increment.
- All tests MUST pass on `main` branch before merging. A failing test MUST NOT be silenced
  with `.skip` without a linked GitHub issue.

**Rationale**: The database mock/prod divergence risk is real — Supabase PostGIS spatial
queries can pass with mocks and fail with the real extension. Integration tests are mandatory
for data-layer code.

### III. User Experience Consistency

All UI MUST use design tokens from the active context: `--pm-*` tokens and `.pm-*` CSS
classes for the app/map context; `--ds-*` tokens and `packages/ui` brand components for
landing/marketing context. Mixing token namespaces within a single screen is forbidden.

**Non-negotiables**:
- Fonts MUST be loaded via Google Fonts declarations already present in the project (Lora,
  Syne, Syne Mono for app; Livvic, Century Gothic for brand). No ad-hoc `@import` additions
  without updating `packages/ui/src/tokens/`.
- Every interactive element MUST have a visible focus state (keyboard navigation support).
- Every destructive action (delete zone, delete property) MUST use a confirmation modal
  (`pm-overlay` + `pm-modal` pattern) — no inline delete without confirmation.
- Loading and empty states MUST be handled explicitly — no raw "undefined" or blank screens.
- All error messages displayed to the user MUST be in Portuguese (pt-BR), matching the UI
  language of the application.
- Zone colors MUST be derived from the automatic color system (by zone number) — hardcoded
  hex values in component JSX are prohibited.
- The app MUST be fully usable on mobile (min 375px viewport) — any new layout MUST be
  tested at 375px before merging.

**Rationale**: The dual-theme system (Caderno de Campo Noturno / Agricultural Modern) exists
to serve different audiences. Token namespace pollution breaks visual consistency and makes
future theming changes extremely costly.

### IV. Performance Requirements

The map canvas (Leaflet + react-leaflet) MUST remain interactive at 60 fps during zone
drawing and element placement on devices with ≥4GB RAM. Initial page load MUST achieve a
Largest Contentful Paint (LCP) ≤ 2.5 s on a 4G connection (simulated throttle). Supabase
queries MUST complete within 500 ms p95 for all non-geospatial reads; PostGIS spatial
queries MUST complete within 1 s p95.

**Non-negotiables**:
- Leaflet tile layers and heavy map dependencies MUST be lazy-loaded — no synchronous import
  of Leaflet in the top-level bundle.
- Zustand store updates that trigger map re-renders MUST be debounced when originating from
  pointer/drag events (≤16 ms debounce window).
- Images and static assets MUST be served from Supabase Storage or a CDN — no base64-encoded
  images in component code.
- React component renders caused by store state changes MUST be profiled before shipping any
  feature that adds new store subscriptions. Use `React DevTools Profiler` to confirm no
  cascading re-renders exceed 5 components per interaction.
- Bundle size budget: the initial JS chunk MUST NOT exceed 500 KB gzipped. New dependencies
  require a bundle-size review (`vite-bundle-visualizer`) before merging.

**Rationale**: Permamap's core value is an interactive map. Jank during drawing or slow load
on field devices (where permaculture practitioners often work) directly undermines the product.

## Technology Stack

This section records immutable technology decisions for the current MVP. Changes require a
constitution amendment.

| Layer | Technology | Constraint |
|---|---|---|
| Language | TypeScript (strict) | No JavaScript files in `frontend/src/` |
| UI Framework | React 19 | No React class components |
| Build Tool | Vite + `@tailwindcss/vite` | No Webpack; TailwindCSS v4 zero-config |
| State | Zustand | No Redux, no Context API for global state |
| Map | Leaflet.js + react-leaflet + leaflet-draw | No Mapbox or Google Maps |
| Backend | Supabase Remote (`lwimazukgvzssazdfbmi`) | No self-hosted Postgres for production |
| Database | PostgreSQL + PostGIS | Spatial queries via PostGIS only |
| Animation | Framer Motion | No GSAP; CSS-only animations only for micro-interactions |
| Design System | `packages/ui` (@permamap/ui) | All shared components live here |
| Testing | Vitest + Testing Library + Playwright | No Jest; no Cypress |

## Development Workflow

- Feature branches MUST follow the naming convention `###-kebab-feature-name`
  (e.g., `007-crop-management`).
- Every PR MUST reference a spec in `specs/###-feature-name/spec.md` or include
  an inline rationale for hotfixes.
- Database migrations MUST be committed to `supabase/migrations/` and applied via
  `pnpm exec supabase db push` — no manual schema changes on the remote.
- The `main` branch MUST always be deployable. No WIP commits to `main`.
- All UI copy and messages MUST be written in Portuguese (pt-BR) before merging.
- TypeScript errors (`pnpm --filter frontend exec tsc --noEmit`) and lint errors MUST be zero before merging.

## Governance

This constitution supersedes all other documented practices for the Permamap project.
Violations discovered during code review MUST be flagged before approval.

**Amendment Procedure**:
1. Open a GitHub Issue describing the proposed change and its rationale.
2. Update `.specify/memory/constitution.md` via PR, incrementing the version per semver rules.
3. Propagate changes to affected templates (plan, spec, tasks) in the same PR.
4. PR MUST be approved by the project lead before merging.

**Versioning Policy**:
- MAJOR: Removal or redefinition of an existing principle; breaking governance change.
- MINOR: New principle or section added; materially expanded guidance.
- PATCH: Clarifications, wording fixes, non-semantic refinements.

**Compliance Review**:
All implementation plans (plan.md) MUST include a "Constitution Check" section verified
against current principles before Phase 0 research begins and re-checked after Phase 1 design.

**Version**: 1.0.0 | **Ratified**: 2026-03-22 | **Last Amended**: 2026-03-22
