const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 450, height: 950 });

  const fileUrl = 'file:///' + path.join(__dirname, '../modules/attendance/options/ot-plan.html').replace(/\\/g, '/');

  console.log('Navigating to:', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'load' });

  // 1. Test Dark Mode Calendar Tab
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (typeof switchMainTab === 'function') switchMainTab('calendar');
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(__dirname, 'ot_plan_dark_calendar.png') });
  console.log('Saved ot_plan_dark_calendar.png');

  // 2. Test Dark Mode Summary Tab
  await page.evaluate(() => {
    if (typeof switchMainTab === 'function') switchMainTab('summary');
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(__dirname, 'ot_plan_dark_summary.png') });
  console.log('Saved ot_plan_dark_summary.png');

  // 3. Test Dark Mode Chart Modal
  await page.evaluate(() => {
    if (typeof openChartModal === 'function') openChartModal();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(__dirname, 'ot_plan_dark_chart_modal.png') });
  console.log('Saved ot_plan_dark_chart_modal.png');

  // 4. Test Light Mode Summary Tab & Chart Modal
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(__dirname, 'ot_plan_light_chart_modal.png') });
  console.log('Saved ot_plan_light_chart_modal.png');

  await page.evaluate(() => {
    if (typeof closeModal === 'function') closeModal('chartModal');
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(__dirname, 'ot_plan_light_summary.png') });
  console.log('Saved ot_plan_light_summary.png');

  await browser.close();
  console.log('Verification completed!');
})();
