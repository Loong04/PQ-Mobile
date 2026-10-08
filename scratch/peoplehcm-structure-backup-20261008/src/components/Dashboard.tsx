import { useState } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  CalendarPlus2,
  ReceiptText,
  FileText,
  Building2,
  Clock3,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Check,
  TriangleAlert,
  ChartNoAxesCombined,
  UsersRound,
  Bell,
  Megaphone,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { modules } from '../config/modules';
import type { Translator } from '../i18n/catalogue';
import type { Locale } from '../lib/core';

interface Props {
  t: Translator;
  locale: Locale;
  open: (path: string) => void;
  showApps: () => void;
}
export function Dashboard({ t, locale, open, showApps }: Props) {
  const [scope, setScope] = useState<'my' | 'team'>('my');
  const [calendarMonth, setCalendarMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const now = new Date();
  const month = new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(calendarMonth);
  const first = (calendarMonth.getDay() + 6) % 7;
  const days = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const indicatorPath = `homelight.html?webAction=indicators&scope=${scope}`;
  const actions = [
    {
      title: t('applyLeave'),
      icon: CalendarPlus2,
      path: 'leave.html?view=apply&webAction=leave-apply',
    },
    {
      title: t('submitClaim'),
      icon: ReceiptText,
      path: 'modules/claims/options/submit-claim.html',
    },
    { title: t('viewPayslip'), icon: FileText, path: 'modules/payroll/options/payslip.html' },
    { title: t('bookResource'), icon: Building2, path: 'modules/admin/options/book-resource.html' },
  ];
  const metrics =
    scope === 'my'
      ? [
          {
            label: t('indicators'),
            value: '14',
            unit: '',
            hint: t('indicatorsHint'),
            icon: ChartNoAxesCombined,
            state: 'neutral',
          },
          {
            label: t('overtime'),
            value: '17',
            unit: t('hours'),
            hint: t('overtimeHint'),
            icon: Clock3,
            state: 'amber',
          },
          {
            label: t('medical'),
            value: '1',
            unit: t('day'),
            hint: t('medicalHint'),
            icon: CalendarDays,
            state: 'neutral',
          },
          {
            label: t('approvals'),
            value: '2',
            unit: t('requests'),
            hint: t('approvalsHint'),
            icon: UsersRound,
            state: 'amber',
          },
        ]
      : [
          {
            label: t('indicators'),
            value: '12',
            unit: '',
            hint: locale === 'zh' ? '3 项正向 · 9 项负向' : '3 positive · 9 negative',
            icon: ChartNoAxesCombined,
            state: 'neutral',
          },
          {
            label: t('teamAttendance'),
            value: '69.39',
            unit: '%',
            hint: t('teamAttendanceHint'),
            icon: UsersRound,
            state: 'amber',
          },
          {
            label: t('teamMedical'),
            value: '0.30',
            unit: t('day'),
            hint: t('teamMedicalHint'),
            icon: CalendarDays,
            state: 'neutral',
          },
          {
            label: t('teamOt'),
            value: '11.63',
            unit: t('hours'),
            hint: t('teamOtHint'),
            icon: Clock3,
            state: 'amber',
          },
        ];
  return (
    <div className="dashboard page-enter">
      <div className="page-heading">
        <div>
          <div className="page-eyebrow">{t('workspace')}</div>
          <h1>
            {t('hello')}
            <span className="greeting-dot">.</span>
          </h1>
          <p>{t('greeting')}</p>
        </div>
        <button
          className="button raised"
          onClick={() => open('modules/attendance/options/clocking.html')}
        >
          <Clock3 size={17} />
          <span>{locale === 'zh' ? '考勤打卡' : 'Clocking'}</span>
          <ArrowUpRight size={15} />
        </button>
      </div>
      <section className="quick-actions" aria-label={t('quickActions')}>
        <div className="quick-label">{t('quickActions')}</div>
        {actions.map((action) => (
          <button className="quick-action" key={action.path} onClick={() => open(action.path)}>
            <span className="quick-icon">
              <action.icon size={19} />
            </span>
            <span>{action.title}</span>
            <ArrowUpRight size={15} className="quick-arrow" />
          </button>
        ))}
      </section>
      <div className="section-heading insights-heading">
        <div>
          <h2>{t('insights')}</h2>
          <span className="section-caption">{t('period')}</span>
        </div>
        <div className="segmented">
          <button className={scope === 'my' ? 'active' : ''} onClick={() => setScope('my')}>
            {t('my')}
          </button>
          <button className={scope === 'team' ? 'active' : ''} onClick={() => setScope('team')}>
            {t('teamInsights')}
          </button>
        </div>
      </div>
      <section className="metric-grid" aria-label={t('insights')}>
        {metrics.map((metric, i) => (
          <button
            className={'metric neu ' + metric.state}
            key={metric.label}
            onClick={() =>
              open(i === 3 && scope === 'my' ? 'leave.html?webAction=leave-team' : indicatorPath)
            }
          >
            <div className="metric-top">
              <span>{metric.label}</span>
              <metric.icon size={19} />
            </div>
            <div className="metric-value">
              {metric.value}
              <small>{metric.unit}</small>
            </div>
            <div className="metric-bottom">
              <span className={'metric-state ' + metric.state}>
                {metric.state === 'amber' ? <TriangleAlert size={12} /> : <Check size={12} />}
              </span>
              <span>{metric.hint}</span>
              <ArrowUpRight size={14} />
            </div>
          </button>
        ))}
      </section>
      <div className="dashboard-columns">
        <div className="dashboard-main">
          <section className="neu attention-panel">
            <div className="section-heading">
              <h2>{t('attention')}</h2>
              <button className="text-button" onClick={() => open(indicatorPath)}>
                {t('allIndicators')}
                <ArrowUpRight size={14} />
              </button>
            </div>
            <div className="attention-table">
              <div className="table-labels">
                <span>{locale === 'zh' ? '指标' : 'INDICATOR'}</span>
                <span>{locale === 'zh' ? '状态' : 'STATUS'}</span>
                <span>{locale === 'zh' ? '数值' : 'VALUE'}</span>
                <span />
              </div>
              {[
                {
                  name: scope === 'my' ? t('attendance') : t('teamAttendance'),
                  status: scope === 'my' ? t('late') : t('overtimeHint'),
                  value: scope === 'my' ? '+0.00%' : '69.39%',
                  icon: Clock3,
                  tone: 'amber',
                },
                {
                  name: scope === 'my' ? t('overtime') : t('teamOt'),
                  status: t('overtimeHint'),
                  value: scope === 'my' ? '17 ' + t('hours') : '11.63 ' + t('hours'),
                  icon: TriangleAlert,
                  tone: 'amber',
                },
                {
                  name: scope === 'my' ? t('medical') : t('teamMedical'),
                  status: 'MC',
                  value: scope === 'my' ? '1 ' + t('day') : '0.30',
                  icon: CalendarDays,
                  tone: 'green',
                },
              ].map((row) => (
                <button
                  className="attention-item"
                  key={row.name}
                  onClick={() => open(indicatorPath)}
                >
                  <span className="attention-name">
                    <span className="inset-icon">
                      <row.icon size={17} />
                    </span>
                    {row.name}
                  </span>
                  <span className={'status-pill ' + row.tone}>{row.status}</span>
                  <strong>{row.value}</strong>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          </section>
          <section className="application-panel">
            <div className="section-heading">
              <div>
                <h2>{t('explore')}</h2>
                <p>{t('exploreHint')}</p>
              </div>
              <button className="text-button" onClick={showApps}>
                {t('viewAll')}
                <ArrowRight size={15} />
              </button>
            </div>
            <div className="application-grid">
              {modules.slice(0, 7).map((module, i) => (
                <button
                  className={'application-shortcut ' + (i === 0 ? 'featured' : '')}
                  key={module.id}
                  onClick={() => open(module.path)}
                >
                  <span className="app-icon neu-small">
                    <module.icon size={23} />
                  </span>
                  <span>{locale === 'zh' ? module.zh : module.en}</span>
                  <ArrowUpRight size={15} />
                </button>
              ))}
            </div>
          </section>
          <section className="updates-panel neu">
            <div className="section-heading">
              <h2>{t('companyUpdates')}</h2>
              <button
                className="text-button"
                onClick={() => open('homelight.html?webAction=updates')}
              >
                {t('viewAll')}
                <ArrowUpRight size={14} />
              </button>
            </div>
            {[
              {
                icon: Megaphone,
                title: t('updates'),
                desc: t('updatesHint'),
                path: 'homelight.html?webAction=updates',
              },
              {
                icon: ShieldCheck,
                title: t('policy'),
                desc: t('policyHint'),
                path: 'homelight.html?webAction=updates',
              },
              {
                icon: Award,
                title: t('news'),
                desc: t('newsHint'),
                path: 'homelight.html?webAction=updates',
              },
            ].map((item) => (
              <button className="update-row" key={item.title} onClick={() => open(item.path)}>
                <span className="inset-icon">
                  <item.icon size={18} />
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.desc}</small>
                </span>
                <ArrowUpRight size={16} />
              </button>
            ))}
          </section>
        </div>
        <aside className="dashboard-aside">
          <section className="calendar-panel neu">
            <div className="section-heading">
              <h2>{month}</h2>
              <div className="calendar-controls">
                <button
                  aria-label={locale === 'zh' ? '上个月' : 'Previous month'}
                  onClick={() =>
                    setCalendarMonth(
                      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1),
                    )
                  }
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  aria-label={locale === 'zh' ? '下个月' : 'Next month'}
                  onClick={() =>
                    setCalendarMonth(
                      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1),
                    )
                  }
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <div className="mini-calendar">
              <div className="calendar-weekdays">
                {(locale === 'zh'
                  ? ['一', '二', '三', '四', '五', '六', '日']
                  : ['M', 'T', 'W', 'T', 'F', 'S', 'S']
                ).map((day, i) => (
                  <span key={i}>{day}</span>
                ))}
              </div>
              <div className="calendar-days">
                {Array.from({ length: first }, (_, i) => (
                  <span key={'blank' + i} />
                ))}
                {Array.from({ length: days }, (_, i) => {
                  const day = i + 1;
                  return (
                    <button
                      key={day}
                      className={
                        day === now.getDate() &&
                        calendarMonth.getMonth() === now.getMonth() &&
                        calendarMonth.getFullYear() === now.getFullYear()
                          ? 'selected'
                          : ''
                      }
                      onClick={() =>
                        open(
                          `calendar.html?date=${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                        )
                      }
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
            <button className="calendar-open" onClick={() => open('calendar.html')}>
              <CalendarDays size={15} />
              {t('viewCalendar')}
              <ArrowUpRight size={14} />
            </button>
          </section>
          <section className="for-you-panel neu">
            <div className="section-heading">
              <h2>{t('forYou')}</h2>
              <Bell size={17} />
            </div>
            {[
              {
                title: t('leaveWaiting'),
                tag: t('approvals'),
                icon: CalendarDays,
                path: 'leave.html?webAction=leave-team',
                tone: 'amber',
              },
              {
                title: t('payslipReady'),
                tag: t('available'),
                icon: FileText,
                path: 'modules/payroll/options/payslip.html',
                tone: 'green',
              },
              {
                title: t('teamUpdate'),
                tag: t('team'),
                icon: UsersRound,
                path: 'team.html',
                tone: 'neutral',
              },
            ].map((item) => (
              <button className="for-you-item" key={item.title} onClick={() => open(item.path)}>
                <span className="inset-icon">
                  <item.icon size={17} />
                </span>
                <span>
                  <small className={item.tone}>{item.tag}</small>
                  <strong>{item.title}</strong>
                </span>
                <ChevronRight size={14} />
              </button>
            ))}
          </section>
          <div className="workspace-note">
            <span className="brand-stamp">p.</span>
            <p>{locale === 'zh' ? '以人为本，协作有序。' : 'Good work starts with people.'}</p>
            <button className="text-button" onClick={() => open('me.html')}>
              {t('profile')}
              <ArrowRight size={14} />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
