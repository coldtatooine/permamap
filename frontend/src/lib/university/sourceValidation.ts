// Validação de fontes curadas
export interface SourceValidationErrors {
  title?: string;
  url?: string;
  category?: string;
  summary?: string;
}

export function validateCreateSource(input: {
  title?: string;
  url?: string;
  category?: string;
  summary?: string;
}): SourceValidationErrors {
  const errors: SourceValidationErrors = {};

  if (!input.title?.trim()) errors.title = 'Título é obrigatório';
  else if (input.title.length > 255) errors.title = 'Título deve ter no máximo 255 caracteres';

  if (!input.url?.trim()) {
    errors.url = 'URL é obrigatória';
  } else {
    try { new URL(input.url); }
    catch { errors.url = 'URL inválida — inclua http:// ou https://'; }
  }

  if (!input.category) errors.category = 'Categoria é obrigatória';
  if (!input.summary?.trim()) errors.summary = 'Resumo é obrigatório';

  return errors;
}

export function isValidUrl(url: string): boolean {
  try { new URL(url); return true; }
  catch { return false; }
}
