/* Read-only application audit. Writes its inventory and observations to scratch only. */
const fs = require('node:fs/promises');
const path = require('node:path');
const vm = require('node:vm');
const { pathToFileURL, fileURLToPath } = require('node:url');
const crypto = require('node:crypto');
const puppeteer = require('puppeteer');
const root = path.resolve(__dirname, '..');
const omittedDirs = new Set(['node_modules', '.git', '.agents', '.codex', '.claude', '.gemini', '.aws']);
const normalize = file => path.relative(root, file).replace(/\\/g, '/');
const lineAt = (text, index) => text.slice(0, index).split('\n').length;
async function walk(dir) {
  const files = [];
  for (const item of await fs.readdir(dir, { withFileTypes: true })) {
    if (item.isDirectory() && !omittedDirs.has(item.name)) files.push(...await walk(path.join(dir, item.name)));
    else if (item.isFile()) files.push(path.join(dir, item.name));
  }
  return files;
}
async function main() {
  const files = await walk(root);
  const inventory = [], missingReferences = [], syntaxErrors = [];
  const htmlFiles = [];
  const texts = new Map();
  for (const file of files) {
    const rel = normalize(file);
    if (!/\.(html|js|css|cjs|py|md|json|txt|csv)$/.test(file) && rel !== '.gitignore') continue;
    const text = await fs.readFile(file, 'utf8');
    texts.set(rel, text);
    const category = rel.startsWith('scratch/') ? 'diagnostic' : rel === 'js/lucide.min.js' ? 'vendor' : /\.(html|js|css)$/.test(rel) ? 'application' : 'documentation-or-config';
    inventory.push({ file: rel, category, lines: text.split('\n').length, bytes: Buffer.byteLength(text), sha256: crypto.createHash('sha256').update(text).digest('hex') });
    if (category !== 'application') continue;
    if (file.endsWith('.js')) {
      try { new vm.Script(text, { filename: rel }); }
      catch (error) { syntaxErrors.push({ file: rel, message: error.message, location: error.stack.split('\n').slice(0, 4).join('\n') }); }
    }
    if (file.endsWith('.html')) {
      htmlFiles.push(file);
      for (const script of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
        if (/\bsrc\s*=/.test(script[1]) || /type\s*=\s*["'](?:application\/ld\+json|application\/json|importmap)/i.test(script[1])) continue;
        try { new vm.Script(script[2], { filename: rel, lineOffset: lineAt(text, script.index) - 1 }); }
        catch (error) { syntaxErrors.push({ file: rel, line: lineAt(text, script.index), message: error.message, location: error.stack.split('\n').slice(0, 4).join('\n') }); }
      }
      for (const ref of text.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)) {
        const value = ref[1];
        if (/^(?:https?:|data:|javascript:|mailto:|tel:|#)/i.test(value) || /[${}]/.test(value)) continue;
        try {
          const resolved = new URL(value, pathToFileURL(file));
          if (resolved.protocol !== 'file:') continue;
          const local = fileURLToPath(resolved);
          try { await fs.access(local); }
          catch { missingReferences.push({ file: rel, line: lineAt(text, ref.index), reference: value, resolved: normalize(local) }); }
        } catch {}
      }
    }
  }
  const totals = inventory.reduce((counts, file) => { counts[file.category] = (counts[file.category] || 0) + 1; return counts; }, {});
  console.log(JSON.stringify({ inventory: totals, htmlPages: htmlFiles.length, syntaxErrors, missingReferences }, null, 2));
  const observations = [];
  const browser = await puppeteer.launch({ headless: true });
  let cursor = 0;
  try {
    await Promise.all(Array.from({ length: 4 }, async (_, worker) => {
      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      await page.setViewport({ width: 390, height: 950 });
      await page.setRequestInterception(true);
      page.on('request', request => /^(file:|data:|blob:|about:)/.test(request.url()) ? request.continue() : request.abort());
      let errors = [], failedResources = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('requestfailed', request => { if (request.url().startsWith('file:')) failedResources.push({ url: request.url(), error: request.failure()?.errorText }); });
      page.on('dialog', dialog => dialog.dismiss());
      while (cursor < htmlFiles.length) {
        const file = htmlFiles[cursor++];
        const rel = normalize(file);
        errors = []; failedResources = [];
        let navigationError;
        try { await page.goto(pathToFileURL(file).href, { waitUntil: 'domcontentloaded', timeout: 15000 }); }
        catch (error) { navigationError = error.message; }
        try {
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          const observed = await page.evaluate(() => {
            const shown = node => Boolean(node.getClientRects().length) && getComputedStyle(node).visibility !== 'hidden';
            const counts = new Map();
            document.querySelectorAll('[id]').forEach(node => counts.set(node.id, (counts.get(node.id) || 0) + 1));
            const duplicateIds = [...counts].filter(([, count]) => count > 1).map(([id, count]) => ({ id, count }));
            const viewChartButtons = [...document.querySelectorAll('button,a,[onclick]')].filter(node => /^View Chart$/i.test(node.textContent.trim()) || /^View Chart$/i.test(node.getAttribute('title') || '')).map(node => ({
              html: node.outerHTML.slice(0, 1000), visible: shown(node), hasText: /View Chart/i.test(node.textContent), pieIcon: Boolean(node.querySelector('.fa-chart-pie')), nowrap: getComputedStyle(node).whiteSpace,
              width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height
            }));
            const handlers = new Map();
            document.querySelectorAll('*').forEach(node => [...node.attributes].filter(attr => /^on(?:click|change|input|submit)$/.test(attr.name)).forEach(attr => {
              const code = attr.value.replace(/'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`/g, '');
              for (const match of code.matchAll(/(?<![\w.])([A-Za-z_$][\w$]*)\s*\(/g)) {
                const name = match[1];
                if (['if', 'for', 'while', 'switch', 'function', 'catch'].includes(name)) continue;
                let type;
                try { type = (0, eval)('typeof ' + name); } catch { type = 'unknown'; }
                if (type === 'undefined') handlers.set(name, { name, visible: shown(node), html: node.outerHTML.slice(0, 600) });
              }
            }));
            const filterPanels = [...document.querySelectorAll('.standard-filter-panel,.claim-filter-panel,.approval-filter-panel')].map(panel => ({
              id: panel.closest('[id]')?.id, title: panel.querySelector('h2,h3')?.textContent.trim(), standardized: panel.classList.contains('standard-filter-panel'),
              labels: [...panel.querySelectorAll('label')].map(node => node.textContent.trim()), resets: [...panel.querySelectorAll('button')].filter(node => /reset/i.test(node.textContent)).length,
              dates: [...panel.querySelectorAll('input')].filter(node => /date|period/i.test(node.id)).map(node => ({ id: node.id, type: node.type }))
            }));
            const phone = document.querySelector('.phone-container');
            const overflows = [...document.querySelectorAll('.main-content,.phone-container')].filter(node => shown(node) && node.scrollWidth > node.clientWidth + 2).map(node => ({ className: node.className, width: node.clientWidth, scrollWidth: node.scrollWidth }));
            return { loadedUrl: location.href, title: document.title, theme: document.documentElement.dataset.theme, phoneHeight: phone?.clientHeight,
              duplicateIds, viewChartButtons, unresolvedHandlers: [...handlers.values()], filterPanels, overflows };
          });
          observations.push({ file: rel, ...observed, errors: [...errors], failedResources: [...failedResources], navigationError });
        } catch (error) { observations.push({ file: rel, errors: [...errors], navigationError, inspectError: error.message }); }
        if (cursor % 12 === 0) console.log(`Inspected ${cursor}/${htmlFiles.length} pages.`);
      }
      await context.close();
    }));
  } finally { await browser.close(); }
  observations.sort((a, b) => a.file.localeCompare(b.file));
  const report = { generatedAt: new Date().toISOString(), root, totals, inventory, syntaxErrors, missingReferences, observations,
    limitations: ['Runtime inventory blocks external CDN requests for speed; font-dependent layout findings require a separate browser check with actual fonts.', 'Initial DOM and source checks do not certify every hidden interaction.'] };
  await fs.writeFile(path.join(__dirname, 'app-consistency-audit.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ inspected: observations.length, pageErrors: observations.filter(row => row.errors.length), unresolved: observations.filter(row => row.unresolvedHandlers?.length).map(row => ({ file: row.file, handlers: row.unresolvedHandlers })), duplicateIds: observations.filter(row => row.duplicateIds?.length).map(row => ({ file: row.file, ids: row.duplicateIds })), chartViolations: observations.flatMap(row => (row.viewChartButtons || []).filter(button => !button.hasText || !button.pieIcon || button.nowrap !== 'nowrap').map(button => ({ file: row.file, ...button }))) }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
