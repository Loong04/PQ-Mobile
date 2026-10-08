import { useState } from 'react';
import { ArrowUpRight, Search, Star, FileText, ChevronRight } from 'lucide-react';
import { modules } from '../../../shared/config/modules.ts';
import { type PageRecord, type ModuleOption } from '../../../shared/types/navigation.ts';
import { comparablePage } from '../../../shared/navigation/page-path.ts';
import type { Translator } from '../../../shared/i18n/catalogue.ts';
import { type Locale } from '../../../shared/types/preferences.ts';

interface Props {
  pages: PageRecord[];
  options: ModuleOption[];
  t: Translator;
  locale: Locale;
  open: (path: string) => void;
  favourites?: string[];
}
export function DirectoryPage({ pages, options, t, locale, open, favourites }: Props) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const directoryPages: PageRecord[] = favourites
    ? favourites.flatMap((path) => {
        const original = pages.find((page) => page.path === path.split(/[?#]/)[0]);
        if (!original) return [];
        const option = options.find((item) => comparablePage(item.path) === comparablePage(path));
        return [
          {
            ...original,
            path,
            title: option?.title || original.title,
            titleZh: option?.titleZh || original.titleZh,
          },
        ];
      })
    : pages;
  const visible = directoryPages.filter(
    (page) =>
      (filter === 'all' || page.module === filter) &&
      `${page.title} ${page.titleZh} ${page.path}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="directory page-enter">
      <div className="page-heading">
        <div>
          <div className="page-eyebrow">{favourites ? t('favourites') : t('applications')}</div>
          <h1>
            {favourites
              ? favourites.length
                ? t('favourites')
                : t('emptyFavourites')
              : t('directoryTitle')}
          </h1>
          <p>{favourites && !favourites.length ? t('emptyFavouritesHint') : t('directoryHint')}</p>
        </div>
        <div className="directory-count">
          <strong>{favourites ? visible.length : pages.length}</strong>
          <span>{favourites ? t('saved') : t('screens')}</span>
        </div>
      </div>
      <div className="directory-toolbar">
        <div className="filter-tabs">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
            {t('all')}
          </button>
          {modules.map((module) => (
            <button
              key={module.id}
              className={filter === module.id ? 'active' : ''}
              onClick={() => setFilter(module.id)}
            >
              {locale === 'zh' ? module.zh : module.en}
            </button>
          ))}
        </div>
        <label className="search-input inset">
          <Search size={17} />
          <input
            placeholder={t('pageSearch')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>
      {!favourites && !search && filter === 'all' && (
        <div className="module-grid">
          {modules.map((module) => {
            const modulePages = pages.filter((page) => page.module === module.id);
            return (
              <section className="module-card neu" key={module.id}>
                <div className="module-card-top">
                  <span className="module-symbol inset">
                    <module.icon size={26} />
                  </span>
                  <span>
                    {modulePages.length} {t('screens')}
                  </span>
                </div>
                <h2>{locale === 'zh' ? module.zh : module.en}</h2>
                <p>{locale === 'zh' ? module.descriptionZh : module.description}</p>
                <div className="module-card-actions">
                  <button className="text-button" onClick={() => open(module.path)}>
                    {t('open')}
                    <ArrowUpRight size={16} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label={t('pageDirectory')}
                    onClick={() => setExpanded(expanded === module.id ? null : module.id)}
                  >
                    <ChevronRight className={expanded === module.id ? 'rotated' : ''} size={16} />
                  </button>
                </div>
                {expanded === module.id && (
                  <div className="module-pages">
                    {modulePages.map((page) => (
                      <button key={page.path} onClick={() => open(page.path)}>
                        {locale === 'zh' ? page.titleZh : page.title}
                        <ArrowUpRight size={13} />
                      </button>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
      {!favourites && !search && filter === 'all' && (
        <div className="section-heading all-pages-heading">
          <h2>{t('pageDirectory')}</h2>
          <span className="section-caption">
            {visible.length} {t('screens')}
          </span>
        </div>
      )}
      {visible.length ? (
        <div className="page-list neu">
          {visible.map((page) => (
            <button className="directory-page" key={page.path} onClick={() => open(page.path)}>
              <span className="inset-icon">
                {favourites ? <Star size={17} /> : <FileText size={17} />}
              </span>
              <span>
                <strong>{locale === 'zh' ? page.titleZh : page.title}</strong>
                <small>
                  {modules.find((module) => module.id === page.module)?.[
                    locale === 'zh' ? 'zh' : 'en'
                  ] || t('other')}
                </small>
              </span>
              <span className="page-type">
                {locale === 'zh'
                  ? {
                      form: '表单',
                      history: '记录',
                      report: '报表',
                      dashboard: '概览',
                      'theme-variant': '主题版本',
                      'design-variant': '设计版本',
                    }[page.kind] || '页面'
                  : page.kind.replaceAll('-', ' ')}
              </span>
              <ArrowUpRight size={16} />
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-state neu">
          <Search size={30} />
          <h2>{t('noResults')}</h2>
          {search && (
            <button className="button raised" onClick={() => setSearch('')}>
              {t('clearSearch')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
