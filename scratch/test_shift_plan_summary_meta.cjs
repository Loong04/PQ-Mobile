const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const pageUrl = pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/shift-plan.html')).href;
const summaries = [
  ['view-work-shift-summary', 'wsSummaryRecordCount'],
  ['view-no-work-summary', 'nwSummaryRecordCount'],
  ['view-ot-plan-summary', 'otSummaryRecordCount'],
  ['view-leave-summary', 'lvSummaryRecordCount']
];

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--allow-file-access-from-files']
  });

  try {
    for (const theme of ['dark', 'light']) {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.setViewport({ width: 390, height: 900 });
      await page.goto(`${pageUrl}?theme=${theme}`, { waitUntil: 'load' });

      for (const [viewId, countId] of summaries) {
        await page.evaluate(id => switchView(id), viewId);
        await page.waitForSelector(`#${countId} .record-summary-label`);
        const layout = await page.$eval(`#${viewId}`, (view, currentCountId) => {
          const overview = view.querySelector('.shift-top-header + div');
          const dateRow = overview.querySelector('.summary-date-display');
          const countRow = document.getElementById(currentCountId);
          const dateBox = dateRow.getBoundingClientRect();
          const countBox = countRow.getBoundingClientRect();
          const overviewStyle = getComputedStyle(overview);
          const standardSummaryStyle = getComputedStyle(document.querySelector('.list-header.record-summary-card'));
          const countStyle = getComputedStyle(countRow);
          return {
            visibleIconCount: [...overview.querySelectorAll('i')].filter(icon => icon.getClientRects().length > 0).length,
            dateAboveTotal: dateBox.bottom <= countBox.top,
            rowsShareWidth: Math.abs(dateBox.left - countBox.left) <= 1 && Math.abs(dateBox.right - countBox.right) <= 1,
            dateLabelColor: getComputedStyle(dateRow.querySelector('span')).color,
            totalLabelColor: getComputedStyle(countRow.querySelector('.record-summary-label')).color,
            overviewBackgroundImage: overviewStyle.backgroundImage,
            standardSummaryBackgroundImage: standardSummaryStyle.backgroundImage,
            dividerWidth: countStyle.borderTopWidth
          };
        }, countId);

        assert.equal(layout.visibleIconCount, 0, `${theme} ${viewId}: Date must not show an icon`);
        assert.equal(layout.dateAboveTotal, true, `${theme} ${viewId}: Date must occupy the first row and Total Records the second row`);
        assert.equal(layout.rowsShareWidth, true, `${theme} ${viewId}: Date and Total Records must each use a full row`);
        assert.equal(layout.dateLabelColor, layout.totalLabelColor, `${theme} ${viewId}: Date label must use the normal muted text color`);
        assert.equal(layout.overviewBackgroundImage, layout.standardSummaryBackgroundImage, `${theme} ${viewId}: Summary metadata must use the shared pale-purple summary color`);
        assert.equal(layout.dividerWidth, '1px', `${theme} ${viewId}: Date must use a separator line above Total Records`);
      }

      assert.deepEqual(errors, []);
      await page.close();
    }

    console.log('PASS: Shift Plan summary metadata uses two normal-color rows without date icons.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
