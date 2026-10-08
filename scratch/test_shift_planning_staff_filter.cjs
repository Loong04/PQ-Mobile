const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const pageUrl = pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/shift-plan.html')).href;

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
    await page.setViewport({ width: 390, height: 950 });
    await page.goto(pageUrl + '?theme=light', { waitUntil: 'load' });

    await page.evaluate(() => openFilterModal());
    assert.equal(await page.$eval('#filterModal', node => getComputedStyle(node).display), 'flex');
    assert.notEqual(await page.$eval('#staffChangeFilterFields', node => getComputedStyle(node).display), 'none');
    assert.equal(await page.$eval('#staffCopyFilterFields', node => getComputedStyle(node).display), 'none');
    assert.deepEqual(
      await page.$$eval('#staffChangeFilterFields .staff-change-filter-field > label', nodes => nodes.map(node => node.textContent.trim())),
      ['Date', "Staff's Shift", 'Search Keyword', 'Branch', 'Section', 'Job Title']
    );
    assert.equal(await page.$eval('#changeFilterDate', node => node.type), 'date');
    assert.equal(await page.$eval('#changeFilterSearchKeyword', node => node.placeholder), 'Employee ID or name');

    await page.type('#changeFilterSearchKeyword', 'Siti');
    await page.click('#applyFilterButton');
    await new Promise(resolve => setTimeout(resolve, 320));
    assert.equal(await page.$$eval('#staffCardsContainer .staff-card', cards => cards.length), 1);
    assert.equal(await page.$eval('#staffCardsContainer .staff-card', card => card.textContent.includes('Siti Nurhaliza')), true);
    assert.match(await page.$eval('#currentFilterTextDisplay', node => node.textContent), /Siti/);

    await page.click('#modeCopyDatesBtn');
    await page.evaluate(() => openFilterModal());
    assert.equal(await page.$eval('#staffChangeFilterFields', node => getComputedStyle(node).display), 'none');
    assert.notEqual(await page.$eval('#staffCopyFilterFields', node => getComputedStyle(node).display), 'none');
    assert.deepEqual(
      await page.$$eval('#staffCopyFilterFields .staff-copy-filter-field > label', nodes => nodes.map(node => node.textContent.trim())),
      ['Date', 'Search Keyword', 'Branch', 'Section', 'Job Title', "Staff's Shift"]
    );
    assert.equal(await page.$eval('#copyFilterSearchKeyword', node => node.value), '');
    await page.$eval('#copyFilterDate', node => { node.value = '2026-09-25'; });
    await page.type('#copyFilterSearchKeyword', 'Aqilah');
    await page.select('#copyFilterStaffShift', 'W01');
    await page.click('#applyFilterButton');
    await new Promise(resolve => setTimeout(resolve, 320));
    assert.match(await page.$eval('#currentDateDisplay', node => node.textContent), /25.*Sep.*2026/);
    assert.equal(await page.$$eval('#staffCardsContainer .staff-card', cards => cards.length), 1);
    assert.match(await page.$eval('#currentFilterTextDisplay', node => node.textContent), /Aqilah/);

    await page.click('#modeChangeShiftBtn');
    await page.evaluate(() => openFilterModal());
    assert.equal(await page.$eval('#changeFilterSearchKeyword', node => node.value), 'Siti');
    assert.equal(await page.$eval('#copyFilterSearchKeyword', node => node.value), 'Aqilah');
    await page.click('#resetFilterButton');
    assert.equal(await page.$eval('#changeFilterSearchKeyword', node => node.value), '');
    assert.equal(await page.$eval('#copyFilterSearchKeyword', node => node.value), 'Aqilah');
    assert.equal(await page.$$eval('#staffCardsContainer .staff-card', cards => cards.length), 6);
    assert.deepEqual(errors, []);
    console.log('PASS: Staff Change Shift and Copy to Dates use separate ordered filters and independent state.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
