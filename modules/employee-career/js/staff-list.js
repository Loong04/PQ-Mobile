(() => {
  // Demo staff records follow the existing Employee & Career and Leave examples.
  const staff = [
    { empNo: 'EBB01', name: 'Aina Rahman', birthDate: '1995-04-17', hireDate: '2026-01-15', branch: 'HEADQUARTERS (HQ)', department: 'HUMAN RESOURCE', position: 'People Operations Executive' },
    { empNo: 'EBB02', name: 'Daniel Wong', birthDate: '1994-08-23', hireDate: '2026-02-03', branch: 'HEADQUARTERS (HQ)', department: 'PRODUCT & DESIGN', position: 'Product Designer' },
    { empNo: 'EBB03', name: 'Nur Izzati', birthDate: '1997-11-09', hireDate: '2026-03-21', branch: 'NORTHERN REGION BRANCH', department: 'FINANCE & ACCOUNTING', position: 'Finance Analyst' },
    { empNo: '004177', name: 'AHMAD RAFY BIN ZULKIPLE', birthDate: '1983-06-18', hireDate: '2012-02-01', branch: 'HEADQUARTERS (HQ)', department: 'ADMINISTRATION', position: 'ADMIN MANAGER' },
    { empNo: '007216', name: 'HAILIZAM BIN MOHAMED IKHSAN', birthDate: '1989-02-12', hireDate: '2018-05-14', branch: 'SOUTHERN REGION BRANCH', department: 'OPERATIONS', position: 'OPERATIONS SUPERVISOR' },
    { empNo: '006611', name: 'AZMAN BIN ABDULLAH', birthDate: '1987-12-05', hireDate: '2015-09-07', branch: 'EAST COAST BRANCH', department: 'SALES & MARKETING', position: 'SALES EXECUTIVE' },
    { empNo: '003085', name: 'SITI NURHALIZA BINTI ALI', birthDate: '1992-09-11', hireDate: '2020-06-01', branch: 'CENTRAL REGION BRANCH', department: 'HUMAN RESOURCE', position: 'HR EXECUTIVE' },
    { empNo: '005712', name: 'LEE WEI MING', birthDate: '1996-01-25', hireDate: '2022-04-18', branch: 'SABAH BRANCH', department: 'INFORMATION TECHNOLOGY', position: 'SOFTWARE ENGINEER' },
    { empNo: '002964', name: 'FARAH BINTI HASSAN', birthDate: '1990-07-08', hireDate: '2019-10-01', branch: 'SARAWAK BRANCH', department: 'FINANCE & ACCOUNTING', position: 'ACCOUNT EXECUTIVE' },
    { empNo: '008105', name: 'JASON TAN', birthDate: '1999-03-30', hireDate: '2024-08-05', branch: 'NORTHERN REGION BRANCH', department: 'SALES & MARKETING', position: 'SALES EXECUTIVE' },
    { empNo: '004226', name: 'NUR AINA BINTI OMAR', birthDate: '1985-10-05', hireDate: '2016-01-04', branch: 'SOUTHERN REGION BRANCH', department: 'OPERATIONS', position: 'BRANCH MANAGER' },
    { empNo: '009034', name: 'MUHAMMAD HAFIZ', birthDate: '2000-05-19', hireDate: '2025-07-01', branch: 'CENTRAL REGION BRANCH', department: 'INFORMATION TECHNOLOGY', position: 'IT SUPPORT EXECUTIVE' }
  ];
  const $ = id => document.getElementById(id);
  const today = new Date();
  const dateISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const defaults = { keyword: '', asAt: dateISO, branch: '', department: '', position: '' };
  const state = { filters: { ...defaults }, rows: [], view: 'table', metric: 'branch', showAll: false };
  const metrics = {
    branch: { label: 'Branch', plural: 'branches', value: row => row.branch },
    department: { label: 'Department', plural: 'departments', value: row => row.department },
    position: { label: 'Position', plural: 'positions', value: row => row.position },
    age: { label: 'Age', plural: 'age groups', value: row => row.age < 30 ? 'Under 30' : row.age < 40 ? '30–39' : row.age < 50 ? '40–49' : row.age < 60 ? '50–59' : '60 and above' },
    yos: { label: 'Years of Service', plural: 'service groups', value: row => row.yos < 1 ? 'Less than 1 year' : row.yos < 5 ? '1–4 years' : row.yos < 10 ? '5–9 years' : row.yos < 15 ? '10–14 years' : '15 years and above' }
  };
  const colors = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#84cc16'];
  const parseDate = value => new Date(value + 'T00:00:00');
  const formatDate = value => parseDate(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  function completedYears(start, end) {
    let years = end.getFullYear() - start.getFullYear();
    if (end.getMonth() < start.getMonth() || (end.getMonth() === start.getMonth() && end.getDate() < start.getDate())) years--;
    return years;
  }
  function yearsOfService(start, end) {
    const whole = completedYears(start, end);
    const anniversary = new Date(start.getFullYear() + whole, start.getMonth(), start.getDate());
    const next = new Date(start.getFullYear() + whole + 1, start.getMonth(), start.getDate());
    return whole + (end - anniversary) / (next - anniversary);
  }
  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function renderTable() {
    const asAt = parseDate(state.filters.asAt);
    const keyword = state.filters.keyword.toLowerCase().replace(/^#/, '');
    state.rows = staff.filter(row => row.hireDate <= state.filters.asAt
      && (!keyword || `${row.empNo} ${row.name}`.toLowerCase().includes(keyword))
      && ['branch', 'department', 'position'].every(key => !state.filters[key] || row[key] === state.filters[key]))
      .map(row => ({ ...row, age: completedYears(parseDate(row.birthDate), asAt), yos: yearsOfService(parseDate(row.hireDate), asAt) }));
    const body = $('staffListTable').tBodies[0];
    body.replaceChildren();
    state.rows.forEach(row => {
      const tr = node('tr');
      const numberCell = node('td');
      numberCell.append(node('span', 'staff-list-emp-number', '#' + row.empNo));
      tr.append(numberCell, node('td', '', row.name), node('td', '', row.age), node('td', '', row.yos.toFixed(2)));
      const branch = node('td');
      branch.append(node('span', 'staff-list-branch', row.branch));
      tr.append(branch, node('td', '', row.department), node('td', '', row.position));
      body.append(tr);
    });
    $('staffListTotalRecords').textContent = state.rows.length;
    $('staffListAsAt').textContent = formatDate(state.filters.asAt);
    $('staffListEmpty').hidden = state.rows.length > 0;
    const summary = [state.filters.keyword ? `Search: ${state.filters.keyword}` : 'All Employees'];
    ['branch', 'department', 'position'].forEach(key => { if (state.filters[key]) summary.push(state.filters[key]); });
    summary.push(formatDate(state.filters.asAt));
    $('staffListFilterSummary').textContent = summary.join(' >> ');
  }
  function chartGroups() {
    const counts = new Map();
    state.rows.forEach(row => { const label = metrics[state.metric].value(row); counts.set(label, (counts.get(label) || 0) + 1); });
    return [...counts].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
      .map((group, index) => ({ ...group, color: colors[index % colors.length] }));
  }
  function renderChart() {
    const metric = metrics[state.metric];
    const all = chartGroups();
    const shown = state.showAll || all.length <= 5 ? all : [...all.slice(0, 5), { label: 'Others', count: all.slice(5).reduce((sum, group) => sum + group.count, 0), color: '#94a3b8' }];
    const total = state.rows.length;
    $('staffListChartTitle').textContent = 'Staff by ' + metric.label.toLowerCase();
    $('staffListChartDonut').setAttribute('aria-label', `Staff by ${metric.label.toLowerCase()}: ${total} staff`);
    $('staffListChartColumn').textContent = metric.label;
    $('staffListChartTotal').textContent = total;
    $('staffListChartNote').textContent = !total ? 'No staff match the current filter' : !state.showAll && all.length > 5 ? `Top 5 categories + other ${metric.plural}` : `All ${metric.plural}`;
    $('staffListChartSegments').replaceChildren();
    $('staffListChartLegend').replaceChildren();
    const circumference = 2 * Math.PI * 70;
    let offset = 0;
    shown.forEach(group => {
      const length = group.count / total * circumference;
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      const attributes = { cx: 90, cy: 90, r: 70, fill: 'none', stroke: group.color, 'stroke-width': 22, 'stroke-dasharray': `${length} ${circumference - length}`, 'stroke-dashoffset': -offset };
      Object.entries(attributes).forEach(([key, value]) => circle.setAttribute(key, value));
      circle.dataset.count = group.count;
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = `${group.label}: ${group.count} staff (${(group.count / total * 100).toFixed(1)}%)`;
      circle.append(title);
      $('staffListChartSegments').append(circle);
      offset += length;
      const row = node('div', 'staff-list-legend-row');
      const name = node('div', 'staff-list-legend-name');
      const swatch = node('i');
      swatch.style.background = group.color;
      swatch.setAttribute('aria-hidden', 'true');
      name.append(swatch, node('span', '', group.label));
      const count = node('strong', '', group.count);
      count.dataset.count = group.count;
      row.append(name, count, node('span', '', (group.count / total * 100).toFixed(1) + '%'));
      $('staffListChartLegend').append(row);
    });
    if (!total) $('staffListChartLegend').append(node('p', 'staff-list-chart-note', 'No Staff Found'));
    $('staffListChartViewAllFooter').hidden = all.length <= 5;
    $('staffListChartViewAll').setAttribute('aria-expanded', String(state.showAll));
    $('staffListChartViewAll').querySelector('span').textContent = state.showAll ? 'Show top 5' : `View all ${metric.plural}`;
    $('staffListChartViewAll').querySelector('i').className = 'fa-solid ' + (state.showAll ? 'fa-chevron-up' : 'fa-chevron-down');
  }
  function showView(view) {
    state.view = view;
    $('staffListTableView').hidden = view !== 'table';
    $('staffListChartView').hidden = view !== 'chart';
    $('staffListTitle').textContent = view === 'chart' ? 'Staff Analysis' : 'Staff List';
    $('staffListBack').setAttribute('aria-label', view === 'chart' ? 'Back to Staff List' : 'Back to Employee and Career');
    document.querySelector('main').scrollTop = 0;
  }
  function populateFilter() {
    Object.keys(defaults).forEach(key => { const id = 'staffListFilter' + key[0].toUpperCase() + key.slice(1); $(id).value = state.filters[key]; });
  }
  function openFilter() {
    populateFilter();
    $('staffListFilterOverlay').hidden = false;
    $('staffListFilterOverlay').classList.add('is-open');
    document.querySelector('main').inert = true;
    document.querySelector('.employee-career-header').inert = true;
    document.querySelector('phone-bottom-nav').inert = true;
    $('staffListFilterKeyword').focus();
  }
  function closeFilter() {
    $('staffListFilterOverlay').hidden = true;
    $('staffListFilterOverlay').classList.remove('is-open');
    document.querySelector('main').inert = false;
    document.querySelector('.employee-career-header').inert = false;
    document.querySelector('phone-bottom-nav').inert = false;
    $('staffListFilterTrigger').focus();
  }
  function applyFilters(filters) {
    state.filters = filters;
    state.showAll = false;
    renderTable();
    renderChart();
    closeFilter();
  }
  function exportCsv() {
    const rows = [['Emp#', 'Name', 'Age', 'YOS', 'Branch', 'Department', 'Position'], ...state.rows.map(row => ['#' + row.empNo, row.name, row.age, row.yos.toFixed(2), row.branch, row.department, row.position])];
    const csv = rows.map(row => row.map(value => /[",\r\n]/.test(String(value)) ? '"' + String(value).replaceAll('"', '""') + '"' : value).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
    const link = node('a');
    link.href = url;
    link.download = `staff-list-${state.filters.asAt}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function init() {
    ['branch', 'department', 'position'].forEach(key => {
      const select = $('staffListFilter' + key[0].toUpperCase() + key.slice(1));
      select.add(new Option('All ' + metrics[key].plural[0].toUpperCase() + metrics[key].plural.slice(1), ''));
      [...new Set(staff.map(row => row[key]))].sort().forEach(value => select.add(new Option(value, value)));
    });
    $('staffListFilterTrigger').addEventListener('click', openFilter);
    $('staffListCloseFilter').addEventListener('click', closeFilter);
    $('staffListFilterOverlay').addEventListener('click', event => { if (event.target === event.currentTarget) closeFilter(); });
    $('staffListResetFilter').addEventListener('click', () => applyFilters({ ...defaults }));
    $('staffListFilterForm').addEventListener('submit', event => {
      event.preventDefault();
      const filters = {};
      Object.keys(defaults).forEach(key => { filters[key] = $('staffListFilter' + key[0].toUpperCase() + key.slice(1)).value.trim(); });
      applyFilters(filters);
    });
    $('staffListViewChart').addEventListener('click', () => { renderChart(); showView('chart'); $('staffListChartMetric').focus(); });
    $('staffListChartMetric').addEventListener('change', event => { state.metric = event.target.value; state.showAll = false; renderChart(); });
    $('staffListChartViewAll').addEventListener('click', () => { state.showAll = !state.showAll; renderChart(); });
    $('staffListBack').addEventListener('click', event => { if (state.view === 'chart') { event.preventDefault(); showView('table'); $('staffListViewChart').focus(); } });
    $('staffListExportExcel').addEventListener('click', exportCsv);
    $('staffListExportPdf').addEventListener('click', () => window.print());
    document.addEventListener('keydown', event => {
      if ($('staffListFilterOverlay').hidden) return;
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeFilter(); }
      if (event.key === 'Tab') {
        const controls = [...$('staffListFilterForm').querySelectorAll('input, select, button')].filter(control => !control.disabled && control.getClientRects().length);
        const first = controls[0], last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    populateFilter();
    renderTable();
    renderChart();
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
