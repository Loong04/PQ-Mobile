import { useCallback, useEffect, useState } from 'react';
import pageData from './generated/pages.json';
import { modules, type PageRecord } from './config/modules';
import { translator } from './i18n/catalogue';
import { normalizePage } from './lib/core';
import { moduleHomeFor, moduleLandingUrl, openWorkspacePage } from './lib/navigation';
import { useWorkspace } from './lib/useWorkspace';
import { EnterpriseShell } from './components/EnterpriseShell';
import { ModuleWorkspace } from './components/ModuleWorkspace';
import { Dashboard } from './components/Dashboard';
import { Directory } from './components/Directory';
import { Preferences as PreferencesPage } from './components/Preferences';

function readRoute(): string {
  const route = window.location.hash.replace(/^#\/?/, '');
  if (
    route.startsWith('module/') &&
    modules.some((module) => module.id === route.slice(7).split('?')[0])
  )
    return route;
  if (route.startsWith('page/')) return route;
  return ['apps', 'favourites', 'settings'].includes(route) ? route : 'dashboard';
}
export function App() {
  const [route, setRoute] = useState(readRoute);
  const { preferences, setPreferences, favourites } = useWorkspace();
  const locale = preferences.locale;
  const t = translator(locale);
  const moduleId = route.startsWith('module/') ? route.slice(7).split('?')[0] : undefined;
  const module = modules.find((item) => item.id === moduleId);
  const navigate = useCallback((next: string) => {
    window.location.hash = '#/' + next;
  }, []);
  const open = useCallback(
    (input: string) => {
      const path = normalizePage(input);
      if (!path) return;
      const moduleId = moduleHomeFor(path);
      if (moduleId) navigate(moduleLandingUrl(moduleId, path).slice(3));
      else openWorkspacePage(path);
    },
    [navigate],
  );
  useEffect(() => {
    const listener = () => setRoute(readRoute());
    window.addEventListener('hashchange', listener);
    window.addEventListener('popstate', listener);
    return () => {
      window.removeEventListener('hashchange', listener);
      window.removeEventListener('popstate', listener);
    };
  }, []);
  useEffect(() => {
    if (!route.startsWith('page/')) return;
    try {
      open(decodeURIComponent(route.slice(5)));
    } catch {
      navigate('dashboard');
    }
  }, [route, open, navigate]);
  const title = module
    ? locale === 'zh'
      ? module.zh
      : module.en
    : t(
        route === 'apps'
          ? 'applications'
          : route === 'dashboard'
            ? 'overview'
            : route === 'favourites'
              ? 'favourites'
              : route === 'settings'
                ? 'settings'
                : 'workspace',
      );
  useEffect(() => {
    document.title = title + ' | PeopleHCM';
  }, [title]);
  return (
    <EnterpriseShell
      title={title}
      moduleId={moduleId}
      view={route}
      preferences={preferences}
      updatePreferences={setPreferences}
      favourites={favourites}
      open={open}
      navigate={navigate}
    >
      {moduleId && (
        <ModuleWorkspace key={moduleId} moduleId={moduleId} locale={locale} open={open} t={t} />
      )}
      {route === 'dashboard' && (
        <Dashboard t={t} locale={locale} open={open} showApps={() => navigate('apps')} />
      )}
      {route === 'apps' && (
        <Directory pages={pageData as PageRecord[]} t={t} locale={locale} open={open} />
      )}
      {route === 'favourites' && (
        <Directory
          pages={pageData as PageRecord[]}
          t={t}
          locale={locale}
          open={open}
          favourites={favourites}
        />
      )}
      {route === 'settings' && (
        <PreferencesPage preferences={preferences} update={setPreferences} t={t} />
      )}
    </EnterpriseShell>
  );
}
