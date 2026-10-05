const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
const url = pathToFileURL(path.resolve(__dirname, '../modules/employee-career/options/team/manpower-stats.html')).href;

// Catch mismatched chart totals, ignored organization filters, and date boundary errors.
const fixture = [
  { company: 'Alpha', branch: 'HQ', department: 'Finance', jobType: 'ACCOUNT EXECUTIVE', headcount: 4, effectiveFrom: '2026-10-01' },
  { company: 'Alpha', branch: 'North', department: 'Finance', jobType: 'ACCOUNT EXECUTIVE', headcount: 2, effectiveFrom: '2026-10-05' },
  { company: 'Beta', branch: 'HQ', department: 'Administration', jobType: 'ADMIN MANAGER', headcount: 3, effectiveFrom: '2026-09-01', effectiveTo: '2026-10-04' },
  { company: 'Beta', branch: 'South', department: 'Operations', jobType: 'TECHNICIAN', headcount: 7, effectiveFrom: '2026-10-05' }
];

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const table = () => page.$$eval('#manpowerTable tbody tr', rows => rows.map(row => [...row.cells].map(cell => cell.textContent)));
    const apply = async values => {
      await page.click('#manpowerFilterTrigger');
      for (const [id, value] of Object.entries(values)) {
        await page.$eval('#' + id, (element, next) => { element.value = next; element.dispatchEvent(new Event('change', { bubbles: true })); }, value);
      }
      await page.click('#manpowerApplyFilter');
    };
    for (const theme of ['dark', 'light']) {
      await page.setViewport({ width: 390, height: 950 });
      await page.goto(url + '?theme=' + theme, { waitUntil: 'load' });
      assert.equal(await page.$eval('#manpowerTotalRecords', n => n.textContent), '34');
      assert.equal(await page.$eval('#manpowerTotalHeadcount', n => n.textContent), '282');
      assert.deepEqual((await table()).slice(0, 6), [
        ['ACCOUNT EXECUTIVE', '48'], ['ACCOUNT MANAGER', '12'], ['ADMIN EXECUTIVE', '17'],
        ['ADMIN MANAGER', '10'], ['BANK TELLER OFFICER', '10'], ['BARISTA', '12']
      ]);
      await page.screenshot({ path: path.join(__dirname, 'employee_career_manpower_statistics_' + theme + '.png') });
      await page.click('#manpowerViewChart');
      assert.equal(await page.$eval('#manpowerChartTotal', n => n.textContent), '282');
      assert.equal(await page.$$eval('#manpowerChartLegend [data-count]', nodes => nodes.reduce((total, n) => total + Number(n.dataset.count), 0)), 282);
      assert.equal(await page.$$eval('#manpowerChartLegend .staff-list-legend-row', nodes => nodes.length), 6);
      await page.screenshot({ path: path.join(__dirname, 'employee_career_manpower_statistics_chart_' + theme + '.png') });
      await page.click('#manpowerChartViewAll');
      assert.equal(await page.$$eval('#manpowerChartLegend .staff-list-legend-row', nodes => nodes.length), 34);
      assert.equal(await page.$$eval('#manpowerChartLegend [data-count]', nodes => nodes.reduce((total, n) => total + Number(n.dataset.count), 0)), 282);
      for (const width of [360, 390, 420]) {
        await page.setViewport({ width, height: 950 });
        assert.ok(await page.$eval('main', n => n.scrollWidth <= n.clientWidth + 1));
      }
      await page.click('#manpowerBack');
      assert.ok(await page.$eval('#manpowerTableView', n => !n.hidden));
      assert.ok(!(await page.$eval('main', n => n.textContent)).includes('View Trend'));
      for (const width of [360, 390, 420]) {
        await page.setViewport({ width, height: 950 });
        assert.ok(await page.$eval('main', n => n.scrollWidth <= n.clientWidth + 1));
        assert.ok(await page.$eval('#manpowerTable th:last-child', n => n.scrollWidth <= n.clientWidth + 1), 'Headcount heading fits');
      }
      await page.setViewport({ width: 390, height: 950 });
      await page.click('#manpowerFilterTrigger');
      assert.equal(await page.$$eval('#manpowerFilterForm label', nodes => nodes.length), 6);
      await page.screenshot({ path: path.join(__dirname, 'employee_career_manpower_statistics_filter_' + theme + '.png') });
      await page.$eval('#manpowerApplyFilter', n => n.focus());
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'manpowerResetFilter');
      await page.$eval('#manpowerEffectiveDate', n => { n.value = ''; });
      await page.click('#manpowerApplyFilter');
      assert.ok(await page.$eval('#manpowerFilterOverlay', n => !n.hidden));
      await page.keyboard.press('Escape');
      assert.equal(await page.$eval('main', n => n.inert), false);
    }
    await page.evaluateOnNewDocument(records => { window.MANPOWER_STATISTICS_DATA = records; }, fixture);
    await page.goto(url, { waitUntil: 'load' });
    assert.deepEqual(await table(), [['ACCOUNT EXECUTIVE', '6'], ['TECHNICIAN', '7']]);
    assert.equal(await page.$eval('#manpowerTotalHeadcount', n => n.textContent), '13');
    await page.click('#manpowerViewChart');
    await page.select('#manpowerChartMetric', 'branch');
    assert.deepEqual(await page.$$eval('#manpowerChartLegend .staff-list-legend-row', rows => rows.map(row => [row.querySelector('.staff-list-legend-name span').textContent, row.querySelector('strong').textContent])), [['South', '7'], ['HQ', '4'], ['North', '2']]);
    await page.click('#manpowerBack');
    await apply({ manpowerCompany: 'Alpha', manpowerBranch: 'North', manpowerDepartment: 'Finance' });
    assert.deepEqual(await table(), [['ACCOUNT EXECUTIVE', '2']]);
    await page.click('#manpowerViewChart');
    assert.equal(await page.$eval('#manpowerChartTotal', n => n.textContent), '2');
    await page.click('#manpowerBack');
    await page.click('#manpowerFilterTrigger');
    await page.click('#manpowerResetFilter');
    assert.equal(await page.$eval('#manpowerTotalHeadcount', n => n.textContent), '13');
    await apply({ manpowerSummaryBy: 'company' });
    assert.deepEqual(await table(), [['Alpha', '6'], ['Beta', '7']]);
    await apply({ manpowerSummaryBy: 'jobType', manpowerEffectiveDate: '2026-10-04' });
    assert.deepEqual(await table(), [['ACCOUNT EXECUTIVE', '4'], ['ADMIN MANAGER', '3']]);
    assert.equal(await page.$eval('#manpowerTotalHeadcount', n => n.textContent), '7');
    await apply({ manpowerEffectiveDate: '2026-08-31' });
    assert.deepEqual(await table(), []);
    assert.equal(await page.$eval('#manpowerTotalHeadcount', n => n.textContent), '0');
    assert.ok(await page.$eval('#manpowerEmpty', n => !n.hidden));
    await page.click('#manpowerViewChart');
    assert.equal(await page.$$eval('#manpowerChartSegments circle', nodes => nodes.length), 0);
    assert.ok(await page.$eval('#manpowerChartNote', n => n.textContent.includes('No records')));
    assert.deepEqual(errors, []);
    console.log('PASS: Manpower table, 34/282 sample, organization filters, inclusive effective dates, grouping, chart conservation, empty state, navigation, themes and mobile widths.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
