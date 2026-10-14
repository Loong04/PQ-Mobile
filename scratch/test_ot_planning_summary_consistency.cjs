const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const pageUrl = pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/ot-plan.html')).href;
const shiftPlanUrl = pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/shift-plan.html')).href;

async function readChartStyles(page) {
  return page.evaluate(() => {
    const read = (selector, properties) => {
      const styles = getComputedStyle(document.querySelector(selector));
      return Object.fromEntries(properties.map(property => [property, styles[property]]));
    };
    return {
      card: read('#summaryChartCard', ['backgroundColor', 'borderRadius', 'padding', 'boxShadow', 'flexDirection', 'gap']),
      title: read('#summaryChartTitle', ['fontSize', 'fontWeight']),
      info: read('#summaryChartInfoButton', ['width', 'height', 'borderRadius']),
      visual: read('.summary-chart-visual', ['width', 'height'])
    };
  });
}

async function readSummary(page) {
  return page.evaluate(() => ({
    chartTotal: document.getElementById('summaryChartTotal').textContent.trim(),
    chartTitle: document.getElementById('summaryChartTitle').textContent.trim(),
    subtotal: document.getElementById('chartSubtotalText').textContent.trim(),
    legends: [
      document.getElementById('summaryLegendBefore').textContent.trim(),
      document.getElementById('summaryLegendAfter').textContent.trim(),
      document.getElementById('summaryLegendRest').textContent.trim()
    ],
    tableRows: document.querySelectorAll('#summaryOtTableRows .summary-table-row').length,
    tableTotal: document.getElementById('summaryOtTableTotal').textContent.trim(),
    selectedRows: document.querySelectorAll('#summaryOtTableRows .summary-table-row.is-chart-selected').length,
    refreshCount: Number(document.getElementById('summaryChartCard').dataset.refreshCount || 0)
  }));
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--allow-file-access-from-files']
  });

  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewport({ width: 390, height: 900 });
    await page.goto(shiftPlanUrl + '?theme=light', { waitUntil: 'domcontentloaded' });
    await page.click('#tabSummaryBtn');
    const shiftChartStyles = await readChartStyles(page);

    await page.goto(pageUrl + '?theme=light', { waitUntil: 'domcontentloaded' });
    await page.click('#tabSummaryBtn');
    assert.deepEqual(await readChartStyles(page), shiftChartStyles);
    assert.equal(await page.$('#hoursTypeSelect'), null);
    assert.equal(await page.$('#summaryKpiCard'), null);
    assert.equal(
      await page.$eval('#summaryTabView', view =>
        !view.textContent.includes('OT Cost Breakdown') &&
        !view.textContent.includes('Total Planned Overtime')
      ),
      true
    );

    const planned = await readSummary(page);
    assert.equal(planned.chartTotal, '5.0h');
    assert.equal(planned.chartTitle, 'Planned Hours by OT Type');
    assert.equal(planned.subtotal, 'Total Hours : 5.00 (2)');
    assert.deepEqual(planned.legends, ['50.0% (2.5h)', '50.0% (2.5h)', '0.0% (0.0h)']);
    assert.equal(planned.tableRows, 2);
    assert.equal(planned.tableTotal, '5.00 (2)');
    assert.equal(await page.$eval('#summaryTabView', view => view.textContent.includes('127.0h')), false);

    await page.$eval('#summaryOtTableRows .summary-table-row', row => row.scrollIntoView({ block: 'center' }));
    await page.click('#summaryOtTableRows .summary-table-row');
    const selected = await readSummary(page);
    assert.equal(selected.chartTotal, '2.5h');
    assert.equal(selected.subtotal, 'Total Hours : 2.50 (1)');
    assert.equal(selected.selectedRows, 1);
    assert.ok(selected.refreshCount > planned.refreshCount);

    await page.click('#summaryChartInfoButton');
    assert.equal(await page.$eval('#modalSummaryChartTotal', node => node.textContent.trim()), selected.chartTotal);
    assert.deepEqual(
      await page.$$eval('#chartModal [data-modal-legend-value]', nodes => nodes.map(node => node.textContent.trim())),
      selected.legends
    );
    assert.deepEqual(errors, []);

    console.log('OT Planning Summary chart, legend, table, and modal stay synchronized.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
