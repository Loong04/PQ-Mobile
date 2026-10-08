import { test } from 'node:test';
import assert from 'node:assert/strict';

const core = {
  ...await import('../../src/shared/theme/preferences.ts'),
  ...await import('../../src/shared/theme/contrast.ts'),
  ...await import('../../src/shared/navigation/page-path.ts'),
};
const navigation = await import('../../src/app/navigation/page-navigation.ts');

test('legacy module back links retain team scope and route to the native module menu', () => {
  const sourceBack = 'modules/project-task/index.html?scope=team&theme=light';
  assert.equal(navigation.moduleHomeFor(sourceBack), 'project-task');
  assert.equal(navigation.moduleLandingUrl('project-task', sourceBack), '/#/module/project-task?scope=team');
  assert.equal(navigation.moduleHomeFor('leave.html?view=apply'), undefined);
  assert.equal(navigation.moduleHomeFor('modules/claims/index.html?webView=details&scope=team'), undefined);
  assert.equal(navigation.moduleHomeFor('me.html?scroll=bento-personal'), undefined);
});
test('source theme query updates do not lose the selected native functional option', () => {
  assert.equal(core.comparablePage('leave.html?view=history&theme=light&scope=team'), core.comparablePage('leave.html?scope=team&view=history'));
});
test('business routes preserve nested pages and query strings', () => {
  assert.equal(core.normalizePage?.('/workspace/modules/attendance/options/shift-plan.html?scope=team'), 'modules/attendance/options/shift-plan.html?scope=team');
});
test('business routes reject traversal and external destinations', () => {
  for (const path of ['../../secret.html', 'https://example.com', 'javascript:alert(1)', '%2e%2e/private.html', '//example.com', 'me.html#javascript:bad']) {
    assert.equal(core.normalizePage?.(path), null, path);
  }
});
test('preferences recover safely from malformed persisted data', () => {
  assert.deepEqual(core.readPreferences?.('{broken'), { primary:'#435875', mode:'light', locale:'en' });
  assert.deepEqual(core.readPreferences?.('{"primary":"url(evil)","mode":"invalid","locale":"invalid"}'), { primary:'#435875', mode:'light', locale:'en' });
});
test('colour token chooses accessible text for light and dark custom primaries', () => {
  assert.equal(core.primaryForeground?.('#ffffff'), '#000000');
  assert.equal(core.primaryForeground?.('#176b64'), '#ffffff');
  assert.equal(core.primaryForeground?.('#000000'), '#ffffff');
});
