const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = 'me.html';
const before = fs.readFileSync(path, 'utf8');
fs.writeFileSync('scratch/profile-polish-before.html', before);

function divAt(source, start) {
  const tags = /<div\b[^>]*>|<\/div>/g;
  tags.lastIndex = start;
  let depth = 0;
  let firstEnd;
  for (let tag; (tag = tags.exec(source));) {
    if (tag[0].startsWith('</')) depth--;
    else {
      depth++;
      if (firstEnd === undefined) firstEnd = tags.lastIndex;
    }
    if (depth === 0) return { end: tags.lastIndex, inner: source.slice(firstEnd, tag.index) };
  }
  throw new Error('Unclosed profile div');
}

const start = before.indexOf('<main class="main-content profile-details"');
const end = before.indexOf('</main>', start);
assert.ok(start > 0 && end > start);
let main = before.slice(start, end);
let count = 0;
let cursor = 0;
while (true) {
  const panelStart = main.indexOf('<div class="profile-panel">', cursor);
  if (panelStart < 0) break;
  const panel = divAt(main, panelStart);
  const groupStart = panel.inner.indexOf('<div class="profile-group">');
  if (groupStart < 0) { cursor = panel.end; continue; }
  const groups = [];
  let groupCursor = 0;
  while (true) {
    const offset = panel.inner.indexOf('<div class="profile-group">', groupCursor);
    if (offset < 0) break;
    const group = divAt(panel.inner, offset);
    const title = group.inner.match(/<h3 class="profile-group-title">([^]*?)<\/h3>/)[1];
    const slug = title.toLowerCase().replace(/[^a-z]+/g, '-');
    groups.push('<div class="profile-panel profile-group profile-group-' + slug + '">' + group.inner + '</div>');
    groupCursor = group.end;
    count++;
  }
  const replacement = groups.join('\n        ');
  main = main.slice(0, panelStart) + replacement + main.slice(panel.end);
  cursor = panelStart + replacement.length;
}
assert.equal(count, 13, 'All 13 detail groups become sibling panels');

const wide = new Set(['Company', 'Branch', 'Department', 'Position', 'Benefit scheme', 'Reporting to', 'Reason', 'Personal email', 'Company email', 'Contact address', 'Account #', 'Name', 'Other institute name', 'Notes']);
main = main.replace(/<div class="profile-field">(\s*<dt>([^]*?)<\/dt>)/g, (match, content, label) => {
  const classes = ['profile-field'];
  if (wide.has(label)) classes.push('profile-field-wide');
  if (label === 'Company' || label === 'Bank') classes.push('profile-field-primary');
  if (label === 'Position') classes.push('profile-field-role');
  return '<div class="' + classes.join(' ') + '">' + content;
});

// Presentation case changes only; required values and identifiers stay intact.
main = main.replace('PEOPLE QUEST SDN BHD', 'People Quest Sdn Bhd')
  .replace('TIMES SQUARE BRANCH', 'Times Square Branch')
  .replace('PRODUCT &amp; DESIGN', 'Product &amp; Design')
  .replace('SENIOR PRODUCT DESIGNER', 'Senior Product Designer');

const after = before.slice(0, start) + main + before.slice(end);
fs.writeFileSync(path, after);
console.log('Updated 13 grouped panels; all fields, records, header, navigation and scripts preserved.');
