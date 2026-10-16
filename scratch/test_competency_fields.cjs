const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const base = pathToFileURL(path.resolve(__dirname, '../modules/performance/options/goal-plan.html')).href;

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--allow-file-access-from-files', '--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.goto(`${base}?theme=light&section=competencies`);
    await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.click('.goal-plan-card-update')]);

    const visibleLabels = await page.$$eval('.goal-form-field', fields => fields
      .filter(field => !field.hidden && getComputedStyle(field).display !== 'none')
      .map(field => field.querySelector('label')?.textContent.replace('*', '').trim()));
    assert.deepEqual(visibleLabels, ['Title', 'Weightage', 'Rating', 'Remark']);
    assert.equal(await page.$eval('#goalRatingInput', input => input.value), '4');

    await page.$eval('#goalRatingInput', input => { input.value = '4.5'; });
    await page.$eval('#goalForm', form => form.requestSubmit());
    await new Promise(resolve => setTimeout(resolve, 500));
    assert.match(page.url(), /goal-plan\.html/);
    await page.click('.goal-plan-item-toggle');
    assert.deepEqual(
      await page.$$eval('.goal-plan-card:first-child .goal-plan-item-field', rows => rows.map(row => [row.querySelector('dt').textContent, row.querySelector('dd').textContent])),
      [['Title', 'Leadership & People Management'], ['Weightage', '40%'], ['Rating', '4.5 / 5'], ['Remark', 'Supported team development through regular coaching and clear performance expectations.']]
    );
    console.log('PASS: Competency contains only Title, Weightage, Rating and Remark.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
