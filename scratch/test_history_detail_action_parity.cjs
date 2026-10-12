const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const requested = (process.argv.find(arg => arg.startsWith('--only=')) || '').split('=')[1] || '';
const screenshotsRequested = process.argv.includes('--screenshots');

async function actionLabels(page, selector) {
  return page.$$eval(`${selector} .history-detail-action:not([data-history-detail-aux])`, nodes => nodes.map(node => node.textContent.trim()));
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
          padding: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft],
          disabled: button.disabled
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
    if (button.disabled) assert.equal(button.boxShadow, 'none');
    else assert.match(button.boxShadow, /rgba\(124, 58, 237,/);
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

async function runAttendanceHistory(browser) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewport({ width: 390, height: 950 });
  await page.goto(pathToFileURL(path.join(root, 'modules/attendance/options/history.html')).href + '?theme=dark', { waitUntil: 'networkidle0' });

  await page.$eval('#viewClockingHistory .history-card-item', node => node.click());
  assert.deepEqual(await actionLabels(page, '#clockDetailsModal .history-detail-actions'), ['Cancel']);
  await assertPurpleActions(page, '#clockDetailsModal .history-detail-actions');
  await page.evaluate(() => closeClockDetailsDirect());

  await page.click('#tabOt');
  await page.$eval('#viewOtHistory .history-card-item', node => node.click());
  assert.deepEqual(await actionLabels(page, '#otDetailsModal .history-detail-actions'), ['Cancel', 'Submit']);
  await assertPurpleActions(page, '#otDetailsModal .history-detail-actions');
  await page.evaluate(() => closeOtDetailsDirect());

  await page.click('#tabFeedback');
  await page.$eval('#viewFeedbackHistory .history-card-item', node => node.click());
  assert.deepEqual(await actionLabels(page, '#feedbackDetailsModal .history-detail-actions'), ['Cancel', 'Submit']);
  await assertPurpleActions(page, '#feedbackDetailsModal .history-detail-actions');
  await page.evaluate(() => closeFeedbackDetailsDirect());
  assert.deepEqual(errors, []);
  await page.close();
}

async function runAttendanceFeedback(browser) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewport({ width: 390, height: 950 });
  await page.goto(pathToFileURL(path.join(root, 'modules/attendance/options/feedback-history.html')).href + '?theme=dark', { waitUntil: 'networkidle0' });
  const cardSelector = '.pending-feedback-record:first-of-type';
  assert.deepEqual(await page.$$eval(`${cardSelector} .history-card-actions button`, nodes => nodes.map(node => node.textContent.trim())), ['Change Shift', 'Feedback']);
  await page.evaluate(() => {
    window.__historyActionCalls = [];
    window.openSharedAttendanceForm = function (kind, card) {
      window.__historyActionCalls.push({
        kind,
        date: card.dataset.date,
        shift: card.dataset.shift,
        employeeName: 'Farhan binti rahmat',
        employeeNo: 'EBB12',
        detailsClosed: document.getElementById('attendanceDetailsModalOverlay').hidden
      });
    };
  });

  await page.$eval(`${cardSelector} .btn-shift-change`, node => node.click());
  assert.equal(await page.$eval('#attendanceDetailsModalOverlay', node => node.hidden), true, 'Card action must not open details');
  const cardCall = await page.evaluate(() => window.__historyActionCalls.at(-1));

  await page.$eval(`${cardSelector} .pending-feedback-details-trigger`, node => node.click());
  assert.deepEqual(await actionLabels(page, '#attendanceDetailsActions'), ['Change Shift', 'Feedback']);
  await assertPurpleActions(page, '#attendanceDetailsActions');
  await page.$eval('#attendanceDetailsActions [data-attendance-history-action=shift]', node => node.click());
  const detailShiftCall = await page.evaluate(() => window.__historyActionCalls.at(-1));
  assert.deepEqual(detailShiftCall, { ...cardCall, detailsClosed: true });

  await page.$eval(`${cardSelector} .pending-feedback-details-trigger`, node => node.click());
  await page.$eval('#attendanceDetailsActions [data-attendance-history-action=feedback]', node => node.click());
  const detailFeedbackCall = await page.evaluate(() => window.__historyActionCalls.at(-1));
  assert.deepEqual(detailFeedbackCall, {
    kind: 'feedback',
    date: cardCall.date,
    shift: cardCall.shift,
    employeeName: cardCall.employeeName,
    employeeNo: cardCall.employeeNo,
    detailsClosed: true
  });
  assert.deepEqual(errors, []);
  await page.close();
}

async function runClaims(browser) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewport({ width: 390, height: 900 });
  await page.goto(pathToFileURL(path.join(root, 'modules/claims/options/history.html')).href + '?theme=dark', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    window.__claimHistoryToasts = [];
    window.showToast = message => window.__claimHistoryToasts.push(message);
  });
  const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const tabs = ['benefit', 'medical', 'ot', 'travel', 'travelRequest', 'entertainment', 'advance', 'expense'];
  for (const tab of tabs) {
    await page.evaluate(tab => switchClaimTab(tab), tab);
    await settle();
    const card = await page.$eval('#claimHistoryListContainer .history-card-item', node => ({
      status: node.dataset.status,
      labels: [...node.querySelectorAll('.history-card-actions button')].map(button => button.textContent.trim())
    }));
    assert.ok(card.labels.length, `${tab} fixture must expose a card action`);
    await page.$eval('#claimHistoryListContainer .history-card-item', node => node.click());
    assert.deepEqual(await actionLabels(page, '#claimDetailsModalContainer .history-detail-actions'), card.labels, `${tab} detail actions mirror its card`);
    await assertPurpleActions(page, '#claimDetailsModalContainer .history-detail-actions');
    const beforeStatus = await page.$eval('#claimHistoryListContainer .history-card-item', node => node.dataset.status);
    await page.$eval('#claimDetailsModalContainer .history-detail-action', node => node.click());
    assert.equal(await page.$eval('#claimHistoryListContainer .history-card-item', node => node.dataset.status), beforeStatus, 'Claims actions preserve their existing non-mutating behavior');
    assert.ok((await page.evaluate(() => window.__claimHistoryToasts.length)) > 0);
    await page.evaluate(() => closeDetailsModal());
  }

  await page.evaluate(() => switchClaimTab('benefit'));
  await settle();
  const draftIndex = await page.$$eval('#claimHistoryListContainer .history-card-item', nodes => nodes.findIndex(node => node.dataset.status === 'draft'));
  assert.ok(draftIndex >= 0);
  const draftLabels = await page.$$eval('#claimHistoryListContainer .history-card-item', (nodes, index) => [...nodes[index].querySelectorAll('.history-card-actions button')].map(button => button.textContent.trim()), draftIndex);
  assert.deepEqual(draftLabels, ['Submit', 'Cancel']);
  await page.$$eval('#claimHistoryListContainer .history-card-item', (nodes, index) => nodes[index].click(), draftIndex);
  assert.deepEqual(await actionLabels(page, '#claimDetailsModalContainer .history-detail-actions'), ['Submit', 'Cancel']);
  await page.evaluate(() => closeDetailsModal());

  await page.$eval('#claimHistoryListContainer .history-card-item .history-cancel-btn', node => node.click());
  assert.equal(await page.$eval('#detailsModalOverlay', node => node.classList.contains('active')), false, 'Card action click must not open details');

  await page.evaluate(() => {
    HISTORY_DATA.benefit[0].status = 'rejected';
    renderClaimHistoryList();
  });
  await page.$eval('#claimHistoryListContainer .history-card-item', node => node.click());
  assert.equal(await page.$eval('#claimDetailsModalContainer .history-detail-actions', node => node.hidden), true);
  assert.deepEqual(errors, []);
  await page.close();
}

async function runPayroll(browser) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewport({ width: 390, height: 844 });
  const url = pathToFileURL(path.join(root, 'modules/payroll/options/history.html')).href;
  await page.goto(url + '?theme=dark', { waitUntil: 'networkidle0' });
  await page.waitForSelector('[data-reference=RBT000000000039]');
  assert.deepEqual(await page.$$eval('[data-reference=RBT000000000039] [data-history-action]', nodes => nodes.map(node => node.textContent.trim())), ['Cancel']);
  await page.$eval('[data-reference=RBT000000000039] .history-card-main', node => node.click());
  assert.deepEqual(await actionLabels(page, '#historyDetailActions'), ['Cancel']);
  await assertPurpleActions(page, '#historyDetailActions');
  await page.$eval('#historyDetailActions [data-history-action=cancel]', node => node.click());
  await page.waitForFunction(() => document.querySelector('[data-reference=RBT000000000039]')?.dataset.status === 'cancelled');
  assert.equal(await page.$eval('#historyDetailsModal', node => node.getAttribute('aria-hidden')), 'false');
  assert.equal(await page.$eval('#historyDetailActions', node => node.hidden), true);
  await page.keyboard.press('Escape');

  await page.$eval('[data-history-kind=deduction]', node => node.click());
  await page.waitForSelector('[data-reference=PDR000000000004]');
  assert.deepEqual(await page.$$eval('[data-reference=PDR000000000004] [data-history-action]', nodes => nodes.map(node => node.textContent.trim())), ['Submit', 'Cancel']);
  await page.$eval('[data-reference=PDR000000000004] .history-card-main', node => node.click());
  assert.deepEqual(await actionLabels(page, '#historyDetailActions'), ['Submit', 'Cancel']);
  await page.$eval('#historyDetailActions [data-history-action=submit]', node => node.click());
  await page.waitForFunction(() => document.querySelector('[data-reference=PDR000000000004]')?.dataset.status === 'submitted');
  assert.deepEqual(await actionLabels(page, '#historyDetailActions'), ['Cancel']);
  assert.match(await page.$eval('#historyDetailBody', node => node.textContent), /Submitted/);

  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('[data-reference=PDR000000000004]');
  await page.$eval('[data-reference=PDR000000000004] .history-card-main', node => node.click());
  await page.$eval('#historyDetailActions [data-history-action=discard]', node => node.click());
  await page.waitForFunction(() => !document.querySelector('[data-reference=PDR000000000004]'));
  assert.equal(await page.$eval('#historyDetailsModal', node => node.getAttribute('aria-hidden')), 'true');
  assert.deepEqual(errors, []);
  await page.close();
}

async function runProject(browser) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewport({ width: 390, height: 900 });
  const url = pathToFileURL(path.join(root, 'modules/project-task/options/history.html')).href + '?theme=dark';
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.projectHistoryReady === 'true');

  const workPlanDraft = '#workPlanHistoryList [data-record-id="WP-2026-0039"]';
  assert.deepEqual(
    await page.$$eval(`${workPlanDraft} [data-history-action]`, nodes => nodes.map(node => node.textContent.trim())),
    ['Submit', 'Cancel']
  );
  await page.$eval(workPlanDraft, node => node.click());
  await page.waitForSelector('#projectHistoryDetailOverlay.is-open');
  assert.deepEqual(await actionLabels(page, '#projectHistoryDetailActions'), ['Submit', 'Cancel']);
  await assertPurpleActions(page, '#projectHistoryDetailActions');

  await page.$eval('#projectHistoryDetailActions [data-history-action=submit]', node => node.click());
  await page.waitForFunction(selector => document.querySelector(selector)?.dataset.status === 'submitted', {}, workPlanDraft);
  assert.equal(await page.$eval('#projectHistoryDetailOverlay', node => node.hidden), false);
  assert.deepEqual(await actionLabels(page, '#projectHistoryDetailActions'), ['Cancel']);
  assert.match(await page.$eval('#projectHistoryDetailContent', node => node.textContent), /Submitted/);

  await page.$eval('#projectHistoryDetailActions [data-history-action=cancel]', node => node.click());
  await page.waitForFunction(selector => document.querySelector(selector)?.dataset.status === 'cancelled', {}, workPlanDraft);
  assert.equal(await page.$eval('#projectHistoryDetailActions', node => node.hidden), true);
  await page.$eval('#closeProjectHistoryDetails', node => node.click());

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.projectHistoryReady === 'true');
  await page.$eval(`${workPlanDraft} [data-history-action=submit]`, node => node.click());
  assert.equal(await page.$eval('#projectHistoryDetailOverlay', node => node.hidden), true, 'Card action must not open details');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.projectHistoryReady === 'true');
  await page.$eval(workPlanDraft, node => node.click());
  await page.waitForSelector('#projectHistoryDetailOverlay.is-open');
  await page.$eval('#projectHistoryDetailActions [data-history-action=discard]', node => node.click());
  await page.waitForFunction(selector => !document.querySelector(selector), {}, workPlanDraft);
  assert.equal(await page.$eval('#projectHistoryDetailOverlay', node => node.hidden), true);

  await page.evaluate(() => {
    localStorage.setItem('pq_project_timesheet_draft', JSON.stringify({
      date: '2026-10-12',
      remark: 'Local draft parity check',
      status: 'Draft',
      activities: []
    }));
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.projectHistoryReady === 'true');
  await page.$eval('#historyTab-timesheet', node => node.click());
  const timesheetDraft = '#timesheetHistoryList [data-record-id="TS-DRAFT-LOCAL"]';
  assert.deepEqual(
    await page.$$eval(`${timesheetDraft} [data-history-action]`, nodes => nodes.map(node => node.textContent.trim())),
    ['Submit', 'Cancel']
  );
  await page.$eval(timesheetDraft, node => node.click());
  await page.waitForSelector('#projectHistoryDetailOverlay.is-open');
  assert.deepEqual(await actionLabels(page, '#projectHistoryDetailActions'), ['Submit', 'Cancel']);
  await assertPurpleActions(page, '#projectHistoryDetailActions');
  await page.$eval('#projectHistoryDetailActions [data-history-action=discard]', node => node.click());
  await page.waitForFunction(selector => !document.querySelector(selector), {}, timesheetDraft);
  assert.equal(await page.evaluate(() => localStorage.getItem('pq_project_timesheet_draft')), null);
  assert.equal(await page.$eval('#projectHistoryDetailOverlay', node => node.hidden), true);

  assert.deepEqual(errors, []);
  await page.close();
}

async function runNoActions(browser) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewport({ width: 390, height: 900 });

  await page.goto(pathToFileURL(path.join(root, 'modules/employee-career/options/history.html')).href + '?category=feedback&theme=dark', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-record-id="feedback-1"]');
  assert.equal(await page.$$eval('[data-record-id="feedback-1"] :is(.history-card-actions, [data-history-action], .history-detail-action)', nodes => nodes.length), 0);
  await page.$eval('[data-record-id="feedback-1"]', node => node.click());
  await page.waitForSelector('#historyDetailsModal[aria-hidden="false"]');
  assert.equal(await page.$('#historyDetailsModal .history-detail-actions'), null);
  assert.equal(await page.$$eval('#historyDetailsModal .history-detail-action', nodes => nodes.length), 0);

  await page.goto(pathToFileURL(path.join(root, 'leave.html')).href + '?theme=dark', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    showLeaveSection('viewMyLeaveHistory');
    switchHistoryTab('offtime');
  });
  const timeOffCard = '#myHistoryCardsList [data-ref="OT-2026-0008"]';
  await page.waitForSelector(timeOffCard);
  assert.equal(await page.$$eval(`${timeOffCard} button`, nodes => nodes.length), 0);
  await page.$eval(timeOffCard, node => node.click());
  await page.waitForFunction(() => getComputedStyle(document.getElementById('historyDetailsModalOverlay')).display === 'flex');
  assert.equal(await page.$eval('#historyDetailsActions', node => node.hidden), true);
  assert.equal(await page.$$eval('#historyDetailsActions .history-detail-action', nodes => nodes.length), 0);

  await page.goto(pathToFileURL(path.join(root, 'modules/attendance/options/history.html')).href + '?theme=dark', { waitUntil: 'networkidle0' });
  const clockingCard = '#viewClockingHistory .history-card-item:first-of-type';
  assert.equal(
    await page.$$eval(`${clockingCard} :is(.history-card-actions, button, [data-history-action], [data-attendance-history-action])`, nodes => nodes.length),
    0
  );
  await page.$eval(clockingCard, node => node.click());
  assert.deepEqual(await actionLabels(page, '#clockDetailsModal .history-detail-actions'), ['Cancel']);
  assert.equal(
    await page.$$eval('#clockDetailsModal [data-history-action], #clockDetailsModal [data-attendance-history-action]', nodes => nodes.length),
    0,
    'Action-free Clocking records keep only their existing detail dismiss control'
  );

  assert.deepEqual(errors, []);
  await page.close();
}

async function captureVisualEvidence(browser) {
  const outputDir = path.join(root, 'scratch', 'history-detail-action-parity');
  fs.mkdirSync(outputDir, { recursive: true });
  const cases = [
    {
      name: 'workplace-letter',
      url: 'modules/admin/options/history.html',
      actionSelector: '#historyDetailActions',
      open: async page => {
        await page.evaluate(() => {
          localStorage.setItem('peoplehcm:workplace:history:v1', JSON.stringify([{
            id: 'visual-letter-approved', kind: 'letter-request', title: 'Employment Letter', date: '2026-10-11', status: 'approved', createdAt: '2026-10-12T02:00:00.000Z',
            fields: [['Reference #', 'DRQ-VISUAL-1'], ['Request Date', '2026-10-11'], ['Type', 'Employment Letter'], ['Status', 'Approved']]
          }]));
          localStorage.setItem('peoplehcm:workplace:history:samples:v1', '1');
          localStorage.setItem('peoplehcm:workplace:history:cancelled-to-submitted:v1', '1');
        });
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.$eval('[data-history-kind=letter-request]', node => node.click());
        await page.$eval('[data-record-id=visual-letter-approved] .history-card-main', node => node.click());
        await page.waitForSelector('#historyDetailsModal[aria-hidden="false"]');
      }
    },
    {
      name: 'leave-draft',
      url: 'leave.html',
      actionSelector: '#historyDetailsActions',
      open: async page => {
        await page.evaluate(() => {
          showLeaveSection('viewMyLeaveHistory');
          switchHistoryTab('leave');
          const ref = document.querySelector('#myHistoryCardsList [data-status=draft]').dataset.ref;
          openHistoryDetailsModal(ref);
        });
        await page.waitForFunction(() => getComputedStyle(document.getElementById('historyDetailsModalOverlay')).display === 'flex');
      }
    },
    {
      name: 'attendance-feedback',
      url: 'modules/attendance/options/feedback-history.html',
      actionSelector: '#attendanceDetailsActions',
      open: async page => {
        await page.$eval('.pending-feedback-record:first-of-type .pending-feedback-details-trigger', node => node.click());
        await page.waitForFunction(() => !document.getElementById('attendanceDetailsModalOverlay').hidden);
      }
    },
    {
      name: 'payroll-draft',
      url: 'modules/payroll/options/history.html',
      actionSelector: '#historyDetailActions',
      open: async page => {
        await page.waitForSelector('[data-history-kind=deduction]');
        await page.$eval('[data-history-kind=deduction]', node => node.click());
        await page.waitForSelector('[data-reference=PDR000000000004]');
        await page.$eval('[data-reference=PDR000000000004] .history-card-main', node => node.click());
        await page.waitForSelector('#historyDetailsModal[aria-hidden="false"]');
      }
    },
    {
      name: 'claims-draft',
      url: 'modules/claims/options/history.html',
      actionSelector: '#claimDetailsModalContainer .history-detail-actions',
      open: async page => {
        await page.evaluate(() => switchClaimTab('benefit'));
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        await page.$$eval('#claimHistoryListContainer .history-card-item', nodes => nodes.find(node => node.dataset.status === 'draft').click());
        await page.waitForFunction(() => document.getElementById('detailsModalOverlay').classList.contains('active'));
      }
    },
    {
      name: 'project-draft',
      url: 'modules/project-task/options/history.html',
      actionSelector: '#projectHistoryDetailActions',
      open: async page => {
        await page.waitForFunction(() => document.documentElement.dataset.projectHistoryReady === 'true');
        await page.$eval('#workPlanHistoryList [data-record-id="WP-2026-0039"]', node => node.click());
        await page.waitForSelector('#projectHistoryDetailOverlay.is-open');
      }
    }
  ];

  for (const theme of ['light', 'dark']) {
    for (const width of [360, 420]) {
      for (const visualCase of cases) {
        const page = await browser.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.setViewport({ width, height: 900 });
        const url = pathToFileURL(path.join(root, visualCase.url)).href + '?theme=' + theme;
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await visualCase.open(page);
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 180)));
        assert.deepEqual(errors, [], `${visualCase.name} ${theme} ${width}px page errors`);
        await assertPurpleActions(page, visualCase.actionSelector);
        const footerLayout = await page.$eval(visualCase.actionSelector, footer => {
          const rect = footer.getBoundingClientRect();
          const visibleButtons = [...footer.querySelectorAll('.history-detail-action')]
            .filter(button => button.getClientRects().length);
          return {
            hidden: footer.hidden,
            buttonCount: visibleButtons.length,
            left: rect.left,
            right: rect.right,
            viewportWidth: document.documentElement.clientWidth
          };
        });
        assert.equal(footerLayout.hidden, false, `${visualCase.name} footer must be visible`);
        assert.ok(footerLayout.buttonCount > 0, `${visualCase.name} footer must not be empty`);
        assert.ok(footerLayout.left >= -1 && footerLayout.right <= footerLayout.viewportWidth + 1, `${visualCase.name} footer must not clip at ${width}px`);
        await page.screenshot({ path: path.join(outputDir, `${visualCase.name}-${theme}-${width}.png`) });
        await page.close();
      }
    }
  }
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
    if (!requested || requested === 'attendance-history') await runAttendanceHistory(browser);
    if (!requested || requested === 'attendance-feedback') await runAttendanceFeedback(browser);
    if (!requested || requested === 'claims') await runClaims(browser);
    if (!requested || requested === 'payroll') await runPayroll(browser);
    if (!requested || requested === 'project') await runProject(browser);
    if (!requested || requested === 'no-actions') await runNoActions(browser);
    if (screenshotsRequested) await captureVisualEvidence(browser);
    if (requested && !['style', 'workplace', 'leave', 'attendance-history', 'attendance-feedback', 'claims', 'payroll', 'project', 'no-actions'].includes(requested)) throw new Error(`Parity case not implemented yet: ${requested}`);
  } finally {
    await browser.close();
  }
  console.log(`PASS: History detail action parity${requested ? ` (${requested})` : ''}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
