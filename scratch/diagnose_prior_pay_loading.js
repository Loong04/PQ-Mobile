const puppeteer = require('puppeteer');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('requestfailed', r => errors.push(r.url() + ': ' + r.failure().errorText));
    await page.goto(pathToFileURL(path.resolve(__dirname, '../modules/payroll/options/prior-pay-data.html')).href, { waitUntil: 'load', timeout: 20000 });
    await page.waitForFunction(() => document.querySelector('#priorRecordCount').textContent !== 'Loading', { timeout: 10000 }).catch(e => errors.push(e.message));
    console.log(JSON.stringify({ errors, state: await page.evaluate(() => ({
      readyState: document.readyState,
      count: document.querySelector('#priorRecordCount').textContent,
      records: document.querySelectorAll('.prior-record').length,
      errorVisible: !document.querySelector('#priorLoadError').hidden,
      fields: document.querySelectorAll('#earningsFields input').length,
      scripts: Array.from(document.scripts).map(s => s.src).filter(Boolean)
    })) }, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
