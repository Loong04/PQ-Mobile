const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

// Catch collapsed approver metadata, wrong record dates, lost amendments,
// and edit/delete actions leaking into a read-only feedback document.
(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const theme of ['light', 'dark']) {
      await page.setViewport({ width: 360, height: 950 });
      await page.goto(pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/history.html')).href + '?theme=' + theme, { waitUntil: 'networkidle0' });
      await page.click('#tabFeedback');
      await page.$$eval('#viewFeedbackHistory .history-card-item', nodes => nodes[0].click());
      await page.waitForSelector('#feedbackDetailsModal', { visible: true });
      assert.ok(await page.$eval('#modalFbkApproverComments', node => node.tagName === 'TEXTAREA' && node.readOnly && !node.closest('table') && !!node.closest('.detail-popout-comments')), 'Existing approval comment card with a read-only field is used outside the table');
      assert.equal(await page.$eval('#modalFbkApproverComments', node => node.value), '[Comment by FARHAN BIN RAHMAT (EBB12)]\nokay');
      assert.equal(await page.$eval('label[for="modalFbkApproverComments"]', node => node.textContent), 'Approver Comments');
      assert.deepEqual(await page.$$eval('#modalFbkPunchDays button', nodes => nodes.map(node => node.textContent.trim())), ['+ 30 Dec', '+ 31 Dec', '+ 1 Jan']);
      assert.deepEqual(await page.$$eval('#modalFbkPunches input', nodes => nodes.map(node => node.value)), ['06:02', '10:00']);
      await page.$eval('#modalFbkPunches input', input => { input.value = '0630'; input.dispatchEvent(new Event('input', { bubbles: true })); });
      assert.equal(await page.$eval('#modalFbkPunches input', node => node.value), '06:30');
      for (let i = 0; i < 3; i++) await page.$eval('#modalFbkPunchDays button:first-child', node => node.click());
      assert.equal(await page.$$eval('#modalFbkPunches [data-punch-row]', nodes => nodes.length), 5);
      assert.equal(await page.$eval('#modalFbkPunches [data-punch-row]:last-child time', node => node.dateTime), '2025-12-30');
      assert.equal(await page.$eval('#modalFbkPunches input:last-of-type', node => node.checkValidity()), true);
      await page.$eval('#modalFbkPunchDelete', node => node.click());
      assert.equal(await page.$$eval('#modalFbkPunches [data-punch-row]', nodes => nodes.length), 4);
      assert.ok(await page.$eval('#modalFbkPunches', node => node.scrollWidth > node.clientWidth));
      assert.ok(await page.$eval('#feedbackDetailsModal .attendance-history-modal-body', node => node.scrollWidth <= node.clientWidth + 1));
      await page.$eval('#modalFbkPunches input', input => { input.value = '29:99'; input.dispatchEvent(new Event('input', { bubbles: true })); });
      assert.equal(await page.$eval('#historyFeedbackForm', node => node.checkValidity()), false);
      await page.$eval('#modalFbkPunches input', input => { input.value = '06:30'; input.dispatchEvent(new Event('input', { bubbles: true })); });
      await page.evaluate(() => saveHistoryDetailDraft('feedback'));
      await page.waitForSelector('#feedbackDetailsModal', { hidden: true });
      await page.$$eval('#viewFeedbackHistory .history-card-item', nodes => nodes[1].click());
      assert.equal(await page.$$eval('#modalFbkPunches [data-punch-row]', nodes => nodes.length), 0);
      assert.ok(await page.$eval('#modalFbkPunchDelete', node => node.hidden));
      await page.evaluate(() => closeFeedbackDetailsDirect());
      await page.waitForSelector('#feedbackDetailsModal', { hidden: true });
      await page.$$eval('#viewFeedbackHistory .history-card-item', nodes => nodes[0].click());
      assert.equal(await page.$$eval('#modalFbkPunches [data-punch-row]', nodes => nodes.length), 4);
      assert.equal(await page.$eval('#modalFbkPunches input', node => node.value), '06:30');
      await page.waitForFunction(() => document.getElementById('feedbackDetailsModal').style.opacity === '1' && !document.querySelector('#appToast.show'));
      await page.evaluate(async () => { await Promise.all(document.getElementById('feedbackDetailsModal').getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => {}))); });
      await page.$eval('#feedbackDetailsModal .attendance-history-modal-body', node => { node.scrollTop = 0; });
      await page.screenshot({ path: path.join(__dirname, `attendance_history_feedback_clock_${theme}.png`) });
      await page.$eval('#feedbackDetailsModal .attendance-history-modal-body', node => { node.scrollTop = node.scrollHeight; });
      await page.screenshot({ path: path.join(__dirname, `attendance_history_feedback_comments_${theme}.png`) });
      await page.evaluate(() => closeFeedbackDetailsDirect());
      await page.waitForSelector('#feedbackDetailsModal', { hidden: true });
      await page.evaluate(() => openFeedbackDetailsModal('READONLY-CLOCK', 'Approved', 'SP013 - Employee', 'Branch', 'Department', '14 Sep 2026', 'Shift', 'EBB12 - Submitter', '14/09/2026', 'Line one\nLine two', { punches: [{ date: '2026-09-14', original: '08:09', amended: '08:30' }] }));
      assert.ok(await page.$eval('#modalFbkPunches input', node => node.disabled));
      assert.ok(await page.$eval('#modalFbkPunchDays', node => node.hidden));
      assert.equal(await page.$eval('#modalFbkApproverComments', node => node.value), 'Line one\nLine two');
      assert.equal(await page.$eval('#modalFbkApproverComments', node => getComputedStyle(node).whiteSpace), 'pre-wrap');
    }
    assert.deepEqual(errors, []);
    console.log('PASS: Feedback comments, clock cards, date boundaries, adding/deleting/editing, validation, draft isolation, read-only records and both themes.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
