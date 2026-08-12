# Quickstart: Permamap U

Guia para configurar e validar a feature Permamap U localmente.

## Pré-requisitos

- Node.js 20+, Deno 2+
- Supabase CLI instalado e linkado ao projeto remoto (`pnpm exec supabase link`)
- `ANTHROPIC_API_KEY` disponível para adicionar como secret no Supabase

---

## 1. Instalar dependências do frontend

```bash
pnpm --filter frontend add dompurify @types/dompurify
```

---

## 2. Aplicar migração do banco

```bash
# Na raiz do projeto
pnpm exec supabase db push
```

Confirmar que a migration `008_university_schema.sql` foi aplicada:
- Tabelas `curated_sources`, `courses`, `course_sources` existem
- Enums `course_category`, `course_status`, `source_status` existem
- Coluna `is_admin` foi adicionada à tabela `users`

---

## 3. Configurar Edge Function

```bash
# Criar diretório da função
mkdir -p supabase/functions/generate-course

# Adicionar o secret da Anthropic
pnpm exec supabase secrets set ANTHROPIC_API_KEY=<sua-chave>
```

Criar `supabase/functions/generate-course/deno.json`:
```json
{
  "imports": {
    "@anthropic-ai/sdk": "jsr:@anthropic-ai/sdk@^0.36.0"
  }
}
```

---

## 4. Deploy da Edge Function

```bash
pnpm exec supabase functions deploy generate-course
```

---

## 5. Marcar usuário como admin

No Supabase Dashboard → SQL Editor:

```sql
UPDATE public.users
SET is_admin = true
WHERE id = '<seu-user-id>';
```

Ou via CLI:
```bash
pnpm exec supabase sql "UPDATE public.users SET is_admin = true WHERE id = '<seu-user-id>'"
```

---

## 6. Rodar o frontend

```bash
pnpm dev
```

---

## 7. Validação manual (Happy Path)

### 7.1 Cadastrar fonte curada

1. Login com usuário admin
2. Acessar "Permamap U" → "Administração"
3. Clicar em "Nova Fonte"
4. Preencher: título = "Introdução à Permacultura", URL = `https://example.com`,
   categoria = Permacultura, resumo = "Permacultura é um sistema de design..."
5. Salvar → fonte aparece na listagem com status "ativa" ✅

### 7.2 Gerar curso

1. Selecionar a fonte cadastrada (checkbox)
2. Preencher título do curso: "Fundamentos da Permacultura"
3. Clicar em "Gerar Curso"
4. Aguardar indicador de progresso
5. Preview do HTML gerado aparece ✅
6. Clicar em "Publicar" → status muda para "publicado" ✅

### 7.3 Visualizar curso como usuário

1. Acessar "Permamap U" → lista de cursos
2. Curso "Fundamentos da Permacultura" aparece na listagem ✅
3. Clicar no curso → HTML renderizado de forma segura ✅

---

## 8. Validação de segurança

Verificar que DOMPurify remove scripts maliciosos:

```typescript
// No console do browser:
import DOMPurify from 'dompurify';
const malicious = '<script>alert("xss")</script><p>Conteúdo seguro</p>';
console.log(DOMPurify.sanitize(malicious));
// Expected: <p>Conteúdo seguro</p>
```

---

## 9. Rodar testes

```bash
pnpm --filter frontend exec vitest run       # Testes unitários (business rules)
pnpm --filter frontend exec playwright test  # Testes e2e (happy path)
```
