const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const sourcePath = path.resolve(__dirname, '../modules/employee-career/js/manpower-statistics-data.js');
const source = fs.readFileSync(sourcePath, 'utf8');

function loadSnapshot() {
  const context = vm.createContext({ window: {} });
  vm.runInContext(source, context, { filename: sourcePath });
  return JSON.parse(JSON.stringify(context.window));
}

function aggregateKey(record) {
  return [
    record.company,
    record.branch,
    record.department,
    record.jobType,
    record.effectiveFrom,
    record.effectiveTo || ''
  ].join('|');
}

test('generates exactly one stable employee for every aggregate headcount', () => {
  const snapshot = loadSnapshot();
  const aggregates = snapshot.MANPOWER_STATISTICS_DATA;
  const staff = snapshot.MANPOWER_STATISTICS_STAFF;

  assert.equal(aggregates.reduce((total, row) => total + row.headcount, 0), 282);
  assert.equal(staff.length, 282);
  assert.equal(new Set(staff.map(employee => employee.empNo)).size, 282);

  const staffCounts = new Map();
  staff.forEach(employee => {
    const key = aggregateKey(employee);
    staffCounts.set(key, (staffCounts.get(key) || 0) + 1);
  });
  aggregates.forEach(row => assert.equal(staffCounts.get(aggregateKey(row)), row.headcount, aggregateKey(row)));
});

test('generates complete bounded employee records without runtime randomness', () => {
  const first = loadSnapshot().MANPOWER_STATISTICS_STAFF;
  const second = loadSnapshot().MANPOWER_STATISTICS_STAFF;
  assert.deepEqual(first, second);

  const requiredStrings = [
    'empNo', 'name', 'position', 'superior', 'job', 'jobType', 'company', 'branch',
    'base', 'division', 'department', 'section', 'costCenter', 'line', 'hireDate',
    'birthDate', 'effectiveFrom'
  ];
  const ranges = {
    competencyPoints: [1, 10],
    competencyMatchPercent: [0, 100],
    basicPay: [1800, 10000],
    incrementPercent: [0, 8],
    bonusFactor: [0, 3],
    attendancePercent: [70, 100],
    monthlyOtHours: [0, 20],
    trainingCost: [0, 2500],
    performanceScore: [0, 100],
    annualAttritionPercent: [0, 10]
  };

  first.forEach(employee => {
    requiredStrings.forEach(field => assert.equal(typeof employee[field] === 'string' && employee[field].length > 0, true, `${employee.empNo}:${field}`));
    Object.entries(ranges).forEach(([field, [minimum, maximum]]) => {
      assert.equal(Number.isFinite(employee[field]), true, `${employee.empNo}:${field}`);
      assert.ok(employee[field] >= minimum && employee[field] <= maximum, `${employee.empNo}:${field}`);
    });
  });

  assert.ok(first.some(employee => employee.empNo === '000031' && employee.name === 'Navin' && employee.position === 'ACCOUNT EXECUTIVE'));
});

test('keeps effective date boundaries on generated employees', () => {
  const { MANPOWER_STATISTICS_DATA: aggregates, MANPOWER_STATISTICS_STAFF: staff } = loadSnapshot();
  aggregates.forEach(row => {
    const matching = staff.filter(employee => aggregateKey(employee) === aggregateKey(row));
    assert.equal(matching.length, row.headcount);
    matching.forEach(employee => {
      assert.equal(employee.effectiveFrom, row.effectiveFrom);
      assert.equal(employee.effectiveTo, row.effectiveTo);
    });
  });
});
