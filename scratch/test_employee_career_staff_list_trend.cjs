const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
const url = pathToFileURL(path.resolve(__dirname, '../modules/employee-career/options/team/staff-list.html')).href;

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const apply = async values => {
      await page.click('#staffListFilterTrigger');
      await page.evaluate(values => {
        for (const [id, value] of Object.entries(values)) document.getElementById(id).value = value;
      }, values);
      await page.click('#staffListApplyFilter');
    };
    for (const theme of ['dark', 'light']) {
      await page.goto(url + '?theme=' + theme, { waitUntil: 'networkidle0' });
      await apply({ staffListFilterAsAt: '2026-10-06' });
      for (const width of [360, 390, 450]) {
        await page.setViewport({ width, height: 950 });
        await page.click('#staffListViewChart');
        assert.ok(await page.$('#staffListViewTrend'), 'Staff List chart needs a View Trend action');
        await page.select('#staffListChartMetric', 'department');
        await page.click('#staffListViewTrend');
        assert.equal(await page.$eval('#staffListTrendView', n => n.hidden), false);
        assert.equal(await page.$eval('#staffListChartView', n => n.hidden), true);
        assert.deepEqual(await page.$$eval('[data-staff-month]', nodes => nodes.map(n => [n.dataset.staffMonth, Number(n.dataset.count)])),
          [['2025-11', 9], ['2025-12', 9], ['2026-01', 10], ['2026-02', 11], ['2026-03', 12], ['2026-04', 12], ['2026-05', 12], ['2026-06', 12], ['2026-07', 12], ['2026-08', 12], ['2026-09', 12], ['2026-10', 12]]);
        assert.equal(await page.$eval('#staffListTrendTotalCount', n => n.textContent), '12');
        assert.ok(await page.$eval('main', n => n.scrollWidth <= n.clientWidth + 1));
        if (width === 390) await page.screenshot({ path: path.join(__dirname, `employee_career_staff_list_trend_${theme}.png`) });
        await page.click('[data-staff-month="2025-12"] .staff-list-bar-fill');
        assert.equal(await page.$eval('#staffListAnalysisView', n => n.hidden), false);
        assert.equal(await page.$eval('#staffListAnalysisPeriod', n => n.textContent), 'As At 31 Dec 2025');
        assert.equal(await page.$eval('#staffListAnalysisChartTotal', n => n.textContent), '9');
        if (width === 390) await page.screenshot({ path: path.join(__dirname, `employee_career_staff_list_month_analysis_${theme}.png`) });
        for (const metric of ['branch', 'department', 'position', 'age', 'yos']) {
          await page.select('#staffListAnalysisChartMetric', metric);
          assert.equal(await page.$$eval('#staffListAnalysisChartSegments circle', nodes => nodes.reduce((sum, n) => sum + Number(n.dataset.count), 0)), 9);
        }
        await page.select('#staffListAnalysisChartMetric', 'age');
        assert.equal(await page.$$eval('#staffListAnalysisChartLegend .staff-list-legend-row', nodes =>
          Number(nodes.find(n => n.querySelector('.staff-list-legend-name span').textContent === 'Under 30').querySelector('strong').textContent)), 3,
          'Age groups must use the selected month, not the current As At date');
        await page.select('#staffListAnalysisChartMetric', 'branch');
        await page.click('#staffListAnalysisChartViewAll');
        assert.equal(await page.$eval('#staffListAnalysisChartViewAll', n => n.getAttribute('aria-expanded')), 'true');
        assert.equal(await page.$$eval('#staffListAnalysisChartLegend [data-count]', nodes => nodes.reduce((sum, n) => sum + Number(n.dataset.count), 0)), 9);
        assert.ok(await page.$eval('main', n => n.scrollWidth <= n.clientWidth + 1));
        await page.click('#staffListBack');
        assert.equal(await page.evaluate(() => document.activeElement.dataset.staffMonth), '2025-12');
        await page.keyboard.press('Enter');
        assert.equal(await page.$eval('#staffListAnalysisChartTotal', n => n.textContent), '9');
        await page.click('#staffListBack');
        await page.click('#staffListTrendTotal');
        assert.equal(await page.$eval('#staffListAnalysisChartTotal', n => n.textContent), '12');
        assert.equal(await page.$eval('#staffListAnalysisPeriod', n => n.textContent), 'As At 06 Oct 2026');
        await page.click('#staffListBack');
        assert.equal(await page.evaluate(() => document.activeElement.id), 'staffListTrendTotal');
        await page.click('#staffListBack');
        assert.equal(await page.$eval('#staffListChartMetric', n => n.value), 'department');
        assert.equal(await page.evaluate(() => document.activeElement.id), 'staffListViewTrend');
        await page.click('#staffListBack');
        assert.equal(await page.$eval('#staffListTableView', n => n.hidden), false);
      }
      await apply({ staffListFilterKeyword: '#EBB02', staffListFilterBranch: 'HEADQUARTERS (HQ)' });
      await page.click('#staffListViewChart'); await page.click('#staffListViewTrend');
      assert.deepEqual(await page.$$eval('[data-staff-month]', nodes => nodes.map(n => Number(n.dataset.count))), [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
      await page.click('[data-staff-month="2026-01"]');
      assert.equal(await page.$eval('#staffListAnalysisChartTotal', n => n.textContent), '0');
      assert.equal(await page.$$eval('#staffListAnalysisChartSegments circle', nodes => nodes.length), 0);
      await page.click('#staffListBack'); await page.click('#staffListBack'); await page.click('#staffListBack');
      await apply({ staffListFilterKeyword: '', staffListFilterBranch: '', staffListFilterAsAt: '2026-02-01' });
      await page.click('#staffListViewChart'); await page.click('#staffListViewTrend');
      assert.equal(await page.$eval('[data-staff-month="2026-02"]', n => n.dataset.count), '10', 'The final month must stop at the selected As At date');
      await page.click('[data-staff-month="2026-02"]');
      assert.equal(await page.$eval('#staffListAnalysisChartTotal', n => n.textContent), '10');
      assert.equal(await page.$eval('#staffListAnalysisPeriod', n => n.textContent), 'As At 01 Feb 2026');
      await page.click('#staffListBack'); await page.click('#staffListBack'); await page.click('#staffListBack');
      await apply({ staffListFilterKeyword: 'no matching staff' });
      await page.click('#staffListViewChart'); await page.click('#staffListViewTrend');
      assert.ok(await page.$$eval('[data-staff-month]', nodes => nodes.length === 12 && nodes.every(n => n.dataset.count === '0')));
    }
    assert.deepEqual(errors, []);
    console.log('PASS: Staff List chart → 12-month trend → monthly breakdown, all five metrics, View All, filter consistency, historic ages, partial months, zero counts, keyboard/back navigation, both themes and three widths.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
