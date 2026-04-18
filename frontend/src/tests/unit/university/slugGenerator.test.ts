import { describe, it, expect } from 'vitest';
import { generateCourseSlug } from '../../../lib/university/slugGenerator';

describe('generateCourseSlug', () => {
  it('converts title and date to kebab-case slug', () => {
    expect(generateCourseSlug('Fundamentos da Permacultura', '2026-03'))
      .toBe('fundamentos-da-permacultura-2026-03');
  });
  it('removes diacritics (accents)', () => {
    expect(generateCourseSlug('Bioconstrução', '2026-01'))
      .toBe('bioconstrucao-2026-01');
  });
  it('handles multiple spaces', () => {
    expect(generateCourseSlug('Agro  floresta', '2026-02'))
      .toBe('agro-floresta-2026-02');
  });
  it('removes special characters', () => {
    expect(generateCourseSlug('Guia: Introdução!', '2026-04'))
      .toBe('guia-introducao-2026-04');
  });
});
