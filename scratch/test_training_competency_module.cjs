const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const modulePath = path.join(root, 'modules/training-competency/index.html');
const moduleUrl = (query = '') => `${pathToFileURL(modulePath).href}${query}`;
const appUrl = theme => pathToFileURL(path.join(root, `app${theme}.html`)).href;

function collectHtmlFiles(directory, currentDirectory = directory) {
  return fs.readdirSync(currentDirectory, { withFileTypes: true }).flatMap(entry => {
    const entryPath = path.join(currentDirectory, entry.name);
    if (entry.isDirectory()) return collectHtmlFiles(directory, entryPath);
    return entry.name.endsWith('.html') ? [path.relative(directory, entryPath).replace(/\\/g, '/')] : [];
  });
}

async function readScopeState(page) {
  return page.evaluate(() => {
    const individual = document.getElementById('trainingCompetencyTabIndividual');
    const team = document.getElementById('trainingCompetencyTabTeam');
    return {
      activeElement: document.activeElement.id,
      scope: new URLSearchParams(location.search).get('scope'),
      individualSelected: individual.getAttribute('aria-selected'),
      teamSelected: team.getAttribute('aria-selected'),
      individualTabIndex: individual.tabIndex,
      teamTabIndex: team.tabIndex,
      individualActive: individual.classList.contains('active'),
      teamActive: team.classList.contains('active'),
      individualHidden: document.getElementById('trainingCompetencyIndividualPanel').hidden,
      teamHidden: document.getElementById('trainingCompetencyTeamPanel').hidden
    };
  });
}

async function open(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--allow-file-access-from-files', '--no-sandbox']
  });
  const pageErrors = [];

  try {
    const page = await browser.newPage();
    page.on('pageerror', error => pageErrors.push(error.message));

    assert.deepEqual(
      collectHtmlFiles(path.dirname(modulePath)).sort(),
      ['index.html', 'options/competency.html', 'options/course-catalog.html', 'options/learning-development-edit.html', 'options/learning-development-plan.html', 'options/learning-development-update.html', 'options/staff-learning-development-plan.html', 'options/staff-learning-development-update.html', 'options/staff-learning-development-edit.html', 'options/staff-competency.html', 'options/staff-competency-employee.html', 'options/staff-competency-assess.html', 'options/staff-tna.html', 'options/training-calendar.html', 'options/training-request-details.html', 'options/training-clocking.html', 'options/training-feedback-form.html', 'options/training-feedback.html', 'options/training-highlight.html', 'options/training-need.html', 'options/training-plan.html', 'options/competency-summary.html', 'options/competency-summary-levels.html', 'options/competency-summary-employees.html', 'options/competency-summary-employee.html', 'options/skill-expiry.html', 'options/skill-expiry-levels.html', 'options/skill-expiry-employees.html'].sort(),
      'Implemented Training and Competency destination pages exist'
    );

    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await open(page, moduleUrl('?scope=unknown&theme=dark'));

    assert.equal(await page.$eval('h1', node => node.textContent.trim()), 'Training & Competency');
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark');
    assert.deepEqual(await page.evaluate(() => ({
      individualSelected: document.getElementById('trainingCompetencyTabIndividual').getAttribute('aria-selected'),
      teamSelected: document.getElementById('trainingCompetencyTabTeam').getAttribute('aria-selected'),
      individualTabIndex: document.getElementById('trainingCompetencyTabIndividual').tabIndex,
      teamTabIndex: document.getElementById('trainingCompetencyTabTeam').tabIndex,
      individualActive: document.getElementById('trainingCompetencyTabIndividual').classList.contains('active'),
      teamActive: document.getElementById('trainingCompetencyTabTeam').classList.contains('active'),
      individualHidden: document.getElementById('trainingCompetencyIndividualPanel').hidden,
      teamHidden: document.getElementById('trainingCompetencyTeamPanel').hidden
    })), {
      individualSelected: 'true',
      teamSelected: 'false',
      individualTabIndex: 0,
      teamTabIndex: -1,
      individualActive: true,
      teamActive: false,
      individualHidden: false,
      teamHidden: true
    }, 'Invalid scope falls back to Individual with synchronized ARIA state');

    assert.deepEqual(await page.$$eval('#trainingCompetencyIndividualOptions [data-option-id]', nodes => nodes.map(node => node.textContent.trim())), [
      'Competency',
      'Course Catalog',
      'Training Need',
      'L&D Plan',
      'Training Plan',
      'Training Calendar',
      'Training Clocking',
      'Training Feedback'
    ]);
    assert.deepEqual(await page.$$eval('#trainingCompetencyTeamOptions [data-option-id]', nodes => nodes.map(node => node.textContent.trim())), [
      'Staff Competency',
      'Competency Summary',
      'Skill Expiry',
      'Staff TNA',
      'Staff L&D Plan',
      'Training Highlight'
    ]);
    assert.equal(await page.$$eval('[data-option-id]', nodes => nodes.length), 14);
    assert.equal(await page.$$eval('[data-option-id][href]', nodes => nodes.length), 14, 'Implemented individual and team options link to destination pages');
    assert.equal(await page.$$eval('button[data-option-id]', nodes => nodes.length), 0, 'Every Training and Competency option links to an implemented page');
    assert.equal(await page.$eval('[data-option-id="competency"]', node => node.getAttribute('href')), 'options/competency.html?theme=dark');
    assert.equal(await page.$eval('[data-option-id="course-catalog"]', node => node.getAttribute('href')), 'options/course-catalog.html?theme=dark');
    assert.equal(await page.$eval('[data-option-id="learning-development-plan"]', node => node.getAttribute('href')), 'options/learning-development-plan.html?theme=dark');
    assert.equal(await page.$eval('[data-option-id="training-plan"]', node => node.getAttribute('href')), 'options/training-plan.html?theme=dark');
    assert.equal(await page.$eval('[data-option-id="training-calendar"]', node => node.getAttribute('href')), 'options/training-calendar.html?theme=dark');
    assert.equal(await page.$eval('[data-option-id="training-clocking"]', node => node.getAttribute('href')), 'options/training-clocking.html?theme=dark');
    assert.equal(await page.$eval('[data-option-id="training-feedback"]', node => node.getAttribute('href')), 'options/training-feedback.html?theme=dark');
    assert.equal(await page.$eval('[data-option-id="staff-competency"]', node => node.getAttribute('href')), 'options/staff-competency.html?theme=dark');
    assert.equal(await page.$eval('[data-option-id="competency-summary"]', node => node.getAttribute('href')), 'options/competency-summary.html?theme=dark');
    assert.equal(await page.$eval('[data-option-id="skill-expiry"]', node => node.getAttribute('href')), 'options/skill-expiry.html?theme=dark');
    assert.equal(await page.$eval('[data-option-id="staff-tna"]', node => node.getAttribute('href')), 'options/staff-tna.html?theme=dark');
    assert.equal(await page.$eval('[data-option-id="staff-learning-development-plan"]', node => node.getAttribute('href')), 'options/staff-learning-development-plan.html?theme=dark');
    assert.deepEqual(await page.$$eval('[data-status]', nodes => nodes.map(node => ({
      status: node.dataset.status,
      count: node.querySelector('strong').textContent.trim(),
      label: node.querySelector('span').textContent.trim()
    }))), [
      { status: 'submitted', count: '—', label: 'Submitted' },
      { status: 'resubmit', count: '—', label: 'Resubmit' },
      { status: 'approved', count: '—', label: 'Approved' },
      { status: 'rejected', count: '—', label: 'Rejected' }
    ]);

    await page.click('[data-option-id="training-need"]');
    await page.waitForSelector('#trainingNeedForm');
    assert.match(page.url(), /options\/training-need\.html\?theme=dark$/);
    await page.click('#needCancel');
    await page.waitForSelector('#trainingCompetencyTabIndividual');
    await page.click('[data-status="submitted"]');
    assert.deepEqual(await page.$eval('#appToast', node => ({ text: node.textContent.trim(), visible: node.classList.contains('show') })), {
      text: 'Training history is coming soon',
      visible: true
    });

    await page.focus('#trainingCompetencyTabIndividual');
    await page.keyboard.press('ArrowRight');
    assert.deepEqual(await readScopeState(page), {
      activeElement: 'trainingCompetencyTabTeam',
      scope: 'team',
      individualSelected: 'false',
      teamSelected: 'true',
      individualTabIndex: -1,
      teamTabIndex: 0,
      individualActive: false,
      teamActive: true,
      individualHidden: true,
      teamHidden: false
    }, 'Arrow navigation updates focus, URL, panels, and ARIA state together');

    assert.equal(await page.$('[data-view-all="trainingCompetencyTeamOptions"]'), null, 'Team shows its six options directly');
    await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.click('[data-option-id="training-highlight"]')]);
    assert.equal(await page.$eval('#trainingHighlightTitle', node => node.textContent), 'Training Highlight');
    await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.click('#trainingHighlightBack')]);

    await page.focus('#trainingCompetencyTabTeam');
    await page.keyboard.press('ArrowLeft');
    assert.equal((await readScopeState(page)).scope, 'individual');
    assert.equal((await readScopeState(page)).activeElement, 'trainingCompetencyTabIndividual');
    await page.keyboard.press('End');
    assert.equal((await readScopeState(page)).scope, 'team');
    assert.equal((await readScopeState(page)).activeElement, 'trainingCompetencyTabTeam');
    await page.keyboard.press('Home');
    assert.equal((await readScopeState(page)).scope, 'individual');
    assert.equal((await readScopeState(page)).activeElement, 'trainingCompetencyTabIndividual');
    await page.click('#trainingCompetencyTabTeam');
    assert.equal((await readScopeState(page)).scope, 'team', 'Mouse selection updates the active scope');
    assert.equal((await readScopeState(page)).teamActive, true, 'Mouse selection updates the active class');

    for (const theme of ['dark', 'light']) {
      await open(page, moduleUrl(`?scope=team&theme=${theme}`));
      assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), theme);
      assert.equal(await page.$eval('#trainingCompetencyTeamPanel', node => node.hidden), false);
      assert.equal(await page.$eval('#trainingCompetencyBack', node => node.getAttribute('href')), `../../app${theme}.html`);
      assert.equal(await page.$eval('[data-option-id="competency"]', node => node.getAttribute('href')), `options/competency.html?theme=${theme}`);
      assert.equal(await page.$eval('[data-option-id="course-catalog"]', node => node.getAttribute('href')), 'options/course-catalog.html?theme=' + theme);
      assert.equal(await page.$eval('[data-option-id="training-clocking"]', node => node.getAttribute('href')), 'options/training-clocking.html?theme=' + theme);
      assert.equal(await page.$eval('[data-option-id="training-feedback"]', node => node.getAttribute('href')), 'options/training-feedback.html?theme=' + theme);
      assert.equal(await page.$eval('[data-option-id="staff-tna"]', node => node.getAttribute('href')), 'options/staff-tna.html?theme=' + theme);
    }

    await open(page, moduleUrl('?scope=team&theme=dark'));
    await page.evaluate(() => { document.documentElement.dataset.theme = 'light'; });
    await page.waitForFunction(() => document.getElementById('trainingCompetencyBack').getAttribute('href') === '../../applight.html');
    assert.equal(await page.$eval('#trainingCompetencyBack', node => node.getAttribute('href')), '../../applight.html', 'Theme changes synchronize the back link');

    for (const theme of ['dark', 'light']) for (const width of [360, 420]) {
      await page.setViewport({ width, height: 844, deviceScaleFactor: 1 });
      for (const scope of ['individual', 'team']) {
        await open(page, moduleUrl(`?scope=${scope}&theme=${theme}`));
        const layout = await page.evaluate(activeScope => {
          const options = document.querySelector(`#trainingCompetency${activeScope === 'team' ? 'Team' : 'Individual'}Options`);
          return {
            overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            columns: getComputedStyle(options).gridTemplateColumns.split(' ').length,
            visibleItems: [...options.children].filter(item => item.getClientRects().length).length,
            rows: new Set([...options.children].filter(item => item.getClientRects().length).map(item => Math.round(item.getBoundingClientRect().top))).size
          };
        }, scope);
        assert.ok(layout.overflow <= 1, `${scope} has no horizontal overflow at ${width}px`);
        assert.equal(layout.columns, 3, `${scope} keeps three option columns at ${width}px`);
        assert.equal(layout.visibleItems, 6, scope === 'team' ? 'Team shows all six options directly' : 'Individual shows five options and View All');
        assert.equal(layout.rows, 2, `${scope} shows exactly two option rows`);
        const trigger = `[data-view-all="trainingCompetency${scope === 'team' ? 'Team' : 'Individual'}Options"]`;
        await page.screenshot({ path: path.join(__dirname, `training-quick-options-${scope}-${theme}-${width}.png`) });
        if (scope === 'team') {
          assert.equal(await page.$(trigger), null, 'Team does not need View All');
          assert.ok(await page.$eval('[data-option-id="training-highlight"]', node => node.getClientRects().length > 0), 'Training Highlight is directly visible');
          continue;
        }
        await page.click(trigger);
        assert.equal(await page.$eval('#trainingCompetencyOptionsOverlay', node => node.hidden), false);
        assert.equal(await page.$$eval('#trainingCompetencyAllOptions [data-option-ref]', nodes => nodes.length), scope === 'team' ? 6 : 8);
        assert.equal(await page.$eval('main', node => node.inert), true);
        assert.ok(await page.$$eval('#trainingCompetencyAllOptions a', (nodes, expectedTheme) => nodes.every(node => node.href.includes('theme=' + expectedTheme)), theme));
        await page.keyboard.down('Shift');
        await page.keyboard.press('Tab');
        await page.keyboard.up('Shift');
        assert.equal(await page.evaluate(() => document.getElementById('trainingCompetencyOptionsOverlay').contains(document.activeElement)), true, 'Focus stays in All Quick Options');
        await page.screenshot({ path: path.join(__dirname, `training-all-options-${scope}-${theme}-${width}.png`) });
        await page.keyboard.press('Escape');
        assert.equal(await page.$eval('#trainingCompetencyOptionsOverlay', node => node.hidden), true);
        assert.equal(await page.$eval('main', node => node.inert), false);
        assert.equal(await page.$eval(trigger, node => document.activeElement === node), true);
      }
    }

    await open(page, moduleUrl('?scope=individual&theme=light'));
    await page.click('[data-view-all="trainingCompetencyIndividualOptions"]');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.click('[data-option-ref="training-clocking"]')
    ]);
    assert.match(page.url(), /training-clocking\.html\?theme=light$/);

    const launchCases = [
      { theme: 'dark', activation: 'mouse' },
      { theme: 'dark', activation: 'Enter' },
      { theme: 'light', activation: 'Space' }
    ];
    for (const { theme, activation } of launchCases) {
      await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
      await open(page, appUrl(theme));
      const launcher = await page.$('[data-module="training-competency"]');
      assert.ok(launcher, `${theme} app launcher exposes Training & Competency`);
      if (activation === 'mouse') {
        await launcher.evaluate(node => node.scrollIntoView({ block: 'center' }));
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
          launcher.click()
        ]);
      } else {
        await launcher.focus();
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
          page.keyboard.press(activation)
        ]);
      }
      assert.ok(
        new URL(page.url()).pathname.replace(/\\/g, '/').endsWith('/modules/training-competency/index.html'),
        `Expected Training & Competency module path, received ${page.url()}`
      );
      assert.equal(new URL(page.url()).searchParams.get('scope'), 'individual');
      assert.equal(new URL(page.url()).searchParams.get('theme'), theme);
    }

    assert.deepEqual(pageErrors, [], `Pages should have no JavaScript errors: ${pageErrors.join('; ')}`);
    console.log('PASS: Training & Competency hub content, scopes, themes, routing and responsive layout.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
