(() => {
  const data = window.ORGANIZATION_STATISTICS_DATA || [];
  const $ = id => document.getElementById(id);
  const measures = { mcDays: 'MC Days', overtimeHours: 'Overtime Hours', lateHours: 'Late Hours', absentDays: 'Absent Days', absentOvertime: 'Absent for Overtime', absentTraining: 'Absent for Training' };
  const metrics = { unit: 'Organization Unit', company: 'Company', period: 'Period' };
  const colors = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#14b8a6'];
  const defaults = { keyword: '', company: 'PEOPLE QUEST SDN BHD', orgUnitType: 'Department', startYear: '2025', startMonth: '11', endYear: '2026', endMonth: '10', summaryType: 'month', measureType: 'mcDays' };
  const state = { filters: { ...defaults }, rows: [], view: 'list', metric: 'unit', analysisMetric: 'unit', analysisRows: [], analysisPeriod: '', analysisSummary: 'month', detailRows: [], detailParent: 'chart', detailTitle: '' };
  const number = value => value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sum = (rows, key = state.filters.measureType) => Math.round(rows.reduce((total, row) => total + row[key], 0) * 100) / 100;
  const start = () => `${state.filters.startYear}-${state.filters.startMonth}`;
  const end = () => `${state.filters.endYear}-${state.filters.endMonth}`;
  const monthText = value => new Date(`${value}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  const rangeText = () => `${monthText(start())} – ${monthText(end())}`;

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function populate(id, placeholder, values) {
    const control = $(id);
    if (placeholder) control.add(new Option(placeholder, ''));
    values.forEach(value => control.add(new Option(value, value)));
  }

  function periodKey(period, summary = state.filters.summaryType) {
    if (summary === 'year') return period.slice(0, 4);
    if (summary === 'quarter') return `${period.slice(0,4)}-Q${Math.ceil(Number(period.slice(5)) / 3)}`;
    return period;
  }

  function periodText(key) {
    if (key.includes('-Q')) return `Q${key.slice(-1)} ${key.slice(0,4)}`;
    return key.length === 4 ? key : monthText(key);
  }

  function groupedRecords(rows, summary = state.filters.summaryType) {
    const groups = new Map();
    rows.forEach(row => {
      const period = periodKey(row.period, summary);
      const key = `${row.unitId}|${period}`;
      if (!groups.has(key)) groups.set(key, { unit: row.unit, company: row.company, orgUnitType: row.orgUnitType, period, records: [] });
      groups.get(key).records.push(row);
    });
    return [...groups.values()].sort((a,b) => b.period.localeCompare(a.period) || a.unit.localeCompare(b.unit));
  }

  function companyAverage(group) {
    const periods = new Set(group.records.map(row => row.period));
    const cohort = data.filter(row => row.company === group.company && row.orgUnitType === group.orgUnitType && periods.has(row.period));
    const people = sum(cohort, 'headcount');
    return people ? sum(cohort) / people : 0;
  }

  function renderCards(id, rows, summary = state.filters.summaryType) {
    const groups = groupedRecords(rows, summary);
    $(id).replaceChildren(...groups.map(group => {
      const card = node('article', 'history-card-item org-statistics-card');
      const details = node('dl');
      const people = sum(group.records, 'headcount');
      const values = [
        ['Period', periodText(group.period)], ['Measure', measures[state.filters.measureType]],
        ['Total Value', number(sum(group.records))], ['Average Value', number(people ? sum(group.records) / people : 0)],
        ['Company Average', number(companyAverage(group))]
      ];
      values.forEach(([label, value]) => { const field = node('div'); field.append(node('dt', '', label), node('dd', '', value)); details.append(field); });
      card.append(node('h2', '', group.unit), details);
      return card;
    }));
    return groups.length;
  }

  function refresh() {
    const filters = state.filters;
    state.rows = data.filter(row => row.period >= start() && row.period <= end()
      && (!filters.company || row.company === filters.company)
      && (!filters.orgUnitType || row.orgUnitType === filters.orgUnitType)
      && (!filters.keyword || `${row.unit} ${row.company} ${row.orgUnitType}`.toLowerCase().includes(filters.keyword.toLowerCase())));
    const total = renderCards('orgStatisticsCards', state.rows);
    $('orgStatisticsTotalRecords').textContent = total;
    $('orgStatisticsEmpty').hidden = total > 0;
    $('orgStatisticsFilterSummary').textContent = `${rangeText()} · ${measures[filters.measureType]}`;
  }

  function openDetails(rows, title, parent, summary) {
    state.detailRows = rows;
    state.detailTitle = title;
    state.detailParent = parent;
    $('orgStatisticsDetailTotalRecords').textContent = renderCards('orgStatisticsDetailCards', rows, summary);
    $('orgStatisticsDetailPeriod').textContent = title;
    showView('detail');
  }

  function renderBreakdown(prefix, rows, metric, subtitle, parent) {
    const summary = parent === 'analysis' ? state.analysisSummary : state.filters.summaryType;
    const groups = new Map();
    rows.forEach(row => {
      const label = metric === 'period' ? periodKey(row.period, summary) : row[metric];
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push(row);
    });
    const entries = [...groups].sort((a,b) => sum(b[1]) - sum(a[1]) || a[0].localeCompare(b[0]));
    const total = sum(rows);
    $(`${prefix}Title`).textContent = `${measures[state.filters.measureType]} by ${metrics[metric].toLowerCase()}`;
    $(`${prefix}Subtitle`).textContent = subtitle;
    $(`${prefix}Column`).textContent = metrics[metric];
    $(`${prefix}Total`).textContent = number(total);
    $(`${prefix}Total`).dataset.value = total;
    $(`${prefix}Badge`).textContent = measures[state.filters.measureType];
    $(`${prefix}Note`).textContent = rows.length ? 'Click a category to view its records.' : 'No records match the selected filters.';
    $(`${prefix}Donut`).setAttribute('aria-label', `${measures[state.filters.measureType]} by ${metrics[metric]}`);
    $(`${prefix}Segments`).replaceChildren();
    $(`${prefix}Legend`).replaceChildren();
    let offset = 0;
    const circumference = 2 * Math.PI * 70;
    entries.forEach(([key, records], index) => {
      const label = metric === 'period' ? periodText(key) : key;
      const value = sum(records);
      const fraction = total ? value / total : 0;
      const color = colors[index % colors.length];
      const open = () => openDetails(records, `${label} · ${subtitle}`, parent, summary);
      if (fraction > 0) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        Object.entries({ cx: 90, cy: 90, r: 70, fill: 'none', stroke: color, 'stroke-width': 22, 'stroke-dasharray': `${fraction * circumference} ${circumference}`, 'stroke-dashoffset': -offset, tabindex: 0, role: 'button', 'aria-label': `View ${label}: ${number(value)}` }).forEach(([key, value]) => circle.setAttribute(key, value));
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `${label}: ${number(value)}`;
        circle.append(title);
        circle.addEventListener('click', open);
        circle.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } });
        $(`${prefix}Segments`).append(circle);
        offset += fraction * circumference;
      }
      const button = node('button', 'attendance-report-legend-row');
      button.type = 'button';
      button.dataset.value = value;
      const name = node('span', 'attendance-report-legend-label');
      const dot = node('i', 'attendance-report-dot');
      dot.style.background = color;
      dot.setAttribute('aria-hidden', 'true');
      name.append(dot, node('span', '', label));
      button.append(name, node('span', '', number(value)), node('span', '', `${(fraction * 100).toFixed(1)}%`));
      button.addEventListener('click', open);
      $(`${prefix}Legend`).append(button);
    });
  }

  function openAnalysis(rows, period, summary = state.filters.summaryType) {
    state.analysisRows = rows;
    state.analysisPeriod = period;
    state.analysisSummary = summary;
    state.analysisMetric = state.metric;
    $('orgStatisticsAnalysisMetric').value = state.analysisMetric;
    showView('analysis');
  }

  function renderTrend() {
    $('orgStatisticsTrendRange').textContent = rangeText();
    $('orgStatisticsTrendTotal').textContent = number(sum(state.rows));
    $('orgStatisticsTrendMeasure').textContent = measures[state.filters.measureType];
    $('orgStatisticsTrendTotalCard').disabled = !state.rows.length;
    $('orgStatisticsTrendBars').replaceChildren();
    const months = [];
    const date = new Date(`${start()}-01T00:00:00Z`);
    while (date.toISOString().slice(0,7) <= end()) {
      const period = date.toISOString().slice(0,7);
      const rows = state.rows.filter(row => row.period === period);
      months.push({ period, rows, value: sum(rows) });
      date.setUTCMonth(date.getUTCMonth() + 1);
    }
    const maximum = Math.max(0, ...months.map(month => month.value));
    months.forEach(({ period, rows, value }) => {
      const button = node('button', 'org-statistics-bar');
      button.type = 'button'; button.disabled = !rows.length;
      button.dataset.period = period; button.dataset.value = value;
      button.setAttribute('aria-label', `View ${monthText(period)} analysis, ${number(value)} ${measures[state.filters.measureType]}`);
      const track = node('span', 'org-statistics-bar-track');
      const fill = node('span', 'org-statistics-bar-fill');
      fill.style.width = `${maximum ? value / maximum * 100 : 0}%`;
      track.append(fill);
      button.append(node('span', 'org-statistics-bar-month', monthText(period)), track, node('span', 'org-statistics-bar-value', number(value)));
      button.addEventListener('click', () => openAnalysis(rows, monthText(period), 'month'));
      $('orgStatisticsTrendBars').append(button);
    });
  }

  function showView(view) {
    state.view = view;
    const titles = { list: 'Organization Statistics', chart: 'Organization Analysis', trend: 'Organization Trend', analysis: 'Organization Analysis', detail: 'Organization Details' };
    ['list','chart','trend','analysis','detail'].forEach(key => $(`orgStatistics${key[0].toUpperCase() + key.slice(1)}View`).hidden = key !== view);
    $('orgStatisticsTitle').textContent = titles[view];
    $('orgStatisticsBack').setAttribute('aria-label', view === 'list' ? 'Back to Employee and Career' : 'Back to previous analysis');
    if (view === 'chart') renderBreakdown('orgStatisticsChart', state.rows, state.metric, rangeText(), 'chart');
    if (view === 'analysis') renderBreakdown('orgStatisticsAnalysis', state.analysisRows, state.analysisMetric, state.analysisPeriod, 'analysis');
    if (view === 'trend') renderTrend();
    document.querySelector('main').scrollTop = 0;
    const focus = { list: 'orgStatisticsViewChart', chart: 'orgStatisticsChartMetric', trend: 'orgStatisticsBack', analysis: 'orgStatisticsAnalysisMetric', detail: 'orgStatisticsBack' };
    $(focus[view]).focus({ preventScroll: true });
  }

  function goBack(event) {
    if (state.view === 'list') return;
    event?.preventDefault();
    const previous = { chart: 'list', trend: 'chart', analysis: 'trend', detail: state.detailParent };
    showView(previous[state.view]);
  }

  function fill(values) {
    Object.entries(values).forEach(([key,value]) => {
      const input = $('orgStatisticsFilterForm').elements.namedItem(key);
      input.value = value;
      input.removeAttribute('aria-invalid');
    });
    $('orgStatisticsFilterError').hidden = true;
  }

  function init() {
    populate('orgStatisticsCompany', 'All Companies', [...new Set(data.map(row => row.company))]);
    populate('orgStatisticsOrgUnitType', 'All Unit Types', [...new Set(data.map(row => row.orgUnitType))]);
    for (const part of ['Start', 'End']) {
      populate(`orgStatistics${part}Year`, '', ['2023','2024','2025','2026','2027','2028']);
      const month = $(`orgStatistics${part}Month`);
      for (let value = 1; value <= 12; value++) month.add(new Option(new Date(2026,value-1,1).toLocaleDateString('en-GB',{month:'long'}), String(value).padStart(2,'0')));
    }
    const dialog = $('orgStatisticsFilterDialog');
    let inertedElements = [];
    function openFilter() {
      fill(state.filters);
      inertedElements = [...document.querySelector('.phone-container').children, document.querySelector('preview-top-bar')].filter(element => element && element !== dialog && !element.inert);
      inertedElements.forEach(element => { element.inert = true; });
      dialog.hidden = false;
      dialog.classList.add('is-open');
      $('orgStatisticsKeyword').focus({ preventScroll: true });
    }
    function closeFilter() {
      dialog.hidden = true;
      dialog.classList.remove('is-open');
      inertedElements.forEach(element => { element.inert = false; });
      inertedElements = [];
      $('orgStatisticsFilterTrigger').focus({ preventScroll: true });
    }
    $('orgStatisticsFilterTrigger').addEventListener('click', openFilter);
    $('orgStatisticsCloseFilter').addEventListener('click', closeFilter);
    dialog.addEventListener('click', event => { if (event.target === dialog) closeFilter(); });
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = [...dialog.querySelectorAll('button, input, select')].filter(control => !control.disabled);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    $('orgStatisticsResetFilter').addEventListener('click', () => fill(defaults));
    $('orgStatisticsFilterForm').addEventListener('submit', event => {
      event.preventDefault();
      if (!event.currentTarget.reportValidity()) return;
      const next = Object.fromEntries(new FormData(event.currentTarget));
      next.keyword = next.keyword.trim();
      $('orgStatisticsFilterError').hidden = true;
      event.currentTarget.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid'));
      if (`${next.startYear}-${next.startMonth}` > `${next.endYear}-${next.endMonth}`) {
        $('orgStatisticsFilterError').hidden = false;
        $('orgStatisticsEndYear').setAttribute('aria-invalid','true');
        $('orgStatisticsEndYear').focus();
        return;
      }
      state.filters = next;
      refresh();
      closeFilter();
    });
    $('orgStatisticsViewChart').addEventListener('click', () => showView('chart'));
    $('orgStatisticsChartMetric').addEventListener('change', event => { state.metric = event.target.value; showView('chart'); });
    $('orgStatisticsViewTrend').addEventListener('click', () => showView('trend'));
    $('orgStatisticsTrendTotalCard').addEventListener('click', () => openAnalysis(state.rows, rangeText()));
    $('orgStatisticsAnalysisMetric').addEventListener('change', event => { state.analysisMetric = event.target.value; showView('analysis'); });
    $('orgStatisticsBack').addEventListener('click', event => {
      if (state.view === 'list') { const url = new URL(event.currentTarget.href); url.searchParams.set('theme', document.documentElement.dataset.theme); event.currentTarget.href = url.href; }
      else goBack(event);
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      if (!dialog.hidden) { event.preventDefault(); closeFilter(); }
      else goBack(event);
    });
    refresh();
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded',init) : init();
})();
