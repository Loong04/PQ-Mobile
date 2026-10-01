const puppeteer = require('puppeteer');
const path = require('path');

const fileUrl = relativePath => 'file:///' + path.resolve(__dirname, '..', relativePath).replace(/\\/g, '/');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
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
    labels: [...document.querySelectorAll('#modalRecordsList dt')].map(item => item.textContent.trim())
  }));

  await page.goto(fileUrl('modules/claims/options/summary.html'), { waitUntil: 'networkidle0' });
  await page.evaluate(() => openDetailsModal('PHARMACY'));
  const summary = await page.evaluate(() => ({
    topBackground: getComputedStyle(document.querySelector('.summary-details-top')).backgroundImage,
    recordHeaderBackground: getComputedStyle(document.querySelector('.summary-record-date')).backgroundImage,
    recordHeaderTextColor: getComputedStyle(document.querySelector('.summary-record-date dd')).color,
    hasDate: /^\d{2}\/\d{2}\/\d{4}/.test(document.querySelector('.summary-record-date dd')?.textContent.trim() || '')
  }));

  const usesBrandPurple = value => value.includes('rgb(124, 58, 237)') && value.includes('rgb(109, 40, 217)');
  const passed =
    staff.employeeName === 'Sarah Chen' &&
    staff.employeeId === '#EBB01' &&
    JSON.stringify(staff.labels) === JSON.stringify(['Period', 'Expense', 'Amount']) &&
    usesBrandPurple(staff.topBackground) &&
    usesBrandPurple(staff.recordHeaderBackground) &&
    staff.recordHeaderNameColor === 'rgb(255, 255, 255)' &&
    usesBrandPurple(summary.topBackground) &&
    usesBrandPurple(summary.recordHeaderBackground) &&
    summary.recordHeaderTextColor === 'rgb(255, 255, 255)' &&
    summary.hasDate &&
    pageErrors.length === 0;

  console.log(JSON.stringify({ staff, summary, pageErrors, passed }, null, 2));
  await browser.close();
  if (!passed) process.exit(1);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
