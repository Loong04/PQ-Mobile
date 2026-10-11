const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

const purpleGradient = /linear-gradient\(135deg,\s*#7c3aed(?:\s+0%)?,\s*#6d28d9(?:\s+100%)?\)/i;
const purpleShadow = /rgba\(124,\s*58,\s*237,/i;
const rosePalette = /#fff1f2|#fda4af|#e11d48|rgba\(251,\s*113,\s*133|rgba\(225,\s*29,\s*72/i;

function cssBlock(source, selector) {
  const escaped = selector.replace(/[.*+?^$()|[\]{}\\]/g, '\\$&');
  const match = source.match(new RegExp(escaped + '\\s*\\{([^}]+)\\}', 'i'));
  assert.ok(match, `Missing style block: ${selector}`);
  return match[1];
}

function assertPurple(block, label) {
  assert.match(block, purpleGradient, `${label} must use the standard purple gradient`);
  assert.match(block, /color:\s*(?:#fff(?:fff)?|white)\b/i, `${label} must use white text`);
  assert.match(block, purpleShadow, `${label} must use the standard purple shadow`);
  assert.doesNotMatch(block, rosePalette, `${label} must not retain the red/pink cancel palette`);
}

const sharedCards = read('css/history-cards.css');
assertPurple(cssBlock(sharedCards, '.history-cancel-btn'), 'Claims and Workplace history Cancel');

const payrollCards = read('css/payroll-history.css');
assertPurple(
  cssBlock(payrollCards, '.payroll-history-phone .history-card-action-danger'),
  'Payroll history Cancel'
);

const projectCards = read('css/project-task.css');
assertPurple(
  cssBlock(projectCards, '.project-history-card-action-danger'),
  'Project Task history Cancel'
);

const leave = read('leave.html');
const leaveCancel = leave.match(
  /const cancelStyle = centered[\s\S]*?:\s*'([^']*linear-gradient[^']+)'/i
);
assert.ok(leaveCancel, 'Missing Leave history card Cancel style');
assertPurple(leaveCancel[1], 'Leave history Cancel');
assert.match(
  leave,
  /cancelHistoryItem\('\$\{item\.ref\}',\s*'cancelled'\)[\s\S]{0,200}style="\$\{cancelStyle\}"[\s\S]{0,100}Cancel/i,
  'Leave card Cancel button must use the scoped card/detail style'
);

const cardCancelSources = [
  ['modules/claims/options/history.html', /history-cancel-btn[^>]*>[\s\S]*?Cancel/i],
  ['modules/admin/js/workplace-history-ui.js', /history-cancel-btn[\s\S]{0,200}Cancel/i],
  ['js/payroll/payroll-history.js', /history-card-action-danger[^>]*>[\s\S]*?Cancel/i],
  ['js/project-task/project-task-history.js', /createCardAction\('Cancel',\s*'danger'/i],
  ['leave.html', /cancelHistoryItem\('\$\{item\.ref\}',\s*'cancelled'\)[\s\S]{0,400}Cancel/i]
];

for (const [file, pattern] of cardCancelSources) {
  assert.match(read(file), pattern, `History card Cancel audit lost coverage for ${file}`);
}

console.log('History card Cancel buttons use the consistent purple primary style across all modules.');
