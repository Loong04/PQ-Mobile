import { useEffect, useState } from 'react';
import {
  defaultPreferences,
  preferencesKey,
  primaryForeground,
  readPreferences,
  readFavourites,
  safeStorageGet,
  safeStorageSet,
  type Preferences,
} from './core';

function initialPreferences(): Preferences {
  const preferences = readPreferences(safeStorageGet(preferencesKey));
  if (!safeStorageGet('peoplehcm:web:native-palette:v2')) {
    if (preferences.primary === '#176b64') preferences.primary = defaultPreferences.primary;
    safeStorageSet('peoplehcm:web:native-palette:v2', '1');
    safeStorageSet(preferencesKey, JSON.stringify(preferences));
  }
  return preferences;
}
export function useWorkspace() {
  const [preferences, setPreferences] = useState<Preferences>(initialPreferences);
  const [favourites, setFavourites] = useState<string[]>(readFavourites);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = preferences.mode;
    root.lang = preferences.locale === 'zh' ? 'zh-CN' : 'en';
    root.style.setProperty('--primary', preferences.primary);
    root.style.setProperty('--primary-on', primaryForeground(preferences.primary));
    const rgb = [1, 3, 5].map((i) => parseInt(preferences.primary.slice(i, i + 2), 16));
    root.style.setProperty('--primary-rgb', rgb.join(', '));
    root.style.setProperty(
      '--accent-ink',
      preferences.mode === 'dark'
        ? `color-mix(in srgb, ${preferences.primary} 40%, #eef0f3)`
        : primaryForeground(preferences.primary) === '#ffffff'
          ? preferences.primary
          : `color-mix(in srgb, ${preferences.primary} 25%, #17202c)`,
    );
    safeStorageSet(preferencesKey, JSON.stringify(preferences));
    safeStorageSet('peoplehcm_theme', preferences.mode);
    window.dispatchEvent(
      new CustomEvent('peoplehcm:preferences', {
        detail: {
          theme: { primary: preferences.primary, mode: preferences.mode },
          locale: preferences.locale,
        },
      }),
    );
  }, [preferences]);
  useEffect(() => {
    const listener = (event: StorageEvent) => {
      if (event.key === preferencesKey) setPreferences(readPreferences(event.newValue));
      if (event.key === 'peoplehcm:web:favourites:v1') setFavourites(readFavourites());
    };
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }, []);
  function toggleFavourite(path: string) {
    setFavourites((previous) => {
      const next = previous.includes(path)
        ? previous.filter((item) => item !== path)
        : [...previous, path];
      safeStorageSet('peoplehcm:web:favourites:v1', JSON.stringify(next));
      return next;
    });
  }
  return { preferences, setPreferences, favourites, toggleFavourite };
}
