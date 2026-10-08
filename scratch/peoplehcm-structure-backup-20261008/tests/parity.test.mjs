/** Source-preservation tests. Run with Node's built-in test runner; no packages needed. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = path.join(root, 'public');
const workspace = path.join(publicRoot, 'workspace');
const manifestPath = path.join(root, 'docs', 'source-manifest.json');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : null;
const sourceRoot = path.resolve(process.env.SOURCE_ROOT || path.join(root, 'source-snapshot'));
const hasSource = fs.existsSync(path.join(sourceRoot, 'index.html')) && fs.existsSync(path.join(sourceRoot, 'modules'));
const slash = value => value.replaceAll('\\', '/');
const read = file => fs.readFileSync(file, 'utf8');
const hash = value => createHash('sha256').update(value).digest('hex');
const files = manifest?.files || [];
const htmlFiles = files.filter(file => /\.html$/i.test(file.path));
const routes = JSON.parse(read(path.join(root, 'src', 'generated', 'pages.json')));
const aliases = [
  ['homedark-v2.html', 'index.html'],
  ['modules/leave/options/apply.html', 'leave.html'],
  ['modules/leave/options/balance.html', 'leave.html'],
  ['modules/leave/options/history.html', 'leave.html'],
  ['modules/leave/options/team.html', 'leave.html'],
  ['modules/me/options/personal.html', 'me.html'],
  ['modules/me/options/qualification.html', 'me.html'],
  ['modules/me/options/payroll.html', 'me.html'],
  ['modules/me/options/contacts.html', 'me.html'],
  ['modules/me/options/family.html', 'me.html'],
  ['modules/me/options/change-request.html', 'change-request.html'],
];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
function sourceAssets() {
  return fs.readdirSync(sourceRoot, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(sourceRoot, entry.name);
    if (entry.isDirectory() && ['css', 'js', 'modules', 'assets'].includes(entry.name)) return walk(file);
    if (entry.isFile() && /\.(?:html|jpg|png|svg|jpeg|webp)$/i.test(entry.name)) return [file];
    return [];
  }).map(file => slash(path.relative(sourceRoot, file))).sort();
}
function inlineScripts(html) {
  return [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(match => !/\bsrc\s*=/i.test(match[1]))
    .map(match => match[2]);
}
function fieldMarkup(html) {
  return [...html.matchAll(/<input\b[^>]*>|<select\b[^>]*>[\s\S]*?<\/select>|<textarea\b[^>]*>[\s\S]*?<\/textarea>/gi)]
    .map(match => match[0]);
}
function optionMarkup(html) {
  return [...html.matchAll(/<option\b[^>]*>[\s\S]*?<\/option>/gi)].map(match => match[0]);
}
function normalizePresentation(html) {
  // Remove only explicitly marked adapter dependencies, including their bodies.
  // An original stylesheet before a malformed doctype remains in this comparison.
  return html
    .replace(/<html\b([^>]*)>/i, (_match, attributes) => '<html' + attributes
      .replace(/\sdata-theme=["'][^"']*["']/gi, '')
      .replace(/\sdata-peoplehcm-web(?:=["'][^"']*["'])?/gi, '')
      .replace(/\sdata-web-native(?:=["'][^"']*["'])?/gi, '') + '>')
    .replace(/<script\b(?=[^>]*\bdata-web-presentation\b)[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<link\b(?=[^>]*\bdata-web-presentation\b)[^>]*>/gi, '')
    .replace(/https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/[^"']+\/css\/all\.min\.css|\/vendor\/fontawesome\/css\/all\.min\.css/g, '__LOCAL_ICON_CSS__')
    .replace(/https:\/\/fonts\.googleapis\.com\/css2?[^"']*|\/vendor\/fonts\.css/g, '__LOCAL_FONT_CSS__')
    .replace(/(<meta\s+name=["']viewport["']\s+content=["'])[^"']*(["'][^>]*>)/i, '$1__RESPONSIVE_VIEWPORT__$2')
    // Injection adds a newline before closing head/body. Ignore blank separator
    // lines without changing whitespace inside scripts, fields or text nodes.
    .replace(/\s+(?=<\/head>)/gi, '')
    .replace(/\s+(?=<\/body>)/gi, '');
}
function resolveLocal(from, reference) {
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(reference)) return null;
  const clean = reference.replaceAll('&amp;', '&').split(/[?#]/)[0];
  if (!clean || /\$\{|[<>]/.test(clean)) return null;
  return clean.startsWith('/') ? path.resolve(publicRoot, '.' + clean)
    : path.resolve(path.dirname(from), clean);
}

test('mobile source is preserved in the web workspace', async context => {
  await context.test('migration manifest exists and routes are complete', () => {
    assert.ok(manifest, 'Run npm run migrate before parity tests: docs/source-manifest.json is missing.');
    assert.ok(Array.isArray(manifest.files) && files.length, 'Source manifest must contain all copied assets.');
    assert.equal(new Set(files.map(file => file.path)).size, files.length, 'Duplicate source-manifest paths.');
    assert.equal(new Set(routes.map(route => route.path)).size, routes.length, 'Duplicate registered route.');
    assert.equal(routes.length, 118, 'The source audit contains 118 original HTML pages.');
    const originalRoutes = htmlFiles.map(file => file.path).sort();
    assert.deepEqual(originalRoutes, routes.map(route => route.path).sort(), 'Every original HTML page must be copied and registered.');
    if (process.env.SOURCE_ROOT) assert.ok(hasSource, 'SOURCE_ROOT was explicitly configured but the original project cannot be read.');
  });
  if (!manifest) return;

  await context.test('every source-manifest asset exists', () => {
    for (const file of files) {
      assert.match(file.sha256, /^[0-9a-f]{64}$/, `Invalid original hash for ${file.path}`);
      assert.ok(fs.existsSync(path.join(workspace, file.path)), `Missing copied source asset: ${file.path}`);
    }
  });

  await context.test('all original business JavaScript, CSS, data and image assets have identical bytes', () => {
    for (const file of files.filter(item => !/\.html$/i.test(item.path))) {
      assert.equal(hash(fs.readFileSync(path.join(workspace, file.path))), file.sha256,
        `Original asset changed: ${file.path}`);
    }
  });

  await context.test('copied HTML matches its audited post-migration hashes without needing the original project', () => {
    for (const file of htmlFiles) {
      assert.match(file.webSha256 || '', /^[0-9a-f]{64}$/, `Missing post-migration HTML hash for ${file.path}`);
      assert.equal(hash(fs.readFileSync(path.join(workspace, file.path))), file.webSha256,
        `Migrated HTML differs from recorded output: ${file.path}`);
    }
  });

  await context.test('original inline business scripts are byte-identical to recorded source hashes', () => {
    for (const file of htmlFiles) {
      assert.ok(Array.isArray(file.inlineScriptsSha256), `Missing inline-script baseline for ${file.path}`);
      const bodies = inlineScripts(read(path.join(workspace, file.path)));
      assert.deepEqual(bodies.map(hash), file.inlineScriptsSha256,
        `Inline business script changed: ${file.path}`);
    }
  });

  await context.test('original control markup is byte-identical to recorded source hashes without the source project', () => {
    for (const file of htmlFiles) {
      assert.ok(Array.isArray(file.fieldMarkupSha256), `Missing field-markup baseline for ${file.path}`);
      assert.deepEqual(fieldMarkup(read(path.join(workspace, file.path))).map(hash), file.fieldMarkupSha256,
        `Input/select/textarea markup changed: ${file.path}`);
    }
  });

  await context.test('original-source asset set equals the migration manifest', { skip: !hasSource && 'Original project unavailable; independent manifest verification still runs.' }, () => {
    assert.deepEqual(files.map(file => file.path).sort(), sourceAssets(),
      'The migration manifest must cover the original CSS/JS/modules/assets trees and root HTML/images.');
    for (const file of files) {
      assert.equal(hash(fs.readFileSync(path.join(sourceRoot, file.path))), file.sha256,
        `Original source changed after migration: ${file.path}`);
    }
  });

  await context.test('HTML changes are limited to fonts, responsive viewport, initial theme and marked presentation dependencies', { skip: !hasSource }, () => {
    for (const file of htmlFiles) {
      const original = read(path.join(sourceRoot, file.path));
      const migrated = read(path.join(workspace, file.path));
      assert.equal(normalizePresentation(migrated), normalizePresentation(original),
        `Unapproved business HTML mutation: ${file.path}`);
    }
  });

  await context.test('every input, select, textarea and select option remains exactly unchanged', { skip: !hasSource }, () => {
    for (const file of htmlFiles) {
      const original = read(path.join(sourceRoot, file.path));
      const migrated = read(path.join(workspace, file.path));
      assert.deepEqual(fieldMarkup(migrated), fieldMarkup(original), `Control markup changed: ${file.path}`);
      assert.deepEqual(optionMarkup(migrated), optionMarkup(original), `Select options changed: ${file.path}`);
      assert.deepEqual(inlineScripts(migrated), inlineScripts(original), `Inline script changed: ${file.path}`);
    }
  });

  await context.test('all copied HTML pages load the centralized desktop presentation boundary once', () => {
    const expected = ['/web-adapter/desktop.css', '/web-adapter/translations.js', '/web-adapter/bridge.js', '/web-entry.js'];
    for (const file of htmlFiles) {
      const html = read(path.join(workspace, file.path));
      const htmlTag = html.match(/<html\b[^>]*>/i)?.[0];
      assert.ok(htmlTag?.includes('data-peoplehcm-web'), `${file.path} must enable its presentation layer before paint.`);
      assert.match(htmlTag, /\bdata-theme=["']light["']/, `${file.path} must use the configured initial light theme.`);
      for (const resource of expected) {
        const matches = [...html.matchAll(/<(?:link|script)\b[^>]*\bdata-web-presentation\b[^>]*>/gi)]
          .filter(match => match[0].includes(resource));
        assert.equal(matches.length, 1, `${file.path} must load ${resource} exactly once.`);
        assert.ok(fs.existsSync(path.join(publicRoot, resource.slice(1))), `Missing adapter dependency ${resource}`);
      }
    }
  });

  await context.test('the eleven missing legacy destinations resolve to existing canonical screens', () => {
    assert.equal(aliases.length, 11);
    for (const [alias, target] of aliases) {
      const aliasFile = path.join(workspace, alias);
      assert.ok(fs.existsSync(aliasFile), `Missing legacy navigation alias: ${alias}`);
      assert.ok(fs.existsSync(path.join(workspace, target)), `Missing canonical alias target: ${target}`);
      assert.ok(read(aliasFile).includes(target), `Alias ${alias} does not reference its canonical screen ${target}.`);
    }
  });

  await context.test('all HTML local JavaScript and CSS references exist, with query/hash suffixes normalized', () => {
    const missing = [];
    for (const file of walk(workspace).filter(item => /\.html$/i.test(item))) {
      const html = read(file);
      for (const match of html.matchAll(/\b(?:src|href)\s*=\s*(['"])([^'"]+)\1/gi)) {
        if (!/\.(?:css|js)(?:[?#]|$)/i.test(match[2])) continue;
        const resolved = resolveLocal(file, match[2]);
        if (resolved && !fs.existsSync(resolved)) missing.push(`${slash(path.relative(workspace, file))}: ${match[2]}`);
      }
    }
    assert.deepEqual(missing, [], `Missing CSS/JavaScript references:\n${missing.join('\n')}`);
  });
});
