# Contract: Edge Function — generate-course

**Endpoint**: `POST /functions/v1/generate-course`
**Runtime**: Supabase Edge Function (Deno)
**Auth**: Bearer token (Supabase Auth JWT) — caller MUST be `is_admin = true`

---

## Request

### Headers

```
Authorization: Bearer <supabase_jwt>
Content-Type: application/json
```

### Body

```typescript
{
  title: string;          // Título do curso (max 255 chars) — REQUIRED
  category: CourseCategory; // 'permacultura' | 'agrofloresta' | 'bioconstrucao' | 'sobrevivencialismo'
  source_ids: string[];   // Array de UUIDs de curated_sources — min 1, max 10 — REQUIRED
}
```

### Validation Rules

- `title`: NOT empty, max 255 chars
- `category`: must be one of the 4 valid enum values
- `source_ids`: array of 1–10 valid UUIDs; all must exist in `curated_sources` with `status = 'active'`; all must belong to courses accessible by the admin

---

## Response

### 200 OK — Success

```typescript
{
  course_id: string;      // UUID of created course (status = 'draft')
  slug: string;           // Generated slug (e.g., "introducao-permacultura-2026-03")
  title: string;
  category: CourseCategory;
  generated_html: string; // Sanitized HTML fragment (max 100KB)
  description: string;    // Short description extracted by AI
  generation_metadata: {
    model: string;        // e.g., "claude-opus-4-6"
    input_tokens: number;
    output_tokens: number;
    duration_ms: number;
    source_count: number;
  };
}
```

### 400 Bad Request — Validation Error

```typescript
{
  error: "VALIDATION_ERROR";
  message: string;        // Em português, ex: "O título é obrigatório"
  field?: string;         // Campo com erro, ex: "title"
}
```

### 401 Unauthorized — Not authenticated

```typescript
{
  error: "UNAUTHORIZED";
  message: "Autenticação necessária";
}
```

### 403 Forbidden — Not admin

```typescript
{
  error: "FORBIDDEN";
  message: "Acesso restrito a administradores";
}
```

### 422 Unprocessable — Source not found

```typescript
{
  error: "SOURCE_NOT_FOUND";
  message: "Uma ou mais fontes não foram encontradas";
  invalid_ids: string[];
}
```

### 500 Internal Server Error — AI generation failed

```typescript
{
  error: "GENERATION_FAILED";
  message: "Falha ao gerar o curso. Tente novamente.";
  course_id: string;      // UUID of failed draft (status = 'failed') for retry
}
```

### 413 Payload Too Large — Generated HTML exceeds limit

```typescript
{
  error: "CONTENT_TOO_LARGE";
  message: "O conteúdo gerado excedeu o limite de 100KB. Reduza o número de fontes.";
}
```

---

## Internal Execution Flow

```text
1. Validate JWT → get auth.uid()
2. Check is_admin flag in public.users
3. Validate request body (title, category, source_ids)
4. Fetch curated_sources by source_ids (validate ownership + active status)
5. Build Claude prompt with title + category + concatenated summaries
6. Call Anthropic Claude API → get HTML fragment
7. Validate HTML size ≤ 100KB
8. Generate slug from title + date
9. INSERT into courses (status = 'draft') + course_sources
10. Return course_id + generated_html
```

---

## Claude Prompt Template

```
System: You are an expert educator in sustainable agriculture and permaculture.
Generate a comprehensive, well-structured educational HTML article in Portuguese (pt-BR).
Output ONLY a valid HTML <article> fragment — no <html>, <head>, or <body> tags.
Use only semantic HTML5 tags: h2, h3, p, ul, ol, li, blockquote, code, figure, figcaption.
Do not include any <script> tags or inline event handlers.
Use data-section attributes for navigation purposes.

User: Create an educational course page titled "{title}" in the category "{category}".
Use the following curated source summaries as your knowledge base:
---
{source_1_title}: {source_1_summary}
---
{source_2_title}: {source_2_summary}
---
[... up to 10 sources]
---
Generate a complete, engaging course page that synthesizes this knowledge.
Include: introduction, key concepts, practical applications, and conclusion.
The content must be accurate, educational, and appropriate for beginners to intermediate learners.
```
