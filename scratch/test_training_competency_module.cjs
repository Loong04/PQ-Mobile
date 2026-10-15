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
      ['index.html', 'options/competency.html', 'options/course-catalog.html', 'options/learning-development-edit.html', 'options/learning-development-plan.html', 'options/learning-development-update.html', 'options/training-clocking.html', 'options/training-need.html', 'options/training-plan.html'],
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
    assert.equal(await page.$$eval('[data-option-id][href]', nodes => nodes.length), 6, 'Implemented individual options link to destination pages');
    assert.equal(await page.$$eval('button[data-option-id]', nodes => nodes.length), 8, 'The remaining options stay as coming-soon buttons');
    assert.equal(await page.$eval('[data-option-id="competency"]', node => node.getAttribute('href')), 'options/competency.html?theme=dark');
    assert.equal(await page.$eval('[data-option-id="course-catalog"]', node => node.getAttribute('href')), 'options/course-catalog.html?theme=dark');
    assert.equal(await page.$eval('[data-option-id="learning-development-plan"]', node => node.getAttribute('href')), 'options/learning-development-plan.html?theme=dark');
    assert.equal(await page.$eval('[data-option-id="training-plan"]', node => node.getAttribute('href')), 'options/training-plan.html?theme=dark');
    assert.equal(await page.$eval('[data-option-id="training-clocking"]', node => node.getAttribute('href')), 'options/training-clocking.html?theme=dark');
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

    await page.click('[data-option-id="training-highlight"]');
    assert.deepEqual(await page.$eval('#appToast', node => ({ text: node.textContent.trim(), visible: node.classList.contains('show') })), {
      text: 'Training Highlight is coming soon',
      visible: true
    });

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
    }

    await open(page, moduleUrl('?scope=team&theme=dark'));
    await page.evaluate(() => { document.documentElement.dataset.theme = 'light'; });
    await page.waitForFunction(() => document.getElementById('trainingCompetencyBack').getAttribute('href') === '../../applight.html');
    assert.equal(await page.$eval('#trainingCompetencyBack', node => node.getAttribute('href')), '../../applight.html', 'Theme changes synchronize the back link');

    for (const width of [360, 420]) {
      await page.setViewport({ width, height: 844, deviceScaleFactor: 1 });
      for (const scope of ['individual', 'team']) {
        await open(page, moduleUrl(`?scope=${scope}&theme=light`));
        const layout = await page.evaluate(activeScope => {
          const options = document.querySelector(`#trainingCompetency${activeScope === 'team' ? 'Team' : 'Individual'}Options`);
          return {
            overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            columns: getComputedStyle(options).gridTemplateColumns.split(' ').length
          };
        }, scope);
        assert.ok(layout.overflow <= 1, `${scope} has no horizontal overflow at ${width}px`);
        assert.equal(layout.columns, 3, `${scope} keeps three option columns at ${width}px`);
      }
    }

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
