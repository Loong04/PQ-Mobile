import { safeStorageGet } from '../../../shared/storage/browser-storage.ts';
import { normalizePage } from '../../../shared/navigation/page-path.ts';

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
