const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files'] });
  try {
    for (const theme of ['dark', 'light']) {
      for (const width of [360, 420]) {
        const page = await browser.newPage();
        await page.setViewport({ width, height: 950, deviceScaleFactor: 1 });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        for (const file of ['daily-manpower', 'work-hour-violation']) {
          await page.goto(pathToFileURL(path.resolve(__dirname, `../modules/attendance/options/${file}.html`)).href + `?theme=${theme}`, { waitUntil: 'domcontentloaded' });
          if (file === 'work-hour-violation') {
            assert.equal(await page.$('.view-chart-btn'), null);
            assert.equal(await page.$('.attendance-report-summary'), null);
            assert.equal(await page.$$eval('#viewContinuous [data-violation-detail]', cards => cards.length), 4);
            await page.click('#boxRest');
            await page.click('.filter-trigger-btn');
            await page.waitForSelector('#filterModal', { visible: true });
            await page.$eval('#filterDateInput', el => { el.value = '2026-07-10'; });
            await page.click('#filterApplyButton');
            await page.waitForSelector('#filterModal', { hidden: true });
            assert.equal(await page.$$eval('#viewRest [data-violation-detail]', cards => cards.length), 3);
            await page.click('#viewRest [data-violation-detail]');
            await page.waitForSelector('#detailModal', { visible: true });
            assert.equal(await page.$$eval('#detailTableBody tr', rows => rows.length), 2);
            await page.keyboard.press('Escape');
            await page.waitForSelector('#detailModal', { hidden: true });
            await page.click('.filter-trigger-btn');
            await page.waitForSelector('#filterModal', { visible: true });
            await page.select('#filterDeptSelect', 'ACCOUNTS');
            await page.click('#filterApplyButton');
            await page.waitForSelector('#filterModal', { hidden: true });
            assert.equal(await page.$$eval('#viewRest [data-violation-detail]', cards => cards.length), 1);
            assert.equal(await page.$eval('.main-content', el => el.scrollWidth > el.clientWidth), false);
            assert.deepEqual(errors, []);
            await page.screenshot({ path: path.resolve(__dirname, `${file}-${theme}-${width}.png`) });
            console.log(`PASS ${file} ${theme} ${width}: no totals or charts, filtered cards, details and responsive layout`);
            continue;
          }
          await page.waitForSelector('.manpower-group-card');
          await page.click('.filter-trigger-btn');
          await page.waitForSelector('#filterModal.active');
          await new Promise(resolve => setTimeout(resolve, 350));
          await page.screenshot({ path: path.resolve(__dirname, `manpower-filter-${theme}-${width}.png`) });
          const filterLayout = await page.$eval('#filterModal', modal => {
            const button = modal.querySelector('.form-apply-btn');
            const body = button.parentElement;
            const buttonRect = button.getBoundingClientRect();
            const bodyRect = body.getBoundingClientRect();
            return {
              appearances: [...modal.querySelectorAll('select')].map(select => getComputedStyle(select).appearance),
              buttonVisible: buttonRect.top >= bodyRect.top && buttonRect.bottom <= bodyRect.bottom,
              buttonHeight: buttonRect.height,
              bottomGap: modal.getBoundingClientRect().bottom - buttonRect.bottom
            };
          });
          assert.ok(filterLayout.appearances.every(value => value === 'none'), 'Filter dropdowns must show only their custom arrow');
          assert.ok(filterLayout.buttonVisible && filterLayout.buttonHeight >= 48 && filterLayout.bottomGap >= 20, 'Apply Filter must be fully visible with space below');
          await page.click('#filterModal .standard-filter-close');
          await page.waitForSelector('#filterModal', { hidden: true });
          assert.equal(await page.$('.view-chart-btn'), null);
          assert.equal(await page.$('#manpowerSummaryTableContainer'), null);
          assert.equal(await page.$('#view-dashboard table'), null);
          assert.equal(await page.$$eval('.manpower-group-card', cards => cards.length), 5);
          assert.deepEqual(await page.$$eval('.manpower-summary-actions strong', values => values.map(value => value.textContent)), ['260', '13', '92', '3']);
          assert.deepEqual(await page.$$eval('.manpower-group-card:first-child .manpower-group-actions button span', labels => labels.map(label => label.textContent)), ['Work Shift', 'No Work', 'OT Plan', 'On Leave']);
          assert.deepEqual(await page.$$eval('.manpower-group-card:first-child .manpower-group-actions strong', values => values.map(value => value.textContent)), ['20', '0', '0', '0']);
          assert.ok(await page.$eval('.manpower-group-actions', actions => {
            const buttons = [...actions.children];
            return buttons.every(button => button.getBoundingClientRect().top === buttons[0].getBoundingClientRect().top && button.scrollWidth <= button.clientWidth);
          }), 'All four actions must fit together in one row');
          await new Promise(resolve => setTimeout(resolve, 400));
          await page.screenshot({ path: path.resolve(__dirname, `${file}-report-${theme}-${width}.png`) });
          await page.$eval('.main-content', node => { node.scrollTop = 300; });
          await page.screenshot({ path: path.resolve(__dirname, `${file}-table-${theme}-${width}.png`) });
          await page.$eval('.main-content', node => { node.scrollTop = 0; });
          for (const [type, title, employeeTitle, groupId, recordCount, employeeName] of [
            ['workShift', 'Work Shift Summary', 'Work Shift Employee Detail', 1, 5, 'Anderson ng'],
            ['noWork', 'No Work Summary', 'No Work Employee Detail', 3, 1, 'TEST'],
            ['otPlan', 'OT Plan Summary', 'OT Plan Employee Detail', 4, 2, 'Lee Soon Hock'],
            ['onLeave', 'Leave Summary', 'Leave Employee Detail', 5, 2, 'Azhar bin omar']
          ]) {
            await page.click(`.manpower-group-card[data-group-id="${groupId}"] [data-manpower-type="${type}"]`);
            assert.equal(await page.evaluate(() => selectedManpowerGroup.id), groupId);
            assert.equal(await page.$eval('#headerTitle', el => el.textContent), title);
            assert.equal(await page.$eval('#view-details', el => getComputedStyle(el).display), 'block');
            assert.equal(await page.$('#view-details table'), null);
            await page.click('.manpower-detail-summary-card');
            assert.equal(await page.$eval('#headerTitle', el => el.textContent), employeeTitle);
            assert.equal(await page.$eval('.manpower-employee-name', el => el.textContent), employeeName);
            assert.ok(await page.$eval('.manpower-employee-card .attendance-report-emp', el => /^#/.test(el.textContent)));
            await page.click('.header-btn-icon');
            assert.equal(await page.$eval('#headerTitle', el => el.textContent), title, 'Employee Back must return to the selected summary');
            await page.click('.header-btn-icon');
            assert.equal(await page.$eval('#headerTitle', el => el.textContent), 'Daily Manpower Summary');
            await page.click(`.manpower-summary-actions [onclick="openKpiDetails('${type}')"]`);
            assert.equal(await page.evaluate(() => selectedManpowerGroup), null, 'Summary actions must represent all filtered groups');
            assert.equal(await page.$eval('#headerTitle', el => el.textContent), title);
            assert.equal(await page.$$eval('.manpower-detail-summary-card', cards => cards.length), recordCount);
            assert.equal(await page.$eval('.main-content', el => el.scrollWidth > el.clientWidth), false);
            await page.screenshot({ path: path.resolve(__dirname, `manpower-${type}-summary-${theme}-${width}.png`) });
            await page.click('.manpower-detail-summary-card');
            assert.equal(await page.$eval('#headerTitle', el => el.textContent), employeeTitle);
            assert.equal(await page.$eval('.manpower-employee-name', el => el.textContent), employeeName);
            assert.equal(await page.$eval('.main-content', el => el.scrollWidth > el.clientWidth), false);
            await page.screenshot({ path: path.resolve(__dirname, `manpower-${type}-employees-${theme}-${width}.png`) });
            await page.click('.header-btn-icon');
            await page.click('.header-btn-icon');
          }
          assert.equal(await page.$eval('.main-content', el => el.scrollWidth > el.clientWidth), false);
          assert.equal(await page.$eval('#totalRecordsVal', el => el.textContent), '368');
          assert.equal(await page.$$eval('#manpowerListContainer .manpower-group-card', cards => cards.length), 5);
          await page.select('#filterCompanySelect', 'PEOPLE EDGE SDN BHD');
          assert.equal(await page.$eval('#totalRecordsVal', el => el.textContent), '368', 'Draft filters must not change rendered cards');
          await page.evaluate(() => applyFilterModal());
          assert.equal(await page.$eval('#totalRecordsVal', el => el.textContent), '334');
          assert.deepEqual(await page.$$eval('.manpower-summary-actions strong', values => values.map(value => value.textContent)), ['239', '0', '92', '3']);
          assert.equal(await page.$$eval('.manpower-group-card', cards => cards.length), 2);
          assert.deepEqual(await page.$$eval('.manpower-company-header', titles => titles.map(title => title.textContent)), ['PEOPLE EDGE SDN BHD', 'PEOPLE EDGE SDN BHD']);
          assert.deepEqual(await page.$$eval('.manpower-group-card .manpower-group-actions strong', values => values.map(value => value.textContent)), ['3', '0', '92', '0', '236', '0', '0', '3']);
          assert.deepEqual(await page.$$eval('.manpower-group-card [data-section]', fields => fields.map(field => field.textContent)), ['EXECUTIVE', 'FOREX']);
          await page.click('#boxkpiWorkShift');
          assert.deepEqual(await page.$$eval('.manpower-detail-summary-card .manpower-detail-card-header strong', titles => titles.map(title => title.textContent)), ['0815:1715', '0830:1730', '8.30:17.30W']);
          assert.deepEqual(await page.$$eval('.manpower-detail-summary-card .manpower-detail-rows > div:first-child dd', values => values.map(value => value.textContent)), ['2', '1', '236'], 'Global summary must include only filtered company groups');
          await page.click('.header-btn-icon');
          await page.click('#boxkpiNoWork');
          assert.equal(await page.$$eval('.manpower-detail-summary-card', cards => cards.length), 0);
          assert.equal(await page.$eval('#manpowerDetailEmpty', el => el.hidden), false);
          await page.click('.header-btn-icon');
          for (const [button, detailId] of [['boxkpiOtPlan', 'ot-15'], ['boxkpiOnLeave', 'leave-unpaid']]) {
            await page.click(`#${button}`);
            await page.click(`[data-detail-id="${detailId}"]`);
            assert.equal(await page.$eval('#manpowerDetailEmpty', el => el.textContent), 'No employee details available.');
            assert.equal(await page.$$eval('.manpower-employee-card', cards => cards.length), 0);
            await page.keyboard.press('Escape');
            assert.equal(await page.evaluate(() => document.activeElement.dataset.detailId), detailId, 'Back must restore focus to the selected summary record');
            await page.click('.header-btn-icon');
            assert.equal(await page.evaluate(() => document.activeElement.id), button);
          }
          await page.$eval('.main-content', node => { node.scrollTop = 0; });
          await page.screenshot({ path: path.resolve(__dirname, `${file}-cards-${theme}-${width}.png`) });
          await page.select('#filterCompanySelect', 'TECH HUB SOLUTIONS');
          await page.evaluate(() => applyFilterModal());
          assert.equal(await page.$eval('#totalRecordsVal', el => el.textContent), '0');
          assert.deepEqual(await page.$$eval('.manpower-summary-actions strong', values => values.map(value => value.textContent)), ['0', '0', '0', '0']);
          assert.equal(await page.$$eval('.manpower-group-card', cards => cards.length), 0);
          assert.equal(await page.$eval('#manpowerEmpty', el => el.hidden), false);
          assert.deepEqual(errors, []);
          await page.screenshot({ path: path.resolve(__dirname, `${file}-${theme}-${width}.png`) });
          console.log(`PASS ${file} ${theme} ${width}: card summaries and employee drill-down, scoped filters, totals, empty states, Back/Escape focus and mobile layout`);
        }
        await page.close();
      }
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
