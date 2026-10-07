const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const pages = [
  ...['benefit', 'medical', 'ot', 'travel', 'entertainment', 'advance', 'expenses'].map(name => `modules/claims/options/${name}-claim.html`),
  'modules/claims/options/travel-request.html',
  'modules/claims/options/submit-claim.html',
  'leave.html',
  'change-request.html',
  ...['deduction-request', 'tax-relief-request', 'prior-pay-data'].map(name => `modules/payroll/options/${name}.html`),
  ...['work-plan', 'work-assignment', 'time-sheet'].map(name => `modules/project-task/options/${name}.html`),
  ...['feedback', 'whereabout'].map(name => `modules/employee-career/options/individual/${name}.html`),
  ...['confirm-staff', 'staff-exit', 'staff-request'].map(name => `modules/employee-career/options/team/${name}.html`),
  ...['attendance', 'overtime', 'feedback-history', 'history', 'ot-plan', 'shift-plan', 'daily-ot-details'].map(name => `modules/attendance/options/${name}.html`)
];
const results = [];
const failures = [];

async function inspect(page, file, theme, state) {
  const headings = await page.evaluate(() => {
    const marked = '.form-section-heading, .section-title-accent, .claim-section-accent, .ot-form-heading > span, .employee-career-form-heading > span';
    return [...document.querySelectorAll(marked)].map(element => {
      const generated = element.classList.contains('form-section-heading');
      const style = getComputedStyle(element, generated ? '::before' : null);
      return {
        title: (generated ? element : element.parentElement).textContent.trim().replace(/\s+/g, ' ').slice(0, 100),
        width: style.width,
        height: style.height,
        color: style.backgroundColor,
        content: generated ? style.content : 'element',
        layout: getComputedStyle(element).display,
        visible: element.getBoundingClientRect().height > 0,
        overflow: element.getBoundingClientRect().width > 0 && element.scrollWidth > element.clientWidth + 2
      };
    });
  });
  if (!headings.length) failures.push(`${file} ${theme} ${state}: no section marker`);
  headings.forEach(heading => {
    if (heading.width !== '3.5px' || heading.height !== '15px' || heading.color !== 'rgb(168, 85, 247)' || heading.content === 'none') {
      failures.push(`${file} ${theme} ${state}: incorrect marker ${JSON.stringify(heading)}`);
    }
    if (heading.content !== 'element' && !['flex', 'inline-flex'].includes(heading.layout)) {
      failures.push(`${file} ${theme} ${state}: marker and title do not share a row: ${heading.title}`);
    }
    if (heading.visible && heading.overflow) failures.push(`${file} ${theme} ${state}: overflowing heading ${heading.title}`);
  });
  results.push({ file, theme, state, headings });
}

async function screenshot(page, name) {
  await page.screenshot({ path: path.join(__dirname, `form_section_${name}.png`), fullPage: true });
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--allow-file-access-from-files']
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 950, deviceScaleFactor: 1 });
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    for (const theme of ['dark', 'light']) {
      for (const file of pages) {
        pageErrors.length = 0;
        await page.goto(pathToFileURL(path.join(root, file)).href + '?theme=' + theme, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
        await inspect(page, file, theme, 'initial');

        const name = path.basename(file);
        const categories = {
          'medical-claim.html': ['treatment', 'expense'],
          'travel-claim.html': ['mileage', 'travel', 'expense'],
          'travel-request.html': ['task', 'traveling', 'accomodation'],
          'entertainment-claim.html': ['details', 'employees', 'guests'],
          'advance-claim.html': ['advance'],
          'expenses-claim.html': ['expense'],
          'ot-claim.html': ['ot']
        }[name];
        if (categories) {
          for (const category of categories) {
            await page.evaluate(category => {
              formData.activeCategory = category;
              openEntryForm('add');
            }, category);
            await inspect(page, file, theme, 'add ' + category);
          }
        }

        if (name === 'benefit-claim.html') {
          await page.evaluate(() => openBenefitClaimForm('CAR MAINTENANCE'));
          await screenshot(page, 'benefit_' + theme);
        }
        if (name === 'staff-exit.html') await screenshot(page, 'staff_exit_' + theme);
        if (name === 'staff-exit.html' || name === 'benefit-claim.html') {
          await page.setViewport({ width: 375, height: 950, deviceScaleFactor: 1 });
          await inspect(page, file, theme, '375px');
          await page.setViewport({ width: 390, height: 950, deviceScaleFactor: 1 });
        }
        if (name === 'prior-pay-data.html') {
          await page.waitForSelector('.prior-ytd');
          await page.click('.prior-ytd');
          for (const tab of ['general', 'earnings', 'reliefs']) {
            await page.$eval('#tab-' + tab, element => element.click());
            await inspect(page, file, theme, tab);
          }
        }
        if (name === 'time-sheet.html') {
          await page.click('#addWorkActivity');
          await inspect(page, file, theme, 'work activity editor');
        }
        if (name === 'attendance.html') {
          for (const modal of ['shiftChangeModalOverlay', 'feedbackModalOverlay', 'fbTimeEditModalOverlay']) {
            await page.evaluate(modal => openModal(modal), modal);
            await inspect(page, file, theme, modal);
            await page.evaluate(modal => closeModal(modal), modal);
          }
        }
        if (name === 'overtime.html') {
          await page.evaluate(() => switchView('request'));
          await inspect(page, file, theme, 'overtime request');
        }
        if (name === 'feedback-history.html') {
          for (const modal of ['feedbackModalOverlay', 'shiftChangeModalOverlay']) {
            await page.evaluate(modal => openOverlay(modal), modal);
            await inspect(page, file, theme, modal);
            await page.evaluate(modal => closeOverlay(modal), modal);
          }
        }
        if (name === 'ot-plan.html') {
          await page.evaluate(() => openEditOtDetailsModal());
          await inspect(page, file, theme, 'OT details editor');
        }
        if (name === 'shift-plan.html') {
          for (const modal of ['reviewChangesModal', 'chooseDatesModal', 'shiftSelectModal']) {
            await page.evaluate(modal => openModal(modal), modal);
            await inspect(page, file, theme, modal);
            await page.evaluate(modal => closeModal(modal), modal);
          }
        }
        if (file === 'leave.html') {
          for (const section of ['viewApplyLeaveForm', 'viewCreditLeaveForm', 'viewApplyOffTimeForm']) {
            await page.evaluate(section => showLeaveSection(section), section);
            await inspect(page, file, theme, section);
          }
          await screenshot(page, 'time_off_' + theme);
        }
        if (file === 'change-request.html') {
          for (const category of ['personal', 'qualification', 'payroll', 'contacts', 'family']) {
            await page.evaluate(category => switchCategory(category), category);
            await inspect(page, file, theme, category);
          }
          for (const kind of ['Qualification', 'Family']) {
            await page.evaluate(kind => window['toggle' + kind + 'Form'](true), kind);
            await inspect(page, file, theme, 'edit ' + kind);
            await page.evaluate(kind => window['toggle' + kind + 'Form'](false), kind);
          }
        }
        if (pageErrors.length) failures.push(`${file} ${theme}: ${pageErrors.join('; ')}`);
      }
      console.log(`Checked ${pages.length} pages and dynamic item editors in ${theme} theme.`);
    }
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(__dirname, 'form_section_accent_report.json'), JSON.stringify({ results, failures }, null, 2));
  }
  console.log(`Checked ${results.length} page states; ${failures.length} issues.`);
  failures.forEach(failure => console.error(failure));
  if (failures.length) process.exitCode = 1;
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
