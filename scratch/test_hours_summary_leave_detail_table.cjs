const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
const url = file => pathToFileURL(path.resolve(__dirname, '..', file)).href;

function snapshot(panel) {
  const fields = ['padding', 'borderTopWidth', 'borderTopStyle', 'borderTopColor', 'borderRadius', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'textAlign', 'verticalAlign', 'color', 'backgroundColor'];
  const styles = node => Object.fromEntries(fields.map(key => [key, getComputedStyle(node)[key]]));
  const table = panel.querySelector('table');
  const row = table.rows[0];
  return {
    panel: styles(panel),
    body: styles(panel.querySelector('.detail-popout-body')),
    table: Object.fromEntries(['borderCollapse', 'tableLayout', 'borderRadius', 'fontSize', 'backgroundColor'].map(key => [key, getComputedStyle(table)[key]])),
    label: styles(row.cells[0]), value: styles(row.cells[1])
  };
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const theme of ['light', 'dark']) {
      await page.setViewport({ width: 390, height: 950 });
      await page.goto(url('leave.html') + '?theme=' + theme, { waitUntil: 'networkidle0' });
      await page.evaluate(() => openHistoryDetailsModal('LV-2026-0052'));
      await page.waitForSelector('#historyDetailsModalOverlay .detail-popout-table', { visible: true });
      const reference = await page.$eval('#historyDetailsModalOverlay .detail-popout-panel', snapshot);
      await page.goto(url('modules/attendance/options/hours-summary.html') + '?theme=' + theme, { waitUntil: 'networkidle0' });
      for (const width of [360, 390, 420]) {
        await page.setViewport({ width, height: 950 });
        await page.evaluate(() => openAttendanceDetails({ ...sampleWorkDays[0], leaveInfo: 'Annual Leave - 1.00 Day' }));
        await page.waitForSelector('#modal-attendance-details', { visible: true });
        assert.equal(await page.$$eval('#attendance-hours-details-table tr', nodes => nodes.length), 17, 'All 17 main fields use one actual table');
        const actual = await page.$eval('#modal-attendance-details .detail-popout-panel', snapshot);
        assert.deepEqual(actual, reference, `${theme} ${width}px: panel, body and main table match rendered Leave styles`);
        for (const selector of ['#ad-leave-info-table', '#ad-overtime-info-table']) {
          const section = await page.$eval(selector, table => ({
            tag: table.tagName, radius: getComputedStyle(table).borderRadius,
            columns: table.rows[0].cells.length,
            ratio: table.rows[0].cells[0].getBoundingClientRect().width / table.getBoundingClientRect().width,
            fits: table.scrollWidth <= table.clientWidth + 1,
            label: getComputedStyle(table.rows[0].cells[0]).backgroundColor,
            value: getComputedStyle(table.rows[0].cells[1]).backgroundColor
          }));
          assert.equal(section.tag, 'TABLE');
          assert.equal(section.radius, '0px');
          assert.equal(section.columns, 2);
          assert.ok(Math.abs(section.ratio - .42) < .01 && section.fits);
          assert.equal(section.label, reference.label.backgroundColor);
          assert.equal(section.value, reference.value.backgroundColor);
        }
        assert.equal(await page.$eval('#ad-leave-info', node => node.textContent), 'Annual Leave - 1.00 Day');
        assert.ok(await page.$eval('#modal-attendance-details .detail-popout-body', node => node.scrollWidth <= node.clientWidth + 1));
        await page.waitForFunction(() => document.getElementById('modal-attendance-details').style.opacity === '1');
        await page.evaluate(async () => { await Promise.all(document.getElementById('modal-attendance-details').getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => {}))); });
        if (width === 390) {
          await page.screenshot({ path: path.join(__dirname, `hours_summary_leave_detail_${theme}_top.png`) });
          await page.$eval('#modal-attendance-details .detail-popout-body', node => { node.scrollTop = node.scrollHeight; });
          await page.screenshot({ path: path.join(__dirname, `hours_summary_leave_detail_${theme}_bottom.png`) });
        }
        await page.evaluate(() => closeAttendanceDetails(true));
        await page.waitForSelector('#modal-attendance-details', { hidden: true });
        await page.evaluate(() => openAttendanceDetails(sampleWorkDays[0]));
        assert.ok(await page.$eval('#ad-leave-info-table', node => node.hidden));
        assert.equal(await page.$$eval('#ad-overtime-info-table tr', nodes => nodes.length), 4);
        assert.equal(await page.$eval('#ad-emp-no', node => node.textContent), 'EBB12');
        assert.equal(await page.$eval('#ad-date', node => node.textContent), '14 Sep 2026');
        await page.evaluate(() => closeAttendanceDetails(true));
        await page.waitForSelector('#modal-attendance-details', { hidden: true });
      }
    }
    assert.deepEqual(errors, []);
    console.log('PASS: Hours Summary main, leave and OT tables match Leave popout styles; all fields, section visibility and close/reopen work in both themes at three phone widths.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
