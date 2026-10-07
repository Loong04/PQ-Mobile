const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const newsUrl = pathToFileURL(path.resolve(__dirname, '../modules/admin/options/news.html')).href;
const detailUrl = pathToFileURL(path.resolve(__dirname, '../modules/admin/options/news-detail.html')).href;
const key = 'peoplehcm:workplace:news:v1';
const titles = page => page.$$eval('.news-card h2', nodes => nodes.map(node => node.textContent));
async function screenshot(page, name) {
  // Theme colors transition on load; capture the settled UI rather than an intermediate frame.
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 350)));
  await page.screenshot({ path: path.resolve(__dirname, name) });
}
async function fits(page) {
  assert.ok(await page.$eval('main', node => node.scrollWidth <= node.clientWidth + 1), 'News must fit the mobile viewport');
  assert.ok(await page.$eval('.admin-heading h1', node => node.getBoundingClientRect().height < 30), 'Page header must stay on one line');
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files'] });
  try {
    for (const theme of ['light', 'dark']) for (const width of [360, 420]) {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.setViewport({ width, height: 950 });
      await page.goto(newsUrl + '?theme=' + theme + '&filter=unread', { waitUntil: 'domcontentloaded' });
      await page.evaluate(storageKey => localStorage.removeItem(storageKey), key);
      await page.reload({ waitUntil: 'domcontentloaded' });
      assert.equal(await page.$$eval('.news-card', nodes => nodes.length), 5, 'News must replace its placeholder with the five reference announcements');
      assert.equal(await page.$('.news-filters, [data-news-filter], .news-card-status'), null, 'News must show a simple announcement list without status tabs or badges');
      assert.equal(await page.$('.news-search, #newsSearch'), null, 'News must not display a search bar');
      await fits(page);
      await screenshot(page, `workplace-news-${theme}-${width}.png`);

      await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.click('[data-news-id="lockdown-3"]')]);
      assert.equal(new URL(page.url()).searchParams.get('theme'), theme);
      assert.equal(await page.$eval('#newsArticleTitle', node => node.textContent), 'LOCKDOWN 3.0');
      assert.equal(await page.$eval('#newsAcknowledged', node => node.hidden), true, 'Opening a news item must not acknowledge it');
      assert.ok((await page.$eval('#newsDetailActions', node => node.textContent)).includes('this device'), 'Local acknowledgement must not imply it was delivered to a server');
      assert.equal(await page.$eval('#newsAcknowledge', node => node.hidden), false);
      await page.click('#newsAcknowledge');
      assert.equal(await page.$eval('#newsAcknowledged', node => node.hidden), false);
      const acknowledgedTime = await page.$eval('#newsAcknowledged time', node => node.dateTime);
      await page.reload({ waitUntil: 'domcontentloaded' });
      assert.equal(await page.$eval('#newsAcknowledged time', node => node.dateTime), acknowledgedTime, 'Acknowledgement timestamp must persist');
      await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.click('#newsDetailBack')]);
      assert.equal((await titles(page)).length, 5, 'Acknowledgement must not hide an announcement from the list');
      await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.click('[data-news-id="return-to-work"]')]);
      await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.click('#newsDetailBack')]);
      assert.equal((await titles(page)).length, 5, 'Viewing an announcement must not change which announcements are shown');
      assert.equal(await page.$('.news-card-status'), null);

      await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.click('[data-news-id="covid-wfh"]')]);
      assert.ok((await page.$eval('#newsArticleBody', node => node.textContent)).includes('Attached is a memo of our new working procedures.'));
      assert.equal(await page.$eval('#newsAcknowledged time', node => node.textContent), '06 Jun 2024, 16:53');
      assert.ok((await page.$eval('#newsAttachments', node => node.textContent)).includes('lighthouse-clip-art-png.png'));
      assert.ok((await page.$eval('#newsAttachments', node => node.textContent)).includes('File unavailable'), 'Missing source attachments must not offer a broken download');
      assert.equal(await page.$('#newsAttachments .fa-lock'), null, 'Unavailable attachments must not look permission-locked');
      await fits(page);
      await screenshot(page, `workplace-news-detail-${theme}-${width}.png`);
      await page.$eval('main', node => { node.scrollTop = node.scrollHeight; });
      await screenshot(page, `workplace-news-detail-bottom-${theme}-${width}.png`);

      await page.click('#newsFeedbackTrigger');
      assert.equal(await page.$eval('#newsFeedbackDialog', node => node.open), true);
      await page.type('#newsFeedbackText', '   ');
      await page.click('#newsFeedbackSave');
      assert.equal(await page.$eval('#newsFeedbackDialog', node => node.open), true, 'Whitespace-only feedback must not be saved');
      await page.$eval('#newsFeedbackText', node => { node.value = ''; });
      await page.type('#newsFeedbackText', '<script>unsafe</script> Thank you for the update.');
      await screenshot(page, `workplace-news-feedback-${theme}-${width}.png`);
      await page.click('#newsFeedbackSave');
      assert.equal(await page.$eval('#newsFeedbackDialog', node => node.open), false);
      assert.equal(await page.$eval('#newsSavedFeedbackText', node => node.textContent), '<script>unsafe</script> Thank you for the update.');
      assert.equal(await page.$('#newsSavedFeedback script'), null, 'Feedback must render as text');
      await page.reload({ waitUntil: 'domcontentloaded' });
      assert.equal(await page.$eval('#newsSavedFeedbackText', node => node.textContent), '<script>unsafe</script> Thank you for the update.');
      await page.click('#newsFeedbackTrigger');
      await page.$eval('#newsFeedbackText', node => { node.value = 'Updated feedback'; });
      await page.click('#newsFeedbackSave');
      assert.equal(await page.$eval('#newsSavedFeedbackText', node => node.textContent), 'Updated feedback', 'Editing feedback must update the existing saved feedback');
      await page.click('#newsFeedbackTrigger');
      await page.keyboard.press('Escape');
      assert.equal(await page.$eval('#newsFeedbackDialog', node => node.open), false);
      assert.equal(await page.evaluate(() => document.activeElement.id), 'newsFeedbackTrigger');
      await page.click(`[data-set-theme="${theme === 'light' ? 'dark' : 'light'}"]`);
      assert.equal(new URL(await page.$eval('#newsDetailBack', node => node.href)).searchParams.get('theme'), theme === 'light' ? 'dark' : 'light');

      await page.goto(detailUrl + '?id=missing&theme=' + theme, { waitUntil: 'domcontentloaded' });
      assert.equal(await page.$eval('#newsUnavailable', node => node.hidden), false);
      assert.equal(await page.$eval('#newsDetailActions', node => node.hidden), true);
      await page.evaluate(storageKey => localStorage.setItem(storageKey, '{broken'), key);
      await page.goto(newsUrl + '?theme=' + theme, { waitUntil: 'domcontentloaded' });
      assert.equal((await titles(page)).length, 5, 'Corrupt saved state must not make the announcements disappear');
      await page.goto(detailUrl + '?id=hari-raya-cmco&theme=' + theme, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('Storage full', 'QuotaExceededError'); }; });
      await page.click('#newsAcknowledge');
      assert.equal(await page.$eval('#newsAcknowledged', node => node.hidden), true, 'A failed save must not claim acknowledgement succeeded');
      assert.equal(await page.$eval('#newsStorageError', node => node.hidden), false);
      await page.click('#newsFeedbackTrigger');
      await page.type('#newsFeedbackText', 'Keep this draft if saving fails.');
      await page.click('#newsFeedbackSave');
      assert.equal(await page.$eval('#newsFeedbackDialog', node => node.open), true);
      assert.equal(await page.$eval('#newsFeedbackError', node => node.hidden), false);
      assert.equal(await page.$eval('#newsFeedbackText', node => node.value), 'Keep this draft if saving fails.');
      await page.setViewport({ width, height: 640 });
      assert.ok(await page.$eval('#newsFeedbackDialog', node => node.scrollWidth <= node.clientWidth + 1), 'Feedback must fit a short mobile viewport');
      await page.keyboard.press('Escape');
      await fits(page);
      assert.deepEqual(errors, []);
      console.log(`PASS: Simple News cards, navigation, explicit acknowledgement, safe persisted feedback, unavailable states, ${theme}, ${width}px`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
