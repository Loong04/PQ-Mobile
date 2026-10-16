const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
const index = pathToFileURL(path.join(__dirname, '../modules/training-competency/index.html')).href;
async function frame(page) {
  return page.evaluate(() => {
    const phone = document.querySelector('.phone-container'), header = document.querySelector('.training-competency-header'), nav = document.querySelector('.bottom-nav');
    const bounds = element => { const rect = element.getBoundingClientRect(); return { top: rect.top, bottom: rect.bottom }; };
    return { phone: bounds(phone), header: bounds(header), nav: bounds(nav), outerScroll: phone.scrollTop,
      bodyScroll: document.body.scrollTop, documentScroll: document.documentElement.scrollTop,
      mainScroll: document.querySelector('main').scrollTop };
  });
}
test('closing an expired competency popup keeps the header visible and navigation at the bottom of the phone', async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--allow-file-access-from-files', '--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', request => /^https?:/.test(request.url()) ? request.abort() : request.continue());
    for (const theme of ['dark', 'light']) for (const width of [360, 1280]) {
      await page.setViewport({ width, height: 1000 });
      await page.goto(`${index}?scope=team&theme=${theme}`, { waitUntil: 'load' });
      const baseline = await frame(page);
      await page.click('[data-expired-competency="first-aid"]');
      await page.click('#trainingExpiredClose');
      const returned = await frame(page);
      assert.equal(returned.outerScroll, 0, 'Returning must not scroll the outer phone frame');
      assert.ok(Math.abs(returned.header.top - baseline.header.top) <= 1, 'Header remains at its original position');
      assert.ok(Math.abs(returned.nav.bottom - returned.phone.bottom) <= 1, 'Navigation stays at the phone bottom');
      assert.equal(returned.bodyScroll, 0);
      assert.equal(returned.documentScroll, 0);
      assert.equal(await page.$eval('#trainingCompetencyTabTeam', node => node.getAttribute('aria-selected')), 'true');
      await page.screenshot({ path: path.join(__dirname, `training-expired-return-${theme}-${width}.png`) });
      await page.reload({ waitUntil: 'load' });
      assert.equal((await frame(page)).outerScroll, 0, 'Refreshing a returned dashboard keeps the phone frame in place');
      await page.click('[data-expired-competency="first-aid"]');
      await page.keyboard.press('Escape');
      assert.equal((await frame(page)).outerScroll, 0, 'Escape close also keeps the phone frame in place');
      await page.goto(`${index}?scope=team&theme=${theme}#trainingExpiredCompetencies`, { waitUntil: 'load' });
      const legacy = await frame(page);
      assert.equal(legacy.outerScroll, 0, 'Previously generated return links recover without scrolling the outer phone');
      assert.ok(Math.abs(legacy.header.top - baseline.header.top) <= 1);
      await page.goto(`${index}?scope=team&theme=${theme}&legacyReturn=1#trainingExpiredCompetencies`, { waitUntil: 'load' });
      assert.equal((await frame(page)).outerScroll, 0, 'Loading an old return link in a fresh document keeps the phone frame in place');
    }
  } finally { await browser.close(); }
});
