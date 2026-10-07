/* Local history for the Workplace preview's two request types. */
(() => {
  const key = 'peoplehcm:workplace:history:v1';
  const kinds = ['guest-visit', 'letter-request'];
  const statuses = ['submitted', 'resubmit', 'approved', 'rejected'];
  function list() {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const records = JSON.parse(raw);
    if (!Array.isArray(records)) throw new Error('Invalid Workplace history data.');
    return records.filter(row => row && kinds.includes(row.kind) && statuses.includes(row.status)
      && typeof row.id === 'string' && typeof row.title === 'string' && typeof row.date === 'string'
      && Array.isArray(row.fields) && row.fields.every(field => Array.isArray(field) && field.length === 2 && field.every(value => typeof value === 'string')))
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }
  function save(input) {
    if (!kinds.includes(input.kind)) throw new Error('Unsupported Workplace history category.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || !Array.isArray(input.fields)) throw new Error('Invalid Workplace history record.');
    const rows = list();
    const existing = rows.find(row => row.id === input.id && row.kind === input.kind);
    const record = {
      id: existing?.id || crypto.randomUUID(),
      kind: input.kind,
      title: String(input.title || (input.kind === 'guest-visit' ? 'Guest Visit' : 'Letter Request')),
      date: input.date,
      status: 'submitted',
      createdAt: existing?.createdAt || new Date().toISOString(),
      fields: input.fields.map(([label, value]) => [String(label), String(value ?? '')])
    };
    localStorage.setItem(key, JSON.stringify([record, ...rows.filter(row => row.id !== record.id)]));
    return record;
  }
  function counts() {
    const totals = Object.fromEntries(statuses.map(status => [status, 0]));
    list().forEach(row => totals[row.status]++);
    return totals;
  }
  window.WorkplaceHistoryStore = { list, save, counts };
})();
