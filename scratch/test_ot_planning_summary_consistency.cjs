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

async function readChartModalStyles(page) {
  return page.evaluate(() => {
    const sheet = document.querySelector('#chartModal .modal-sheet');
    const styles = getComputedStyle(sheet);
    return Object.fromEntries(['width', 'maxWidth', 'borderTopLeftRadius', 'borderTopRightRadius', 'display', 'flexDirection'].map(property => [property, styles[property]]));
  });
}

async function readSummaryTableHeaderStyles(page) {
  return page.$eval('#summaryTabView .summary-table-hdr', node => {
    const styles = getComputedStyle(node);
    return {
      backgroundImage: styles.backgroundImage,
      color: styles.color,
      borderBottomColor: styles.borderBottomColor
    };
  });
}

async function readSummary(page) {
  return page.evaluate(() => ({
    chartTotal: document.getElementById('summaryChartTotal').textContent.trim(),
    chartTitle: document.getElementById('summaryChartTitle').textContent.trim(),
    modalLegends: [
      document.getElementById('modalSummaryLegendBefore').textContent.trim(),
      document.getElementById('modalSummaryLegendAfter').textContent.trim(),
      document.getElementById('modalSummaryLegendRest').textContent.trim()
    ],
    tableRows: document.querySelectorAll('#summaryOtTableRows .summary-table-row').length,
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
    const shiftChartModalStyles = await readChartModalStyles(page);
    const shiftTableHeaderStyles = await readSummaryTableHeaderStyles(page);

    await page.goto(pageUrl + '?theme=light', { waitUntil: 'domcontentloaded' });
    await page.click('#tabSummaryBtn');
    assert.deepEqual(await readChartStyles(page), shiftChartStyles);
    assert.equal(await page.$$eval('#chartModal .modal-sheet', sheets => sheets.length), 1);
    assert.deepEqual(await readChartModalStyles(page), shiftChartModalStyles);
    assert.deepEqual(await readSummaryTableHeaderStyles(page), shiftTableHeaderStyles);
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
    assert.equal(await page.$('#chartSubtotalText'), null);
    assert.equal(await page.$('#summaryLegendBefore'), null);
    assert.equal(await page.$('#summaryLegendAfter'), null);
    assert.equal(await page.$('#summaryLegendRest'), null);
    assert.equal(await page.$('#summaryOtTableRecordCount'), null);
    assert.equal(await page.$('#summaryOtTableTotal'), null);
    assert.equal(await page.$('#summaryTabView .summary-table-footer'), null);
    assert.equal(await page.$eval('#summaryTabView', view => view.textContent.includes('OT Breakdown Table')), false);
    assert.deepEqual(planned.modalLegends, ['50.0%', '50.0%', '0.0%']);
    assert.equal(await page.$eval('#chartModal', modal => getComputedStyle(modal).display), 'none');
    assert.equal(planned.tableRows, 2);
    assert.equal(await page.$eval('#summaryTabView', view => view.textContent.includes('127.0h')), false);

    await page.click('#summaryOtTableRows .ot-hours-detail-trigger');
    assert.equal(await page.$eval('#otHoursDetailModal', modal => getComputedStyle(modal).display), 'flex');
    assert.deepEqual(
      await page.$$eval('#otHoursPrimaryDetailsTable .detail-popout-value', cells => cells.map(cell => cell.textContent.trim())),
      ['W01', 'ADMIN EXECUTIVE', '2.50 h', '2.00 h']
    );
    assert.deepEqual(
      await page.$$eval('#otHoursScheduleTable thead th', cells => cells.map(cell => cell.textContent.trim())),
      ['Emp #', 'Name', 'Planned', 'Approved']
    );
    assert.deepEqual(
      await page.$$eval('#otHoursScheduleRows tr:first-child td', cells => cells.map(cell => cell.textContent.trim())),
      ['#000008', 'Aqilah Antasha', '2.50 h', '2.00 h']
    );
    await page.click('#otHoursDetailModal .detail-popout-close');
    await new Promise(resolve => setTimeout(resolve, 320));

    await page.$eval('#summaryOtTableRows .summary-table-row', row => row.scrollIntoView({ block: 'center' }));
    await page.click('#summaryOtTableRows .summary-table-row');
    const selected = await readSummary(page);
    assert.equal(selected.chartTotal, '2.5h');
    assert.equal(selected.selectedRows, 1);
    assert.ok(selected.refreshCount > planned.refreshCount);

    await page.click('#summaryChartInfoButton');
    assert.equal(await page.$eval('#chartModal', modal => getComputedStyle(modal).display), 'flex');
    assert.equal(await page.$('#chartModal svg, #chartModal canvas'), null, 'Info shows details without a second chart');
    assert.equal(await page.$eval('#chartModal .sheet-title', node => node.textContent.trim()), 'Chart Details');
    assert.equal(await page.$eval('#chartModal .sheet-body', node => node.scrollWidth <= node.clientWidth + 1), true);
    assert.deepEqual(
      await page.$$eval('#chartModal [data-modal-legend-value]', nodes => nodes.map(node => node.textContent.trim())),
      selected.modalLegends
    );
    assert.deepEqual(await page.$$eval('#chartModal [data-modal-legend-hours]', nodes => nodes.map(node => node.textContent.trim())), ['2.5 Hours', '0.0 Hours', '0.0 Hours']);
    assert.deepEqual(errors, []);

    console.log('OT Planning Summary chart, legend, table, and modal stay synchronized.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
