const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, protocolTimeout: 30000 });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 430, height: 1020, deviceScaleFactor: 1 });
    for (const [name, route] of [['tax', 'tax-relief-request'], ['deduction', 'deduction-request']]) {
      await page.goto(pathToFileURL(path.resolve('modules/payroll/options/' + route + '.html')).href, { waitUntil: 'load', timeout: 30000 });
      await page.waitForSelector('#payrollSubmit:not(:disabled)');
      await page.bringToFront();
      for (const theme of ['dark', 'light']) {
        await page.evaluate(value => setTheme(value), theme);
        await new Promise(resolve => setTimeout(resolve, 350));
        await page.screenshot({ path: path.resolve('scratch/payroll_' + name + '_preview_' + theme + '.png') });
        console.log('Captured ' + name + ' ' + theme);
      }
      console.log(await page.evaluate(() => ({
        page: document.title,
        iconFont: getComputedStyle(document.querySelector('.payroll-back i')).fontFamily,
        loadedIcons: document.fonts.check('16px "Font Awesome 6 Free"'),
        date: document.querySelector('input[type="date"]').value
      })));
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
