const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const key = 'peoplehcm:workplace:pending-approval:v1';
const file = path.resolve(__dirname, '../modules/admin/js/workplace-pending-store.js');
function openStore() {
  assert.ok(fs.existsSync(file), 'Workplace pending approval store is required');
  const data = new Map();
  const localStorage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  const browser = { window: {}, localStorage, Date };
  vm.createContext(browser);
  vm.runInContext(fs.readFileSync(file, 'utf8'), browser);
  return { store: browser.window.WorkplacePendingStore, data, localStorage };
}
const plain = value => JSON.parse(JSON.stringify(value));
const validChanges = { visitDate: '2026-10-08', startTime: '09:00', endTime: '10:00', totalGuest: 0, location: 'Head Office', meal: true, otherRequests: ['floor-visit'] };
test('Reference request seeds once with exact supplied employee and attendee details', () => {
  const { store } = openStore();
  const [row] = store.getPending();
  assert.equal(row.reference, 'FGV0000000000013');
  assert.equal(row.employeeName, 'Farhan binti rahmat');
  assert.equal(row.empNo, 'EBB12');
  assert.equal(row.submitDate, '2024-08-16');
  assert.equal(row.visitDate, '2026-10-08');
  assert.equal(row.totalGuest, 0);
  assert.equal(row.location, '');
  assert.deepEqual(plain(row.attendees), [{ empNo: '000001', name: 'Ram chhabila', department: 'ACCOUNTS', position: 'ACCOUNT EXECUTIVE' }]);
  assert.equal(store.getPending().length, 1);
});
test('Approve preserves submitted visit data and stores only the decision and approver comments', () => {
  const { store } = openStore();
  const [row] = store.getPending();
  store.act([row.id], 'approve', { changes: validChanges, comments: 'Approved for team visit' });
  assert.equal(store.getPending().length, 0);
  const saved = store.list()[0];
  assert.equal(saved.status, 'approved');
  assert.equal(saved.reference, row.reference);
  assert.equal(saved.submitDate, row.submitDate);
  for (const field of ['visitDate', 'startTime', 'endTime', 'totalGuest', 'location', 'meal', 'otherRequests', 'guests', 'attendees']) {
    assert.deepEqual(plain(saved[field]), plain(row[field]), `${field} remains the submitted value`);
  }
  assert.equal(saved.approverComments, 'Approved for team visit');
  assert.equal(saved.audit.at(-1).action, 'approve');
  assert.equal(store.getPending().length, 0, 'Decided requests cannot reseed');
});
test('Submitted requests can be approved without editing missing source fields', () => {
  const { store } = openStore();
  store.act([store.getPending()[0].id], 'approve');
  assert.equal(store.list()[0].status, 'approved');
  assert.equal(store.list()[0].location, '');
});
test('Resubmit and Reject work without completing missing approval fields and persist decisions', () => {
  for (const [action, status] of [['resubmit', 'resubmit'], ['reject', 'rejected']]) {
    const { store } = openStore();
    store.act([store.getPending()[0].id], action, { comments: '<script>review</script>' });
    assert.equal(store.list()[0].status, status);
    assert.equal(store.list()[0].approverComments, '<script>review</script>');
    assert.equal(store.getPending().length, 0);
  }
});
test('Unknown or stale requests and failed bulk writes cannot partially decide requests', () => {
  const { store, data, localStorage } = openStore();
  const [row] = store.getPending();
  data.set(key, JSON.stringify([row, { ...row, id: 'second', reference: 'FGV-SECOND' }]));
  assert.throws(() => store.act([row.id, 'missing'], 'reject'), /request/i);
  assert.throws(() => store.act([], 'reject'), /request/i);
  assert.throws(() => store.act([row.id], 'other'), /action/i);
  const before = data.get(key);
  const write = localStorage.setItem;
  localStorage.setItem = () => { throw new Error('Storage full'); };
  assert.throws(() => store.act([row.id, 'second'], 'reject'), /Storage full/);
  assert.equal(data.get(key), before);
  localStorage.setItem = write;
  store.act([row.id, 'second'], 'reject');
  assert.equal(store.getPending().length, 0);
  assert.throws(() => store.act([row.id], 'approve', { changes: validChanges }), /request/i);
});
