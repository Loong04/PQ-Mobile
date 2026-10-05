const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
const summaryUrl = pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/hours-summary.html')).href;
const rows = nodes => nodes.map(node => node.innerText.replace(/\s+/g, ' ').trim());

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const theme of ['light', 'dark']) {
      await page.setViewport({ width: 390, height: 950 });
      await page.goto(summaryUrl + '?theme=' + theme, { waitUntil: 'networkidle0' });
      await page.evaluate(() => openListDetails('Unapproved OT Hours'));
      assert.equal(await page.$eval('#headerTitle', node => node.innerText), 'Unapproved OT Hours');
      assert.equal(await page.$$eval('.summary-history-card', nodes => nodes.length), 7);
      assert.deepEqual(await page.$$eval('.summary-history-detail', rows), [
        'Clock Times 07:45, 19:21', 'Unapproved OT 0.30',
        'Clock Times 07:35, 19:16', 'Unapproved OT 1.30',
        'Clock Times 08:14, 19:56', 'Unapproved OT 2.00',
        'Clock Times 07:48, 17:36', 'Unapproved OT 0.30',
        'Clock Times 08:02, 19:52', 'Unapproved OT 2.00',
        'Clock Times 07:42, 19:40', 'Unapproved OT 2.30',
        'Clock Times 07:43, 17:40', 'Unapproved OT 0.30'
      ]);
      assert.equal(await page.$eval('#list-total-hours', node => node.innerText), '9.50');
      assert.equal(await page.$eval('#unapproved-ot-hours-total', node => node.innerText), '9.50');
      assert.equal(await page.$$eval('[data-summary-feedback]', nodes => nodes.length), 7);
      assert.equal(await page.$$eval('[data-summary-feedback] i', nodes => nodes.length), 0);
      await page.evaluate(() => openAttendanceDetailsByIndex(2));
      await page.waitForSelector('#modal-attendance-details', { visible: true });
      assert.deepEqual(await page.evaluate(() => ['ad-date', 'ad-clock-times', 'ad-normal-hours', 'ad-approved-ot', 'ad-unapproved-ot', 'ad-exception'].map(id => document.getElementById(id).innerText)), ['26 Sep 2026', '0814 1956', '08:00', '0.00', '2.00', 'Unapproved OT']);
      assert.deepEqual(await page.$$eval('#ad-overtime-info-table tr', rows), ['OT Code OT1', 'Description 1.5 OT', 'OT Hours 02:00', 'UOT Yes']);
      await page.waitForFunction(() => getComputedStyle(document.getElementById('modal-attendance-details')).opacity === '1');
      await page.screenshot({ path: path.resolve(__dirname, 'hours_summary_unapproved_details_' + theme + '.png') });
      await page.evaluate(() => closeAttendanceDetails(true));
      await page.waitForSelector('#modal-attendance-details', { hidden: true });
      await page.evaluate(() => openListDetails('OT Plan Hours'));
      assert.equal(await page.$eval('#headerTitle', node => node.innerText), 'OT Plan Hours');
      assert.equal(await page.$$eval('.summary-history-card', nodes => nodes.length), 10);
      assert.deepEqual(await page.$$eval('.summary-history-detail', rows), [
        'Clock Times 07:31, 21:50', 'Plan Hours 0.04',
        'Clock Times 07:25, 17:49', 'Plan Hours 0.01',
        'Clock Times 07:55, 21:40', 'Plan Hours 0.04',
        'Clock Times 15:00, 23:00', 'Plan Hours 0.01',
        'Clock Times -', 'Plan Hours 0.01',
        'Clock Times 07:40, 21:34', 'Plan Hours 0.04',
        'Clock Times 07:13, 22:13', 'Plan Hours 0.01',
        'Clock Times 07:13, 22:13', 'Plan Hours 0.05',
        'Clock Times 07:04, 17:34', 'Plan Hours 0.01',
        'Clock Times 07:10, 21:48', 'Plan Hours 0.01'
      ]);
      assert.equal(await page.$eval('#list-total-hours', node => node.innerText), '0.23');
      assert.equal(await page.$eval('#plan-ot-hours-total', node => node.innerText), '0.23');
      assert.equal(await page.$$eval('[data-summary-feedback]', nodes => nodes.length), 0);
      await page.evaluate(() => openAttendanceDetailsByIndex(2));
      await page.waitForSelector('#modal-attendance-details', { visible: true });
      assert.deepEqual(await page.evaluate(() => ['ad-date', 'ad-clock-times', 'ad-approved-ot', 'ad-unapproved-ot'].map(id => document.getElementById(id).innerText)), ['24 Sep 2025', '0755 2140', '4.50', '0.00']);
      assert.deepEqual(await page.$$eval('#ad-overtime-info-table tr', rows), ['OT Code OB1', 'Description OT 1.5 BEFORE WORK', 'OT Hours 00:30', 'UOT No']);
      assert.deepEqual(await page.$$eval('#ad-overtime-info-additional tr', rows), ['OT Code OT1', 'Description 1.5 OT', 'OT Hours 02:30', 'UOT No']);
      for (const width of [360, 390, 420]) {
        await page.setViewport({ width, height: 950 });
        assert.equal(await page.$eval('#ad-overtime-info-additional table', table => {
          const primary = document.getElementById('ad-overtime-info-table');
          return table.scrollWidth <= table.clientWidth + 1 && getComputedStyle(table).borderCollapse === getComputedStyle(primary).borderCollapse && getComputedStyle(table.rows[0].cells[0]).backgroundColor === getComputedStyle(primary.rows[0].cells[0]).backgroundColor;
        }), true, `All OT entries use the existing table styles at ${width}px`);
      }
      await page.setViewport({ width: 390, height: 950 });
      await page.waitForFunction(() => getComputedStyle(document.getElementById('modal-attendance-details')).opacity === '1');
      await page.screenshot({ path: path.resolve(__dirname, 'hours_summary_plan_details_' + theme + '.png') });
      await page.evaluate(() => closeAttendanceDetails(true));
      await page.waitForSelector('#modal-attendance-details', { hidden: true });
      await page.evaluate(() => { openListDetails('Unapproved OT Hours'); openAttendanceDetailsByIndex(2); });
      assert.equal(await page.$$eval('#ad-overtime-info-additional table', nodes => nodes.length), 0, 'Reopening a single OT record clears extra entries');
      await page.evaluate(() => closeAttendanceDetails(true));
      await page.waitForSelector('#modal-attendance-details', { hidden: true });
      await page.$eval('.summary-history-card:nth-child(3) [data-summary-feedback]', node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('.summary-history-card:nth-child(3) [data-summary-feedback]')]);
      await page.waitForSelector('#feedbackModalOverlay', { visible: true });
      assert.equal(await page.$eval('#fbMetaDate', node => node.innerText), '26 Sep 2026');
      assert.deepEqual(await page.$$eval('.fb-clock-pill-blue', rows), ['08:14', '19:56']);
      await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('[data-feedback-back]')]);
      assert.equal(await page.$eval('#headerTitle', node => node.innerText), 'Unapproved OT Hours');
      assert.equal(await page.$eval('html', node => node.dataset.theme), theme);
    }
    assert.deepEqual(errors, []);
    console.log('PASS: reference Unapproved OT and OT Plan records, fields, totals, multi-entry detail tables, and record-specific Feedback return in both themes.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
