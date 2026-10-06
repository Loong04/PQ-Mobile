const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const theme of ['dark', 'light']) {
      await page.setViewport({ width: 390, height: 950 });
      await page.goto(pathToFileURL(path.resolve(`app${theme}.html`)).href, { waitUntil: 'load' });
      assert.ok(await page.$('[data-module="admin"]'), 'Apps must include Admin');
      await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.click('[data-module="admin"]')]);
      assert.ok(page.url().includes('/modules/admin/index.html'));
      assert.equal(await page.$eval('html', n => n.dataset.theme), theme);
      assert.deepEqual(await page.$$eval('.admin-option-title', nodes => nodes.map(n => n.textContent)), ['News', 'Book Resource', 'Letter Request', 'Guest Visit', 'Policy / SOP']);
      const links = await page.$$eval('.admin-option', nodes => nodes.map(n => n.href));
      for (const link of links) {
        await page.goto(link, { waitUntil: 'load' });
        assert.equal(await page.$eval('html', n => n.dataset.theme), theme);
        const formSelector = link.includes('letter-request.html') ? '#letterRequestForm' : link.includes('guest-visit.html') ? '#guestVisitForm' : link.includes('policy-sop.html') ? '#policyList .policy-card' : '.admin-coming-card';
        assert.ok(await page.$(formSelector));
        await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.click('[data-admin-back]')]);
        assert.ok(page.url().includes('/modules/admin/index.html'));
      }
      for (const width of [360, 390, 450]) {
        await page.setViewport({ width, height: 950 });
        assert.ok(await page.$eval('main', n => n.scrollWidth <= n.clientWidth + 1), 'Admin must fit mobile widths');
      }
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 350)));
      assert.equal(await page.$eval('.phone-container', n => getComputedStyle(n).backgroundColor), theme === 'light' ? 'rgb(246, 248, 252)' : 'rgb(9, 10, 22)');
      await page.screenshot({ path: `scratch/admin_${theme}.png` });
    }
    assert.deepEqual(errors, []);
    console.log('PASS: Admin entry, five option pages, return navigation, both themes and mobile widths.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
