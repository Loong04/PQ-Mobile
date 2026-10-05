const assert = require('node:assert/strict');
const path = require('node:path');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844 });
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.goto(`file://${path.resolve(__dirname, '../leave.html')}`, {
      waitUntil: 'domcontentloaded'
    });

    const result = await page.evaluate(() => {
      showLeaveSection('viewTeamDashboard');
      openTeamUpcomingLeaveSheet();

      const cards = [...document.querySelectorAll('.team-upcoming-leave-card')];
      const calendarMonth = document.getElementById('teamCalMonthText');
      const calendarNavigator = calendarMonth?.parentElement;

      return {
        dashboardMonthFilterExists: Boolean(document.getElementById('teamFilterMonthLabel')),
        calendarMonthText: calendarMonth?.textContent.trim() || '',
        calendarArrowCount: calendarNavigator
          ? calendarNavigator.querySelectorAll('button[onclick^="shiftTeamCalMonth"]').length
          : 0,
        cardCount: cards.length,
        cards: cards.map(card => ({
          submittedDateLabels: [...card.querySelectorAll('.leave-highlight-detail-label')]
            .filter(node => node.textContent.trim() === 'Submitted Date').length,
          leaveDateLabels: [...card.querySelectorAll('.leave-highlight-detail-label')]
            .filter(node => node.textContent.trim() === 'Leave Date').length,
          legacyLeaveDateRows: card.querySelectorAll('.team-upcoming-leave-date-row').length,
          bodyLabels: [...card.querySelectorAll('.leave-highlight-detail-body .leave-highlight-detail-label')]
            .map(node => node.textContent.trim())
        }))
      };
    });

    assert.equal(result.dashboardMonthFilterExists, false,
      'Team Dashboard top month filter bar must be removed');
    assert.equal(result.calendarMonthText, 'September 2026',
      'Team Leave Calendar must retain its own month display');
    assert.equal(result.calendarArrowCount, 2,
      'Team Leave Calendar must retain previous and next month controls');
    assert.ok(result.cardCount > 0, 'Upcoming Leave must render records');
    for (const card of result.cards) {
      assert.equal(card.submittedDateLabels, 0,
        'Upcoming Leave cards must not show Submitted Date');
      assert.equal(card.leaveDateLabels, 1,
        'Upcoming Leave cards must show Leave Date exactly once');
      assert.equal(card.legacyLeaveDateRows, 0,
        'Leave Date must move into the two-column detail row without duplication');
      assert.deepEqual(card.bodyLabels, ['Leave Date', 'Duration']);
    }
    assert.deepEqual(pageErrors, []);

    console.log('PASS: Team Dashboard month bar removed; calendar navigation retained; Upcoming Leave uses Leave Date + Duration.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
