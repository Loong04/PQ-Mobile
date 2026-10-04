const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const pages = [
  ['Leave', 'leave.html'],
  ['Attendance', 'modules/attendance/options/team.html'],
  ['Claims', 'modules/claims/options/pending-approval.html'],
  ['Payroll', 'modules/payroll/options/pending-approval.html'],
  ['Project & Task', 'modules/project-task/options/pending-approval.html']
];

const actionSelector = [
  '.pending-action-grid .action-btn-approve',
  '.pending-action-grid .action-btn-backup',
  '.pending-action-grid .action-btn-resubmit',
  '.pending-action-grid .action-btn-reject'
].join(',');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox']
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 950 });
    const report = [];

    for (const [moduleName, relativePath] of pages) {
      const pageUrl = pathToFileURL(path.resolve(__dirname, '..', relativePath)).href + '?theme=dark';
      await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
      await new Promise(resolve => setTimeout(resolve, 250));

      const result = await page.$$eval(actionSelector, buttons => ({
        count: buttons.length,
        labels: [...new Set(buttons.map(button => button.textContent.replace(/\s+/g, ' ').trim()))],
        iconCount: buttons.reduce((total, button) => total + button.querySelectorAll('i, svg, img').length, 0),
        symbolicLabels: buttons
          .map(button => button.textContent.replace(/\s+/g, ' ').trim())
          .filter(label => /[✓✔☑✕×↩⟳↻]/u.test(label))
      }));

      assert.ok(result.count > 0, `${moduleName} should expose Pending Approval action buttons`);
      assert.equal(result.iconCount, 0, `${moduleName} Pending Approval buttons must not contain icons`);
      assert.deepEqual(result.symbolicLabels, [], `${moduleName} Pending Approval labels must not contain icon glyphs`);
      report.push(`${moduleName}: ${result.count} buttons (${result.labels.join(', ')})`);
    }

    console.log(`PASS: Pending Approval actions are text-only across the system.\n${report.join('\n')}`);
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
