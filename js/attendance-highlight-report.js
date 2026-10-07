/* Data adapters retain each report's original records and filtering rules. */
window.createAttendanceReport = function (config) {
  const content = document.querySelector('.main-content');
  const chart = document.createElement('div');
  chart.className = 'attendance-report-chart';
  chart.hidden = true;
  chart.innerHTML = `<section class="attendance-report-breakdown"><label for="attendanceReportBreakdown">BREAKDOWN BY</label><select id="attendanceReportBreakdown"></select></section>
    <section class="attendance-report-chart-card"><h3></h3><p></p><div class="attendance-report-donut"><svg viewBox="0 0 180 180" role="img"><circle cx="90" cy="90" r="70" fill="none" stroke="var(--border-subtle)" stroke-width="22"></circle><g></g></svg><div class="attendance-report-donut-center"><strong data-report-total></strong><small></small></div></div><div class="attendance-report-note"></div></section>
    <section class="attendance-report-legend"><div class="attendance-report-legend-head"><span></span><span>RECORDS</span><span>% OF TOTAL</span></div><div class="attendance-report-legend-rows"></div><div class="attendance-report-view-all"><button type="button"></button></div></section>`;
  const drilldown = document.createElement('div');
  drilldown.className = 'attendance-report-drilldown';
  drilldown.hidden = true;
  content.append(chart, drilldown);
  const select = chart.querySelector('select');
  config.dimensions.forEach(dimension => select.add(new Option(dimension.label, dimension.key)));
  const colors = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6'];
  let view = 'report', showAll = false;
  const title = document.getElementById('headerTitle');
  const mainTitle = title.textContent;
  function show(next, heading) {
    view = next;
    config.report.hidden = next !== 'report';
    chart.hidden = next !== 'chart';
    drilldown.hidden = next !== 'details';
    title.textContent = heading;
    content.scrollTop = 0;
  }
  function render() {
    const dimension = config.dimensions.find(item => item.key === select.value);
    const grouped = new Map();
    config.entries().forEach(entry => {
      const label = String(dimension.value(entry) || 'Unspecified');
      grouped.set(label, (grouped.get(label) || 0) + entry.weight);
    });
    const items = [...grouped].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
    const total = items.reduce((sum, item) => sum + item.value, 0);
    chart.dataset.total = total;
    chart.querySelector('h3').textContent = `${config.metric} by ${dimension.label.toLowerCase()}`;
    chart.querySelector('p').textContent = config.description;
    chart.querySelector('[data-report-total]').textContent = total;
    chart.querySelector('.attendance-report-donut-center small').textContent = config.totalLabel;
    chart.querySelector('svg').setAttribute('aria-label', `${total} ${config.totalLabel}`);
    chart.querySelector('.attendance-report-note').textContent = total ? 'Select a category below to view its records' : 'No records match the current filter';
    const group = chart.querySelector('svg g');
    group.replaceChildren();
    let offset = 0;
    const circumference = 2 * Math.PI * 70;
    items.forEach((item, index) => {
      if (!item.value || !total) return;
      const arc = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      const length = item.value / total * circumference;
      Object.entries({ cx: 90, cy: 90, r: 70, fill: 'none', stroke: colors[index % colors.length], 'stroke-width': 22, 'stroke-dasharray': `${length} ${circumference - length}`, 'stroke-dashoffset': -offset }).forEach(([key, value]) => arc.setAttribute(key, value));
      group.append(arc);
      offset += length;
    });
    chart.querySelector('.attendance-report-legend-head span').textContent = dimension.label.toUpperCase();
    const rows = chart.querySelector('.attendance-report-legend-rows');
    rows.replaceChildren();
    (showAll ? items : items.slice(0, 5)).forEach((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'attendance-report-legend-row';
      button.dataset.chartValue = item.value;
      button.dataset.chartCategory = item.label;
      const label = document.createElement('span');
      label.className = 'attendance-report-legend-label';
      const dot = document.createElement('i');
      dot.className = 'attendance-report-dot';
      dot.style.background = colors[index % colors.length];
      label.append(dot, document.createTextNode(item.label));
      const value = document.createElement('span'); value.textContent = item.value;
      const percent = document.createElement('span'); percent.textContent = `${total ? (item.value / total * 100).toFixed(1) : '0.0'}%`;
      button.append(label, value, percent);
      button.addEventListener('click', () => {
        config.details(drilldown, config.entries().filter(entry => String(dimension.value(entry) || 'Unspecified') === item.label));
        show('details', `${dimension.label} Details`);
      });
      rows.append(button);
    });
    const footer = chart.querySelector('.attendance-report-view-all');
    footer.hidden = items.length <= 5;
    footer.querySelector('button').textContent = showAll ? 'Show top 5' : `View all ${dimension.label.toLowerCase()} categories`;
  }
  select.addEventListener('change', () => { showAll = false; render(); });
  chart.querySelector('.attendance-report-view-all button').addEventListener('click', () => { showAll = !showAll; render(); });
  return {
    open() { showAll = false; render(); show('chart', config.title); },
    back() {
      if (view === 'details') { show('chart', config.title); return true; }
      if (view === 'chart') { show('report', mainTitle); return true; }
      return false;
    }
  };
};
