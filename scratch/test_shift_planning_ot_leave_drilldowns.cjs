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
    await page.$$eval('#gridCalDays .grid-cal-cell', cells => {
      cells.find(cell => cell.querySelector('.grid-cal-date')?.textContent.trim() === '3').click();
    });

    await page.$eval('[onclick*="view-ot-plan-summary"]', node => node.click());
    assert.match(await page.$eval('#view-ot-plan-summary .summary-date-display', node => node.textContent.replace(/\s+/g, ' ').trim()), /^Date: 03 Sep.* 2026$/);
    assert.equal(await page.$eval('#otSummaryRecordCount', node => node.textContent.trim()), 'Total Records: 2');
    assert.equal(await page.$$eval('#view-ot-plan-summary .calendar-purple-card', cards => cards.length), 2);
    assert.deepEqual(
      await page.$$eval('#view-ot-plan-summary .calendar-purple-card', cards => cards.map(card => ({
        title: card.querySelector('.calendar-purple-card-title').textContent.trim(),
        values: [...card.querySelectorAll('.summary-value')].map(node => node.textContent.trim())
      }))),
      [
        { title: '8.30:17.30W', values: ['OT 1.5 BEFORE WORK', '26', '26.00'] },
        { title: '8.30:17.30W', values: ['1.5 OT', '55', '94.00'] }
      ]
    );
    assert.equal(await page.$('#view-ot-plan-summary .calendar-purple-card .fa-chevron-right'), null);

    await page.click('#view-ot-plan-summary .calendar-purple-card');
    assert.equal(await page.$eval('#otDetailOtType', node => node.textContent.trim()), 'OT 1.5 BEFORE WORK');
    assert.equal(await page.$eval('#otDetailHeadcount', node => node.textContent.trim()), '26');
    assert.equal(await page.$eval('#otDetailTotalHours', node => node.textContent.trim()), '26.00');
    assert.equal(await page.$$eval('#otEmployeeCardsContainer .employee-purple-card', cards => cards.length), 26);
    assert.equal(await page.$eval('#otEmployeeCardsContainer .employee-purple-card:first-child .employee-card-name', node => node.textContent.trim()), 'Raju Kumar');
    assert.equal(await page.$eval('#otEmployeeCardsContainer .employee-purple-card:first-child .employee-card-name + .employee-card-id', node => node.textContent.trim()), '#000016');
    assert.deepEqual(
      await page.$$eval('#otEmployeeCardsContainer .employee-purple-card:first-child .summary-value', nodes => nodes.map(node => node.textContent.trim())),
      ['ACCOUNT EXECUTIVE', '1.00']
    );
    assert.equal(await page.$('#otEmployeeCardsContainer .employee-purple-card .fa-chevron-right'), null);

    await page.evaluate(() => switchView('view-leave-summary'));
    assert.match(await page.$eval('#view-leave-summary .summary-date-display', node => node.textContent.replace(/\s+/g, ' ').trim()), /^Date: 03 Sep.* 2026$/);
    assert.equal(await page.$eval('#lvSummaryRecordCount', node => node.textContent.trim()), 'Total Records: 3');
    assert.equal(await page.$$eval('#view-leave-summary .calendar-purple-card', cards => cards.length), 3);
    assert.deepEqual(
      await page.$$eval('#view-leave-summary .calendar-purple-card', cards => cards.map(card => ({
        title: card.querySelector('.calendar-purple-card-title').textContent.trim(),
        values: [...card.querySelectorAll('.summary-value')].map(node => node.textContent.trim())
      }))),
      [
        { title: '8.30:17.30W', values: ['ANNUAL LEAVE', '2.00'] },
        { title: '8.30:17.30W', values: ['MEDICAL LEAVE', '3.00'] },
        { title: '8.30:17.30W', values: ['UNPAID LEAVE', '1.00'] }
      ]
    );
    assert.equal(await page.$('#view-leave-summary .calendar-purple-card .fa-chevron-right'), null);

    await page.click('#view-leave-summary .calendar-purple-card:nth-child(2)');
    assert.equal(await page.$eval('#lvDetailHeadcount', node => node.textContent.trim()), '3');
    assert.equal(await page.$$eval('#lvEmployeeCardsContainer .employee-purple-card', cards => cards.length), 3);
    assert.equal(await page.$eval('#lvEmployeeCardsContainer .employee-purple-card:first-child .employee-card-name', node => node.textContent.trim()), 'Ww');
    assert.equal(await page.$eval('#lvEmployeeCardsContainer .employee-purple-card:first-child .employee-card-name + .employee-card-id', node => node.textContent.trim()), '#000073');
    assert.deepEqual(
      await page.$$eval('#lvEmployeeCardsContainer .employee-purple-card:first-child .summary-value', nodes => nodes.map(node => node.textContent.trim())),
      ['BFT & COM.EXECUTIVE', 'MEDICAL LEAVE', '1.00']
    );
    assert.equal(await page.$('#lvEmployeeCardsContainer .employee-purple-card .fa-chevron-right'), null);

    assert.deepEqual(errors, []);
    console.log('PASS: OT Plan and Leave drill-downs use consistent purple cards and supplied data.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
