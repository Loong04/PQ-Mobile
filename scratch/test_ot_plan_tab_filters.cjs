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
      await page.$$eval('#staffFilterUnapprovedOt option', options => options.map(option => [option.value, option.textContent.trim()])),
      [['all', '- All -'], ['yes', 'Yes'], ['no', 'No']]
    );

    await page.select('#staffFilterSection', 'Account');
    await page.select('#staffFilterUnapprovedOt', 'yes');
    await page.click('#applyFilterButton');
    await new Promise(resolve => setTimeout(resolve, 320));
    assert.equal(await page.$eval('#listCounterText', node => node.textContent.trim()), '1');
    assert.match(await page.$eval('#staffCardsContainer', node => node.textContent), /Loh Siew Hong/);
    assert.match(await page.$eval('#currentFilterTextDisplay', node => node.textContent), /Unapproved OT: Yes/);

    await page.click('#tabCalendarBtn');
    await page.evaluate(() => openFilterModal());
    assert.equal(await page.$eval('#staffFilterFields', node => getComputedStyle(node).display), 'none');
    assert.notEqual(await page.$eval('#calendarFilterFields', node => getComputedStyle(node).display), 'none');
    assert.equal(await page.$eval('#summaryFilterFields', node => getComputedStyle(node).display), 'none');
    await page.evaluate(() => closeModal('filterModal'));
    await page.waitForFunction(() => getComputedStyle(document.getElementById('filterModal')).display === 'none');

    await page.click('#tabSummaryBtn');
    await page.evaluate(() => openFilterModal());
    assert.equal(await page.$eval('#staffFilterFields', node => getComputedStyle(node).display), 'none');
    assert.equal(await page.$eval('#calendarFilterFields', node => getComputedStyle(node).display), 'none');
    assert.notEqual(await page.$eval('#summaryFilterFields', node => getComputedStyle(node).display), 'none');
    assert.deepEqual(errors, []);

    console.log('OT Plan tab-specific filter checks passed.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
