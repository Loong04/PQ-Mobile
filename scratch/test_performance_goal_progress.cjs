const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
const fs = require('node:fs');
const url = theme => pathToFileURL(path.resolve(__dirname, '../modules/performance/options/goal-progress.html')).href + `?theme=${theme}`;
const key = 'peoplehcm:performance:goal-progress:v1';
async function field(page, id, value) {
  await page.$eval(`#${id}`, (el, value) => { el.value = value; el.dispatchEvent(new Event('input', { bubbles: true })); }, value);
}
async function click(page, selector) {
  await page.$eval(selector, el => el.scrollIntoView({ block: 'center' }));
  await page.click(selector);
}
async function visible(page, selector) { return page.$eval(selector, el => !!el.getClientRects().length); }
async function values(page) { return page.$$eval('#goalProgressForm input, #goalProgressForm textarea', fields => fields.map(el => el.value)); }
async function fill(page, overrides = {}) {
  for (const [id, value] of Object.entries({ goalProgressDate: '2026-10-13', goalProgressHours: '6.5', goalProgressAchievedValue: '2500', goalProgressAchievedPercent: '72.5', goalProgressRemark: 'Mill delivery verified.', ...overrides })) await field(page, id, value);
}
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--allow-file-access-from-files', '--no-sandbox'] });
  try {
    const page = await browser.newPage(), errors = [];
    await page.setRequestInterception(true);
    let multipleGoals = false;
    page.on('request', req => {
      if (multipleGoals && req.url().includes('/goal-progress-data.js')) {
        const source = fs.readFileSync(path.resolve(__dirname, '../modules/performance/js/goal-progress-data.js'), 'utf8');
        return req.respond({ contentType: 'text/javascript', body: source + '\nwindow.PERFORMANCE_GOAL_PROGRESS.goals.push({...window.PERFORMANCE_GOAL_PROGRESS.goals[0], id: "SECOND-GOAL", title: "Second Goal", unit: "KG"});' });
      }
      return /^https?:/.test(req.url()) ? req.abort() : req.continue();
    });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve(__dirname, '../modules/performance/index.html')).href + '?theme=light', { waitUntil: 'domcontentloaded' });
    await click(page, '[data-option-id="goal-progress"]');
    await page.waitForFunction(() => location.pathname.endsWith('/goal-progress.html'));
    for (const theme of ['light', 'dark']) for (const width of [360, 420]) {
      await page.setViewport({ width, height: 844 });
      await page.goto(url(theme), { waitUntil: 'domcontentloaded' });
      await page.evaluate(key => sessionStorage.removeItem(key), key);
      await page.reload({ waitUntil: 'domcontentloaded' });
      assert.equal(await page.$eval('#goalProgressTotal', el => el.textContent), '1');
      await click(page, '#goalProgressFilterTrigger');
      await field(page, 'goalProgressEvaluationFilter', 'Annual Review');
      await page.keyboard.press('Escape');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'goalProgressFilterTrigger');
      await click(page, '#goalProgressFilterTrigger');
      assert.equal(await page.$eval('#goalProgressEvaluationFilter', el => el.value), '', 'Filter cancel discards changes');
      await field(page, 'goalProgressEvaluationFilter', 'Annual Review');
      await click(page, '#goalProgressApplyFilter');
      assert.equal(await visible(page, '#goalProgressEmpty'), true);
      await click(page, '#goalProgressFilterTrigger');
      await click(page, '#goalProgressResetFilter');
      await click(page, '#goalProgressApplyFilter');
      await click(page, '.goal-progress-update');
      assert.equal(await visible(page, '#goalProgressForm'), false, 'Update opens the detail list, with a separate entry form like OT Claim');
      assert.equal(await visible(page, '#goalProgressOverviewView'), true);
      assert.equal(await visible(page, '#goalProgressHistoryEmpty'), true);
      await page.screenshot({ path: path.join(__dirname, `performance-goal-progress-update-${theme}-${width}.png`) });
      await click(page, '#goalProgressSubmit');
      assert.match(await page.$eval('#goalProgressOverviewError', el => el.textContent), /Add at least one/);
      await click(page, '#goalProgressNew');
      assert.equal(await page.$eval('#goalProgressTitle', el => el.textContent), 'Add Progress Details');
      await click(page, '#goalProgressSaveItem');
      assert.equal(await page.$eval('#goalProgressFormError', el => el.textContent), 'Date is required.');
      for (const [override, message] of [
        [{ goalProgressHours: '' }, /required/],
        [{ goalProgressHours: '0' }, /more than 0/],
        [{ goalProgressAchievedValue: '-1' }, /negative/],
        [{ goalProgressAchievedPercent: '101' }, /between 0 and 100/]
      ]) {
        await fill(page, override); await click(page, '#goalProgressSaveItem');
        assert.match(await page.$eval('#goalProgressFormError', el => el.textContent), message);
      }
      await fill(page);
      await page.$eval('.goal-progress-content', el => { el.scrollTop = 0; });
      await page.screenshot({ path: path.join(__dirname, `performance-goal-progress-entry-${theme}-${width}.png`) });
      await click(page, '#goalProgressEntryCancel');
      assert.equal(await page.$$('.goal-progress-entry').then(items => items.length), 0, 'Cancel does not save an item');
      await click(page, '#goalProgressNew');
      assert.deepEqual(await values(page), ['', '', '', '', '']);
      await fill(page); await click(page, '#goalProgressSaveItem');
      assert.equal(await visible(page, '#goalProgressOverviewView'), true, 'Save Item returns to list');
      assert.match(await page.$eval('#goalProgressHistoryCount', el => el.textContent), /1 record.*6.5 hrs/);
      await click(page, '.goal-progress-entry-toggle');
      assert.equal(await page.$eval('.goal-progress-entry-toggle', el => el.getAttribute('aria-expanded')), 'true');
      assert.match(await page.$eval('.goal-progress-entry-body', el => el.textContent), /Mill delivery verified/);
      await page.screenshot({ path: path.join(__dirname, `performance-goal-progress-actions-${theme}-${width}.png`) });
      await click(page, '.goal-progress-edit');
      assert.deepEqual(await values(page), ['2026-10-13', '6.5', '2500', '72.5', 'Mill delivery verified.']);
      await fill(page, { goalProgressDate: '2026-10-14', goalProgressAchievedValue: '3000', goalProgressAchievedPercent: '80', goalProgressRemark: '<b>Revised delivery</b>' });
      await click(page, '#goalProgressSaveItem');
      assert.equal(await page.$$('.goal-progress-entry').then(items => items.length), 1, 'Edit replaces rather than duplicates');
      await click(page, '#goalProgressSaveDraft');
      await page.reload({ waitUntil: 'domcontentloaded' });
      assert.match(await page.$eval('.goal-progress-card', el => el.textContent), /No updates yet/, 'Draft does not publish achievements');
      await click(page, '.goal-progress-update');
      assert.equal(await page.$$('.goal-progress-entry').then(items => items.length), 1, 'Draft survives refresh');
      await click(page, '.goal-progress-entry-toggle');
      assert.equal(await page.$('.goal-progress-entry-body b'), null, 'Remarks render as text');
      await click(page, '.goal-progress-edit');
      await field(page, 'goalProgressHours', '99'); await click(page, '#goalProgressBack');
      assert.match(await page.$eval('#goalProgressHistoryCount', el => el.textContent), /6.5 hrs/, 'Header back cancels edit');
      await click(page, '.goal-progress-delete');
      assert.equal(await visible(page, '#goalProgressHistoryEmpty'), true);
      await click(page, '#goalProgressCancel'); await click(page, '.goal-progress-update');
      assert.equal(await page.$$('.goal-progress-entry').then(items => items.length), 1, 'Cancel restores saved draft');
      await click(page, '#goalProgressSubmit');
      assert.equal(await visible(page, '#goalProgressListView'), true);
      assert.match(await page.$eval('.goal-progress-card', el => el.textContent), /14 Oct 2026/);
      assert.match(await page.$eval('.goal-progress-card', el => el.textContent), /3,000 MT.*80%/);
      await page.reload({ waitUntil: 'domcontentloaded' });
      assert.match(await page.$eval('.goal-progress-card', el => el.textContent), /3,000 MT.*80%/, 'Submitted progress survives session refresh');
      await click(page, '.goal-progress-update');
      assert.equal(await page.$eval('#goalProgressDraftStatus', el => el.textContent), 'Submitted');
      await click(page, '#goalProgressNew');
      await fill(page, { goalProgressDate: '2026-10-10', goalProgressAchievedValue: '1000', goalProgressAchievedPercent: '20' });
      await click(page, '#goalProgressSaveItem'); await click(page, '#goalProgressSubmit');
      assert.match(await page.$eval('.goal-progress-card', el => el.textContent), /3,000 MT.*80%/, 'Earlier dated entry does not replace latest achievement');
      await click(page, '.goal-progress-update');
      await page.screenshot({ path: path.join(__dirname, `performance-goal-progress-filled-${theme}-${width}.png`) });
      assert.equal(await page.$eval('.goal-progress-content', el => el.scrollWidth <= el.clientWidth), true, 'No horizontal overflow');
      assert.equal(await page.$$eval('#goalProgressOverviewView button', buttons => buttons.every(el => el.scrollWidth <= el.clientWidth)), true, 'Action labels fit at mobile widths');
      await click(page, '#goalProgressSaveDraft');
      assert.equal(await page.$eval('#goalProgressSaveDraft', el => {
        const rect = el.getBoundingClientRect();
        return el.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
      }), true, 'Footer actions can scroll clear of the bottom navigation');
    }

    // Exercise isolation with two goals, then a storage failure and corrupt session.
    multipleGoals = true;
    await page.evaluate(key => sessionStorage.removeItem(key), key);
    await page.goto(url('light'), { waitUntil: 'domcontentloaded' });
    assert.equal(await page.$eval('#goalProgressTotal', el => el.textContent), '2');
    await click(page, '.goal-progress-update'); await click(page, '#goalProgressNew');
    await fill(page); await click(page, '#goalProgressSaveItem'); await click(page, '#goalProgressSaveDraft');
    await click(page, '#goalProgressCancel');
    await click(page, '[data-goal-id="SECOND-GOAL"]');
    assert.equal(await visible(page, '#goalProgressHistoryEmpty'), true, 'A different goal has no entries from the first');
    await click(page, '#goalProgressNew');
    assert.equal(await page.$eval('#goalProgressValueUnit', el => el.textContent), 'KG');
    await fill(page); await click(page, '#goalProgressSaveItem'); await click(page, '#goalProgressSubmit');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await click(page, '.goal-progress-update');
    assert.equal(await page.$$('.goal-progress-entry').then(items => items.length), 1, 'Submitting another goal retains the first goal draft');
    await page.evaluate(() => {
      window.originalStorageSet = Storage.prototype.setItem;
      Storage.prototype.setItem = () => { throw new DOMException('Storage full', 'QuotaExceededError'); };
    });
    await click(page, '#goalProgressSubmit');
    assert.equal(await visible(page, '#goalProgressOverviewView'), true, 'Failed save leaves work open');
    assert.match(await page.$eval('#goalProgressOverviewError', el => el.textContent), /Unable to save/);
    await page.evaluate(() => { Storage.prototype.setItem = window.originalStorageSet; });
    await click(page, '#goalProgressSubmit');
    assert.match(await page.$eval('.goal-progress-card', el => el.textContent), /2,500 MT/);
    await page.evaluate(key => sessionStorage.setItem(key, '{invalid-json'), key);
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(await page.$eval('#goalProgressTotal', el => el.textContent), '2', 'Invalid saved JSON cannot break the page');
    assert.deepEqual(errors, []);
    console.log('Goal Progress OT Claim flow passed: light/dark, 360/420px.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
