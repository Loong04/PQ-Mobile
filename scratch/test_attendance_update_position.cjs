const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const pageUrl = pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/attendance.html')).href;

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--allow-file-access-from-files']
  });

  try {
    for (const theme of ['light', 'dark']) {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.setViewport({ width: 390, height: 950 });
      await page.goto(pageUrl + '?theme=' + theme, { waitUntil: 'networkidle0' });

      assert.equal(await page.$eval('#attendanceUpdateBtn', node => node.hidden), true);
      await page.click('.attendance-verify-button');
      assert.equal(await page.$eval('#attendanceUpdateBtn', node => node.hidden), false);

      const layout = await page.evaluate(() => {
        const bar = document.querySelector('.attendance-total-bar');
        const summaryRow = bar.querySelector('.attendance-total-summary-row');
        const updateButton = document.getElementById('attendanceUpdateBtn');
        const rowRect = summaryRow.getBoundingClientRect();
        const buttonRect = updateButton.getBoundingClientRect();
        return {
          updateIsDirectChild: updateButton.parentElement === bar,
          verifyInsideSummaryRow: summaryRow.contains(document.getElementById('verifyAllBtn')),
          updateBelowSummary: buttonRect.top >= rowRect.bottom + 9,
          fullWidth: Math.abs(buttonRect.width - rowRect.width) <= 1,
          fits: updateButton.scrollWidth <= updateButton.clientWidth + 1
        };
      });

      assert.deepEqual(layout, {
        updateIsDirectChild: true,
        verifyInsideSummaryRow: true,
        updateBelowSummary: true,
        fullWidth: true,
        fits: true
      });

      await page.click('#attendanceUpdateBtn');
      assert.equal(await page.$eval('#attendanceUpdateBtn', node => node.hidden), true);
      assert.deepEqual(errors, []);
      await page.close();
    }

    console.log('PASS: Attendance Update appears as a full-width second-row action after verification in both themes.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
