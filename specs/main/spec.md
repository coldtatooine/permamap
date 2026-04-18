# Feature Specification: Permamap U — Universidade Permamap

**Feature Branch**: `main`
**Created**: 2026-03-22
**Status**: Draft
**Input**: "Vamos criar uma área de conteúdo dentro da plataforma chamada de 'Permamap U' Universidade Permamap. Nela teremos cursos e materiais sobre Permacultura, Agrofloresta, Bioconstrução e Sobrevivencialismo. O conteúdo inicialmente será composto por páginas HTML que resumem e consolidam conteúdos disponíveis na internet. A Permamamp U será um subproduto que utiliza I.A para consolidar informações curadas da internet e gerar estas páginas interativas de cursos. Construa o plano de implementação considerando a area de administração de cadastro do material curado e o gerador de páginas interativas(Cursos)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Administrador cadastra material curado (Priority: P1)

Um administrador da plataforma acessa o painel de administração da Permamap U e cadastra
fontes de conteúdo curado: insere título, URL de origem, categoria (Permacultura / Agrofloresta
/ Bioconstrução / Sobrevivencialismo), um resumo manual e tags relevantes. O objetivo é
construir um acervo de fontes confiáveis que servirão de base para a geração de cursos via IA.

**Why this priority**: Sem fontes cadastradas não há material para gerar cursos. Este é o
pré-requisito absoluto de toda a Permamap U.

**Independent Test**: O admin consegue acessar o painel, cadastrar uma fonte, vê-la listada
com seus dados, editá-la e removê-la. Valor entregue: acervo de fontes curadas gerenciável.

**Acceptance Scenarios**:

1. **Given** o admin está autenticado no painel, **When** preenche título, URL, categoria e
   resumo e clica em "Salvar", **Then** a fonte aparece na listagem com status "ativa".
2. **Given** o admin visualiza a listagem de fontes, **When** clica em "Editar" em uma fonte,
   **Then** pode alterar qualquer campo e salvar sem perder os outros dados.
3. **Given** o admin visualiza a listagem, **When** clica em "Remover", **Then** vê um modal
   de confirmação e, ao confirmar, a fonte é removida da listagem.
4. **Given** o admin tenta salvar uma fonte sem URL, **When** clica em "Salvar", **Then** vê
   mensagem de validação "URL é obrigatória" e o formulário não é submetido.

---

### User Story 2 - Administrador gera um curso com IA (Priority: P2)

O administrador seleciona um conjunto de fontes curadas do acervo (mesma categoria ou mistas),
fornece um título para o curso, e dispara a geração via IA. A IA consolida os resumos das
fontes selecionadas e gera uma página HTML interativa e estruturada para o curso. O admin
revisa o resultado, pode regenerar se necessário, e publica o curso.

**Why this priority**: Este é o diferencial central da Permamap U — transformar conteúdo
curado em material didático gerado por IA. Sem geração, o acervo não tem saída.

**Independent Test**: Com ao menos uma fonte cadastrada, o admin consegue disparar a geração,
visualizar o HTML gerado em preview, e publicar. Valor entregue: primeiro curso disponível
para os usuários.

**Acceptance Scenarios**:

1. **Given** o admin está no painel com fontes cadastradas, **When** seleciona fontes, define
   título e categoria e clica em "Gerar Curso", **Then** vê um indicador de progresso e, ao
   concluir, o HTML do curso é exibido em preview.
2. **Given** o admin visualiza o preview gerado, **When** clica em "Publicar", **Then** o
   curso aparece na listagem pública da Permamap U com status "publicado".
3. **Given** o admin não está satisfeito com o conteúdo gerado, **When** clica em "Regenerar",
   **Then** a IA processa novamente as mesmas fontes e retorna novo HTML.
4. **Given** a geração de IA falha (timeout ou erro de API), **When** o processo retorna erro,
   **Then** o admin vê mensagem de erro em português e o rascunho é salvo como "falha" para
   nova tentativa.

---

### User Story 3 - Usuário navega e lê cursos na Permamap U (Priority: P3)

O usuário final acessa a seção "Permamap U" dentro da plataforma, navega pela lista de cursos
publicados (filtráveis por categoria), clica em um curso e visualiza a página HTML interativa
gerada pela IA.

**Why this priority**: É o produto final entregue ao usuário. Depende de US1 e US2 estarem
funcionando, mas é independentemente testável uma vez que haja ao menos um curso publicado.

**Independent Test**: Com um curso publicado no banco, o usuário acessa a rota `/university`,
vê o curso na listagem e consegue abrir e ler o conteúdo HTML gerado.

**Acceptance Scenarios**:

1. **Given** existem cursos publicados, **When** o usuário acessa a Permamap U, **Then** vê
   uma grade de cursos com título, categoria e descrição resumida.
2. **Given** o usuário está na listagem, **When** filtra por categoria "Agrofloresta",
   **Then** apenas cursos dessa categoria são exibidos.
3. **Given** o usuário clica em um curso, **When** a página carrega, **Then** o HTML gerado
   pela IA é renderizado de forma segura e estilizada dentro do layout da plataforma.
4. **Given** não há cursos publicados, **When** o usuário acessa a Permamap U, **Then** vê
   um estado vazio com mensagem "Em breve novos cursos" — nunca uma tela em branco.

---

### Edge Cases

- O que acontece quando a IA gera HTML com scripts maliciosos? → HTML DEVE ser sanitizado
  com DOMPurify antes de renderizar.
- O que acontece quando a fonte curada tem URL inválida ou fora do ar? → Validação de URL
  no front + a IA usa apenas os resumos fornecidos pelo admin (não acessa a URL diretamente).
- O que acontece quando nenhuma fonte é selecionada para geração? → Botão "Gerar Curso"
  desabilitado enquanto nenhuma fonte estiver selecionada.
- O que acontece quando o curso gerado excede o limite de tamanho do campo? → HTML truncado
  com aviso; limite máximo de 100KB por curso no banco.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEVE permitir que administradores cadastrem, editem e removam fontes de
  conteúdo curado (título, URL, categoria, resumo, tags).
- **FR-002**: Sistema DEVE validar que URL seja preenchida e siga formato válido ao cadastrar
  fontes.
- **FR-003**: Sistema DEVE permitir que o administrador selecione múltiplas fontes e dispare
  a geração de um curso via IA (Supabase Edge Function + Claude API).
- **FR-004**: Sistema DEVE salvar o HTML gerado pela IA no banco de dados com status
  `rascunho` antes da publicação.
- **FR-005**: Sistema DEVE permitir que o administrador publique ou arquive um curso gerado.
- **FR-006**: Sistema DEVE sanitizar o HTML gerado antes de renderizá-lo (DOMPurify).
- **FR-007**: Sistema DEVE exibir cursos publicados na rota `/university` para todos os
  usuários autenticados na plataforma.
- **FR-008**: Sistema DEVE permitir filtrar cursos por categoria na listagem pública.
- **FR-009**: Sistema DEVE exibir estado vazio adequado quando não houver cursos publicados.
- **FR-010**: Sistema DEVE registrar log de erro quando a geração de IA falhar e salvar o
  rascunho com status `falha`.
- **FR-011**: Autenticação para a área de administração DEVE ser via Supabase Auth (usuário
  com role `admin`).

### Key Entities

- **CuratedSource**: Fonte de conteúdo curado — título, URL, categoria, resumo manual, tags,
  status (ativa/arquivada), timestamps.
- **Course**: Curso gerado — título, categoria, slug, HTML gerado, status
  (rascunho/publicado/arquivado/falha), fontes utilizadas (N:N com CuratedSource), timestamps.
- **CourseSource**: Tabela de junção Course ↔ CuratedSource (rastreabilidade da geração).
- **CourseCategory**: Enum — `permacultura`, `agrofloresta`, `bioconstrucao`,
  `sobrevivencialismo`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrador consegue cadastrar uma fonte curada em menos de 2 minutos.
- **SC-002**: Geração de um curso via IA completa em menos de 60 segundos (p95).
- **SC-003**: Página de curso carrega e renderiza em menos de 2,5 s (LCP ≤ 2,5 s).
- **SC-004**: 100% do HTML gerado pela IA passa por sanitização DOMPurify antes de renderizar.
- **SC-005**: Admin consegue publicar um curso (do cadastro de fontes ao curso publicado) em
  menos de 5 minutos de trabalho efetivo.
- **SC-006**: Listagem de cursos suporta filtro por categoria sem recarregar a página.
