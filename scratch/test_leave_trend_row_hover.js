const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 450, height: 950 });
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  try {
    const url = 'file://' + path.resolve(__dirname, '../leave.html');
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => showLeaveSection('viewLeaveHighlightTrend'));

    const initial = await page.evaluate(() => {
      const rows = [...document.querySelectorAll('[data-leave-trend-bar]')];
      const findRow = month => rows.find(row => row.textContent.includes(month));
      const august = findRow('Aug 2026');
      const september = findRow('Sep 2026');
      const march = findRow('Mar 2026');
      return {
        count: rows.length,
        marchBackground: march ? getComputedStyle(march).backgroundColor : '',
        augustBackground: august ? getComputedStyle(august).backgroundColor : '',
        septemberBackground: september ? getComputedStyle(september).backgroundColor : '',
        septemberText: september ? september.textContent.replace(/\s+/g, ' ').trim() : ''
      };
    });

    const rows = await page.$$('[data-leave-trend-bar]');
    let marchHandle = null;
    for (const row of rows) {
      const text = await row.evaluate(element => element.textContent);
      if (text.includes('Mar 2026')) {
        marchHandle = row;
        break;
      }
    }
    if (marchHandle) await marchHandle.hover();
    await new Promise(resolve => setTimeout(resolve, 250));

    const hovered = await page.evaluate(() => {
      const march = [...document.querySelectorAll('[data-leave-trend-bar]')]
        .find(row => row.textContent.includes('Mar 2026'));
      return march ? getComputedStyle(march).backgroundColor : '';
    });

    await page.mouse.move(2, 2);
    await new Promise(resolve => setTimeout(resolve, 250));
    const reset = await page.evaluate(() => {
      const march = [...document.querySelectorAll('[data-leave-trend-bar]')]
        .find(row => row.textContent.includes('Mar 2026'));
      return march ? getComputedStyle(march).backgroundColor : '';
    });

    const result = { initial, hovered, reset, pageErrors };
    result.passed =
      initial.count === 12 &&
      initial.septemberText === 'Sep 2026 71.00' &&
      initial.septemberBackground === initial.augustBackground &&
      hovered !== initial.marchBackground &&
      hovered !== 'rgba(0, 0, 0, 0)' &&
      reset === initial.marchBackground &&
      pageErrors.length === 0;

    console.log(JSON.stringify(result, null, 2));
    if (!result.passed) process.exitCode = 1;
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
