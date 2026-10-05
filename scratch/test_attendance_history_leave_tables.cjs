const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

// Use the rendered Leave table as the reference, so Attendance cannot drift
// through its own round corners, tinted cells, typography or column alignment.
function snapshot(table) {
  const properties = ['padding', 'borderTopWidth', 'borderTopStyle', 'borderTopColor', 'borderLeftWidth', 'borderRadius', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'textAlign', 'verticalAlign', 'color', 'backgroundColor'];
  const styles = node => Object.fromEntries(properties.map(property => [property, getComputedStyle(node)[property]]));
  const row = [...table.rows].find(row => row.cells.length === 2);
  const tableStyles = getComputedStyle(table);
  return {
    table: Object.fromEntries(['borderCollapse', 'tableLayout', 'borderRadius', 'fontFamily', 'fontSize', 'lineHeight', 'backgroundColor'].map(property => [property, tableStyles[property]])),
    label: styles(row.cells[0]),
    value: styles(row.cells[1]),
    ratio: row.cells[0].getBoundingClientRect().width / table.getBoundingClientRect().width,
    fits: table.scrollWidth <= table.clientWidth + 1
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
      await page.goto(pathToFileURL(path.resolve(__dirname, '../leave.html')).href + '?theme=' + theme, { waitUntil: 'networkidle0' });
      await page.evaluate(() => openHistoryDetailsModal('LV-2026-0052'));
      await page.waitForSelector('#historyDetailsModalOverlay .detail-popout-table', { visible: true });
      const reference = await page.$eval('#historyDetailsModalOverlay .detail-popout-table', snapshot);
      await page.goto(pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/history.html')).href + '?theme=' + theme, { waitUntil: 'networkidle0' });
      for (const width of [360, 390, 420]) {
        await page.setViewport({ width, height: 950 });
        for (const [tab, view, modal, close] of [
          ['clocking', 'viewClockingHistory', 'clockDetailsModal', 'closeClockDetailsDirect'],
          ['ot', 'viewOtHistory', 'otDetailsModal', 'closeOtDetailsDirect'],
          ['feedback', 'viewFeedbackHistory', 'feedbackDetailsModal', 'closeFeedbackDetailsDirect']
        ]) {
          await page.evaluate(tab => switchMainTab(tab), tab);
          const tables = await page.$$('#' + view + ' .history-card-details table');
          assert.equal(tables.length, tab === 'clocking' ? 6 : tab === 'ot' ? 3 : 2, 'Every history card uses a data table');
          for (const table of tables) {
            const actual = await table.evaluate(snapshot);
            for (const key of ['table', 'label', 'value']) assert.deepEqual(actual[key], reference[key], `${theme} ${width}px ${tab} list ${key} matches Leave`);
            assert.ok(Math.abs(actual.ratio - .42) < .01 && actual.fits, '42/58 columns fit');
          }
          await page.$$eval('#' + view + ' .history-card-item', nodes => nodes[0].click());
          await page.waitForSelector('#' + modal, { visible: true });
          const detail = await page.$eval('#' + modal + ' .detail-popout-table', snapshot);
          for (const key of ['table', 'label', 'value']) assert.deepEqual(detail[key], reference[key], `${theme} ${width}px ${tab} detail ${key} matches Leave`);
          assert.ok(Math.abs(detail.ratio - .42) < .01 && detail.fits);
          await page.waitForFunction(id => document.getElementById(id).style.opacity === '1', {}, modal);
          await page.evaluate(async id => { await Promise.all(document.getElementById(id).getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => {}))); }, modal);
          if (width === 390) await page.screenshot({ path: path.join(__dirname, `attendance_history_${tab}_leave_table_${theme}.png`) });
          await page.evaluate(close => window[close](), close);
          await page.waitForSelector('#' + modal, { hidden: true });
          if (width === 390) await page.screenshot({ path: path.join(__dirname, `attendance_history_${tab}_leave_list_${theme}.png`) });
        }
      }
    }
    assert.deepEqual(errors, []);
    console.log('PASS: All 11 Attendance History card tables and all three detail tables match rendered Leave typography, grid, surfaces, column widths and alignment in both themes at three phone widths.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
