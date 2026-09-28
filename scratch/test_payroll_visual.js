const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 450, height: 950 });

  // Handle dialogs/alerts automatically
  page.on('dialog', async dialog => {
    await dialog.dismiss();
  });

  // Track console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('[BROWSER ERROR]:', msg.text());
    }
  });

  console.log('--- 1. Testing Payroll Index (Individual Scope) ---');
  const indexPath = 'file:///' + path.resolve(__dirname, '../modules/payroll/index.html').replace(/\\/g, '/');
  await page.goto(indexPath, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(__dirname, 'payroll_individual.png') });
  console.log('Saved payroll_individual.png');

  // Verify Individual options count
  const indivOptionsCount = await page.$$eval('#individualPayrollOptionsGrid .payroll-option-card', els => els.length);
  console.log('Individual options count:', indivOptionsCount); // Should be 2 (Payslip, EA Form)

  console.log('--- 2. Testing Payroll Index (Team Scope) ---');
  // Click Team tab
  await page.click('#tabPayrollTeam');
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(__dirname, 'payroll_team.png') });
  console.log('Saved payroll_team.png');

  // Verify Team options count
  const teamOptionsCount = await page.$$eval('#teamPayrollOptionsGrid .payroll-option-card', els => els.length);
  console.log('Team options count:', teamOptionsCount); // Should be 1 (Tax Relief only)

  // Test opening Proof Receipt modal on first team card
  const firstProofBtn = await page.$('.team-relief-card .relief-menu-btn');
  if (firstProofBtn) {
    console.log('Clicking proof receipt button...');
    await firstProofBtn.click();
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(__dirname, 'payroll_team_proof_modal.png') });
    console.log('Saved payroll_team_proof_modal.png');
    // Close modal
    await page.click('#reliefReceiptModalOverlay .sheet-close-btn');
    await new Promise(r => setTimeout(r, 400));
  }

  console.log('--- 3. Testing Payslip Page ---');
  const payslipPath = 'file:///' + path.resolve(__dirname, '../modules/payroll/options/payslip.html').replace(/\\/g, '/');
  await page.goto(payslipPath, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(__dirname, 'payroll_payslip.png') });
  console.log('Saved payroll_payslip.png');

  console.log('--- 4. Testing EA Form Page ---');
  const eaPath = 'file:///' + path.resolve(__dirname, '../modules/payroll/options/ea-form.html').replace(/\\/g, '/');
  await page.goto(eaPath, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(__dirname, 'payroll_ea_form.png') });
  console.log('Saved payroll_ea_form.png');

  console.log('--- 5. Testing Team Tax Relief Page ---');
  const taxReliefPath = 'file:///' + path.resolve(__dirname, '../modules/payroll/options/tax-relief.html').replace(/\\/g, '/');
  await page.goto(taxReliefPath, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(__dirname, 'payroll_tax_relief.png') });
  console.log('Saved payroll_tax_relief.png');

  console.log('--- 6. Testing Light Mode (Payroll Index & EA) ---');
  await page.goto(indexPath, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(__dirname, 'payroll_index_light.png') });
  console.log('Saved payroll_index_light.png');

  await page.goto(eaPath, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(__dirname, 'payroll_ea_light.png') });
  console.log('Saved payroll_ea_light.png');

  await browser.close();
  console.log('All tests completed successfully!');
}

run().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
