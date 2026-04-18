import Anthropic from '@anthropic-ai/sdk';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type CourseCategory = 'permacultura' | 'agrofloresta' | 'bioconstrucao' | 'sobrevivencialismo';

const CATEGORY_LABELS: Record<CourseCategory, string> = {
  permacultura: 'Permacultura',
  agrofloresta: 'Agrofloresta',
  bioconstrucao: 'Bioconstrução',
  sobrevivencialismo: 'Sobrevivencialismo',
};

function generateSlug(title: string): string {
  const date = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-') + '-' + date;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // 1. Validate JWT
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return json({ error: 'UNAUTHORIZED', message: 'Autenticação necessária' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')!;

  // Use service role client for DB operations + anon client to verify user token
  const userToken = authHeader.replace('Bearer ', '');
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(userToken);

  if (authError || !user) {
    return json({ error: 'UNAUTHORIZED', message: 'Autenticação necessária' }, 401);
  }

  // 2. Check admin flag
  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    return json({ error: 'FORBIDDEN', message: 'Acesso restrito a administradores' }, 403);
  }

  // 3. Parse and validate request body
  let body: { title?: string; category?: string; source_ids?: string[] };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'VALIDATION_ERROR', message: 'JSON inválido' }, 400);
  }

  const { title, category, source_ids } = body;

  if (!title?.trim()) {
    return json({ error: 'VALIDATION_ERROR', message: 'O título é obrigatório', field: 'title' }, 400);
  }
  if (title.length > 255) {
    return json({ error: 'VALIDATION_ERROR', message: 'O título deve ter no máximo 255 caracteres', field: 'title' }, 400);
  }
  const validCategories: CourseCategory[] = ['permacultura', 'agrofloresta', 'bioconstrucao', 'sobrevivencialismo'];
  if (!category || !validCategories.includes(category as CourseCategory)) {
    return json({ error: 'VALIDATION_ERROR', message: 'Categoria inválida', field: 'category' }, 400);
  }
  if (!Array.isArray(source_ids) || source_ids.length === 0 || source_ids.length > 10) {
    return json({ error: 'VALIDATION_ERROR', message: 'Selecione entre 1 e 10 fontes', field: 'source_ids' }, 400);
  }

  // 4. Fetch curated sources
  const { data: sources, error: sourcesError } = await supabaseAdmin
    .from('curated_sources')
    .select('id, title, summary, category')
    .in('id', source_ids)
    .eq('status', 'active');

  if (sourcesError) {
    return json({ error: 'GENERATION_FAILED', message: 'Falha ao buscar fontes' }, 500);
  }

  const foundIds = (sources ?? []).map((s: { id: string }) => s.id);
  const invalidIds = source_ids.filter(id => !foundIds.includes(id));
  if (invalidIds.length > 0) {
    return json({ error: 'SOURCE_NOT_FOUND', message: 'Uma ou mais fontes não foram encontradas', invalid_ids: invalidIds }, 422);
  }

  // 5. Build prompt and call Claude
  const sourceContext = (sources ?? [])
    .map((s: { title: string; summary: string }) => `**${s.title}**: ${s.summary}`)
    .join('\n---\n');

  const prompt = `Crie uma página educacional completa sobre "${title}" na categoria ${CATEGORY_LABELS[category as CourseCategory]}.

Use os seguintes resumos de fontes curadas como base de conhecimento:
---
${sourceContext}
---

Gere um artigo HTML completo em português (pt-BR) seguindo estas regras:
1. Retorne APENAS um fragmento HTML com tag raiz <article> — sem <html>, <head> ou <body>
2. Use apenas tags semânticas HTML5: h2, h3, p, ul, ol, li, blockquote, code, pre, figure, figcaption, strong, em
3. NÃO inclua nenhuma tag <script> ou atributos de evento (onclick, onload, etc.)
4. Use atributos data-section para facilitar navegação
5. Estruture com: introdução, conceitos-chave, aplicações práticas e conclusão
6. O conteúdo deve ser educacional, preciso e adequado para iniciantes a intermediários
7. Na primeira linha após a abertura do <article>, inclua um parágrafo <p class="course-description"> com uma descrição curta do curso (máx 200 chars)`;

  const startTime = Date.now();
  let generatedHtml = '';
  let description = '';
  let inputTokens = 0;
  let outputTokens = 0;
  let courseId: string | undefined;

  try {
    const anthropic = new Anthropic({ apiKey: anthropicKey });
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Resposta inválida da IA');
    generatedHtml = content.text.trim();
    inputTokens = response.usage.input_tokens;
    outputTokens = response.usage.output_tokens;

    // Extract description from first course-description paragraph
    const descMatch = generatedHtml.match(/<p[^>]*class="course-description"[^>]*>([\s\S]*?)<\/p>/);
    description = descMatch
      ? descMatch[1].replace(/<[^>]+>/g, '').slice(0, 200)
      : title;

  } catch (err) {
    // Save failed draft
    const { data: failedCourse } = await supabaseAdmin
      .from('courses')
      .insert({
        created_by: user.id,
        title,
        slug: generateSlug(title) + '-failed-' + Date.now(),
        category,
        status: 'failed',
        generation_error: err instanceof Error ? err.message : 'Erro desconhecido',
      })
      .select('id')
      .single();

    return json({
      error: 'GENERATION_FAILED',
      message: 'Falha ao gerar o curso. Tente novamente.',
      course_id: failedCourse?.id,
    }, 500);
  }

  // 6. Validate HTML size
  const htmlBytes = new TextEncoder().encode(generatedHtml).length;
  if (htmlBytes > 102400) {
    return json({
      error: 'CONTENT_TOO_LARGE',
      message: 'O conteúdo gerado excedeu o limite de 100KB. Reduza o número de fontes.',
    }, 413);
  }

  const durationMs = Date.now() - startTime;
  const slug = generateSlug(title);

  // 7. Insert course + course_sources
  const { data: course, error: insertError } = await supabaseAdmin
    .from('courses')
    .insert({
      created_by: user.id,
      title,
      slug,
      category,
      description,
      generated_html: generatedHtml,
      status: 'draft',
      generation_metadata: {
        model: 'claude-opus-4-6',
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        duration_ms: durationMs,
        source_count: source_ids.length,
      },
    })
    .select()
    .single();

  if (insertError || !course) {
    return json({ error: 'GENERATION_FAILED', message: 'Falha ao salvar o curso gerado' }, 500);
  }

  courseId = course.id;

  // Insert course_sources join rows
  await supabaseAdmin
    .from('course_sources')
    .insert(source_ids.map((sid: string) => ({ course_id: courseId, source_id: sid })));

  return json({
    course_id: course.id,
    slug: course.slug,
    title: course.title,
    category: course.category,
    generated_html: course.generated_html,
    description: course.description,
    generation_metadata: course.generation_metadata,
  });
});
