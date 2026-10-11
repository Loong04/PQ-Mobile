const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const pageUrl = pathToFileURL(path.resolve(__dirname, '..', 'modules/attendance/options/overtime.html')).href;
const chrome = process.env.PUPPETEER_EXECUTABLE_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const viewports = [320, 360, 390, 420];

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chrome,
    args: ['--allow-file-access-from-files', '--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    for (const theme of ['light', 'dark']) {
      for (const width of viewports) {
        await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
        await page.goto(`${pageUrl}?theme=${theme}`, { waitUntil: 'domcontentloaded' });
        await page.click('#overtimeAddRequest');

        const summary = await page.evaluate(() => {
          const card = document.querySelector('.ot-form-meta');
          const input = document.querySelector('.modern-input');
          const cardStyle = getComputedStyle(card);
          const inputStyle = getComputedStyle(input);
          const cardRect = card.getBoundingClientRect();
          const rows = [...card.children].map(row => row.getBoundingClientRect());

          return {
            borderWidths: [
              cardStyle.borderTopWidth,
              cardStyle.borderRightWidth,
              cardStyle.borderBottomWidth,
              cardStyle.borderLeftWidth
            ],
            borderStyles: [
              cardStyle.borderTopStyle,
              cardStyle.borderRightStyle,
              cardStyle.borderBottomStyle,
              cardStyle.borderLeftStyle
            ],
            borderColors: [
              cardStyle.borderTopColor,
              cardStyle.borderRightColor,
              cardStyle.borderBottomColor,
              cardStyle.borderLeftColor
            ],
            inputBorderColor: inputStyle.borderTopColor,
            borderRadius: parseFloat(cardStyle.borderTopLeftRadius),
            padding: [
              parseFloat(cardStyle.paddingTop),
              parseFloat(cardStyle.paddingRight),
              parseFloat(cardStyle.paddingBottom),
              parseFloat(cardStyle.paddingLeft)
            ],
            overflow: card.scrollWidth - card.clientWidth,
            rowsContained: rows.every(row => (
              row.left >= cardRect.left
              && row.right <= cardRect.right
              && row.top >= cardRect.top
              && row.bottom <= cardRect.bottom
            )),
            header: document.getElementById('headerTitle').textContent.trim()
          };
        });

        assert.deepEqual(summary.borderWidths, ['1px', '1px', '1px', '1px'], `${theme} ${width}px: request summary needs a complete border`);
        assert.deepEqual(summary.borderStyles, ['solid', 'solid', 'solid', 'solid'], `${theme} ${width}px: request summary border stays solid on every side`);
        assert.deepEqual(
          summary.borderColors,
          Array(4).fill(summary.inputBorderColor),
          `${theme} ${width}px: request summary and form controls use the same border color`
        );
        assert.ok(summary.borderRadius >= 16, `${theme} ${width}px: request summary uses the rounded card treatment`);
        assert.ok(summary.padding.every(value => value >= 14), `${theme} ${width}px: request summary keeps card-like inner spacing`);
        assert.ok(summary.overflow <= 1, `${theme} ${width}px: request summary must not overflow horizontally`);
        assert.equal(summary.rowsContained, true, `${theme} ${width}px: request summary rows stay inside the bordered card`);
        assert.equal(summary.header, 'Request OT');
      }
    }

    assert.deepEqual(pageErrors, [], 'Request OT summary renders without page errors');
    console.log('Request OT bordered summary checks passed.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
