const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const requested = (process.argv.find(arg => arg.startsWith('--only=')) || '').split('=')[1] || '';

async function actionLabels(page, selector) {
  return page.$$eval(`${selector} .history-detail-action`, nodes => nodes.map(node => node.textContent.trim()));
}

async function assertPurpleActions(page, selector) {
  const state = await page.$eval(selector, node => {
    const footer = getComputedStyle(node);
    const buttons = [...node.querySelectorAll('.history-detail-action')];
    return {
      footer: {
        display: footer.display,
        justifyContent: footer.justifyContent,
        gap: footer.gap
      },
      buttons: buttons.map(button => {
        const style = getComputedStyle(button);
        return {
          backgroundImage: style.backgroundImage,
          borderRadius: style.borderRadius,
          boxShadow: style.boxShadow,
          color: style.color,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          padding: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft]
        };
      }),
      viewportWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth
    };
  });

  assert.equal(state.footer.display, 'flex');
  assert.equal(state.footer.justifyContent, 'flex-end');
  assert.equal(state.footer.gap, '8px');
  assert.ok(state.buttons.length > 0);
  state.buttons.forEach(button => {
    assert.match(button.backgroundImage, /linear-gradient\(135deg, rgb\(124, 58, 237\)(?: 0%)?, rgb\(109, 40, 217\)(?: 100%)?\)/);
    assert.equal(button.borderRadius, '20px');
    assert.match(button.boxShadow, /rgba\(124, 58, 237,/);
    assert.equal(button.color, 'rgb(255, 255, 255)');
    assert.equal(button.fontSize, '12px');
    assert.equal(button.fontWeight, '700');
    assert.deepEqual(button.padding, ['8px', '16px', '8px', '16px']);
  });
  assert.ok(state.scrollWidth <= state.viewportWidth + 1, 'Detail actions must not overflow the viewport');
}

async function runStyle(browser) {
  for (const theme of ['light', 'dark']) {
    for (const width of [360, 420]) {
      const page = await browser.newPage();
      await page.setViewport({ width, height: 760 });
      await page.setContent(`<!doctype html><html data-theme=${theme}><body>
        <main style=width:min(100%,420px);margin:auto>
          <footer id=testActions class=history-detail-actions>
            <button type=button class=history-detail-action>Submit</button>
            <button type=button class=history-detail-action>Cancel</button>
          </footer>
        </main>
      </body></html>`);
      await page.addStyleTag({ path: path.join(root, 'css/detail-popout.css') });
      await new Promise(resolve => setTimeout(resolve, 250));
      assert.deepEqual(await actionLabels(page, '#testActions'), ['Submit', 'Cancel']);
      await assertPurpleActions(page, '#testActions');
      await page.close();
    }
  }
}

async function runWorkplace(browser) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewport({ width: 390, height: 844 });
  const url = pathToFileURL(path.join(root, 'modules/admin/options/history.html')).href + '?theme=dark';
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    const rows = [
      { id: 'parity-guest-draft', kind: 'guest-visit', title: 'Guest Visit', date: '2026-10-12', status: 'draft', createdAt: '2026-10-12T03:00:00.000Z', fields: [['Reference #', 'FGV-PARITY-1'], ['Visit Date', '2026-10-12'], ['Visit Time', '09:00 – 10:00'], ['Visitor', '1']] },
      { id: 'parity-letter-approved', kind: 'letter-request', title: 'Employment Letter', date: '2026-10-11', status: 'approved', createdAt: '2026-10-12T02:00:00.000Z', fields: [['Reference #', 'DRQ-PARITY-1'], ['Request Date', '2026-10-11'], ['Type', 'Employment Letter']] },
      { id: 'parity-inventory-submitted', kind: 'inventory-request', title: 'Laptop', date: '2026-10-10', status: 'submitted', createdAt: '2026-10-12T01:00:00.000Z', fields: [['Reference #', 'IRQ-PARITY-1'], ['Request Date', '2026-10-10'], ['Inventory Item', 'Laptop'], ['Quantity', '1']] }
    ];
    localStorage.setItem('peoplehcm:workplace:history:v1', JSON.stringify(rows));
    localStorage.setItem('peoplehcm:workplace:history:samples:v1', '1');
    localStorage.setItem('peoplehcm:workplace:history:cancelled-to-submitted:v1', '1');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });

  assert.deepEqual(await page.$$eval('[data-record-id=parity-guest-draft] [data-history-action]', nodes => nodes.map(node => node.textContent.trim())), ['Apply', 'Cancel']);
  await page.$eval('[data-record-id=parity-guest-draft] .history-card-main', node => node.click());
  assert.deepEqual(await actionLabels(page, '#historyDetailActions'), ['Apply', 'Cancel']);
  await assertPurpleActions(page, '#historyDetailActions');

  await page.$eval('#historyDetailActions [data-history-action=apply]', node => node.click());
  await page.waitForFunction(() => document.querySelector('[data-record-id=parity-guest-draft]')?.dataset.status === 'submitted');
  assert.equal(await page.$eval('#historyDetailsModal', node => node.getAttribute('aria-hidden')), 'false');
  assert.deepEqual(await actionLabels(page, '#historyDetailActions'), ['Cancel']);
  assert.match(await page.$eval('#historyDetailBody', node => node.textContent), /Submitted/);

  await page.$eval('#historyDetailActions [data-history-action=cancel]', node => node.click());
  await page.waitForFunction(() => document.querySelector('[data-record-id=parity-guest-draft]')?.dataset.status === 'cancelled');
  assert.equal(await page.$eval('#historyDetailActions', node => node.hidden), true);
  await page.keyboard.press('Escape');

  await page.$eval('[data-history-kind=letter-request]', node => node.click());
  assert.deepEqual(await page.$$eval('[data-record-id=parity-letter-approved] [data-history-action]', nodes => nodes.map(node => node.textContent.trim())), ['Cancel']);
  await page.$eval('[data-record-id=parity-letter-approved] .history-card-main', node => node.click());
  assert.deepEqual(await actionLabels(page, '#historyDetailActions'), ['Cancel']);
  await page.keyboard.press('Escape');

  await page.$eval('[data-history-kind=inventory-request]', node => node.click());
  assert.deepEqual(await page.$$eval('[data-record-id=parity-inventory-submitted] [data-history-action]', nodes => nodes.map(node => node.textContent.trim())), ['Cancel']);
  await page.$eval('[data-record-id=parity-inventory-submitted] [data-history-action=cancel]', node => node.click());
  assert.equal(await page.$eval('#historyDetailsModal', node => node.getAttribute('aria-hidden')), 'true', 'Card actions must not open details');

  await page.evaluate(() => {
    const rows = JSON.parse(localStorage.getItem('peoplehcm:workplace:history:v1'));
    const row = rows.find(item => item.id === 'parity-inventory-submitted');
    row.status = 'submitted';
    localStorage.setItem('peoplehcm:workplace:history:v1', JSON.stringify(rows));
    window.dispatchEvent(new StorageEvent('storage'));
  });
  await page.$eval('[data-record-id=parity-inventory-submitted] .history-card-main', node => node.click());
  await page.evaluate(() => {
    const rows = JSON.parse(localStorage.getItem('peoplehcm:workplace:history:v1'));
    localStorage.setItem('peoplehcm:workplace:history:v1', JSON.stringify(rows.filter(row => row.id !== 'parity-inventory-submitted')));
  });
  await page.$eval('#historyDetailActions [data-history-action=cancel]', node => node.click());
  await page.waitForFunction(() => document.getElementById('historyDetailsModal').getAttribute('aria-hidden') === 'true');
  assert.match(await page.$eval('#historyActionFeedback', node => node.textContent), /Unable to update/);
  assert.deepEqual(errors, []);
  await page.close();
}

async function runLeave(browser) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(pathToFileURL(path.join(root, 'leave.html')).href, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    document.documentElement.dataset.theme = 'dark';
    showLeaveSection('viewMyLeaveHistory');
    switchHistoryTab('leave');
  });
  const draft = await page.$eval('#myHistoryCardsList [data-status=draft]', node => ({
    ref: node.dataset.ref,
    actions: [...node.querySelectorAll('button')].map(button => button.textContent.trim())
  }));
  assert.deepEqual(draft.actions, ['Apply', 'Cancel']);
  await page.evaluate(ref => openHistoryDetailsModal(ref), draft.ref);
  assert.deepEqual(await actionLabels(page, '#historyDetailsActions'), ['Apply', 'Cancel']);
  await assertPurpleActions(page, '#historyDetailsActions');
  assert.equal(await page.$eval('#historyDetailsActions', node => node.parentElement.classList.contains('history-details-dialog')), true);
  await page.evaluate(() => closeHistoryDetailsModal());

  const terminal = await page.$eval('#myHistoryCardsList [data-status=rejected], #myHistoryCardsList [data-status=cancelled]', node => node.dataset.ref);
  await page.evaluate(ref => openHistoryDetailsModal(ref), terminal);
  assert.equal(await page.$eval('#historyDetailsActions', node => node.hidden), true);
  assert.deepEqual(errors, []);
  await page.close();
}

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--allow-file-access-from-files']
  });
  try {
    if (!requested || requested === 'style') await runStyle(browser);
    if (!requested || requested === 'workplace') await runWorkplace(browser);
    if (!requested || requested === 'leave') await runLeave(browser);
    if (requested && !['style', 'workplace', 'leave'].includes(requested)) throw new Error(`Parity case not implemented yet: ${requested}`);
  } finally {
    await browser.close();
  }
  console.log(`PASS: History detail action parity${requested ? ` (${requested})` : ''}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
