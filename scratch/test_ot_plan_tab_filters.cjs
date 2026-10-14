const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const pageUrl = pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/ot-plan.html')).href;

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--allow-file-access-from-files']
  });

  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewport({ width: 390, height: 900 });
    await page.goto(pageUrl + '?theme=light', { waitUntil: 'load' });

    await page.evaluate(() => openFilterModal());
    assert.notEqual(await page.$eval('#staffFilterFields', node => getComputedStyle(node).display), 'none');
    assert.equal(await page.$eval('#calendarFilterFields', node => getComputedStyle(node).display), 'none');
    assert.equal(await page.$eval('#summaryFilterFields', node => getComputedStyle(node).display), 'none');
    assert.deepEqual(
      await page.$$eval('#staffFilterFields .ot-filter-field > label', labels => labels.map(label => label.textContent.trim())),
      ['Date', 'Search Keyword', 'Section', 'Job Title', 'Unapproved OT']
    );
    assert.deepEqual(
      await page.$eval('#staffFilterUnapprovedOt', input => ({
        tagName: input.tagName,
        type: input.type,
        role: input.getAttribute('role'),
        checked: input.checked
      })),
      { tagName: 'INPUT', type: 'checkbox', role: 'switch', checked: false }
    );
    assert.deepEqual(
      await page.$eval('#staffFilterUnapprovedOt + .ot-filter-switch-track', track => {
        const styles = getComputedStyle(track);
        return { width: styles.width, height: styles.height, borderRadius: styles.borderRadius };
      }),
      { width: '44px', height: '24px', borderRadius: '24px' }
    );

    await page.select('#staffFilterSection', 'Account');
    await page.click('#staffFilterUnapprovedOt');
    assert.equal(await page.$eval('#staffFilterUnapprovedOt', input => input.checked), true);
    await page.click('#applyFilterButton');
    await new Promise(resolve => setTimeout(resolve, 320));
    assert.equal(await page.$eval('#listCounterText', node => node.textContent.trim()), '1');
    assert.match(await page.$eval('#staffCardsContainer', node => node.textContent), /Loh Siew Hong/);
    assert.match(await page.$eval('#currentFilterTextDisplay', node => node.textContent), /Unapproved OT: Yes/);

    await page.evaluate(() => openFilterModal());
    await page.evaluate(() => resetFilterRoster());
    assert.equal(await page.$eval('#staffFilterUnapprovedOt', input => input.checked), false);
    await page.evaluate(() => closeModal('filterModal'));
    await page.waitForFunction(() => getComputedStyle(document.getElementById('filterModal')).display === 'none');

    await page.click('#tabCalendarBtn');
    await page.evaluate(() => openFilterModal());
    assert.equal(await page.$eval('#staffFilterFields', node => getComputedStyle(node).display), 'none');
    assert.notEqual(await page.$eval('#calendarFilterFields', node => getComputedStyle(node).display), 'none');
    assert.equal(await page.$eval('#summaryFilterFields', node => getComputedStyle(node).display), 'none');
    assert.deepEqual(
      await page.$$eval('#calendarFilterFields .ot-filter-field > label', labels => labels.map(label => label.textContent.trim())),
      ['Search Keyword', 'Staff Shift']
    );
    assert.equal(await page.$('#calendarFilterStaffJob'), null);
    assert.equal(await page.$('#calendarFilterStaffSkill'), null);
    assert.deepEqual(
      await page.$$eval('#calendarFilterStaffShift option', options => options.map(option => [option.value, option.textContent.trim()])),
      [['all', '- All Staff Shifts -'], ['W01', 'W01 · Morning Shift'], ['W02', 'W02 · Regular Day'], ['W03', 'W03 · Night Shift']]
    );
    await page.type('#calendarFilterSearchKeyword', 'Aqilah');
    await page.select('#calendarFilterStaffShift', 'W02');
    assert.equal(await page.$eval('#calendarFilterStaffShift', node => node.value), 'W02');
    await page.click('#applyFilterButton');
    await new Promise(resolve => setTimeout(resolve, 320));
    assert.match(await page.$eval('#currentFilterTextDisplay', node => node.textContent), /"Aqilah"/);
    assert.match(await page.$eval('#currentFilterTextDisplay', node => node.textContent), /Shift: W02/);

    await page.evaluate(() => openFilterModal());
    await page.evaluate(() => resetFilterRoster());
    assert.equal(await page.$eval('#calendarFilterSearchKeyword', node => node.value), '');
    assert.equal(await page.$eval('#calendarFilterStaffShift', node => node.value), 'all');
    await page.evaluate(() => closeModal('filterModal'));
    await page.waitForFunction(() => getComputedStyle(document.getElementById('filterModal')).display === 'none');

    await page.click('#tabSummaryBtn');
    await page.evaluate(() => openFilterModal());
    assert.equal(await page.$eval('#staffFilterFields', node => getComputedStyle(node).display), 'none');
    assert.equal(await page.$eval('#calendarFilterFields', node => getComputedStyle(node).display), 'none');
    assert.notEqual(await page.$eval('#summaryFilterFields', node => getComputedStyle(node).display), 'none');
    assert.deepEqual(
      await page.$$eval('#summaryFilterFields .ot-filter-field > label', labels => labels.map(label => label.textContent.trim())),
      ['Date', 'Shift Type', 'Department', 'Section', 'Cost Centre']
    );
    assert.equal(await page.$('#summaryFilterBranch'), null);
    assert.deepEqual(errors, []);

    console.log('OT Plan tab-specific filter checks passed.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
