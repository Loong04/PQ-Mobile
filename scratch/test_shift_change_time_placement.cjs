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
      await page.evaluate(() => openModal('shiftChangeModalOverlay'));
      await page.waitForSelector('#shiftChangeModalOverlay', { visible: true });

      const placement = await page.evaluate(() => {
        const form = document.getElementById('shiftChangeRequestForm');
        const shiftField = document.getElementById('shiftChangeNewShift').closest('.attendance-form-field');
        const timePanel = form.querySelector('.attendance-form-shift-times');
        const reasonField = document.getElementById('shiftChangeReason').closest('.attendance-form-field');
        const shiftRect = shiftField.getBoundingClientRect();
        const timeRect = timePanel.getBoundingClientRect();
        const reasonRect = reasonField.getBoundingClientRect();
        return {
          summaryLabels: [...form.querySelectorAll('.attendance-form-summary-row > span')].map(node => node.textContent.trim()),
          containsStart: timePanel.contains(document.getElementById('shiftChangeStart')),
          containsEnd: timePanel.contains(document.getElementById('shiftChangeEnd')),
          followsShift: timeRect.top >= shiftRect.bottom,
          precedesReason: reasonRect.top >= timeRect.bottom,
          fits: timePanel.scrollWidth <= timePanel.clientWidth + 1
        };
      });

      assert.deepEqual(placement, {
        summaryLabels: ['Date', 'Original Shift'],
        containsStart: true,
        containsEnd: true,
        followsShift: true,
        precedesReason: true,
        fits: true
      });

      await page.select('#shiftChangeNewShift', 'W02');
      assert.deepEqual(
        await page.$$eval('#shiftChangeStart, #shiftChangeEnd', nodes => nodes.map(node => node.textContent.trim())),
        ['9.00AM', '6.00PM']
      );
      assert.deepEqual(errors, []);
      await page.close();
    }

    console.log('PASS: New Shift Start and End sit below New Shift and above Reason in both themes.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
