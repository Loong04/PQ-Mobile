const puppeteer = require('puppeteer');
const path = require('path');

async function testActions() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 450, height: 950 });

  const filePath = 'file:///' + path.resolve(__dirname, '../modules/claims/options/pending-approval.html').replace(/\\/g, '/');
  await page.goto(filePath, { waitUntil: 'networkidle0' });

  await page.waitForSelector('#teamApprovalsQueue pending-approval-card', { timeout: 5000 });

  const initialCount = await page.$eval('#teamPendingCountBadge', el => el.textContent.trim());
  console.log('Initial count:', initialCount);

  // Open Benefit Claim
  await page.evaluate(() => {
    window.ClaimsEngine.triggerClaimViewDetails(1);
  });
  await new Promise(r => setTimeout(r, 400));

  // Click Approve button in detail screen
  await page.evaluate(() => {
    window.ClaimsEngine.actionTeamClaimFromModal(1, 'approve');
  });
  await new Promise(r => setTimeout(r, 400));

  const afterApproveCount = await page.$eval('#teamPendingCountBadge', el => el.textContent.trim());
  console.log('After approve count:', afterApproveCount);

  if (parseInt(afterApproveCount) !== parseInt(initialCount) - 1) {
    throw new Error('Count did not decrement after approval!');
  }

  console.log('Action test passed successfully!');
  await browser.close();
}

testActions().catch(err => {
  console.error(err);
  process.exit(1);
});
