(() => {
  const records = window.MANPOWER_STATISTICS_DATA;
  const staffRecords = window.MANPOWER_STATISTICS_STAFF || [];
  const $ = id => document.getElementById(id);
  const defaults = { company: '', branch: '', department: '', summaryBy: 'jobType', summaryType: 'headcount', effectiveDate: '2026-10-05' };
  const labels = { jobType: 'Job Type', company: 'Company', branch: 'Branch', department: 'Department' };
  const plurals = { jobType: 'job types', company: 'companies', branch: 'branches', department: 'departments' };
  const colors = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6', '#f97316'];
  const state = {
    filters: { ...defaults },
    rows: [],
    filteredStaff: [],
    view: 'table',
    metric: 'jobType',
    showAll: false,
    tableScroll: 0,
    activeOverlay: null,
    detailTrigger: null
  };
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
  function isEffectiveOn(record, effectiveDate) {
    return Boolean(effectiveDate)
      && record.effectiveFrom <= effectiveDate
      && (!record.effectiveTo || effectiveDate <= record.effectiveTo);
  }
  function getFilteredStaff(filters) {
    return staffRecords.filter(employee => isEffectiveOn(employee, filters.effectiveDate)
      && ['company', 'branch', 'department'].every(key => !filters[key] || employee[key] === filters[key]));
  }
  function getGroupStaff(metric, label) {
    return state.filteredStaff.filter(employee => employee[metric] === label);
  }
  function yearsBetween(start, end) {
    const startDate = new Date(start + 'T00:00:00Z');
    const endDate = new Date(end + 'T00:00:00Z');
    if (!Number.isFinite(startDate.getTime()) || !Number.isFinite(endDate.getTime()) || endDate < startDate) return 0;
    return (endDate - startDate) / (365.2425 * 24 * 60 * 60 * 1000);
  }
  function formatNumber(value) {
    return Number.isFinite(value) ? value.toFixed(2) : '0.00';
  }
  function formatMoney(value) {
    return Number.isFinite(value)
      ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '0.00';
  }
  function summarizeGroup(label, staff) {
    const average = field => staff.length
      ? staff.reduce((total, employee) => total + (Number(employee[field]) || 0), 0) / staff.length
      : 0;
    const pay = staff.map(employee => Number(employee.basicPay) || 0).sort((a, b) => a - b);
    const middle = Math.floor(pay.length / 2);
    const medianPay = !pay.length ? 0 : pay.length % 2 ? pay[middle] : (pay[middle - 1] + pay[middle]) / 2;
    const age = staff.length
      ? staff.reduce((total, employee) => total + yearsBetween(employee.birthDate, state.filters.effectiveDate), 0) / staff.length
      : 0;
    const service = staff.length
      ? staff.reduce((total, employee) => total + yearsBetween(employee.hireDate, state.filters.effectiveDate), 0) / staff.length
      : 0;
    return [
      ['Description', label],
      ['Headcount', String(staff.length)],
      ['Average Age', formatNumber(age)],
      ['Average Service Years', formatNumber(service)],
      ['Average Competency Points', formatNumber(average('competencyPoints'))],
      ['Average Competency Match %', formatNumber(average('competencyMatchPercent'))],
      ['Average Basic Pay', formatMoney(average('basicPay'))],
      ['Median Basic Pay', formatMoney(medianPay)],
      ['Minimum Basic Pay', formatMoney(pay.length ? pay[0] : 0)],
      ['Maximum Basic Pay', formatMoney(pay.length ? pay[pay.length - 1] : 0)],
      ['Average Increment %', formatNumber(average('incrementPercent'))],
      ['Average Bonus Factor', formatNumber(average('bonusFactor'))],
      ['Attendance %', formatNumber(average('attendancePercent'))],
      ['Average Monthly OT Hours', formatNumber(average('monthlyOtHours'))],
      ['Average Training Cost', formatMoney(average('trainingCost'))],
      ['Average Performance Score', formatNumber(average('performanceScore'))],
      ['Annual Attrition %', formatNumber(average('annualAttritionPercent'))]
    ];
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
    state.rows = records.filter(row => isEffectiveOn(row, filters.effectiveDate)
      && ['company', 'branch', 'department'].every(key => !filters[key] || row[key] === filters[key])
      && row.headcount > 0);
    state.filteredStaff = getFilteredStaff(filters);
    const groups = groupRows(filters.summaryBy).sort((a, b) => a.label.localeCompare(b.label));
    const body = $('manpowerTable').tBodies[0];
    body.replaceChildren();
    groups.forEach(group => {
      const row = node('tr');
      const descriptionCell = node('td');
      const description = node('button', 'manpower-description-link', group.label);
      description.type = 'button';
      description.setAttribute('aria-label', `View statistics for ${group.label}`);
      description.addEventListener('click', () => openGroupStatistics(group.label, description));
      descriptionCell.append(description);
      row.append(descriptionCell, node('td', '', group.count));
      body.append(row);
    });
    $('manpowerEmpty').hidden = groups.length !== 0;
    $('manpowerTotalRecords').textContent = groups.length;
    $('manpowerTotalHeadcount').textContent = state.rows.reduce((sum, row) => sum + row.headcount, 0);
    const summary = ['company', 'branch', 'department'].map(key => filters[key]).filter(Boolean);
    if (!summary.length) summary.push('All Employees');
    summary.push(labels[filters.summaryBy] + ' · Headcount');
    $('manpowerFilterSummary').textContent = summary.join(' >> ');
  }
  function setPageInert(value) {
    ['main', '.employee-career-header', 'phone-bottom-nav'].forEach(selector => {
      const element = document.querySelector(selector);
      if (element) element.inert = value;
    });
  }
  function closeDetailOverlay(restoreFocus = true) {
    const overlay = state.activeOverlay;
    const trigger = state.detailTrigger;
    if (!overlay) return;
    overlay.hidden = true;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    state.activeOverlay = null;
    state.detailTrigger = null;
    setPageInert(false);
    if (restoreFocus) {
      const focusTarget = trigger && trigger.isConnected ? trigger : $('manpowerFilterTrigger');
      focusTarget?.focus({ preventScroll: true });
    }
  }
  function trapOverlayFocus(event, overlay) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDetailOverlay();
      return;
    }
    if (event.key !== 'Tab') return;
    const controls = [...overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
      .filter(element => !element.disabled && !element.hidden);
    if (!controls.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  function openGroupStatistics(label, trigger) {
    const staff = getGroupStaff(state.filters.summaryBy, label);
    const body = $('manpowerStatisticsDetails').tBodies[0];
    body.replaceChildren();
    summarizeGroup(label, staff).forEach(([field, value]) => {
      const row = node('tr');
      const heading = node('th', '', field);
      heading.scope = 'row';
      row.append(heading, node('td', '', value));
      body.append(row);
    });
    const overlay = $('manpowerStatisticsOverlay');
    state.activeOverlay = overlay;
    state.detailTrigger = trigger;
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-open');
    setPageInert(true);
    $('manpowerStatisticsClose').focus({ preventScroll: true });
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
    setPageInert(true);
    $('manpowerCompany').focus();
  }
  function closeFilter() {
    $('manpowerFilterOverlay').hidden = true;
    $('manpowerFilterOverlay').classList.remove('is-open');
    setPageInert(false);
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
  $('manpowerStatisticsClose').addEventListener('click', () => closeDetailOverlay());
  $('manpowerStatisticsOverlay').addEventListener('click', event => {
    if (event.target === event.currentTarget) closeDetailOverlay();
  });
  $('manpowerStatisticsOverlay').addEventListener('keydown', event => trapOverlayFocus(event, $('manpowerStatisticsOverlay')));
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
