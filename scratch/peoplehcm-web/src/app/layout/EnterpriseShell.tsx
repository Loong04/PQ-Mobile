import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronDown,
  Globe2,
  LayoutDashboard,
  LayoutGrid,
  Menu,
  Moon,
  Search,
  Settings2,
  Star,
  Sun,
  UsersRound,
  X,
} from 'lucide-react';
import pageData from '../generated/pages.json';
import { modules } from '../../shared/config/modules.ts';
import { type PageRecord } from '../../shared/types/navigation.ts';
import { getModuleOptions } from '../navigation/module-registry.ts';
import { type Preferences } from '../../shared/types/preferences.ts';
import { comparablePage } from '../../shared/navigation/page-path.ts';
import { translator } from '../../shared/i18n/catalogue.ts';
import { CommandPalette } from '../../features/application-directory/components/CommandPalette.tsx';

interface Props {
  children: ReactNode;
  title: string;
  moduleId?: string;
  view?: string;
  businessPath?: string;
  preferences: Preferences;
  updatePreferences: (next: Preferences) => void;
  favourites: string[];
  open: (path: string) => void;
  navigate: (view: string) => void;
}
export function EnterpriseShell({
  children,
  title,
  moduleId,
  view,
  businessPath = '',
  preferences,
  updatePreferences,
  favourites,
  open,
  navigate,
}: Props) {
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | undefined>(moduleId);
  const locale = preferences.locale;
  const t = translator(locale);
  const pages = pageData as PageRecord[];
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  useEffect(() => {
    if (moduleId) setExpanded(moduleId);
  }, [moduleId]);
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((value) => !value);
      }
      if (event.key === 'Escape') setNavOpen(false);
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);
  const go = (destination: string) => {
    setNavOpen(false);
    navigate(destination);
  };
  const openPage = (path: string) => {
    setNavOpen(false);
    open(path);
  };
  const date = new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
  return (
    <div className="enterprise-shell app-shell">
      {navOpen && (
        <button
          className="nav-backdrop"
          aria-label={t('close')}
          onClick={() => setNavOpen(false)}
        />
      )}
      <aside id="workspace-sidebar" className={'sidebar ' + (navOpen ? 'open' : '')}>
        <button className="brand" onClick={() => go('dashboard')} aria-label={t('goDashboard')}>
          <span className="brand-logo">
            p<span>.</span>
          </span>
          <span>
            people<span>HCM</span>
            <small>{t('workspace')}</small>
          </span>
        </button>
        <button
          className="sidebar-close icon-button"
          aria-label={t('close')}
          onClick={() => setNavOpen(false)}
        >
          <X size={20} />
        </button>
        <div className="company-card inset">
          <span className="company-monogram">PQ</span>
          <div>
            <strong>People Quest</strong>
            <small>{locale === 'zh' ? '企业工作台' : 'Enterprise workspace'}</small>
          </div>
        </div>
        <nav aria-label={t('personal')}>
          <div className="nav-label">{t('personal')}</div>
          <button
            className={'nav-item ' + (view === 'dashboard' ? 'active' : '')}
            onClick={() => go('dashboard')}
          >
            <LayoutDashboard size={19} />
            <span>{t('overview')}</span>
          </button>
          <button
            className={'nav-item ' + (view === 'apps' ? 'active' : '')}
            onClick={() => go('apps')}
          >
            <LayoutGrid size={19} />
            <span>{t('applications')}</span>
          </button>
          <button
            className={'nav-item ' + (view === 'favourites' ? 'active' : '')}
            onClick={() => go('favourites')}
          >
            <Star size={19} />
            <span>{t('favourites')}</span>
            {favourites.length > 0 && <small>{favourites.length}</small>}
          </button>
          <button
            className={'nav-item ' + (moduleId === 'calendar' ? 'active' : '')}
            onClick={() => openPage('calendar.html')}
          >
            <CalendarDays size={19} />
            <span>{t('calendar')}</span>
          </button>
          <div className="nav-label module-label">{t('people')}</div>
          {modules.map((module) => {
            const options = getModuleOptions(module.id);
            return (
              <div className="nav-module" key={module.id}>
                <button
                  className={
                    'nav-item nav-module-toggle ' + (moduleId === module.id ? 'active' : '')
                  }
                  data-module-id={module.id}
                  aria-expanded={expanded === module.id}
                  aria-controls={'nav-options-' + module.id}
                  onClick={() => {
                    setExpanded(
                      expanded === module.id &&
                        !businessPath &&
                        view?.split('?')[0] === 'module/' + module.id
                        ? undefined
                        : module.id,
                    );
                    go('module/' + module.id);
                  }}
                >
                  <module.icon size={19} />
                  <span>{locale === 'zh' ? module.zh : module.en}</span>
                  <ChevronDown size={14} />
                </button>
                {expanded === module.id && (
                  <div id={'nav-options-' + module.id} className="nav-submenu">
                    {(['individual', 'team', 'shared'] as const).map((scope) => {
                      const items = options.filter((option) => option.scope === scope);
                      return items.length ? (
                        <div className="nav-submenu-group" key={scope}>
                          <span className="nav-submenu-label">
                            {scope === 'team'
                              ? locale === 'zh'
                                ? '团队'
                                : 'Team'
                              : scope === 'shared'
                                ? locale === 'zh'
                                  ? '通用'
                                  : 'Workspace'
                                : locale === 'zh'
                                  ? '个人'
                                  : 'Individual'}
                          </span>
                          {items.map((option) => (
                            <button
                              key={option.id}
                              data-option-id={option.id}
                              data-path={option.path}
                              className={
                                'nav-submenu-item ' +
                                (comparablePage(businessPath) === comparablePage(option.path)
                                  ? 'active'
                                  : '')
                              }
                              onClick={() => openPage(option.path)}
                            >
                              {locale === 'zh' ? option.titleZh : option.title}
                            </button>
                          ))}
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            );
          })}
          <button
            className={'nav-item ' + (moduleId === 'team' ? 'active' : '')}
            onClick={() => openPage('team.html')}
          >
            <UsersRound size={19} />
            <span>{t('team')}</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <button
            className={'nav-item ' + (view === 'settings' ? 'active' : '')}
            onClick={() => go('settings')}
          >
            <Settings2 size={19} />
            <span>{t('settings')}</span>
          </button>
          <button
            className="sidebar-profile"
            onClick={() => openPage('me.html?scroll=bento-personal')}
          >
            <span className="avatar neu-small">SJ</span>
            <span>
              <strong>Sarah Jenkins</strong>
              <small className="employee-id">#EBB01</small>
              <span className="profile-role">
                {locale === 'zh' ? '产品与设计' : 'Product & Design'}
              </span>
            </span>
            <ArrowUpRight size={15} />
          </button>
        </div>
      </aside>
      <div className="workspace-body">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu icon-button"
              onClick={() => setNavOpen((value) => !value)}
              aria-label={t('menu')}
              aria-expanded={navOpen}
              aria-controls="workspace-sidebar"
            >
              <Menu size={21} />
            </button>
            <span className="topbar-section">{title}</span>
            <span className="topbar-divider" />
            <span className="topbar-company">{t('company')}</span>
          </div>
          <div className="topbar-tools">
            <button className="global-search inset" onClick={() => setSearchOpen(true)}>
              <Search size={16} />
              <span>{t('searchShort')}</span>
              <kbd>Ctrl K</kbd>
            </button>
            <button
              className="icon-button"
              aria-label={t('themeMode')}
              title={t('themeMode')}
              onClick={() =>
                updatePreferences({
                  ...preferences,
                  mode: preferences.mode === 'light' ? 'dark' : 'light',
                })
              }
            >
              {preferences.mode === 'light' ? <Moon size={19} /> : <Sun size={19} />}
            </button>
            <button
              className="language-button"
              onClick={() =>
                updatePreferences({ ...preferences, locale: locale === 'en' ? 'zh' : 'en' })
              }
              aria-label={t('language')}
            >
              <Globe2 size={16} />
              <span>{locale === 'en' ? 'EN' : '中文'}</span>
            </button>
            <button
              className="icon-button notification-button"
              aria-label={t('notifications')}
              onClick={() => openPage('homelight.html?webAction=notifications')}
            >
              <Bell size={19} />
              <span />
            </button>
            <button
              className="topbar-avatar"
              onClick={() => openPage('me.html?scroll=bento-personal')}
              aria-label={t('profile')}
            >
              SJ
            </button>
          </div>
        </header>
        <main className={'workspace-content ' + (businessPath ? 'native-business-content' : '')}>
          <div className="workspace-meta">
            <span>
              {locale === 'zh' ? '工作台' : 'Your workspace'}
              <span>/</span>
              {title}
            </span>
            <time>{date}</time>
          </div>
          {children}
        </main>
        <footer className="workspace-footer">
          <span>
            PeopleHCM<span> / </span>
            {t('company')}
          </span>
          <span>{locale === 'zh' ? '以人为本' : 'Built around people'}</span>
        </footer>
      </div>
      {searchOpen && (
        <CommandPalette pages={pages} t={t} locale={locale} close={closeSearch} open={openPage} />
      )}
    </div>
  );
}
