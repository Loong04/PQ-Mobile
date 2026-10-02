const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync('js/pending-approval-filter.js', 'utf8'), context);
const filters = context.window.PendingApprovalFilter;
const today = new Date(2026, 9, 2);
const record = {
  keyword: 'Sarah Chen #001001 Medical Claim',
  startDate: '28/09/2026',
  endDate: '30 Sep 2026',
  submittedAt: '29 Sep 2026'
};
const state = changes => ({ keyword: '', startDate: '', endDate: '', days: 'all', minDays: '', maxDays: '', ...changes });

assert.equal(filters.toISO('09/03/2016'), '2016-03-09');
assert.equal(filters.toISO('Wed, 25/02/2026'), '2026-02-25');
assert.equal(filters.toISO('4 Sep 2019'), '2019-09-04');
assert.equal(filters.toISO('31/02/2026'), '');
assert.equal(filters.outstandingDays(record, today), 3);
assert.equal(filters.matches(record, state({ keyword: '#001001' }), today), true);
assert.equal(filters.matches(record, state({ keyword: 'low chin' }), today), false);
assert.equal(filters.matches(record, state({ startDate: '2026-09-30', endDate: '2026-09-30' }), today), true);
assert.equal(filters.matches(record, state({ startDate: '2026-10-01' }), today), false);
assert.equal(filters.matches(record, state({ days: '2-3' }), today), true);
assert.equal(filters.matches(record, state({ days: 'gt5' }), today), false);
assert.equal(filters.matches(record, state({ days: 'custom', minDays: '0', maxDays: '0' }), today), false);
assert.equal(filters.matches({ ...record, submittedAt: '2 Oct 2026' }, state({ days: 'custom', minDays: '0', maxDays: '0' }), today), true);
assert.equal(filters.matches({ ...record, submittedAt: '' }, state({ days: 'gt5' }), today), false);
assert.equal(filters.matches(record, state({ keyword: 'Sarah', days: '4-5' }), today), false);
console.log('Pending approval filter checks passed: dates, keywords, inclusive ranges and outstanding-day presets.');
