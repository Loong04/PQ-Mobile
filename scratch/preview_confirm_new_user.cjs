const puppeteer = require('puppeteer');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--allow-file-access-from-files']
  });
  try {
    for (const theme of ['dark', 'light']) {
      const page = await browser.newPage();
      await page.setViewport({ width: 390, height: 900 });
      const url = pathToFileURL(path.resolve(__dirname, '../modules/employee-career/options/team/confirm-new-user.html')).href;
      await page.goto(`${url}?theme=${theme}`, { waitUntil: 'networkidle0' });
      await page.screenshot({ path: path.resolve(__dirname, `confirm-new-user-pending-style-${theme}.png`) });
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
