# Tasks: Permamap U — Universidade Permamap

**Input**: Design documents from `specs/main/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Integration tests incluídos para `useUniversity` hook (business-critical, real Supabase);
unit tests para funções de regra de negócio; Playwright e2e para happy path.
TDD apenas para funções utilitárias de regra de negócio.

**Organization**: Tasks agrupadas por user story para entrega independente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: US1 = fontes curadas, US2 = geração de curso IA, US3 = listagem pública

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Novas dependências, tipos e schema de banco — necessários antes de qualquer user story.

- [X] T001 Install `dompurify @types/dompurify` in `frontend/` (`pnpm --filter frontend add dompurify @types/dompurify`)
- [X] T002 Create `frontend/src/types/university.ts` with all university types: `CourseCategory`, `CourseStatus`, `SourceStatus`, `CuratedSource`, `Course`, `CreateSourceInput`, `UpdateSourceInput`, `GenerateCourseInput`
- [X] T003 [P] Create `supabase/migrations/008_university_schema.sql` with full SQL from `specs/main/data-model.md` (enums, tables, indexes, RLS policies, `users.is_admin boolean NOT NULL DEFAULT false` column)
- [X] T004 [P] Create `supabase/functions/generate-course/deno.json` with JSR import: `"@anthropic-ai/sdk": "jsr:@anthropic-ai/sdk@^0.36.0"`
- [X] T005 Run `pnpm exec supabase db push` to apply migration 008 to the remote Supabase project

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Nível de acesso admin, hook e Edge Function — TODOS DEVEM estar completos antes de qualquer UI de user story.

**⚠️ CRÍTICO**: Nenhum trabalho de UI de user story pode começar antes de T006–T013 estarem completos.

- [X] T006 Add `isAdmin: boolean` field (default `false`) and action `setIsAdmin(value: boolean)` to `frontend/src/store/useAuthStore.ts` — extend the `AuthStore` TypeScript interface and Zustand store definition
- [X] T007 Extend the `onAuthStateChange` listener in `frontend/src/App.tsx` — after successful auth, query `public.users` for `is_admin` using `supabase.from('users').select('is_admin').eq('id', session.user.id).single()` and call `useAuthStore.getState().setIsAdmin(data.is_admin ?? false)`. On sign-out, reset to `false`.
- [X] T008 Create `frontend/src/hooks/useUniversity.ts` implementing the full `UseUniversity` interface from `specs/main/contracts/supabase-rest-university.md`: `fetchSources`, `createSource`, `updateSource`, `archiveSource`, `fetchCourses`, `fetchCourseById`, `generateCourse` (calls Edge Function), `publishCourse`, `archiveCourse`, `regenerateCourse`, `selectCourse` — all state fields (`sources`, `courses`, `selectedCourse`, loading/error flags)
- [X] T009 Create `supabase/functions/generate-course/index.ts` implementing the full Edge Function contract from `specs/main/contracts/edge-function-generate-course.md`: JWT validation → admin check (`is_admin`) → input validation → fetch sources → build Claude prompt → call Anthropic SDK → validate HTML size (≤ 100KB) → generate slug → INSERT into `courses` + `course_sources` → return response. Handle all error cases (401, 403, 400, 422, 413, 500).
- [X] T010 [P] Write unit test `frontend/src/tests/unit/university/slugGenerator.test.ts` — test slug generation from title + date (e.g., "Fundamentos da Permacultura" + "2026-03" → `"fundamentos-da-permacultura-2026-03"`) — TDD: write first, verify fails, then implement the slug util
- [X] T011 [P] Write unit test `frontend/src/tests/unit/university/sourceValidation.test.ts` — test URL validation and required field checks with passing and failing cases — TDD: write first, verify fails, then implement the validation util

**Checkpoint**: `isAdmin` disponível no store, hook interface completa, Edge Function deployada, testes unitários passando — trabalho de UI pode iniciar.

---

## Phase 3: User Story 1 — Administrador cadastra material curado (Priority: P1) 🎯 MVP

**Goal**: Admin pode cadastrar, listar, editar e remover fontes curadas via painel.

**Independent Test**: Com um usuário admin autenticado (`is_admin = true`), navegar ao painel → cadastrar uma fonte → ver na listagem → editar → arquivar com confirmação. Valor entregue: acervo de fontes curadas gerenciável.

### Integration Test for User Story 1 ⚠️

> **NOTE: Verify test FAILS before implementation of T013–T018**

- [X] T012 [P] [US1] Write integration test `frontend/src/tests/integration/useUniversity.test.ts` covering: `createSource` inserts into real Supabase, `fetchSources` returns the created source, `updateSource` changes the title, `archiveSource` sets status to `archived`

### Implementation for User Story 1

- [X] T013 [P] [US1] Create `frontend/src/components/University/Admin/SourceForm.tsx` — form com campos: título (text input), URL (text input com validação), categoria (select com 4 opções em pt-BR), resumo (textarea), tags (text input, comma-separated). Usar tokens `--pm-*` e componentes de `packages/ui`. Mensagens de erro em pt-BR.
- [X] T014 [P] [US1] Create `frontend/src/components/University/Admin/SourceManager.tsx` — listagem de fontes curadas com: tabela/lista de fontes, botões "Editar" e "Arquivar" por linha, estado vazio com mensagem "Nenhuma fonte cadastrada ainda", filtro por categoria. Usa `useUniversity().sources`.
- [X] T015 [US1] Integrate `SourceForm` inside `SourceManager` — modal `.pm-overlay` + `.pm-modal` para criar/editar fonte. Botão "Nova Fonte" abre modal. "Salvar" chama `createSource` ou `updateSource`. Modal fecha ao salvar com sucesso.
- [X] T016 [US1] Add confirmation modal in `SourceManager` for archive action — ao clicar "Arquivar", exibir `.pm-overlay` + `.pm-modal` com mensagem "Tem certeza que deseja arquivar esta fonte? Esta ação pode ser revertida." Confirmar chama `archiveSource`.
- [X] T017 [US1] Create `frontend/src/components/University/Admin/UniversityAdmin.tsx` — container do painel admin com tab navigation: "Fontes" (SourceManager) e "Cursos" (placeholder para US2). Protegido: lê `useAuthStore().isAdmin`; se `false`, renderiza `UniversityView` (view pública) em vez do painel.
- [X] T018 [US1] Wire `UniversityAdmin` into `frontend/src/App.tsx` — adicionar condição no render para exibir `UniversityAdmin` ou `UniversityView` quando `store.activePanel === 'university'` (admin vê painel, user vê listagem pública). Adicionar ação `setActivePanel('university')` ao store.

**Checkpoint**: User Story 1 completamente funcional e testável de forma independente. Admin pode gerenciar todo o acervo de fontes.

---

## Phase 4: User Story 2 — Administrador gera um curso com IA (Priority: P2)

**Goal**: Admin seleciona fontes, digita título e categoria, dispara geração IA, visualiza preview HTML e publica.

**Independent Test**: Com fontes cadastradas (US1), navegar ao gerador → selecionar fontes → gerar → ver preview → publicar. Curso aparece com status "publicado" na tabela `courses`.

### Implementation for User Story 2

- [X] T019 [P] [US2] Create `frontend/src/components/University/Admin/CourseGenerator.tsx` — interface de geração: (1) seletor de fontes (checkbox list com filtro por categoria), (2) campo título do curso, (3) select categoria, (4) botão "Gerar Curso" (desabilitado se nenhuma fonte selecionada ou título vazio). Enquanto gerando: spinner + mensagem "Gerando curso com IA... isso pode levar até 60 segundos". Chama `useUniversity().generateCourse`.
- [X] T020 [P] [US2] Create `frontend/src/components/University/Admin/CourseAdminList.tsx` — listagem de cursos do admin com: todas as colunas (título, categoria, status badge, data), ações "Publicar" (se draft), "Arquivar" (se published), "Regenerar" (se draft ou failed), "Visualizar Preview". Status badges com cores: draft=cinza, published=verde, failed=vermelho, archived=amarelo. Usa `useUniversity().courses`.
- [X] T021 [P] [US2] Create `frontend/src/components/University/CourseViewer.tsx` — renderizador HTML seguro. `React.lazy()` + `Suspense`. Recebe `htmlContent: string`, aplica `DOMPurify.sanitize()` com allowed tags definidos no contrato, usa `dangerouslySetInnerHTML`. Exibir dentro de `.pm-modal` com botão fechar.
- [X] T022 [US2] Integrate `CourseGenerator` and `CourseAdminList` into `UniversityAdmin.tsx` — adicionar tab "Gerar Curso" e "Meus Cursos". `CourseGenerator` dispara geração e ao concluir abre `CourseViewer` com preview. `CourseAdminList` exibe cursos existentes com ações publicar/arquivar/regenerar.
- [X] T023 [US2] Add error handling in `CourseGenerator` for generation failure — quando `generateCourse` retorna erro: exibir mensagem de erro em pt-BR, mostrar o rascunho com status `failed` na lista, botão "Tentar novamente" chama `regenerateCourse(course_id)`.
- [ ] T024 [US2] Deploy Edge Function: `pnpm exec supabase functions deploy generate-course` — verificar no Supabase Dashboard que a função está ativa. Adicionar secret `ANTHROPIC_API_KEY` via `pnpm exec supabase secrets set ANTHROPIC_API_KEY=<key>`.

**Checkpoint**: Admin consegue gerar e publicar um curso completo. User Stories 1 + 2 funcionam de forma independente.

---

## Phase 5: User Story 3 — Usuário navega e lê cursos (Priority: P3)

**Goal**: Usuário autenticado acessa Permamap U, vê listagem de cursos publicados, filtra por categoria, abre e lê um curso.

**Independent Test**: Com um curso publicado no banco, navegar à Permamap U → ver card do curso → clicar → HTML renderizado via DOMPurify. Sem cursos: estado vazio com mensagem adequada.

### E2E Test for User Story 3 ⚠️

> **NOTE: Verify test FAILS before implementation of T026–T028**

- [X] T025 [P] [US3] Write Playwright test `frontend/src/tests/e2e/university.spec.ts` covering: login → navegar à Permamap U → ver curso publicado na lista → filtrar por categoria → abrir curso → verificar HTML renderizado sem tags `<script>`. Requer fixture com curso publicado no banco.

### Implementation for User Story 3

- [X] T026 [P] [US3] Create `frontend/src/components/University/CourseCard.tsx` — card de curso para listagem: título, badge de categoria com cor temática (permacultura=verde, agrofloresta=laranja, bioconstrucao=marrom, sobrevivencialismo=cinza-escuro), descrição resumida (max 120 chars), data de publicação formatada em pt-BR. Tokens `--pm-*`. Hover animation com Framer Motion.
- [X] T027 [P] [US3] Create `frontend/src/components/University/UniversityView.tsx` — view pública da Permamap U: (1) header com título "Permamap U" e subtítulo, (2) filtros por categoria (botões toggle), (3) grade de `CourseCard` para cursos publicados, (4) estado vazio ("Em breve novos cursos — estamos preparando o material para você."), (5) estado loading com skeleton cards. Usa `useUniversity().fetchCourses({ status: 'published' })`.
- [X] T028 [US3] Complete `UniversityView` integration in `frontend/src/App.tsx` (already wired in T018) — ao clicar em `CourseCard`, chamar `fetchCourseById` e abrir `CourseViewer` (lazy-loaded). Confirmar que o botão/link de acesso à Permamap U na navegação principal está visível para todos os usuários autenticados.

**Checkpoint**: Todas as 3 user stories funcionam de forma independente. Produto completo entregável ao usuário.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade, performance e cobertura final.

- [X] T029 [P] Lazy-load `CourseViewer` component — confirmar que `React.lazy(() => import('./CourseViewer'))` e `Suspense` estão corretos. Rodar `pnpm build` e verificar que DOMPurify não está no bundle principal (`vite-bundle-visualizer`).
- [X] T030 [P] TypeScript strict audit — rodar `pnpm --filter frontend exec tsc --noEmit` e corrigir qualquer erro. Verificar que `DOMPurify.sanitize()` e `isAdmin` estão tipados sem `any` implícito.
- [X] T031 [P] Mobile responsiveness audit — abrir `UniversityView`, `SourceManager` e `CourseGenerator` em viewport 375px. Corrigir qualquer layout quebrado. Verificar modais funcionam em mobile.
- [X] T032 [P] Loading and empty states audit — verificar todos os componentes têm: estado loading explícito (spinner ou skeleton), estado vazio com mensagem em pt-BR, estado de erro com mensagem acionável.
- [X] T033 Run full test suite: `pnpm --filter frontend exec vitest run` (unit + integration) + `pnpm --filter frontend exec playwright test` (e2e). Todos devem passar. Corrigir falhas antes de considerar a feature completa.
- [ ] T034 Run quickstart.md validation — executar o happy path completo descrito em `specs/main/quickstart.md` manualmente. Confirmar todos os passos passam, incluindo marcar usuário como admin e verificar acesso ao painel.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — pode começar imediatamente
- **Foundational (Phase 2)**: Depende de Phase 1 completa — BLOQUEIA todas as user stories
- **US1 (Phase 3)**: Depende de Phase 2 (isAdmin no store + hook pronto)
- **US2 (Phase 4)**: Depende de Phase 2 (hook + Edge Function) — pode rodar em paralelo com US1
- **US3 (Phase 5)**: Depende de Phase 2 — T028 depende de T018 (wiring no App.tsx)
- **Polish (Phase 6)**: Depende de todas as user stories completas

### User Story Dependencies

- **US1 (P1)**: Inicia após Phase 2 — independente de US2/US3
- **US2 (P2)**: Inicia após Phase 2 — T021 (CourseViewer) pode ser feito antes de US2 iniciar
- **US3 (P3)**: Inicia após Phase 2 — T026/T027 independentes de US1/US2

### Within Each User Story

- Unit tests (T010, T011) escritos e verificados falhando antes das implementações
- Integration test (T012) escrito e verificado falhando antes de T013–T018
- E2E test (T025) escrito e verificado falhando antes de T026–T028
- `isAdmin` (T006, T007) DEVE estar completo antes de qualquer componente usar o flag

### Parallel Opportunities

- T003 ‖ T004 (migration SQL e deno.json — arquivos diferentes)
- T006 ‖ T008 ‖ T009 ‖ T010 ‖ T011 (store, hook, Edge Function, unit tests — todos independentes)
- T013 ‖ T014 (SourceForm e SourceManager — arquivos diferentes)
- T019 ‖ T020 ‖ T021 (três componentes de US2 — arquivos diferentes)
- T026 ‖ T027 (CourseCard e UniversityView — arquivos diferentes)
- T029 ‖ T030 ‖ T031 ‖ T032 (polish — todos independentes)

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Rodar em paralelo (após Phase 1):
Task T006: "Add isAdmin to frontend/src/store/useAuthStore.ts"
Task T008: "Create frontend/src/hooks/useUniversity.ts"
Task T009: "Create supabase/functions/generate-course/index.ts"
Task T010: "Write unit test frontend/src/tests/unit/university/slugGenerator.test.ts"
Task T011: "Write unit test frontend/src/tests/unit/university/sourceValidation.test.ts"
# T007 depende de T006 (usa setIsAdmin)
```

## Parallel Example: User Story 1

```bash
# Rodar em paralelo (após Phase 2):
Task T013: "Create SourceForm.tsx"
Task T014: "Create SourceManager.tsx"
```

## Parallel Example: User Story 2

```bash
# Rodar em paralelo (após Phase 2):
Task T019: "Create CourseGenerator.tsx"
Task T020: "Create CourseAdminList.tsx"
Task T021: "Create CourseViewer.tsx (lazy)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T005)
2. Complete Phase 2: Foundational (T006–T011) — CRÍTICO: bloqueia tudo
3. Complete Phase 3: User Story 1 (T012–T018)
4. **PARAR E VALIDAR**: Admin consegue gerenciar fontes curadas de ponta a ponta, com acesso restrito por `isAdmin`
5. Deploy/demo se ready

### Incremental Delivery

1. Setup + Foundational → Base + níveis de acesso prontos
2. US1 → Admin gerencia fontes → demo interno ✅
3. US2 → Admin gera e publica cursos → primeiro curso real ✅
4. US3 → Usuários acessam cursos → produto visível aos usuários ✅
5. Polish → Qualidade e performance garantidas

### Parallel Team Strategy

Com 2 desenvolvedores após Phase 2:
- Dev A: User Story 1 (T012–T018) — admin CRUD fontes
- Dev B: T021 (CourseViewer) + User Story 2 (T019–T024)

---

## Notes

- `[P]` = arquivos diferentes, sem dependências — podem rodar em paralelo
- `isAdmin` vem de `useAuthStore().isAdmin` — lido do banco após login (T006 + T007)
- Todos os textos/mensagens para o usuário DEVEM ser em pt-BR
- Tokens `--pm-*` em todos os componentes (contexto app/mapa)
- `useUniversity.ts` é o único ponto de acesso ao Supabase para esta feature — sem `supabase.from()` direto nos components (exceção: T007 no bootstrap de auth no App.tsx)
- Integration test (T012) usa Supabase real — não mockar o cliente
- DOMPurify DEVE estar no `CourseViewer` — nunca renderizar HTML gerado sem sanitização
- `CourseViewer` DEVE ser lazy-loaded — não incluir DOMPurify no bundle principal
- Cada user story deve ser commitada como incremento independente e funcional
