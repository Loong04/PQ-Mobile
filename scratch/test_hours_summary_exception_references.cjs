const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
const url = pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/hours-summary.html')).href;

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const cases = [
      { title: 'Absent Days', count: 9, total: '72.00', feedback: 5, index: 3, fields: ['14 Jan 2026', '-', '-', 'Yes', '0.00', '0.00', 'Absent'], rows: ['Clock Times -', 'Absent Hours 8.00'] },
      { title: 'Absent OT Hours', count: 2, total: '0.05', feedback: 0, index: 0, fields: ['19 Sep 2025', '1500 2300', '08:00', 'No', '0.00', '0.00', '-'], rows: ['Clock Times 15:00, 23:00', 'Absent Hours 0.01'] },
      { title: 'Lost Hours', count: 8, total: '0.00', feedback: 6, index: 0, fields: ['18 Jul 2026', '0844 1859', '07:46', 'No', '0.00', '1.00', 'Unapproved OT'], rows: ['Clock Times 08:44, 18:59', 'Lost Hours 0.00'] }
    ];
    for (const theme of ['light', 'dark']) {
      await page.setViewport({ width: 390, height: 950 });
      await page.goto(url + '?theme=' + theme, { waitUntil: 'networkidle0' });
      await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
      for (const c of cases) {
        await page.evaluate(title => openListDetails(title), c.title);
        assert.equal(await page.$$eval('.summary-history-card', nodes => nodes.length), c.count, c.title);
        assert.equal(await page.$eval('#list-total-hours', n => n.textContent), c.total);
        assert.equal(await page.$$eval('[data-summary-feedback]', nodes => nodes.length), c.feedback);
        assert.deepEqual(await page.$eval('.summary-history-card', n => [...n.querySelectorAll('.summary-history-detail')].map(row => row.innerText.replace(/\s+/g, ' ').trim())), c.rows);
        for (const width of [360, 390, 420]) {
          await page.setViewport({ width, height: 950 });
          assert.ok(await page.$eval('#view-list', n => n.scrollWidth <= n.clientWidth + 1));
        }
        await page.setViewport({ width: 390, height: 950 });
        await page.screenshot({ path: path.join(__dirname, `hours_summary_${c.title.replaceAll(' ', '_').toLowerCase()}_${theme}.png`) });
        await page.evaluate(index => openAttendanceDetailsByIndex(index), c.index);
        await page.waitForFunction(() => document.getElementById('modal-attendance-details').style.opacity === '1');
        await page.evaluate(async () => {
          await Promise.all(document.getElementById('modal-attendance-details').getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => {})));
        });
        assert.deepEqual(await page.evaluate(() => ['ad-date', 'ad-clock-times', 'ad-normal-hours', 'ad-absent', 'ad-approved-ot', 'ad-unapproved-ot', 'ad-exception'].map(id => document.getElementById(id).textContent)), c.fields);
        assert.equal(await page.$$eval('#attendance-hours-details-table tr', rows => rows.length), 17);
        assert.ok(await page.$eval('#ad-leave-info-table', n => n.hidden));
        assert.equal(await page.$eval('#ad-overtime-info-table', n => n.hidden), c.title !== 'Lost Hours');
        if (c.title === 'Lost Hours') {
          assert.equal(await page.$eval('#ad-late-in', n => n.textContent), '00:14');
          assert.deepEqual(await page.$$eval('#ad-overtime-info-table tr', nodes => nodes.map(n => n.innerText.replace(/\s+/g, ' ').trim())), ['OT Code OT1', 'Description 1.5 OT', 'OT Hours 01:00', 'UOT Yes']);
        }
        await page.$eval('#modal-attendance-details .detail-popout-body', n => { n.scrollTop = n.scrollHeight; });
        await page.screenshot({ path: path.join(__dirname, `hours_summary_${c.title.replaceAll(' ', '_').toLowerCase()}_details_${theme}.png`) });
        await page.evaluate(() => closeAttendanceDetails(true));
        await page.waitForSelector('#modal-attendance-details', { hidden: true });
        await page.click('#btn-chart-toggle');
        assert.equal(await page.$$eval('#view-chart .bar-chart-item', nodes => nodes.length), c.count);
        await page.evaluate(() => goBack());
        if (c.feedback) {
          await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('[data-summary-feedback]')]);
          await page.waitForSelector('#feedbackModalOverlay', { visible: true });
          assert.equal(new URL(page.url()).searchParams.get('feedbackSummary'), c.title);
          assert.equal(await page.$eval('#fbMetaDate', n => n.textContent), c.title === 'Lost Hours' ? '18 Jul 2026' : '22 Jul 2026');
          await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('[data-feedback-back]')]);
          assert.equal(await page.$eval('#headerTitle', n => n.textContent), c.title);
        }
      }
    }
    assert.deepEqual(errors, []);
    console.log('PASS: Absent, OT Absent and Lost reference records, card hours, 17 detail fields, OT sections, charts, Feedback return, themes and mobile widths.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
