const assert = require('node:assert/strict');
const path = require('node:path');
const puppeteer = require('puppeteer');

const fileUrl = file => `file:///${path.resolve(__dirname, '..', file).replace(/\\/g, '/')}`;
async function screenshotAfterTransitions(page, file) {
  await page.mouse.move(0, 0);
  await page.evaluate(async () => {
    await Promise.all(document.getAnimations().filter(animation => animation.constructor.name === 'CSSTransition').map(animation => animation.finished.catch(() => {})));
  });
  await page.screenshot({ path: path.resolve(__dirname, file) });
}
const expected = {
  individual: [['Work Plan', 'work-plan.html'], ['Time Sheet', 'time-sheet.html']],
  team: [['Work Assignment', 'work-assignment.html'], ['Timesheet Highlight', 'timesheet-highlight.html']]
};

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const faults = [];
    page.on('pageerror', error => faults.push(error.message));
    for (const [theme, app] of [['dark', 'appdark.html'], ['light', 'applight.html']]) {
      await page.setViewport({ width: 390, height: 950 });
      await page.goto(fileUrl(app), { waitUntil: 'domcontentloaded' });
      await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.evaluate(() => {
        const row = [...document.querySelectorAll('.explore-row')].find(node => node.querySelector('h4')?.textContent.trim() === 'Project & Task');
        row.click();
      })]);
      await page.waitForFunction(() => location.pathname.endsWith('/modules/project-task/index.html'), { timeout: 2000 });
      assert.equal(await page.$eval('h1', node => node.textContent.trim()), 'Project & Task');
      assert.equal(await page.$eval('html', node => node.dataset.theme), theme);
      for (const scope of ['individual', 'team']) {
        await page.click(`#projectTab-${scope}`);
        assert.equal(await page.$eval(`#projectTab-${scope}`, node => node.getAttribute('aria-selected')), 'true');
        const visibleOptions = await page.$$eval('.project-option', nodes => nodes.filter(node => node.getClientRects().length).map(node => [node.querySelector('.project-option-title').textContent, new URL(node.href).pathname.split('/').pop()]));
        assert.deepEqual(visibleOptions, expected[scope]);
        assert.equal(await page.$$eval('.project-option p', nodes => nodes.length), 0);
        for (let index = 0; index < expected[scope].length; index++) {
          const [title, file] = expected[scope][index];
          await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.click(`#projectPanel-${scope} .project-option:nth-child(${index + 1})`)]);
          await page.waitForFunction(file => location.pathname.endsWith('/' + file), {}, file);
          assert.equal(await page.$eval('h1', node => node.textContent.trim()), title);
          assert.equal(await page.$eval('html', node => node.dataset.theme), theme);
          assert.equal(await page.$eval('.project-option-status', node => node.textContent.trim()), 'Coming soon');
          await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.click('.project-back')]);
          await page.waitForSelector(`#projectTab-${scope}[aria-selected="true"]`);
        }
      }
      await page.focus('#projectTab-team');
      await page.keyboard.press('ArrowLeft');
      assert.equal(await page.$eval('#projectTab-individual', node => node.getAttribute('aria-selected')), 'true');
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.$eval('#projectTab-team', node => node.getAttribute('aria-selected')), 'true');
      await page.reload({ waitUntil: 'domcontentloaded' });
      assert.equal(await page.$eval('#projectTab-team', node => node.getAttribute('aria-selected')), 'true');
      const otherTheme = theme === 'dark' ? 'light' : 'dark';
      await page.click(`[data-set-theme="${otherTheme}"]`);
      await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.click('#projectPanel-team .project-option')]);
      assert.equal(await page.$eval('html', node => node.dataset.theme), otherTheme);
      await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.click('.project-back')]);
      await page.reload({ waitUntil: 'domcontentloaded' });
      assert.equal(await page.$eval('html', node => node.dataset.theme), otherTheme);
      await page.click(`[data-set-theme="${theme}"]`);
      for (const width of [360, 390, 450]) {
        await page.setViewport({ width, height: 950 });
        assert.equal(await page.$eval('.phone-container', node => node.scrollWidth > node.clientWidth + 1), false);
        await screenshotAfterTransitions(page, `project_task_team_${theme}_${width}.png`);
      }
      await page.click('#projectTab-individual');
      await screenshotAfterTransitions(page, `project_task_individual_${theme}.png`);
      await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.click('.project-back')]);
      await page.waitForFunction(app => location.pathname.endsWith('/' + app), {}, app);
      console.log(`${theme}: home navigation, scope switching, four entries, back navigation, keyboard controls and mobile widths passed.`);
    }
    assert.deepEqual(faults, []);
    console.log('Project & Task module passed without browser script errors.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
