import type { Preferences } from '../types/preferences.ts';

export const defaultPreferences: Preferences = { primary: '#435875', mode: 'light', locale: 'en' };

export const preferencesKey = 'peoplehcm:web:preferences:v1';

export function readPreferences(raw: string | null): Preferences {
  let candidate: Partial<Preferences> = {};
  try {
    const parsed: unknown = JSON.parse(raw || '{}');
    if (parsed && typeof parsed === 'object') candidate = parsed;
  } catch {
    /* Use defaults. */
  }
  return {
    primary:
      typeof candidate.primary === 'string' && /^#[a-f\d]{6}$/i.test(candidate.primary)
        ? candidate.primary.toLowerCase()
        : defaultPreferences.primary,
    mode: candidate.mode === 'dark' ? 'dark' : 'light',
    locale: candidate.locale === 'zh' ? 'zh' : 'en',
  };
}
