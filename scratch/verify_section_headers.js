const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 430, height: 950 });

    // 1. Verify medical-claim.html
    const medPath = 'file:///' + path.resolve('modules/claims/options/medical-claim.html').replace(/\\/g, '/');
    await page.goto(medPath, { waitUntil: 'networkidle0' });
    
    await page.evaluate(() => {
      openMedicalClaimForm('MEDICAL CLAIM');
      switchMedicalStep(3);
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.resolve('scratch/medical_claim_new_header.png') });
    console.log('Saved medical_claim_new_header.png');

    await browser.close();
  } catch (err) {
    console.error('Error verifying section headers:', err);
    process.exit(1);
  }
})();
