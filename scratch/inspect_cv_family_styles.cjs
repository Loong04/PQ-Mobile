const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
const assert = require('node:assert/strict');

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files'] });
  try {
    for (const theme of ['light', 'dark']) {
      const compared = {};
      for (const view of ['history', 'approval']) {
        const page = await browser.newPage();
        await page.setViewport({ width: 420, height: 1000 });
        const relative = view === 'history' ? 'history.html' : 'pending-approval.html';
        const url = pathToFileURL(path.resolve(__dirname, '../modules/employee-career/options', relative)).href;
        await page.goto(`${url}?category=cv-change-request&theme=${theme}`, { waitUntil: 'networkidle0' });
        if (view === 'history') {
          await page.evaluate(() => localStorage.removeItem('pq_change_request_history'));
          await page.reload({ waitUntil: 'networkidle0' });
        }
        await page.click(view === 'history' ? '.history-card-item' : '.career-pending-review');
        await page.click('[data-cv-tab="family"]');
        await page.evaluate(() => document.fonts.ready);
        const styles = await page.$eval('.cv-history-family-section:nth-child(2) .cv-history-family-table', table => {
          const properties = ['borderCollapse', 'borderSpacing', 'borderTopWidth', 'borderRadius', 'backgroundColor', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'padding', 'textAlign', 'color', 'borderTopColor', 'borderRightWidth', 'borderBottomWidth', 'borderRightColor', 'borderBottomColor'];
          const inspect = node => {
            const style = getComputedStyle(node);
            return Object.fromEntries(properties.map(key => [key, style[key]]));
          };
          return { table: inspect(table), columns: [...table.querySelectorAll('th')].map(cell => Number((cell.getBoundingClientRect().width / table.getBoundingClientRect().width).toFixed(2))), heading: inspect(table.previousElementSibling), header: [...table.querySelectorAll('th')].map(inspect), cells: [...table.querySelectorAll('tbody tr:first-child td')].map(inspect), changed: [...document.querySelectorAll('.cv-history-family-table tr.cv-history-field-changed td')].map(inspect) };
        });
        const { changed, ...presentation } = styles;
        compared[view] = presentation;
        await page.screenshot({ path: path.join(__dirname, `cv-family-comparison-${view}-${theme}.png`) });
        await page.close();
      }
      assert.deepEqual(compared.approval, compared.history, `${theme}: History and Approval family tables must use identical computed presentation`);
      assert.deepEqual(compared.history.columns, [0.42, 0.58], 'Both views keep the History column proportions');
      console.log(`PASS ${theme}: History and Approval column proportions, table, heading, header and body-cell styles match.`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
