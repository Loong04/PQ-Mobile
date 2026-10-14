const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files', '--no-sandbox'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve(__dirname, '../modules/admin/options/guest-visit.html')).href, { waitUntil: 'load' });
    for (const caption of ['Total Records: 0', 'Total Records: 12', 'Total Records: 1,024']) {
      await page.$eval('#visitGuestListCount', (node, text) => { node.innerText = text; }, caption);
      await page.waitForFunction(text => document.querySelector('#visitGuestListCount .record-summary-value')?.textContent === text.split(': ')[1], {}, caption);
      assert.equal(await page.$eval('#visitGuestListCount', node => node.textContent), caption, 'Formatting preserves the exact count caption');
      assert.equal(await page.$$eval('#visitGuestListCount .record-summary-value', nodes => nodes.length), 1, 'Repeated updates do not duplicate counts');
    }
    await page.$eval('#visitGuestListCount', node => { node.textContent = 'Total Amount: RM 12.50'; });
    await page.waitForFunction(() => !document.querySelector('#visitGuestListCount').classList.contains('record-summary-card'));
    assert.equal(await page.$eval('#visitGuestListCount', node => node.textContent), 'Total Amount: RM 12.50', 'Amount captions keep their content and original presentation');
    await page.evaluate(() => {
      const node = document.createElement('span');
      node.id = 'insertedCount';
      node.dataset.recordSummaryCount = '';
      node.textContent = 'Total Records: 7';
      document.querySelector('.phone-container').append(node);
    });
    await page.waitForSelector('#insertedCount .record-summary-value');
    assert.equal(await page.$eval('#insertedCount', node => node.textContent), 'Total Records: 7', 'New form content receives the same presentation');
    assert.deepEqual(errors, []);
    console.log('PASS: refreshed and inserted record captions preserve zero, grouped counts, original text and amount states without duplication or JavaScript errors.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
