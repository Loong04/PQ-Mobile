const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

// Catches totals that use aggregate placeholders instead of the visible transactions,
// clock times replaced by shift ranges, and filters/chart scopes that lose their records.
async function inspect(browser, theme, width) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewport({ width, height: 950, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/clocking-summary.html')).href + `?theme=${theme}`, { waitUntil: 'networkidle0' });
  const summary = () => page.evaluate(() => ({
    records: document.getElementById('totalRecordsVal').textContent.trim(),
    count: document.getElementById('totalCountVal').textContent.trim(),
    rows: [...document.querySelectorAll('#summaryTableBody .summary-table-row')].map(row => row.textContent.replace(/\s+/g, ' ').trim())
  }));
  assert.deepEqual(await summary(), { records: '2', count: '6', rows: ['BENEFITS MANAGEMENT 4', 'BENEFITS MID VALLEY 2'] });
  assert.deepEqual(await page.$eval('#clockingDateSwitcher', node => ({
    date: node.querySelector('#clockingCurrentDate').textContent.trim(),
    centerTag: node.querySelector('.date-current-badge').tagName,
    hasCalendar: Boolean(node.querySelector('.fa-calendar-day')),
    previous: node.querySelector('[data-clocking-date-shift="-1"]')?.getAttribute('aria-label'),
    next: node.querySelector('[data-clocking-date-shift="1"]')?.getAttribute('aria-label'),
    beforeFilter: node.nextElementSibling?.id === 'filterBarContainer',
    cardRadius: getComputedStyle(node).borderRadius,
    cardPadding: getComputedStyle(node).padding,
    cardMarginBottom: getComputedStyle(node).marginBottom,
    centerFontSize: getComputedStyle(node.querySelector('.date-current-badge')).fontSize,
    centerFontWeight: getComputedStyle(node.querySelector('.date-current-badge')).fontWeight
  })), {
    date: '05 Oct 2026',
    centerTag: 'DIV',
    hasCalendar: true,
    previous: 'Previous Day',
    next: 'Next Day',
    beforeFilter: true,
    cardRadius: '18px',
    cardPadding: '6px 8px',
    cardMarginBottom: '12px',
    centerFontSize: '13.5px',
    centerFontWeight: '800'
  }, 'Clocking Summary must exactly match the Daily Manpower date switcher');
  assert.equal(await page.$eval('#filterSummaryText', node => node.textContent.trim()), '00:00 \u2013 23:59 \u2022 All Branches');
  assert.deepEqual(await page.$eval('#filterDateInput', node => ({
    type: node.type,
    value: node.value,
    siblingButtons: node.parentElement.querySelectorAll('button').length
  })), { type: 'date', value: '2026-10-05', siblingButtons: 0 }, 'The filter must use one normal date input without date arrows');
  await page.click('[data-clocking-date-shift="-1"]');
  assert.equal(await page.$eval('#clockingCurrentDate', node => node.textContent.trim()), '04 Oct 2026');
  assert.equal(await page.$eval('#filterDateInput', node => node.value), '2026-10-04');
  assert.deepEqual(await summary(), { records: '0', count: '0', rows: [] });
  await page.click('[data-clocking-date-shift="1"]');
  assert.equal(await page.$eval('#clockingCurrentDate', node => node.textContent.trim()), '05 Oct 2026');
  assert.deepEqual(await summary(), { records: '2', count: '6', rows: ['BENEFITS MANAGEMENT 4', 'BENEFITS MID VALLEY 2'] });
  assert.equal(await page.$eval('.main-content', node => node.scrollWidth <= node.clientWidth + 1), true);
  await page.screenshot({ path: path.resolve(__dirname, `clocking-summary-${theme}-${width}.png`) });

  await page.$eval('#summaryTableBody .attendance-report-pill', node => node.click());
  assert.notEqual(await page.$eval('#view-details', node => getComputedStyle(node).display), 'none');
  assert.equal(await page.$eval('#pageHeaderTitle', node => node.textContent.trim()), 'Clocking Summary Details');
  assert.equal(await page.$$('#detailsModal').then(nodes => nodes.length), 0, 'Count details must use a dedicated page instead of a pop-out');
  assert.equal(await page.$eval('#detailsRecordCount', node => node.textContent.trim()), 'Total Records: 4');
  assert.deepEqual(await page.$eval('.clocking-details-toolbar', toolbar => {
    const actions = toolbar.querySelector('.clocking-details-actions');
    const [chart, pdf, excel] = actions.querySelectorAll('button');
    const actionBox = actions.getBoundingClientRect();
    const chartBox = chart.getBoundingClientRect();
    const pdfBox = pdf.getBoundingClientRect();
    const excelBox = excel.getBoundingClientRect();
    return {
      labels: [chart, pdf, excel].map(button => button.textContent.trim()),
      display: getComputedStyle(actions).display,
      toolbarRadius: getComputedStyle(toolbar).borderRadius,
      toolbarBorder: getComputedStyle(toolbar).borderTopWidth,
      chartFullWidth: Math.abs(chartBox.width - actionBox.width) < 2,
      exportsShareRow: Math.abs(pdfBox.top - excelBox.top) < 2,
      chartAboveExports: chartBox.bottom < pdfBox.top
    };
  }), {
    labels: ['View Chart', 'PDF', 'Excel'],
    display: 'grid',
    toolbarRadius: '16px',
    toolbarBorder: '1px',
    chartFullWidth: true,
    exportsShareRow: true,
    chartAboveExports: true
  }, 'Clocking details must use a spacious two-level action panel');
  assert.deepEqual(await page.$$eval('#detailsListContainer .staff-clock-card', nodes => nodes.map(node => ({
    name: node.querySelector('.staff-name-text').textContent.trim(),
    id: node.querySelector('.staff-name-text').nextElementSibling.textContent.trim(),
    time: node.querySelector('.clocking-record-time').textContent.trim(),
    type: node.querySelector('.clocking-record-type').textContent.trim(),
    mode: node.querySelector('.clocking-record-mode').textContent.trim()
  }))), [
    { name: 'Asmawi idris', id: '#EBB15', time: '08:18', type: 'Clock In', mode: 'Manual Input (People HR)' },
    { name: 'Asmawi idris', id: '#EBB15', time: '19:53', type: 'Clock Out', mode: 'Manual Input (People HR)' },
    { name: 'Natasha thean mei hoi', id: '#A0001', time: '07:58', type: 'Clock In', mode: 'Manual Input (People HR)' },
    { name: 'Natasha thean mei hoi', id: '#A0001', time: '18:47', type: 'Clock Out', mode: 'Manual Input (People HR)' }
  ]);
  assert.deepEqual(await page.$$eval('#detailsListContainer .clocking-record-location-field', nodes => nodes.map(node => ({
    employee: node.closest('.staff-clock-card').querySelector('.staff-name-text').textContent.trim(),
    location: node.querySelector('.clocking-record-location').textContent.trim(),
    mapButton: node.querySelector('.clocking-map-btn').textContent.trim(),
    hasIconTile: Boolean(node.querySelector('.clocking-record-location-icon')),
    hasFullscreenIcon: Boolean(node.querySelector('.clocking-map-btn .fa-expand')),
    mapButtonFullWidth: Math.abs(node.querySelector('.clocking-map-btn').getBoundingClientRect().width - (node.clientWidth - 22)) < 2,
    mapButtonHeight: getComputedStyle(node.querySelector('.clocking-map-btn')).height,
    mapButtonHasFill: getComputedStyle(node.querySelector('.clocking-map-btn')).backgroundImage !== 'none'
  }))), [{
    employee: 'Natasha thean mei hoi',
    location: 'Times Square Office, Kuala Lumpur',
    mapButton: 'View Map',
    hasIconTile: true,
    hasFullscreenIcon: true,
    mapButtonFullWidth: true,
    mapButtonHeight: '40px',
    mapButtonHasFill: true
  }], 'Only the located record may show the richer full-width map action');
  await page.click('#detailsListContainer .clocking-map-btn');
  assert.notEqual(await page.$eval('#view-map', node => getComputedStyle(node).display), 'none');
  assert.equal(await page.$eval('#pageHeaderTitle', node => node.textContent.trim()), 'Location Map');
  assert.equal(await page.$eval('#clockingMapAddress', node => node.textContent.trim()), 'Times Square Office, Kuala Lumpur');
  assert.equal(await page.$eval('#view-map', node => node.textContent.includes('Example Map')), false);
  assert.equal(await page.$eval('#clockingFullMap', node => node.querySelectorAll('iframe, a[href^="http"]').length), 0);
  assert.equal(await page.$eval('#clockingFullMap', node => node.getBoundingClientRect().height >= document.querySelector('.main-content').clientHeight - 2), true);
  await page.click('.header-btn-icon');
  assert.notEqual(await page.$eval('#view-details', node => getComputedStyle(node).display), 'none');
  assert.equal(await page.$eval('#detailsListContainer', node => node.scrollWidth <= node.clientWidth + 1), true);
  // Capture the generated document at the browser download boundary.
  await page.evaluate(() => {
    const original = URL.createObjectURL;
    URL.createObjectURL = function(blob) { window.clockingExportBlob = blob; return original.call(this, blob); };
    window.print = () => { window.clockingPrintRequested = true; };
  });
  await page.$eval('#clockingExportExcel', node => node.click());
  const exported = await page.evaluate(async () => new DOMParser().parseFromString(await window.clockingExportBlob.text(), 'application/xml').getElementsByTagName('Row').length);
  assert.equal(exported, 5, 'Excel exports the header and the four selected records');
  await page.$eval('#clockingExportPdf', node => node.click());
  assert.equal(await page.evaluate(() => window.clockingPrintRequested), true);
  assert.deepEqual(await page.$$eval('.clocking-print-report tbody tr', nodes => nodes.map(node => node.children[3].textContent)), ['08:18', '19:53', '07:58', '18:47']);
  await new Promise(resolve => setTimeout(resolve, 300));
  await page.screenshot({ path: path.resolve(__dirname, `clocking-details-${theme}-${width}.png`) });
  await page.click('#view-details .view-chart-btn');
  assert.equal(await page.$eval('#summaryCenterTotal', node => node.textContent.trim()), '4');
  await page.click('.header-btn-icon');
  assert.notEqual(await page.$eval('#view-details', node => getComputedStyle(node).display), 'none');
  await page.click('.header-btn-icon');
  assert.notEqual(await page.$eval('#view-summary', node => getComputedStyle(node).display), 'none');

  await page.click('#view-summary .view-chart-btn');
  assert.equal(await page.$eval('#summaryCenterTotal', node => node.textContent.trim()), '6');
  await page.select('#clockingBreakdownSelect', 'costCenter');
  assert.deepEqual(await page.$$eval('#summaryChartLegendGrid .attendance-report-legend-row', nodes => nodes.map(node => [...node.children].map(cell => cell.textContent.trim()))), [['MANAGEMENT', '4', '66.7%'], ['MID VALLEY', '2', '33.3%']]);
  assert.equal(await page.$$eval('#view-chart > section', nodes => nodes.length), 3);
  assert.equal(await page.$$eval('button', nodes => nodes.some(node => /View Trend/.test(node.textContent))), false);
  await page.screenshot({ path: path.resolve(__dirname, `clocking-chart-${theme}-${width}.png`) });
  await page.click('#summaryChartLegendGrid .attendance-report-legend-row');
  assert.notEqual(await page.$eval('#view-details', node => getComputedStyle(node).display), 'none');
  assert.equal(await page.$$eval('#detailsListContainer .staff-clock-card', nodes => nodes.length), 4);
  await page.click('.header-btn-icon');
  assert.notEqual(await page.$eval('#view-chart', node => getComputedStyle(node).display), 'none');
  await page.click('.header-btn-icon');

  async function filter(values) {
    await page.click('.filter-trigger-btn');
    await page.waitForSelector('#filterModal.active');
    await page.evaluate(values => {
      for (const [id, value] of Object.entries(values)) document.getElementById(id).value = value;
    }, values);
    await page.$eval('.form-apply-btn', node => node.click());
    await page.waitForSelector('#filterModal', { hidden: true });
  }
  await filter({ filterClockTypeSelect: 'Clock Out' });
  assert.deepEqual(await summary(), { records: '2', count: '3', rows: ['BENEFITS MANAGEMENT 2', 'BENEFITS MID VALLEY 1'] });
  await page.$eval('#summaryTableBody .attendance-report-pill', node => node.click());
  assert.notEqual(await page.$eval('#view-details', node => getComputedStyle(node).display), 'none');
  assert.deepEqual(await page.$$eval('.clocking-record-time', nodes => nodes.map(node => node.textContent.trim())), ['19:53', '18:47']);
  await page.click('.header-btn-icon');

  await filter({ filterClockTypeSelect: 'all', filterStartTimeInput: '18:00', filterEndTimeInput: '23:59' });
  assert.equal((await summary()).count, '2');
  await filter({ filterStartTimeInput: '00:00', filterZoneSelect: 'MID VALLEY OFFICE', filterRadiusInput: '25' });
  assert.deepEqual(await summary(), { records: '1', count: '1', rows: ['BENEFITS MID VALLEY 1'] });
  await filter({ filterDateInput: '2026-10-06', filterZoneSelect: 'all', filterRadiusInput: '0' });
  assert.deepEqual(await summary(), { records: '0', count: '0', rows: [] });
  await page.click('#view-summary .view-chart-btn');
  assert.equal(await page.$eval('#summaryCenterTotal', node => node.textContent.trim()), '0');
  assert.equal(await page.$$eval('#summaryDonutCircles circle', nodes => nodes.length), 0);
  await page.click('.header-btn-icon');
  await page.click('.filter-trigger-btn');
  await page.waitForSelector('#filterModal.active');
  await page.evaluate(() => { document.getElementById('filterStartTimeInput').value = '20:00'; document.getElementById('filterEndTimeInput').value = '08:00'; });
  await page.$eval('.form-apply-btn', node => node.click());
  assert.equal(await page.$eval('#filterModal', node => node.classList.contains('active')), true, 'invalid time range must not apply');
  await page.$eval('.filter-reset-btn', node => node.click());
  await page.waitForSelector('#filterModal', { hidden: true });
  assert.equal((await summary()).count, '6');
  assert.deepEqual(errors, []);
  await page.close();
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  try {
    for (const theme of ['light', 'dark']) for (const width of [360, 420]) await inspect(browser, theme, width);
    console.log('PASS: Clocking summary, count details, scoped charts, filters and empty states in light/dark at 360/420px.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
