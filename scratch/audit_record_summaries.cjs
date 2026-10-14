const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
const root = path.resolve(__dirname, '..');
const baselineMode = process.argv.includes('--baseline');
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const filename = path.join(dir, entry.name);
    return entry.isDirectory() ? files(filename) : entry.name.endsWith('.html') ? [filename] : [];
  });
}
const pages = [...fs.readdirSync(root).filter(name => name.endsWith('.html')).map(name => path.join(root, name)), ...files(path.join(root, 'modules'))]
  .filter(file => /total\s*records?/i.test(fs.readFileSync(file, 'utf8')));
const baselinePath = path.join(__dirname, 'record-summaries-baseline.json');
const baseline = !baselineMode && fs.existsSync(baselinePath) ? JSON.parse(fs.readFileSync(baselinePath, 'utf8')).coverage : null;
(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files', '--no-sandbox'] });
  const coverage = [];
  const failures = [];
  try {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', request => /^https?:/.test(request.url()) ? request.abort() : request.continue());
    for (const file of pages) {
      const relative = path.relative(root, file).replaceAll('\\', '/');
      for (const theme of ['light', 'dark']) {
        await page.setViewport({ width: theme === 'light' ? 360 : 420, height: 950 });
        await page.goto(pathToFileURL(file).href + '?theme=' + theme, { waitUntil: 'load' });
        await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
        await page.evaluate(theme => {
          if (typeof window.setTheme === 'function') window.setTheme(theme);
          else document.documentElement.dataset.theme = theme;
        }, theme);
        const result = await page.evaluate(() => {
          const ownText = node => [...node.childNodes].filter(child => child.nodeType === Node.TEXT_NODE).map(child => child.textContent).join('').trim();
          const selector = node => {
            if (node.id) return '#' + node.id;
            const parts = [];
            while (node && node !== document.body) {
              if (node.id) { parts.unshift('#' + node.id); break; }
              parts.unshift(node.tagName.toLowerCase() + ':nth-child(' + ([...node.parentElement.children].indexOf(node) + 1) + ')');
              node = node.parentElement;
            }
            return parts.join(' > ');
          };
          return [...document.querySelectorAll('body *')].filter(node => !node.closest('script,style,preview-top-bar') && /^total\s+records?(?:\s+found)?\s*:?\s*(?:[\d,]+)?$/i.test(ownText(node))).map(node => {
            const inline = /^total\s+records?(?:\s+found)?\s*:\s*[\d,]+$/i.test(ownText(node));
            const value = inline ? null : node.querySelector('strong') || node.nextElementSibling;
            const count = inline ? ownText(node).match(/[\d,]+$/)[0] : value?.textContent.trim() || node.previousElementSibling?.textContent.trim() || '';
            const chartCenter = !!node.closest('[class*="center"]');
            const card = node.closest('.record-summary-card');
            const labelStyle = getComputedStyle(node);
            const countStyle = value ? getComputedStyle(value.querySelector('.record-summary-value') || value) : null;
            return { key: selector(node), text: ownText(node), count, chartCenter,
              parent: node.parentElement.className || node.parentElement.id || node.parentElement.tagName,
              grandparent: node.parentElement.parentElement.className || node.parentElement.parentElement.id || node.parentElement.parentElement.tagName,
              card: !!card, radius: card && getComputedStyle(card).borderRadius, background: card && getComputedStyle(card).backgroundImage,
              labelColor: labelStyle.color, countColor: countStyle?.color,
              labelSize: labelStyle.fontSize, countSize: countStyle?.fontSize,
              fits: !card || !card.getClientRects().length || card.scrollWidth <= card.clientWidth + 1,
              actions: card ? [...card.querySelectorAll('button,a')].map(button => button.id || button.textContent.trim()) : [] };
          });
        });
        coverage.push({ page: relative, theme, entries: result });
        if (!baselineMode) {
          for (const item of result) {
            if (!item.chartCenter && (!item.card || item.radius !== '18px')) failures.push({ page: relative, theme, ...item });
            if (!item.chartCenter && (!item.background?.includes('rgba(124, 58, 237, 0.05)') || !item.background?.includes('rgba(99, 102, 241, 0.05)'))) failures.push({ page: relative, theme, issue: 'Incorrect summary surface', ...item });
            if (!item.chartCenter && (item.labelSize !== '13px' || item.countSize !== '18px')) failures.push({ page: relative, theme, issue: 'Incorrect metric typography', ...item });
            if (!item.fits) failures.push({ page: relative, theme, issue: 'Summary card overflows', ...item });
          }
          const before = baseline?.find(entry => entry.page === relative && entry.theme === theme);
          if (before && JSON.stringify(before.entries.map(entry => entry.count)) !== JSON.stringify(result.map(entry => entry.count))) failures.push({ page: relative, theme, issue: 'Displayed counts changed', before: before.entries.map(entry => entry.count), after: result.map(entry => entry.count) });
        }
        if (!baselineMode && ['modules/employee-career/options/history.html', 'modules/employee-career/options/team/staff-list.html', 'modules/claims/options/staff-entitlement.html'].includes(relative)) {
          await page.screenshot({ path: path.join(__dirname, 'record-summary-' + path.basename(file, '.html') + '-' + theme + '.png') });
        }
      }
      process.stdout.write('.');
    }
    fs.writeFileSync(baselineMode ? baselinePath : path.join(__dirname, 'record-summaries-audit.json'), JSON.stringify({ coverage, failures }, null, 2));
    console.log(`\n${baselineMode ? 'BASELINE' : failures.length ? 'FAIL' : 'PASS'}: ${pages.length} pages, ${coverage.reduce((sum, row) => sum + row.entries.length, 0)} count views, ${failures.length} failures.`);
    if (failures.length) { console.log(JSON.stringify(failures.slice(0, 6), null, 2)); process.exitCode = 1; }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
