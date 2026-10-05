(() => {
  const isRetention = document.body.dataset.staffReport === 'retention';
  const isAttrition = document.body.dataset.staffReport === 'attrition';
  const reportTitle = isAttrition ? 'Staff Attrition' : isRetention ? 'Staff Retention' : 'Staff List';
  // Demo staff records follow the existing Employee & Career and Leave examples.
  const activeStaff = [
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
  ].map(row => {
    const organization = {
      'HUMAN RESOURCE': { section: 'People Operations', skillGroup: 'Human Resources' },
      'PRODUCT & DESIGN': { section: 'User Experience', skillGroup: 'Design' },
      'FINANCE & ACCOUNTING': { section: 'Financial Reporting', skillGroup: 'Finance' },
      'ADMINISTRATION': { section: 'Office Administration', skillGroup: 'Administration' },
      'OPERATIONS': { section: 'Regional Operations', skillGroup: 'Operations' },
      'SALES & MARKETING': { section: 'Sales Support', skillGroup: 'Sales' },
      'INFORMATION TECHNOLOGY': { section: 'Technology Services', skillGroup: 'Technology' }
    };
    return { ...row, ...organization[row.department], job: row.position };
  });
  const staff = isAttrition ? window.EMPLOYEE_CAREER_ATTRITION_DATA : activeStaff;
  const $ = id => document.getElementById(id);
  const today = new Date();
  const dateISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const trendStart = new Date(today.getFullYear(), today.getMonth() - 11, 1);
  const startISO = `${trendStart.getFullYear()}-${String(trendStart.getMonth() + 1).padStart(2, '0')}-01`;
  const defaults = isAttrition
    ? { keyword: '', start: startISO, end: dateISO, branch: '', department: '', section: '', job: '', skillGroup: '' }
    : isRetention
    ? { keyword: '', serviceYears: '0', branch: '', department: '', section: '', job: '', skillGroup: '' }
    : { keyword: '', asAt: dateISO, branch: '', department: '', position: '' };
  const filterDimensions = isRetention || isAttrition ? ['branch', 'department', 'section', 'job', 'skillGroup'] : ['branch', 'department', 'position'];
  const columns = [['empNo', 'Emp#'], ['name', 'Name'], ...(isAttrition ? [['reason', 'Reason']] : [...(!isRetention ? [['age', 'Age']] : []), ['yos', 'YOS']]), ['branch', 'Branch'], ['department', 'Department'], ['position', 'Position']];
  const state = { filters: { ...defaults }, rows: [], view: 'table', metric: 'branch', showAll: false, selectedMonth: null, analysisMetric: 'branch', analysisShowAll: false, trendScroll: 0 };
  const metrics = {
    branch: { label: 'Branch', plural: 'branches', value: row => row.branch },
    department: { label: 'Department', plural: 'departments', value: row => row.department },
    position: { label: 'Position', plural: 'positions', value: row => row.position },
    section: { label: 'Section', plural: 'sections', value: row => row.section },
    job: { label: 'Job', plural: 'jobs', value: row => row.job },
    skillGroup: { label: 'Skill Group', plural: 'skill groups', value: row => row.skillGroup },
    reason: { label: 'Reason', plural: 'reasons', value: row => row.reason },
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
    const asAtISO = state.filters.asAt || dateISO;
    const asAt = parseDate(asAtISO);
    const keyword = state.filters.keyword.toLowerCase().replace(/^#/, '');
    state.rows = staff.filter(row => row.hireDate <= asAtISO
      && (!keyword || `${row.empNo} ${row.name}`.toLowerCase().includes(keyword))
      && (!isAttrition || (row.exitDate >= state.filters.start && row.exitDate <= state.filters.end))
      && filterDimensions.every(key => !state.filters[key] || row[key] === state.filters[key]))
      .map(row => {
        const recordDate = isAttrition ? parseDate(row.exitDate) : asAt;
        return { ...row, age: completedYears(parseDate(row.birthDate), recordDate), yos: yearsOfService(parseDate(row.hireDate), recordDate) };
      })
      .filter(row => !isRetention || row.yos >= Number(state.filters.serviceYears || 0));
    const body = $('staffListTable').tBodies[0];
    body.replaceChildren();
    state.rows.forEach(row => {
      const tr = node('tr');
      const numberCell = node('td');
      numberCell.append(node('span', 'staff-list-emp-number', '#' + row.empNo));
      tr.append(numberCell, node('td', '', row.name));
      columns.slice(2).forEach(([key]) => {
        const cell = node('td');
        if (key === 'branch') cell.append(node('span', 'staff-list-branch', row.branch));
        else cell.textContent = key === 'yos' ? row.yos.toFixed(2) : row[key];
        tr.append(cell);
      });
      body.append(tr);
    });
    $('staffListTotalRecords').textContent = state.rows.length;
    const asAtSummary = $('staffListAsAt');
    if (asAtSummary) asAtSummary.textContent = formatDate(asAtISO);
    if (isAttrition) {
      const average = key => state.rows.length ? (state.rows.reduce((total, row) => total + row[key], 0) / state.rows.length).toFixed(2) : '0.00';
      $('staffAttritionAverageAge').textContent = average('age');
      $('staffAttritionAverageYos').textContent = average('yos');
    }
    $('staffListEmpty').hidden = state.rows.length > 0;
    const summary = [state.filters.keyword ? `Search: ${state.filters.keyword}` : 'All Employees'];
    if (isRetention) summary.push(`Service Years >= ${state.filters.serviceYears || 0}`);
    filterDimensions.forEach(key => { if (state.filters[key]) summary.push(state.filters[key]); });
    if (isAttrition) summary.push(`${formatDate(state.filters.start)} – ${formatDate(state.filters.end)}`);
    else if (!isRetention) summary.push(formatDate(asAtISO));
    $('staffListFilterSummary').textContent = summary.join(' >> ');
  }
  function chartGroups(rows = state.rows, metricKey = state.metric) {
    const counts = new Map();
    rows.forEach(row => { const label = metrics[metricKey].value(row); counts.set(label, (counts.get(label) || 0) + 1); });
    return [...counts].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
      .map((group, index) => ({ ...group, color: colors[index % colors.length] }));
  }
  function renderChart(prefix = 'staffList', rows = state.rows, metricKey = state.metric, showAll = state.showAll) {
    const chartNode = suffix => $(prefix + 'Chart' + suffix);
    const metric = metrics[metricKey];
    const all = chartGroups(rows, metricKey);
    const shown = showAll || all.length <= 5 ? all : [...all.slice(0, 5), { label: 'Others', count: all.slice(5).reduce((sum, group) => sum + group.count, 0), color: '#94a3b8' }];
    const total = rows.length;
    const title = (isAttrition ? 'Attrition by ' : isRetention ? 'Retained staff by ' : 'Staff by ') + metric.label.toLowerCase();
    chartNode('Title').textContent = title;
    chartNode('Donut').setAttribute('aria-label', `${title}: ${total} ${isAttrition ? 'exits' : 'staff'}`);
    chartNode('Column').textContent = metric.label;
    chartNode('Total').textContent = total;
    chartNode('Note').textContent = !total ? 'No records match the current filter' : !showAll && all.length > 5 ? `Top 5 categories + other ${metric.plural}` : `All ${metric.plural}`;
    chartNode('Segments').replaceChildren();
    chartNode('Legend').replaceChildren();
    const circumference = 2 * Math.PI * 70;
    let offset = 0;
    shown.forEach(group => {
      const length = group.count / total * circumference;
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      const attributes = { cx: 90, cy: 90, r: 70, fill: 'none', stroke: group.color, 'stroke-width': 22, 'stroke-dasharray': `${length} ${circumference - length}`, 'stroke-dashoffset': -offset };
      Object.entries(attributes).forEach(([key, value]) => circle.setAttribute(key, value));
      circle.dataset.count = group.count;
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = `${group.label}: ${group.count} ${isAttrition ? 'exits' : 'staff'} (${(group.count / total * 100).toFixed(1)}%)`;
      circle.append(title);
      chartNode('Segments').append(circle);
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
      chartNode('Legend').append(row);
    });
    if (!total) chartNode('Legend').append(node('p', 'staff-list-chart-note', isAttrition ? 'No Exits Found' : 'No Staff Found'));
    chartNode('ViewAllFooter').hidden = all.length <= 5;
    chartNode('ViewAll').setAttribute('aria-expanded', String(showAll));
    chartNode('ViewAll').querySelector('span').textContent = showAll ? 'Show top 5' : `View all ${metric.plural}`;
    chartNode('ViewAll').querySelector('i').className = 'fa-solid ' + (showAll ? 'fa-chevron-up' : 'fa-chevron-down');
  }
  function showView(view) {
    state.view = view;
    $('staffListTableView').hidden = view !== 'table';
    $('staffListChartView').hidden = view !== 'chart';
    if (isAttrition) {
      $('staffAttritionTrendView').hidden = view !== 'trend';
      $('staffAttritionAnalysisView').hidden = view !== 'analysis';
    }
    const titles = { table: reportTitle, chart: isAttrition ? 'Attrition Analysis' : isRetention ? 'Retention Analysis' : 'Staff Analysis', trend: 'Attrition Trend Analysis', analysis: 'Attrition Analysis' };
    $('staffListTitle').textContent = titles[view];
    $('staffListBack').setAttribute('aria-label', view === 'analysis' ? 'Back to Attrition Trend' : view === 'trend' ? 'Back to Attrition Chart' : view === 'chart' ? 'Back to ' + reportTitle : 'Back to Employee and Career');
    document.querySelector('main').scrollTop = 0;
  }
  function populateFilter() {
    Object.keys(defaults).forEach(key => { const id = 'staffListFilter' + key[0].toUpperCase() + key.slice(1); $(id).value = state.filters[key]; });
  }
  function openFilter() {
    populateFilter();
    if (isAttrition) { $('staffListFilterError').hidden = true; $('staffListFilterEnd').removeAttribute('aria-invalid'); }
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
    if (isAttrition) renderTrend();
    closeFilter();
  }
  function exportCsv() {
    const rows = [columns.map(([, label]) => label), ...state.rows.map(row => columns.map(([key]) => key === 'empNo' ? '#' + row.empNo : key === 'yos' ? row.yos.toFixed(2) : row[key]))];
    const csv = rows.map(row => row.map(value => /[",\r\n]/.test(String(value)) ? '"' + String(value).replaceAll('"', '""') + '"' : value).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
    const link = node('a');
    link.href = url;
    link.download = `${isAttrition ? 'staff-attrition' : isRetention ? 'staff-retention' : 'staff-list'}-${state.filters.asAt || dateISO}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function monthLabel(key) {
    return parseDate(key + '-01').toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  }
  function renderTrend() {
    const months = [];
    const cursor = parseDate(state.filters.start);
    cursor.setDate(1);
    const endMonth = state.filters.end.slice(0, 7);
    while (true) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
      if (key > endMonth) break;
      months.push({ key, count: state.rows.filter(row => row.exitDate.slice(0, 7) === key).length });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    $('staffAttritionTrendRange').textContent = `${formatDate(state.filters.start)} – ${formatDate(state.filters.end)}`;
    $('staffAttritionTrendTotalCount').textContent = state.rows.length;
    const maximum = Math.max(1, ...months.map(month => month.count));
    $('staffAttritionTrendBars').replaceChildren();
    months.forEach(month => {
      const button = node('button', 'staff-attrition-bar');
      button.type = 'button';
      button.dataset.attritionMonth = month.key;
      button.dataset.count = month.count;
      button.setAttribute('aria-label', `${monthLabel(month.key)}: ${month.count} exits. View analysis.`);
      const track = node('span', 'staff-attrition-bar-track');
      const fill = node('span', 'staff-attrition-bar-fill');
      fill.style.width = month.count / maximum * 100 + '%';
      track.append(fill);
      button.append(node('span', 'staff-attrition-bar-month', monthLabel(month.key)), track, node('strong', '', month.count));
      button.addEventListener('click', () => openAttritionAnalysis(month.key));
      $('staffAttritionTrendBars').append(button);
    });
  }
  function renderAttritionAnalysis() {
    const rows = state.selectedMonth ? state.rows.filter(row => row.exitDate.slice(0, 7) === state.selectedMonth) : state.rows;
    $('staffAttritionAnalysisPeriod').textContent = state.selectedMonth ? monthLabel(state.selectedMonth) : `${formatDate(state.filters.start)} – ${formatDate(state.filters.end)}`;
    renderChart('staffAttritionAnalysis', rows, state.analysisMetric, state.analysisShowAll);
  }
  function openAttritionAnalysis(month = null) {
    state.trendScroll = document.querySelector('main').scrollTop;
    state.selectedMonth = month;
    state.analysisMetric = 'branch';
    state.analysisShowAll = false;
    $('staffAttritionAnalysisChartMetric').value = 'branch';
    renderAttritionAnalysis();
    showView('analysis');
    $('staffAttritionAnalysisChartMetric').focus();
  }
  function initAttrition() {
    $('staffAttritionViewTrend').addEventListener('click', () => {
      renderTrend();
      showView('trend');
      $('staffAttritionTrendTotal').focus();
    });
    $('staffAttritionTrendTotal').addEventListener('click', () => openAttritionAnalysis());
    $('staffAttritionAnalysisChartMetric').addEventListener('change', event => {
      state.analysisMetric = event.target.value;
      state.analysisShowAll = false;
      renderAttritionAnalysis();
    });
    $('staffAttritionAnalysisChartViewAll').addEventListener('click', () => {
      state.analysisShowAll = !state.analysisShowAll;
      renderAttritionAnalysis();
    });
    renderTrend();
  }
  function init() {
    filterDimensions.forEach(key => {
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
      if (isAttrition && filters.end < filters.start) {
        $('staffListFilterError').textContent = 'End Date must be on or after Start Date.';
        $('staffListFilterError').hidden = false;
        $('staffListFilterEnd').setAttribute('aria-invalid', 'true');
        $('staffListFilterEnd').focus();
        return;
      }
      applyFilters(filters);
    });
    $('staffListViewChart').addEventListener('click', () => { renderChart(); showView('chart'); $('staffListChartMetric').focus(); });
    $('staffListChartMetric').addEventListener('change', event => { state.metric = event.target.value; state.showAll = false; renderChart(); });
    $('staffListChartViewAll').addEventListener('click', () => { state.showAll = !state.showAll; renderChart(); });
    $('staffListBack').addEventListener('click', event => {
      if (state.view === 'table') return;
      event.preventDefault();
      const view = state.view === 'analysis' ? 'trend' : state.view === 'trend' ? 'chart' : 'table';
      showView(view);
      if (view === 'trend') {
        document.querySelector('main').scrollTop = state.trendScroll;
        const selected = [...document.querySelectorAll('[data-attrition-month]')].find(button => button.dataset.attritionMonth === state.selectedMonth);
        (selected || $('staffAttritionTrendTotal')).focus({ preventScroll: true });
      } else (view === 'chart' ? $('staffAttritionViewTrend') : $('staffListViewChart')).focus();
    });
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
    if (isAttrition) initAttrition();
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
