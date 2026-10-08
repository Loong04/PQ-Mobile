(() => {
  const chartData = {
    status: {
      title: 'OT hours by approval status',
      column: 'STATUS',
      note: 'Approved and unapproved OT hours',
      items: [
        { label: 'Approved OT', value: 37.50, color: '#10b981' },
        { label: 'Unapproved OT', value: 135.50, color: '#f59e0b' }
      ]
    },
    section: {
      title: 'OT hours by section',
      column: 'SECTION',
      note: 'Top sections by total OT hours',
      items: [
        { label: 'Production', value: 88.50, color: '#10b981' },
        { label: 'Assembly', value: 52.00, color: '#7c3aed' },
        { label: 'Quality Control', value: 32.50, color: '#3b82f6' }
      ]
    },
    job: {
      title: 'OT hours by job title',
      column: 'JOB TITLE',
      note: 'Top job titles by total OT hours',
      items: [
        { label: 'Operator', value: 96.00, color: '#10b981' },
        { label: 'Supervisor', value: 52.50, color: '#ec4899' },
        { label: 'Technician', value: 24.50, color: '#8b5cf6' }
      ]
    }
  };

  const monthlyData = [
    { month: 'Oct 2025', approved: 12.50, unapproved: 43.50, cost: 258.75 },
    { month: 'Nov 2025', approved: 18.00, unapproved: 39.00, cost: 312.40 },
    { month: 'Dec 2025', approved: 22.50, unapproved: 48.00, cost: 386.20 },
    { month: 'Jan 2026', approved: 27.00, unapproved: 51.00, cost: 428.90 },
    { month: 'Feb 2026', approved: 24.00, unapproved: 44.50, cost: 401.35 },
    { month: 'Mar 2026', approved: 31.50, unapproved: 46.50, cost: 472.80 },
    { month: 'Apr 2026', approved: 36.00, unapproved: 52.00, cost: 538.60 },
    { month: 'May 2026', approved: 28.50, unapproved: 40.50, cost: 436.25 },
    { month: 'Jun 2026', approved: 42.00, unapproved: 54.00, cost: 612.40 },
    { month: 'Jul 2026', approved: 34.50, unapproved: 47.50, cost: 526.10 },
    { month: 'Aug 2026', approved: 39.00, unapproved: 50.00, cost: 589.35 },
    { month: 'Sep 2026', approved: 37.50, unapproved: 135.50, cost: 773.86 }
  ];

  const viewIds = {
    list: 'dailyOtListView',
    chart: 'dailyOtChartView',
    trend: 'dailyOtTrendView',
    detail: 'dailyOtTrendDetailView'
  };
  const titles = {
    list: 'Daily OT',
    chart: 'Daily OT Analysis',
    trend: 'Daily OT Trend Analysis',
    detail: 'Daily OT Analysis'
  };
  let currentView = 'list';
  let analysisSelection = {
    period: monthlyData[0].month,
    approved: monthlyData[0].approved,
    unapproved: monthlyData[0].unapproved,
    total: monthlyData[0].approved + monthlyData[0].unapproved
  };

  function renderChart(metricKey = 'status') {
    const dataset = chartData[metricKey] || chartData.status;
    const total = dataset.items.reduce((sum, item) => sum + item.value, 0);
    const circumference = 2 * Math.PI * 70;
    const title = document.getElementById('dailyOtChartTitle');
    const totalElement = document.getElementById('dailyOtChartTotal');
    const note = document.getElementById('dailyOtChartNote');
    const head = document.getElementById('dailyOtChartLegendHead');
    const segments = document.getElementById('dailyOtDonutSegments');
    const legend = document.getElementById('dailyOtChartLegend');
    if (!title || !totalElement || !note || !head || !segments || !legend) return;

    title.textContent = dataset.title;
    totalElement.textContent = total.toFixed(2);
    note.textContent = dataset.note;
    head.firstElementChild.textContent = dataset.column;
    segments.replaceChildren();
    legend.replaceChildren();

    let offset = 0;
    dataset.items.forEach(item => {
      const ratio = total > 0 ? item.value / total : 0;
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '90');
      circle.setAttribute('cy', '90');
      circle.setAttribute('r', '70');
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', item.color);
      circle.setAttribute('stroke-width', '22');
      circle.setAttribute('stroke-dasharray', (ratio * circumference) + ' ' + circumference);
      circle.setAttribute('stroke-dashoffset', String(-offset * circumference));
      circle.setAttribute('stroke-linecap', 'butt');
      segments.appendChild(circle);
      offset += ratio;

      const row = document.createElement('div');
      row.className = 'daily-ot-chart-legend-row';
      const label = document.createElement('span');
      label.className = 'daily-ot-legend-label';
      const dot = document.createElement('span');
      dot.className = 'daily-ot-legend-dot';
      dot.style.backgroundColor = item.color;
      const text = document.createElement('span');
      text.textContent = item.label;
      label.append(dot, text);
      const value = document.createElement('span');
      value.textContent = item.value.toFixed(2);
      const percentage = document.createElement('span');
      percentage.textContent = (ratio * 100).toFixed(2) + '%';
      row.append(label, value, percentage);
      legend.appendChild(row);
    });
  }

  function renderTrendBars() {
    const container = document.getElementById('dailyOtTrendBars');
    const totalElement = document.getElementById('dailyOtTrendTotal');
    if (!container || !totalElement) return;

    const totals = monthlyData.map(item => item.approved + item.unapproved);
    const maximum = Math.max.apply(null, totals);
    totalElement.textContent = totals.reduce((sum, value) => sum + value, 0).toFixed(2);
    container.replaceChildren();

    monthlyData.forEach((item, index) => {
      const total = item.approved + item.unapproved;
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'daily-ot-trend-row';
      row.setAttribute('aria-label', 'View ' + item.month + ' OT details');

      const month = document.createElement('span');
      month.className = 'daily-ot-trend-month';
      month.textContent = item.month;

      const track = document.createElement('span');
      track.className = 'daily-ot-trend-track';
      const fill = document.createElement('span');
      fill.className = 'daily-ot-trend-fill';
      fill.style.width = Math.max(8, total / maximum * 100).toFixed(2) + '%';
      track.appendChild(fill);

      const value = document.createElement('span');
      value.className = 'daily-ot-trend-value';
      value.textContent = total.toFixed(2);

      row.append(month, track, value);
      row.addEventListener('click', () => openTrendAnalysis(index));
      container.appendChild(row);
    });
  }

  function getTrendAnalysisItems(metricKey) {
    if (metricKey === 'status') {
      return [
        { label: 'Approved OT', value: analysisSelection.approved, color: '#10b981' },
        { label: 'Unapproved OT', value: analysisSelection.unapproved, color: '#f59e0b' }
      ];
    }
    const dataset = chartData[metricKey] || chartData.status;
    const sourceTotal = dataset.items.reduce((sum, item) => sum + item.value, 0);
    return dataset.items.map(item => ({
      label: item.label,
      value: sourceTotal ? analysisSelection.total * item.value / sourceTotal : 0,
      color: item.color
    }));
  }

  function renderTrendAnalysis(metricKey = 'status') {
    const dataset = chartData[metricKey] || chartData.status;
    const items = getTrendAnalysisItems(metricKey);
    const title = document.getElementById('dailyOtAnalysisTitle');
    const subtitle = document.getElementById('dailyOtAnalysisSubtitle');
    const total = document.getElementById('dailyOtAnalysisTotal');
    const head = document.getElementById('dailyOtAnalysisLegendHead');
    const segments = document.getElementById('dailyOtAnalysisSegments');
    const legend = document.getElementById('dailyOtAnalysisLegend');
    if (!title || !subtitle || !total || !head || !segments || !legend) return;

    title.textContent = dataset.title;
    subtitle.textContent = 'As At ' + analysisSelection.period;
    total.textContent = analysisSelection.total.toFixed(2);
    head.firstElementChild.textContent = dataset.column;
    segments.replaceChildren();
    legend.replaceChildren();

    const circumference = 2 * Math.PI * 70;
    let offset = 0;
    items.forEach(item => {
      const ratio = analysisSelection.total ? item.value / analysisSelection.total : 0;
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '90');
      circle.setAttribute('cy', '90');
      circle.setAttribute('r', '70');
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', item.color);
      circle.setAttribute('stroke-width', '24');
      circle.setAttribute('stroke-dasharray', (ratio * circumference) + ' ' + circumference);
      circle.setAttribute('stroke-dashoffset', String(-offset * circumference));
      segments.appendChild(circle);
      offset += ratio;

      const row = document.createElement('div');
      row.className = 'daily-ot-chart-legend-row';
      const label = document.createElement('span');
      label.className = 'daily-ot-legend-label';
      const dot = document.createElement('span');
      dot.className = 'daily-ot-legend-dot';
      dot.style.backgroundColor = item.color;
      const text = document.createElement('span');
      text.textContent = item.label;
      label.append(dot, text);
      const value = document.createElement('span');
      value.textContent = item.value.toFixed(2);
      const percentage = document.createElement('span');
      percentage.textContent = (ratio * 100).toFixed(2) + '%';
      row.append(label, value, percentage);
      legend.appendChild(row);
    });
  }

  function openTrendAnalysis(index) {
    const item = monthlyData[index];
    if (!item) return;
    analysisSelection = {
      period: item.month,
      approved: item.approved,
      unapproved: item.unapproved,
      total: item.approved + item.unapproved
    };
    const select = document.getElementById('dailyOtAnalysisMetricSelect');
    if (select) select.value = 'status';
    renderTrendAnalysis('status');
    showDailyOtView('detail');
  }

  function openLatestDetail() {
    const totals = monthlyData.reduce((result, item) => ({
      approved: result.approved + item.approved,
      unapproved: result.unapproved + item.unapproved
    }), { approved: 0, unapproved: 0 });
    analysisSelection = {
      period: 'Oct 2025 \u2013 Sep 2026',
      approved: totals.approved,
      unapproved: totals.unapproved,
      total: totals.approved + totals.unapproved
    };
    const select = document.getElementById('dailyOtAnalysisMetricSelect');
    if (select) select.value = 'status';
    renderTrendAnalysis('status');
    showDailyOtView('detail');
  }

  function changeChartMetric(metricKey) {
    renderChart(metricKey);
  }

  function changeAnalysisMetric(metricKey) {
    renderTrendAnalysis(metricKey);
  }

  function showDailyOtView(viewName) {
    if (!viewIds[viewName]) return;
    currentView = viewName;
    Object.keys(viewIds).forEach(key => {
      const view = document.getElementById(viewIds[key]);
      if (view) view.hidden = key !== viewName;
    });
    const title = document.getElementById('dailyOtPageTitle');
    if (title) title.textContent = titles[viewName];
    if (viewName === 'chart') {
      const select = document.getElementById('dailyOtChartMetricSelect');
      renderChart(select ? select.value : 'status');
    }
    if (viewName === 'trend') renderTrendBars();
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.scrollTop = 0;
  }

  function handleDailyOtBack() {
    if (currentView === 'detail') {
      showDailyOtView('trend');
    } else if (currentView === 'trend') {
      showDailyOtView('chart');
    } else if (currentView === 'chart') {
      showDailyOtView('list');
    } else {
      window.history.back();
    }
  }

  window.showDailyOtView = showDailyOtView;
  window.handleDailyOtBack = handleDailyOtBack;
  window.changeDailyOtChartMetric = changeChartMetric;
  window.changeDailyOtAnalysisMetric = changeAnalysisMetric;
  window.openDailyOtLatestDetail = openLatestDetail;
  renderChart();
  renderTrendBars();
})();
