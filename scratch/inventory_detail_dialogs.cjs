const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
const root = path.resolve(__dirname, '..');
const skip = new Set(['node_modules', '.git', '.agents', '.codex', '.aws', '.claude', '.gemini', 'scratch']);
async function walk(dir) {
  const found = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && !skip.has(entry.name)) found.push(...await walk(path.join(dir, entry.name)));
    else if (entry.isFile() && entry.name.endsWith('.html')) found.push(path.join(dir, entry.name));
  }
  return found;
}
(async () => {
  const files = await walk(root);
  const browser = await puppeteer.launch({ headless: true });
  const inventory = [];
  let cursor = 0;
  try {
    await Promise.all(Array.from({ length: 3 }, async () => {
      const page = await browser.newPage();
      await page.setViewport({ width: 390, height: 950 });
      await page.setRequestInterception(true);
      page.on('request', req => /^(file:|data:|blob:|about:)/.test(req.url()) ? req.continue() : req.abort());
      page.on('dialog', dialog => dialog.dismiss());
      while (cursor < files.length) {
        const file = files[cursor++];
        const rel = path.relative(root, file).replace(/\\/g, '/');
        try {
          await page.goto(pathToFileURL(file).href, { waitUntil: 'domcontentloaded', timeout: 15000 });
          const result = await page.evaluate(() => {
            const groups = new Map();
            for (const table of document.querySelectorAll('table')) {
              let container = null;
              for (let node = table.parentElement; node && node !== document.body; node = node.parentElement) {
                if (/overlay|modal|popup|popout|dialog|sheet/i.test(node.id + ' ' + node.className)
                  || node.getAttribute('role') === 'dialog') {
                  container = node;
                  if (/overlay/i.test(node.id + ' ' + node.className)) break;
                }
              }
              if (!container) continue;
              const key = container.id || container.className;
              const group = groups.get(key) || {
                selector: container.id ? '#' + container.id : '.' + container.className.trim().split(/\s+/).join('.'),
                titles: [...container.querySelectorAll('h1,h2,h3,h4')].map(e => e.textContent.trim()).filter(Boolean),
                tables: []
              };
              group.tables.push({
                id: table.id,
                rows: table.rows.length,
                columns: [...new Set([...table.rows].map(row => row.cells.length))],
                labels: [...table.rows].filter(row => row.cells.length === 2).slice(0, 5).map(row => row.cells[0].textContent.trim())
              });
              groups.set(key, group);
            }
            for (const container of document.querySelectorAll('[id]')) {
              if (!/detail|record/i.test(container.id) || !/overlay|modal|popup|dialog/i.test(container.id + ' ' + container.className)) continue;
              if (groups.has(container.id)) continue;
              const titles = [...container.querySelectorAll('h1,h2,h3,h4')].map(e => e.textContent.trim()).filter(Boolean);
              if (!titles.length) continue;
              const heading = container.querySelector('h1,h2,h3,h4');
              let header = heading;
              let background = '';
              while (header && header !== container) {
                const style = getComputedStyle(header);
                if (style.backgroundImage !== 'none') { background = style.backgroundImage; break; }
                header = header.parentElement;
              }
              groups.set(container.id, { selector: '#' + container.id, titles, background, tables: [] });
            }
            return [...groups.values()];
          });
          if (result.length) inventory.push({ file: rel, dialogs: result });
        } catch (error) { inventory.push({ file: rel, error: error.message }); }
      }
      await page.close();
    }));
  } finally { await browser.close(); }
  inventory.sort((a, b) => a.file.localeCompare(b.file));
  await fs.writeFile(path.join(__dirname, 'detail_dialog_inventory.json'), JSON.stringify({ scannedPages: files.length, inventory }, null, 2));
  console.log('Scanned ' + files.length + ' HTML pages.');
  for (const page of inventory) console.log(JSON.stringify(page));
})().catch(error => { console.error(error); process.exitCode = 1; });
