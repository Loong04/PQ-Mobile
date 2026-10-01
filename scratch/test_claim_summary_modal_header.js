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
    const url = 'file://' + path.resolve(__dirname, '../modules/claims/options/summary.html');
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => openDetailsModal('PHARMACY'));

    const result = await page.evaluate(() => {
      const modal = document.getElementById('summaryDetailsModalOverlay');
      const top = modal.querySelector('.summary-details-top');
      const firstRecord = modal.querySelector('.claim-summary-record');
      return {
        modalOpen: modal.classList.contains('active') && modal.getAttribute('aria-hidden') === 'false',
        title: document.getElementById('modalCategoryTitle')?.textContent.trim() || '',
        topBackground: getComputedStyle(top).backgroundImage,
        hasMetricsBlock: Boolean(top.querySelector('.summary-details-metrics')),
        topText: top.textContent.replace(/\s+/g, ' ').trim(),
        recordsCount: document.getElementById('modalRecordsCount')?.textContent.trim() || '',
        firstRecordText: firstRecord?.textContent.replace(/\s+/g, ' ').trim() || ''
      };
    });

    result.pageErrors = pageErrors;
    result.passed =
      result.modalOpen &&
      result.title === 'PHARMACY' &&
      result.topBackground.includes('gradient') &&
      !result.hasMetricsBlock &&
      result.topText === 'PHARMACY' &&
      result.recordsCount === '3 records' &&
      result.firstRecordText.includes('01/05/2026 - 09/05/2026') &&
      result.firstRecordText.includes('Period202605') &&
      result.firstRecordText.includes('ExpensePHARMACY') &&
      result.firstRecordText.includes('AmountRM 69.90') &&
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
