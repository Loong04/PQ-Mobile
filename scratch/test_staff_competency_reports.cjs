const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const file = path.join(__dirname, '../modules/training-competency/js/staff-competency-reports.js');
const context = { window: {} };
if (fs.existsSync(file)) vm.runInNewContext(fs.readFileSync(file, 'utf8'), context);
const api = context.window.StaffCompetencyReports;
const employees = [
  { empNo: '01', name: 'Aina', company: 'A', department: 'Finance', position: 'Analyst', dateOfBirth: '1996-10-17', dateJoined: '2020-10-16' },
  { empNo: '02', name: 'Mei', company: 'B', department: 'HR', position: 'Manager' },
  { empNo: '03', name: 'Farhan', company: 'A', department: 'HR', position: 'Manager' }
];
const definitions = [{ id: 'com', title: 'Communication', skillGroup: 'People', requiredLevel: 3 }, { id: 'tech', title: 'Technical', skillGroup: 'Technical', requiredLevel: 3 }];
const records = [
  { empNo: '01', competency: 'com', level: 2, lastAssessment: '2026-09-15' },
  { empNo: '01', competency: 'tech', level: 4, lastAssessment: '2026-10-15' },
  { empNo: '02', competency: 'com', level: 3, lastAssessment: '' },
  { empNo: '02', competency: 'tech', level: null, lastAssessment: '' }
];
const plain = value => JSON.parse(JSON.stringify(value));
test('assessment filters aggregate employees and use the last assessment within the selected skill group', () => {
  assert.ok(api, 'Staff competency report helpers are available');
  assert.deepEqual(plain(api.assessmentRows(employees, records, definitions, { skillGroup: 'People', days: '30' }, '2026-10-16')).map(row => [row.empNo, row.lastAssessment, row.daysSince]), [['01', '2026-09-15', 31], ['02', '', null]]);
  assert.equal(api.assessmentRows(employees, records, definitions, { days: '30' }, '2026-10-16').some(row => row.empNo === '01'), false);
  assert.deepEqual(plain(api.assessmentRows(employees, records, definitions, { keyword: '#03' }, '2026-10-16')).map(row => [row.empNo, row.assignmentCount]), [['03', 0]]);
});
test('search uses inclusive levels, signed gap, real age and service dates without inventing missing values', () => {
  assert.ok(api);
  const rows = api.searchRows(employees, records, definitions, { ageMin: '29', ageMax: '29', yosMin: '6', yosMax: '6', levelMin: '2', levelMax: '2' }, '2026-10-16');
  assert.deepEqual(plain(rows).map(row => [row.empNo, row.competency, row.gap, row.age, row.yos]), [['01', 'com', -1, 29, 6]]);
  assert.equal(api.searchRows(employees, records, definitions, { ageMin: '30' }, '2026-10-16').length, 0);
  assert.equal(api.searchRows(employees, records, definitions, { levelMin: '0' }, '2026-10-16').length, 3, 'Missing levels do not become zero');
  assert.deepEqual(plain(api.searchRows(employees, records, definitions, { competency: 'tech' }, '2026-10-16')).map(row => row.gap), [1, null]);
});
test('gap summary excludes equal and missing levels and counts distinct employees for each competency', () => {
  assert.ok(api);
  const rows = api.searchRows(employees, records.concat(records[0]), definitions, {}, '2026-10-16');
  assert.deepEqual(plain(api.gapGroups(rows, definitions, 'negative')).map(row => [row.competency, row.count, row.rows.length]), [['com', 1, 1]]);
  assert.deepEqual(plain(api.gapGroups(rows, definitions, 'positive')).map(row => [row.competency, row.count]), [['tech', 1]]);
});
