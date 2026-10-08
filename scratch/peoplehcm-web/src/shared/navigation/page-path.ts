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

export function comparablePage(input: string): string {
  const path = normalizePage(input);
  if (!path) return '';
  const url = new URL(path, 'http://workspace.local/');
  url.searchParams.delete('theme');
  url.searchParams.sort();
  return url.pathname.slice(1) + url.search + url.hash;
}
