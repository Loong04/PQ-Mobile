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

    assert.equal(await page.$eval('#selectAllControl', node => node.textContent.trim()), 'Select All');
    assert.equal(await page.$eval('#selectAllCheckbox', node => node.type), 'checkbox');
    assert.equal(await page.$eval('#shiftPickerTrigger', node => node.tagName), 'BUTTON');
    assert.equal(await page.$('#shiftPickerTrigger .shift-picker-action'), null);
    assert.ok(await page.$('#shiftPickerTrigger .shift-picker-chevron'));
    assert.equal(await page.$('#shiftPickerTrigger .shift-picker-icon'), null);

    assert.ok(await page.$('#shiftPlanningActionBar'));
    assert.equal(await page.$('#shiftPlanningActionBar .bar-clear-btn'), null);
    assert.equal(await page.$eval('#bottomMainActionBtn', node => node.textContent.trim()), 'Update');
    const initiallySelected = await page.$$eval('.staff-card.selected', cards => cards.length);
    assert.equal(await page.$eval('#selectedCountText', node => node.textContent.trim()), `${initiallySelected} staff selected`);
    assert.equal(await page.$eval('#shiftPlanningActionBar', node => getComputedStyle(node).position), 'absolute');

    await page.click('#shiftPickerTrigger');
    assert.equal(await page.$eval('#shiftSelectModal', node => getComputedStyle(node).display), 'flex');
    await page.evaluate(() => closeModal('shiftSelectModal'));
    await new Promise(resolve => setTimeout(resolve, 320));

    const counterText = await page.$eval('#listCounterText', node => node.textContent.trim());
    assert.match(counterText, /^\d+ eligible$/);
    const eligibleCount = Number(counterText.match(/^\d+/)[0]);
    assert.equal(await page.$eval('#selectAllCheckbox', node => node.indeterminate), false);
    await page.click('#selectAllCheckbox');
    assert.equal(await page.$$eval('.staff-card.selected', cards => cards.length), eligibleCount);
    assert.equal(await page.$$eval('.staff-card.disabled.selected', cards => cards.length), 0);
    assert.equal(await page.$eval('#selectedCountText', node => node.textContent.trim()), `${eligibleCount} staff selected`);
    assert.equal(await page.$eval('#selectAllCheckbox', node => node.checked), true);

    await page.click('#selectAllCheckbox');
    assert.equal(await page.$$eval('.staff-card.selected', cards => cards.length), 0);
    assert.equal(await page.$eval('#selectAllCheckbox', node => node.checked), false);
    await page.click('#selectAllCheckbox');

    await page.click('#bottomMainActionBtn');
    assert.equal(await page.$eval('#reviewChangesModal', node => getComputedStyle(node).display), 'flex');
    assert.equal(await page.$eval('#reviewSubtext', node => node.textContent.trim()), `${eligibleCount} staff will be updated`);
    assert.equal(await page.$eval('main, #mainContentScroll', node => node.scrollWidth <= node.clientWidth + 1), true);
    assert.deepEqual(errors, []);
    console.log('PASS: Shift Planning selection, dropdown affordance and Update action are consistent.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
