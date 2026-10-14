const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const indexUrl = theme => pathToFileURL(path.join(root, 'modules/performance/index.html')).href + `?theme=${theme}`;
const pageUrl = theme => pathToFileURL(path.join(root, 'modules/performance/options/goal-progress.html')).href + `?theme=${theme}`;

async function setField(page, selector, value) {
  await page.$eval(selector, (element, nextValue) => {
    element.value = nextValue;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--allow-file-access-from-files', '--no-sandbox']
  });
  const errors = [];

  try {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', request => /^https?:/.test(request.url()) ? request.abort() : request.continue());
    page.on('pageerror', error => errors.push(error.message));

    await page.setViewport({ width: 420, height: 844 });
    await page.goto(indexUrl('light'), { waitUntil: 'domcontentloaded' });
    assert.equal(await page.$eval('[data-option-id="goal-progress"]', node => node.tagName), 'A', 'Goal Progress must be a navigable option');
    await page.click('[data-option-id="goal-progress"]');
    await page.waitForFunction(() => location.pathname.endsWith('/goal-progress.html'));
    assert.ok(new URL(page.url()).pathname.endsWith('/goal-progress.html'), 'Goal Progress option opens the page');

    for (const theme of ['dark', 'light']) {
      for (const width of [360, 420]) {
        await page.setViewport({ width, height: 844 });
        await page.goto(pageUrl(theme), { waitUntil: 'domcontentloaded' });

        assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), theme);
        assert.equal(await page.$eval('#goalProgressTitle', node => node.textContent.trim()), 'Goal Progress');
        assert.ok(await page.$('#goalProgressFilterTrigger.claim-filter-bar'),'Goal Progress uses the shared Current Filter bar');
        assert.deepEqual(await page.$$eval('.goal-progress-filter label', nodes => nodes.map(node => node.textContent.trim())), ['Period', 'Evaluation Type']);
        assert.equal(await page.$('.goal-progress-card-header i'),null,'Goal title has no decorative target icon');
        assert.equal(await page.$eval('#goalProgressTotal', node => node.textContent.trim()), '1');

        const card = await page.$eval('.goal-progress-card', node => {
          const headerStyle = getComputedStyle(node.querySelector('.goal-progress-card-header'));
          return {
            category: node.querySelector('.goal-progress-card-category')?.textContent.trim(),
            context: node.querySelector('.goal-progress-card-context')?.textContent.trim(),
            title: node.querySelector('.goal-progress-card-title')?.textContent.trim(),
            labels: [...node.querySelectorAll('.goal-progress-detail dt')].map(item => item.textContent.trim()),
            values: [...node.querySelectorAll('.goal-progress-detail dd')].map(item => item.textContent.trim()),
            updateText: node.querySelector('.goal-progress-update')?.textContent.trim(),
            purpleHeader: headerStyle.backgroundImage.includes('linear-gradient') && headerStyle.color === 'rgb(255, 255, 255)',
            rounded: getComputedStyle(node).borderRadius === '18px'
          };
        });
        assert.deepEqual(card, {
          category: 'A) Financial',
          context: 'KRA 1: FFB Budget · Unit: MT',
          title: 'Achieve FFB Production Budget',
          labels: ['Description', 'Target', 'Weightage', 'Deadline', 'Last Update', 'Achieved'],
          values: ['Deliver the approved annual FFB production budget.', '120,000 MT', '30%', '31 Dec 2026', 'No updates yet', '0 MT · 0%'],
          updateText: 'Update',
          purpleHeader: true,
          rounded: true
        });
        await page.screenshot({ path: path.join(__dirname, `performance-goal-progress-${theme}-${width}.png`) });

        await page.click('#goalProgressFilterTrigger');
        assert.equal(await page.$eval('#goalProgressFilterModal',node=>node.getAttribute('aria-hidden')),'false');
        await page.screenshot({path:path.join(__dirname,`performance-goal-progress-filter-${theme}-${width}.png`)});
        await setField(page, '#goalProgressEvaluationFilter', 'Annual Review');
        assert.equal(await page.$eval('#goalProgressTotal',node=>node.textContent.trim()),'1','Draft filter does not change records before Apply');
        await page.keyboard.press('Escape');
        assert.equal(await page.evaluate(()=>document.activeElement.id),'goalProgressFilterTrigger');
        await page.click('#goalProgressFilterTrigger');
        assert.equal(await page.$eval('#goalProgressEvaluationFilter',node=>node.value),'','Closing without Apply discards draft changes');
        await setField(page, '#goalProgressEvaluationFilter', 'Annual Review');
        await page.click('#goalProgressApplyFilter');
        assert.equal(await page.$eval('#goalProgressTotal', node => node.textContent.trim()), '0', 'Evaluation type filter updates total record');
        assert.equal(await page.$eval('#goalProgressEmpty', node => node.hidden), false, 'Empty state appears when filters have no results');
        assert.ok(await page.$eval('#goalProgressFilterSummary',node=>node.textContent.includes('Annual Review')));
        await page.click('#goalProgressFilterTrigger');
        await setField(page, '#goalProgressEvaluationFilter', 'Mid-Year Review');
        await page.click('#goalProgressApplyFilter');
        assert.equal(await page.$eval('#goalProgressTotal', node => node.textContent.trim()), '1');
        await page.click('#goalProgressFilterTrigger');await page.click('#goalProgressResetFilter');await page.click('#goalProgressApplyFilter');
        assert.equal(await page.$eval('#goalProgressFilterSummary',node=>node.textContent),'All Periods • All Evaluation Types');

        await page.click('.goal-progress-update');
        assert.ok(await page.$('.goal-progress-content'),'Update opens the Goal Progress form without navigating through the bottom bar');
        assert.deepEqual(await page.evaluate(() => ({ pageY: window.scrollY, phoneY: document.querySelector('.phone-container').scrollTop, contentY: document.querySelector('.goal-progress-content').scrollTop })), { pageY: 0, phoneY: 0, contentY: 0 }, 'Switching views keeps the preview frame fixed and resets only the phone content');
        assert.equal(await page.$eval('#goalProgressListView', node => node.hidden), true);
        assert.equal(await page.$eval('#goalProgressUpdateView', node => node.hidden), false);
        assert.equal(await page.$eval('#goalProgressTitle', node => node.textContent.trim()), 'Update Goal Progress');
        assert.deepEqual(await page.$$eval('.goal-progress-context-line', nodes => nodes.map(node => node.textContent.trim())), [
          'A) Financial',
          'KRA 1: FFB Budget',
          'Unit: MT'
        ]);
        assert.deepEqual(await page.$$eval('#goalProgressForm label', nodes => nodes.map(node => node.textContent.replace('*', '').trim())), [
          'Date', 'Hours Spent', 'Achieved Value', 'Achieved %', 'Remark'
        ]);
        assert.deepEqual(await page.$$eval('#goalProgressTable thead th', nodes => nodes.map(node => node.textContent.trim())), ['Date', 'Achieved', 'Action']);

        await page.click('#goalProgressAdd');
        assert.equal(await page.$eval('#goalProgressFormError', node => node.textContent.trim()), 'Date is required.');
        assert.equal(await page.$eval('#goalProgressDate', node => node.getAttribute('aria-invalid')), 'true');

        await setField(page, '#goalProgressDate', '2026-10-13');
        await page.click('#goalProgressAdd');
        assert.equal(await page.$eval('#goalProgressFormError', node => node.textContent.trim()), 'Hours Spent is required.');
        await setField(page, '#goalProgressHours', '6.5');
        await page.click('#goalProgressAdd');
        assert.equal(await page.$eval('#goalProgressFormError', node => node.textContent.trim()), 'Achieved Value is required.');
        await setField(page, '#goalProgressAchievedValue', '2500');
        await page.click('#goalProgressAdd');
        assert.equal(await page.$eval('#goalProgressFormError', node => node.textContent.trim()), 'Achieved % is required.');
        await setField(page, '#goalProgressAchievedPercent', '72.5');
        await setField(page, '#goalProgressRemark', 'Mill delivery verified.');
        await page.click('#goalProgressAdd');

        assert.deepEqual(await page.$$eval('#goalProgressTableBody tr', rows => rows.map(row => [...row.cells].map(cell => cell.textContent.trim()))), [
          ['13 Oct 2026', '2,500 MT · 72.5%', 'Delete']
        ], 'Add places the progress record in the table');
        await page.screenshot({ path: path.join(__dirname, `performance-goal-progress-update-${theme}-${width}.png`) });
        assert.deepEqual(await page.$eval('#goalProgressForm', form => [...form.elements].filter(item => item.matches('input, textarea')).map(item => item.value)), ['', '', '', '', ''], 'Add clears the form after a successful entry');
        assert.deepEqual(await page.evaluate(() => Object.keys(sessionStorage).concat(Object.keys(localStorage)).filter(key => key.startsWith('peoplehcm:performance:goal-progress'))), [], 'Goal progress records are not persisted');

        await page.click('#goalProgressBack');
        assert.equal(await page.$eval('#goalProgressTitle', node => node.textContent.trim()), 'Goal Progress');
        assert.deepEqual(await page.$$eval('.goal-progress-detail dd', nodes => nodes.map(node => node.textContent.trim()).slice(-2)), ['13 Oct 2026', '2,500 MT · 72.5%'], 'Latest entry updates the goal card');

        await page.click('.goal-progress-update');
        await setField(page, '#goalProgressDate', '2026-10-14');
        await setField(page, '#goalProgressHours', '3');
        await page.click('#goalProgressClear');
        assert.deepEqual(await page.$eval('#goalProgressForm', form => [...form.elements].filter(item => item.matches('input, textarea')).map(item => item.value)), ['', '', '', '', ''], 'Clear Form resets every input');

        await page.$eval('.goal-progress-delete', button => button.scrollIntoView({ block: 'center' }));
        await page.click('.goal-progress-delete');
        assert.equal(await page.$$eval('#goalProgressTableBody tr', rows => rows.length), 0, 'Delete removes the progress row');
        assert.equal(await page.$eval('#goalProgressHistoryEmpty', node => node.hidden), false, 'Empty history state returns after deletion');

        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.click('.goal-progress-update');
        assert.equal(await page.$$eval('#goalProgressTableBody tr', rows => rows.length), 0, 'Refreshing resets in-memory records');
      }
    }

    assert.deepEqual(errors, [], `Page errors: ${errors.join(' | ')}`);
    console.log('Performance Goal Progress checks passed.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
