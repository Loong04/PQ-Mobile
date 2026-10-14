const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const pageUrl = pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/shift-plan.html')).href;
const detailViews = [
  'view-work-shift-detail',
  'view-no-work-detail',
  'view-ot-plan-detail',
  'view-leave-detail'
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

      for (const viewId of detailViews) {
        await page.evaluate(id => switchView(id), viewId);
        const presentation = await page.$eval(`#${viewId} .shift-detail-info-card`, card => {
          const cardStyle = getComputedStyle(card);
          const dateRow = card.querySelector('.shift-detail-info-date');
          const standardSummaryStyle = getComputedStyle(document.querySelector('.list-header.record-summary-card'));
          return {
            backgroundImage: cardStyle.backgroundImage,
            standardBackgroundImage: standardSummaryStyle.backgroundImage,
            borderRadius: cardStyle.borderRadius,
            boxShadow: cardStyle.boxShadow,
            dateDividerWidth: getComputedStyle(dateRow).borderBottomWidth,
            iconCount: card.querySelectorAll('i').length
          };
        });

        assert.equal(presentation.backgroundImage, presentation.standardBackgroundImage, `${theme} ${viewId}: detail metadata must use the shared pale-purple summary color`);
        assert.equal(presentation.borderRadius, '18px', `${theme} ${viewId}: detail metadata must use the shared rounded card shape`);
        assert.equal(presentation.boxShadow, 'none', `${theme} ${viewId}: detail metadata must stay flat without a shadow`);
        assert.equal(presentation.dateDividerWidth, '1px', `${theme} ${viewId}: Date must retain its separator line`);
        assert.equal(presentation.iconCount, 0, `${theme} ${viewId}: Date must not show an icon`);
      }

      assert.deepEqual(errors, []);
      await page.close();
    }

    console.log('PASS: All Shift Plan employee detail metadata cards share the summary presentation.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
