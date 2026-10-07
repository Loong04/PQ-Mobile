const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const pageUrl = file => pathToFileURL(path.join(root, file)).href;

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--allow-file-access-from-files']
  });

  try {
    const cases = [
      {
        file: 'modules/attendance/options/attendance.html',
        selector: '.attendance-feedback-clock-title',
        title: 'Clock Times'
      },
      {
        file: 'modules/attendance/options/feedback-history.html',
        selector: '.pending-feedback-clock-section h4',
        title: 'Clock Time'
      }
    ];

    for (const theme of ['light', 'dark']) {
      for (const testCase of cases) {
        const page = await browser.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(pageUrl(testCase.file) + '?theme=' + theme, { waitUntil: 'networkidle0' });
        const heading = await page.$eval(testCase.selector, node => ({
          text: node.textContent.replace(/\s+/g, ' ').trim(),
          icons: node.querySelectorAll('i, svg').length
        }));
        assert.deepEqual(heading, { text: testCase.title, icons: 0 });
        assert.deepEqual(errors, []);
        await page.close();
      }
    }

    console.log('PASS: Shared Attendance Feedback uses Clock Times; Pending Feedback keeps its heading. Both themes have no leading icon.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
