const puppeteer = require('puppeteer');
const path = require('path');

async function testScroll() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 450, height: 950 });

  const filePath = 'file:///' + path.resolve(__dirname, '../modules/claims/options/pending-approval.html').replace(/\\/g, '/');
  await page.goto(filePath, { waitUntil: 'networkidle0' });

  await page.waitForSelector('#teamApprovalsQueue pending-approval-card', { timeout: 5000 });

  // Switch to light mode
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    if (typeof setTheme === 'function') setTheme('light');
  });
  await new Promise(r => setTimeout(r, 300));

  // Open Benefit Claim
  await page.evaluate(() => {
    window.ClaimsEngine.triggerClaimViewDetails(1);
  });
  await new Promise(r => setTimeout(r, 400));

  // Scroll down in #claimDetailsDynamicBody
  await page.evaluate(() => {
    const el = document.getElementById('claimDetailsDynamicBody');
    if (el) el.scrollTop = el.scrollHeight;
  });
  await new Promise(r => setTimeout(r, 300));

  await page.screenshot({ path: path.join(__dirname, 'test_benefit_details_bottom.png') });
  console.log('Saved test_benefit_details_bottom.png');

  // Test OT Claim bottom
  await page.evaluate(() => {
    window.ClaimsEngine.triggerClaimViewDetails(3);
  });
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => {
    const el = document.getElementById('claimDetailsDynamicBody');
    if (el) el.scrollTop = el.scrollHeight;
  });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(__dirname, 'test_ot_details_bottom.png') });
  console.log('Saved test_ot_details_bottom.png');

  await browser.close();
}

testScroll().catch(console.error);
