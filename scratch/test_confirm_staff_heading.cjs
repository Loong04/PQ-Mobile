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
    const url = pathToFileURL(path.resolve(__dirname, '../modules/employee-career/options/team/confirm-staff.html')).href;
    await page.goto(url, { waitUntil: 'load' });
    assert.equal(
      await page.$eval('#confirmAssessmentHeading', node => node.textContent.trim()),
      'Confirmation Detail'
    );
    assert.deepEqual(errors, []);
    console.log('PASS: Confirm Staff uses the Confirmation Detail section heading.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
