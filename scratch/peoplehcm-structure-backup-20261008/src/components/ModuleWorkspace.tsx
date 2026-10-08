import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Car,
  CheckCheck,
  ClipboardList,
  Clock3,
  FilePlus2,
  FileText,
  Gift,
  HeartPulse,
  History,
  MapPin,
  MessageSquare,
  Package,
  Plane,
  Plus,
  Search,
  ShieldCheck,
  Timer,
  TrendingUp,
  UserRound,
  UsersRound,
  UserRoundCheck,
  WalletCards,
  X,
  type LucideIcon,
} from 'lucide-react';
import { modules } from '../config/modules';
import { getModuleOptions, type ModuleGroup, type ModuleScope } from '../config/moduleNavigation';
import type { Translator } from '../i18n/catalogue';

interface Props {
  moduleId: string;
  locale: 'en' | 'zh';
  open: (path: string) => void;
  t: Translator;
}

const icons: Record<string, LucideIcon> = {
  award: Award,
  book: BookOpen,
  briefcase: BriefcaseBusiness,
  calendar: CalendarDays,
  car: Car,
  chart: TrendingUp,
  check: CheckCheck,
  clipboard: ClipboardList,
  clock: Clock3,
  file: FileText,
  'file-plus': FilePlus2,
  gift: Gift,
  history: History,
  medical: HeartPulse,
  message: MessageSquare,
  package: Package,
  pin: MapPin,
  plane: Plane,
  receipt: FileText,
  shield: ShieldCheck,
  timer: Timer,
  user: UserRound,
  'user-check': UserRoundCheck,
  users: UsersRound,
  wallet: WalletCards,
};

const groups: { id: ModuleGroup; en: string; zh: string; hint: string; hintZh: string }[] = [
  {
    id: 'requests',
    en: 'Requests',
    zh: '申请与操作',
    hint: 'Start an application or complete an action.',
    hintZh: '发起申请或完成相关操作。',
  },
  {
    id: 'planning',
    en: 'Planning & calendars',
    zh: '计划与日历',
    hint: 'Organise work and review scheduled activities.',
    hintZh: '安排工作并查看日程。',
  },
  {
    id: 'approvals',
    en: 'Approvals & review',
    zh: '审批与审核',
    hint: 'Review requests and items that need your action.',
    hintZh: '处理待审批申请与待办事项。',
  },
  {
    id: 'records',
    en: 'Records & history',
    zh: '记录与历史',
    hint: 'View records, details and request progress.',
    hintZh: '查看记录、详情与申请进度。',
  },
  {
    id: 'reports',
    en: 'Reports & analysis',
    zh: '报表与分析',
    hint: 'Explore summaries, highlights and trends.',
    hintZh: '查看汇总、重点与趋势。',
  },
  {
    id: 'information',
    en: 'Information',
    zh: '资料',
    hint: 'Find employee, entitlement and reference information.',
    hintZh: '查看员工、额度与参考资料。',
  },
];

function initialScope(): 'individual' | 'team' {
  if (typeof window === 'undefined') return 'individual';
  const query = window.location.hash.split('?')[1] || window.location.search;
  return new URLSearchParams(query).get('scope') === 'team' ? 'team' : 'individual';
}

export function ModuleWorkspace({ moduleId, locale, open, t }: Props) {
  const [scope, setScope] = useState<'individual' | 'team'>(initialScope);
  const [search, setSearch] = useState('');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabId = useId();
  const module = modules.find((item) => item.id === moduleId);
  const zh = locale === 'zh';

  useEffect(() => {
    const syncScope = () => {
      setScope(initialScope());
      setSearch('');
    };
    syncScope();
    window.addEventListener('hashchange', syncScope);
    window.addEventListener('popstate', syncScope);
    return () => {
      window.removeEventListener('hashchange', syncScope);
      window.removeEventListener('popstate', syncScope);
    };
  }, [moduleId]);

  const options = useMemo(() => getModuleOptions(moduleId, scope), [moduleId, scope]);
  const availableScopes = useMemo(
    () =>
      (['individual', 'team'] as const).filter(
        (item) => getModuleOptions(moduleId, item).length > 0,
      ),
    [moduleId],
  );
  const visible = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return options.filter(
      (item) =>
        !query ||
        `${item.title} ${item.titleZh} ${item.description} ${item.descriptionZh}`
          .toLocaleLowerCase()
          .includes(query),
    );
  }, [options, search]);
  const primary =
    options.find((item) => item.group === 'requests') ||
    options.find((item) => item.group === 'planning') ||
    options.find((item) => item.group === 'approvals');

  function switchScope(next: ModuleScope) {
    if (next === 'shared') return;
    setScope(next);
    setSearch('');
    const url = new URL(window.location.href);
    const query = new URLSearchParams(url.hash.split('?')[1] || '');
    query.set('scope', next);
    url.hash = `/module/${moduleId}?${query.toString()}`;
    window.history.replaceState(window.history.state, '', url);
  }

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown')
      next = (index + 1) % availableScopes.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
      next = (index - 1 + availableScopes.length) % availableScopes.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = availableScopes.length - 1;
    else return;
    event.preventDefault();
    switchScope(availableScopes[next]);
    tabRefs.current[next]?.focus();
  }

  if (!module)
    return (
      <section className="module-workspace module-workspace-empty" role="status">
        <h1>{t('noResults')}</h1>
      </section>
    );

  return (
    <div className="module-workspace page-enter" data-module={moduleId}>
      <header className="module-workspace-heading">
        <div className="module-workspace-heading-copy">
          <div className="module-workspace-eyebrow">{t('workspace')}</div>
          <h1>{zh ? module.zh : module.en}</h1>
          <p>{zh ? module.descriptionZh : module.description}</p>
        </div>
        {primary && (
          <button
            type="button"
            className="module-workspace-primary primary-button"
            data-option-id={primary.id}
            data-path={primary.path}
            onClick={() => open(primary.path)}
          >
            <Plus size={18} aria-hidden="true" />
            <span>{zh ? primary.titleZh : primary.title}</span>
          </button>
        )}
      </header>

      <div className="module-workspace-toolbar">
        <div
          className="module-workspace-scopes"
          role="tablist"
          aria-label={zh ? '个人与团队' : 'Individual and team'}
        >
          {availableScopes.map((item, index) => {
            const ScopeIcon = item === 'individual' ? UserRound : UsersRound;
            return (
              <button
                key={item}
                type="button"
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                className={`module-workspace-scope${scope === item ? ' active' : ''}`}
                data-scope={item}
                id={`${tabId}-${item}`}
                role="tab"
                aria-selected={scope === item}
                aria-controls={`${tabId}-options`}
                tabIndex={scope === item ? 0 : -1}
                onClick={() => switchScope(item)}
                onKeyDown={(event) => handleTabKey(event, index)}
              >
                <ScopeIcon size={17} aria-hidden="true" />
                <span>
                  {item === 'individual' ? (zh ? '个人' : 'Individual') : zh ? '团队' : 'Team'}
                </span>
              </button>
            );
          })}
        </div>
        <div className="module-workspace-search">
          <label className="module-workspace-search-field" htmlFor={`${tabId}-search`}>
            <Search size={18} aria-hidden="true" />
            <input
              id={`${tabId}-search`}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={zh ? '搜索此模块的功能…' : 'Find an option in this module…'}
              aria-label={zh ? '搜索此模块的功能' : 'Search module options'}
            />
          </label>
          {search && (
            <button
              type="button"
              className="module-workspace-search-clear"
              aria-label={t('clearSearch')}
              onClick={() => setSearch('')}
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div
        id={`${tabId}-options`}
        className="module-workspace-panel"
        role="tabpanel"
        aria-labelledby={`${tabId}-${scope}`}
      >
        <p className="module-workspace-scope-description">
          {scope === 'individual'
            ? zh
              ? '个人申请、记录与工作安排。'
              : 'Your applications, records and work arrangements.'
            : zh
              ? '团队计划、员工资料与管理流程。'
              : 'Team planning, staff information and management workflows.'}
        </p>
        <div className="module-options-grid">
          {groups.map((group) => {
            const entries = visible.filter((item) => item.group === group.id);
            if (!entries.length) return null;
            return (
              <section
                key={group.id}
                className="module-workspace-group"
                data-group={group.id}
                aria-labelledby={`${tabId}-${group.id}`}
              >
                <header className="module-workspace-group-heading">
                  <div>
                    <h2 id={`${tabId}-${group.id}`}>{zh ? group.zh : group.en}</h2>
                    <p>{zh ? group.hintZh : group.hint}</p>
                  </div>
                  <span
                    className="module-workspace-group-count"
                    aria-label={zh ? `${entries.length} 个功能` : `${entries.length} options`}
                  >
                    {String(entries.length).padStart(2, '0')}
                  </span>
                </header>
                <div className="module-workspace-option-list">
                  {entries.map((item) => {
                    const Icon = icons[item.icon] || FileText;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        className="module-option"
                        data-option-id={item.id}
                        data-path={item.path}
                        onClick={() => open(item.path)}
                      >
                        <span className="module-option-icon">
                          <Icon size={21} aria-hidden="true" />
                        </span>
                        <span className="module-option-copy">
                          <strong>{zh ? item.titleZh : item.title}</strong>
                          <span>{zh ? item.descriptionZh : item.description}</span>
                        </span>
                        <ArrowRight className="module-option-arrow" size={19} aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
        {!visible.length && (
          <div className="module-workspace-empty" role="status">
            <Search size={25} aria-hidden="true" />
            <h2>{t('noResults')}</h2>
            <p>
              {zh
                ? '尝试其他关键词，或清除搜索以查看全部功能。'
                : 'Try another keyword, or clear the search to see every option.'}
            </p>
            <button type="button" className="text-button" onClick={() => setSearch('')}>
              {t('clearSearch')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
