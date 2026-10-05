const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
const url = pathToFileURL(path.resolve(__dirname, '../modules/claims/options/history.html')).href;

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const errors = [];
  try {
    const page = await browser.newPage();
    page.on('pageerror', error => errors.push(error.message));
    const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    for (const theme of ['light', 'dark']) {
      await page.setViewport({ width: 390, height: 900 });
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
      await page.evaluate(() => { for (let index = 0; index < 10; index++) initStandardFilterSummaries(); });
      await settle();
      const count = await page.$$eval('.claim-filter-bar .fa-sliders', nodes => nodes.length);
      if (count !== 1) await page.screenshot({ path: path.join(__dirname, 'claim_history_filter_duplicate_before.png') });
      assert.equal(count, 1, 'Repeated normalization must reuse the existing Claim History filter trigger');
      for (const tab of ['benefit', 'medical', 'ot', 'travel', 'travelRequest', 'entertainment', 'advance', 'expense']) {
        await page.evaluate(tab => switchClaimTab(tab), tab);
        await settle();
        assert.equal(await page.$$eval('.claim-filter-bar .fa-sliders', nodes => nodes.length), 1, `One filter trigger after switching to ${tab}`);
      }
      await page.evaluate(() => switchClaimTab('benefit'));
      await settle();
      for (const width of [360, 390, 600]) {
        await page.setViewport({ width, height: 900 });
        const layout = await page.$eval('.claim-filter-bar', card => ({
          overflow: card.scrollWidth - card.clientWidth,
          textWidth: card.querySelector('#currentFilterTextDisplay').getBoundingClientRect().width,
          triggerWidth: card.querySelector('.standard-filter-summary-trigger').getBoundingClientRect().width
        }));
        assert.ok(layout.overflow <= 1, `Filter stays inside the card at ${width}px`);
        assert.ok(layout.textWidth > 160, `Filter summary retains readable width at ${width}px`);
        assert.equal(layout.triggerWidth, 40);
      }
      await page.setViewport({ width: 390, height: 900 });
      await page.click('.claim-filter-bar .standard-filter-summary-trigger');
      assert.equal(await page.$eval('#filterModalOverlay', node => node.classList.contains('active')), true, 'Reused trigger still opens Data Filter');
      await page.evaluate(() => applyFilters());
      await settle();
      assert.equal(await page.$$eval('.claim-filter-bar .fa-sliders', nodes => nodes.length), 1);
      await page.screenshot({ path: path.join(__dirname, `claim_history_filter_fixed_${theme}.png`) });
    }
    // A summary without a legacy trigger must also stay stable after a trigger is generated.
    await page.evaluate(() => {
      const card = document.createElement('div');
      card.className = 'claim-filter-bar';
      card.id = 'fallbackFilterFixture';
      card.innerHTML = '<div><small>Current Filter</small><strong id="fixtureFilterSummary">All Employees</strong></div>';
      document.body.append(card);
      for (let index = 0; index < 10; index++) initStandardFilterSummaries(card);
    });
    await settle();
    assert.equal(await page.$$eval('#fallbackFilterFixture .fa-sliders', nodes => nodes.length), 1, 'Generated decorative trigger is reused');
    assert.equal(await page.$$eval('#fallbackFilterFixture .fa-filter', nodes => nodes.length), 1);
    assert.deepEqual(errors, []);
    console.log('PASS: Claim History filter remains stable across normalization, observer updates, eight categories, filter application, fallback triggers, both themes and three widths.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
