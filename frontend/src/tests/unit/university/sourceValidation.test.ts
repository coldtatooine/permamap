import { describe, it, expect } from 'vitest';
import { validateCreateSource, isValidUrl } from '../../../lib/university/sourceValidation';

describe('validateCreateSource', () => {
  it('returns no errors for valid input', () => {
    const errors = validateCreateSource({
      title: 'Permacultura',
      url: 'https://example.com',
      category: 'permacultura',
      summary: 'Um resumo válido',
    });
    expect(Object.keys(errors)).toHaveLength(0);
  });
  it('requires title', () => {
    const errors = validateCreateSource({ url: 'https://x.com', category: 'agrofloresta', summary: 'ok' });
    expect(errors.title).toBeDefined();
  });
  it('requires url', () => {
    const errors = validateCreateSource({ title: 'ok', category: 'agrofloresta', summary: 'ok' });
    expect(errors.url).toBeDefined();
  });
  it('validates url format', () => {
    const errors = validateCreateSource({ title: 'ok', url: 'not-a-url', category: 'agrofloresta', summary: 'ok' });
    expect(errors.url).toBeDefined();
  });
  it('requires category', () => {
    const errors = validateCreateSource({ title: 'ok', url: 'https://x.com', summary: 'ok' });
    expect(errors.category).toBeDefined();
  });
  it('requires summary', () => {
    const errors = validateCreateSource({ title: 'ok', url: 'https://x.com', category: 'agrofloresta' });
    expect(errors.summary).toBeDefined();
  });
});

describe('isValidUrl', () => {
  it('accepts valid https URL', () => expect(isValidUrl('https://example.com')).toBe(true));
  it('accepts valid http URL', () => expect(isValidUrl('http://example.com')).toBe(true));
  it('rejects plain text', () => expect(isValidUrl('not-a-url')).toBe(false));
  it('rejects empty string', () => expect(isValidUrl('')).toBe(false));
});
