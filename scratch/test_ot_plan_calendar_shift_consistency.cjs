const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const otPlanUrl = pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/ot-plan.html')).href;
const shiftPlanUrl = pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/shift-plan.html')).href;

async function readCalendarStyles(page) {
  return page.evaluate(() => {
    const read = (selector, properties) => {
      const element = document.querySelector(selector);
      const styles = getComputedStyle(element);
      return Object.fromEntries(properties.map(property => [property, styles[property]]));
    };

    return {
      card: read('.grid-cal-card', ['padding', 'borderRadius', 'boxShadow']),
      header: read('.grid-cal-header', ['marginBottom', 'gap']),
      navigation: read('.grid-cal-nav-btn:not(.grid-cal-info)', ['width', 'height', 'borderRadius']),
      weekdays: read('.grid-cal-weekdays', ['marginBottom']),
      days: read('.grid-cal-days', ['gap', 'backgroundColor']),
      cell: read('.grid-cal-cell:not(.empty)', ['minHeight', 'borderRadius']),
      selected: read('.grid-cal-cell.selected', ['borderRadius', 'boxShadow'])
    };
  });
}

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
    await page.goto(shiftPlanUrl + '?theme=light', { waitUntil: 'domcontentloaded' });
    await page.click('#tabCalendarBtn');
    const shiftCalendarStyles = await readCalendarStyles(page);

    await page.goto(otPlanUrl + '?theme=light', { waitUntil: 'domcontentloaded' });
    await page.click('#tabCalendarBtn');

    assert.ok(await page.$('#calendarTabView .grid-cal-month'));
    assert.ok(await page.$('#calendarTabView .grid-cal-subtitle'));
    assert.ok(await page.$('#calendarTabView .grid-cal-controls'));
    assert.ok(await page.$('#otCalendarInfoTrigger'));
    assert.equal(await page.$('#calendarTabView .grid-cal-toggle'), null);
    assert.equal(await page.$('#calendarTabView .grid-cal-nav'), null);
    assert.equal(await page.$('#calendarTabView .grid-cal-legend'), null);
    assert.deepEqual(
      await page.$$eval('#calendarTabView .grid-cal-weekday', days => days.map(day => day.textContent.trim())),
      ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    );
    assert.deepEqual(await readCalendarStyles(page), shiftCalendarStyles);
    assert.deepEqual(
      await page.$$eval('#calSummaryCard .cal-summary-stat-label', labels => labels.map(label => label.textContent.trim())),
      ['Approved OT', 'Pending OT', 'Total OT']
    );
    assert.equal(await page.$$eval('#calSummaryCard .cal-summary-stat', stats => stats.length), 3);

    await page.click('#otCalendarInfoTrigger');
    assert.notEqual(await page.$eval('#otCalendarInfoModal', modal => getComputedStyle(modal).display), 'none');
    assert.deepEqual(errors, []);

    console.log('OT Plan calendar matches Shift Plan calendar design.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
