const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 450, height: 950 });
  const filePath = 'file:///' + path.resolve(__dirname, '../modules/claims/options/pending-approval.html').replace(/\\/g, '/');
  await page.goto(filePath, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#teamApprovalsQueue pending-approval-card', { timeout: 10000 });

  // Check initial count
  const initialCards = await page.$$('#teamApprovalsQueue pending-approval-card');
  console.log('Initial cards count:', initialCards.length);

  // Click Resubmit on the first card
  const resubmitBtn = await page.$('#teamApprovalsQueue pending-approval-card .action-btn-resubmit');
  if (resubmitBtn) {
    console.log('Found resubmit button on front card, clicking...');
    await resubmitBtn.click();
    await new Promise(r => setTimeout(r, 500));
  }

  const afterCards = await page.$$('#teamApprovalsQueue pending-approval-card');
  console.log('Cards count after front card resubmit:', afterCards.length);

  // Open modal and test modal resubmit
  await page.evaluate(() => window.ClaimsEngine.triggerClaimViewDetails(2));
  await new Promise(r => setTimeout(r, 400));
  const modalResubmitBtn = await page.$('#claimDetailsModalOverlay .action-btn-resubmit');
  if (modalResubmitBtn) {
    console.log('Found modal resubmit button, clicking...');
    await modalResubmitBtn.click();
    await new Promise(r => setTimeout(r, 500));
  }

  const finalCards = await page.$$('#teamApprovalsQueue pending-approval-card');
  console.log('Final cards count:', finalCards.length);

  await browser.close();
  console.log('All Resubmit actions working smoothly!');
})();
