const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
const { execFileSync } = require('node:child_process');

const url = file => pathToFileURL(path.resolve(__dirname, '../modules/payroll', file)).href;
async function shown(page, selector) {
  return page.$eval(selector, node => node.getClientRects().length > 0 && getComputedStyle(node).display !== 'none');
}
async function filter(page, values) {
  await page.click('#historyFilterTrigger');
  for (const [id, value] of Object.entries(values)) {
    await page.$eval(`#${id}`, (node, next) => { node.value = next; }, value);
  }
  await page.click('#applyHistoryFilter');
}
async function refs(page) {
  return page.$$eval('.history-card-item', nodes => nodes.map(node => node.dataset.reference));
}

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    const faults = [];
    page.on('pageerror', error => faults.push(error.message));
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(url('index.html'), { waitUntil: 'networkidle0' });
    await page.waitForSelector('[data-payroll-option="history"]');
    await page.click('[data-payroll-option="history"]');
    await page.waitForFunction(() => location.pathname.endsWith('/options/history.html'), { timeout: 4000 });
    await page.waitForSelector('.history-card-item');
    assert.deepEqual(await refs(page), ['RBT000000000039', 'RBT000000000049', 'RBT000000000050']);
    assert.equal(await shown(page, '#historyFilterModal'), false, 'Filter must stay closed on entry');
    assert.equal(await shown(page, '#historyDetailsModal'), false, 'Details must stay closed on entry');
    const cards = await page.$$eval('.history-card-item', nodes => nodes.map(node => node.textContent.replace(/\s+/g, ' ')));
    assert.ok(cards[0].includes('14 Aug 2025') && cards[0].includes('RM 100.00'));
    assert.ok(cards[1].includes('19 Mar 2026') && cards[1].includes('RM 12.00'));
    assert.ok(cards[2].includes('TXR05') && cards[2].includes('RM 14.00'));
    await page.click('[data-reference="RBT000000000039"]');
    await page.waitForFunction(() => document.activeElement?.id === 'closeHistoryDetails');
    const detail = await page.$eval('#historyDetailsModal', node => node.textContent.replace(/\s+/g, ' '));
    for (const expected of ['Tax Relief Detail', 'Farhan binti rahmat', '#EBB12', '7 Jan 2026', 'Medical Relief', 'Invoice.docx', 'Process', 'No', 'Approval Date', 'Approver Remarks', 'Reason required']) {
      assert.ok(detail.includes(expected), `Details must preserve ${expected}`);
    }
    assert.equal(await page.$eval('.history-employee-name', node => node.nextElementSibling.textContent.trim()), '#EBB12');
    await page.keyboard.press('Escape');
    assert.equal(await shown(page, '#historyDetailsModal'), false);
    assert.equal(await page.$eval('[data-reference="RBT000000000039"]', node => node === document.activeElement), true);
    await filter(page, { historyRebateItem: 'TXR05' });
    assert.deepEqual(await refs(page), ['RBT000000000050']);
    await page.click('#historyFilterTrigger');
    await page.click('#resetHistoryFilter');
    await page.click('#applyHistoryFilter');
    assert.equal((await refs(page)).length, 3);
    await filter(page, { historyDateFrom: '2026-01-07', historyDateTo: '2026-01-07' });
    assert.deepEqual(await refs(page), ['RBT000000000039'], 'Date filter must use submission date for the 2025 transaction submitted in 2026');
    await page.click('#historyFilterTrigger');
    await page.click('#resetHistoryFilter');
    await page.$eval('#historyDescription', node => { node.value = 'mEdIcAl ReLiEf'; });
    await page.click('#applyHistoryFilter');
    assert.deepEqual(await refs(page), ['RBT000000000039']);
    await filter(page, { historyStatus: 'approved' });
    assert.equal((await refs(page)).length, 0);
    assert.ok(await shown(page, '#historyEmptyState'));
    await page.click('#historyFilterTrigger');
    await page.click('#resetHistoryFilter');
    await page.$eval('#historyDateFrom', node => { node.value = '2026-10-02'; });
    await page.$eval('#historyDateTo', node => { node.value = '2026-01-01'; });
    await page.click('#applyHistoryFilter');
    assert.equal(await shown(page, '#historyFilterModal'), true, 'Invalid range must leave filter open');
    assert.ok(await shown(page, '#historyFilterError'));
    await page.click('#resetHistoryFilter');
    await page.click('#applyHistoryFilter');
    assert.equal((await refs(page)).length, 3);
    for (const theme of ['dark', 'light']) {
      await page.evaluate(value => window.setTheme(value), theme);
      for (const width of [360, 390, 420, 1280]) {
        await page.setViewport({ width, height: width === 1280 ? 1000 : 844 });
        for (const state of ['list', 'filter', 'details']) {
          if (state === 'filter') await page.click('#historyFilterTrigger');
          if (state === 'details') await page.click('[data-reference="RBT000000000039"]');
          const overflow = await page.evaluate(() => [...document.querySelectorAll('.phone-container, main, .claim-filter-panel, .history-detail-panel')]
            .filter(node => node.getClientRects().length && node.scrollWidth > node.clientWidth + 1)
            .map(node => node.className));
          assert.deepEqual(overflow, [], `${theme} ${width}px ${state} must fit horizontally`);
          if (width === 390) await page.screenshot({ path: path.join(__dirname, `payroll_history_${state}_${theme}.png`) });
          if (state !== 'list') await page.keyboard.press('Escape');
        }
      }
    }
    await page.reload({ waitUntil: 'networkidle0' });
    assert.equal(await shown(page, '#historyFilterModal'), false);
    await page.click('[data-history-kind="deduction"]');
    assert.equal((await refs(page)).length, 0, 'No deduction approval records may be invented');
    assert.equal(await shown(page, '#historyEmptyState'), true);
    assert.equal(await page.$eval('#historyCreateRequest', node => node.getAttribute('href')), 'deduction-request.html');
    await page.click('#historyCreateRequest');
    await page.waitForFunction(() => document.querySelector('#payrollSubmit')?.disabled === false);
    await page.select('#deductionType', 'HOUSING LOAN');
    await page.type('#accountNo', '001235');
    await page.type('#remarks', 'Please stop the housing loan deduction.');
    await page.evaluate(() => {
      const files = new DataTransfer();
      files.items.add(new File(['Payroll deduction attachment'], 'deduction.txt', { type: 'text/plain' }));
      const input = document.getElementById('payrollFiles');
      input.files = files.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.click('#payrollSubmit');
    await page.waitForFunction(() => document.querySelector('#payrollFormStatus')?.textContent === 'Saved on this device');
    await page.goto(`${url('options/history.html')}?category=deduction`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('.history-card-item');
    assert.deepEqual(await refs(page), ['EBB01:deduction']);
    const deduction = await page.$eval('.history-card-item', node => node.textContent);
    for (const expected of ['HOUSING LOAN', 'Draft', 'Stop Deduction', '202610', '1 Oct 2026', 'MONTH END']) assert.ok(deduction.includes(expected));
    await page.click('.history-card-item');
    const savedDetail = await page.$eval('#historyDetailBody', node => node.textContent);
    for (const expected of ['Sarah Jenkins', '#EBB01', '001235', 'Please stop the housing loan deduction.', 'deduction.txt']) assert.ok(savedDetail.includes(expected));
    assert.equal(await page.$eval('.history-attachment', async link => (await fetch(link.href)).text()), 'Payroll deduction attachment', 'Saved attachments must retain their actual file contents');
    await page.screenshot({ path: path.join(__dirname, 'payroll_history_deduction_details_light.png') });
    await page.keyboard.press('Escape');
    await filter(page, { historyStatus: 'draft', historyRebateItem: 'HOUSING LOAN', historyDescription: 'HOUSING LOAN' });
    assert.equal((await refs(page)).length, 1);
    await page.screenshot({ path: path.join(__dirname, 'payroll_history_deduction_list_light.png') });
    await page.click('.history-card-item');
    await page.evaluate(async () => {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open('peoplehcm-payroll-forms', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      await new Promise((resolve, reject) => {
        const transaction = db.transaction('requests', 'readwrite');
        const store = transaction.objectStore('requests');
        const request = store.get('EBB01:deduction');
        request.onsuccess = () => {
          const record = request.result;
          record.values.accountNo = '007777';
          record.attachments = [{ name: 'updated.txt', file: new File(['Updated attachment'], 'updated.txt', { type: 'text/plain' }) }];
          store.put(record);
        };
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
      });
      db.close();
      window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    });
    assert.equal(await shown(page, '#historyDetailsModal'), false, 'A restored page must close stale details after a request was edited');
    await page.waitForFunction(() => document.getElementById('payrollHistoryList').getAttribute('aria-busy') === 'false');
    assert.equal((await refs(page)).length, 1, 'Restoring History must replace saved drafts without duplicating records');
    await page.click('.history-card-item');
    assert.ok(await page.$eval('#historyDetailBody', node => node.textContent.includes('007777')));
    assert.equal(await page.$eval('.history-attachment', async link => (await fetch(link.href)).text()), 'Updated attachment');
    await page.keyboard.press('Escape');
    await page.click('[data-history-kind="tax"]');
    assert.equal((await refs(page)).length, 3, 'Each category must retain its own filters');

    // Compare Claims against its original card CSS to protect the shared-style extraction.
    const original = execFileSync('git', ['show', 'HEAD:modules/claims/options/history.html'], { cwd: path.resolve(__dirname, '..'), encoding: 'utf8' });
    const baselineStyles = original.slice(original.indexOf('    /* Claim History Cards'), original.indexOf('    /* Bottom Sheet Drawer Modal */'));
    await page.goto(pathToFileURL(path.resolve(__dirname, '../modules/claims/options/history.html')).href, { waitUntil: 'networkidle0' });
    await page.waitForSelector('.history-card-item');
    await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
    const cardAppearance = () => page.evaluate(() => ['.history-card-item', '.history-card-title', '.history-card-ref', '.history-card-details', '.status-pill'].map(selector => {
      const style = getComputedStyle(document.querySelector(selector));
      return Object.fromEntries(['color', 'background', 'border', 'border-radius', 'padding', 'font-size', 'font-weight', 'display', 'gap'].map(property => [property, style.getPropertyValue(property)]));
    }));
    for (const theme of ['dark', 'light']) {
      await page.evaluate(value => window.setTheme(value), theme);
      const shared = await cardAppearance();
      const baseline = await page.addStyleTag({ content: baselineStyles });
      assert.deepEqual(await cardAppearance(), shared, `${theme}: Claims history appearance must match its original styles`);
      await baseline.evaluate(node => node.remove());
    }
    assert.deepEqual(faults, []);
    console.log('PASS: Payroll History navigation, screenshot records, full details, filtering, empty/invalid states, modal focus, dark/light and responsive layouts.');
  } finally { await browser.close(); }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
