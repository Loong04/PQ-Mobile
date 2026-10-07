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
  assert.equal(await page.$eval('.main-content', node => node.scrollWidth <= node.clientWidth + 1), true);
  await page.screenshot({ path: path.resolve(__dirname, `clocking-summary-${theme}-${width}.png`) });

  await page.$eval('#summaryTableBody .attendance-report-pill', node => node.click());
  await page.waitForSelector('#detailsModal.active');
  assert.equal(await page.$eval('#modalRecordCount', node => node.textContent.trim()), '4 Records');
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
  await page.click('#detailsModal .view-chart-btn');
  await page.waitForSelector('#detailsModal', { hidden: true });
  assert.equal(await page.$eval('#summaryCenterTotal', node => node.textContent.trim()), '4');
  await page.click('.header-btn-icon');
  await page.waitForSelector('#detailsModal.active');
  await page.click('#detailsModal .popout-close-btn');
  await page.waitForSelector('#detailsModal', { hidden: true });

  await page.click('#view-summary .view-chart-btn');
  assert.equal(await page.$eval('#summaryCenterTotal', node => node.textContent.trim()), '6');
  await page.select('#clockingBreakdownSelect', 'costCenter');
  assert.deepEqual(await page.$$eval('#summaryChartLegendGrid .attendance-report-legend-row', nodes => nodes.map(node => [...node.children].map(cell => cell.textContent.trim()))), [['MANAGEMENT', '4', '66.7%'], ['MID VALLEY', '2', '33.3%']]);
  assert.equal(await page.$$eval('#view-chart > section', nodes => nodes.length), 3);
  assert.equal(await page.$$eval('button', nodes => nodes.some(node => /View Trend/.test(node.textContent))), false);
  await page.screenshot({ path: path.resolve(__dirname, `clocking-chart-${theme}-${width}.png`) });
  await page.click('#summaryChartLegendGrid .attendance-report-legend-row');
  await page.waitForSelector('#detailsModal.active');
  assert.equal(await page.$$eval('#detailsListContainer .staff-clock-card', nodes => nodes.length), 4);
  await page.keyboard.press('Escape');
  await page.waitForSelector('#detailsModal', { hidden: true });
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
  await page.waitForSelector('#detailsModal.active');
  assert.deepEqual(await page.$$eval('.clocking-record-time', nodes => nodes.map(node => node.textContent.trim())), ['19:53', '18:47']);
  await page.keyboard.press('Escape');
  await page.waitForSelector('#detailsModal', { hidden: true });

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
