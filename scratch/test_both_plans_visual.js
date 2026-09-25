const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 450, height: 950 });

  // 1. Test Shift Planning
  const shiftUrl = 'file:///' + path.join(__dirname, '../modules/attendance/options/shift-plan.html').replace(/\\/g, '/');
  await page.goto(shiftUrl, { waitUntil: 'load' });

  // Summary Tab with Inline Donut Chart
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    if (typeof switchMainTab === 'function') switchMainTab('summary');
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(__dirname, 'shift_plan_summary.png') });
  console.log('Saved shift_plan_summary.png');

  // Filter Modal with 6 requested fields
  await page.evaluate(() => {
    if (typeof openFilterModal === 'function') openFilterModal();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(__dirname, 'shift_plan_filter_modal.png') });
  console.log('Saved shift_plan_filter_modal.png');

  // 2. Test OT Planning
  const otUrl = 'file:///' + path.join(__dirname, '../modules/attendance/options/ot-plan.html').replace(/\\/g, '/');
  await page.goto(otUrl, { waitUntil: 'load' });

  // Summary Tab with Inline Donut Chart
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    if (typeof switchMainTab === 'function') switchMainTab('summary');
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(__dirname, 'ot_plan_summary.png') });
  console.log('Saved ot_plan_summary.png');

  // Filter Modal
  await page.evaluate(() => {
    if (typeof openFilterModal === 'function') openFilterModal();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(__dirname, 'ot_plan_filter_modal.png') });
  console.log('Saved ot_plan_filter_modal.png');

  await browser.close();
  console.log('All visual tests finished successfully!');
})();
