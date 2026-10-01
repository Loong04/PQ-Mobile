const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const url = pathToFileURL(path.resolve(__dirname, '../modules/payroll/options/prior-pay-data.html')).href;
    // Reproduce storage requests that never fire success/error (e.g. stalled browser storage).
    const stalled = await browser.newPage();
    await stalled.evaluateOnNewDocument(() => {
      const realOpen = IDBFactory.prototype.open;
      IDBFactory.prototype.open = function (...args) {
        if (window.releaseStorage) return realOpen.apply(this, args);
        return {};
      };
    });
    await stalled.goto(url, { waitUntil: 'load' });
    await stalled.waitForFunction(() => !document.querySelector('#priorLoadError').hidden, { timeout: 12000 });
    assert.equal(await stalled.$eval('#priorRecords', el => el.textContent.trim()), '');
    await stalled.evaluate(() => { window.releaseStorage = true; });
    await stalled.click('#priorRetry');
    await stalled.waitForSelector('.prior-record');
    assert.equal(await stalled.$$eval('.prior-record', els => els.length), 4);
    await stalled.close();

    // A held legacy connection must produce an actionable message and recover after closing it.
    const context = await browser.createBrowserContext();
    const old = await context.newPage();
    await old.setRequestInterception(true);
    old.on('request', req => req.url().includes('/js/payroll/prior-pay-data.js') ? req.abort() : req.continue());
    await old.goto(url, { waitUntil: 'load' });
    await old.evaluate(() => new Promise((resolve, reject) => {
      const request = indexedDB.open('peoplehcm-prior-pay-preview-v1', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('records', { keyPath: 'id' });
      request.onsuccess = () => { window.legacyDB = request.result; resolve(); };
      request.onerror = () => reject(request.error);
    }));
    const current = await context.newPage();
    await current.goto(url, { waitUntil: 'load' });
    await current.waitForFunction(() => !document.querySelector('#priorLoadError').hidden);
    assert.match(await current.$eval('#priorLoadError', el => el.textContent), /another.*tab|other.*tab/i);
    await old.evaluate(() => window.legacyDB.close());
    await current.click('#priorRetry');
    await current.waitForSelector('.prior-record');
    assert.equal(await current.$$eval('.prior-record', els => els.length), 4);
    await context.close();
    console.log('PASS: stalled storage exits Loading; Retry recovers; blocked legacy database gives clear instructions and recovers.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
