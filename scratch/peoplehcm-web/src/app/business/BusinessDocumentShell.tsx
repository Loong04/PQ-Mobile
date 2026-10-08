import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Star } from 'lucide-react';
import { modules } from '../../shared/config/modules.ts';
import { type PageRecord } from '../../shared/types/navigation.ts';
import { getModuleOptions } from '../navigation/module-registry.ts';
import { translator } from '../../shared/i18n/catalogue.ts';
import { comparablePage } from '../../shared/navigation/page-path.ts';
import { openWorkspacePage } from '../navigation/page-navigation.ts';
import { useWorkspace } from '../providers/useWorkspace.ts';
import { EnterpriseShell } from '../layout/EnterpriseShell.tsx';

export function BusinessDocumentShell({
  source,
  page,
  path,
}: {
  source: HTMLElement;
  page: PageRecord;
  path: string;
}) {
  const outlet = useRef<HTMLDivElement>(null);
  const { preferences, setPreferences, favourites, toggleFavourite } = useWorkspace();
  const locale = preferences.locale;
  const t = translator(locale);
  const module = modules.find((item) => item.id === page.module);
  const title = locale === 'zh' ? page.titleZh : page.title;
  const options = getModuleOptions(page.module);
  const [sourceHeading, setSourceHeading] = useState('');
  useEffect(() => {
    outlet.current?.append(source);
    source.setAttribute('data-native-source', '');
    document.documentElement.setAttribute('data-web-mounted', '');
    window.dispatchEvent(new CustomEvent('peoplehcm:business-mounted'));
  }, [source]);
  useEffect(() => {
    if (page.module === 'profile') return;
    const header = Array.from(source.children).find((element) =>
      element.matches('header,[class$="-header"]'),
    );
    const heading = header?.querySelector('h1');
    if (!heading) return;
    const update = () => setSourceHeading((heading.textContent || '').replace(/\s+/g, ' ').trim());
    update();
    const observer = new MutationObserver(update);
    observer.observe(heading, { subtree: true, characterData: true, childList: true });
    return () => observer.disconnect();
  }, [source, page.module]);
  useEffect(() => {
    document.title = title + ' | PeopleHCM';
  }, [title]);
  const navigate = (route: string) => window.location.assign('/#/' + route);
  const active = options.find((option) => comparablePage(option.path) === comparablePage(path));
  const displayedTitle =
    sourceHeading || (active ? (locale === 'zh' ? active.titleZh : active.title) : title);
  const favouritePath = comparablePage(path);
  const back = () => {
    // The original handler can return from a detail/form to its preceding source
    // step. Proxy it from the desktop toolbar when its duplicate header is hidden.
    const original = source.querySelector<HTMLElement>(
      '.web-source-header .back-btn, .web-source-header [class*="back-btn"], .web-source-header button:has(.fa-arrow-left), .web-source-header button:has(.fa-chevron-left), .web-source-header a:has(.fa-arrow-left), .web-source-header a:has(.fa-chevron-left)',
    );
    if (original) {
      original.click();
      return;
    }
    navigate(
      module
        ? 'module/' +
            module.id +
            '?scope=' +
            (active?.scope === 'team' ||
            new URLSearchParams(window.location.search).get('scope') === 'team'
              ? 'team'
              : 'individual')
        : 'apps',
    );
  };
  return (
    <EnterpriseShell
      title={module ? (locale === 'zh' ? module.zh : module.en) : title}
      moduleId={page.module}
      businessPath={path}
      preferences={preferences}
      updatePreferences={setPreferences}
      favourites={favourites}
      open={openWorkspacePage}
      navigate={navigate}
    >
      <div className="business-page native-business-page">
        <div className="business-heading">
          <div className="business-title">
            <button className="icon-button raised" aria-label={t('back')} onClick={back}>
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="business-breadcrumb">
                {t('applications')}
                <span>/</span>
                {module ? (locale === 'zh' ? module.zh : module.en) : t('workspace')}
              </div>
              <h1>{displayedTitle}</h1>
            </div>
          </div>
          <div className="business-actions">
            {options.length > 0 && (
              <label className="page-picker">
                <span className="sr-only">{t('selectPage')}</span>
                <select
                  aria-label={t('selectPage')}
                  value={active?.path || ''}
                  onChange={(event) => openWorkspacePage(event.target.value)}
                >
                  <option value="" disabled>
                    {locale === 'zh' ? '切换功能' : 'Switch function'}
                  </option>
                  {options.map((option) => (
                    <option key={option.id} value={option.path}>
                      {option.scope === 'team' ? (locale === 'zh' ? '团队 · ' : 'Team · ') : ''}
                      {locale === 'zh' ? option.titleZh : option.title}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button
              className={
                'icon-button raised ' + (favourites.includes(favouritePath) ? 'favourited' : '')
              }
              aria-label={favourites.includes(favouritePath) ? t('unsavePage') : t('savePage')}
              onClick={() => toggleFavourite(favouritePath)}
            >
              <Star size={17} fill={favourites.includes(favouritePath) ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
        <div className="business-outlet" ref={outlet} />
      </div>
    </EnterpriseShell>
  );
}
