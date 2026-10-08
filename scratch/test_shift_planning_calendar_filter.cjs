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
    await page.type('#changeFilterSearchKeyword', 'Siti');
    await page.click('#applyFilterButton');
    await new Promise(resolve => setTimeout(resolve, 320));

    await page.click('#tabCalendarBtn');
    await page.evaluate(() => openFilterModal());
    assert.equal(await page.$eval('#staffChangeFilterFields', node => getComputedStyle(node).display), 'none');
    assert.equal(await page.$eval('#staffCopyFilterFields', node => getComputedStyle(node).display), 'none');
    assert.notEqual(await page.$eval('#calendarFilterFields', node => getComputedStyle(node).display), 'none');
    assert.deepEqual(
      await page.$$eval('#calendarFilterFields .calendar-filter-field > label', nodes => nodes.map(node => node.textContent.trim())),
      ['Search Keyword', "Staff's Shift", "Staff's Job", "Staff's Skill"]
    );
    assert.equal(await page.$eval('#calendarFilterSearchKeyword', node => node.placeholder), 'Employee ID or name');

    await page.type('#calendarFilterSearchKeyword', 'Aqilah');
    await page.select('#calendarFilterStaffShift', 'W01');
    await page.select('#calendarFilterStaffJob', 'Admin Executive');
    await page.select('#calendarFilterStaffSkill', 'Administration');
    await page.click('#applyFilterButton');
    await new Promise(resolve => setTimeout(resolve, 320));
    const calendarSummary = await page.$eval('#currentFilterTextDisplay', node => node.textContent);
    assert.match(calendarSummary, /Aqilah/);
    assert.match(calendarSummary, /W01/);
    assert.match(calendarSummary, /Admin Executive/);
    assert.match(calendarSummary, /Administration/);

    await page.click('#tabStaffBtn');
    await page.evaluate(() => openFilterModal());
    assert.equal(await page.$eval('#changeFilterSearchKeyword', node => node.value), 'Siti');
    assert.equal(await page.$eval('#calendarFilterFields', node => getComputedStyle(node).display), 'none');
    await page.evaluate(() => closeModal('filterModal'));
    await new Promise(resolve => setTimeout(resolve, 320));

    await page.click('#tabCalendarBtn');
    await page.evaluate(() => openFilterModal());
    await new Promise(resolve => setTimeout(resolve, 320));
    assert.equal(await page.evaluate(() => currentMainTab), 'calendar');
    assert.equal(await page.$eval('#changeFilterSearchKeyword', node => node.value), 'Siti');
    assert.notEqual(await page.$eval('#resetFilterButton', node => getComputedStyle(node).display), 'none');
    await page.click('#resetFilterButton');
    assert.equal(await page.$eval('#calendarFilterSearchKeyword', node => node.value), '');
    assert.equal(await page.$eval('#calendarFilterStaffShift', node => node.value), 'all');
    assert.equal(await page.$eval('#calendarFilterStaffJob', node => node.value), 'all');
    assert.equal(await page.$eval('#calendarFilterStaffSkill', node => node.value), 'all');
    assert.equal(await page.$eval('#changeFilterSearchKeyword', node => node.value), 'Siti');
    assert.deepEqual(errors, []);
    console.log('PASS: Calendar tab uses four dedicated filters with state isolated from Staff.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
