const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--allow-file-access-from-files']
  });

  try {
    const page = await browser.newPage();
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    const url = pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/overtime.html')).href;

    for (const theme of ['light', 'dark']) {
      await page.setViewport({ width: 360, height: 844, deviceScaleFactor: 1 });
      await page.goto(`${url}?theme=${theme}`, { waitUntil: 'networkidle0' });
      await page.click('#overtimeAddRequest');

      const initial = await page.evaluate(() => {
        const field = document.getElementById('otNeedTransportField');
        const label = document.getElementById('otNeedTransportLabel');
        const description = document.getElementById('otNeedTransportDescription');
        const row = field?.querySelector('.ot-transport-row');
        const control = document.getElementById('otNeedTransport');
        const thumb = control?.querySelector('.modern-switch-thumb');
        const credit = document.querySelector('.ot-credit-row');
        const remarks = document.getElementById('otRemarks')?.closest('.modern-form-group');
        const main = document.querySelector('.main-content');

        if (!field || !label || !description || !row || !control || !thumb || !credit || !remarks || !main) {
          return null;
        }

        const controlRect = control.getBoundingClientRect();
        const thumbRect = thumb.getBoundingClientRect();
        const rowStyle = getComputedStyle(row);
        const controlStyle = getComputedStyle(control);

        return {
          label: label.textContent.trim(),
          description: description.textContent.trim(),
          role: control.getAttribute('role'),
          state: control.getAttribute('aria-checked'),
          labelledBy: control.getAttribute('aria-labelledby'),
          green: controlStyle.backgroundColor,
          controlSize: [controlRect.width, controlRect.height],
          thumbOnRight: thumbRect.left + (thumbRect.width / 2) > controlRect.left + (controlRect.width / 2),
          rowRadius: Number.parseFloat(rowStyle.borderRadius),
          rowHasBackground: rowStyle.backgroundColor !== 'rgba(0, 0, 0, 0)',
          afterCredit: Boolean(credit.compareDocumentPosition(field) & Node.DOCUMENT_POSITION_FOLLOWING),
          beforeRemarks: Boolean(field.compareDocumentPosition(remarks) & Node.DOCUMENT_POSITION_FOLLOWING),
          overflow: main.scrollWidth - main.clientWidth
        };
      });

      assert.ok(initial, `${theme}: Need Transport UI is present`);
      assert.equal(initial.label, 'Need Transport');
      assert.equal(initial.description, 'Transport required');
      assert.equal(initial.role, 'switch');
      assert.equal(initial.state, 'true');
      assert.equal(initial.labelledBy, 'otNeedTransportLabel otNeedTransportDescription');
      assert.equal(initial.green, 'rgb(16, 185, 129)');
      assert.deepEqual(initial.controlSize, [46, 26]);
      assert.ok(initial.thumbOnRight, `${theme}: enabled switch thumb is on the right`);
      assert.ok(initial.rowRadius >= 12, `${theme}: transport row has rounded corners`);
      assert.ok(initial.rowHasBackground, `${theme}: transport row has a visible surface`);
      assert.ok(initial.afterCredit && initial.beforeRemarks, `${theme}: transport UI sits between credit and remarks`);
      assert.equal(initial.overflow, 0, `${theme}: transport UI does not overflow at 360px`);

      await page.click('#otNeedTransport');
      const toggled = await page.$eval('#otNeedTransport', control => {
        const controlRect = control.getBoundingClientRect();
        const thumbRect = control.querySelector('.modern-switch-thumb').getBoundingClientRect();
        return {
          state: control.getAttribute('aria-checked'),
          thumbOnLeft: thumbRect.left + (thumbRect.width / 2) < controlRect.left + (controlRect.width / 2)
        };
      });
      assert.equal(toggled.state, 'false');
      assert.ok(toggled.thumbOnLeft, `${theme}: disabled switch thumb moves to the left`);
    }

    assert.deepEqual(pageErrors, []);
    console.log('PASS: Request OT Need Transport UI matches the requested switch card.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
