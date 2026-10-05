const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const index = pathToFileURL(path.resolve(__dirname, '../modules/payroll/index.html')).href;
const history = pathToFileURL(path.resolve(__dirname, '../modules/payroll/options/history.html')).href;

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setRequestInterception(true);
    page.on('request', request => /^(file:|data:|blob:)/.test(request.url()) ? request.continue() : request.abort());
    for (const theme of ['dark', 'light']) {
      await page.setViewport({ width: theme === 'dark' ? 360 : 390, height: 950 });
      for (const status of ['submitted', 'approved', 'rejected']) {
        await page.goto(index + '?theme=' + theme, { waitUntil: 'load' });
        assert.equal(await page.$eval('#myWorkStatusTitle', node => node.textContent.trim()), 'MY DOCUMENT STATUS');
        assert.equal(await page.$('.request-overview-head p'), null);
        assert.equal(await page.$('.request-overview-head button'), null);
        assert.equal(await page.$('.request-overview-card p'), null);
        assert.equal(await page.$('.request-overview-card button'), null);
        const card = status === 'submitted' ? '.request-metric:not(.approved):not(.rejected)' : `.request-metric.${status}`;
        const clickTarget = status === 'submitted' ? `${card} strong` : status === 'approved' ? `${card} span` : `${card} small`;
        if (theme === 'light') {
          await page.focus(card);
          await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.keyboard.press('Enter')]);
        } else {
          await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.click(clickTarget)]);
        }
        assert.equal(new URL(page.url()).pathname, new URL(history).pathname);
        assert.equal(new URL(page.url()).searchParams.has('status'), false);
        assert.equal(await page.$eval('html', node => node.dataset.theme), theme);
        await page.waitForFunction(() => document.querySelector('#payrollHistoryList').getAttribute('aria-busy') === 'false');
        for (const category of ['tax', 'deduction']) {
          await page.click(`[data-history-kind="${category}"]`);
          const expected = await page.evaluate(category => window.PAYROLL_HISTORY_DATA[category].map(record => record.id), category);
          assert.deepEqual(await page.$$eval('.history-card-item', cards => cards.map(card => card.dataset.reference)), expected);
          await page.click('#historyFilterTrigger');
          assert.equal(await page.$eval('#historyStatus', node => node.value), 'all');
          assert.equal(await page.$eval('#historyStatusField', node => node.hidden), category === 'deduction');
          await page.click('#applyHistoryFilter');
          assert.deepEqual(await page.$$eval('.history-card-item', cards => cards.map(card => card.dataset.reference)), expected);
        }
        await page.click('#historyFilterTrigger');
        await page.click('#resetHistoryFilter');
        await page.click('#applyHistoryFilter');
        assert.ok(await page.$$eval('.history-card-item', cards => cards.length > 0));
        console.log(`PASS ${theme}: ${status} opens ordinary History with all statuses, mouse/keyboard and reset`);
      }
    }
    await page.goto(history + '?status=approved', { waitUntil: 'load' });
    await page.click('#historyFilterTrigger');
    assert.equal(await page.$eval('#historyStatus', node => node.value), 'all');
    await page.keyboard.press('Escape');
    await page.click('[data-history-kind="deduction"]');
    await page.click('#historyFilterTrigger');
    assert.equal(await page.$eval('#historyStatusField', node => node.hidden), true);
    assert.deepEqual(errors, []);
    console.log('PASS History ignores status URL parameters and retains ordinary filters');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
