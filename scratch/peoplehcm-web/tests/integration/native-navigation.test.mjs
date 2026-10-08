import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PROJECT_ROOT } from '../../tooling/shared/paths.mjs';
import vm from 'node:vm';

const project = PROJECT_ROOT;
const snapshot = resolve(project, 'source-snapshot');
const core = {
  ...await import('../../src/shared/theme/preferences.ts'),
  ...await import('../../src/shared/navigation/page-path.ts'),
};
const navigation = await import('../../src/app/navigation/module-registry.ts');
const moduleIds = ['attendance', 'leave', 'claims', 'payroll', 'employee-career', 'project-task', 'admin', 'profile'];
const allowedScopes = new Set(['individual', 'team', 'shared']);
const allowedGroups = new Set(['requests', 'records', 'approvals', 'reports', 'planning', 'information']);

test('native web defaults use the requested slate primary and porcelain light mode', () => {
  assert.deepEqual(core.defaultPreferences, { primary: '#435875', mode: 'light', locale: 'en' });
  assert.deepEqual(core.readPreferences('{broken'), core.defaultPreferences);
});

test('every enterprise module has a functional native option catalogue', () => {
  assert.equal(typeof navigation.getModuleOptions, 'function', navigation.loadError || 'Missing native option accessor');
  assert(Array.isArray(navigation.moduleNavigation));
  assert(navigation.moduleNavigation.length >= 60, 'The full source requires substantially more than a few demonstration actions');
  for (const moduleId of moduleIds) {
    const options = navigation.getModuleOptions(moduleId);
    assert(options.length > 0, `No functional options for ${moduleId}`);
    assert(options.every(option => option.moduleId === moduleId));
    assert.equal(typeof navigation.moduleOverviewPaths[moduleId], 'string');
    assert(existsSync(resolve(snapshot, navigation.moduleOverviewPaths[moduleId].split(/[?#]/)[0])));
  }
});

test('all option identifiers, bilingual labels and original business destinations are valid', () => {
  assert(Array.isArray(navigation.moduleNavigation), navigation.loadError || 'Missing option catalogue');
  const ids = new Set();
  for (const option of navigation.moduleNavigation) {
    assert(!ids.has(option.id), `Duplicate native option ${option.id}`); ids.add(option.id);
    assert(moduleIds.includes(option.moduleId), option.id);
    assert(allowedScopes.has(option.scope), option.id);
    assert(allowedGroups.has(option.group), option.id);
    for (const key of ['title', 'titleZh', 'description', 'descriptionZh', 'icon']) assert.equal(typeof option[key], 'string', `${option.id}.${key}`);
    assert(option.title.trim() && option.titleZh.trim(), `${option.id}: missing bilingual label`);
    assert.equal(core.normalizePage(option.path), option.path, `${option.id}: unsafe or malformed business URL`);
    assert(existsSync(resolve(snapshot, option.path.split(/[?#]/)[0])), `${option.id}: original business page missing`);
  }
});

test('individual and team scope filters retain the exact configured membership', () => {
  assert.equal(typeof navigation.getModuleOptions, 'function', navigation.loadError || 'Missing option accessor');
  for (const moduleId of moduleIds) for (const scope of ['individual', 'team']) {
    const expected = navigation.moduleNavigation.filter(option => option.moduleId === moduleId && (option.scope === scope || option.scope === 'shared')).map(option => option.id).sort();
    const actual = navigation.getModuleOptions(moduleId, scope).map(option => option.id).sort();
    assert.deepEqual(actual, expected, `${moduleId}/${scope}: scope membership changed`);
  }
});

test('employee career native menus cover every original individual and team action', () => {
  assert(Array.isArray(navigation.moduleNavigation), navigation.loadError || 'Missing option catalogue');
  const context = { window: {} };
  vm.runInNewContext(readFileSync(resolve(snapshot, 'modules/employee-career/js/employee-career-config.js'), 'utf8'), context);
  for (const [scope, original] of Object.entries(context.window.EMPLOYEE_CAREER_OPTIONS)) {
    for (const action of original) {
      const expectedPath = 'modules/employee-career/' + action.href;
      const match = navigation.moduleNavigation.find(option => option.moduleId === 'employee-career' && option.path.split(/[?#]/)[0] === expectedPath);
      assert(match, `${scope}: missing original ${action.title} action`);
      assert.equal(match.scope, scope, `${action.title}: original scope changed`);
    }
  }
});

test('project work plans and work assignments retain their original request scopes', () => {
  assert(Array.isArray(navigation.moduleNavigation), navigation.loadError || 'Missing option catalogue');
  for (const [path, scope] of [['modules/project-task/options/work-plan.html', 'individual'], ['modules/project-task/options/work-assignment.html', 'team']]) {
    const option = navigation.moduleNavigation.find(item => item.path.split(/[?#]/)[0] === path);
    assert(option, `${path}: business form is not reachable`);
    assert.equal(option.scope, scope);
  }
});
