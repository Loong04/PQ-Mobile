const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
const url = pathToFileURL(path.resolve(__dirname, '../modules/performance/index.html')).href;
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--allow-file-access-from-files', '--no-sandbox'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    let fixture;
    page.on('pageerror', error => errors.push(error.message));
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (/^https?:/.test(request.url())) return request.abort();
      if (fixture && request.url().includes('/performance-highlight-data.js')) return request.respond({ status: 200, contentType: 'text/javascript', body: `window.PERFORMANCE_HIGHLIGHT_DATA = ${JSON.stringify(fixture)};` });
      request.continue();
    });
    const groups = () => page.$$eval('.performance-score-group', cards => cards.map(card => ({
      range: card.querySelector('.performance-score-range').textContent,
      count: card.querySelector('.performance-score-count').textContent,
      average: card.querySelector('.performance-score-average strong').textContent
    })));
    for (const theme of ['dark', 'light']) {
      for (const width of [360, 420]) {
        await page.setViewport({ width, height: 844 });
        await page.goto(`${url}?scope=team&theme=${theme}`);
        assert.deepEqual(await groups(), [
          { range: '80–100', count: '3', average: '85.67' },
          { range: '60–<80', count: '2', average: '71.00' },
          { range: '40–<60', count: '0', average: '—' },
          { range: '0–<40', count: '0', average: '—' }
        ]);
        assert.equal(await page.$('.performance-score-table tfoot'), null);
        assert.ok(await page.evaluate(() => {
          const main = document.querySelector('.performance-content');
          return main.scrollWidth <= main.clientWidth + 1 && document.documentElement.scrollWidth <= innerWidth;
        }), 'Groups fit mobile viewport');
        await page.$eval('#performanceAttentionTitle', el => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
        await page.screenshot({ path: path.resolve(__dirname, `performance-score-groups-${theme}-${width}.png`) });
      }
    }
    fixture = [0, 39.99, 40, 59.99, 60, 79.99, 80, 100].map((score, i) => ({ name: `Employee ${i}`, empNo: `${i}`, overallScore: score, evaluationDate: '2026-10-01' }));
    fixture.push({ name: 'Old entry', empNo: '0', overallScore: 100, evaluationDate: '2025-01-01' });
    fixture.push(...[null, '', -1, 101, 'invalid'].map((score, i) => ({ name: 'Invalid', empNo: `invalid${i}`, overallScore: score, evaluationDate: '2026-10-01' })));
    await page.reload();
    assert.deepEqual((await groups()).map(({ count, average }) => [count, average]), [['2', '90.00'], ['2', '70.00'], ['2', '50.00'], ['2', '20.00']], 'Boundaries count once; old and invalid records excluded');
    fixture = [];
    await page.reload();
    assert.deepEqual((await groups()).map(({ count, average }) => [count, average]), Array.from({ length: 4 }, () => ['0', '—']));
    assert.deepEqual(errors, []);
    console.log('PASS: score grouping, averages, deduplication, boundaries, invalid/empty data, themes and mobile layouts.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
