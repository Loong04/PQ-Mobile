const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const puppeteer = require('puppeteer');

(async () => {
  const original = execFileSync('git', ['show', 'HEAD:leave.html'], { encoding: 'utf8', maxBuffer: 4e6 });
  const browser = await puppeteer.launch({ headless: true, protocolTimeout: 30000 });
  try {
    const leave = await browser.newPage();
    const benefit = await browser.newPage();
    for (const [page, file] of [[leave, 'leave.html'], [benefit, 'modules/claims/options/staff-entitlement.html']]) {
      await page.setViewport({ width: 390, height: 844 });
      await page.setRequestInterception(true);
      page.on('request', req => /^https?:/.test(req.url()) ? req.abort() : req.continue());
      await page.goto(pathToFileURL(path.resolve(file)).href, { waitUntil: 'load' });
      console.log('Loaded ' + file);
    }
    await leave.evaluate(() => showLeaveSection('viewStaffEntitlement'));
    assert.equal(await leave.$eval('#headerTitleText', el => el.textContent), 'Staff Leave Entitlement');
    assert.equal(await leave.evaluate(before => {
      const parsed = new DOMParser().parseFromString(before, 'text/html');
      const contents = doc => doc.querySelector('#viewStaffEntitlement').textContent.replace('TOTAL USABLE BALANCE', 'TOTAL USABLE').replaceAll('Leave Type', '').replaceAll('Current Balance', 'Current').replaceAll('Usable Balance', 'Usable').replace(/\s+/g, ' ').trim();
      return contents(parsed) === contents(document);
    }, original), true, 'All section data remains unchanged');
    const inspect = (page, selector) => page.$eval(selector, el => {
      const style = getComputedStyle(el);
      const result = Object.fromEntries(['color', 'backgroundColor', 'borderColor', 'borderRadius', 'fontSize', 'fontWeight', 'padding', 'letterSpacing'].map(key => [key, style[key]]));
      if (['Top', 'Right', 'Bottom', 'Left'].every(side => style['border' + side + 'Width'] === '0px')) delete result.borderColor;
      return result;
    });
    for (const theme of ['dark', 'light']) {
      for (const page of [leave, benefit]) {
        await page.evaluate(value => document.documentElement.setAttribute('data-theme', value), theme);
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      const actual = await inspect(leave, '.entitlement-leave-value');
      const expected = await inspect(benefit, '.entitlement-benefit-value');
      assert.deepEqual(actual, expected, theme + ' tag matches reference');
      for (const selector of ['.entitlement-metrics', '.entitlement-metric', '.entitlement-metric-label', '.entitlement-metric-value', '.entitlement-metric--usable .entitlement-metric-value']) {
        const actualStyle = await inspect(leave, selector);
        const expectedStyle = await inspect(benefit, selector);
        // Container color is inherited from each page; visible labels and values set their own color.
        if (selector === '.entitlement-metrics' || selector === '.entitlement-metric') {
          delete actualStyle.color;
          delete expectedStyle.color;
        }
        assert.deepEqual(actualStyle, expectedStyle, theme + ' ' + selector);
      }
      const colors = await leave.$$eval('.entitlement-leave-value', tags => tags.map(el => getComputedStyle(el).color));
      assert.equal(colors.length, 7);
      assert.equal(new Set(colors).size, 1, 'All tags use the same purple');
      for (const [page, name] of [[leave, 'leave'], [benefit, 'benefit']]) {
        await page.bringToFront();
        await page.screenshot({ path: path.resolve('scratch', name + '_entitlement_fields_' + theme + '.png'), waitForFonts: false });
        console.log('Captured ' + name + ' ' + theme);
      }
    }
    for (const width of [320, 390, 420]) {
      await leave.setViewport({ width, height: 844 });
      const overflowing = await leave.$$eval('#staffEntitlementRecordCardsContainer .card', cards => cards.filter(card => card.scrollWidth > card.clientWidth).length);
      assert.equal(overflowing, 0, 'Cards fit at ' + width);
    }
    const filtered = await leave.evaluate(() => {
      applyStaffEntitlementFilter('Natasha', 'hospitalization');
      return Array.from(document.querySelectorAll('#staffEntitlementRecordCardsContainer > .card')).filter(el => getComputedStyle(el).display !== 'none').map(el => el.textContent.replace(/\s+/g, ' ').trim());
    });
    assert.equal(filtered.length, 1);
    assert.match(filtered[0], /Natasha.*HOSPITALIZATION/);
    await leave.evaluate(() => resetStaffEntitlementFilterModal());
    assert.equal(await leave.$$eval('#staffEntitlementRecordCardsContainer > .card', cards => cards.filter(el => getComputedStyle(el).display !== 'none').length), 7);
    console.log('PASS: data preserved; reference styles match in both themes; 320/390/420px cards fit; filtering and reset work.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
