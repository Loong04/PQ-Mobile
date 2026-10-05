const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
const url = pathToFileURL(path.resolve(__dirname, '../modules/employee-career/options/team/staff-whereabout.html')).href;
(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const apply = async values => {
      await page.click('#staffWhereaboutFilterTrigger');
      await page.evaluate(values => { for (const [id, value] of Object.entries(values)) document.getElementById(id).value = value; }, values);
      await page.click('#staffWhereaboutApplyFilter');
    };
    const reset = async () => { await page.click('#staffWhereaboutFilterTrigger'); await page.click('#staffWhereaboutResetFilter'); };
    for (const theme of ['light', 'dark']) {
      await page.setViewport({ width: 390, height: 950 });
      await page.goto(url + '?theme=' + theme, { waitUntil: 'networkidle0' });
      assert.equal(await page.$('.employee-career-coming-card'), null);
      assert.deepEqual(await page.$$eval('.staff-whereabout-name', nodes => nodes.map(n => n.textContent)), ['Andrew', 'Yee seong liew', 'Ewi robert', 'Ali bin ahmad', 'Juliana binti othman']);
      assert.deepEqual(await page.$$eval('.staff-whereabout-emp-no', nodes => nodes.map(n => n.textContent)), ['#000030', '#000070', '#82828', '#A9999', '#EBB204']);
      assert.deepEqual(await page.$$eval('#staffWhereaboutFilterForm label', nodes => nodes.map(n => n.textContent)), ['Date', 'Search Keyword', 'Branch', 'Department', 'Whereabout']);
      assert.equal(await page.$eval('#staffWhereaboutTotal', n => n.textContent), '5 records');
      assert.deepEqual(await page.$$eval('.staff-whereabout-card:first-child .staff-whereabout-field', nodes => nodes.map(n => n.innerText.replace(/\s+/g, ' ').trim())), ['Whereabout Annual Leave', 'Time -', 'Project -', 'Task -']);
      for (const width of [360, 390, 450]) {
        await page.setViewport({ width, height: 950 });
        assert.ok(await page.$eval('main', n => n.scrollWidth <= n.clientWidth + 1));
        assert.ok(await page.$$eval('.staff-whereabout-card', nodes => nodes.every(n => n.scrollWidth <= n.clientWidth + 1)));
        assert.ok(await page.$$eval('.staff-whereabout-card', nodes => nodes.every(n => n.querySelector('.staff-whereabout-emp-no').getBoundingClientRect().top >= n.querySelector('.staff-whereabout-name').getBoundingClientRect().bottom)));
      }
      await page.setViewport({ width: 390, height: 950 });
      await page.screenshot({ path: path.join(__dirname, `employee_career_staff_whereabout_${theme}.png`) });
      await apply({ staffWhereaboutKeyword: '#000030' });
      assert.equal(await page.$$eval('.staff-whereabout-card', nodes => nodes.length), 1);
      assert.equal(await page.$eval('.staff-whereabout-name', n => n.textContent), 'Andrew');
      await reset();
      await apply({ staffWhereaboutType: 'Medical Leave' });
      assert.equal(await page.$$eval('.staff-whereabout-card', nodes => nodes.length), 3);
      await reset();
      await apply({ staffWhereaboutDate: '2026-10-06' });
      assert.ok(await page.$eval('#staffWhereaboutEmpty', n => !n.hidden));
      await apply({ staffWhereaboutDate: '2026-10-05' });
      assert.equal(await page.$$eval('.staff-whereabout-card', nodes => nodes.length), 5);
      await page.click('#staffWhereaboutFilterTrigger');
      await page.$eval('#staffWhereaboutDate', n => { n.value = ''; });
      await page.click('#staffWhereaboutApplyFilter');
      assert.equal(await page.$eval('#staffWhereaboutFilterOverlay', n => n.hidden), false);
      assert.ok(await page.$eval('#staffWhereaboutFilterError', n => !n.hidden));
      await page.keyboard.press('Escape');
      await page.click('#staffWhereaboutFilterTrigger');
      assert.equal(await page.$eval('#staffWhereaboutDate', n => n.value), '2026-10-05');
      await page.screenshot({ path: path.join(__dirname, `employee_career_staff_whereabout_filter_${theme}.png`) });
      await page.keyboard.down('Shift'); await page.keyboard.press('Tab'); await page.keyboard.up('Shift');
      assert.ok(await page.evaluate(() => !!document.activeElement.closest('#staffWhereaboutFilterOverlay')));
      await page.keyboard.press('Escape');
      assert.equal(await page.$eval('main', n => n.inert), false);
    }
    const fixturePage = await browser.newPage();
    fixturePage.on('pageerror', e => errors.push(e.message));
    await fixturePage.evaluateOnNewDocument(() => {
      window.EMPLOYEE_CAREER_STAFF_WHEREABOUT_RECORDS = [
        { date: '2026-10-05', empNo: '000030', name: 'Andrew', whereabout: 'Annual Leave', time: '-', project: '-', task: '-', branch: 'HQ', department: 'HR' },
        { date: '2026-10-05', empNo: '000070', name: 'Yee seong liew', whereabout: 'Medical Leave', time: '09:00 – 17:00', project: 'PeopleHub Rollout', task: 'Review', branch: 'HQ', department: 'Operations' },
        { date: '2026-10-05', empNo: '82828', name: 'Ewi robert', whereabout: 'Medical Leave', time: '-', project: '-', task: '-', branch: 'South', department: 'HR' }
      ];
    });
    await fixturePage.goto(url + '?theme=light', { waitUntil: 'networkidle0' });
    await fixturePage.click('#staffWhereaboutFilterTrigger');
    await fixturePage.select('#staffWhereaboutBranch', 'HQ');
    await fixturePage.select('#staffWhereaboutDepartment', 'Operations');
    await fixturePage.select('#staffWhereaboutType', 'Medical Leave');
    await fixturePage.click('#staffWhereaboutApplyFilter');
    assert.equal(await fixturePage.$$eval('.staff-whereabout-card', nodes => nodes.length), 1);
    assert.match(await fixturePage.$eval('.staff-whereabout-card', n => n.innerText), /PeopleHub Rollout/);
    assert.match(await fixturePage.$eval('.staff-whereabout-card', n => n.innerText), /Review/);
    assert.deepEqual(errors, []);
    console.log('PASS: Staff Whereabout reference records, four card fields, five filters, IDs below names, date filtering, organization combinations, validation, both themes and three widths.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
