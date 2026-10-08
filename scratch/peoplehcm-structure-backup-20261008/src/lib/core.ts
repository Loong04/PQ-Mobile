export type Locale = 'en' | 'zh';
export interface Preferences {
  primary: string;
  mode: 'light' | 'dark';
  locale: Locale;
}

export const defaultPreferences: Preferences = { primary: '#435875', mode: 'light', locale: 'en' };
export const preferencesKey = 'peoplehcm:web:preferences:v1';

export function normalizePage(input: string): string | null {
  if (
    typeof input !== 'string' ||
    !input ||
    /[\\\s]/.test(input) ||
    /^(?:[a-z]+:|\/\/)/i.test(input)
  )
    return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(input);
  } catch {
    return null;
  }
  if (decoded.split(/[/?#]/).some((segment) => segment === '..' || segment === '.')) return null;
  const path = input.replace(/^\/?workspace\//, '').replace(/^\//, '');
  const [file, suffix = ''] = path.split(/(?=[?#])/s, 2);
  if (!/^(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.html$/.test(file)) return null;
  if (suffix.startsWith('#') && !/^#[\w-]+$/.test(suffix)) return null;
  return path;
}

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

export function primaryForeground(hex: string): string {
  const linear = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  const luminance = linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  return luminance > 0.179 ? '#000000' : '#ffffff';
}

export function safeStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
export function safeStorageSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Settings remain active for this session. */
  }
}

export function readFavourites(): string[] {
  try {
    const parsed: unknown = JSON.parse(safeStorageGet('peoplehcm:web:favourites:v1') || '[]');
    return Array.isArray(parsed)
      ? parsed.filter(
          (value): value is string => typeof value === 'string' && normalizePage(value) !== null,
        )
      : [];
  } catch {
    return [];
  }
}
