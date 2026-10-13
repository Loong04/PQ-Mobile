const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
const historyUrl = pathToFileURL(path.resolve(__dirname, '../modules/employee-career/options/history.html')).href;
(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files', '--no-sandbox'] });
  const errors = [];
  try {
    const page = await browser.newPage();
    page.on('pageerror', error => errors.push(error.message));
    for (const theme of ['light', 'dark']) {
      for (const width of [360, 420]) {
        await page.setViewport({ width, height: 844 });
        await page.goto(historyUrl + '?category=whereabout&theme=' + theme, { waitUntil: 'domcontentloaded' });
        await page.evaluate(() => localStorage.removeItem('pq_employee_career_whereabout_deleted'));
        await page.reload({ waitUntil: 'domcontentloaded' });
        assert.ok(await page.$('[data-delete-whereabout="whereabout-1"]'), 'Whereabout card provides Delete');
        assert.equal(await page.$eval('#historyRecordCount', el => el.textContent), '1');
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: path.join(__dirname, `whereabout-delete-card-${theme}-${width}.png`) });
        await page.click('[data-delete-whereabout="whereabout-1"]');
        assert.equal(await page.$eval('#whereaboutDeleteOverlay', el => el.getAttribute('aria-hidden')), 'false');
        assert.equal(await page.$eval('#historyDetailsModal', el => el.getAttribute('aria-hidden')), 'true', 'Card Delete does not open details');
        await page.click('#whereaboutDeleteCancel');
        assert.equal(await page.$eval('#historyRecordCount', el => el.textContent), '1');
        assert.equal(await page.evaluate(() => document.activeElement.dataset.deleteWhereabout), 'whereabout-1');
        await page.click('.career-history-card-open');
        assert.equal(await page.$eval('#historyDeleteWhereabout', el => el.hidden), false);
        assert.equal(await page.$eval('#historyEditFeedback', el => el.hidden), true);
        await page.screenshot({ path: path.join(__dirname, `whereabout-delete-details-${theme}-${width}.png`) });
        await page.click('#historyDeleteWhereabout');
        await page.keyboard.press('Escape');
        assert.equal(await page.$eval('#historyDetailsModal', el => el.getAttribute('aria-hidden')), 'false', 'Cancel restores Whereabout details');
        assert.equal(await page.evaluate(() => document.activeElement.id), 'historyDeleteWhereabout');
        await page.click('#historyDeleteWhereabout');
        await page.screenshot({ path: path.join(__dirname, `whereabout-delete-confirm-${theme}-${width}.png`) });
        await page.click('#whereaboutDeleteConfirm');
        assert.equal(await page.$eval('#historyRecordCount', el => el.textContent), '0');
        assert.equal(await page.$eval('#historyEmptyState', el => el.hidden), false);
        assert.equal(await page.$eval('.main-content', el => el.inert), false);
        assert.equal(await page.evaluate(() => document.activeElement.dataset.historyKind), 'whereabout');
        await page.reload({ waitUntil: 'domcontentloaded' });
        assert.equal(await page.$eval('#historyRecordCount', el => el.textContent), '0', 'Deletion survives reload');
        await page.click('[data-history-kind="feedback"]');
        assert.equal(await page.$eval('#historyRecordCount', el => el.textContent), '3', 'Whereabout deletion preserves Feedback');
        await page.click('.career-history-card-open');
        assert.equal(await page.$eval('#historyDeleteWhereabout', el => el.hidden), true);
        await page.keyboard.press('Escape');
        assert.ok(await page.evaluate(() => document.querySelector('main').scrollWidth <= document.querySelector('main').clientWidth + 1));
        await page.evaluate(() => localStorage.removeItem('pq_employee_career_whereabout_deleted'));
        await page.goto(historyUrl + '?category=whereabout&theme=' + theme, { waitUntil: 'domcontentloaded' });
        await page.click('[data-delete-whereabout="whereabout-1"]');
        await page.click('#whereaboutDeleteConfirm');
        assert.equal(await page.$eval('#historyRecordCount', el => el.textContent), '0', 'Card Delete also removes the record');
      }
    }
    assert.deepEqual(errors, []);
    console.log('PASS: Whereabout card/detail Delete, confirmation/cancel, focus restoration, persistent removal, totals, empty state and isolated Feedback at 360/420px in both themes.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
