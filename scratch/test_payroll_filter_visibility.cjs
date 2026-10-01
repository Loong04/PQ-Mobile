const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

async function visible(page, selector) {
  return page.$eval(selector, node => {
    const style = getComputedStyle(node);
    return node.getClientRects().length > 0 && style.visibility !== 'hidden' && style.opacity !== '0';
  });
}

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const width of [390, 1280]) {
      await page.setViewport({ width, height: 1000 });
      for (const screen of [
        { file: 'payslip.html', modal: '#payslipFilterModal', trigger: '#payrollFilterTrigger' },
        { file: 'ea-form.html', modal: '#eaFilterModal', trigger: '#eaFilterTrigger' }
      ]) {
        await page.goto(pathToFileURL(path.resolve(__dirname, '../modules/payroll/options', screen.file)).href, { waitUntil: 'networkidle0' });
        for (const theme of ['dark', 'light']) {
          await page.evaluate(value => window.setTheme(value), theme);
          const label = `${screen.file} ${theme} ${width}px`;
          const initial = await page.$eval(screen.modal, modal => ({
            open: modal.classList.contains('is-open'),
            display: getComputedStyle(modal).display,
            position: getComputedStyle(modal).position
          }));
          console.log(label, initial);
          assert.equal(await visible(page, screen.modal), false, `${label}: filter must be hidden before clicking`);
          await page.click(screen.trigger);
          assert.equal(await visible(page, screen.modal), true, `${label}: click must show filter`);
          const coversPhone = await page.$eval(screen.modal, modal => {
            const overlay = modal.getBoundingClientRect();
            const phone = modal.closest('.phone-container').getBoundingClientRect();
            return ['top', 'left', 'right', 'bottom'].every(edge => Math.abs(overlay[edge] - phone[edge]) <= 1);
          });
          assert.equal(coversPhone, true, `${label}: filter overlay must cover the phone without occupying document layout`);
          await page.click(`${screen.modal} [data-filter-close]`);
          assert.equal(await visible(page, screen.modal), false, `${label}: close must hide filter`);
          await page.click(screen.trigger);
          await page.click(`${screen.modal} .standard-filter-apply`);
          assert.equal(await visible(page, screen.modal), false, `${label}: apply must hide filter`);
        }
        await page.reload({ waitUntil: 'networkidle0' });
        assert.equal(await visible(page, screen.modal), false, `${screen.file}: reload must keep filter closed`);
      }
    }
    assert.deepEqual(errors, [], 'Payroll document pages must not emit runtime errors');
    console.log('PASS: payroll filters stay hidden until clicked and close after Close/Apply, across themes and viewports.');
  } finally {
    await browser.close();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
