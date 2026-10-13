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
    for (const theme of ['light', 'dark']) {
    await page.goto(pageUrl + '?theme=' + theme, { waitUntil: 'load' });

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
    assert.equal(initiallySelected, 0, 'No staff is preselected');
    assert.equal(await page.$eval('#shiftPlanningActionBar', node => getComputedStyle(node).display), 'none');
    assert.equal(await page.$eval('#selectedRecordsText', node => node.textContent), '0');
    assert.deepEqual(await page.$$eval('.list-header .staff-record-label', nodes => nodes.map(node => node.textContent)), ['Total Records', 'Selected Records']);
    assert.equal(await page.$('#selectedCountText'), null);
    assert.equal(await page.$eval('#shiftPlanningActionBar', node => getComputedStyle(node).position), 'absolute');

    await page.click('#shiftPickerTrigger');
    assert.equal(await page.$eval('#shiftSelectModal', node => getComputedStyle(node).display), 'flex');
    await page.evaluate(() => closeModal('shiftSelectModal'));
    await new Promise(resolve => setTimeout(resolve, 320));

    const counterText = await page.$eval('#listCounterText', node => node.textContent.trim());
    assert.match(counterText, /^\d+$/);
    assert.equal(Number(counterText), await page.$$eval('.staff-card', cards => cards.length));
    const eligibleCount = await page.$$eval('.staff-card:not(.disabled)', cards => cards.length);
    await page.click('.staff-card:not(.disabled)');
    assert.equal(await page.$eval('#selectedRecordsText', node => node.textContent), '1');
    assert.equal(await page.$eval('#shiftPlanningActionBar', node => getComputedStyle(node).display), 'flex');
    await page.click('.staff-card.selected');
    assert.equal(await page.$eval('#selectedRecordsText', node => node.textContent), '0');
    assert.equal(await page.$eval('#shiftPlanningActionBar', node => getComputedStyle(node).display), 'none');
    assert.equal(await page.$eval('#selectAllCheckbox', node => node.indeterminate), false);
    await page.click('#selectAllCheckbox');
    assert.equal(await page.$$eval('.staff-card.selected', cards => cards.length), eligibleCount);
    assert.equal(await page.$$eval('.staff-card.disabled.selected', cards => cards.length), 0);
    assert.equal(await page.$eval('#shiftPlanningActionBar', node => node.textContent.trim()), 'Update');
    assert.equal(await page.$eval('#selectedRecordsText', node => Number(node.textContent)), eligibleCount);
    assert.equal(await page.$eval('#selectAllCheckbox', node => node.checked), true);

    await page.click('#selectAllCheckbox');
    assert.equal(await page.$$eval('.staff-card.selected', cards => cards.length), 0);
    assert.equal(await page.$eval('#selectAllCheckbox', node => node.checked), false);
    assert.equal(await page.$eval('#shiftPlanningActionBar', node => getComputedStyle(node).display), 'none');
    await page.evaluate(() => switchMainTab('calendar'));
    await page.evaluate(() => switchMainTab('staff'));
    assert.equal(await page.$eval('#shiftPlanningActionBar', node => getComputedStyle(node).display), 'none', 'Returning to Staff does not show an empty action bar');
    await page.click('#selectAllCheckbox');

    await page.click('#bottomMainActionBtn');
    assert.equal(await page.$eval('#reviewChangesModal', node => getComputedStyle(node).display), 'flex');
    assert.equal(await page.$eval('#reviewSubtext', node => node.textContent.trim()), `${eligibleCount} staff will be updated`);
    assert.equal(await page.$eval('main, #mainContentScroll', node => node.scrollWidth <= node.clientWidth + 1), true);
    await page.evaluate(() => closeModal('reviewChangesModal'));
    await page.waitForFunction(() => getComputedStyle(document.getElementById('reviewChangesModal')).display === 'none');
    await page.evaluate(() => switchMainTab('summary'));
    assert.equal(await page.$eval('#shiftPlanningActionBar', node => getComputedStyle(node).display), 'none');
    await page.evaluate(() => switchMainTab('staff'));
    assert.equal(await page.$eval('#shiftPlanningActionBar', node => getComputedStyle(node).display), 'flex');
    await page.click('#selectAllCheckbox');
    await page.evaluate(() => setSelectionMode('copy_dates'));
    assert.equal(await page.$eval('#selectedRecordsText', node => node.textContent), '0');
    assert.equal(await page.$eval('#shiftPlanningActionBar', node => getComputedStyle(node).display), 'none');
    assert.equal(await page.$eval('#shiftPickerTrigger', node => node.getClientRects().length > 0), true, 'Copy to dates also shows the New shift picker');
    await page.click('#shiftPickerTrigger');
    assert.equal(await page.$eval('#shiftSelectModal', node => getComputedStyle(node).display), 'flex');
    await page.click('#shiftOptionsList .picker-box:nth-child(3)');
    await page.waitForFunction(() => getComputedStyle(document.getElementById('shiftSelectModal')).display === 'none');
    assert.match(await page.$eval('#selectedShiftLabel', node => node.textContent), /^W03/);
    await page.evaluate(() => setSelectionMode('change_shift'));
    assert.match(await page.$eval('#selectedShiftLabel', node => node.textContent), /^W03/, 'Changing mode preserves the selected shift');
    await page.evaluate(() => setSelectionMode('copy_dates'));
    await page.click('#shiftPickerTrigger');
    await page.click('#shiftOptionsList .picker-box:nth-child(2)');
    await page.waitForFunction(() => getComputedStyle(document.getElementById('shiftSelectModal')).display === 'none');
    await page.click('#selectAllCheckbox');
    assert.equal(await page.$eval('#selectedRecordsText', node => Number(node.textContent)), Number(counterText));
    assert.equal(await page.$eval('#bottomMainActionBtn', node => node.textContent), 'Copy');
    await page.click('#bottomMainActionBtn');
    assert.equal(await page.$eval('#chooseDatesModal', node => getComputedStyle(node).display), 'flex');
    await page.evaluate(() => closeModal('chooseDatesModal'));
    await page.waitForFunction(() => getComputedStyle(document.getElementById('chooseDatesModal')).display === 'none');
    await page.click('#selectAllCheckbox');
    await page.evaluate(() => setSelectionMode('change_shift'));
    for (const width of [360, 390, 420]) {
      await page.setViewport({ width, height: 950 });
      assert.ok(await page.$eval('.list-header', node => node.scrollWidth <= node.clientWidth + 1), 'Record counts fit on mobile');
    }
    await page.$eval('#mainContentScroll', node => { node.scrollTop = 0; });
    await page.screenshot({ path: path.join(__dirname, `shift-planning-counts-${theme}.png`) });
    }
    assert.deepEqual(errors, []);
    console.log('PASS: Shift Planning selection, dropdown affordance and Update action are consistent.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
