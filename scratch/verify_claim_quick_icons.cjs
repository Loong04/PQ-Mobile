const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--allow-file-access-from-files']
  });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(path.resolve(__dirname, '../modules/claims/index.html')).href,
      { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);

    async function verifyIcons(selector, count) {
      const icons = await page.$$eval(selector, elements => elements.map(element => {
        const icon = element.querySelector('.fa-solid');
        const bounds = icon?.getBoundingClientRect();
        const box = element.getBoundingClientRect();
        return {
          text: element.textContent.trim(),
          glyph: icon ? getComputedStyle(icon, '::before').content : 'none',
          fontLoaded: icon ? document.fonts.check('900 20px "Font Awesome 6 Free"') : false,
          fits: !!bounds && bounds.width > 0 && bounds.height > 0 &&
            bounds.left >= box.left && bounds.right <= box.right &&
            bounds.top >= box.top && bounds.bottom <= box.bottom
        };
      }));
      assert.equal(icons.length, count);
      for (const icon of icons) {
        assert.equal(icon.text, '', 'Icon wrapper contains text or corrupted emoji');
        assert.ok(icon.glyph !== 'none' && icon.glyph !== '""', 'Missing icon glyph');
        assert.ok(icon.fontLoaded, 'FontAwesome font failed to load');
        assert.ok(icon.fits, 'Icon overflows its wrapper');
      }
    }

    for (const theme of ['light', 'dark']) {
      await page.evaluate(theme => {
        document.documentElement.setAttribute('data-theme', theme);
        window.ClaimsEngine.switchClaimScope('individual');
      }, theme);
      await verifyIcons('#claimOptionsHubGrid .claim-square-icon-wrap', 6);
      await page.click('#claimOptionsHubGrid .claim-square-card:last-child');
      await verifyIcons('#allClaimOptionsModalGrid .claim-square-icon-wrap', 10);
      assert.equal(await page.$$eval('#allClaimOptionsModalGrid a', links => links.filter(link => link.getAttribute('href').startsWith('options/')).length), 10);
      await page.evaluate(() => window.ClaimsEngine.closeAllClaimOptionsModal());
      await page.waitForFunction(() => Number(getComputedStyle(document.getElementById('allOptionsModalOverlay')).opacity) === 0);
      await page.screenshot({ path: path.resolve(__dirname, 'claim_quick_icons_' + theme + '.png') });
      await page.evaluate(() => window.ClaimsEngine.switchClaimScope('team'));
      await verifyIcons('#managerOptionsGrid .claim-square-icon-wrap', 4);
      console.log('PASS ' + theme + ': Individual, View All and Team icons render without text or overflow; links retained');
    }
    assert.deepEqual(errors, []);
    console.log('PASS no JavaScript errors');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
