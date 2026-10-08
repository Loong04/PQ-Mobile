import { normalizePage } from './core.ts';

export const moduleHomePaths: Record<string, string> = {
  attendance: 'modules/attendance/index.html',
  leave: 'leave.html',
  claims: 'modules/claims/index.html',
  payroll: 'modules/payroll/index.html',
  'employee-career': 'modules/employee-career/index.html',
  'project-task': 'modules/project-task/index.html',
  admin: 'modules/admin/index.html',
  profile: 'me.html',
};
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
export function comparablePage(input: string): string {
  const path = normalizePage(input);
  if (!path) return '';
  const url = new URL(path, 'http://workspace.local/');
  url.searchParams.delete('theme');
  url.searchParams.sort();
  return url.pathname.slice(1) + url.search + url.hash;
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
