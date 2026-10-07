const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const url = file => pathToFileURL(path.join(root, file)).href;

async function inspectPage(browser, config, theme, width) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewport({ width, height: 950, deviceScaleFactor: 1 });
  await page.goto(`${url(config.file)}?theme=${theme}`, { waitUntil: 'networkidle0' });

  assert.equal(await page.$eval('html', node => node.dataset.theme), theme);
  assert.equal(await page.$$eval('.highlight-report-view', nodes => nodes.length), 1);
  assert.equal(await page.$$eval('.highlight-filter-card', nodes => nodes.length), 1);
  assert.equal(await page.$$eval('.highlight-summary-card', nodes => nodes.length), 1);
  assert.equal(await page.$$eval('.highlight-table-card', nodes => nodes.length), 1);
  assert.deepEqual(await page.$eval('.view-chart-btn', button => ({
    text: button.textContent.replace(/\s+/g, ' ').trim(),
    icon: button.querySelector('i')?.classList.contains('fa-chart-pie'),
    whiteSpace: getComputedStyle(button).whiteSpace
  })), { text: 'View Chart', icon: true, whiteSpace: 'nowrap' });

  const summary = await page.evaluate(config.readSummary);
  assert.deepEqual(summary, config.expectedSummary);
  assert.equal(await page.$eval('.main-content', node => node.scrollWidth <= node.clientWidth + 1), true);

  await page.click('.view-chart-btn');
  assert.equal(await page.$eval('.highlight-report-view', node => getComputedStyle(node).display), 'none');
  assert.notEqual(await page.$eval('.highlight-chart-view', node => getComputedStyle(node).display), 'none');
  assert.equal(await page.$$eval('.highlight-chart-view > .highlight-analysis-card', nodes => nodes.length), 3);
  assert.equal(await page.$$eval('.highlight-chart-view .highlight-breakdown-select', nodes => nodes.length), 1);
  assert.equal(await page.$$eval('.highlight-chart-view svg', nodes => nodes.length), 1);
  assert.equal(await page.$$eval('.highlight-chart-view .highlight-legend-grid', nodes => nodes.length), 1);
  assert.equal(await page.$eval('.highlight-chart-view', node => node.scrollWidth <= node.clientWidth + 1), true);
  assert.equal(await page.$$eval('#hoursCostingChartModal', nodes => nodes.length), 0);

  await page.click('.header-btn-icon');
  assert.notEqual(await page.$eval('.highlight-report-view', node => getComputedStyle(node).display), 'none');
  assert.equal(errors.length, 0, errors.join('\n'));
  await page.close();
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--allow-file-access-from-files']
  });

  try {
    const pages = [
      {
        file: 'modules/attendance/options/hours-costing.html',
        readSummary: () => ({
          title: document.querySelector('.cal-top-header h1').textContent.trim(),
          records: document.getElementById('totalRecordsVal').textContent.trim(),
          total: document.getElementById('totalCostVal').textContent.trim(),
          rows: document.querySelectorAll('#employeeCostingList tr').length,
          firstName: document.querySelector('#employeeCostingList .emp-card-name').textContent.trim(),
          firstId: document.querySelector('#employeeCostingList .emp-card-id').textContent.trim()
        }),
        expectedSummary: {
          title: 'Hours Costing',
          records: '181',
          total: 'RM 29,523.38',
          rows: 19,
          firstName: 'Lee Soon Hock',
          firstId: '#004101'
        }
      },
      {
        file: 'modules/attendance/options/clocking-summary.html',
        readSummary: () => ({
          title: document.getElementById('pageHeaderTitle').textContent.trim(),
          records: document.getElementById('totalRecordsVal').textContent.trim(),
          total: document.getElementById('totalCountVal').textContent.trim(),
          rows: document.querySelectorAll('#summaryTableBody .summary-table-row').length,
          firstRow: document.querySelector('#summaryTableBody .summary-table-row').textContent.replace(/\s+/g, ' ').trim()
        }),
        expectedSummary: {
          title: 'Clocking Summary',
          records: '2',
          total: '6',
          rows: 2,
          firstRow: 'BENEFITS MANAGEMENT 4'
        }
      }
    ];

    for (const config of pages) {
      for (const theme of ['light', 'dark']) {
        for (const width of [360, 430]) {
          await inspectPage(browser, config, theme, width);
        }
      }
    }

    console.log('PASS: Hours Costing and Clocking Summary match the Leave Highlight report and three-card chart design.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
