const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const appJs = fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8');
const appCss = fs.readFileSync(path.join(root, 'css', 'app.css'), 'utf8');

assert.match(appJs, /function initStandardFilterSummaries\(root = document\)/);
assert.match(appJs, /fa-solid fa-filter standard-filter-summary-icon/);
assert.match(appJs, /standard-filter-summary-value/);
assert.match(appJs, /standard-filter-summary-card/);
assert.match(appJs, /DOMContentLoaded', initStandardFilterSummaries/);

for (const className of [
  'standard-filter-summary-card',
  'standard-filter-summary-value',
  'standard-filter-summary-icon',
  'standard-filter-summary-trigger'
]) {
  assert.match(appCss, new RegExp(`\\.${className}\\b`), `Missing shared .${className} style`);
}

const sourceFiles = [];
function collectHtml(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'scratch', 'no'].includes(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) collectHtml(fullPath);
    else if (entry.name.endsWith('.html')) sourceFiles.push(fullPath);
  }
}
collectHtml(root);

const filterPages = sourceFiles.filter(file => {
  const source = fs.readFileSync(file, 'utf8');
  return /current filter/i.test(source) || /class=["'][^"']*payroll-filter-trigger/.test(source);
});

assert.ok(filterPages.length >= 25, 'Expected a full-system filter page inventory');
for (const file of filterPages) {
  const source = fs.readFileSync(file, 'utf8');
  assert.match(source, /(?:\.\.\/)*js\/app\.js/, `${path.relative(root, file)} must load shared app.js`);
}

console.log(`PASS: Shared filter icon standard covers ${filterPages.length} system pages.`);
