const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const groupedHeaders = [
  '.attendance-report-legend-head', '.hours-highlight-legend-head',
  '.timesheet-legend-head', '.staff-list-legend-head',
  '.staff-feedback-chart-legend-head', '.daily-ot-chart-legend-head',
  '.highlight-monthly-head', '.ir-highlight-monthly-head', '.staff-attrition-monthly-head',
  '.staff-list-monthly-head', '.daily-ot-trend-column-head', '.org-statistics-bars-head',
  '.data-table-column-header'
];
const selector = ['table > thead > tr > th', 'table > thead > tr > td',
  'table th[scope="col"]', '[role="columnheader"]', ...groupedHeaders].join(',');
function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const filename = path.join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(filename);
    return entry.name.endsWith('.html') ? [filename] : [];
  });
}
const pages = [
  ...fs.readdirSync(root).filter(name => name.endsWith('.html')).map(name => path.join(root, name)),
  ...htmlFiles(path.join(root, 'modules'))
].filter(filename => /<thead\b|role=["']columnheader|(?:legend|monthly)-head|data-table-column-header/.test(fs.readFileSync(filename, 'utf8')));
pages.push(path.join(root, 'modules/employee-career/options/history.html'),
  path.join(root, 'modules/employee-career/options/pending-approval.html'));

(async () => {
  const browser = await puppeteer.launch({ headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--allow-file-access-from-files', '--no-sandbox'] });
  const failures = [];
  const coverage = [];
  let checked = 0;
  try {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', request => /^https?:/.test(request.url()) ? request.abort() : request.continue());
    for (const filename of pages) {
      const relative = path.relative(root, filename).replaceAll('\\', '/');
      let pageHeaders = 0;
      for (const theme of ['light', 'dark']) {
        await page.setViewport({ width: theme === 'light' ? 360 : 420, height: 950 });
        await page.goto(pathToFileURL(filename).href + '?theme=' + theme, { waitUntil: 'load' });
        await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
        if (relative === 'modules/employee-career/options/history.html') {
          await page.click('[data-history-kind="cv-change-request"]');
          await page.click('#careerHistoryList [data-record-id]');
          await page.click('[data-cv-tab="family"]');
        }
        if (relative === 'modules/employee-career/options/pending-approval.html') {
          await page.click('.career-pending-review');
          await page.click('[data-cv-tab="family"]');
        }
        if (relative.endsWith('/staff-events.html')) await page.click('.staff-event-card');
        if (relative === 'work-behaviour.html') await page.evaluate(() => {
          selectYearDrilldown('2026');
          selectMonthDrilldown('October');
        });
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
        const result = await page.evaluate(selector => {
          const cells = [...document.querySelectorAll(selector)];
          const failures = cells.flatMap(cell => {
            const style = getComputedStyle(cell);
            const issues = [];
            if (style.backgroundColor !== 'rgb(124, 58, 237)' || style.backgroundImage !== 'none') issues.push('background=' + style.background);
            if (style.color !== 'rgb(255, 255, 255)') issues.push('color=' + style.color);
            for (const child of cell.querySelectorAll('span, abbr, a, button, i')) {
              if (getComputedStyle(child).color !== 'rgb(255, 255, 255)') issues.push('child color=' + getComputedStyle(child).color);
            }
            return issues.length ? [{ text: cell.textContent.trim().slice(0, 55), element: cell.tagName + '.' + cell.className, issues }] : [];
          });
          const tintedBodyCells = [...document.querySelectorAll('table > tbody > tr > :is(th, td)')]
            .filter(cell => !cell.hasAttribute('scope') && getComputedStyle(cell).backgroundColor === 'rgb(124, 58, 237)');
          return { count: cells.length, failures, tintedBodyCells: tintedBodyCells.length };
        }, selector);
        pageHeaders = Math.max(pageHeaders, result.count);
        checked += result.count;
        failures.push(...result.failures.map(issue => ({ page: relative, theme, ...issue })));
        if (result.tintedBodyCells) failures.push({ page: relative, theme, issue: 'Table body unexpectedly uses header purple', count: result.tintedBodyCells });
        if (relative.endsWith('/ir-highlight.html')) {
          await page.screenshot({ path: path.join(__dirname, `table-headers-ir-${theme}.png`) });
        }
      }
      coverage.push({ page: relative, headers: pageHeaders });
      process.stdout.write('.');
    }
    const report = { pages: pages.length, checked, failures, coverage };
    fs.writeFileSync(path.join(__dirname, 'table-header-audit.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(`\n${failures.length ? 'FAIL' : 'PASS'}: ${checked} header checks across ${pages.length} pages, light/dark and 360/420px; ${failures.length} failures.`);
    if (failures.length) { console.log(JSON.stringify(failures.slice(0, 8), null, 2)); process.exitCode = 1; }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
