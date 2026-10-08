import { moduleOverviewPaths } from './module-registry.ts';
export const moduleHomePaths = moduleOverviewPaths;
import { normalizePage } from '../../shared/navigation/page-path.ts';

export function moduleHomeFor(input: string): string | undefined {
  const path = normalizePage(input);
  if (!path || path.includes('#')) return undefined;
  const url = new URL(path, 'http://workspace.local/');
  if ([...url.searchParams.keys()].some((key) => !['scope', 'theme'].includes(key)))
    return undefined;
  return Object.keys(moduleHomePaths).find((id) => moduleHomePaths[id] === url.pathname.slice(1));
}
export function moduleLandingUrl(moduleId: string, input = ''): string {
  const query = new URLSearchParams(input.split('?')[1] || '');
  return '/#/module/' + moduleId + (query.get('scope') === 'team' ? '?scope=team' : '');
}

export function openWorkspacePage(input: string): void {
  const path = normalizePage(input);
  if (!path) return;
  const moduleId = moduleHomeFor(path);
  window.location.assign(moduleId ? moduleLandingUrl(moduleId, path) : '/workspace/' + path);
}
export function currentBusinessPath(): string {
  return (
    normalizePage(window.location.pathname + window.location.search + window.location.hash) || ''
  );
}
