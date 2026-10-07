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
          assert.equal(await page.$('.view-chart-btn'), null);
          assert.equal(await page.$('#manpowerSummaryTableContainer'), null);
          assert.equal(await page.$('#view-dashboard table'), null);
          assert.equal(await page.$$eval('.manpower-group-card', cards => cards.length), 5);
          assert.deepEqual(await page.$$eval('.manpower-group-card:first-child .manpower-group-actions button span', labels => labels.map(label => label.textContent)), ['Work Shift', 'No Work', 'OT Plan', 'On Leave']);
          assert.deepEqual(await page.$$eval('.manpower-group-card:first-child .manpower-group-actions strong', values => values.map(value => value.textContent)), ['10', '0', '0', '0']);
          assert.ok(await page.$eval('.manpower-group-actions', actions => {
            const buttons = [...actions.children];
            return buttons.every(button => button.getBoundingClientRect().top === buttons[0].getBoundingClientRect().top && button.scrollWidth <= button.clientWidth);
          }), 'All four actions must fit together in one row');
          await new Promise(resolve => setTimeout(resolve, 400));
          await page.screenshot({ path: path.resolve(__dirname, `${file}-report-${theme}-${width}.png`) });
          await page.$eval('.main-content', node => { node.scrollTop = 300; });
          await page.screenshot({ path: path.resolve(__dirname, `${file}-table-${theme}-${width}.png`) });
          await page.$eval('.main-content', node => { node.scrollTop = 0; });
          for (const [type, title] of [['workShift', 'Work Shift Details'], ['noWork', 'No Work Details'], ['otPlan', 'OT Plan Details'], ['onLeave', 'On Leave Details']]) {
            await page.click(`.manpower-group-card[data-group-id="4"] [data-manpower-type="${type}"]`);
            assert.equal(await page.evaluate(() => selectedManpowerGroup.id), 4);
            assert.equal(await page.$eval('#headerTitle', el => el.textContent), title);
            assert.equal(await page.$eval('#view-details', el => getComputedStyle(el).display), 'block');
            await page.click('.header-btn-icon');
            assert.equal(await page.$eval('#headerTitle', el => el.textContent), 'Daily Manpower Summary');
          }
          assert.equal(await page.$eval('.main-content', el => el.scrollWidth > el.clientWidth), false);
          assert.equal(await page.$eval('#totalRecordsVal', el => el.textContent), '26');
          assert.equal(await page.$$eval('#manpowerListContainer .manpower-group-card', cards => cards.length), 5);
          await page.select('#filterCompanySelect', 'PEOPLE EDGE SDN BHD');
          assert.equal(await page.$eval('#totalRecordsVal', el => el.textContent), '26', 'Draft filters must not change rendered cards');
          await page.evaluate(() => applyFilterModal());
          assert.equal(await page.$eval('#totalRecordsVal', el => el.textContent), '5');
          assert.equal(await page.$$eval('.manpower-group-card', cards => cards.length), 2);
          assert.deepEqual(await page.$$eval('.manpower-company-header', titles => titles.map(title => title.textContent)), ['PEOPLE EDGE SDN BHD', 'PEOPLE EDGE SDN BHD']);
          assert.deepEqual(await page.$$eval('.manpower-group-card .manpower-group-actions strong', values => values.map(value => value.textContent)), ['4', '0', '0', '0', '1', '0', '0', '0']);
          assert.deepEqual(await page.$$eval('.manpower-group-card [data-section]', fields => fields.map(field => field.textContent)), ['EXECUTIVE', 'FOREX']);
          await page.$eval('.main-content', node => { node.scrollTop = 0; });
          await page.screenshot({ path: path.resolve(__dirname, `${file}-cards-${theme}-${width}.png`) });
          await page.select('#filterCompanySelect', 'TECH HUB SOLUTIONS');
          await page.evaluate(() => applyFilterModal());
          assert.equal(await page.$eval('#totalRecordsVal', el => el.textContent), '0');
          assert.equal(await page.$$eval('.manpower-group-card', cards => cards.length), 0);
          assert.equal(await page.$eval('#manpowerEmpty', el => el.hidden), false);
          assert.deepEqual(errors, []);
          await page.screenshot({ path: path.resolve(__dirname, `${file}-${theme}-${width}.png`) });
          console.log(`PASS ${file} ${theme} ${width}: no dashboard tables, company cards, four actions in one row, group context, filtered counts and responsive layout`);
        }
        await page.close();
      }
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
