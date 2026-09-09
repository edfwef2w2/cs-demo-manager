import { describe, expect, it } from 'vite-plus/test';
import { normalizeLocale } from './normalize-locale';

describe('normalizeLocale', () => {
  it('returns English for empty or unknown values', () => {
    expect(normalizeLocale('')).toBe('en');
    expect(normalizeLocale('not-a-locale')).toBe('en');
    expect(normalizeLocale('ja-JP')).toBe('en');
  });

  it('keeps supported locale codes', () => {
    expect(normalizeLocale('en')).toBe('en');
    expect(normalizeLocale('fr')).toBe('fr');
    expect(normalizeLocale('es')).toBe('es');
    expect(normalizeLocale('de')).toBe('de');
    expect(normalizeLocale('ru')).toBe('ru');
    expect(normalizeLocale('pt-BR')).toBe('pt-BR');
    expect(normalizeLocale('zh-CN')).toBe('zh-CN');
    expect(normalizeLocale('zh-TW')).toBe('zh-TW');
  });

  it('maps regional and script variants onto catalogs', () => {
    expect(normalizeLocale('en-US')).toBe('en');
    expect(normalizeLocale('fr-FR')).toBe('fr');
    expect(normalizeLocale('es-ES')).toBe('es');
    expect(normalizeLocale('de-DE')).toBe('de');
    expect(normalizeLocale('ru-RU')).toBe('ru');
    expect(normalizeLocale('pt')).toBe('pt-BR');
    expect(normalizeLocale('pt_BR')).toBe('pt-BR');
    expect(normalizeLocale('zh')).toBe('zh-CN');
    expect(normalizeLocale('zh-Hans-CN')).toBe('zh-CN');
    expect(normalizeLocale('zh-Hant-TW')).toBe('zh-TW');
    expect(normalizeLocale('zh-HK')).toBe('zh-TW');
  });
});
