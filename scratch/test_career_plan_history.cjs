const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const base = pathToFileURL(path.resolve(__dirname, '../modules/employee-career/options/history.html')).href;
    for (const theme of ['dark','light']) {
      await page.setViewport({ width: 390, height: 950 });
      await page.goto(`${base}?category=career-plan&theme=${theme}`, { waitUntil: 'domcontentloaded' });
      assert.deepEqual(await page.$$eval('[data-history-kind]', nodes => nodes.map(node => node.textContent.trim())), ['Feedback', 'Whereabout', 'CV Change Request']);
      assert.equal(await page.$eval('[data-history-kind="feedback"]', node => node.getAttribute('aria-pressed')), 'true', 'Removed Career Plan links fall back to Feedback');
      assert.equal(await page.$eval('#historyCategoryTitle', node => node.textContent), 'Feedback History');
      for (const [kind, title] of [['whereabout', 'Whereabout History'], ['cv-change-request', 'CV Change Request History'], ['feedback', 'Feedback History']]) {
        await page.click('[data-history-kind="' + kind + '"]');
        assert.equal(await page.$eval('#historyCategoryTitle', node => node.textContent), title);
        assert.ok(await page.$$eval('#careerHistoryList [data-record-id]', nodes => nodes.length > 0));
      }
      for (const width of [360, 390, 450]) {
        await page.setViewport({ width, height: 950 });
        assert.ok(await page.$eval('main', node => node.scrollWidth <= node.clientWidth + 1));
        await page.click('#careerHistoryList [data-record-id]');
        assert.ok(await page.$eval('#historyDetailBody', node => node.scrollWidth <= node.clientWidth + 1), 'History details fit the popout');
        await page.keyboard.press('Escape');
      }
    }
    assert.deepEqual(errors, []);
    console.log('PASS: Career Plan tab removed, old links fall back to Feedback, remaining tabs work in both themes and mobile widths.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
