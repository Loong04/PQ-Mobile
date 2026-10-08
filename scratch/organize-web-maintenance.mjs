import { readFileSync, writeFileSync, mkdirSync, renameSync, readdirSync, rmdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const root = resolve('C:/Users/loong/PQ-Mobile/scratch/peoplehcm-web');
function path(name) {
  const target = resolve(root, name);
  if (!target.startsWith(root + '\\')) throw new Error('Path escapes staging root: ' + target);
  return target;
}
function rewrite(name, edit) { writeFileSync(path(name), edit(readFileSync(path(name), 'utf8')), 'utf8'); }
function move(from, to) {
  if (!existsSync(path(from))) return;
  if (existsSync(path(to))) throw new Error('Destination already exists: ' + to);
  mkdirSync(dirname(path(to)), { recursive: true });
  renameSync(path(from), path(to));
}
function cleanEmpty(name) {
  if (!existsSync(path(name))) return;
  for (const entry of readdirSync(path(name), { withFileTypes: true })) if (entry.isDirectory()) cleanEmpty(name + '/' + entry.name);
  if (!readdirSync(path(name)).length) rmdirSync(path(name));
}

rewrite('src/features/overview/pages/DashboardPage.tsx', text => text.replace('export function Dashboard(', 'export function DashboardPage('));
rewrite('src/features/preferences/pages/PreferencesPage.tsx', text => text.replace('export function Preferences(', 'export function PreferencesPage('));
rewrite('src/shared/config/modules.ts', text => text.replace('  LayoutDashboard,\n  LayoutGrid,\n  Star,\n  Settings2,\n', '').replace(/\nexport const shellIcons = \{[\s\S]*?\};\n/, '\n'));
rewrite('package.json', text => {
  const config = JSON.parse(text);
  config.engines.node = '>=22.18.0';
  Object.assign(config.scripts, {
    format: 'prettier --write src tooling tests public/web-adapter vite.config.ts tsconfig.json package.json',
    typecheck: 'tsc -b --pretty false',
    test: 'node --test --test-isolation=none tests/unit/*.test.mjs tests/integration/*.test.mjs',
    'test:unit': 'node --test --test-isolation=none tests/unit/*.test.mjs',
    'test:integration': 'node --test --test-isolation=none tests/integration/*.test.mjs',
    'test:e2e': 'node tests/e2e/web-native.mjs',
    'test:browser': 'node tests/e2e/web-native.mjs',
    inventory: 'node tooling/migration/inventory.mjs',
    migrate: 'node tooling/migration/migrate-source.mjs',
    'export:sql': 'node tooling/migration/export-data.mjs',
    'verify:sql': 'node tooling/verification/verify-export.mjs',
    'review:options': 'node tooling/verification/review-native-options.mjs',
    'inspect:native': 'node tooling/verification/inspect-native.mjs',
  });
  return JSON.stringify(config, null, 2) + '\n';
});
rewrite('package-lock.json', text => {
  const lock = JSON.parse(text);
  lock.packages[''].engines.node = '>=22.18.0';
  return JSON.stringify(lock, null, 2) + '\n';
});
rewrite('.prettierignore', text => text.replace('docs/page-inventory.json', 'docs/generated/\ndocs/archive/'));
rewrite('database/README.md', text => text.replace('node scripts/export-data.mjs', 'npm.cmd run export:sql').replace('node database/verify-export.mjs', 'npm.cmd run verify:sql').replace('../docs/data-model.md', '../docs/architecture/data-model.md').replace('需要 Node.js、', '需要 Node.js 22.18 或以上、'));

const moves = [
  ['docs/page-inventory.json', 'docs/generated/page-inventory.json'],
  ['docs/source-manifest.json', 'docs/generated/source-manifest.json'],
  ['docs/feature-parity.md', 'docs/reports/feature-parity.md'],
  ['docs/data-model.md', 'docs/architecture/data-model.md'],
  ['docs/module-options-v2.md', 'docs/architecture/module-navigation.md'],
  ['docs/desktop-adapter-v2.md', 'docs/architecture/business-document-boundary.md'],
  ['docs/2026-10-08-native-web-rebuild.md', 'docs/plans/2026-10-08-native-web-rebuild.md'],
  ['docs/web-native-validation.md', 'docs/reports/web-native-validation.md'],
  ['docs/native-options-review.md', 'docs/reports/native-options-review.md'],
  ['docs/verification/native', 'docs/reports/screenshots/native'],
  ['docs/verification/native-adapter-v2', 'docs/reports/screenshots/native-adapter'],
  ['docs/verification', 'docs/archive/initial-verification'],
  ['docs/screenshots', 'docs/archive/embedded-workspace-screenshots'],
  ['docs/superpowers', 'docs/archive/initial-migration-plans'],
];
for (const pair of moves) move(...pair);
for (const name of ['desktop-adapter.md', 'progress.md', 'parity-validation.md', 'verification-summary.md', 'review-findings.md', 'sql-review.md', 'adapter-browser-report.json']) move('docs/' + name, 'docs/archive/' + name);
const substitutions = [
  ['src/components/ModuleWorkspace.tsx', 'src/app/modules/ModuleWorkspace.tsx'],
  ['src/config/moduleNavigation.ts', 'src/app/navigation/module-registry.ts, assembled from src/features/<module>/navigation.ts'],
  ['src/generated/pages.json', 'src/app/generated/pages.json'],
  ['src/styles/tokens.css', 'src/shared/styles/tokens.css'],
  ['docs/verification/native-adapter-v2', 'docs/reports/screenshots/native-adapter'],
  ['docs/verification/native', 'docs/reports/screenshots/native'],
];
for (const folder of ['docs/architecture', 'docs/reports', 'docs/plans']) {
  for (const entry of readdirSync(path(folder), { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.md')) rewrite(folder + '/' + entry.name, text => substitutions.reduce((value, [old, next]) => value.replaceAll(old, next), text));
  }
}
for (const folder of ['src/components', 'src/config', 'src/lib', 'src/i18n', 'src/generated', 'src/styles']) cleanEmpty(folder);
console.log('Source, commands and documentation organized; immutable business files and SQL untouched.');
