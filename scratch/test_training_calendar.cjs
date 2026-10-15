const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const moduleUrl = (file, query = '') => pathToFileURL(path.join(root, 'modules/training-competency', file)).href + query;

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--allow-file-access-from-files', '--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });

    const open = url => page.goto(url, { waitUntil: 'domcontentloaded' });
    const click = async selector => {
      await page.$eval(selector, node => node.scrollIntoView({ block: 'center' }));
      await page.click(selector);
    };

    await open(moduleUrl('index.html', '?scope=individual&theme=dark'));
    assert.deepEqual(await page.$eval('[data-option-id="training-calendar"]', node => ({
      tag: node.tagName,
      href: node.getAttribute('href')
    })), { tag: 'A', href: 'options/training-calendar.html?theme=dark' });
    await page.click('[data-view-all="trainingCompetencyIndividualOptions"]');
    await page.waitForSelector('#trainingCompetencyOptionsOverlay:not([hidden])');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.click('[data-option-ref="training-calendar"]')
    ]);

    assert.equal(await page.$eval('h1', node => node.textContent.trim()), 'Training Calendar');
    assert.equal(await page.$eval('#trainingCalendarBack', node => node.getAttribute('href')), '../index.html?scope=individual&theme=dark');
    assert.equal(await page.$eval('#trainingCalendarMonth', node => node.textContent.trim()), 'October 2026');
    assert.deepEqual(await page.$$eval('.training-calendar-weekdays span', nodes => nodes.map(node => node.textContent.trim())), ['M', 'T', 'W', 'T', 'F', 'S', 'S']);
    assert.equal(await page.$$eval('.training-calendar-day', nodes => nodes.length), 42, 'Calendar keeps a complete six-week month grid');
    assert.deepEqual(await page.$$eval('.training-calendar-day[data-has-events="true"]', nodes => nodes.map(node => node.dataset.date)), ['2026-10-20', '2026-10-27']);

    await click('#trainingCalendarNext');
    assert.equal(await page.$eval('#trainingCalendarMonth', node => node.textContent.trim()), 'November 2026');
    await click('#trainingCalendarPrevious');
    assert.equal(await page.$eval('#trainingCalendarMonth', node => node.textContent.trim()), 'October 2026');

    await click('.training-calendar-day[data-date="2026-10-20"]');
    await page.waitForSelector('#trainingCalendarSheet.is-open');
    assert.deepEqual(await page.$eval('#trainingCalendarSheet', node => ({
      hidden: node.getAttribute('aria-hidden'),
      modal: node.querySelector('[role="dialog"]').getAttribute('aria-modal'),
      title: node.querySelector('#trainingCalendarSheetDate').textContent.trim()
    })), { hidden: 'false', modal: 'true', title: '20 Oct 2026' });
    assert.equal(await page.$eval('main', node => node.inert), true, 'Calendar content is inert while the sheet is open');
    assert.deepEqual(await page.$$eval('.training-calendar-event-card', cards => cards.map(card => ({
      activity: card.querySelector('.training-calendar-event-header').textContent.trim(),
      time: card.querySelector('.training-calendar-event-time').textContent.trim(),
      action: card.querySelector('.training-calendar-detail').textContent.trim(),
      purpleHeader: getComputedStyle(card.querySelector('.training-calendar-event-header')).backgroundImage.includes('linear-gradient')
    }))), [
      { activity: 'Microsoft 365 Productivity', time: '9:00 AM – 5:00 PM', action: 'Detail', purpleHeader: true }
    ]);
    await page.waitForFunction(() => {
      const phone = document.querySelector('.phone-container').getBoundingClientRect();
      const sheet = document.querySelector('#trainingCalendarSheet [role="dialog"]').getBoundingClientRect();
      return Math.abs(phone.bottom - sheet.bottom) <= 1;
    });
    const sheetPosition = await page.$eval('#trainingCalendarSheet', node => {
      const phone = document.querySelector('.phone-container').getBoundingClientRect();
      const sheet = node.querySelector('[role="dialog"]').getBoundingClientRect();
      return { phoneBottom: phone.bottom, sheetBottom: sheet.bottom, delta: Math.abs(phone.bottom - sheet.bottom) };
    });
    assert.ok(sheetPosition.delta <= 1, `Bottom sheet is anchored to the bottom of the phone: ${JSON.stringify(sheetPosition)}`);

    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.getElementById('trainingCalendarSheet').getAttribute('aria-hidden') === 'true');
    assert.equal(await page.$eval('main', node => node.inert), false);
    assert.equal(await page.$eval('.training-calendar-day[data-date="2026-10-20"]', node => document.activeElement === node), true, 'Closing returns focus to the selected day');

    await click('.training-calendar-day[data-date="2026-10-20"]');
    await page.waitForSelector('#trainingCalendarSheet.is-open');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.$eval('.training-calendar-detail', node => node.click())
    ]);

    assert.equal(await page.$eval('h1', node => node.textContent.trim()), 'Training Request Details');
    assert.deepEqual(await page.$eval('#trainingRequestDetails', node => ({
      classHeading: node.querySelector('#trainingClassDetailsTitle').textContent.trim(),
      requestHeading: node.querySelector('#trainingRequestDetailsTitle').textContent.trim(),
      labels: [...node.querySelectorAll('.training-request-field > dt')].map(item => item.textContent.trim())
    })), {
      classHeading: 'Class Details',
      requestHeading: 'Request Details',
      labels: [
        'Class', 'Description', 'Course Title', 'Class Status', 'Start', 'End', 'Venue', 'Trainer / Facilitator', 'Class Capacity', 'Remark',
        'Document Reference', 'Document Status', 'Employee', 'Attendance Status', 'Reason', 'Is Require Traveling', 'Is Require Accommodation', 'Is Vegetarian', 'Remark', 'Attended Hours', 'Attendance Remark', 'Approver Comments'
      ]
    });
    assert.deepEqual(await page.$eval('[data-field="employee"]', node => {
      const name = node.querySelector('.training-request-employee-name');
      const employeeId = node.querySelector('.training-request-employee-id');
      const style = getComputedStyle(employeeId);
      return {
        name: name.textContent.trim(),
        employeeId: employeeId.textContent.trim(),
        directlyBelow: name.nextElementSibling === employeeId,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight
      };
    }), { name: 'Farhan Binti Rahmat', employeeId: '#EBB12', directlyBelow: true, fontSize: '11.5px', fontWeight: '700' });
    assert.equal(await page.$eval('[data-field="document-status"] .training-request-status', node => node.textContent.trim()), 'Approved');
    assert.equal(await page.$eval('#trainingRequestCancel', node => node.textContent.trim()), 'Cancel');
    assert.equal(await page.$eval('#trainingRequestCancel', node => node.getAttribute('href')), 'training-calendar.html?date=2026-10-20&theme=dark');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      click('#trainingRequestCancel')
    ]);
    await page.waitForSelector('#trainingCalendarSheet.is-open');
    assert.equal(await page.$eval('.training-calendar-day.selected', node => node.dataset.date), '2026-10-20');

    for (const theme of ['dark', 'light']) {
      for (const width of [360, 420]) {
        await page.setViewport({ width, height: 844, deviceScaleFactor: 1 });
        await open(moduleUrl('options/training-calendar.html', `?theme=${theme}`));
        assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), theme);
        const calendarOverflow = await page.$eval('.main-content', node => node.scrollWidth - node.clientWidth);
        assert.ok(calendarOverflow <= 1, `${theme} calendar fits at ${width}px`);
        await click('.training-calendar-day[data-date="2026-10-20"]');
        await page.waitForSelector('#trainingCalendarSheet.is-open');
        assert.ok(await page.$eval('#trainingCalendarSheet [role="dialog"]', node => node.scrollWidth - node.clientWidth <= 1), `${theme} sheet fits at ${width}px`);
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
          page.$eval('.training-calendar-detail', node => node.click())
        ]);
        assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), theme);
        assert.ok(await page.$eval('.main-content', node => node.scrollWidth - node.clientWidth <= 1), `${theme} details fit at ${width}px`);
      }
    }

    assert.deepEqual(pageErrors, []);
    console.log('PASS: Training Calendar routing, month controls, bottom sheet, activity cards, request details and responsive themes.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
