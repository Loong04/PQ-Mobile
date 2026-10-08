/**
 * Export source fixtures and form definitions without introducing a backend.
 * Source archives are byte-for-byte; evaluated fixtures retain their expression
 * and provenance. Run: node tooling/migration/export-data.mjs --source ./source-snapshot
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { PROJECT_ROOT } from '../shared/paths.mjs';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import http from 'node:http';

const project = PROJECT_ROOT;
const argv = process.argv.slice(2);
const option = name => argv.includes(name) ? argv[argv.indexOf(name) + 1] : undefined;
const sourceRoot = path.resolve(option('--source') || path.join(project, 'source-snapshot'));
const snapshotDate = option('--date') || '2026-10-08T00:00:00+08:00';
const require = createRequire(import.meta.url);
let acorn;
try { acorn = require('acorn'); }
catch { acorn = require(path.join(sourceRoot, 'scratch/data-export-tools/node_modules/acorn')); }
let puppeteer;
try { puppeteer = require('puppeteer'); }
catch { puppeteer = createRequire(path.join(sourceRoot, 'package.json'))('puppeteer'); }
const excludedDirectories = new Set(['.git', '.agents', '.codex', '.claude', '.gemini', '.aws', '.pnpm-store', 'node_modules', 'scratch', 'dist', 'build', 'android', 'ios', 'docs']);
const extensions = new Set(['.html', '.js', '.css', '.json', '.sql', '.svg', '.txt', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.pdf', '.csv']);
const excludedFiles = new Set(['package-lock.json', 'pnpm-lock.yaml', 'skills-lock.json', 'debug.keystore']);
const hash = value => createHash('sha256').update(value).digest('hex');
const slash = value => value.split(path.sep).join('/');
const scripts = [];
const assets = [];
const datasets = [];
const pages = [];
const formFields = [];
const employees = [];
const runtimeErrors = [];
const parseErrors = [];
const byDatasetKey = new Map();

async function listFiles(directory, relative = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    const local = path.join(relative, entry.name);
    if (entry.isDirectory() && !excludedDirectories.has(entry.name)) result.push(...await listFiles(path.join(directory, entry.name), local));
    else if (entry.isFile() && extensions.has(path.extname(entry.name).toLowerCase()) && !excludedFiles.has(entry.name)) result.push(local);
  }
  return result;
}

function portable(value, seen = new WeakSet()) {
  if (value === undefined) return { $type: 'undefined' };
  if (typeof value === 'function') return { $type: 'function', source: value.toString() };
  if (typeof value === 'bigint') return { $type: 'bigint', value: String(value) };
  if (typeof value === 'number' && !Number.isFinite(value)) return { $type: 'number', value: String(value) };
  if (!value || typeof value !== 'object') return value;
  if (Object.prototype.toString.call(value) === '[object Date]') return { $type: 'date', value: value.toISOString() };
  if (Object.prototype.toString.call(value) === '[object RegExp]') return { $type: 'regexp', source: value.source, flags: value.flags };
  if (seen.has(value)) return { $type: 'circular_reference' };
  seen.add(value);
  if (Object.prototype.toString.call(value) === '[object Map]') return { $type: 'map', entries: [...value.entries()].map(row => portable(row, seen)) };
  if (Object.prototype.toString.call(value) === '[object Set]') return { $type: 'set', values: [...value.values()].map(row => portable(row, seen)) };
  const result = Array.isArray(value) ? value.map(item => portable(item, seen)) : Object.fromEntries(Object.entries(value).map(([key, item]) => [key, portable(item, seen)]));
  seen.delete(value);
  return result;
}

function addDataset(record) {
  const key = `${record.path}:${record.scriptIndex}:${record.offset}:${record.name}:${record.phase}:${record.pagePath || ''}`;
  const prior = byDatasetKey.get(key);
  if (prior) return prior;
  const dataset = { id: datasets.length + 1, ...record };
  datasets.push(dataset);
  byDatasetKey.set(key, dataset);
  return dataset;
}

function walk(node, visit, parent = null) {
  if (!node || typeof node !== 'object') return;
  if (node.type) visit(node, parent);
  for (const [key, value] of Object.entries(node)) {
    if (['start', 'end', 'loc', 'range'].includes(key)) continue;
    if (Array.isArray(value)) {
      for (const item of value) if (item?.type) walk(item, visit, node);
    } else if (value?.type) walk(value, visit, node);
  }
}

function parse(script, sourcePath, scriptIndex) {
  try { return acorn.parse(script, { ecmaVersion: 'latest', sourceType: 'script', locations: true, allowReturnOutsideFunction: true }); }
  catch (error) { parseErrors.push({ path: sourcePath, scriptIndex, message: error.message }); return null; }
}

function isContainerCandidate(node) {
  let found = false;
  walk(node, item => { if (item.type === 'ArrayExpression' || item.type === 'ObjectExpression') found = true; });
  return found;
}

// A fixed clock makes generated fixtures reproducible. These are tagged derived.
class SnapshotDate extends Date {
  constructor(...args) { super(...(args.length ? args : [snapshotDate])); }
  static now() { return new Date(snapshotDate).valueOf(); }
}
const knownGlobals = {};
function evaluateScriptFixtures(entry) {
  if (!entry.ast || entry.path.endsWith('lucide.min.js')) return;
  const contextObject = { window: { ...knownGlobals }, Date: SnapshotDate, console: { log() {}, warn() {}, error() {} } };
  const context = vm.createContext(contextObject, { codeGeneration: { strings: false, wasm: false } });
  const nodes = [];
  walk(entry.ast, (node, parent) => nodes.push({ node, parent }));
  // Hoist function declarations, but do not execute complete business scripts.
  for (const { node } of nodes) if (node.type === 'FunctionDeclaration' && node.id) {
    try { contextObject[node.id.name] = vm.runInContext(`(${entry.code.slice(node.start, node.end)})`, context, { timeout: 50 }); } catch {}
  }
  const resolvedRanges = [];
  for (const { node } of nodes.sort((a, b) => a.node.start - b.node.start)) {
    let expression;
    let name;
    let destination;
    if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier' && node.init) {
      expression = node.init; name = node.id.name; destination = value => { contextObject[name] = value; };
    } else if (node.type === 'AssignmentExpression' && node.operator === '=' && node.left.type === 'MemberExpression' && node.left.object.type === 'Identifier' && node.left.object.name === 'window') {
      expression = node.right; name = entry.code.slice(node.left.start, node.left.end); destination = value => {
        const property = node.left.computed ? node.left.property.value : node.left.property.name;
        if (property) { contextObject.window[property] = value; knownGlobals[property] = value; }
      };
    } else continue;
    const code = entry.code.slice(expression.start, expression.end);
    const candidate = isContainerCandidate(expression) || /^window\./.test(name);
    let value;
    try {
      value = vm.runInContext(`(${code})`, context, { timeout: 75 });
      destination(value);
      if (value && typeof value === 'object') {
        addDataset({ path: entry.path, scriptIndex: entry.scriptIndex, offset: expression.start, line: expression.loc.start.line, name, expression: code, status: 'evaluated', phase: 'static_evaluation', value: portable(value), error: null });
        resolvedRanges.push([expression.start, expression.end]);
      }
    } catch (error) {
      if (candidate) addDataset({ path: entry.path, scriptIndex: entry.scriptIndex, offset: expression.start, line: expression.loc.start.line, name, expression: code, status: 'source_only', phase: 'static_evaluation', value: null, error: error.message });
    }
  }
  // Fallback captures literals inside lazy initial() functions and event handlers.
  for (const { node } of nodes) {
    if (!['ArrayExpression', 'ObjectExpression'].includes(node.type)) continue;
    if (resolvedRanges.some(([from, to]) => node.start >= from && node.end <= to)) continue;
    const code = entry.code.slice(node.start, node.end);
    try {
      const value = vm.runInContext(`(${code})`, context, { timeout: 75 });
      addDataset({ path: entry.path, scriptIndex: entry.scriptIndex, offset: node.start, line: node.loc.start.line, name: `literal@${node.loc.start.line}:${node.loc.start.column}`, expression: code, status: 'evaluated', phase: 'static_literal', value: portable(value), error: null });
      resolvedRanges.push([node.start, node.end]);
    } catch {}
  }
}

function instrumentation(code, sourcePath, scriptIndex = 0) {
  const ast = parse(code, sourcePath, scriptIndex);
  if (!ast || sourcePath.endsWith('lucide.min.js')) return code;
  const edits = [];
  walk(ast, (node, parent) => {
    if (!parent || !['Program', 'BlockStatement'].includes(parent.type)) return;
    if (node.type === 'VariableDeclaration') {
      for (const declaration of node.declarations) if (declaration.id.type === 'Identifier' && declaration.init) {
        const reference = { path: sourcePath, scriptIndex, offset: declaration.init.start, line: declaration.loc.start.line, name: declaration.id.name };
        edits.push({ offset: node.end, text: `;window.__pqExportCapture(${JSON.stringify(reference)},${declaration.id.name});` });
      }
    }
    if (node.type === 'ExpressionStatement' && node.expression.type === 'AssignmentExpression') {
      const assignment = node.expression;
      if (assignment.left.type === 'MemberExpression' && assignment.left.object.type === 'Identifier' && assignment.left.object.name === 'window') {
        const name = code.slice(assignment.left.start, assignment.left.end);
        const reference = { path: sourcePath, scriptIndex, offset: assignment.right.start, line: assignment.loc.start.line, name };
        edits.push({ offset: node.end, text: `;window.__pqExportCapture(${JSON.stringify(reference)},${name});` });
      }
    }
  });
  for (const edit of edits.sort((a, b) => b.offset - a.offset)) code = code.slice(0, edit.offset) + edit.text + code.slice(edit.offset);
  return code;
}

function instrumentHtml(html, relativePath) {
  let index = 0;
  return html.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script\s*>)/gi, (full, opening, body, closing) => {
    const current = index++;
    if (/\bsrc\s*=|type\s*=\s*["'](?:application\/ld\+json|application\/json)/i.test(opening)) return full;
    return opening + instrumentation(body, relativePath, current) + closing;
  });
}

async function extractRuntime() {
  // Serve the bytes captured at the beginning of this export, so a simultaneous
  // editor in the source workspace cannot mix different versions in one seed.
  const snapshotAssets = new Map(assets.map(asset => [asset.path, asset]));
  const server = http.createServer(async (request, response) => {
    try {
      const relative = decodeURIComponent(new URL(request.url, 'http://localhost').pathname).replace(/^\/+/, '');
      const absolute = path.resolve(sourceRoot, relative);
      if (!absolute.startsWith(sourceRoot + path.sep) || excludedDirectories.has(relative.split('/')[0])) { response.writeHead(403); response.end(); return; }
      const capturedAsset = snapshotAssets.get(slash(relative));
      if (!capturedAsset) { response.writeHead(404); response.end(); return; }
      let content = capturedAsset.bytes;
      const extension = path.extname(relative);
      if (extension === '.html') content = Buffer.from(instrumentHtml(content.toString('utf8'), slash(relative)));
      if (extension === '.js') content = Buffer.from(instrumentation(content.toString('utf8'), slash(relative)));
      response.writeHead(200, { 'Content-Type': extension === '.html' ? 'text/html; charset=utf-8' : extension === '.js' ? 'application/javascript; charset=utf-8' : extension === '.css' ? 'text/css; charset=utf-8' : 'application/octet-stream' });
      response.end(content);
    } catch { response.writeHead(404); response.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    const executablePath = option('--chrome') || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : undefined);
    browser = await puppeteer.launch({ headless: true, ...(executablePath ? { executablePath } : {}), args: ['--no-sandbox', '--disable-gpu'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1000 });
    await page.setRequestInterception(true);
    page.on('request', request => request.url().startsWith(base) || request.url().startsWith('data:') ? request.continue() : request.abort());
    await page.emulateTimezone('Asia/Kuala_Lumpur');
    await page.evaluateOnNewDocument(fixedDate => {
      const NativeDate = Date;
      function FixedDate(...args) {
        if (!new.target) return new NativeDate(fixedDate).toString();
        return Reflect.construct(NativeDate, args.length ? args : [fixedDate], new.target);
      }
      FixedDate.prototype = NativeDate.prototype;
      Object.setPrototypeOf(FixedDate, NativeDate);
      FixedDate.now = () => new NativeDate(fixedDate).valueOf();
      window.Date = FixedDate;
      window.__pqExportRows = [];
      window.__pqExportCapture = (reference, value) => {
        if (!value || typeof value !== 'object' || value instanceof Element || value instanceof NodeList || value instanceof HTMLCollection) return;
        try {
          const seen = new WeakSet();
          const serialized = JSON.stringify(value, function (key, item) {
            if (typeof item === 'function') return { $type: 'function', source: item.toString() };
            if (typeof item === 'bigint') return { $type: 'bigint', value: String(item) };
            if (item instanceof Element) return { $type: 'dom_reference', id: item.id, tag: item.tagName };
            if (item instanceof Map) return { $type: 'map', entries: [...item] };
            if (item instanceof Set) return { $type: 'set', values: [...item] };
            if (item && typeof item === 'object') {
              if (seen.has(item)) return { $type: 'repeated_reference' };
              seen.add(item);
            }
            return item;
          });
          if (serialized.length < 3000000) window.__pqExportRows.push({ ...reference, value: JSON.parse(serialized) });
        } catch {}
      };
    }, snapshotDate);
    for (const [index, asset] of assets.filter(item => item.path.endsWith('.html')).entries()) {
      const errors = [];
      const onError = error => errors.push(error.message);
      page.on('pageerror', onError);
      try {
        await page.goto(`${base}/${asset.path}`, { waitUntil: 'load', timeout: 20000 });
        await new Promise(resolve => setTimeout(resolve, 30));
        const result = await page.evaluate(() => {
          const text = element => (element?.textContent || '').replace(/\s+/g, ' ').trim();
          const fields = [...document.querySelectorAll('input,select,textarea')].map((element, ordinal) => {
            const labels = element.labels ? [...element.labels].map(text) : [];
            const group = element.closest('.form-group,.input-group,.field-group,.form-field,.form-row,.filter-field,.input-field');
            const nearbyLabel = group?.querySelector('label,.field-label,.input-label,.form-label');
            if (!labels.length && nearbyLabel) labels.push(text(nearbyLabel));
            return {
              ordinal, elementId: element.id || '', name: element.name || '', tag: element.tagName.toLowerCase(), type: element.type || '',
              labels, placeholder: element.getAttribute('placeholder') || '', defaultValue: element.value,
              required: element.required, disabled: element.disabled, readOnly: element.readOnly || false, multiple: element.multiple || false,
              checked: element.checked || false, attributes: Object.fromEntries([...element.attributes].map(item => [item.name, item.value])),
              options: element.tagName === 'SELECT' ? [...element.options].map((item, optionOrdinal) => ({ ordinal: optionOrdinal, value: item.value, label: text(item), selected: item.selected, disabled: item.disabled })) : []
            };
          });
          return { title: document.title, text: document.body.innerText || text(document.body), fields, rows: window.__pqExportRows || [] };
        });
        const pageRecord = { id: pages.length + 1, sourceAssetId: asset.id, path: asset.path, title: result.title, text: result.text, fieldCount: result.fields.length, runtimeErrorCount: errors.length };
        pages.push(pageRecord);
        for (const field of result.fields) formFields.push({ id: formFields.length + 1, pageId: pageRecord.id, pagePath: asset.path, ...field });
        for (const row of result.rows) {
          const entry = scripts.find(item => item.path === row.path && item.scriptIndex === row.scriptIndex);
          if (entry && !entry.expressionMap) {
            entry.expressionMap = new Map();
            walk(entry.ast, node => {
              const expression = node.type === 'VariableDeclarator' ? node.init : node.type === 'AssignmentExpression' ? node.right : null;
              if (expression) entry.expressionMap.set(expression.start, entry.code.slice(expression.start, expression.end));
            });
          }
          addDataset({ ...row, expression: entry?.expressionMap?.get(row.offset) || '', status: 'evaluated', phase: 'runtime_initialization', pagePath: asset.path, error: null });
        }
        for (const message of errors) runtimeErrors.push({ page: asset.path, message });
      } catch (error) { runtimeErrors.push({ page: asset.path, message: error.message, fatal: true }); }
      page.off('pageerror', onError);
      if ((index + 1) % 20 === 0) console.log(`Inspected ${index + 1} source pages; ${datasets.length} fixture snapshots; ${formFields.length} input controls.`);
    }
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

const records = [];
function collectRecords(dataset) {
  function visit(value, pointer = '') {
    if (Array.isArray(value)) for (const [ordinal, row] of value.entries()) {
      const location = `${pointer}/${ordinal}`;
      records.push({ id: records.length + 1, datasetId: dataset.id, pointer: location, ordinal, value: row });
      if (Array.isArray(row) && typeof row[0] === 'string' && typeof row[1] === 'string' && /^(?:[A-Z]{1,8}\d+|\d{3,})$/.test(row[0]) && /[a-z]/i.test(row[1])) {
        employees.push({ id: employees.length + 1, datasetId: dataset.id, pointer: location, empNo: row[0], name: row[1], value: row });
      }
      visit(row, location);
    }
    else if (value && typeof value === 'object') {
      if (!value.$type) {
        const empNo = value.empNo || value.employeeId || value.employeeNo;
        const name = value.name || value.employeeName || value.empName;
        if ((typeof empNo === 'string' || typeof empNo === 'number') && typeof name === 'string') employees.push({ id: employees.length + 1, datasetId: dataset.id, pointer, empNo: String(empNo), name, value });
      }
      for (const [key, child] of Object.entries(value)) visit(child, `${pointer}/${key.replace(/~/g, '~0').replace(/\//g, '~1')}`);
    }
  }
  if (dataset.status === 'evaluated') visit(dataset.value);
}

const sqlText = value => value === null || value === undefined ? 'NULL' : String(value) === '' ? "''" : `CONVERT(0x${Buffer.from(String(value), 'utf8').toString('hex')} USING utf8mb4)`;
const sqlJson = value => sqlText(JSON.stringify(value));
function makeSql(manifest) {
  const sql = [
    '-- PeopleHCM Web source fixture export. MySQL 8.0; no backend required.',
    '-- Business fixture rows, UI definitions and immutable source archives are distinct.',
    '-- Select a database before importing. Re-running this seed requires an empty schema.',
    '-- Source data includes personal information already present in the supplied project.',
    'SET NAMES utf8mb4;',
    'SET time_zone = \'+00:00\';',
    'CREATE TABLE IF NOT EXISTS export_metadata (meta_key VARCHAR(100) PRIMARY KEY, meta_value JSON NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;',
    'CREATE TABLE IF NOT EXISTS source_assets (id INT UNSIGNED PRIMARY KEY, source_path VARCHAR(512) NOT NULL, mime_type VARCHAR(100) NOT NULL, sha256 CHAR(64) NOT NULL, byte_length INT UNSIGNED NOT NULL, source_bytes LONGBLOB NOT NULL, UNIQUE KEY uq_source_path (source_path)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;',
    'CREATE TABLE IF NOT EXISTS source_pages (id INT UNSIGNED PRIMARY KEY, source_asset_id INT UNSIGNED NOT NULL, page_path VARCHAR(512) NOT NULL, title VARCHAR(512) NOT NULL, text_snapshot LONGTEXT NOT NULL, field_count INT UNSIGNED NOT NULL, runtime_error_count INT UNSIGNED NOT NULL, FOREIGN KEY (source_asset_id) REFERENCES source_assets(id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;',
    'CREATE TABLE IF NOT EXISTS form_fields (id INT UNSIGNED PRIMARY KEY, page_id INT UNSIGNED NOT NULL, ordinal INT UNSIGNED NOT NULL, element_id VARCHAR(255) NOT NULL, control_name VARCHAR(255) NOT NULL, tag_name VARCHAR(20) NOT NULL, input_type VARCHAR(50) NOT NULL, definition JSON NOT NULL, FOREIGN KEY (page_id) REFERENCES source_pages(id), KEY ix_field_page (page_id,ordinal)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;',
    'CREATE TABLE IF NOT EXISTS datasets (id INT UNSIGNED PRIMARY KEY, source_path VARCHAR(512) NOT NULL, script_index INT UNSIGNED NOT NULL, source_offset INT UNSIGNED NOT NULL, source_line INT UNSIGNED NOT NULL, dataset_name VARCHAR(512) NOT NULL, extraction_status ENUM(\'evaluated\',\'source_only\') NOT NULL, extraction_phase VARCHAR(50) NOT NULL, initialized_by_page VARCHAR(512) NULL, source_expression LONGTEXT NOT NULL, data_json JSON NULL, evaluation_error TEXT NULL, KEY ix_dataset_source (source_path), KEY ix_dataset_phase (extraction_phase)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;',
    'CREATE TABLE IF NOT EXISTS dataset_records (id INT UNSIGNED PRIMARY KEY, dataset_id INT UNSIGNED NOT NULL, json_pointer TEXT NOT NULL, ordinal INT UNSIGNED NOT NULL, record_json JSON NOT NULL, FOREIGN KEY (dataset_id) REFERENCES datasets(id), KEY ix_record_dataset (dataset_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;',
    'CREATE TABLE IF NOT EXISTS employee_references (id INT UNSIGNED PRIMARY KEY, dataset_id INT UNSIGNED NOT NULL, json_pointer TEXT NOT NULL, emp_no VARCHAR(255) NOT NULL, employee_name VARCHAR(512) NOT NULL, source_record JSON NOT NULL, FOREIGN KEY (dataset_id) REFERENCES datasets(id), KEY ix_employee_number (emp_no), KEY ix_employee_dataset (dataset_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;',
    'START TRANSACTION;',
    `INSERT INTO export_metadata VALUES ('manifest',${sqlJson(manifest)});`
  ];
  for (const asset of assets) sql.push(`INSERT INTO source_assets VALUES (${asset.id},${sqlText(asset.path)},${sqlText(asset.mimeType)},${sqlText(asset.sha256)},${asset.bytes.length},${asset.bytes.length ? '0x' + asset.bytes.toString('hex') : "X''"});`);
  for (const page of pages) sql.push(`INSERT INTO source_pages VALUES (${page.id},${page.sourceAssetId},${sqlText(page.path)},${sqlText(page.title)},${sqlText(page.text)},${page.fieldCount},${page.runtimeErrorCount});`);
  for (const field of formFields) sql.push(`INSERT INTO form_fields VALUES (${field.id},${field.pageId},${field.ordinal},${sqlText(field.elementId)},${sqlText(field.name)},${sqlText(field.tag)},${sqlText(field.type)},${sqlJson(field)});`);
  for (const dataset of datasets) sql.push(`INSERT INTO datasets VALUES (${dataset.id},${sqlText(dataset.path)},${dataset.scriptIndex},${dataset.offset},${dataset.line},${sqlText(dataset.name)},${sqlText(dataset.status)},${sqlText(dataset.phase)},${sqlText(dataset.pagePath || null)},${sqlText(dataset.expression)},${dataset.status === 'source_only' ? 'NULL' : sqlJson(dataset.value)},${sqlText(dataset.error)});`);
  for (const record of records) sql.push(`INSERT INTO dataset_records VALUES (${record.id},${record.datasetId},${sqlText(record.pointer)},${record.ordinal},${sqlJson(record.value)});`);
  for (const employee of employees) sql.push(`INSERT INTO employee_references VALUES (${employee.id},${employee.datasetId},${sqlText(employee.pointer)},${sqlText(employee.empNo)},${sqlText(employee.name)},${sqlJson(employee.value)});`);
  sql.push('COMMIT;', '');
  return sql.join('\n');
}

for (const relativePath of await listFiles(sourceRoot)) {
  const bytes = await readFile(path.join(sourceRoot, relativePath));
  const sourcePath = slash(relativePath);
  const extension = path.extname(relativePath);
  assets.push({ id: assets.length + 1, path: sourcePath, bytes, sha256: hash(bytes), mimeType: ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.sql': 'application/sql', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.pdf': 'application/pdf', '.csv': 'text/csv' })[extension] || 'text/plain' });
  if (extension === '.js') { const code = bytes.toString('utf8'); scripts.push({ path: sourcePath, scriptIndex: 0, code, ast: parse(code, sourcePath, 0) }); }
  if (extension === '.html') {
    let scriptIndex = 0;
    for (const match of bytes.toString('utf8').matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
      const index = scriptIndex++;
      if (/\bsrc\s*=|type\s*=\s*["'](?:application\/ld\+json|application\/json)/i.test(match[1])) continue;
      scripts.push({ path: sourcePath, scriptIndex: index, code: match[2], ast: parse(match[2], sourcePath, index) });
    }
  }
}
// Data-first evaluation allows data fixtures to refer to shared lookup objects.
const priority = entry => entry.path.includes('history-data') ? 0 : /(?:-data|config)\.js$/.test(entry.path) ? 1 : entry.path.endsWith('.js') ? 2 : 3;
for (const entry of [...scripts].sort((a, b) => priority(a) - priority(b))) evaluateScriptFixtures(entry);
await extractRuntime();
for (const dataset of datasets) collectRecords(dataset);
const seed = { formatVersion: 1, snapshotDate, dialect: 'MySQL 8', pages, formFields, datasets, employees };
const counts = { sourceAssets: assets.length, archivedBytes: assets.reduce((total, asset) => total + asset.bytes.length, 0), scripts: scripts.length, pages: pages.length, formFields: formFields.length, selectFields: formFields.filter(item => item.tag === 'select').length, selectOptions: formFields.reduce((total, field) => total + field.options.length, 0), datasets: datasets.length, evaluatedDatasets: datasets.filter(item => item.status === 'evaluated').length, sourceOnlyDatasets: datasets.filter(item => item.status === 'source_only').length, records: records.length, employeeReferences: employees.length, uniqueEmployeeNumbers: new Set(employees.map(item => item.empNo)).size, runtimeErrors: runtimeErrors.length, parseErrors: parseErrors.length };
const manifest = { formatVersion: 1, dialect: 'MySQL 8.0', snapshotDate, sourceDirectoryName: path.basename(sourceRoot), counts, seedSha256: hash(Buffer.from(JSON.stringify(seed))), sources: assets.map(({ bytes, mimeType, ...asset }) => ({ ...asset, mimeType, byteLength: bytes.length })), runtimeErrors, parseErrors, excludedDirectories: [...excludedDirectories], excludedFiles: [...excludedFiles], limitations: ['Only fixtures already present in the source project are exported; no production database was supplied.', 'Source archives preserve all markup, scripts, stylesheet data, supplied images and formulas byte-for-byte. They are not normalized business rows.', 'Dynamic browser snapshots reflect initial page load only. Later interaction-only datasets remain in source expressions/archives.', 'Employee references preserve each source occurrence independently; contradictory fixtures are not merged.', 'Runtime snapshots use snapshotDate in Asia/Kuala_Lumpur. Static generated dates use snapshotDate and the host timezone.'] };
await mkdir(path.join(project, 'database'), { recursive: true });
await mkdir(path.join(project, 'public/data'), { recursive: true });
await writeFile(path.join(project, 'public/data/seed.json'), JSON.stringify(seed));
await writeFile(path.join(project, 'database/export-manifest.json'), JSON.stringify(manifest, null, 2));
await writeFile(path.join(project, 'database/peoplehcm-source.sql'), makeSql(manifest));
console.log(JSON.stringify(counts, null, 2));
