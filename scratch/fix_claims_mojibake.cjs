const fs = require('fs');
const path = require('path');

const reverse1252 = new Map([
  [0x20ac,0x80],[0x201a,0x82],[0x0192,0x83],[0x201e,0x84],[0x2026,0x85],[0x2020,0x86],[0x2021,0x87],
  [0x02c6,0x88],[0x2030,0x89],[0x0160,0x8a],[0x2039,0x8b],[0x0152,0x8c],[0x017d,0x8e],
  [0x2018,0x91],[0x2019,0x92],[0x201c,0x93],[0x201d,0x94],[0x2022,0x95],[0x2013,0x96],[0x2014,0x97],
  [0x02dc,0x98],[0x2122,0x99],[0x0161,0x9a],[0x203a,0x9b],[0x0153,0x9c],[0x017e,0x9e],[0x0178,0x9f]
]);
const byteOf = char => {
  const cp = char.codePointAt(0);
  if (cp <= 0xff) return cp;
  return reverse1252.get(cp);
};
const utf8Length = byte => byte >= 0xf0 && byte <= 0xf4 ? 4 : byte >= 0xe0 && byte <= 0xef ? 3 : byte >= 0xc2 && byte <= 0xdf ? 2 : 0;
function repairOnce(text) {
  const chars = Array.from(text);
  let output = '';
  for (let index = 0; index < chars.length;) {
    const first = byteOf(chars[index]);
    const length = utf8Length(first);
    if (!length || index + length > chars.length) { output += chars[index++]; continue; }
    const bytes = chars.slice(index, index + length).map(byteOf);
    const continuationValid = bytes.slice(1).every(byte => byte !== undefined && byte >= 0x80 && byte <= 0xbf);
    if (!continuationValid) { output += chars[index++]; continue; }
    const decoded = Buffer.from(bytes).toString('utf8');
    if (decoded.includes('\ufffd')) { output += chars[index++]; continue; }
    output += decoded;
    index += length;
  }
  return output;
}
function repair(text) {
  let current = text;
  for (let pass = 0; pass < 4; pass += 1) {
    const next = repairOnce(current);
    if (next === current) break;
    current = next;
  }
  return current;
}
function filesUnder(root) {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(root, entry.name);
    return entry.isDirectory() ? filesUnder(full) : /\.(?:html|js)$/.test(entry.name) ? [full] : [];
  });
}
const files = [...filesUnder('modules/claims'), ...filesUnder('js/claims')];
let changed = 0;
for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  const after = repair(before);
  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8');
    changed += 1;
    process.stdout.write(`${file}\n`);
  }
}
process.stdout.write(`Repaired ${changed} Claims files.\n`);
