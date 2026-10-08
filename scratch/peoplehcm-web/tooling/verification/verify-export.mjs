import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { PROJECT_ROOT } from '../shared/paths.mjs';

const project = PROJECT_ROOT;
const source = path.resolve(process.argv[2] || path.join(project, 'source-snapshot'));
const manifest = JSON.parse(await readFile(path.join(project, 'database/export-manifest.json'), 'utf8'));
const seed = JSON.parse(await readFile(path.join(project, 'public/data/seed.json'), 'utf8'));
const sql = await readFile(path.join(project, 'database/peoplehcm-source.sql'), 'utf8');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const sqlLines = sql.split('\n');
const sourceLines = new Map(sqlLines.filter(line => line.startsWith('INSERT INTO source_assets VALUES ')).map(line => [Number(/^INSERT INTO source_assets VALUES \((\d+),/.exec(line)[1]), line]));
function valuesFromInsert(line) {
  const body = line.slice(line.indexOf(' VALUES (') + 9, -2);
  const values = [];
  let nesting = 0;
  let quote = false;
  let start = 0;
  for (let index = 0; index < body.length; index++) {
    const character = body[index];
    if (character === "'") quote = !quote;
    else if (!quote && character === '(') nesting++;
    else if (!quote && character === ')') nesting--;
    else if (!quote && !nesting && character === ',') { values.push(body.slice(start, index)); start = index + 1; }
  }
  values.push(body.slice(start));
  return values;
}
function decode(token) {
  if (token === 'NULL') return null;
  if (token === "''") return '';
  const match = /^CONVERT\(0x([a-f0-9]+) USING utf8mb4\)$/.exec(token);
  return match ? Buffer.from(match[1], 'hex').toString('utf8') : Number(token);
}

assert.equal(seed.formatVersion, 1);
assert.equal(seed.datasets.length, manifest.counts.datasets);
assert.equal(seed.pages.length, manifest.counts.pages);
assert.equal(seed.formFields.length, manifest.counts.formFields);
assert.equal(seed.employees.length, manifest.counts.employeeReferences);
assert(sql.includes('START TRANSACTION;'));
assert(sql.endsWith('COMMIT;\n'));
assert(!sql.includes('DROP TABLE'));
assert(!sql.includes('CONVERT(0x USING'), 'Empty strings must use valid MySQL literals');
assert(!/^INSERT INTO dataset_records VALUES .*?,NULL\);$/m.test(sql), 'A JSON null record must not become a SQL NULL');
assert(manifest.sources.some(item => item.path === 'assets/img/ea-form-preview.jpeg'));

let verifiedBytes = 0;
for (const asset of manifest.sources) {
  const bytes = await readFile(path.join(source, asset.path));
  assert.equal(digest(bytes), asset.sha256, `${asset.path}: source digest changed`);
  const line = sourceLines.get(asset.id);
  assert(line, `${asset.path}: missing source INSERT`);
  const encoded = /,0x([a-f0-9]*)\);$/.exec(line);
  assert(encoded, `${asset.path}: missing source bytes`);
  assert.deepEqual(Buffer.from(encoded[1], 'hex'), bytes, `${asset.path}: SQL is not lossless`);
  verifiedBytes += bytes.length;
}
assert.equal(manifest.counts.archivedBytes, verifiedBytes);
assert.equal(manifest.counts.pages, manifest.sources.filter(item => item.path.endsWith('.html')).length);
assert.equal(seed.formFields.filter(item => item.tag === 'select').length, manifest.counts.selectFields);
assert(seed.formFields.every(item => Array.isArray(item.options) && typeof item.pagePath === 'string'));
assert(seed.datasets.some(item => item.name === 'window.HOURS_COSTING_REPORT' && item.value?.records?.some(row => row.empNo === '004101' && row.costVal === 192)));
assert(seed.datasets.some(item => /confirmNewUserProfiles/.test(item.name) && item.value?.some?.(row => row.name === 'TAN SIOW WEI' && row.birthDate === '1992-07-27')));
assert(seed.datasets.some(item => /PAYROLL_PENDING_DATA/.test(item.name) && item.value?.tax?.length === 10));
assert(seed.datasets.some(item => /EMPLOYEE_CAREER_ATTRITION_DATA/.test(item.name) && item.value?.length === 22));
assert(seed.datasets.some(item => item.status === 'source_only' && item.value === null && typeof item.expression === 'string'));
assert(seed.employees.some(item => item.empNo === 'EBB01'));

const formsInSql = (sql.match(/^INSERT INTO form_fields VALUES /gm) || []).length;
const datasetsInSql = (sql.match(/^INSERT INTO datasets VALUES /gm) || []).length;
assert.equal(formsInSql, seed.formFields.length);
assert.equal(datasetsInSql, seed.datasets.length);
assert.equal(digest(Buffer.from(JSON.stringify(seed))), manifest.seedSha256);
const datasetById = new Map(seed.datasets.map(item => [item.id, item]));
const fieldById = new Map(seed.formFields.map(item => [item.id, item]));
const employeeById = new Map(seed.employees.map(item => [item.id, item]));
let jsonRows = 0;
let recordRows = 0;
for (const line of sqlLines) {
  if (!/^INSERT INTO (datasets|dataset_records|form_fields|employee_references) VALUES /.test(line)) continue;
  const values = valuesFromInsert(line);
  const id = Number(values[0]);
  if (line.startsWith('INSERT INTO datasets ')) {
    const dataset = datasetById.get(id);
    const decoded = decode(values[10]);
    assert.deepEqual(decoded === null ? null : JSON.parse(decoded), dataset.value, `${dataset.path}:${dataset.name}: SQL dataset mismatch`);
    assert.equal(decode(values[9]), dataset.expression);
  } else if (line.startsWith('INSERT INTO form_fields ')) {
    assert.deepEqual(JSON.parse(decode(values[7])), fieldById.get(id));
  } else if (line.startsWith('INSERT INTO employee_references ')) {
    const employee = employeeById.get(id);
    assert.equal(decode(values[3]), employee.empNo, 'Employee IDs must preserve leading zeros');
    assert.deepEqual(JSON.parse(decode(values[5])), employee.value);
  } else {
    const dataset = datasetById.get(Number(values[1]));
    const pointer = decode(values[2]);
    const value = pointer.split('/').slice(1).reduce((parent, segment) => parent[segment.replace(/~1/g, '/').replace(/~0/g, '~')], dataset.value);
    assert.deepEqual(JSON.parse(decode(values[4])), value);
    recordRows++;
  }
  jsonRows++;
}
assert.equal(recordRows, manifest.counts.records);
assert(jsonRows > 30000);
console.log(JSON.stringify({ verified: true, ...manifest.counts, verifiedBytes, verifiedJsonRows: jsonRows }, null, 2));
