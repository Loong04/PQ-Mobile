const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const fileUrl = (file, theme) => pathToFileURL(path.join(root, file)).href + '?theme=' + theme;

async function expandedColors(page, selector) {
  return page.$eval(selector, element => ({
    detail: getComputedStyle(element).backgroundColor,
    card: getComputedStyle(element.parentElement).backgroundColor
  }));
}

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    for (const theme of ['light', 'dark']) {
      await page.goto(fileUrl('modules/project-task/options/time-sheet.html', theme), { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => {
        localStorage.setItem('pq_project_timesheet_draft', JSON.stringify({
          date: '2026-10-02',
          remark: 'Theme check',
          activities: [{
            title: 'Theme check',
            description: '',
            adhoc: false,
            project: '',
            task: '',
            overtime: false,
            timeFrom: '09:00',
            timeTo: '09:30',
            completion: 0
          }]
        }));
      });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.click('.project-activity-details-toggle');
      const timesheet = await expandedColors(page, '.project-activity-details');
      assert.equal(timesheet.detail, timesheet.card, theme + ' timesheet details must follow the card theme');
      if (theme === 'light') assert.equal(timesheet.detail, 'rgb(255, 255, 255)');

      await page.goto(fileUrl('modules/claims/options/ot-claim.html', theme), { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => toggleItemCard(0));
      const overtime = await expandedColors(page, '#ot-item-body-0');
      assert.equal(overtime.detail, overtime.card, theme + ' OT details must follow the card theme');
      if (theme === 'light') assert.equal(overtime.detail, 'rgb(255, 255, 255)');
    }
    console.log('PASS: Timesheet and OT expanded details follow the active card theme.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
