const puppeteer = require('puppeteer');
const path = require('path');

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

    const pageUrl = `file:///${path.resolve(__dirname, '../modules/claims/options/pending-approval.html').replace(/\\/g, '/')}`;
    await page.goto(pageUrl, { waitUntil: 'networkidle0' });
    await page.waitForSelector('#teamApprovalsQueue pending-approval-card');

    const tabResults = {};
    const tabs = ['All', 'Benefit', 'Medical', 'OT', 'Travel Mileage', 'Travel Request', 'Entertainment', 'Advance', 'Expense'];

    for (const tabName of tabs) {
      await page.evaluate((name) => {
        const tab = [...document.querySelectorAll('.filter-pill')]
          .find(button => button.textContent.trim() === name);
        if (!tab) throw new Error(`Missing pending approval tab: ${name}`);
        tab.click();
      }, tabName);

      await page.waitForFunction((name) => {
        const activeTab = document.querySelector('.filter-pill.active');
        return activeTab && activeTab.textContent.trim() === name;
      }, {}, tabName);

      tabResults[tabName] = await page.evaluate(() => {
        const cards = [...document.querySelectorAll('#teamApprovalsQueue pending-approval-card')];
        return {
          cardCount: cards.length,
          visibleReceiptRows: cards.filter(card => /Receipt\s*:/i.test(card.innerText)).length,
          cardsWithReceiptData: cards.filter(card => Boolean(card.getAttribute('receipt'))).length
        };
      });
    }


    const allTabsHaveCards = Object.values(tabResults).every(result => result.cardCount > 0);
    const noCardsShowReceipt = Object.values(tabResults).every(result => result.visibleReceiptRows === 0);
    const receiptDataIsStillAvailable = tabResults.All.cardsWithReceiptData > 0;
    const passed = allTabsHaveCards && noCardsShowReceipt && receiptDataIsStillAvailable && pageErrors.length === 0;

    console.log(JSON.stringify({ tabResults, receiptDataIsStillAvailable, pageErrors, passed }, null, 2));
    if (!passed) process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
