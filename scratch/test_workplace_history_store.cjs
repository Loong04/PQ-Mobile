const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const storage = new Map();
const localStorage = { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) };
const context = { window: {}, localStorage, crypto: require('node:crypto').webcrypto, Date };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.resolve(__dirname, '../modules/admin/js/workplace-history-store.js'), 'utf8'), context);
const store = context.window.WorkplaceHistoryStore;
assert.equal(store.list().length, 0);
const letter = store.save({ kind: 'letter-request', title: 'Employment Confirmation', date: '2026-10-07', fields: [['Reason', '<script>test</script>']] });
assert.equal(letter.status, 'submitted');
assert.ok(letter.id);
store.save({ kind: 'guest-visit', title: 'Head Office', date: '2026-10-08', fields: [['Guests', 'Jane']] });
store.save({ kind: 'inventory-request', title: 'IT Accessories', date: '2026-10-09', fields: [['Quantity', '2']] });
assert.equal(store.list().length, 3);
assert.equal(store.counts().submitted, 3);
assert.equal(store.counts().approved, 0);
const key = 'peoplehcm:workplace:history:v1';
const persisted = JSON.parse(storage.get(key));
storage.set(key, JSON.stringify([...persisted, { ...letter, id: 'invalid-fields', fields: [null] }, { ...letter, id: 'invalid-values', fields: [[null, 123]] }]));
assert.equal(store.list().length, 3, 'Malformed stored fields cannot reach the renderer');
assert.throws(() => store.save({ kind: 'news', title: 'Wrong category' }));
assert.equal(store.list().length, 3);
const saved = store.list();
saved[0].title = 'Changed outside the store';
assert.notEqual(store.list()[0].title, saved[0].title, 'Read returns independent data');
const reload = { window: {}, localStorage, crypto: context.crypto, Date };
vm.createContext(reload);
vm.runInContext(fs.readFileSync(path.resolve(__dirname, '../modules/admin/js/workplace-history-store.js'), 'utf8'), reload);
assert.equal(reload.window.WorkplaceHistoryStore.list().length, 3, 'Records survive navigation and reload');
const before = JSON.stringify(store.list());
localStorage.setItem = () => { throw new Error('Quota exhausted'); };
assert.throws(() => store.save({ kind: 'letter-request', title: 'Failed save', date: '2026-10-07', fields: [] }), /Quota exhausted/);
assert.equal(JSON.stringify(store.list()), before, 'Failed writes never claim a saved record');
console.log('PASS Workplace History store: allowed categories, persistence, counts and write failures');

const test = require('node:test');
const sampleKey = 'peoplehcm:workplace:history:samples:v1';
class VisitDate extends Date {
  constructor(...args) { super(...(args.length ? args : [2026, 9, 8, 12, 0, 0])); }
}
function openStore() {
  const data = new Map();
  const browserStorage = { getItem: itemKey => data.get(itemKey) ?? null, setItem: (itemKey, value) => data.set(itemKey, value) };
  const browser = { window: {}, localStorage: browserStorage, crypto: context.crypto, Date: VisitDate };
  vm.createContext(browser);
  vm.runInContext(fs.readFileSync(path.resolve(__dirname, '../modules/admin/js/workplace-history-store.js'), 'utf8'), browser);
  return { store: browser.window.WorkplaceHistoryStore, storage: data, localStorage: browserStorage, context: browser };
}
function sample(id, status = 'draft', extra = {}) {
  return { id, kind: 'guest-visit', title: 'Guest Visit', date: '2024-01-17', status, createdAt: '2024-01-17T09:00:00.000Z',
    fields: [['Reference #', 'FGV0000000000001'], ['Visit Date', '2024-01-17'], ['Submit Date', '2024-01-17']], ...extra };
}
const plain = value => JSON.parse(JSON.stringify(value));

test('Existing cancellations become submitted once, preserving fields and later user cancellations', () => {
  const { store, storage } = openStore();
  const original = [sample('old-cancel', 'cancelled'), sample('draft'), sample('approved', 'approved')];
  storage.set(key, JSON.stringify(original));
  assert.equal(typeof store.migrateCancelledToSubmitted, 'function');
  store.migrateCancelledToSubmitted();
  assert.deepEqual(plain(store.list().find(row => row.id === 'old-cancel')), { ...original[0], status: 'submitted' });
  assert.equal(store.counts().draft, 1);
  assert.equal(store.counts().approved, 1);
  store.setStatus('old-cancel', 'cancelled');
  store.migrateCancelledToSubmitted();
  assert.equal(store.list().find(row => row.id === 'old-cancel').status, 'cancelled');
});

test('Failed cancellation migration can retry without losing data', () => {
  const { store, storage, localStorage } = openStore();
  storage.set(key, JSON.stringify([sample('old-cancel', 'cancelled')]));
  assert.equal(typeof store.migrateCancelledToSubmitted, 'function');
  const write = localStorage.setItem;
  localStorage.setItem = () => { throw new Error('Quota exhausted'); };
  assert.throws(() => store.migrateCancelledToSubmitted(), /Quota exhausted/);
  assert.equal(store.counts().cancelled, 1);
  localStorage.setItem = write;
  store.migrateCancelledToSubmitted();
  assert.equal(store.counts().submitted, 1);
});

test('ensureSamples seeds once by ID while preserving local records and user changes', () => {
  const { store } = openStore();
  assert.equal(typeof store.ensureSamples, 'function', 'Explicit sample seeding is required');
  const local = store.save({ kind: 'guest-visit', title: 'My request', date: '2026-10-08', fields: [] });
  store.ensureSamples([sample('sample-1'), sample(local.id, 'cancelled'), sample('sample-1')]);
  assert.equal(store.list().length, 2);
  assert.equal(store.list().find(row => row.id === local.id).title, 'My request');
  assert.equal(store.counts().draft, 1);
  store.setStatus('sample-1', 'cancelled');
  store.ensureSamples([sample('sample-1'), sample('sample-2')]);
  assert.equal(store.list().length, 2);
  assert.equal(store.list().find(row => row.id === 'sample-1').status, 'cancelled');
});

test('Apply changes local submit dates without changing request dates, references or createdAt', () => {
  const { store } = openStore();
  assert.equal(typeof store.setStatus, 'function', 'Persistent status changes are required');
  store.ensureSamples([sample('draft'), sample('resubmit', 'resubmit', { fields: [['Reference #', 'IRQ0000000000064'], ['Request Date', '2026-09-08'], ['Submitted Date', '2026-09-08']] })]);
  const changed = store.setStatus('draft', 'submitted');
  assert.equal(changed.status, 'submitted');
  assert.equal(changed.date, '2024-01-17');
  assert.equal(changed.createdAt, '2024-01-17T09:00:00.000Z');
  assert.deepEqual(plain(changed.fields), [['Reference #', 'FGV0000000000001'], ['Visit Date', '2024-01-17'], ['Submit Date', '2026-10-08']]);
  assert.deepEqual(plain(store.setStatus('resubmit', 'submitted').fields), [['Reference #', 'IRQ0000000000064'], ['Request Date', '2026-09-08'], ['Submitted Date', '2026-10-08']]);
  assert.equal(store.counts().submitted, 2);
});

test('Apply adds a submit date when a draft has none', () => {
  const { store } = openStore();
  assert.equal(typeof store.setStatus, 'function');
  store.ensureSamples([sample('draft', 'draft', { fields: [] })]);
  assert.deepEqual(plain(store.setStatus('draft', 'submitted').fields), [['Submit Date', '2026-10-08']]);
});

test('Cancel permits draft, submitted, approved and resubmit; terminal records cannot transition', () => {
  const { store } = openStore();
  assert.equal(typeof store.setStatus, 'function');
  store.ensureSamples(['draft', 'submitted', 'approved', 'resubmit', 'rejected', 'cancelled'].map(status => sample(status, status)));
  assert.throws(() => store.setStatus('approved', 'submitted'), /transition/i);
  for (const status of ['draft', 'submitted', 'approved', 'resubmit']) assert.equal(store.setStatus(status, 'cancelled').status, 'cancelled');
  const before = JSON.stringify(store.list());
  for (const status of ['draft', 'submitted', 'approved', 'resubmit', 'rejected', 'cancelled']) {
    assert.throws(() => store.setStatus(status, 'submitted'), /transition/i);
    assert.throws(() => store.setStatus(status, 'cancelled'), /transition/i);
  }
  assert.throws(() => store.setStatus('missing', 'submitted'), /not found/i);
  assert.throws(() => store.setStatus('rejected', 'approved'), /transition/i);
  assert.equal(JSON.stringify(store.list()), before);
  assert.equal(store.counts().cancelled, 5);
});

test('Failed sample writes leave no marker; marker failures and missing-marker retries deduplicate', () => {
  const { store, storage, localStorage } = openStore();
  assert.equal(typeof store.ensureSamples, 'function');
  const write = localStorage.setItem;
  localStorage.setItem = (itemKey, value) => { if (itemKey === key) throw new Error('Quota exhausted'); write(itemKey, value); };
  assert.throws(() => store.ensureSamples([sample('sample-1')]), /Quota exhausted/);
  assert.equal(storage.has(sampleKey), false);
  assert.equal(store.list().length, 0);
  localStorage.setItem = (itemKey, value) => { if (itemKey === sampleKey) throw new Error('Marker write failed'); write(itemKey, value); };
  assert.throws(() => store.ensureSamples([sample('sample-1')]), /Marker write failed/);
  assert.equal(store.list().length, 1, 'Main data must persist before the marker');
  localStorage.setItem = write;
  store.ensureSamples([sample('sample-1')]);
  assert.equal(store.list().length, 1);
  assert.ok(storage.get(sampleKey));
  storage.delete(sampleKey);
  store.ensureSamples([sample('sample-1')]);
  assert.equal(store.list().length, 1);
});

test('Quota failures throw without persisting a status change', () => {
  const { store, localStorage } = openStore();
  assert.equal(typeof store.setStatus, 'function');
  store.ensureSamples([sample('sample-1')]);
  const before = JSON.stringify(store.list());
  localStorage.setItem = () => { throw new Error('Quota exhausted'); };
  assert.throws(() => store.setStatus('sample-1', 'submitted'), /Quota exhausted/);
  assert.equal(JSON.stringify(store.list()), before);
});

test('Screenshot samples explicitly seed seven guests, six letters and two inventory requests', () => {
  const dataPath = path.resolve(__dirname, '../modules/admin/js/workplace-history-data.js');
  assert.ok(fs.existsSync(dataPath), 'History sample data is required');
  const { store, context } = openStore();
  vm.runInContext(fs.readFileSync(dataPath, 'utf8'), context);
  assert.equal(store.list().length, 0, 'Loading fixture data alone must not mutate storage');
  store.ensureSamples(context.window.WORKPLACE_HISTORY_DATA);
  const rows = store.list();
  assert.equal(rows.filter(row => row.kind === 'guest-visit').length, 7);
  assert.equal(rows.filter(row => row.kind === 'letter-request').length, 6);
  assert.equal(rows.filter(row => row.kind === 'inventory-request').length, 2);
  assert.deepEqual(plain(store.counts()), { submitted: 8, resubmit: 0, approved: 6, rejected: 0, draft: 1, cancelled: 0 });
  assert.ok(rows.find(row => row.id === 'sample-guest-0001').fields.some(([label, value]) => label === 'Guest 1' && value === '66 • 55 • Customer • 77'));
  assert.ok(rows.find(row => row.title === 'Employment Verification Letter').fields.some(([label, value]) => label === 'Reference #' && value === 'DRQ0000000000091'));
});
