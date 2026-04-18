// Gera slug URL-friendly de título + data
// Ex: "Fundamentos da Permacultura", "2026-03" → "fundamentos-da-permacultura-2026-03"
export function generateCourseSlug(title: string, date: string): string {
  const titleSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return `${titleSlug}-${date}`;
}
