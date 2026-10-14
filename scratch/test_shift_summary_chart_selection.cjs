const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const pageUrl = pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/shift-summary.html')).href;

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
    await page.setViewport({ width: 390, height: 900, deviceScaleFactor: 1 });
    await page.goto(pageUrl, { waitUntil: 'load' });
    await page.waitForSelector('#summaryTableRowsContainer .summary-table-row');

    const headerColors = await page.$eval('.summary-table-card .data-table-column-header', node => {
      const style = getComputedStyle(node);
      return { background: style.backgroundColor, color: style.color };
    });
    assert.equal(headerColors.background, 'rgb(124, 58, 237)');
    assert.equal(headerColors.color, 'rgb(255, 255, 255)');
    assert.equal(await page.$eval('#chartTotalHeadcountLabel', node => node.textContent.trim()), 'Total Headcount :287');

    await page.$$eval('#summaryTableRowsContainer .summary-table-row', rows => {
      const accountExecutive = rows.find(row => row.textContent.includes('ACCOUNT EXECUTIVE'));
      if (!accountExecutive) throw new Error('ACCOUNT EXECUTIVE row not found');
      accountExecutive.click();
    });

    assert.equal(await page.$eval('#inlineChartContainer', node => node.classList.contains('is-refreshing')), true);
    assert.equal(await page.$eval('#inlineChartContainer', node => node.dataset.refreshCount), '1');
    assert.equal(await page.$eval('#view-summary', node => getComputedStyle(node).display), 'block');
    assert.equal(await page.$eval('#view-shift-detail', node => getComputedStyle(node).display), 'none');
    assert.equal(await page.$eval('#inlineChartTitle', node => node.textContent.trim()), 'ACCOUNT EXECUTIVE by Shift');
    assert.equal(await page.$eval('#chartTotalHeadcountLabel', node => node.textContent.trim()), 'Total Headcount :18');
    assert.equal(await page.$eval('#legendOffDayVal', node => node.textContent.trim()), '83.33% 15');
    assert.equal(await page.$eval('#legendNaVal', node => node.textContent.trim()), '16.67% 3');
    assert.equal(
      await page.$$eval('#summaryTableRowsContainer .summary-table-row.is-chart-selected', rows => rows.length),
      2
    );

    const selectedStyle = await page.$eval('#summaryTableRowsContainer .summary-table-row.is-chart-selected', node => {
      const style = getComputedStyle(node);
      return { background: style.backgroundColor, boxShadow: style.boxShadow };
    });
    assert.notEqual(selectedStyle.background, 'rgba(0, 0, 0, 0)');
    assert.match(selectedStyle.boxShadow, /124, 58, 237/);

    await new Promise(resolve => setTimeout(resolve, 650));
    assert.equal(await page.$eval('#inlineChartContainer', node => node.classList.contains('is-refreshing')), false);
    assert.equal(
      await page.$eval('#inlineChartContainer', node => {
        const rect = node.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight;
      }),
      true
    );

    await page.$$eval('#summaryTableRowsContainer .summary-table-row', rows => {
      const bartender = rows.find(row => row.textContent.includes('BARTENDER'));
      if (!bartender) throw new Error('BARTENDER row not found');
      bartender.click();
    });

    assert.equal(await page.$eval('#inlineChartContainer', node => node.dataset.refreshCount), '2');
    assert.equal(await page.$eval('#inlineChartTitle', node => node.textContent.trim()), 'BARTENDER by Shift');
    assert.equal(await page.$eval('#chartTotalHeadcountLabel', node => node.textContent.trim()), 'Total Headcount :1');
    assert.equal(await page.$eval('#legendOffDayVal', node => node.textContent.trim()), '0.00% 0');
    assert.equal(await page.$eval('#legendNaVal', node => node.textContent.trim()), '100.00% 1');
    assert.equal(
      await page.$$eval('#summaryTableRowsContainer .summary-table-row.is-chart-selected', rows => rows.length),
      1
    );
    assert.deepEqual(errors, []);

    console.log('Shift summary chart selection checks passed.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
