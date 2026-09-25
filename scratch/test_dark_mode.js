const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 450, height: 950 });

  const shiftPlanUrl = 'file://' + path.resolve(__dirname, '../modules/attendance/options/shift-plan.html');
  const otPlanUrl = 'file://' + path.resolve(__dirname, '../modules/attendance/options/ot-plan.html');

  // Test Shift Plan Dark Mode
  console.log('Testing Shift Plan Dark Mode...');
  await page.goto(shiftPlanUrl, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    // Switch to Calendar tab
    if (typeof switchMainTab === 'function') switchMainTab('calendar');
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.resolve(__dirname, 'shift_plan_calendar_dark.png') });

  // Test OT Plan Dark Mode
  console.log('Testing OT Plan Dark Mode...');
  await page.goto(otPlanUrl, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (typeof switchMainTab === 'function') switchMainTab('calendar');
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.resolve(__dirname, 'ot_plan_calendar_dark.png') });

  await browser.close();
  console.log('Done!');
})();
