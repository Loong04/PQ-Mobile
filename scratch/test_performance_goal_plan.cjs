const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const pageUrl = (theme) => pathToFileURL(path.join(root, 'modules/performance/options/goal-plan.html')).href + `?theme=${theme}`;

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
    page.on('pageerror', error => errors.push(error.message));

    for (const theme of ['dark', 'light']) {
      for (const width of [360, 420]) {
        await page.setViewport({ width, height: 844 });
        await page.goto(pageUrl(theme), { waitUntil: 'domcontentloaded' });
        assert.equal(await page.$eval('#goalPlanTitle', node => node.textContent.trim()), 'Goal Plan');
        assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), theme);
        assert.deepEqual(await page.$eval('.goal-plan-employee-identity', node => [...node.children].map(child => child.textContent.trim())), ['Farhan Binti Rahmat', '#EBB12']);
        assert.deepEqual(await page.$$eval('#goalPlanCards .goal-plan-card', cards => cards.map(card => ({
          title: card.querySelector('.goal-plan-card-title').textContent.trim(),
          hasHeader: Boolean(card.querySelector('.goal-plan-card-header')),
          hasBody: Boolean(card.querySelector('.goal-plan-card-body'))
        }))), [
          { title: 'Reduce Staff Attrition', hasHeader: true, hasBody: true },
          { title: 'Improve Staff Satisfaction', hasHeader: true, hasBody: true }
        ]);
        assert.equal(await page.$eval('#goalPlanTotalGoals', node => node.textContent.trim()), '2');
        assert.equal(await page.$eval('#goalPlanTotalWeightage', node => node.textContent.trim()), '100.00%');
        assert.ok(await page.evaluate(() => {
          const main = document.querySelector('.goal-plan-content');
          return main.scrollWidth <= main.clientWidth + 1 && document.documentElement.scrollWidth <= innerWidth;
        }), `${theme} ${width}px has no horizontal overflow`);
        await page.screenshot({ path: path.join(__dirname, `performance-goal-plan-${theme}-${width}.png`) });
      }
    }

    await page.setViewport({ width: 420, height: 844 });
    await page.goto(pageUrl('dark'), { waitUntil: 'domcontentloaded' });
    await page.click('#goalPlanCards .goal-plan-card-body');
    assert.equal(await page.$eval('#goalDetailsOverlay', node => node.hidden), false, 'Card opens goal details');
    assert.equal(await page.$eval('#goalDetailsRows tr:first-child td', node => node.textContent.trim()), 'Reduce Staff Attrition');
    await page.click('#goalDetailsClose');

    await page.click('#goalPlanAdd');
    assert.equal(await page.$eval('#goalFormTitle', node => node.textContent.trim()), 'Add Performance Goal');
    assert.deepEqual(await page.$$eval('#goalForm .goal-form-field > label', nodes => nodes.map(node => node.textContent.replace('*', '').trim())), [
      'Goal Title', 'Goal Type', 'Goal Description', 'Target Description', 'Deadline', 'Weightage', 'Budget Hours', 'Remark'
    ]);
    await page.click('#goalFormSave');
    assert.equal(await page.$eval('#goalFormError', node => node.textContent.trim()), 'Goal Title is required.');

    await setField(page, '#goalTitleInput', 'Strengthen Succession Readiness');
    await setField(page, '#goalTypeInput', 'Learning & Growth');
    await setField(page, '#goalDescriptionInput', 'Build a ready-now successor pool for critical HR roles.');
    await setField(page, '#goalTargetInput', 'Base Target: 85%\nStretch Target: 95%');
    await setField(page, '#goalDeadlineInput', '2026-12-31');
    await setField(page, '#goalWeightageInput', '10');
    await setField(page, '#goalBudgetHoursInput', '24');
    await setField(page, '#goalRemarkInput', 'Quarterly talent review.');
    await page.click('#goalFormSave');
    assert.equal(await page.$$eval('#goalPlanCards .goal-plan-card', cards => cards.length), 3, 'Add creates a goal card');
    assert.equal(await page.$eval('#goalPlanTotalWeightage', node => node.textContent.trim()), '110.00%');

    await page.click('#goalPlanCards .goal-plan-card:last-child .goal-plan-card-menu');
    await page.click('#goalActionEdit');
    assert.equal(await page.$eval('#goalTitleInput', node => node.value), 'Strengthen Succession Readiness');
    await setField(page, '#goalTitleInput', 'Strengthen Leadership Pipeline');
    await page.click('#goalFormSave');
    assert.equal(await page.$eval('#goalPlanCards .goal-plan-card:last-child .goal-plan-card-title', node => node.textContent.trim()), 'Strengthen Leadership Pipeline', 'Update changes the card');

    await page.click('#goalPlanCards .goal-plan-card:last-child .goal-plan-card-menu');
    await page.click('#goalActionDelete');
    await page.click('#goalDeleteConfirm');
    assert.equal(await page.$$eval('#goalPlanCards .goal-plan-card', cards => cards.length), 2, 'Delete removes the goal');
    assert.equal(await page.$eval('#goalPlanTotalWeightage', node => node.textContent.trim()), '100.00%');

    await page.click('#goalPlanSaveDraft');
    assert.ok(await page.$eval('#goalPlanToast', node => node.classList.contains('show') && node.textContent.includes('draft')));
    await page.click('#goalPlanSubmit');
    assert.equal(await page.$eval('#goalPlanStatus', node => node.textContent.trim()), 'Submitted');
    assert.ok(await page.$eval('#goalPlanToast', node => node.classList.contains('show') && node.textContent.includes('submitted')));

    assert.deepEqual(errors, [], 'No browser JavaScript errors');
    console.log('PASS: Goal Plan cards, employee ID, details, CRUD, draft, submit, themes and responsive layouts.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
