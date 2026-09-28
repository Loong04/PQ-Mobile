const puppeteer = require('puppeteer');
const path = require('path');

async function test() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 450, height: 950 });

  page.on('console', msg => console.log('[BROWSER LOG]:', msg.text()));

  const appPath = 'file:///' + path.resolve(__dirname, '../appdark.html').replace(/\\/g, '/');
  console.log('Navigating to app page:', appPath);
  await page.goto(appPath, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({ path: path.join(__dirname, 'appdark_with_payroll.png') });
  console.log('Saved appdark_with_payroll.png');

  // Verify the text is Payroll
  const cardText = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.shortcut-card'));
    const payrollCard = cards.find(c => c.textContent.includes('Payroll'));
    return payrollCard ? payrollCard.querySelector('h4').textContent : null;
  });
  console.log('Payroll shortcut card title:', cardText);

  // Click the Payroll shortcut card
  console.log('Clicking Payroll shortcut card...');
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.shortcut-card'));
    const payrollCard = cards.find(c => c.textContent.includes('Payroll'));
    if (payrollCard) payrollCard.click();
  });

  await new Promise(r => setTimeout(r, 800));

  const currentUrl = page.url();
  console.log('Current URL after click:', currentUrl);

  const isPayrollDashboard = currentUrl.includes('modules/payroll/index.html');
  console.log('Reached Payroll Dashboard:', isPayrollDashboard);

  await page.screenshot({ path: path.join(__dirname, 'destination_after_payroll_click.png') });
  console.log('Saved destination_after_payroll_click.png');

  await browser.close();
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
