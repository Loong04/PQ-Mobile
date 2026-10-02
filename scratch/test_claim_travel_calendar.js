const assert = require('assert').strict;
const path = require('path');
const puppeteer = require('puppeteer');

const pageUrl = `file:///${path.resolve(__dirname, '../modules/claims/index.html').replace(/\\/g, '/')}`;

async function selectedState(page, scope) {
  return page.evaluate(currentScope => {
    const grid = document.getElementById(`${currentScope}-calendar-grid`);
    const selected = [...grid.querySelectorAll('.cal-day.active-pill')];
    return {
      buttonCount: grid.querySelectorAll('button.cal-day').length,
      selectedDays: selected.map(day => day.dataset.day),
      pressedDays: [...grid.querySelectorAll('button.cal-day[aria-pressed="true"]')].map(day => day.dataset.day),
      selectedTag: selected[0]?.tagName || '',
      background: selected[0] ? getComputedStyle(selected[0]).backgroundColor : '',
      overflow: grid.scrollWidth > grid.clientWidth + 1
    };
  }, scope);
}

async function run() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(pageUrl, { waitUntil: 'networkidle0' });
    await page.waitForSelector('#individual-calendar-grid button.cal-day');

    assert.deepEqual(await selectedState(page, 'individual'), {
      buttonCount: 30,
      selectedDays: ['28'],
      pressedDays: ['28'],
      selectedTag: 'BUTTON',
      background: 'rgb(124, 58, 237)',
      overflow: false
    });

    await page.click('#individual-calendar-grid [data-day="2"]');
    assert.deepEqual((await selectedState(page, 'individual')).selectedDays, ['2'], 'Selecting day 2 must not also select days 20–29');
    assert.ok(await page.$eval('#individual-trip-detail-card', node => node.textContent.includes('Wednesday, 2 September 2026')));

    await page.focus('#individual-calendar-grid [data-day="29"]');
    await page.keyboard.press('Enter');
    assert.deepEqual((await selectedState(page, 'individual')).selectedDays, ['29']);
    assert.ok(await page.$eval('#individual-trip-detail-card', node => node.textContent.includes('Tuesday, 29 September 2026')));

    await page.click('#individualCalendarToday');
    assert.deepEqual((await selectedState(page, 'individual')).selectedDays, ['24']);
    assert.ok(await page.$eval('#individual-trip-detail-card', node => node.textContent.includes('Thursday, 24 September 2026 (Today)')));

    await page.click('#tabClaimTeam');
    await page.waitForSelector('#team-calendar-grid button.cal-day');
    const teamFilterButtons = await page.evaluate(() => ['teamSpendingFilterButton', 'teamTravelFilterButton'].map(id => {
      const button = document.getElementById(id);
      return {
        exists: !!button,
        text: button?.textContent.trim() || '',
        icon: button?.querySelector('i')?.className || '',
        label: button?.getAttribute('aria-label') || ''
      };
    }));
    assert.deepEqual(teamFilterButtons, [
      { exists: true, text: '', icon: 'fa-solid fa-sliders', label: 'Filter monthly staff spending' },
      { exists: true, text: '', icon: 'fa-solid fa-sliders', label: 'Filter staff travel calendar' }
    ], 'Team dashboard filters must be icon-only buttons');
    assert.deepEqual((await selectedState(page, 'team')).selectedDays, ['28']);

    await page.click('#team-calendar-grid [data-day="2"]');
    assert.deepEqual((await selectedState(page, 'team')).selectedDays, ['2'], 'Team day 2 must be the only selected date');
    assert.ok(await page.$eval('#team-trip-detail-card', node => node.textContent.includes('Wednesday, 2 September 2026')));

    await page.click('#team-calendar-grid [data-day="30"]');
    assert.deepEqual((await selectedState(page, 'team')).selectedDays, ['30']);
    const september30 = await page.$eval('#team-trip-detail-card', node => node.textContent.replace(/\s+/g, ' '));
    assert.ok(september30.includes('Wednesday, 30 September 2026'));
    assert.ok(september30.includes('3 staff'));
    assert.equal(september30.includes('Daniel Lee'), false, 'Staff whose trip ended on 29 September must not appear on 30 September');

    await page.click('#teamCalendarToday');
    assert.deepEqual((await selectedState(page, 'team')).selectedDays, ['24']);
    assert.ok(await page.$eval('#team-trip-detail-card', node => node.textContent.includes('Thursday, 24 September 2026')));

    await page.click('#tabClaimIndividual');
    assert.deepEqual((await selectedState(page, 'individual')).selectedDays, ['24'], 'Individual selection must survive scope changes');
    await page.click('#tabClaimTeam');
    assert.deepEqual((await selectedState(page, 'team')).selectedDays, ['24'], 'Team selection must survive scope changes');

    assert.deepEqual(errors, []);
    console.log('PASS: Individual and Team claim calendars support exact, keyboard-accessible date selection and synced details.');
  } finally {
    await browser.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
