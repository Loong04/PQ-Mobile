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

      const fieldLabels = await page.$$eval(
        '#shiftChangeRequestForm .attendance-form-summary-row > span, ' +
          '#shiftChangeRequestForm .attendance-form-shift-time-row > span, ' +
          '#shiftChangeRequestForm .attendance-form-field > label',
        nodes => nodes.map(node => ({
          text: node.textContent.trim(),
          color: getComputedStyle(node).color
        }))
      );
      assert.deepEqual(
        fieldLabels.map(label => label.text),
        ['Date', 'Original Shift', 'New Shift', 'New Shift Start', 'New Shift End', 'Reason', 'Remarks']
      );
      assert.equal(
        new Set(fieldLabels.map(label => label.color)).size,
        1,
        `${theme}: every Shift Change field label uses the same text color`
      );

      const formTextColors = await page.$eval('#shiftChangeRequestForm', form => {
        const samples = [
          ['Section title', form.querySelector('.form-section-heading--new')],
          ['Date label', form.querySelector('.attendance-form-summary-row > span')],
          ['Date value', document.getElementById('shiftMetaDate')],
          ['Original Shift value', document.getElementById('shiftMetaOriginal')],
          ['New Shift label', form.querySelector('label[for="shiftChangeNewShift"]')],
          ['New Shift input', document.getElementById('shiftChangeNewShift')],
          ['New Shift Start label', form.querySelector('.attendance-form-shift-time-row > span')],
          ['New Shift Start value', document.getElementById('shiftChangeStart')],
          ['Reason label', form.querySelector('label[for="shiftChangeReason"]')],
          ['Reason input', document.getElementById('shiftChangeReason')],
          ['Remarks label', form.querySelector('label[for="shiftChangeRemarks"]')],
          ['Remarks input', document.getElementById('shiftChangeRemarks')]
        ].map(([name, node]) => ({ name, color: getComputedStyle(node).color }));
        const placeholderStyle = getComputedStyle(document.getElementById('shiftChangeRemarks'), '::placeholder');
        return {
          samples,
          placeholder: {
            color: placeholderStyle.color,
            opacity: placeholderStyle.opacity
          }
        };
      });
      const expectedTextColor = formTextColors.samples[0].color;
      assert.equal(
        formTextColors.samples.every(sample => sample.color === expectedTextColor),
        true,
        `${theme}: Shift Change labels, values, and input text all match the section title color`
      );
      assert.deepEqual(
        formTextColors.placeholder,
        { color: expectedTextColor, opacity: '1' },
        `${theme}: the Remarks placeholder uses the same fully opaque text color`
      );

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
