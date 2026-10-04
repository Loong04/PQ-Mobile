const puppeteer = require('puppeteer');
const path = require('path');

const fileUrl = relativePath => 'file:///' + path.resolve(__dirname, '..', relativePath).replace(/\\/g, '/');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 900 });
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto(fileUrl('modules/claims/options/staff-summary.html'), { waitUntil: 'networkidle0' });
  await page.click('.staff-summary-card');
  const staff = await page.evaluate(() => ({
    topBackground: getComputedStyle(document.querySelector('.summary-details-top')).backgroundImage,
    recordHeaderBackground: getComputedStyle(document.querySelector('.staff-record-employee')).backgroundImage,
    recordHeaderNameColor: getComputedStyle(document.querySelector('.staff-record-employee-name')).color,
    recordHeaderIdColor: getComputedStyle(document.querySelector('#modalRecordsList .staff-employee-id')).color,
    employeeName: document.querySelector('.staff-record-employee-name')?.textContent.trim(),
    employeeId: document.querySelector('#modalRecordsList .staff-employee-id')?.textContent.trim(),
    labels: [...document.querySelectorAll('#modalRecordsList dt')].map(item => item.textContent.trim()),
    detailCardCount: document.querySelectorAll('#modalRecordsList .staff-detail-card').length,
    connectedCards: [...document.querySelectorAll('#modalRecordsList .staff-detail-card')].every(card =>
      card.querySelector(':scope > .staff-record-employee') &&
      card.querySelector(':scope > .staff-detail-card-body')
    ),
    detailCardRadius: document.querySelector('#modalRecordsList .staff-detail-card') ? getComputedStyle(document.querySelector('#modalRecordsList .staff-detail-card')).borderRadius : '',
    summaryCardRadius: getComputedStyle(document.querySelector('.staff-summary-card')).borderRadius,
    metricCardCount: document.querySelectorAll('#modalRecordsList .staff-detail-metric-card').length,
    metricCardLabels: [...document.querySelectorAll('#modalRecordsList .staff-detail-metric-card dt')].map(item => item.textContent.trim()),
    metricCardValues: [...document.querySelectorAll('#modalRecordsList .staff-detail-metric-card dd')].map(item => item.textContent.trim()),
    metricCardsOwnSurface: [...document.querySelectorAll('#modalRecordsList .staff-detail-metric-card')].every(item =>
      getComputedStyle(item).backgroundColor !== getComputedStyle(item.closest('.staff-detail-card-body')).backgroundColor
    ),
    detailsCloseRadius: getComputedStyle(document.querySelector('#summaryDetailsModalOverlay .summary-details-close')).borderRadius,
    filterCloseRadius: getComputedStyle(document.querySelector('#staffFilterModal .claim-filter-close')).borderRadius,
    detailsCloseWidth: getComputedStyle(document.querySelector('#summaryDetailsModalOverlay .summary-details-close')).width,
    detailsCloseHeight: getComputedStyle(document.querySelector('#summaryDetailsModalOverlay .summary-details-close')).height,
    detailsCloseGlyph: getComputedStyle(document.querySelector('#summaryDetailsModalOverlay .summary-details-close'), '::before').content.replaceAll('"', ''),
    filterCloseGlyph: document.querySelector('#staffFilterModal .claim-filter-close').textContent.trim()
  }));

  await page.goto(fileUrl('modules/claims/options/summary.html'), { waitUntil: 'networkidle0' });
  await page.evaluate(() => openDetailsModal('PHARMACY'));
  const summary = await page.evaluate(() => ({
    topBackground: getComputedStyle(document.querySelector('.summary-details-top')).backgroundImage,
    recordHeaderBackground: getComputedStyle(document.querySelector('.summary-record-date')).backgroundImage,
    recordHeaderTextColor: getComputedStyle(document.querySelector('.summary-record-date dd')).color,
    hasDate: /^\d{2}\/\d{2}\/\d{4}/.test(document.querySelector('.summary-record-date dd')?.textContent.trim() || ''),
    metricCardCount: document.querySelectorAll('#modalRecordsListContainer .summary-detail-metric-card').length,
    firstMetricLabels: [...document.querySelectorAll('#modalRecordsListContainer .claim-summary-detail-card:first-child .summary-detail-metric-card dt')].map(item => item.textContent.trim()),
    firstMetricValues: [...document.querySelectorAll('#modalRecordsListContainer .claim-summary-detail-card:first-child .summary-detail-metric-card dd')].map(item => item.textContent.trim()),
    metricCardsOwnSurface: [...document.querySelectorAll('#modalRecordsListContainer .summary-detail-metric-card')].every(item =>
      getComputedStyle(item).backgroundColor !== getComputedStyle(item.closest('.claim-summary-detail-body')).backgroundColor
    ),
    dateHeaderCount: document.querySelectorAll('#modalRecordsListContainer .summary-record-date').length,
    detailsCloseRadius: getComputedStyle(document.querySelector('#summaryDetailsModalOverlay .summary-details-close')).borderRadius,
    filterCloseRadius: getComputedStyle(document.querySelector('#filterModalOverlay .claim-filter-close')).borderRadius,
    detailsCloseWidth: getComputedStyle(document.querySelector('#summaryDetailsModalOverlay .summary-details-close')).width,
    detailsCloseHeight: getComputedStyle(document.querySelector('#summaryDetailsModalOverlay .summary-details-close')).height,
    detailsCloseGlyph: getComputedStyle(document.querySelector('#summaryDetailsModalOverlay .summary-details-close'), '::before').content.replaceAll('"', ''),
    filterCloseGlyph: document.querySelector('#filterModalOverlay .claim-filter-close').textContent.trim()
  }));

  const usesBrandPurple = value => value.includes('rgb(124, 58, 237)') && value.includes('rgb(109, 40, 217)');
  const passed =
    staff.employeeName === 'Sarah Jenkins' &&
    staff.employeeId === '#EBB01' &&
    JSON.stringify(staff.labels) === JSON.stringify(['Period', 'Expense', 'Amount']) &&
    staff.detailCardCount === 1 &&
    staff.connectedCards &&
    staff.detailCardRadius === staff.summaryCardRadius &&
    staff.metricCardCount === 3 &&
    JSON.stringify(staff.metricCardLabels) === JSON.stringify(['Period', 'Expense', 'Amount']) &&
    JSON.stringify(staff.metricCardValues) === JSON.stringify(['202605', 'Advertisement', 'RM 450.00']) &&
    staff.metricCardsOwnSurface &&
    staff.detailsCloseRadius === staff.filterCloseRadius &&
    staff.detailsCloseRadius === '50%' &&
    staff.detailsCloseWidth === staff.detailsCloseHeight &&
    staff.detailsCloseGlyph === staff.filterCloseGlyph &&
    usesBrandPurple(staff.topBackground) &&
    usesBrandPurple(staff.recordHeaderBackground) &&
    staff.recordHeaderNameColor === 'rgb(255, 255, 255)' &&
    usesBrandPurple(summary.topBackground) &&
    usesBrandPurple(summary.recordHeaderBackground) &&
    summary.recordHeaderTextColor === 'rgb(255, 255, 255)' &&
    summary.hasDate &&
    summary.metricCardCount === 9 &&
    JSON.stringify(summary.firstMetricLabels) === JSON.stringify(['Period', 'Expense', 'Amount']) &&
    JSON.stringify(summary.firstMetricValues) === JSON.stringify(['202605', 'PHARMACY', 'RM 69.90']) &&
    summary.metricCardsOwnSurface &&
    summary.dateHeaderCount === 3 &&
    summary.detailsCloseRadius === summary.filterCloseRadius &&
    summary.detailsCloseRadius === '50%' &&
    summary.detailsCloseWidth === summary.detailsCloseHeight &&
    summary.detailsCloseGlyph === summary.filterCloseGlyph &&
    pageErrors.length === 0;

  console.log(JSON.stringify({ staff, summary, pageErrors, passed }, null, 2));
  await browser.close();
  if (!passed) process.exit(1);
})().catch(error => {
  console.error(error);
  process.exit(1);
});


