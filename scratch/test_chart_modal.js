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

  await page.goto(shiftPlanUrl, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (typeof switchMainTab === 'function') switchMainTab('summary');
    if (typeof openChartModal === 'function') openChartModal();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.resolve(__dirname, 'chart_modal_open_dark.png') });

  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.resolve(__dirname, 'chart_modal_open_light.png') });

  await browser.close();
  console.log('Done Chart Modal Screenshots!');
})();
