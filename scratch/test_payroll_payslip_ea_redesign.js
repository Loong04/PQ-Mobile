const puppeteer = require('puppeteer');
const path = require('path');

function fileUrl(relativePath) {
  return `file:///${path.resolve(__dirname, relativePath).replace(/\\/g, '/')}`;
}

async function inspectPayslip(page) {
  await page.goto(fileUrl('../modules/payroll/options/payslip.html'), { waitUntil: 'networkidle0' });

  const beforeFilter = await page.evaluate(() => {
    const text = selector => document.querySelector(selector)?.textContent.replace(/\s+/g, ' ').trim() || '';
    const sectionNames = [...document.querySelectorAll('[data-payroll-section]')]
      .map(section => section.getAttribute('data-payroll-section'));
    const pageText = document.body.innerText.replace(/\s+/g, ' ');
    return {
      filterSummary: text('#payrollFilterSummary'),
      company: text('#payslipCompany'),
      period: text('#payslipPayrollPeriod'),
      cycle: text('#payslipPayrollCycle'),
      bank: text('#payslipBankBranch'),
      account: text('#payslipAccountNumber'),
      netPay: text('#netPayMainDisplay'),
      sectionNames,
      pageText
    };
  });

  await page.evaluate(() => document.querySelector('#payrollFilterTrigger')?.click());
  await new Promise(resolve => setTimeout(resolve, 350));
  const filter = await page.evaluate(() => ({
    open: document.querySelector('#payslipFilterModal')?.classList.contains('is-open') || false,
    period: document.querySelector('#payslipPeriodSelect')?.value || '',
    hasReset: !!document.querySelector('#payslipFilterModal .standard-filter-reset, #payslipFilterModal [data-filter-reset]'),
    hasClose: !!document.querySelector('#payslipFilterModal .standard-filter-close, #payslipFilterModal [data-filter-close]')
  }));

  await page.evaluate(() => document.querySelector('#payslipFilterModal [data-filter-close]')?.click());
  await page.screenshot({ path: path.join(__dirname, 'payroll_payslip_redesign.png'), fullPage: false });

  return { ...beforeFilter, filter };
}

async function inspectEA(page) {
  await page.goto(fileUrl('../modules/payroll/options/ea-form.html'), { waitUntil: 'networkidle0' });

  const beforeFilter = await page.evaluate(() => {
    const text = selector => document.querySelector(selector)?.textContent.replace(/\s+/g, ' ').trim() || '';
    const parts = [...document.querySelectorAll('[data-ea-part]')]
      .map(section => section.getAttribute('data-ea-part'));
    const employee = document.querySelector('#eaEmployeeIdentity')?.innerText.replace(/\s+/g, ' ').trim() || '';
    const pageText = document.body.innerText.replace(/\s+/g, ' ');
    return {
      filterSummary: text('#eaFilterSummary'),
      year: text('#headerEAYearText'),
      taxRef: text('#eaTaxReference'),
      parts,
      employee,
      pageText
    };
  });

  await page.evaluate(() => document.querySelector('#eaFilterTrigger')?.click());
  await new Promise(resolve => setTimeout(resolve, 350));
  const filter = await page.evaluate(() => ({
    open: document.querySelector('#eaFilterModal')?.classList.contains('is-open') || false,
    year: document.querySelector('#eaYearSelect')?.value || '',
    taxRef: document.querySelector('#eaTaxRefSelect')?.value || '',
    hasReset: !!document.querySelector('#eaFilterModal .standard-filter-reset, #eaFilterModal [data-filter-reset]'),
    hasClose: !!document.querySelector('#eaFilterModal .standard-filter-close, #eaFilterModal [data-filter-close]')
  }));

  await page.evaluate(() => document.querySelector('#eaFilterModal [data-filter-close]')?.click());
  await page.screenshot({ path: path.join(__dirname, 'payroll_ea_redesign.png'), fullPage: false });

  return { ...beforeFilter, filter };
}

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.setViewport({ width: 450, height: 950 });

    const payslip = await inspectPayslip(page);
    const ea = await inspectEA(page);

    const payslipPassed = payslip.filterSummary.includes('December 2025')
      && payslip.company === 'PEOPLE QUEST SDN BHD'
      && payslip.period === 'December 2025'
      && payslip.cycle === 'MONTH END'
      && payslip.bank === 'CIMB'
      && payslip.account === '10447856855254'
      && payslip.netPay === 'RM 8,895.15'
      && JSON.stringify(payslip.sectionNames) === JSON.stringify([
        'Earnings', 'Deductions', 'Employer Contributions',
        'Statutory Base Details', 'Other Information'
      ])
      && payslip.pageText.includes('BASIC PAY RM 9,400.00')
      && payslip.pageText.includes('TOLL ALLOWANCE RM 200.00')
      && payslip.pageText.includes('HOUSING LOAN RM 500.00')
      && payslip.pageText.includes('EMPLOYER EPF RM 1,272.00')
      && payslip.pageText.includes('CP39 BASE RM 10,590.00')
      && payslip.pageText.includes('WORK DAYS 23.00')
      && payslip.filter.open
      && payslip.filter.period === '2025-12'
      && payslip.filter.hasReset
      && payslip.filter.hasClose;

    const eaPassed = ea.filterSummary.includes('2024')
      && ea.filterSummary.includes('T01 (TAX)')
      && ea.year === 'Year of Assessment 2024'
      && ea.taxRef === 'T01 (TAX)'
      && JSON.stringify(ea.parts) === JSON.stringify(['A', 'B', 'C', 'D', 'E', 'F'])
      && /SARAH JENKINS\s+#EBB01/.test(ea.employee)
      && ea.pageText.includes('Pension & Annuities')
      && ea.pageText.includes('Open & Print')
      && ea.pageText.includes('Download PDF')
      && ea.filter.open
      && ea.filter.year === '2024'
      && ea.filter.taxRef === 'T01 (TAX)'
      && ea.filter.hasReset
      && ea.filter.hasClose;

    const passed = payslipPassed && eaPassed && pageErrors.length === 0;
    console.log(JSON.stringify({ payslip, ea, pageErrors, payslipPassed, eaPassed, passed }, null, 2));
    if (!passed) process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
