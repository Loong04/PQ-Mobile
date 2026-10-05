const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const pageUrl = pathToFileURL(path.resolve(__dirname, '..', 'modules/attendance/options/clocking.html')).href;
const chrome = process.env.PUPPETEER_EXECUTABLE_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chrome,
    args: ['--allow-file-access-from-files', '--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    for (const width of [360, 390, 420]) {
      await page.setViewport({ width, height: 844, deviceScaleFactor: 1 });
      await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });

      const state = await page.evaluate(() => {
        const main = document.querySelector('.main-content');
        const map = document.querySelector('.map-card');
        const actions = document.querySelector('.action-grid');
        const breakOut = document.querySelector('.btn-break-out');
        const header = document.querySelector('.punch-header');
        const items = Array.from(document.querySelectorAll('.punch-item'));

        return {
          mapBeforeActions: Boolean(map && actions && (map.compareDocumentPosition(actions) & Node.DOCUMENT_POSITION_FOLLOWING)),
          hasTodaysLogs: Array.from(document.querySelectorAll('h1,h2,h3')).some(node => /today['’]s logs/i.test(node.textContent)),
          breakOutColor: getComputedStyle(breakOut).color,
          headerTitles: Array.from(header?.children || []).map(node => node.textContent.trim()),
          headerBackground: header ? getComputedStyle(header).backgroundImage : '',
          itemDates: items.map(item => item.querySelector('[data-punch-date]')?.textContent.trim()),
          itemColumnCounts: items.map(item => Array.from(item.children).length),
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          mainOverflow: main.scrollWidth - main.clientWidth
        };
      });

      assert.equal(state.mapBeforeActions, true, `${width}px: map appears before action buttons`);
      assert.equal(state.hasTodaysLogs, false, `${width}px: Today's Logs heading is removed`);
      assert.equal(state.breakOutColor, 'rgb(192, 132, 252)', `${width}px: Break Out uses the dark-theme purple token`);
      assert.deepEqual(state.headerTitles, ['Date', 'Type', 'Time', 'Location'], `${width}px: log table has the requested header order`);
      assert.match(state.headerBackground, /linear-gradient/, `${width}px: log table header uses the purple treatment`);
      assert.deepEqual(state.itemColumnCounts, [4, 4, 4], `${width}px: each log row has four columns`);
      state.itemDates.forEach(date => assert.match(date, /^\d{2}\/\d{2}\/\d{4}$/));
      assert.ok(state.overflow <= 1, `${width}px: document has no horizontal overflow`);
      assert.ok(state.mainOverflow <= 1, `${width}px: clocking content has no horizontal overflow`);
    }

    assert.deepEqual(pageErrors, [], `Clocking page should have no JavaScript errors: ${pageErrors.join('; ')}`);
    console.log('PASS: Attendance Clocking map/action order, purple Break Out button, dated logs, and mobile layout.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
