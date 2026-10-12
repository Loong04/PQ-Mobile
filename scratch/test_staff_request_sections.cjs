const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--allow-file-access-from-files']
  });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const url = pathToFileURL(path.resolve(__dirname, '../modules/employee-career/options/team/staff-request.html')).href;
    await page.goto(url, { waitUntil: 'load' });
    assert.equal(await page.$$eval('#staffRequestForm .employee-career-form-section', nodes => nodes.length), 1);
    assert.equal(await page.$eval('#requestOverviewHeading', node => node.textContent.trim()), 'Request Detail');
    assert.equal(await page.$('#requestPositionHeading'), null);
    assert.equal(
      await page.$eval('#requestCompany', node => node.closest('.employee-career-form-section')?.getAttribute('aria-labelledby')),
      'requestOverviewHeading'
    );
    assert.deepEqual(errors, []);
    console.log('PASS: Staff Request uses one Request Detail section.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
