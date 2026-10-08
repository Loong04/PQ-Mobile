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
    await page.click('#tabCalendarBtn');

    assert.equal(await page.$('.grid-cal-title'), null);
    assert.equal(await page.$eval('.grid-cal-subtitle', node => node.textContent.trim()), 'Staff & scheduled hours');
    assert.equal(await page.$('.grid-cal-toggle'), null);
    assert.equal(await page.$('.grid-cal-today'), null);
    assert.equal(await page.$eval('#gridCalTitle', node => node.textContent.trim()), 'September 2026');
    assert.equal(await page.$$eval('.grid-cal-controls [data-grid-month]', buttons => buttons.length), 2);
    assert.equal(await page.$eval('#shiftCalendarInfoTrigger', node => node.textContent.trim()), 'Info');
    assert.equal(await page.$('.grid-cal-legend'), null);
    assert.deepEqual(await page.$$eval('.grid-cal-weekday', nodes => nodes.map(node => node.textContent.trim())), ['M', 'T', 'W', 'T', 'F', 'S', 'S']);

    const cells = await page.$$eval('#gridCalDays .grid-cal-cell', nodes => nodes.map(node => ({
      empty: node.classList.contains('empty'),
      selected: node.classList.contains('selected'),
      date: node.querySelector('.grid-cal-date')?.textContent.trim() || '',
      staff: node.querySelector('.grid-cal-stat-staff')?.textContent.trim() || '',
      hours: node.querySelector('.grid-cal-stat-hours')?.textContent.trim() || ''
    })));
    assert.equal(cells.length, 31);
    assert.deepEqual(cells[0], { empty: true, selected: false, date: '31', staff: '', hours: '' });
    assert.deepEqual(cells.find(cell => cell.date === '1'), { empty: false, selected: false, date: '1', staff: '287', hours: '2,192h' });
    assert.equal(cells.find(cell => cell.date === '15').selected, true);
    assert.equal(await page.$eval('#gridCalDays', node => getComputedStyle(node).gap), '5px');
    assert.equal(await page.$eval('#gridCalDays .grid-cal-cell:not(.empty)', node => getComputedStyle(node).borderRadius), '12px');
    assert.deepEqual(await page.$eval('#gridCalTitle', node => ({
      size: getComputedStyle(node).fontSize,
      weight: getComputedStyle(node).fontWeight
    })), { size: '15px', weight: '800' });
    assert.deepEqual(await page.$eval('.grid-cal-weekday', node => ({
      size: getComputedStyle(node).fontSize,
      weight: getComputedStyle(node).fontWeight
    })), { size: '11px', weight: '800' });
    assert.deepEqual(await page.$eval('#gridCalDays .grid-cal-cell:not(.empty):not(.selected) .grid-cal-date', node => ({
      size: getComputedStyle(node).fontSize,
      weight: getComputedStyle(node).fontWeight
    })), { size: '13.5px', weight: '700' });
    assert.deepEqual(await page.$eval('#gridCalDays .grid-cal-cell.selected .grid-cal-date', node => ({
      size: getComputedStyle(node).fontSize,
      weight: getComputedStyle(node).fontWeight
    })), { size: '14.5px', weight: '900' });
    assert.equal(await page.$eval('.grid-cal-stat-staff', node => getComputedStyle(node).fontSize), '9.5px');

    await page.click('#shiftCalendarInfoTrigger');
    assert.equal(await page.$eval('#shiftCalendarInfoModal', node => getComputedStyle(node).display), 'flex');
    await page.evaluate(() => closeModal('shiftCalendarInfoModal'));
    await new Promise(resolve => setTimeout(resolve, 320));

    await page.$$eval('#gridCalDays .grid-cal-cell', nodes => nodes.find(node => node.querySelector('.grid-cal-date')?.textContent.trim() === '24').click());
    assert.equal(await page.$eval('#gridCalDays .grid-cal-cell.selected .grid-cal-date', node => node.textContent.trim()), '24');
    assert.equal(await page.$eval('#calSummaryTitle', node => node.textContent.trim()), 'Thu, 24 Sept 2026');

    await page.click('[data-grid-month="next"]');
    assert.equal(await page.$eval('#gridCalTitle', node => node.textContent.trim()), 'October 2026');
    assert.equal(await page.$eval('#calSummaryTitle', node => node.textContent.trim()), 'Thu, 15 Oct 2026');
    await page.click('[data-grid-month="previous"]');
    assert.equal(await page.$eval('#gridCalTitle', node => node.textContent.trim()), 'September 2026');
    assert.equal(await page.$eval('#calSummaryTitle', node => node.textContent.trim()), 'Tue, 15 Sept 2026');
    assert.equal(await page.$eval('#calendarTabView', node => node.scrollWidth <= node.clientWidth + 1), true);
    assert.deepEqual(errors, []);
    console.log('PASS: Shift Calendar matches the Leave calendar design and preserves staff/hour data.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
