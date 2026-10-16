const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const goalPlanUrl = pathToFileURL(path.resolve(__dirname, '../modules/performance/options/goal-plan.html')).href;
const goalFormUrl = pathToFileURL(path.resolve(__dirname, '../modules/performance/options/performance-goal.html')).href;

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--allow-file-access-from-files', '--no-sandbox']
  });
  try {
    const page = await browser.newPage();
    await page.goto(`${goalPlanUrl}?theme=light&section=competencies`);

    assert.equal(await page.$eval('#goalPlanAdd', element => element.hidden), true, 'Competency cannot be added');
    assert.equal(await page.$$eval('.goal-plan-card-delete', elements => elements.length), 0, 'Competency cannot be deleted');
    assert.equal(await page.$$eval('.goal-plan-card-update', elements => elements.length), 3, 'Every competency remains editable');

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.click('.goal-plan-card-update')
    ]);
    assert.match(await page.$eval('#performanceGoalTitle', element => element.textContent), /Edit Competency/);

    await page.goto(`${goalFormUrl}?theme=light&kind=competency`);
    await page.waitForFunction(() => location.pathname.endsWith('/goal-plan.html'));
    assert.equal(new URL(page.url()).searchParams.get('section'), 'competencies', 'Direct competency add redirects to its list');

    console.log('PASS: Competencies can only be edited.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
