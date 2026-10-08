const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const key = 'peoplehcm:workplace:book-resource:v1';
const marker = 'peoplehcm:workplace:book-resource:calendar-samples:v1';
const source = fs.readFileSync(path.resolve(__dirname, '../modules/admin/js/book-resource-store.js'), 'utf8');
class PreviewDate extends Date {
  constructor(...args) { super(...(args.length ? args : ['2026-10-08T12:00:00+08:00'])); }
}
function openStore() {
  const storage = new Map();
  const localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  const context = { window: {}, localStorage, Date: PreviewDate, crypto: require('node:crypto').webcrypto };
  vm.createContext(context);
  vm.runInContext(source, context);
  return { store: context.window.BookResourceStore, storage, localStorage };
}
const plain = value => JSON.parse(JSON.stringify(value));

test('Calendar examples add bookings on at least eight dates, with working Plan and Booked actions', () => {
  const { store, storage } = openStore();
  assert.equal(typeof store.ensureCalendarSamples, 'function');
  store.ensureCalendarSamples();
  const rows = store.list();
  assert.ok(new Set(rows.map(row => row.date)).size >= 8);
  assert.ok(rows.every(row => row.date.startsWith('2026-10-')));
  assert.ok(rows.some(row => row.status === 'confirmed'));
  assert.ok(rows.some(row => row.status === 'plan'));
  assert.equal(new Set(rows.map(row => row.resource)).size, 3);
  assert.ok(new Set(rows.map(row => row.id)).size === rows.length);
  const plan = rows.find(row => row.status === 'plan');
  store.confirm(plan.id);
  store.ensureCalendarSamples();
  assert.equal(store.list().find(row => row.id === plan.id).status, 'confirmed');
  for (const row of store.list()) store.remove(row.id);
  store.ensureCalendarSamples();
  assert.equal(store.list().length, 0, 'Deleted samples must stay deleted');
  assert.equal(storage.get(marker), '1');
});

test('Existing user bookings retain their IDs, fields and status when examples are added', () => {
  const { store, storage } = openStore();
  storage.set(key, '[]');
  const custom = store.save({ date: '2026-10-08', startTime: '08:00', endTime: '09:00', resource: 'meeting-room', task: 'other', purpose: 'User booking', meetingRef: 'USER-001', remarks: 'Keep this record' }, 'plan');
  assert.equal(typeof store.ensureCalendarSamples, 'function');
  store.ensureCalendarSamples();
  assert.deepEqual(plain(store.list().find(row => row.id === custom.id)), plain(custom));
  const count = store.list().length;
  store.ensureCalendarSamples();
  assert.equal(store.list().length, count, 'Initialization cannot duplicate bookings');
});

test('Failed record or marker writes allow safe retries without duplicates or status resets', () => {
  const { store, storage, localStorage } = openStore();
  storage.set(key, '[]');
  assert.equal(typeof store.ensureCalendarSamples, 'function');
  const write = localStorage.setItem;
  localStorage.setItem = (itemKey, value) => { if (itemKey === key) throw new Error('Storage full'); write(itemKey, value); };
  assert.throws(() => store.ensureCalendarSamples(), /Storage full/);
  assert.equal(storage.has(marker), false);
  assert.equal(store.list().length, 0);
  localStorage.setItem = (itemKey, value) => { if (itemKey === marker) throw new Error('Marker write failed'); write(itemKey, value); };
  assert.throws(() => store.ensureCalendarSamples(), /Marker write failed/);
  const count = store.list().length;
  const plan = store.list().find(row => row.status === 'plan');
  localStorage.setItem = write;
  store.confirm(plan.id);
  store.ensureCalendarSamples();
  assert.equal(store.list().length, count);
  assert.equal(store.list().find(row => row.id === plan.id).status, 'confirmed');
});
