(() => {
  const records = window.MANPOWER_STATISTICS_DATA;
  const $ = id => document.getElementById(id);
  const defaults = { company: '', branch: '', department: '', summaryBy: 'jobType', summaryType: 'headcount', effectiveDate: '2026-10-05' };
  const labels = { jobType: 'Job Type', company: 'Company', branch: 'Branch', department: 'Department' };
  const plurals = { jobType: 'job types', company: 'companies', branch: 'branches', department: 'departments' };
  const colors = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6', '#f97316'];
  const state = { filters: { ...defaults }, rows: [], view: 'table', metric: 'jobType', showAll: false, tableScroll: 0 };
  const fieldIds = { company: 'manpowerCompany', branch: 'manpowerBranch', department: 'manpowerDepartment', summaryBy: 'manpowerSummaryBy', summaryType: 'manpowerSummaryType', effectiveDate: 'manpowerEffectiveDate' };
  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function formatDate(date) {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function groupRows(metric) {
    const grouped = new Map();
    state.rows.forEach(row => {
      const label = row[metric];
      grouped.set(label, (grouped.get(label) || 0) + row.headcount);
    });
    return [...grouped].map(([label, count]) => ({ label, count }));
  }
  function renderTable() {
    const filters = state.filters;
    state.rows = records.filter(row => row.effectiveFrom <= filters.effectiveDate
      && (!row.effectiveTo || filters.effectiveDate <= row.effectiveTo)
      && ['company', 'branch', 'department'].every(key => !filters[key] || row[key] === filters[key])
      && row.headcount > 0);
    const groups = groupRows(filters.summaryBy).sort((a, b) => a.label.localeCompare(b.label));
    const body = $('manpowerTable').tBodies[0];
    body.replaceChildren();
    groups.forEach(group => {
      const row = node('tr');
      row.append(node('td', '', group.label), node('td', '', group.count));
      body.append(row);
    });
    $('manpowerEmpty').hidden = groups.length !== 0;
    $('manpowerTotalRecords').textContent = groups.length;
    $('manpowerTotalHeadcount').textContent = state.rows.reduce((sum, row) => sum + row.headcount, 0);
    $('manpowerDateSummary').textContent = formatDate(filters.effectiveDate);
    const summary = ['company', 'branch', 'department'].map(key => filters[key]).filter(Boolean);
    if (!summary.length) summary.push('All Employees');
    summary.push(labels[filters.summaryBy] + ' · Headcount');
    $('manpowerFilterSummary').textContent = summary.join(' >> ');
  }
  function renderChart() {
    const all = groupRows(state.metric).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
      .map((group, index) => ({ ...group, color: colors[index % colors.length] }));
    const shown = state.showAll || all.length <= 5 ? all : [...all.slice(0, 5), {
      label: 'Others', count: all.slice(5).reduce((sum, group) => sum + group.count, 0), color: '#94a3b8'
    }];
    const total = all.reduce((sum, group) => sum + group.count, 0);
    const title = 'Headcount by ' + labels[state.metric].toLowerCase();
    $('manpowerChartTitle').textContent = title;
    $('manpowerChartColumn').textContent = labels[state.metric];
    $('manpowerChartDonut').setAttribute('aria-label', `${title}: ${total} people`);
    $('manpowerChartTotal').textContent = total;
    $('manpowerChartNote').textContent = !total ? 'No records match the current filter' : !state.showAll && all.length > 5 ? `Top 5 categories + other ${plurals[state.metric]}` : `All ${plurals[state.metric]}`;
    $('manpowerChartSegments').replaceChildren();
    $('manpowerChartLegend').replaceChildren();
    const circumference = 2 * Math.PI * 70;
    let offset = 0;
    shown.forEach(group => {
      const length = group.count / total * circumference;
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      Object.entries({ cx: 90, cy: 90, r: 70, fill: 'none', stroke: group.color, 'stroke-width': 22, 'stroke-dasharray': `${length} ${circumference - length}`, 'stroke-dashoffset': -offset }).forEach(([key, value]) => circle.setAttribute(key, value));
      const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      tooltip.textContent = `${group.label}: ${group.count} people (${(group.count / total * 100).toFixed(1)}%)`;
      circle.append(tooltip);
      $('manpowerChartSegments').append(circle);
      offset += length;
      const row = node('div', 'staff-list-legend-row manpower-legend-grid');
      const name = node('div', 'staff-list-legend-name');
      const swatch = node('i');
      swatch.style.background = group.color;
      swatch.setAttribute('aria-hidden', 'true');
      name.append(swatch, node('span', '', group.label));
      const count = node('strong', '', group.count);
      count.dataset.count = group.count;
      row.append(name, count, node('span', '', (group.count / total * 100).toFixed(1) + '%'));
      $('manpowerChartLegend').append(row);
    });
    if (!total) $('manpowerChartLegend').append(node('p', 'staff-list-chart-note', 'No Manpower Records Found'));
    $('manpowerChartViewAllFooter').hidden = all.length <= 5;
    $('manpowerChartViewAll').setAttribute('aria-expanded', String(state.showAll));
    $('manpowerChartViewAll').querySelector('span').textContent = state.showAll ? 'Show top 5' : 'View all ' + plurals[state.metric];
    $('manpowerChartViewAll').querySelector('i').className = 'fa-solid ' + (state.showAll ? 'fa-chevron-up' : 'fa-chevron-down');
  }
  function showView(view) {
    const main = document.querySelector('main');
    if (view === 'chart') state.tableScroll = main.scrollTop;
    state.view = view;
    $('manpowerTableView').hidden = view !== 'table';
    $('manpowerChartView').hidden = view !== 'chart';
    $('manpowerTitle').textContent = view === 'chart' ? 'Manpower Analysis' : 'Manpower Statistics';
    $('manpowerBack').setAttribute('aria-label', view === 'chart' ? 'Back to Manpower Statistics' : 'Back to Employee and Career');
    main.scrollTop = view === 'table' ? state.tableScroll : 0;
  }
  function populateFilter() {
    Object.entries(fieldIds).forEach(([key, id]) => { $(id).value = state.filters[key]; });
  }
  function openFilter() {
    populateFilter();
    $('manpowerFilterOverlay').hidden = false;
    $('manpowerFilterOverlay').classList.add('is-open');
    ['main', '.employee-career-header', 'phone-bottom-nav'].forEach(selector => { document.querySelector(selector).inert = true; });
    $('manpowerCompany').focus();
  }
  function closeFilter() {
    $('manpowerFilterOverlay').hidden = true;
    $('manpowerFilterOverlay').classList.remove('is-open');
    ['main', '.employee-career-header', 'phone-bottom-nav'].forEach(selector => { document.querySelector(selector).inert = false; });
    $('manpowerFilterTrigger').focus();
  }
  function applyFilters(filters) {
    state.filters = filters;
    state.metric = filters.summaryBy;
    state.showAll = false;
    $('manpowerChartMetric').value = state.metric;
    state.tableScroll = 0;
    renderTable();
    renderChart();
    closeFilter();
    document.querySelector('main').scrollTop = 0;
  }
  ['company', 'branch', 'department'].forEach(key => {
    const select = $(fieldIds[key]);
    const all = node('option', '', '- All -');
    all.value = '';
    select.append(all);
    [...new Set(records.map(row => row[key]))].sort().forEach(value => {
      const option = node('option', '', value);
      option.value = value;
      select.append(option);
    });
  });
  $('manpowerFilterTrigger').addEventListener('click', openFilter);
  $('manpowerCloseFilter').addEventListener('click', closeFilter);
  $('manpowerResetFilter').addEventListener('click', () => applyFilters({ ...defaults }));
  $('manpowerFilterOverlay').addEventListener('click', event => { if (event.target === event.currentTarget) closeFilter(); });
  $('manpowerFilterForm').addEventListener('submit', event => {
    event.preventDefault();
    if (!$('manpowerFilterForm').reportValidity()) return;
    applyFilters(Object.fromEntries(Object.entries(fieldIds).map(([key, id]) => [key, $(id).value])));
  });
  $('manpowerFilterOverlay').addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); closeFilter(); }
    if (event.key !== 'Tab') return;
    const controls = [...$('manpowerFilterForm').querySelectorAll('button, input, select')].filter(element => !element.disabled);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  $('manpowerViewChart').addEventListener('click', () => {
    renderChart();
    showView('chart');
    $('manpowerChartMetric').focus({ preventScroll: true });
  });
  $('manpowerBack').addEventListener('click', event => {
    if (state.view !== 'chart') return;
    event.preventDefault();
    showView('table');
    $('manpowerViewChart').focus({ preventScroll: true });
  });
  $('manpowerChartMetric').addEventListener('change', event => {
    state.metric = event.target.value;
    state.showAll = false;
    renderChart();
  });
  $('manpowerChartViewAll').addEventListener('click', () => { state.showAll = !state.showAll; renderChart(); });
  populateFilter();
  renderTable();
  renderChart();
})();
