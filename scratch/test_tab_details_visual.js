const puppeteer = require('puppeteer');
const path = require('path');

async function testDetails() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 450, height: 950 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));

  const filePath = 'file:///' + path.resolve(__dirname, '../modules/claims/options/pending-approval.html').replace(/\\/g, '/');
  console.log('Navigating to:', filePath);
  await page.goto(filePath, { waitUntil: 'networkidle0' });

  await page.waitForSelector('#teamApprovalsQueue pending-approval-card', { timeout: 5000 });
  console.log('Cards rendered successfully.');

  async function openDetails(itemId) {
    await page.evaluate((id) => {
      window.ClaimsEngine.triggerClaimViewDetails(id);
    }, itemId);
    await new Promise(r => setTimeout(r, 400));
  }

  async function closeDetails() {
    await page.evaluate(() => {
      window.ClaimsEngine.closeClaimDetailsModal();
    });
    await new Promise(r => setTimeout(r, 400));
  }

  async function scrollDetailsToBottom() {
    await page.evaluate(() => {
      const body = document.getElementById('claimDetailsDynamicBody');
      if (body) body.scrollTop = body.scrollHeight;
    });
    await new Promise(r => setTimeout(r, 200));
  }

  // --- Dark Mode Screenshots ---
  console.log('Capturing Dark Mode front cards...');
  await page.screenshot({ path: path.join(__dirname, 'test_front_cards_dark.png') });

  console.log('Capturing Dark Mode details...');
  await openDetails(1);
  await page.screenshot({ path: path.join(__dirname, 'test_benefit_details_dark.png') });
  await scrollDetailsToBottom();
  await page.screenshot({ path: path.join(__dirname, 'test_benefit_details_bottom_dark.png') });
  await closeDetails();

  // --- Switch to Light Mode (matching User screenshots!) ---
  console.log('Switching to Light Mode...');
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    if (typeof setTheme === 'function') setTheme('light');
  });
  await new Promise(r => setTimeout(r, 400));

  console.log('Capturing Light Mode front cards...');
  await page.screenshot({ path: path.join(__dirname, 'test_front_cards_light.png') });

  // 1. Benefit Claim Details in Light Mode (Matching fddsfdfdf.jpeg)
  console.log('Testing Benefit Claim Details (Light)...');
  await openDetails(1);
  await page.screenshot({ path: path.join(__dirname, 'test_benefit_details_light.png') });
  await scrollDetailsToBottom();
  await page.screenshot({ path: path.join(__dirname, 'test_benefit_details_bottom_light.png') });
  console.log('Saved test_benefit_details_bottom_light.png');
  await closeDetails();

  // 2. Medical Claim Details in Light Mode (Matching fesdfdsf.jpeg, fjeldf.jpeg, WhatsApp...31.jpeg)
  console.log('Testing Medical Claim Details (General - Light)...');
  await openDetails(2);
  await page.screenshot({ path: path.join(__dirname, 'test_medical_general_light.png') });
  console.log('Saved test_medical_general_light.png');

  console.log('Testing Medical Claim Details (Medical tab - Light)...');
  await page.evaluate(() => window.ClaimsEngine.switchMedSubTab('medical'));
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(__dirname, 'test_medical_tab_light.png') });
  console.log('Saved test_medical_tab_light.png');

  console.log('Testing Medical Claim Details (Details tab - Light)...');
  await page.evaluate(() => window.ClaimsEngine.switchMedSubTab('details'));
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(__dirname, 'test_medical_details_light.png') });
  console.log('Saved test_medical_details_light.png');
  await closeDetails();

  // 3. OT Claim Details in Light Mode (Matching WhatsApp...30.jpeg)
  console.log('Testing OT Claim Details (Light)...');
  await openDetails(3);
  await page.screenshot({ path: path.join(__dirname, 'test_ot_details_light.png') });
  console.log('Saved test_ot_details_light.png');
  await closeDetails();

  await browser.close();
  console.log('All tests completed successfully!');
}

testDetails().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
