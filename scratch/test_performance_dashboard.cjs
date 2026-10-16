const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const url = (file, query = '') => pathToFileURL(path.join(root, file)).href + query;

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
    for (const theme of ['dark', 'light']) {
      await page.goto(url(`app${theme}.html`), { waitUntil: 'domcontentloaded' });
      const entry = await page.$('xpath/.//div[contains(@class, "explore-row")][.//h4[text()="Performance"]]');
      assert.ok(entry, 'Apps exposes Performance');
      await entry.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), entry.click()]);
      assert.ok(page.url().includes('/modules/performance/index.html'), 'Performance entry opens its dashboard');
      assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), theme, 'Apps preserves theme');

      for (const width of [360, 420]) {
        await page.setViewport({ width, height: 844 });
        await page.goto(url('modules/performance/index.html', `?scope=individual&theme=${theme}`), { waitUntil: 'domcontentloaded' });
        assert.equal(await page.$eval('#performanceIndividualPanel', el => el.hidden), false);
        assert.equal(await page.$eval('#performanceTeamPanel', el => el.hidden), true);
        assert.deepEqual(await page.$$eval('#performanceIndividualPanel .performance-option-title', els => els.map(el => el.textContent.trim())),
          ['Goal Plan', 'Goal Progress', 'Self Evaluation', 'Self Review', 'Work Incident']);
        assert.equal(await page.$('.performance-status-card'), null, 'Document status is removed');
        assert.deepEqual(await page.$$eval('#performanceIndividualPanel .performance-section-title', els => els.map(el => el.textContent.trim())),
          ['Quick Options', 'My Outstanding Tasks', 'Latest Performance']);
        assert.equal(await page.$('.performance-actions'), null, 'Numbered stage tracker removed');
        assert.deepEqual(await page.$$eval('.performance-task-title', els => els.map(el => el.textContent.trim())),
          ['Complete Goal Plan', 'Complete Self Evaluation', 'Complete Self Review']);
        assert.deepEqual(await page.$$eval('.performance-task-count', els => els.map(el => el.textContent.trim())), ['2', '1', '1']);
        assert.deepEqual(await page.$$eval('.performance-task-description', els => els.map(el => el.textContent.trim())), [
          '2 performance goals still need your input',
          'Your annual self evaluation is waiting to be completed',
          'Review and confirm your performance summary'
        ]);
        assert.deepEqual(await page.$$eval('.performance-task-link', els => els.map(el => new URL(el.href).pathname.split('/').pop())),
          ['goal-plan.html', 'self-evaluation.html', 'self-review.html']);
        assert.ok(await page.$eval('.performance-task-list', el => el.scrollWidth <= el.clientWidth + 1), 'Outstanding task list fits on mobile');
        assert.ok(await page.$('.performance-latest-card'), 'Latest performance uses a summary card');
        assert.equal(await page.$('.performance-record-table'), null, 'Legacy details table removed');
        assert.equal(await page.$eval('.performance-latest-period', el => el.textContent.trim()), 'FY 2026A');
        assert.equal(await page.$eval('.performance-latest-grade strong', el => el.textContent.trim()), 'A');
        assert.deepEqual(await page.$$eval('.performance-latest-score strong', els => els.map(el => el.textContent.trim())), ['90.00', '88.00']);
        assert.equal(await page.$eval('#performanceAppraisalDetails', el => el.hidden), true, 'Appraisal details start collapsed');
        assert.equal(await page.$eval('#performanceAppraisalToggle', el => el.getAttribute('aria-expanded')), 'false');
        assert.equal(await page.$eval('#performanceAppraisalToggle span', el => el.textContent.trim()), 'View appraisal details');
        await page.click('#performanceAppraisalToggle');
        assert.equal(await page.$eval('#performanceAppraisalDetails', el => el.hidden), false, 'Appraisal details expand');
        assert.equal(await page.$eval('#performanceAppraisalToggle', el => el.getAttribute('aria-expanded')), 'true');
        assert.equal(await page.$eval('#performanceAppraisalToggle span', el => el.textContent.trim()), 'Hide appraisal details');
        assert.ok(await page.$eval('#performanceAppraisalDetails', el => el.textContent.includes('5.00%') && el.textContent.includes('1.50') && el.textContent.includes('Muhammad Ali Bin Man')));
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
          page.click('[data-option-id="goal-plan"]')
        ]);
        assert.ok(page.url().includes('/modules/performance/options/goal-plan.html'), 'Goal Plan opens its implemented page');
        assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), theme, 'Goal Plan preserves theme');
        await page.goto(url('modules/performance/index.html', `?scope=individual&theme=${theme}`), { waitUntil: 'domcontentloaded' });

        await page.focus('#performanceTabIndividual');
        await page.keyboard.press('ArrowRight');
        assert.equal(await page.$eval('#performanceTeamPanel', el => el.hidden), false, 'Keyboard switches scope');
        assert.equal(await page.$eval('#performanceIndividualPanel', el => el.hidden), true);
        assert.ok(page.url().includes('scope=team'));
        assert.deepEqual(await page.$$eval('#performanceTeamPanel .performance-option-title', els => els.map(el => el.textContent.trim())),
          ['Goal Summary', 'Performance Evaluation', 'Performance Highlight', 'Staff Incident', 'Incident Highlight', 'History']);
        await page.reload({ waitUntil: 'domcontentloaded' });
        assert.equal(await page.$eval('#performanceTabTeam', el => el.getAttribute('aria-selected')), 'true', 'Reload preserves team scope');
        assert.deepEqual(await page.$$eval('#performanceTeamPanel .performance-section-title', els => els.map(el => el.textContent.trim())),
          ['Quick Options', 'Need Attention']);
        assert.equal(await page.$('.performance-team-actions'), null, 'Team Action removed');
        assert.ok(await page.$('#performancePendingApproval.team-pending-approval-action'), 'Shared Pending Approval entry');
        assert.equal(await page.$eval('#performancePendingCount', el => el.textContent), '9');
        assert.deepEqual(await page.$$eval('.performance-score-range', els => els.map(el => el.textContent.trim())),
          ['80–100', '60–<80', '40–<60', '0–<40']);
        assert.deepEqual(await page.$$eval('.performance-score-count', els => els.map(el => el.textContent.trim())),
          ['3', '2', '0', '0']);
        assert.equal(await page.$('.performance-score-table tfoot'), null);
        assert.ok(await page.$eval('.performance-score-card', el => el.scrollWidth <= el.clientWidth + 1), 'Need Attention list fits on mobile');
        assert.ok(await page.evaluate(() => {
          const main = document.querySelector('.performance-content');
          return main.scrollWidth <= main.clientWidth + 1 && document.documentElement.scrollWidth <= innerWidth;
        }), `${theme} ${width}px has no horizontal overflow`);
        await page.screenshot({ path: path.join(__dirname, `performance-team-${theme}-${width}.png`) });
        await page.click('#performanceTabIndividual');
        await page.screenshot({ path: path.join(__dirname, `performance-individual-${theme}-${width}.png`) });
        await page.click(`[data-set-theme="${theme === 'light' ? 'dark' : 'light'}"]`);
        assert.ok((await page.$eval('#performanceBack', el => el.href)).endsWith(`app${theme === 'light' ? 'dark' : 'light'}.html`), 'Theme switch updates back link');
        await page.click('#performanceBack');
        await page.waitForFunction(() => !location.pathname.includes('/modules/'));
      }
    }
    await page.goto(url('modules/performance/index.html', '?scope=invalid&theme=dark'), { waitUntil: 'domcontentloaded' });
    assert.equal(await page.$eval('#performanceTabIndividual', el => el.getAttribute('aria-selected')), 'true', 'Invalid scope defaults to Individual');
    assert.deepEqual(errors, [], 'No browser JavaScript errors');
    console.log('PASS: Performance entry, team score groups, Pending Approval entry, themes, scope, keyboard, and 360/420px layouts.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
