const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const http = require('node:http');
const puppeteer = require('puppeteer');

(async () => {
  const root = path.resolve(__dirname, '..');
  const scope = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'js/payroll/payroll-config.js'), 'utf8'), scope);
  const config = scope.window.PAYROLL_CONFIG;
  assert.equal(config.individualOptions.find(x => x.id === 'tax_relief').link, 'options/tax-relief-request.html');
  assert.equal(config.individualOptions.find(x => x.id === 'deduction_request').link, 'options/deduction-request.html');
  assert.equal(config.teamOptions.find(x => x.id === 'tax_relief').link, 'options/tax-relief.html');
  const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
    if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
    fs.readFile(file, (error, data) => {
      if (error) return res.writeHead(404).end();
      res.setHeader('Content-Type', ({ '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' })[path.extname(file)] || 'application/octet-stream');
      res.end(data);
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, protocolTimeout: 30000 });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setRequestInterception(true);
    page.on('request', request => /^(http:\/\/127\.0\.0\.1:|blob:)/.test(request.url()) ? request.continue() : request.abort());
    const base = `http://127.0.0.1:${server.address().port}`;
    async function fill(name, value) {
      await page.$eval(`[name="${name}"]`, (el, text) => {
        el.value = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }, value);
    }
    for (const [route, type, requiredName] of [
      ['tax-relief-request', 'tax', 'rebateItem'], ['deduction-request', 'deduction', 'deductionType']
    ]) {
      await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
      await page.goto(`${base}/modules/payroll/index.html`, { waitUntil: 'load' });
      const link = `#individualPayrollOptionsGrid a[href="options/${route}.html"]`;
      await page.waitForSelector(link);
      await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.click(link)]);
      await page.waitForSelector('#payrollSubmit:not(:disabled)');
      assert.equal(await page.$eval(`[name="${requiredName}"]`, el => el.required), true);
      assert.equal(await page.$eval('#payrollForm', form => form.checkValidity()), false);
      if (type === 'tax') await page.select('#rebateItem', 'Lifestyle');
      else await page.select('#deductionType', 'HOUSING LOAN');
      await fill('remarks', 'Keep this note after reloading.');
      if (type === 'tax') {
        await fill('amount', '-1');
        assert.equal(await page.$eval('#payrollForm', form => form.checkValidity()), false);
        await fill('amount', '125.50');
        await fill('receiptNo', 'RCP-0123');
        await fill('description', 'Reference receipt');
      } else {
        assert.equal(await page.$eval('[name="requestType"]', el => el.value), 'Stop Deduction');
        assert.equal(await page.$eval('[name="stopCycle"]', el => el.value), 'MONTH END');
        await page.select('#requestType', 'Stop Deduction');
        await page.select('#stopCycle', 'MONTH END');
        await fill('stopPeriod', '202613');
        assert.equal(await page.$eval('#payrollForm', form => form.checkValidity()), false);
        await fill('stopPeriod', '202610');
        await fill('stopDate', '2026-10-01');
        await fill('accountNo', '0012345');
      }
      await page.evaluate(() => {
        const transfer = new DataTransfer();
        transfer.items.add(new File(['Proof content'], 'receipt.pdf', { type: 'application/pdf' }));
        const input = document.getElementById('payrollFiles');
        input.files = transfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await page.waitForSelector('.payroll-file-row');
      await page.click('#payrollBack');
      await page.waitForSelector('#payrollExitDialog[open]');
      await page.click('#payrollKeepEditing');
      assert.equal(await page.$eval('[name="remarks"]', el => el.value), 'Keep this note after reloading.');
      await page.$eval('#payrollForm', form => form.requestSubmit());
      await page.waitForFunction(() => document.getElementById('payrollFormStatus').textContent === 'Saved on this device');
      await page.reload({ waitUntil: 'load' });
      await page.waitForSelector('#payrollSubmit:not(:disabled)');
      assert.equal(await page.$eval('[name="remarks"]', el => el.value), 'Keep this note after reloading.');
      assert.equal(await page.$eval('.payroll-file-name', el => el.textContent), 'receipt.pdf');
      assert.equal(await page.evaluate(async () => {
        window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
        window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
        try { return await (await fetch(document.querySelector('.payroll-file-name').href)).text(); }
        catch { return 'Attachment link is no longer valid'; }
      }), 'Proof content', 'Restoring a cached page must keep attachment downloads working');
      if (type === 'tax') {
        assert.equal(await page.$eval('[name="amount"]', el => el.value), '125.50');
        assert.equal(await page.$eval('#rebateItem', el => el.value), 'Lifestyle', 'Selected rebate survives saving and reload');
      }
      else assert.equal(await page.$eval('[name="accountNo"]', el => el.value), '0012345');
      for (const theme of ['dark', 'light']) {
        await page.evaluate(value => setTheme(value), theme);
        for (const width of [320, 390, 420]) {
          await page.setViewport({ width, height: 844 });
          assert.equal(await page.$eval('.main-content', el => el.scrollWidth <= el.clientWidth), true, `${route}: no overflow at ${width}`);
        }
        await page.setViewport({ width: 390, height: 844 });
        await page.screenshot({ path: path.join(__dirname, `payroll_${type}_form_${theme}.png`), waitForFonts: false });
        await page.$eval('.main-content', el => { el.scrollTop = el.scrollHeight; });
        await page.screenshot({ path: path.join(__dirname, `payroll_${type}_form_${theme}_bottom.png`), waitForFonts: false });
        await page.$eval('.main-content', el => { el.scrollTop = 0; });
      }
      await page.click('.payroll-file-remove');
      assert.equal(await page.$$('.payroll-file-row').then(els => els.length), 0);
      await page.$eval('#payrollForm', form => form.requestSubmit());
      await page.waitForFunction(() => document.getElementById('payrollFormStatus').textContent === 'Saved on this device');
      await page.reload({ waitUntil: 'load' });
      await page.waitForSelector('#payrollSubmit:not(:disabled)');
      assert.equal(await page.$$('.payroll-file-row').then(els => els.length), 0);
      await fill('remarks', 'Discard this edit');
      await page.click('#payrollBack');
      await page.waitForSelector('#payrollExitDialog[open]');
      const discardNavigation = page.waitForNavigation({ waitUntil: 'load' });
      const beforeDiscard = await page.evaluate(() => {
        const button = document.getElementById('payrollDiscard');
        button.click();
        return { remarks: document.querySelector('[name="remarks"]').value, dialogOpen: document.getElementById('payrollExitDialog').open };
      });
      await discardNavigation;
      assert.equal(beforeDiscard.remarks, 'Keep this note after reloading.', 'Discard restores saved values before navigating');
      assert.equal(beforeDiscard.dialogOpen, false);
      {
        const legacyValue = type === 'tax' ? 'Previously entered custom rebate' : 'Previously entered staff loan';
        await page.evaluate(async ({ employeeId, kind, fieldName, value }) => {
          await new Promise((resolve, reject) => {
            const request = indexedDB.open('peoplehcm-payroll-forms', 1);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
              const db = request.result;
              const transaction = db.transaction('requests', 'readwrite');
              const store = transaction.objectStore('requests');
              const recordRequest = store.get(`${employeeId}:${kind}`);
              recordRequest.onsuccess = () => {
                const record = recordRequest.result;
                record.values[fieldName] = value;
                store.put(record);
              };
              transaction.oncomplete = () => { db.close(); resolve(); };
              transaction.onabort = () => { db.close(); reject(transaction.error); };
            };
          });
        }, { employeeId: config.employee.empNo, kind: type, fieldName: requiredName, value: legacyValue });
        await page.goto(`${base}/modules/payroll/options/${route}.html`, { waitUntil: 'load' });
        await page.waitForSelector('#payrollSubmit:not(:disabled)');
        assert.equal(await page.$eval(`[name="${requiredName}"]`, el => el.value), legacyValue, 'Previous free-entry items remain selected');
        await page.$eval('#payrollForm', form => form.requestSubmit());
        await page.waitForFunction(() => document.getElementById('payrollFormStatus').textContent === 'Saved on this device');
        await page.reload({ waitUntil: 'load' });
        await page.waitForSelector('#payrollSubmit:not(:disabled)');
        assert.equal(await page.$eval(`[name="${requiredName}"]`, el => el.value), legacyValue, 'Saving again preserves previous custom items');
      }
      console.log('PASS ' + route + ': navigation, validation, attachments, reload, cancel protection, themes and widths');
    }
    assert.deepEqual(errors, []);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
