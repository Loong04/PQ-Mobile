const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const context = { window: {} };
const file = path.join(__dirname, '../modules/training-competency/js/training-expired-model.js');
if (fs.existsSync(file)) vm.runInNewContext(fs.readFileSync(file, 'utf8'), context);
const model = context.window.TrainingExpiredCompetencies;
const definitions = [{ id: 'first-aid', title: 'First Aid' }, { id: 'forklift', title: 'Forklift Operation' }];
const records = [
  { empNo: '001', competency: 'first-aid', level: 1, expiry: '2026-09-15', name: 'Aina' },
  { empNo: '002', competency: 'first-aid', level: 2, expiry: '2026-08-31', name: 'Mei' },
  { empNo: '001', competency: 'forklift', level: 1, expiry: '2026-10-15', name: 'Aina' },
  { empNo: '003', competency: 'first-aid', level: 2, expiry: '2026-10-16', name: 'Farhan' },
  { empNo: '004', competency: 'first-aid', level: 1, expiry: '2026-10-17', name: 'Daniel' },
  { empNo: '005', competency: 'first-aid', level: 1, expiry: '2026-02-30', name: 'Alex' },
  { empNo: '006', competency: 'first-aid', level: 1, expiry: '', name: 'Nur' }
];
const plain = value => JSON.parse(JSON.stringify(value));
test('expired summary excludes today, future, invalid and missing expiry dates and counts employees distinctly', () => {
  assert.ok(model, 'Expired competency calculations are available');
  const result = model.summarize(definitions, records, '2026-10-16');
  assert.deepEqual([result.totalRecords, result.totalEmployees, result.groups.length], [3, 2, 2]);
  assert.deepEqual(plain(result.groups).map(group => [group.competency, group.count, group.levelCount]), [['first-aid', 2, 2], ['forklift', 1, 1]]);
});
test('employee drilldown keeps oldest expiry first and level counts agree with the full group', () => {
  assert.ok(model);
  const group = model.summarize(definitions, records, '2026-10-16').groups[0];
  assert.deepEqual(plain(group.records).map(row => [row.empNo, row.overdueDays]), [['002', 46], ['001', 31]]);
  assert.deepEqual(plain(group.levels), [{ level: 1, count: 1 }, { level: 2, count: 1 }]);
});
test('empty sources produce zero counts without inventing expired records', () => {
  assert.ok(model);
  assert.deepEqual(plain(model.summarize(definitions, [], '2026-10-16')), { totalRecords: 0, totalEmployees: 0, groups: [] });
});
