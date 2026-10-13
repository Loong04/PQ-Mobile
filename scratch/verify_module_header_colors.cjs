const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
const root = path.resolve(__dirname, '..');
function pages(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? pages(file) : entry.name.endsWith('.html') && fs.readFileSync(file, 'utf8').includes('<phone-status-bar') ? [file] : [];
  });
}
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--allow-file-access-from-files', '--no-sandbox'] });
  const results = [];
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 420, height: 844 });
    if (process.argv.includes('--preview')) {
      for (const [name, file, selector] of [
        ['organization-statistics', 'modules/employee-career/options/team/organization-statistics.html', '.employee-career-header'],
        ['work-incident', 'modules/performance/options/work-incident.html', '.performance-header']
      ]) {
        for (const theme of ['light', 'dark']) {
          await page.goto(pathToFileURL(path.join(root, file)).href + '?theme=' + theme, { waitUntil: 'domcontentloaded' });
          await page.evaluate(() => document.fonts.ready);
          await (await page.$(selector)).screenshot({ path: path.join(__dirname, `uniform-header-${name}-${theme}.png`) });
        }
      }
      console.log('Saved Organization Statistics and Work Incident header previews in both themes.');
      return;
    }
    await page.setRequestInterception(true);
    page.on('request', request => /^https?:/.test(request.url()) ? request.abort() : request.continue());
    for (const file of pages(path.join(root, 'modules'))) {
      for (const theme of ['light', 'dark']) {
        await page.goto(pathToFileURL(file).href + '?theme=' + theme, { waitUntil: 'domcontentloaded' });
        const header = await page.$eval('.phone-container phone-status-bar', status => {
          const el = status.parentElement;
          const style = getComputedStyle(el);
          return { selector: el.className, background: style.backgroundImage, backgroundColor: style.backgroundColor };
        });
        results.push({ file: path.relative(root, file).replaceAll('\\', '/'), theme, ...header });
      }
    }
    const expected = 'linear-gradient(135deg, rgb(76, 29, 149) 0%, rgb(109, 40, 217) 50%, rgb(124, 58, 237) 100%)';
    const mismatches = results.filter(item => item.background !== expected);
    console.log(JSON.stringify({ checked: results.length, headerClasses: [...new Set(results.map(item => item.selector))], mismatches }, null, 2));
    fs.writeFileSync(path.join(__dirname, 'module-header-colors.json'), JSON.stringify(results, null, 2));
    if (mismatches.length) process.exitCode = 1;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
