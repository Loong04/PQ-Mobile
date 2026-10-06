const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
const url = pathToFileURL(path.resolve(__dirname, '../modules/admin/options/letter-request.html')).href;

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const theme of ['dark', 'light']) {
      await page.setViewport({ width: 390, height: 950 });
      await page.goto(url + '?theme=' + theme, { waitUntil: 'networkidle0' });
      assert.ok(await page.$('#letterRequestForm'), 'Admin Letter Request must have a form');
      assert.equal(await page.$('.admin-coming-card'), null);
      assert.deepEqual(await page.$$eval('#letterRequestForm label', nodes => nodes.map(n => n.textContent.trim())),
        ['Letter Type', 'Description', '1st Merge Text', '2nd Merge Text', '3rd Merge Text', 'Reason', 'Remarks']);
      await page.click('#letterRequestSubmit');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'letterRequestType');
      assert.match(await page.$eval('#letterRequestFeedback', n => n.textContent), /letter type/i);
      await page.select('#letterRequestType', 'employment-confirmation');
      await page.type('#letterRequestDescription', 'Confirmation of employment');
      await page.type('#letterRequestMerge1', 'To the receiving organization');
      await page.type('#letterRequestMerge2', 'Employee reference #EBB01');
      await page.type('#letterRequestMerge3', 'Requested issue date: 6 Oct 2026');
      await page.type('#letterRequestReason', 'Application support');
      await page.type('#letterRequestRemarks', 'Please provide an electronic copy.');
      for (const width of [360, 390, 450]) {
        await page.setViewport({ width, height: 950 });
        assert.ok(await page.$eval('main', n => n.scrollWidth <= n.clientWidth + 1));
        assert.ok(await page.$$eval('.form-section-heading', nodes => nodes.length === 3 && nodes.every(n => {
          const accent = getComputedStyle(n, '::before');
          return accent.width === '3.5px' && accent.height === '15px' && accent.backgroundColor === 'rgb(168, 85, 247)';
        })));
        const submit = await page.$('#letterRequestSubmit');
        await submit.scrollIntoView();
        assert.ok(await submit.isIntersectingViewport(), 'Submit must remain reachable above the bottom navigation');
      }
      await page.click('#letterRequestSubmit');
      assert.match(await page.$eval('#letterRequestFeedback', n => n.textContent), /ready for submission/i);
      assert.equal(await page.$eval('#letterRequestMerge2', n => n.value), 'Employee reference #EBB01');
      assert.equal(await page.$eval('#letterRequestCancel', n => new URL(n.href).searchParams.get('theme')), theme);
      await page.setViewport({ width: 390, height: 950 });
      await page.$eval('main', n => { n.scrollTop = 0; });
      await page.screenshot({ path: path.join(__dirname, `admin_letter_request_${theme}_top.png`) });
      await page.$eval('main', n => { n.scrollTop = n.scrollHeight; });
      await page.screenshot({ path: path.join(__dirname, `admin_letter_request_${theme}_bottom.png`) });
      await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.click('#letterRequestCancel')]);
      assert.ok(page.url().includes('/modules/admin/index.html'));
      assert.equal(await page.$eval('html', n => n.dataset.theme), theme);
      await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.click('a[href*="letter-request.html"]')]);
      assert.ok(await page.$('#letterRequestForm'), 'Admin entry must open the completed Letter Request form');
    }
    assert.deepEqual(errors, []);
    console.log('PASS: Admin Letter Request has seven fields, consistent purple headings, type validation, reachable Cancel/Submit actions, Admin navigation, both themes and three mobile widths.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
