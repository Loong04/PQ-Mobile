const path = require('path');
const puppeteer = require('puppeteer');

const highlights = [
  { name: 'benefit', file: '../modules/claims/options/benefit-highlight.html', open: 'openBenefitDetailsModal', employee: '#EBB01', record: '.benefit-detail-record', field: '.benefit-detail-field', body: '.benefit-detail-fields', dialog: '.benefit-details-dialog' },
  { name: 'expense', file: '../modules/claims/options/expenses-highlight.html', open: 'openExpenseDetailsModal', employee: '#004177', record: '.expense-detail-record', field: '.expense-detail-field', body: '.expense-detail-fields', dialog: '.expense-details-dialog' },
  { name: 'leave', file: '../leave.html', open: 'openLeaveHighlightDetailsModal', employee: '#006611', record: '.leave-highlight-detail-record', field: '.leave-highlight-detail-field', body: '.leave-highlight-detail-body', dialog: '.leave-highlight-details-dialog' }
];

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const config of highlights) {
    for (const width of [390, 320]) {
      await page.setViewport({ width, height: 900 });
      await page.goto('file://' + path.resolve(__dirname, config.file), { waitUntil: 'domcontentloaded' });
      for (const theme of ['dark', 'light']) {
        await page.evaluate(({ theme, config }) => {
          document.documentElement.setAttribute('data-theme', theme);
          if (config.name === 'leave') showLeaveSection('viewLeaveHighlight');
          window[config.open](config.employee, 'Employee');
        }, { theme, config });
        await new Promise(resolve => setTimeout(resolve, 350));
        const details = await page.evaluate(config => ({
          records: document.querySelectorAll(config.record).length,
          fields: document.querySelectorAll(config.field).length,
          overflowingFields: [...document.querySelectorAll(config.field)].filter(field => field.scrollWidth > field.clientWidth).length,
          clippedRecords: [...document.querySelectorAll(config.record)].filter(record => record.querySelector(config.body).getBoundingClientRect().bottom > record.getBoundingClientRect().bottom).length,
          fieldBackground: getComputedStyle(document.querySelector(config.field)).backgroundColor,
          fieldRadius: getComputedStyle(document.querySelector(config.field)).borderRadius
        }), config);
        console.log(JSON.stringify({ highlight: config.name, width, theme, ...details }));
        if (width === 390) {
          const dialog = await page.$(config.dialog);
          await dialog.screenshot({ path: path.resolve(__dirname, `${config.name}_detail_fields_${theme}.png`) });
        }
      }
    }
    }
    console.log(JSON.stringify({ pageErrors: errors }));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

