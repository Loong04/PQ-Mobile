/** Enforces the maintained application layers without inspecting frozen business scripts. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { builtinModules } from 'node:module';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const source = resolve(project, 'src');
const slash = path => path.replaceAll('\\', '/');
const nodeModules = new Set(builtinModules.map(name => name.replace(/^node:/, '')));
const configuration = ts.readConfigFile(resolve(project, 'tsconfig.json'), ts.sys.readFile);
assert.equal(configuration.error, undefined, 'TypeScript configuration must be readable');
const { options } = ts.parseJsonConfigFileContent(configuration.config, ts.sys, project);

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = resolve(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
function layer(file) {
  const segments = slash(relative(source, file)).split('/');
  return { name: segments[0], feature: segments[0] === 'features' ? segments[1] : null };
}
function moduleReferences(file) {
  const content = readFileSync(file, 'utf8');
  if (file.endsWith('.css')) return [...content.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/@import\s+(?:url\(\s*)?["']([^"']+)["']/g)].map(match => match[1]);
  const tree = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);
  const references = [];
  function visit(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier)) references.push(node.moduleSpecifier.text);
    if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference) && node.moduleReference.expression && ts.isStringLiteralLike(node.moduleReference.expression)) references.push(node.moduleReference.expression.text);
    if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === 'require')) && node.arguments.length && ts.isStringLiteralLike(node.arguments[0])) references.push(node.arguments[0].text);
    ts.forEachChild(node, visit);
  }
  visit(tree);
  return references;
}

function inspectDependencies() {
  const files = walk(source).filter(file => /\.(?:ts|tsx|js|mjs|css)$/.test(file));
  const graph = new Map(files.map(file => [file, []]));
  const violations = [];
  for (const file of files) {
    const from = layer(file);
    for (const specifier of moduleReferences(file)) {
      if (specifier.startsWith('node:') || nodeModules.has(specifier)) {
        violations.push(`${slash(relative(project, file))}: browser source imports Node module ${specifier}`);
        continue;
      }
      const resolvedModule = ts.resolveModuleName(specifier, file, options, ts.sys).resolvedModule;
      const destination = resolvedModule ? resolve(resolvedModule.resolvedFileName) : (specifier.startsWith('.') ? resolve(dirname(file), specifier) : null);
      if (!destination) {
        if (specifier.startsWith('.') || specifier.startsWith('@/')) violations.push(`${slash(relative(project, file))}: unresolved local import ${specifier}`);
        continue;
      }
      if (resolvedModule?.isExternalLibraryImport) continue;
      if (!existsSync(destination)) {
        violations.push(`${slash(relative(project, file))}: unresolved local import ${specifier}`);
        continue;
      }
      const target = slash(relative(source, destination));
      if (target === '..' || target.startsWith('../')) {
        violations.push(`${slash(relative(project, file))}: application dependency escapes src (${specifier})`);
        continue;
      }
      const to = layer(destination);
      const permitted = from.name === 'app'
        ? ['app', 'features', 'shared'].includes(to.name)
        : from.name === 'features'
          ? to.name === 'shared' || (to.name === 'features' && from.feature === to.feature)
          : from.name === 'shared' && to.name === 'shared';
      if (!permitted) violations.push(`${slash(relative(project, file))}: ${from.name}${from.feature ? '/' + from.feature : ''} cannot import ${target}`);
      if (graph.has(destination)) graph.get(file).push(destination);
    }
  }
  return { graph, violations };
}

test('application source has explicit app, features and shared ownership', () => {
  for (const directory of ['app', 'features', 'shared']) assert(existsSync(resolve(source, directory)), `Missing src/${directory} ownership boundary`);
  const obsolete = ['App.tsx', 'main.tsx', 'business.tsx', 'components', 'config', 'lib', 'i18n', 'generated', 'styles'];
  for (const path of obsolete) assert(!existsSync(resolve(source, path)), `Obsolete flat source path remains: src/${path}`);
  for (const entry of ['main.tsx', 'business.tsx']) assert(existsSync(resolve(source, 'app/entrypoints', entry)), `Missing maintained ${entry} entrypoint`);
});

test('application imports obey layer direction and exclude Node or tooling dependencies', () => {
  const { violations } = inspectDependencies();
  assert.deepEqual(violations, [], violations.join('\n'));
});

test('application modules have no circular import dependencies', () => {
  const { graph } = inspectDependencies();
  const finished = new Set();
  const visiting = new Set();
  function visit(file, trail = []) {
    if (visiting.has(file)) assert.fail('Circular import: ' + [...trail.slice(trail.indexOf(file)), file].map(path => slash(relative(project, path))).join(' → '));
    if (finished.has(file)) return;
    visiting.add(file);
    for (const destination of graph.get(file) || []) visit(destination, [...trail, file]);
    visiting.delete(file); finished.add(file);
  }
  for (const file of graph.keys()) visit(file);
});

test('development and production entrypoints target the same maintained business entry', () => {
  assert.match(readFileSync(resolve(project, 'index.html'), 'utf8'), /\/src\/app\/entrypoints\/main\.tsx/);
  assert.match(readFileSync(resolve(project, 'public/web-entry.js'), 'utf8'), /\/src\/app\/entrypoints\/business\.tsx/);
  assert.match(readFileSync(resolve(project, 'vite.config.ts'), 'utf8'), /src\/app\/entrypoints\/business\.tsx/);
  assert.match(readFileSync(resolve(project, 'vite.config.ts'), 'utf8'), /assets\/business\.js/);
});

test('tooling root resolution retains portable SQL, snapshots and business document paths', async () => {
  const paths = await import('../../tooling/shared/paths.mjs');
  assert.equal(paths.PROJECT_ROOT, project);
  for (const path of ['source-snapshot', 'public/workspace', 'database/peoplehcm-source.sql', 'database/export-manifest.json', 'public/data/seed.json', 'src/app/generated/pages.json', 'docs/generated/page-inventory.json', 'docs/generated/source-manifest.json']) assert(existsSync(resolve(paths.PROJECT_ROOT, path)), `Missing preserved project resource ${path}`);
});
