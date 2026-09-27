const puppeteer = require('puppeteer');
const path = require('path');
const url = require('url');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  
  await page.setRequestInterception(true);
  page.on('request', req => {
    const reqUrl = req.url();
    if (reqUrl.includes('fontawesome') || reqUrl.includes('fonts.googleapis') || reqUrl.includes('fonts.gstatic')) {
      req.abort();
    } else {
      req.continue();
    }
  });

  const fileUrl = url.pathToFileURL(path.resolve(__dirname, '../leave.html')).href;
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  
  // Navigate to Staff Entitlement section
  await page.evaluate(() => {
    if (typeof showLeaveSection === 'function') {
      showLeaveSection('viewStaffEntitlement');
    }
  });

  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500)));

  // Capture Dark Theme Screenshot
  await page.screenshot({ path: path.resolve(__dirname, 'staff_entitlement_dark.png') });
  console.log('Saved staff_entitlement_dark.png');

  // Toggle Light Theme (data-theme="light")
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
  });

  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 300)));
  await page.screenshot({ path: path.resolve(__dirname, 'staff_entitlement_light.png') });
  console.log('Saved staff_entitlement_light.png');

  await browser.close();
})();
