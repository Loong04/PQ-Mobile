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
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const url = pathToFileURL(path.resolve(__dirname, '../leave.html')).href;
    const overlay = '#historyDetailsModalOverlay';
    const actions = '#historyDetailsActions';
    for (const theme of ['light', 'dark']) {
      await page.setViewport({ width: 390, height: 844 });
      await page.goto(url, { waitUntil: 'networkidle0' });
      await page.evaluate(theme => {
        document.documentElement.dataset.theme = theme;
        showLeaveSection('viewMyLeaveHistory');
      }, theme);
      for (const width of [360, 390, 420]) {
        await page.setViewport({ width, height: 844 });
        for (const tab of ['leave', 'credit', 'offtime']) {
          await page.evaluate(tab => switchHistoryTab(tab), tab);
          const cards = await page.$$eval('#myHistoryCardsList .history-item-card', nodes => nodes.map(node => ({
            ref: node.dataset.ref,
            status: node.dataset.status,
            buttons: [...node.querySelectorAll('button')].map(button => button.textContent.trim())
          })));
          assert.ok(cards.length);
          for (const card of cards) {
            const expected = tab === 'offtime' || !['draft', 'submitted', 'approved'].includes(card.status)
              ? [] : card.status === 'draft' ? ['Apply', 'Cancel'] : ['Cancel'];
            assert.deepEqual(card.buttons, expected);
            await page.evaluate(ref => openHistoryDetailsModal(ref), card.ref);
            assert.deepEqual(await page.$$eval(`${actions} button`, buttons => buttons.map(button => button.textContent.trim())), expected,
              `${theme}/${width}/${card.ref}: details actions must match the card`);
            if (expected.length) {
              const layout = await page.$eval(actions, node => {
                const body = node.closest('.history-details-body');
                body.scrollTop = body.scrollHeight;
                const table = body.querySelector('table').getBoundingClientRect();
                const rects = [...node.querySelectorAll('button')].map(button => button.getBoundingClientRect());
                const bodyRect = body.getBoundingClientRect();
                return {
                  belowTable: rects.every(rect => rect.top >= table.bottom),
                  center: (rects[0].left + rects.at(-1).right) / 2,
                  tableCenter: (table.left + table.right) / 2,
                  visible: rects.every(rect => rect.top >= bodyRect.top && rect.bottom <= bodyRect.bottom + 1),
                  fits: body.scrollWidth <= body.clientWidth + 1
                };
              });
              assert.ok(layout.belowTable && layout.visible && layout.fits);
              assert.ok(Math.abs(layout.center - layout.tableCenter) < 2, 'Actions must be centered below the table');
              if (width === 390 && tab === 'leave' && ['draft', 'submitted'].includes(card.status)) {
                await page.screenshot({ path: path.join(__dirname, `leave_history_details_${card.status}_${theme}.png`) });
              }
            }
            await page.evaluate(() => closeHistoryDetailsModal());
          }
        }
      }
      await page.evaluate(() => {
        switchHistoryTab('leave');
        openHistoryDetailsModal('LV-2026-0055');
        const body = document.querySelector('.history-details-body');
        body.scrollTop = body.scrollHeight;
      });
      await page.click(`${actions} button:first-child`);
      await page.waitForFunction(() => HISTORY_LEAVE_DATA[0].status === 'submitted');
      assert.deepEqual(await page.$$eval(`${actions} button`, buttons => buttons.map(button => button.textContent.trim())), ['Cancel']);
      assert.match(await page.$eval('#historyDetailsTableBody', node => node.textContent), /Submitted/);
      assert.deepEqual(await page.$$eval('#myHistoryCardsList [data-ref="LV-2026-0055"] button', buttons => buttons.map(button => button.textContent.trim())), ['Cancel']);

      page.once('dialog', dialog => dialog.dismiss());
      await page.click(`${actions} button`);
      assert.equal(await page.evaluate(() => HISTORY_LEAVE_DATA[0].status), 'submitted');
      assert.equal(await page.$eval(overlay, node => getComputedStyle(node).display), 'flex');
      page.once('dialog', dialog => dialog.accept());
      await page.click(`${actions} button`);
      await page.waitForFunction(() => HISTORY_LEAVE_DATA[0].status === 'cancelled');
      assert.equal(await page.$$eval(`${actions} button`, nodes => nodes.length), 0);
      assert.equal(await page.$$eval('#myHistoryCardsList [data-ref="LV-2026-0055"] button', nodes => nodes.length), 0);
      assert.match(await page.$eval('#historyDetailsTableBody', node => node.textContent), /Cancelled/);

      // A delayed card action must never replace a different record opened meanwhile.
      await page.evaluate(() => {
        closeHistoryDetailsModal();
        cancelHistoryItem('LV-2026-0055', 'submitted');
        openHistoryDetailsModal('LV-2026-0041');
      });
      await page.waitForFunction(() => HISTORY_LEAVE_DATA[0].status === 'submitted');
      assert.match(await page.$eval('#historyDetailsTableBody', node => node.textContent), /LV-2026-0041/);
    }
    assert.deepEqual(errors, []);
    console.log('PASS: Leave History details mirror card actions, centered below the table across both themes and three widths; Apply/Cancel update both views and cancellation can be dismissed.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
