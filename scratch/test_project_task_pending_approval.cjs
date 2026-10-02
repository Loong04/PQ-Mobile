const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const pageUrl = theme => pathToFileURL(
  path.resolve(__dirname, '..', 'modules/project-task/options/pending-approval.html')
).href + '?theme=' + theme;

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const faults = [];
    page.on('pageerror', error => faults.push(error.message));

    for (const theme of ['dark', 'light']) {
      await page.setViewport({ width: 390, height: 950 });
      await page.goto(pageUrl(theme), { waitUntil: 'domcontentloaded' });

      assert.equal(await page.$eval('html', node => node.dataset.theme), theme);
      assert.equal(await page.$eval('.project-header h1', node => node.textContent.trim()), 'Pending Approval');
      assert.equal(await page.$eval('.project-approval-section-title', node => node.textContent.trim()), 'TIMESHEET');
      assert.equal(await page.$eval('#projectTimesheetApprovalCount', node => node.textContent.trim()), '3 Records');
      assert.equal(await page.$$eval('.project-approval-tab', tabs => tabs.length), 0);
      assert.equal(await page.$$eval('.project-approval-card:not([data-type="timesheet"])', cards => cards.length), 0);
      assert.deepEqual(
        await page.$$eval('.project-approval-card', cards => cards.map(card => ({
          reference: card.querySelector('.project-approval-reference').textContent.trim(),
          name: card.querySelector('.project-approval-employee-name').textContent.trim(),
          employeeId: card.querySelector('.project-approval-employee-name + .project-approval-employee-id').textContent.trim(),
          status: card.querySelector('.project-approval-status').textContent.trim(),
          date: card.querySelector('[data-field="date"] strong').textContent.trim(),
          normalHours: card.querySelector('[data-field="normal-hours"] strong').textContent.trim(),
          otHours: card.querySelector('[data-field="ot-hours"] strong').textContent.trim()
        }))),
        [
          { reference: 'ETS00000002819', name: 'Farhan binti rahmat', employeeId: '#EBB12', status: 'Pending', date: '30 Sep 2026', normalHours: '7.50 hrs', otHours: '1.00 hrs' },
          { reference: 'ETS00000002820', name: 'Aina Rahman', employeeId: '#EBB27', status: 'Pending', date: '29 Sep 2026', normalHours: '8.00 hrs', otHours: '0.00 hrs' },
          { reference: 'ETS00000002821', name: 'Daniel Lee', employeeId: '#EBB41', status: 'Pending', date: '28 Sep 2026', normalHours: '6.50 hrs', otHours: '2.00 hrs' }
        ]
      );

      const layout = await page.evaluate(() => {
        const card = document.querySelector('.project-approval-card');
        return {
          radius: getComputedStyle(card).borderRadius,
          leftBorder: getComputedStyle(card).borderLeftWidth,
          gridColumns: getComputedStyle(card.querySelector('.project-approval-metrics')).gridTemplateColumns.split(' ').length,
          backFile: new URL(document.querySelector('.project-back').href).pathname.split('/').slice(-2).join('/'),
          backScope: new URL(document.querySelector('.project-back').href).searchParams.get('scope'),
          overflow: document.querySelector('.phone-container').scrollWidth > document.querySelector('.phone-container').clientWidth + 1
        };
      });
      assert.equal(layout.radius, '18px');
      assert.equal(layout.leftBorder, '4px');
      assert.equal(layout.gridColumns, 3);
      assert.equal(layout.backFile, 'project-task/index.html');
      assert.equal(layout.backScope, 'team');
      assert.equal(layout.overflow, false);
    }

    assert.deepEqual(faults, []);
    console.log('PASS: Project & Task Pending Approval contains Timesheet requests only.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
