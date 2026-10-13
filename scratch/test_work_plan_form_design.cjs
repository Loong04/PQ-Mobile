const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
const formUrl = pathToFileURL(path.resolve(__dirname, '../modules/project-task/options/work-plan.html')).href;

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files', '--no-sandbox'] });
  const errors = [];
  try {
    const page = await browser.newPage();
    page.on('pageerror', error => errors.push(error.message));
    for (const theme of ['light', 'dark']) {
      for (const width of [360, 420]) {
        await page.setViewport({ width, height: 844 });
        await page.goto(formUrl + '?theme=' + theme, { waitUntil: 'domcontentloaded' });
        assert.ok(await page.$('label[for="workPlanScheduleFrom"]'), 'Scheduled start date has a visible label');
        assert.ok(await page.$('label[for="workPlanScheduleTo"]'), 'Scheduled end date has a visible label');
        await page.click('label[for="workPlanScheduleFrom"]');
        assert.equal(await page.evaluate(() => document.activeElement.id), 'workPlanScheduleFrom', 'Date label focuses its field');
        assert.ok(await page.evaluate(() => {
          const main = document.querySelector('.project-task-content');
          return main.scrollWidth <= main.clientWidth + 1;
        }), 'Form does not overflow horizontally');
        await page.$eval('.project-task-content', el => { el.scrollTop = 0; });
        await page.screenshot({ path: path.join(__dirname, `work-plan-form-${theme}-${width}-top.png`) });
        await page.$eval('.project-task-content', el => { el.scrollTop = el.scrollHeight; });
        await page.screenshot({ path: path.join(__dirname, `work-plan-form-${theme}-${width}-bottom.png`) });
        const cancelUrl = await page.$eval('[data-work-plan-back].form-cancel-btn', el => el.href);
        assert.ok(cancelUrl.includes('scope=individual') && cancelUrl.includes('theme=' + theme), 'Cancel returns to Individual with current theme');
        const next = theme === 'light' ? 'dark' : 'light';
        await page.click(`[data-set-theme="${next}"]`);
        await page.waitForFunction(expected => document.querySelector('.project-back').href.includes('theme=' + expected), {}, next);
        await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.click('.form-cancel-btn')]);
        assert.ok(page.url().includes('/project-task/index.html') && page.url().includes('theme=' + next));
      }
    }
    assert.deepEqual(errors, []);
    console.log('PASS: Work Plan visible date labels, form layout and theme-preserving cancel at 360/420px.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
