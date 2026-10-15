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
          ['Goal Plan', 'Goal Progress', 'Self Evaluation', 'Work Incident']);
        assert.equal(await page.$('.performance-status-card'), null, 'Document status is removed');
        assert.deepEqual(await page.$$eval('#performanceIndividualPanel .performance-section-title', els => els.map(el => el.textContent.trim())),
          ['Quick Options', 'Quick Action', 'Latest Performance Record Details']);
        assert.deepEqual(await page.$$eval('#performanceIndividualPanel .performance-action h3', els => els.map(el => el.textContent.trim())), ['Plan', 'Evaluation', 'Review']);
        assert.deepEqual(await page.$$eval('#performanceIndividualPanel .performance-action-count', els => els.map(el => el.textContent.trim())), ['2', '1', '1']);
        assert.ok(await page.$eval('#performanceIndividualPanel .performance-actions', el => el.scrollWidth <= el.clientWidth + 1), 'Stages fit on mobile');
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
          ['Quick Options', 'Need Attention', 'Team Action']);
        assert.deepEqual(await page.$$eval('#performanceTeamPanel .performance-action h3', els => els.map(el => el.textContent.trim())),
          ['Plan', 'Evaluation', 'Review']);
        assert.deepEqual(await page.$$eval('#performanceTeamPanel .performance-action-count', els => els.map(el => el.textContent.trim())),
          ['5', '4', '2']);
        assert.deepEqual(await page.$$eval('#performanceTeamPanel .performance-action-caption', els => els.map(el => el.textContent.trim())),
          ['employees', 'employees', 'employees']);
        assert.ok(await page.$eval('.performance-team-actions', el => el.scrollWidth <= el.clientWidth + 1), 'Team Action stages fit on mobile');
        assert.deepEqual(await page.$$eval('.performance-attention-panel-title', els => els.map(el => el.textContent.trim())),
          ['Lowest Performance', 'Top Performers']);
        assert.deepEqual(await page.$$eval('#performanceLowestList .performance-attention-name', els => els.map(el => el.textContent.trim())),
          ['Jason Tan', 'Farhan Rahmat', 'Nur Izzati', 'Daniel Wong', 'Aina Rahman']);
        assert.deepEqual(await page.$$eval('#performanceTopList .performance-attention-name', els => els.map(el => el.textContent.trim())),
          ['Aina Rahman', 'Daniel Wong', 'Nur Izzati', 'Farhan Rahmat', 'Jason Tan']);
        assert.deepEqual(await page.$$eval('#performanceLowestList .performance-attention-score', els => els.map(el => el.textContent.trim())),
          ['70.00', '72.00', '80.00', '85.00', '92.00']);
        assert.deepEqual(await page.$$eval('#performanceTopList .performance-attention-score', els => els.map(el => el.textContent.trim())),
          ['92.00', '85.00', '80.00', '72.00', '70.00']);
        const attentionColors = await page.$$eval('.performance-attention-panel', panels => panels.map(panel => ({
          border: getComputedStyle(panel).borderTopColor,
          icon: getComputedStyle(panel.querySelector('.performance-attention-heading-icon')).color,
          rank: getComputedStyle(panel.querySelector('.performance-attention-rank')).color,
          score: getComputedStyle(panel.querySelector('.performance-attention-score')).color
        })));
        const purple = theme === 'light' ? 'rgb(124, 58, 237)' : 'rgb(192, 132, 252)';
        assert.deepEqual(attentionColors.map(({ border, icon, rank }) => [border, icon, rank]),
          [[purple, purple, purple], [purple, purple, purple]], 'Both ranking panels use one purple structural accent');
        assert.deepEqual(attentionColors.map(({ score }) => score),
          ['rgb(245, 158, 11)', 'rgb(16, 185, 129)'], 'Lowest and top score text retain orange and green');
        assert.ok(await page.$$eval('.performance-attention-person', cards => cards.every(card => {
          const name = card.querySelector('.performance-attention-name');
          const employeeId = card.querySelector('.performance-attention-employee-id');
          return name && employeeId && name.nextElementSibling === employeeId && /^#EBB\d+$/.test(employeeId.textContent.trim());
        })), 'Employee IDs appear directly below names with a leading #');
        assert.ok(await page.$eval('.performance-attention-grid', el => el.scrollWidth <= el.clientWidth + 1), 'Need Attention columns fit on mobile');
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
    console.log('PASS: Performance entry, team Need Attention rankings, Team Action counts, themes, scope, keyboard, and 360/420px layouts.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
