(() => {
  const $ = id => document.getElementById(id);
  const data = Array.isArray(window.EMPLOYEE_CAREER_STAFF_PLAN_DATA) ? window.EMPLOYEE_CAREER_STAFF_PLAN_DATA : [];
  const colors = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#14b8a6', '#f97316'];
  const defaults = {
    keyword: '',
    targetYear: '',
    branch: '',
    department: ''
  };
  const state = { filters: { ...defaults }, rows: [...data], metric: 'branch', view: 'list' };
  const metrics = {
    branch: { label: 'Branch', value: row => row.branch },
    department: { label: 'Department', value: row => row.department },
    careerPath: { label: 'Career Path', value: row => row.careerPath }
  };

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function unique(key, rows = data) {
    return [...new Set(rows.map(row => row[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }

  function formatDate(value) {
    return new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function option(select, label, value = label) {
    select.add(new Option(label, value));
  }

  function populateSelect(select, placeholder, values, selected = '') {
    select.replaceChildren(new Option(placeholder, ''));
    values.forEach(value => option(select, value));
    select.value = selected;
  }

  function profileUrl(row) {
    const url = new URL('../../../../me.html', location.href);
    url.searchParams.set('employee', row.empNo);
    url.searchParams.set('theme', document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
    return url.href;
  }

  function detail(label, value) {
    const item = node('div', 'staff-career-plan-detail');
    item.append(node('dt', '', label), node('dd', '', value));
    return item;
  }

  function renderCards() {
    const cards = $('staffCareerPlanCards');
    cards.replaceChildren();
    state.rows.forEach(row => {
      const card = node('a', 'history-card-item staff-career-plan-card');
      card.href = profileUrl(row);
      card.setAttribute('aria-label', `Open CV for ${row.name}, ${row.empNo}`);

      const header = node('span', 'staff-career-plan-card-header');
      const identity = node('span', 'staff-career-plan-identity');
      identity.append(node('strong', 'staff-career-plan-name', row.name), node('span', 'staff-career-plan-employee-id', `#${row.empNo}`));
      header.append(identity);

      const details = node('dl', 'staff-career-plan-details');
      details.append(
        detail('Branch', row.branch),
        detail('Department', row.department),
        detail('Position', row.position),
        detail('Sex', row.sex),
        detail('Age', String(row.age))
      );
      card.append(header, details);
      cards.append(card);
    });
    $('staffCareerPlanTotalRecords').textContent = state.rows.length;
    $('staffCareerPlanEmpty').hidden = state.rows.length > 0;
  }

  function filterSummary() {
    const parts = [];
    if (state.filters.keyword) parts.push(state.filters.keyword);
    if (state.filters.targetYear) parts.push(state.filters.targetYear);
    if (state.filters.branch) parts.push(state.filters.branch);
    if (state.filters.department) parts.push(state.filters.department);
    $('staffCareerPlanFilterSummary').textContent = parts.join(' · ');
  }

  function applyRows() {
    const keyword = state.filters.keyword.toLowerCase().replace(/^#/, '');
    state.rows = data.filter(row => (
      (!keyword || `${row.empNo} ${row.name}`.toLowerCase().includes(keyword)) &&
      (!state.filters.targetYear || row.targetDate.slice(0, 4) === state.filters.targetYear) &&
      (!state.filters.branch || row.branch === state.filters.branch) &&
      (!state.filters.department || row.department === state.filters.department)
    ));
    renderCards();
    filterSummary();
    renderChart();
  }

  function chartGroups() {
    const metric = metrics[state.metric];
    const counts = new Map();
    state.rows.forEach(row => {
      const label = metric.value(row);
      counts.set(label, (counts.get(label) || 0) + 1);
    });
    return [...counts].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }

  function renderChart() {
    const metric = metrics[state.metric];
    const groups = chartGroups();
    const total = state.rows.length;
    $('staffCareerPlanChartTitle').textContent = `Career plans by ${metric.label.toLowerCase()}`;
    $('staffCareerPlanChartColumn').textContent = metric.label;
    $('staffCareerPlanChartTotal').textContent = total;
    $('staffCareerPlanChartPeriod').textContent = state.filters.targetYear || 'All Target Years';
    $('staffCareerPlanChartNote').textContent = total ? `Distribution of ${total} filtered career ${total === 1 ? 'plan' : 'plans'}` : 'No career plans match the current filter';
    $('staffCareerPlanChartSegments').replaceChildren();
    $('staffCareerPlanChartLegend').replaceChildren();
    const circumference = 2 * Math.PI * 70;
    let offset = 0;
    groups.forEach((group, index) => {
      const color = colors[index % colors.length];
      const length = total ? group.count / total * circumference : 0;
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      const attributes = { cx: 90, cy: 90, r: 70, fill: 'none', stroke: color, 'stroke-width': 22, 'stroke-dasharray': `${length} ${circumference - length}`, 'stroke-dashoffset': -offset };
      Object.entries(attributes).forEach(([key, value]) => circle.setAttribute(key, value));
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = `${group.label}: ${group.count} (${(group.count / total * 100).toFixed(1)}%)`;
      circle.append(title);
      $('staffCareerPlanChartSegments').append(circle);
      offset += length;

      const row = node('div', 'staff-list-legend-row');
      const name = node('div', 'staff-list-legend-name');
      const swatch = node('i');
      swatch.style.background = color;
      swatch.setAttribute('aria-hidden', 'true');
      name.append(swatch, node('span', '', group.label));
      const count = node('strong', '', group.count);
      count.dataset.count = group.count;
      row.append(name, count, node('span', '', `${(group.count / total * 100).toFixed(1)}%`));
      $('staffCareerPlanChartLegend').append(row);
    });
    $('staffCareerPlanChartEmpty').hidden = total > 0;
  }

  function showView(view) {
    state.view = view;
    $('staffCareerPlanListView').hidden = view !== 'list';
    $('staffCareerPlanChartView').hidden = view !== 'chart';
    $('staffCareerPlanTitle').textContent = view === 'chart' ? 'Staff Career Plan Analysis' : 'Staff Career Plan';
    $('staffCareerPlanBack').setAttribute('aria-label', view === 'chart' ? 'Back to Staff Career Plan' : 'Back to Employee and Career');
    document.querySelector('main').scrollTop = 0;
  }

  function setFilterControls(filters) {
    $('staffCareerPlanFilterKeyword').value = filters.keyword;
    $('staffCareerPlanFilterTargetYear').value = filters.targetYear;
    $('staffCareerPlanFilterBranch').value = filters.branch;
    $('staffCareerPlanFilterDepartment').value = filters.department;
  }

  function setFilterInert(inert) {
    document.querySelector('main').inert = inert;
    document.querySelector('.employee-career-header').inert = inert;
    document.querySelector('phone-bottom-nav').inert = inert;
  }

  function openFilter() {
    setFilterControls(state.filters);
    $('staffCareerPlanFilterOverlay').hidden = false;
    $('staffCareerPlanFilterOverlay').classList.add('is-open');
    setFilterInert(true);
    $('staffCareerPlanFilterKeyword').focus();
  }

  function closeFilter() {
    $('staffCareerPlanFilterOverlay').hidden = true;
    $('staffCareerPlanFilterOverlay').classList.remove('is-open');
    setFilterInert(false);
    $('staffCareerPlanFilterTrigger').focus();
  }

  function readFilterControls() {
    return {
      keyword: $('staffCareerPlanFilterKeyword').value.trim(),
      targetYear: $('staffCareerPlanFilterTargetYear').value,
      branch: $('staffCareerPlanFilterBranch').value,
      department: $('staffCareerPlanFilterDepartment').value
    };
  }

  function applyFilter(event) {
    event.preventDefault();
    const filters = readFilterControls();

    state.filters = filters;
    applyRows();
    closeFilter();
  }

  function init() {
    populateSelect($('staffCareerPlanFilterTargetYear'), 'All Target Years', [...new Set(data.map(row => row.targetDate.slice(0, 4)))].sort());
    populateSelect($('staffCareerPlanFilterBranch'), 'All Branches', unique('branch'));
    populateSelect($('staffCareerPlanFilterDepartment'), 'All Departments', unique('department'));
    setFilterControls(defaults);
    applyRows();

    $('staffCareerPlanFilterTrigger').addEventListener('click', openFilter);
    $('staffCareerPlanCloseFilter').addEventListener('click', closeFilter);
    $('staffCareerPlanResetFilter').addEventListener('click', () => {
        setFilterControls(defaults);
    });
    $('staffCareerPlanFilterForm').addEventListener('submit', applyFilter);
    $('staffCareerPlanFilterOverlay').addEventListener('click', event => { if (event.target === event.currentTarget) closeFilter(); });
    $('staffCareerPlanViewChart').addEventListener('click', () => { renderChart(); showView('chart'); $('staffCareerPlanChartMetric').focus(); });
    $('staffCareerPlanChartMetric').addEventListener('change', event => { state.metric = event.target.value; renderChart(); });
    $('staffCareerPlanBack').addEventListener('click', event => {
      if (state.view !== 'chart') return;
      event.preventDefault();
      showView('list');
      $('staffCareerPlanViewChart').focus();
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      if (!$('staffCareerPlanFilterOverlay').hidden) closeFilter();
      else if (state.view === 'chart') showView('list');
    });
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
