const path = require('path');
const puppeteer = require('puppeteer');

const PURPLE_START = 'rgb(76, 29, 149)';
const PURPLE_MIDDLE = 'rgb(109, 40, 217)';
const PURPLE_END = 'rgb(124, 58, 237)';
const LIGHT_CARD = 'rgb(255, 255, 255)';
const LIGHT_BACKGROUND = 'rgb(241, 245, 249)';
const LIGHT_PURPLE_SUBTLE = 'rgb(243, 232, 255)';

function compactText(value) {
  return (value || '').replace(/\s+/g, ' ').trim();
}

async function inspectClaimHighlight(page, config) {
  await page.goto('file://' + path.resolve(__dirname, config.file), {
    waitUntil: 'domcontentloaded'
  });
  await page.evaluate(({ openFunction, employeeId, employeeName }) => {
    document.documentElement.setAttribute('data-theme', 'light');
    window[openFunction](employeeId, employeeName);
  }, config);
  await new Promise(resolve => setTimeout(resolve, 60));

  return page.evaluate(config => {
    const modal = document.getElementById(config.modalId);
    const records = [...document.querySelectorAll(config.recordSelector)];
    const firstRecord = records[0];
    const periodHeader = firstRecord?.querySelector(config.periodSelector);
    const periodStyle = periodHeader ? getComputedStyle(periodHeader) : null;
    const detailsList = document.querySelector(config.listSelector);

    return {
      modalOpen: modal?.style.display === 'flex',
      firstRecordText: (firstRecord?.textContent || '').replace(/\s+/g, ' ').trim(),
      allRecordsUseOneBorder: records.length > 0 && records.every(record => {
        const style = getComputedStyle(record);
        return style.borderLeftWidth === style.borderTopWidth &&
          style.borderLeftColor === style.borderTopColor;
      }),
      periodHeaderBackground: periodStyle?.backgroundImage || '',
      periodHeaderColor: periodStyle?.color || '',
      detailsBackground: detailsList ? getComputedStyle(detailsList).backgroundColor : '',
      recordBackgrounds: records.map(record => getComputedStyle(record).backgroundColor),
      recordCount: records.length
    };
  }, config);
}

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
    const benefit = await inspectClaimHighlight(page, {
      file: '../modules/claims/options/benefit-highlight.html',
      openFunction: 'openBenefitDetailsModal',
      employeeId: '#EBB01',
      employeeName: 'MUHAMMAD ALI BIN MAN',
      modalId: 'benefitDetailsModal',
      listSelector: '.benefit-details-list',
      recordSelector: '.benefit-detail-record',
      periodSelector: '.benefit-detail-period-row'
    });

    const expense = await inspectClaimHighlight(page, {
      file: '../modules/claims/options/expenses-highlight.html',
      openFunction: 'openExpenseDetailsModal',
      employeeId: '#004177',
      employeeName: 'AHMAD RAFY BIN ZULKIPLE',
      modalId: 'expenseDetailsModal',
      listSelector: '.expense-details-list',
      recordSelector: '.expense-detail-record',
      periodSelector: '.expense-detail-period-row'
    });

    await page.goto('file://' + path.resolve(__dirname, '../leave.html'), {
      waitUntil: 'domcontentloaded'
    });
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
      showLeaveSection('viewLeaveHighlight');
      document.querySelector('#viewLeaveHighlight tbody tr td:last-child').click();
    });
    await new Promise(resolve => setTimeout(resolve, 60));

    const leave = await page.evaluate(() => {
      const modal = document.getElementById('leaveHighlightDetailsModal');
      const name = document.getElementById('leaveHighlightModalEmpName');
      const id = document.getElementById('leaveHighlightModalEmpId');
      const records = [...document.querySelectorAll('.leave-highlight-detail-record')];
      const firstRecord = records[0];
      const dateHeader = firstRecord?.querySelector('.leave-highlight-detail-date');
      const recordStyle = firstRecord ? getComputedStyle(firstRecord) : null;
      const detailsList = document.querySelector('.leave-highlight-details-list');
      const totalLeavePill = document.querySelector('#viewLeaveHighlight tbody tr td:last-child span');

      return {
        modalOpen: modal?.style.display === 'flex',
        name: (name?.textContent || '').replace(/\s+/g, ' ').trim(),
        id: (id?.textContent || '').replace(/\s+/g, ' ').trim(),
        idBelowName: Boolean(name && id &&
          id.getBoundingClientRect().top >= name.getBoundingClientRect().bottom),
        recordCount: records.length,
        firstRecordText: (firstRecord?.textContent || '').replace(/\s+/g, ' ').trim(),
        usesOneBorder: Boolean(recordStyle &&
          recordStyle.borderLeftWidth === recordStyle.borderTopWidth &&
          recordStyle.borderLeftColor === recordStyle.borderTopColor),
        dateHeaderBackground: dateHeader ? getComputedStyle(dateHeader).backgroundImage : '',
        detailsBackground: detailsList ? getComputedStyle(detailsList).backgroundColor : '',
        recordBackgrounds: records.map(record => getComputedStyle(record).backgroundColor),
        totalLeavePillColor: totalLeavePill ? getComputedStyle(totalLeavePill).color : '',
        totalLeavePillBackground: totalLeavePill ? getComputedStyle(totalLeavePill).backgroundColor : ''
      };
    });

    const isPurpleHeader = value =>
      value.includes(PURPLE_START) &&
      value.includes(PURPLE_MIDDLE) &&
      value.includes(PURPLE_END);

    const result = { benefit, expense, leave, pageErrors };
    result.passed =
      benefit.modalOpen &&
      benefit.recordCount === 6 &&
      benefit.firstRecordText === '202105 Benefit Type ENTERTAINMENT Amount 3,588.00' &&
      benefit.allRecordsUseOneBorder &&
      isPurpleHeader(benefit.periodHeaderBackground) &&
      benefit.periodHeaderColor === 'rgb(255, 255, 255)' &&
      benefit.detailsBackground === LIGHT_BACKGROUND &&
      benefit.recordBackgrounds.every(color => color === LIGHT_CARD) &&
      expense.modalOpen &&
      expense.recordCount === 3 &&
      expense.firstRecordText === '202609 Expense CLIENT DINING & ENTERTAINMENT Amount 2,450.00' &&
      expense.allRecordsUseOneBorder &&
      isPurpleHeader(expense.periodHeaderBackground) &&
      expense.periodHeaderColor === 'rgb(255, 255, 255)' &&
      expense.detailsBackground === LIGHT_BACKGROUND &&
      expense.recordBackgrounds.every(color => color === LIGHT_CARD) &&
      leave.modalOpen &&
      leave.name === 'AHMAD RAFY BIN ZULKIPLE' &&
      leave.id === '#004177' &&
      leave.idBelowName &&
      leave.recordCount > 0 &&
      leave.firstRecordText === '02 Sep 2026 Description Annual Leave Days 1.00' &&
      leave.firstRecordText.includes('Description') &&
      leave.firstRecordText.includes('Days') &&
      leave.usesOneBorder &&
      isPurpleHeader(leave.dateHeaderBackground) &&
      leave.detailsBackground === LIGHT_BACKGROUND &&
      leave.recordBackgrounds.every(color => color === LIGHT_CARD) &&
      leave.totalLeavePillColor === PURPLE_END &&
      leave.totalLeavePillBackground === LIGHT_PURPLE_SUBTLE &&
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
