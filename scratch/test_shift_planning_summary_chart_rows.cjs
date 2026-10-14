const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const pageUrl = pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/shift-plan.html')).href;

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
    await page.setViewport({ width: 390, height: 950 });
    await page.goto(pageUrl + '?theme=light', { waitUntil: 'load' });
    await page.click('#tabSummaryBtn');

    const tableHeaderStyle = await page.$eval('#summaryTabView .summary-table-hdr', node => {
      const style = getComputedStyle(node);
      return { backgroundImage: style.backgroundImage, color: style.color };
    });
    assert.match(tableHeaderStyle.backgroundImage, /124, 58, 237/);
    assert.match(tableHeaderStyle.backgroundImage, /109, 40, 217/);
    assert.equal(tableHeaderStyle.color, 'rgb(255, 255, 255)');

    assert.equal(await page.$eval('#summaryChartTitle', node => node.textContent.trim()), 'Headcount by Shift');
    assert.equal(await page.$eval('#summaryChartTotal', node => node.textContent.trim()), '287');

    await page.$$eval('#summaryTableRowsContainer .summary-table-row', rows => {
      const row = rows.find(item => item.textContent.includes('ACCOUNT EXECUTIVE'));
      if (!row) throw new Error('ACCOUNT EXECUTIVE row not found');
      row.click();
    });

    assert.equal(await page.$eval('#summaryChartCard', node => node.classList.contains('is-refreshing')), true);
    assert.equal(await page.$eval('#summaryChartCard', node => node.dataset.refreshCount), '1');
    assert.equal(await page.$eval('#summaryChartTitle', node => node.textContent.trim()), 'ACCOUNT EXECUTIVE by Shift');
    assert.equal(
      await page.$$eval('#summaryTableRowsContainer .summary-table-row.is-chart-selected', rows => rows.length),
      2
    );
    const selectedRowStyle = await page.$eval('#summaryTableRowsContainer .summary-table-row.is-chart-selected', node => {
      const style = getComputedStyle(node);
      return { background: style.backgroundColor, boxShadow: style.boxShadow };
    });
    assert.notEqual(selectedRowStyle.background, 'rgba(0, 0, 0, 0)');
    assert.match(selectedRowStyle.boxShadow, /124, 58, 237/);
    await new Promise(resolve => setTimeout(resolve, 700));
    assert.equal(await page.$eval('#summaryChartTotal', node => node.textContent.trim()), '18');
    assert.equal(await page.$eval('#chartInfoOffCount', node => node.textContent.trim()), '15 Staff');
    assert.equal(await page.$eval('#chartInfoW02Count', node => node.textContent.trim()), '3 Staff');
    assert.equal(await page.$eval('#summaryChartCard', node => node.classList.contains('is-refreshing')), false);
    assert.equal(
      await page.$eval('#summaryChartCard', node => {
        const rect = node.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight;
      }),
      true
    );

    await page.$$eval('#summaryTableRowsContainer .summary-table-row', rows => {
      const row = rows.find(item => item.textContent.includes('BARTENDER'));
      if (!row) throw new Error('BARTENDER row not found');
      row.click();
    });

    assert.equal(await page.$eval('#summaryChartCard', node => node.dataset.refreshCount), '2');
    assert.equal(await page.$eval('#summaryChartTitle', node => node.textContent.trim()), 'BARTENDER by Shift');
    await new Promise(resolve => setTimeout(resolve, 700));
    assert.equal(await page.$eval('#summaryChartTotal', node => node.textContent.trim()), '1');
    assert.equal(await page.$eval('#chartInfoOffCount', node => node.textContent.trim()), '0 Staff');
    assert.equal(await page.$eval('#chartInfoW02Count', node => node.textContent.trim()), '1 Staff');
    assert.equal(
      await page.$$eval('#summaryTableRowsContainer .summary-table-row.is-chart-selected', rows => rows.length),
      1
    );

    await page.click('#summaryTableRowsContainer .summary-table-row.is-chart-selected .headcount-detail-trigger');
    await new Promise(resolve => setTimeout(resolve, 320));
    assert.equal(await page.$eval('#headcountDetailModal', node => getComputedStyle(node).display), 'flex');
    assert.equal(await page.$eval('#summaryChartTitle', node => node.textContent.trim()), 'BARTENDER by Shift');
    assert.deepEqual(errors, []);

    console.log('Shift Planning summary row chart refresh checks passed.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
