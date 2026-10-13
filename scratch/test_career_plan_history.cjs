const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const base = pathToFileURL(path.resolve(__dirname, '../modules/employee-career/options/history.html')).href;
    for (const theme of ['dark','light']) {
      await page.setViewport({ width: 390, height: 950 });
      await page.goto(`${base}?category=career-plan&theme=${theme}`, { waitUntil: 'domcontentloaded' });
      assert.equal(await page.$eval('[data-history-kind="career-plan"]', node => node.getAttribute('aria-pressed')), 'true', 'Career Plan is selectable and can be linked directly');
      assert.equal(await page.$eval('#historyCategoryTitle', node => node.textContent), 'Career Plan History');
      assert.equal(await page.$eval('#historyRecordCount', node => node.textContent), '2');
      assert.equal(await page.$$eval('#careerHistoryList [data-record-id]', nodes => nodes.length), 2);
      assert.deepEqual(await page.$eval('#careerHistoryList [data-record-id]', node => [...node.querySelectorAll('.history-employee-name, .history-employee-id')].map(node => node.textContent)), ['Aina Rahman', '#EBB01']);
      await page.click('#careerHistoryList [data-record-id="career-plan-1"]');
      assert.equal(await page.$eval('#historyDetailTitle', node => node.textContent), 'Career Plan Details');
      assert.deepEqual(await page.$$eval('#historyDetailBody th', nodes => nodes.map(node => node.textContent)), ['Name', 'Emp #', 'Position', 'Department', 'Career Path', 'Next Position', 'Target Date', 'Justification', 'Action Plan', 'Development Needs', 'Remarks', 'Submit Date', 'Status', 'Attachments']);
      const values = await page.$$eval('#historyDetailBody td', nodes => nodes.map(node => node.textContent.trim()));
      assert.deepEqual(values.slice(0, 7), ['Aina Rahman', '#EBB01', 'People Operations Executive', 'People & Culture', 'Leadership', 'Team Lead', '31 Mar 2027']);
      assert.ok(values.slice(7, 11).every(value => value.length > 10 && value !== '—'), 'Development text is populated in the selected record');
      assert.equal(values[12], 'Submitted');
      assert.equal(values[13], 'career-development-plan.pdf');
      assert.equal(await page.$eval('#historyDetailActions', node => node.hidden), true, 'Read-only career details do not show Feedback Edit or Whereabout Delete');
      assert.equal(await page.$eval('#historyDetailsModal', node => node.classList.contains('cv-history-mobile-sheet')), false, 'Career Plan keeps the existing general History popout');
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(__dirname, `career-plan-history-details-${theme}.png`) });
      await page.keyboard.press('Escape');
      assert.equal(await page.evaluate(() => document.activeElement.dataset.recordId), 'career-plan-1');
      await page.click('#careerHistoryList [data-record-id="career-plan-2"]');
      assert.match(await page.$eval('#historyDetailBody', node => node.textContent), /Specialist/);
      assert.match(await page.$eval('#historyDetailBody', node => node.textContent), /Senior Specialist/);
      assert.match(await page.$eval('#historyDetailBody', node => node.textContent), /No Data of Attachments/);
      await page.click('#closeHistoryDetails');
      await page.click('#historyFilterTrigger');
      assert.equal(await page.$eval('#cvHistoryFields', node => node.hidden), false);
      await page.select('#cvHistoryStatus', 'submitted');
      await page.click('#applyHistoryFilter');
      assert.equal(await page.$eval('#historyRecordCount', node => node.textContent), '1');
      await page.click('[data-history-kind="feedback"]');
      assert.equal(await page.$eval('#historyRecordCount', node => node.textContent), '3', 'Career filters do not affect Feedback');
      await page.click('[data-history-kind="career-plan"]');
      assert.equal(await page.$eval('#historyRecordCount', node => node.textContent), '1', 'Career filters are preserved independently');
      await page.click('#historyFilterTrigger');
      await page.select('#cvHistoryStatus', '');
      await page.$eval('#cvHistoryDateFrom', node => { node.value = '2026-10-01'; });
      await page.$eval('#cvHistoryDateTo', node => { node.value = '2026-10-31'; });
      await page.click('#applyHistoryFilter');
      assert.equal(await page.$eval('#historyRecordCount', node => node.textContent), '1', 'Submission date filters find the correct plan');
      for (const width of [360, 390, 450]) {
        await page.setViewport({ width, height: 950 });
        assert.ok(await page.$eval('main', node => node.scrollWidth <= node.clientWidth + 1));
        await page.click('#careerHistoryList [data-record-id]');
        assert.ok(await page.$eval('#historyDetailBody', node => node.scrollWidth <= node.clientWidth + 1), 'Long career fields fit the popout');
        await page.keyboard.press('Escape');
      }
    }
    assert.deepEqual(errors, []);
    console.log('PASS: Career Plan history category, complete record details, separate filters, modal focus and responsive themes.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
