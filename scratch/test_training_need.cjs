const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const url = (file, theme = 'dark') => pathToFileURL(path.join(root, 'modules/training-competency', file)).href + '?theme=' + theme;

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--allow-file-access-from-files', '--no-sandbox'] });
  try {
    const page = await browser.newPage();
    const click = async selector => {
      await page.$eval(selector, node => node.scrollIntoView({ block: 'center' }));
      await page.click(selector);
    };
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewport({ width: 360, height: 844 });
    await page.goto(url('index.html'), { waitUntil: 'domcontentloaded' });
    assert.equal(await page.$eval('[data-option-id="training-need"]', node => node.tagName), 'A', 'Training Need must open the form');
    await click('[data-option-id="training-need"]');
    await page.waitForSelector('#trainingNeedForm');
    await page.evaluate(() => localStorage.removeItem('peoplehcm.trainingNeed.draft.v1'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(await page.$eval('#needName', node => node.value), 'Farhan Binti Rahmat');
    assert.equal(await page.$$eval('.need-date-label', nodes => nodes.length), 0, 'Training Period does not show From or To labels');
    assert.deepEqual(await page.$$eval('.need-period input[type="date"]', nodes => nodes.map(node => node.getAttribute('aria-label'))), [
      'Training period start date',
      'Training period end date'
    ]);
    assert.doesNotMatch(await page.$eval('.need-period', node => node.innerText), /\b(?:From|To)\b/);
    await click('#needSubmit');
    assert.equal(await page.$eval('#trainingNeedForm', node => node.checkValidity()), false);
    await page.evaluate(() => {
      document.getElementById('needPeriodStart').value = '2026-10-01';
      document.getElementById('needPeriodEnd').value = '2026-12-31';
      document.getElementById('needCareerTarget').value = 'Lead the HR team';
      document.getElementById('needWeakness').value = 'Crisis response';
    });
    await click('#needSubmit');
    assert.match(await page.$eval('#needFormError', node => node.textContent), /at least one/);
    async function add(area, course, date, justification) {
      await click('#needAddItem');
      await page.select('#needDevelopmentArea', area);
      await page.select('#needCourse', course);
      await page.$eval('#needTargetDate', (node, value) => { node.value = value; }, date);
      await page.type('#needJustification', justification);
      await click('#needSaveItem');
    }
    await click('#needAddItem');
    await click('#needSaveItem');
    assert.equal(await page.$eval('#trainingNeedEntryForm', node => node.checkValidity()), false);
    await click('#needCancelItem');
    await add('Technology', 'microsoft', '2026-11-01', 'Improve digital reporting');
    await add('Leadership & Management', 'effective-crisis-management', '2026-11-15', 'Improve crisis response');
    assert.equal(await page.$$('.need-item').then(nodes => nodes.length), 2);
    await click('.need-item-toggle');
    assert.match(await page.$eval('.need-item-body', node => node.textContent), /Improve digital reporting/);
    await click('[data-action="edit"]');
    await page.$eval('#needJustification', node => { node.value = 'Updated reason <img src=x onerror=alert(1)>'; });
    await click('#needSaveItem');
    assert.equal(await page.$$('.need-item-body img').then(nodes => nodes.length), 0);
    await click('#needSaveDraft');
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(await page.$$('.need-item').then(nodes => nodes.length), 2);
    assert.equal(await page.$eval('#needCareerTarget', node => node.value), 'Lead the HR team');
    await click('#needAddItem');
    await page.type('#needJustification', 'Discard this');
    await click('#needCancelItem');
    assert.equal(await page.$$('.need-item').then(nodes => nodes.length), 2);
    await click('[data-action="delete"]');
    assert.equal(await page.$$('.need-item').then(nodes => nodes.length), 1);
    await page.$eval('#needPeriodEnd', node => { node.value = '2026-09-01'; });
    await click('#needSubmit');
    assert.equal(await page.$eval('#needPeriodEnd', node => node.validity.customError), true);
    await page.$eval('#needPeriodEnd', node => { node.value = '2026-11-01'; });
    await page.$eval('#needSubmit', node => node.scrollIntoView({ block: 'center' }));
    await click('#needSubmit');
    assert.match(await page.$eval('#needFormError', node => node.textContent), /within the Training Period/);
    await page.$eval('#needPeriodEnd', node => { node.value = '2026-12-31'; });
    for (const theme of ['dark', 'light']) {
      for (const width of [360, 420]) {
        await page.setViewport({ width, height: 900 });
        await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
        assert.equal(await page.$eval('.main-content', node => node.scrollWidth <= node.clientWidth + 1), true, `${theme} ${width}: no overflow`);
        await page.screenshot({ path: path.join(__dirname, `training-need-${theme}-${width}.png`) });
        await click('#needAddItem');
        await page.screenshot({ path: path.join(__dirname, `training-need-entry-${theme}-${width}.png`) });
        await click('#needCancelItem');
      }
    }
    await click('#needSubmit');
    await page.waitForFunction(() => location.pathname.endsWith('/training-competency/index.html'));
    const stored = await page.evaluate(() => ({ draft: localStorage.getItem('peoplehcm.trainingNeed.draft.v1'), submissions: JSON.parse(localStorage.getItem('peoplehcm.trainingNeed.submissions.v1')) }));
    assert.equal(stored.draft, null);
    assert.equal(stored.submissions.at(-1).details.length, 1);
    assert.equal(stored.submissions.at(-1).status, 'Submitted');
    await page.goto(url('options/training-need.html', 'light'), { waitUntil: 'domcontentloaded' });
    assert.equal(await page.$eval('#needCareerTarget', node => node.value), '');
    await page.type('#needCareerTarget', 'Unsaved change');
    await click('#needCancel');
    await page.waitForFunction(() => location.pathname.endsWith('/training-competency/index.html'));
    assert.equal(await page.evaluate(() => localStorage.getItem('peoplehcm.trainingNeed.draft.v1')), null);
    assert.match(page.url(), /theme=light/);
    assert.deepEqual(errors, []);
    console.log('PASS: Training Need navigation, validation, multiple details, edit/delete/cancel, draft restore, submit, themes and mobile layouts');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
