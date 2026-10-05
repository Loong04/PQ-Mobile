const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const leaveUrl = pathToFileURL(path.resolve(__dirname, '..', 'leave.html')).href + '?theme=dark';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 950 });
    await page.goto(leaveUrl, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => openTeamMemberLeaveDetails('Sarah Lim'));

    const result = await page.$eval('#historyDetailsTableBody', body => {
      const rows = [...body.querySelectorAll('tr')];
      const lastRow = rows.at(-1);
      return {
        allRowsUseTwoColumns: rows.every(row => row.children.length === 2),
        lastRowCellCount: lastRow.children.length,
        lastRowHasColspan: Boolean(lastRow.querySelector('[colspan]')),
        attachmentLabel: lastRow.children[0]?.textContent.trim(),
        attachmentValue: lastRow.children[1]?.textContent.trim()
      };
    });

    assert.deepEqual(result, {
      allRowsUseTwoColumns: true,
      lastRowCellCount: 2,
      lastRowHasColspan: false,
      attachmentLabel: 'Attachment',
      attachmentValue: 'No Attachments'
    });
    console.log('PASS: Sarah Lim leave details use the standard two-column Attachment row.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
