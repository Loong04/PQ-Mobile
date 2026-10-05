const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const leaveUrl = pathToFileURL(path.resolve(__dirname, '..', 'leave.html')).href + '?mode=team&theme=dark';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 950 });
    await page.goto(leaveUrl, { waitUntil: 'domcontentloaded' });

    const hubResult = await page.evaluate(() => {
      const day = document.querySelector('#hubTeamCalDaysGridContainer [data-day="11"]');
      day?.click();
      const overlay = document.getElementById('calDateDetailsDrawerOverlay');
      return {
        hasDay: Boolean(day),
        hasInlineClick: Boolean(day?.getAttribute('onclick')),
        cursor: day ? getComputedStyle(day).cursor : '',
        overlayActive: Boolean(overlay?.classList.contains('active'))
      };
    });

    assert.deepEqual(hubResult, {
      hasDay: true,
      hasInlineClick: false,
      cursor: 'default',
      overlayActive: false
    });

    const managerResult = await page.evaluate(() => {
      showLeaveSection('viewLeaveCalendar');
      const day = document.querySelector('#teamCalDaysGrid [data-day="11"]');
      day?.click();
      const overlay = document.getElementById('calDateDetailsDrawerOverlay');
      return {
        hasDay: Boolean(day),
        hasInlineClick: Boolean(day?.getAttribute('onclick')),
        cursor: day ? getComputedStyle(day).cursor : '',
        overlayActive: Boolean(overlay?.classList.contains('active'))
      };
    });

    assert.deepEqual(managerResult, {
      hasDay: true,
      hasInlineClick: false,
      cursor: 'default',
      overlayActive: false
    });

    console.log('PASS: Team leave calendars no longer open the duplicate date details sheet.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
