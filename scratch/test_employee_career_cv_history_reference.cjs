const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
const url = file => pathToFileURL(path.resolve(file)).href;
const ref = number => 'ECR' + String(number).padStart(16, '0');

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files'] });
  try {
    for (const theme of ['dark', 'light']) {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.setViewport({ width: 390, height: 950 });
      await page.goto(url('modules/employee-career/index.html') + '?scope=individual&theme=' + theme, { waitUntil: 'load' });
      const entry = '[data-option-id="history"]';
      assert.equal(await page.$('[data-option-id="cv-change-request-history"]'), null, 'CV changes belong inside History');
      await page.evaluate(() => localStorage.removeItem('pq_change_request_history'));
      await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.click(entry)]);
      assert.equal(await page.$eval('h1', node => node.textContent), 'History');
      await page.click('[data-history-kind="cv-change-request"]');
      assert.equal(await page.$eval('#historyCategoryTitle', node => node.textContent), 'CV Change Request History');
      assert.equal(await page.$eval('html', node => node.dataset.theme), theme);
      assert.equal(await page.$eval('#historyRecordCount', node => node.textContent), '10', 'Count only the readable reference records');
      assert.ok(await page.$$eval('.cv-history-card-employee', nodes => nodes.length > 0 && nodes.every(node => node.querySelector('.history-employee-name').nextElementSibling.textContent === '#EBB12')));
      const apply = async (from, to, status) => {
        await page.click('#historyFilterTrigger');
        assert.equal(await page.$eval('#historyFilterTitle', node => node.textContent), 'Filter');
        assert.deepEqual(await page.$$eval('#cvHistoryFields label', nodes => nodes.map(node => node.textContent)), ['Start Date', 'End Date', 'Status']);
        await page.$eval('#cvHistoryDateFrom', (node, value) => { node.value = value; }, from);
        await page.$eval('#cvHistoryDateTo', (node, value) => { node.value = value; }, to);
        await page.select('#cvHistoryStatus', status);
        await page.click('#applyHistoryFilter');
      };
      await apply('2019-11-13', '2019-11-13', '');
      assert.equal(await page.$eval('#historyRecordCount', node => node.textContent), '3', 'Both date bounds are inclusive');
      await apply('2019-11-13', '2019-11-13', 'approved');
      assert.deepEqual(await page.$$eval('.history-card-item', nodes => nodes.map(node => node.dataset.recordId)), [ref(100)]);
      await page.click('.history-card-item');
      assert.deepEqual(await page.$$eval('[data-cv-tab]', nodes => nodes.map(node => node.textContent)), ['Personal', 'Qualification', 'Payroll', 'Contacts', 'Family']);
      const expected = {
        personal: ['redo', ref(100), 'SITI NURHALIZA BTE RAHMAN', '22 Apr 1960', '17 Jul 1984', 'A212222048', '25 Mar 2015'],
        qualification: ['Description', 'Other Institute Name', 'CGPA', '0.00', 'Certificate #', 'Year From', 'Year To', 'Highest', 'No', 'Notes'],
        payroll: ['EPF #', 'Socso #', 'Spouse Tax #', 'CIMB', '10447856855254', 'Spouse Handicap?', 'Spouse Working?', 'Yes'],
        contacts: ['th.yew@peoplequest.com.my', '012-3512223', '02-79560000', '10, JALAN UPTOWN 2', '#05-33- JALAN 2228', 'DAMANSARA KOTA', '40860', 'Damansara', 'SELANGOR', 'MALAYSIA', '04-6677778', 'RAZALI', 'AS CORRESPONDENCE ADDRESS', 'FATHER'],
        family: ['Deleted Family Member', 'Existing Family Member', 'Name', 'Relation', 'TAI KIM CHUAN', 'BROTHER', 'ABU KADIR BIN MAHMUD', 'HUSBAND']
      };
      for (const width of [360, 390, 450]) {
        await page.setViewport({ width, height: 950 });
        for (const [tab, values] of Object.entries(expected)) {
          await page.click('[data-cv-tab="' + tab + '"]');
          const text = await page.$eval('#cv-panel-' + tab, node => node.textContent);
          for (const value of values) assert.ok(text.includes(value), tab + ': ' + value);
          assert.equal(await page.$eval('#cv-panel-' + tab, node => node.hidden), false);
          assert.ok(await page.$eval('#historyDetailBody', node => node.scrollWidth <= node.clientWidth + 1), tab + ' fits ' + width);
        }
      }
      await page.keyboard.press('Home');
      assert.equal(await page.$eval('[data-cv-tab="personal"]', node => node.getAttribute('aria-selected')), 'true');
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'closeHistoryDetails', 'Tab wraps inside the detail dialog');
      await page.keyboard.down('Shift');
      await page.keyboard.press('Tab');
      await page.keyboard.up('Shift');
      assert.equal(await page.evaluate(() => document.activeElement.dataset.cvTab), 'personal');
      assert.ok(await page.$eval('#cv-panel-personal .cv-history-detail-employee', node => node.querySelector('.history-employee-name').nextElementSibling.classList.contains('history-employee-id')));
      assert.ok(await page.$eval('#cv-panel-personal [data-cv-field="Name"]', node => node.classList.contains('cv-history-field-changed')));
      await page.setViewport({ width: 390, height: 950 });
      await page.screenshot({ path: 'scratch/employee-career-cv-history-details-' + theme + '.png' });
      await page.keyboard.press('Escape');
      await apply('2019-11-13', '2019-11-13', 'cancelled');
      assert.equal(await page.$eval('#historyRecordCount', node => node.textContent), '2');
      await apply('2030-01-01', '2030-12-31', '');
      assert.equal(await page.$eval('#historyEmptyState', node => node.hidden), false);
      await apply('2026-12-31', '2026-01-01', '');
      assert.equal(await page.$eval('#historyFilterError', node => node.hidden), false);
      assert.equal(await page.$eval('#historyFilterModal', node => node.classList.contains('is-open')), true);
      await page.click('#resetHistoryFilter');
      await page.screenshot({ path: 'scratch/employee-career-cv-history-filter-' + theme + '.png' });
      await page.click('#applyHistoryFilter');
      assert.equal(await page.$eval('#historyRecordCount', node => node.textContent), '10');
      await page.screenshot({ path: 'scratch/employee-career-cv-history-reference-' + theme + '.png' });
      await page.click('#careerHistoryBack');
      await page.waitForSelector(entry);
      assert.equal(await page.$eval('#employeeCareerTabIndividual', node => node.getAttribute('aria-selected')), 'true');
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log('PASS: CV tab inside History without a duplicate option, screenshot records, five detail sections, date/status filters, validation/reset, back navigation, both themes and mobile widths.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
