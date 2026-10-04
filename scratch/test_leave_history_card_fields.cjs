const assert = require('assert').strict;
const path = require('path');
const puppeteer = require('puppeteer');

const pageUrl = `file:///${path.resolve(__dirname, '../leave.html').replace(/\\/g, '/')}`;

async function firstCardSnapshot(page) {
  return page.$eval('#myHistoryCardsList .history-item-card', card => {
    const detailBox = card.querySelector('.card-details-box');
    const employeeName = card.querySelector('.history-employee-name');
    const employeeId = card.querySelector('.history-employee-id');
    return {
      cardText: card.textContent.replace(/\s+/g, ' ').trim(),
      detailsText: detailBox?.textContent.replace(/\s+/g, ' ').trim() || '',
      hasStatusBadge: Boolean(card.querySelector('.card-status-badge')),
      employeeName: employeeName?.textContent.trim() || '',
      employeeId: employeeId?.textContent.trim() || '',
      employeeIdDirectlyBelowName: Boolean(
        employeeName
        && employeeId
        && employeeName.nextElementSibling === employeeId
      )
    };
  });
}

async function run() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(pageUrl, { waitUntil: 'networkidle0' });
    await page.evaluate(() => showLeaveSection('viewMyLeaveHistory'));

    await page.evaluate(() => switchHistoryTab('leave'));
    const leave = await firstCardSnapshot(page);
    assert.equal(leave.hasStatusBadge, true, 'Leave cards must retain the current status badge design');
    assert.match(leave.detailsText, /Dates/);
    assert.match(leave.detailsText, /Days \/ Hours/);
    assert.doesNotMatch(leave.detailsText, /Submitted|Approver|Duration/);

    await page.evaluate(() => switchHistoryTab('credit'));
    const credit = await firstCardSnapshot(page);
    assert.equal(credit.hasStatusBadge, true, 'Leave Credit cards must retain the current status badge design');
    assert.match(credit.cardText, /Replacement Leave/i);
    assert.match(credit.detailsText, /Effective Date/);
    assert.match(credit.detailsText, /Expiry Date/);
    assert.match(credit.detailsText, /Days \/ Hours/);
    assert.doesNotMatch(credit.detailsText, /Credit Year|Amount|Reason/);

    await page.evaluate(() => switchHistoryTab('offtime'));
    const timeOff = await firstCardSnapshot(page);
    assert.equal(timeOff.hasStatusBadge, true, 'Time Off cards must retain the current status badge design');
    assert.equal(timeOff.employeeName, '');
    assert.equal(timeOff.employeeId, '');
    assert.doesNotMatch(timeOff.cardText, /Farhan binti rahmat|#EBB12/);
    assert.match(timeOff.cardText, /Ref: OT-2026-0008/);
    assert.doesNotMatch(timeOff.cardText, /Late Start|Early Leave|Outstation/);
    assert.match(timeOff.detailsText, /Event Date/);
    assert.match(timeOff.detailsText, /Reason/);
    assert.doesNotMatch(timeOff.detailsText, /Start & End Time/);

    assert.deepEqual(errors, []);
    console.log('PASS: Leave history cards show the required fields while retaining the existing card design.');
  } finally {
    await browser.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
