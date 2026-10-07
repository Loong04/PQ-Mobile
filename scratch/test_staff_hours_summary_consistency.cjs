const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--allow-file-access-from-files']
  });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/staff-hours-summary.html')).href, { waitUntil: 'networkidle0' });

    const referencePage = await browser.newPage();
    await referencePage.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await referencePage.goto(pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/hours-summary.html')).href, { waitUntil: 'networkidle0' });
    await page.addStyleTag({ content: '* { transition: none !important; animation: none !important; }' });
    await referencePage.addStyleTag({ content: '* { transition: none !important; animation: none !important; }' });
    await page.$$eval('.modern-card', cards => cards.forEach(card => card.style.setProperty('transition', 'none', 'important')));
    await referencePage.$$eval('.modern-card', cards => cards.forEach(card => card.style.setProperty('transition', 'none', 'important')));
    const paletteSnapshot = target => target.evaluate(() => {
      const read = (cardSelector, bubbleSelector) => {
        const card = document.querySelector(cardSelector);
        const bubble = card.querySelector(bubbleSelector);
        const title = card.querySelector('.card-theme-title');
        const primary = card.querySelector('.summary-card-primary');
        const secondary = card.querySelector('.summary-card-secondary') || document.querySelector(cardSelector + ' .summary-card-secondary');
        const cardStyle = getComputedStyle(card);
        return {
          backgroundColor: cardStyle.backgroundColor,
          backgroundImage: cardStyle.backgroundImage,
          borderColor: cardStyle.borderColor,
          bubbleBackground: getComputedStyle(bubble).backgroundColor,
          bubbleColor: getComputedStyle(bubble).color,
          titleColor: getComputedStyle(title).color,
          primaryColor: getComputedStyle(primary).color,
          secondaryColor: getComputedStyle(secondary).color
        };
      };
      return {
        work: read('.card-work-section', '.bubble-green'),
        overtime: read('.card-ot-section', '.bubble-blue'),
        exceptions: read('.card-ex-section', '.bubble-purple')
      };
    });
    for (const theme of ['light', 'dark']) {
      await page.evaluate(value => document.documentElement.setAttribute('data-theme', value), theme);
      await referencePage.evaluate(value => document.documentElement.setAttribute('data-theme', value), theme);
      assert.deepEqual(await paletteSnapshot(page), await paletteSnapshot(referencePage), 'Staff Hours card palettes must exactly match Hours Summary in ' + theme + ' mode');
    }
    await referencePage.close();

    assert.deepEqual(await page.$$eval('.dashboard-section-header h2', nodes => nodes.map(node => node.textContent.trim())), [
      'Work & Attendance',
      'Overtime Analytics',
      'Exceptions & Leave'
    ]);
    assert.equal(await page.$$eval('.section-badge, .section-title-icon', nodes => nodes.length), 0, 'Staff and individual Hours Summary section headers must match');

    const sections = await page.$$eval('#view-dashboard > div:is(.bento-group-work, .ot-grid-matrix, .exceptions-bento-matrix)', groups => groups.map(group => ({
      labels: [...group.querySelectorAll('.card-theme-title')].map(node => node.textContent.trim()),
      cards: group.querySelectorAll('.summary-kpi-card').length,
      fullWidthCards: group.querySelectorAll('.full-width').length,
      columns: getComputedStyle(group).gridTemplateColumns.split(' ').length
    })));
    assert.deepEqual(sections, [
      { labels: ['Scheduled Work Days', 'Normal Present Days', 'Normal Work Hours', 'Odd Clocking Days'], cards: 4, fullWidthCards: 0, columns: 2 },
      { labels: ['Normal OT Hours', 'Other OT Hours', 'Unapproved OT Hours', 'Plan OT Hours'], cards: 4, fullWidthCards: 0, columns: 2 },
      { labels: ['Absent OT Hours', 'Absent Days', 'Leave Hours', 'Lost Hours'], cards: 4, fullWidthCards: 0, columns: 2 }
    ]);

    assert.deepEqual(await page.$$eval('.summary-kpi-card', cards => cards.map(card => ({
      hasHeader: Boolean(card.querySelector('.summary-card-header')),
      hasValues: Boolean(card.querySelector('.summary-card-values')),
      minHeight: getComputedStyle(card).minHeight,
      direction: getComputedStyle(card).flexDirection
    }))), Array.from({ length: 12 }, () => ({ hasHeader: true, hasValues: true, minHeight: '126px', direction: 'column' })));

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    assert.deepEqual(await page.$eval('.exceptions-bento-matrix .summary-kpi-card', card => {
      const cardStyle = getComputedStyle(card);
      const iconStyle = getComputedStyle(card.querySelector('.bubble-purple'));
      const percentStyle = getComputedStyle(card.parentElement.querySelector('.summary-card-secondary'));
      return {
        usesPurpleGradient: cardStyle.backgroundImage.includes('linear-gradient'),
        avoidsRoseBorder: cardStyle.borderColor !== 'rgb(254, 205, 211)',
        iconColor: iconStyle.color,
        percentColor: percentStyle.color
      };
    }), {
      usesPurpleGradient: true,
      avoidsRoseBorder: true,
      iconColor: 'rgb(124, 58, 237)',
      percentColor: 'rgb(124, 58, 237)'
    }, 'Exceptions & Leave must keep the purple Hours Summary palette in light mode');

    assert.deepEqual(await page.evaluate(() => ({
      scheduled: document.getElementById('statScheduledDays').textContent.trim(),
      scheduledPct: document.getElementById('pctScheduledDays').textContent.trim(),
      present: document.getElementById('statPresentDays').textContent.trim(),
      presentPct: document.getElementById('pctPresentDays').textContent.trim(),
      normalHours: document.getElementById('statNormalWorkHours').textContent.trim(),
      odd: document.getElementById('statOddClocking').textContent.trim(),
      normalOt: document.getElementById('statNormalOt').textContent.trim(),
      unapprovedOt: document.getElementById('statUnapprovedOt').textContent.trim(),
      absentDays: document.getElementById('statAbsentDays').textContent.trim(),
      leaveHours: document.getElementById('statLeaveHours').textContent.trim(),
      lostHours: document.getElementById('statLostHours').textContent.trim()
    })), {
      scheduled: '108',
      scheduledPct: '100%',
      present: '105',
      presentPct: '97%',
      normalHours: '836.00',
      odd: '3',
      normalOt: '96.00',
      unapprovedOt: '12.00',
      absentDays: '0',
      leaveHours: '24.00',
      lostHours: '4.00'
    }, 'Dashboard totals must come from the active staff records');

    assert.deepEqual(await page.$$eval('#filterModal .claim-filter-fields > div', fields => fields.map(field => field.querySelector('label').textContent.trim())), [
      'Search keyword',
      'Start date',
      'End date',
      'Minimum present hours',
      'Company',
      'Cost centre'
    ]);

    await page.click('.bento-group-work .summary-kpi-card');
    assert.notEqual(await page.$eval('#view-list', node => getComputedStyle(node).display), 'none');
    assert.equal(await page.$eval('#details-list-container .summary-history-card', node =>
      node.querySelector('.staff-name-text').nextElementSibling.textContent.trim()
    ), '#EBB01');
    await page.evaluate(() => goBack());

    await page.click('.staff-hours-filter-trigger');
    await page.select('#filterCompany', 'Tech Global Ltd');
    await page.click('#filterModal .claim-filter-apply');
    assert.deepEqual(await page.evaluate(() => ({
      scheduled: document.getElementById('statScheduledDays').textContent.trim(),
      present: document.getElementById('statPresentDays').textContent.trim(),
      normalHours: document.getElementById('statNormalWorkHours').textContent.trim(),
      planOt: document.getElementById('statPlannedOt').textContent.trim(),
      leaveHours: document.getElementById('statLeaveHours').textContent.trim()
    })), { scheduled: '42', present: '40', normalHours: '320.00', planOt: '8.00', leaveHours: '16.00' });
    assert.equal(await page.$eval('.main-content', node => node.scrollWidth <= node.clientWidth + 1), true);
    assert.deepEqual(errors, []);

    console.log('PASS: Staff Hours Summary matches Hours Summary cards, metrics, filters and staff details.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
