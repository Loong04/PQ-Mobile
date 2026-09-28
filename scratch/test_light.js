const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 450, height: 950 });
  const filePath = 'file:///' + path.resolve(__dirname, '../modules/claims/options/pending-approval.html').replace(/\\/g, '/');
  await page.goto(filePath, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  await new Promise(r => setTimeout(r, 400));

  // Advance tab light mode
  const pills = await page.$$('.filter-pill');
  for (const p of pills) {
    const txt = await page.evaluate(el => el.textContent.trim(), p);
    if (txt === 'Advance') { await p.click(); break; }
  }
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(__dirname, 'pending_advance_light.png') });

  // Open details
  const firstThreeDots = await page.$('#teamApprovalsQueue .three-dots-btn');
  if (firstThreeDots) {
    await firstThreeDots.click();
    await new Promise(r => setTimeout(r, 400));
    const viewDetails = await page.$('button[onclick*="triggerClaimViewDetails"]');
    if (viewDetails) {
      await viewDetails.click();
      await new Promise(r => setTimeout(r, 500));
      await page.screenshot({ path: path.join(__dirname, 'pending_advance_details_light.png') });
    }
  }

  await browser.close();
  console.log('Light mode verification done');
})();
