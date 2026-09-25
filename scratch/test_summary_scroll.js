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
    document.documentElement.setAttribute('data-theme', 'light');
    if (typeof switchMainTab === 'function') switchMainTab('summary');
  });
  await new Promise(r => setTimeout(r, 500));

  // Scroll main-content down slightly to see chart and table
  await page.evaluate(() => {
    const el = document.querySelector('.main-content');
    if (el) el.scrollTop = 320;
  });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.resolve(__dirname, 'summary_tab_scrolled.png') });

  await browser.close();
  console.log('Done Scrolled Screenshot!');
})();
