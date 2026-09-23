const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 430, height: 950 });

    const filePath = 'file:///' + path.resolve('modules/attendance/options/shift-plan.html').replace(/\\/g, '/');
    await page.goto(filePath, { waitUntil: 'networkidle0' });

    // 1. Screenshot Main Screen (Change Shift mode)
    await page.screenshot({ path: path.resolve('scratch/shift_plan_main.png') });
    console.log('Saved shift_plan_main.png');

    // 2. Open Review Changes Modal
    await page.click('#bottomMainActionBtn');
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.resolve('scratch/shift_plan_review_modal.png') });
    console.log('Saved shift_plan_review_modal.png');

    // Close Review Modal
    await page.click('#reviewChangesModal .sheet-close-btn');
    await new Promise(r => setTimeout(r, 300));

    // 3. Switch to Copy to Dates mode
    await page.click('#modeCopyDatesBtn');
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: path.resolve('scratch/shift_plan_copy_mode.png') });
    console.log('Saved shift_plan_copy_mode.png');

    // 4. Open Choose Dates Modal
    await page.click('#bottomMainActionBtn');
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.resolve('scratch/shift_plan_choose_dates_modal.png') });
    console.log('Saved shift_plan_choose_dates_modal.png');

    await browser.close();
  } catch (err) {
    console.error('Error running puppeteer verification:', err);
    process.exit(1);
  }
})();
