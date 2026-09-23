const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 430, height: 1100 });

    const filePath = 'file:///' + path.resolve('modules/claims/options/travel-claim.html').replace(/\\/g, '/');
    await page.goto(filePath, { waitUntil: 'networkidle0' });

    // Switch to step 4 (Expense)
    await page.evaluate(() => {
      switchTravelStep(4);
    });
    await new Promise(r => setTimeout(r, 400));

    // Capture Step 4 screenshot
    const screenshotPath = path.resolve('scratch/travel_claim_expense_step4.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Saved travel_claim_expense_step4.png to', screenshotPath);

    await browser.close();
  } catch (err) {
    console.error('Error verifying travel claim:', err);
    process.exit(1);
  }
})();
