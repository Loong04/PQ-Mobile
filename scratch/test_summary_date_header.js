const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 900 });
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  const url = 'file:///' + path.resolve(__dirname, '../modules/claims/options/summary.html').replace(/\\/g, '/');
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.evaluate(() => openDetailsModal('PHARMACY'));

  const result = await page.$eval('.summary-record-date', row => {
    const value = row.querySelector('dd');
    const rowBox = row.getBoundingClientRect();
    const valueBox = value.getBoundingClientRect();
    return {
      hasClaimDateLabel: [...row.querySelectorAll('dt')].some(item => item.textContent.trim() === 'Claim Date'),
      dateText: value.textContent.trim(),
      leftOffset: Math.round(valueBox.left - rowBox.left)
    };
  });

  const passed = !result.hasClaimDateLabel && /^\d{2}\/\d{2}\/\d{4}/.test(result.dateText) && result.leftOffset <= 16 && pageErrors.length === 0;
  console.log(JSON.stringify({ result, pageErrors, passed }, null, 2));
  await browser.close();
  if (!passed) process.exit(1);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
