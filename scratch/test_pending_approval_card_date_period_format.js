const puppeteer = require('puppeteer');
const path = require('path');
const assert = require('node:assert/strict');

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.setViewport({ width: 450, height: 950 });

    const url = `file:///${path.resolve(__dirname, '../modules/claims/options/pending-approval.html').replace(/\\/g, '/')}`;
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.waitForSelector('#teamApprovalsQueue pending-approval-card');

    const cards = await page.evaluate(() => {
      return [...document.querySelectorAll('#teamApprovalsQueue pending-approval-card')].map(card => ({
        id: card.getAttribute('item-id'),
        claimType: card.getAttribute('claim-type'),
        claimDate: card.getAttribute('claim-date'),
        period: card.getAttribute('period'),
        text: card.innerText
      }));
    });

    const byId = Object.fromEntries(cards.map(card => [card.id, card]));
    const expectedSingleDates = {
      '7': '16/09/2025',
      '8': '26/04/2024',
      '10': '01/11/2022'
    };

    for (const [id, expectedDate] of Object.entries(expectedSingleDates)) {
      assert.ok(byId[id], `Missing pending approval card ${id}`);
      assert.equal(byId[id].claimDate, expectedDate, `${byId[id].claimType} must show one Claim Date`);
      assert.match(byId[id].text, new RegExp(expectedDate.replaceAll('/', '\\/')));
      assert.doesNotMatch(byId[id].text, /Claim Date\s*\n?\s*[^\n]*\s[-–]\s[^\n]*/i);
    }

    const cardsWithPeriod = cards.filter(card => card.period);
    assert.ok(cardsWithPeriod.length > 0, 'Expected pending approval cards with a period');
    cardsWithPeriod.forEach(card => {
      assert.match(card.period, /^\d{6}$/, `${card.claimType} period must use YYYYMM`);
      assert.match(card.text, new RegExp(`Period:?\\s*${card.period}`), `${card.claimType} must render its normalized period`);
    });

    assert.deepEqual(pageErrors, []);
    console.log(JSON.stringify({
      checkedSingleDates: Object.fromEntries(Object.keys(expectedSingleDates).map(id => [id, byId[id].claimDate])),
      periods: cardsWithPeriod.map(card => ({ id: card.id, claimType: card.claimType, period: card.period })),
      pageErrors,
      passed: true
    }, null, 2));
  } finally {
    await browser.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
