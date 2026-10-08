/* Local preview data. Replace these catalogs when connecting the booking API. */
(() => {
  const key = 'peoplehcm:workplace:book-resource:v1';
  const calendarSampleKey = 'peoplehcm:workplace:book-resource:calendar-samples:v1';
  const resources = [
    { id: 'selangor-room', name: 'SELANGOR ROOM' },
    { id: 'meeting-room', name: 'MEETING ROOM' },
    { id: 'projector', name: 'PROJECTOR' }
  ];
  const tasks = [
    { id: 'meeting', name: 'Meeting' },
    { id: 'training', name: 'Training' },
    { id: 'presentation', name: 'Presentation' },
    { id: 'other', name: 'Other' }
  ];
  const employee = { name: 'Farhan binti rahmat', empNo: 'EBB12' };
  function today() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  function validDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value + 'T12:00:00');
    return !Number.isNaN(date.getTime()) && todayOf(date) === value;
  }
  function todayOf(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  const validTime = value => typeof value === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
  function validate(record) {
    if (!record || typeof record.id !== 'string' || !record.id || !['plan', 'confirmed'].includes(record.status)
      || !validDate(record.date) || !validTime(record.startTime) || !validTime(record.endTime) || record.endTime <= record.startTime
      || !resources.some(resource => resource.id === record.resource) || !tasks.some(task => task.id === record.task)
      || !['purpose', 'meetingRef', 'remarks', 'createdAt'].every(field => typeof record[field] === 'string')
      || !record.employee || typeof record.employee.name !== 'string' || typeof record.employee.empNo !== 'string') {
      throw new Error('Invalid resource booking data.');
    }
    return record;
  }
  function write(records) { localStorage.setItem(key, JSON.stringify(records)); }
  function list() {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      const initial = [{ id: crypto.randomUUID(), status: 'confirmed', date: today(), startTime: '15:00', endTime: '17:00', resource: 'selangor-room', task: 'meeting', purpose: '', meetingRef: '', remarks: '', employee: { ...employee }, createdAt: new Date().toISOString() }];
      write(initial);
      return initial;
    }
    const records = JSON.parse(raw);
    if (!Array.isArray(records)) throw new Error('Invalid resource booking data.');
    records.forEach(validate);
    if (new Set(records.map(record => record.id)).size !== records.length) throw new Error('Duplicate resource booking IDs.');
    return records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  function ensureCalendarSamples() {
    if (localStorage.getItem(calendarSampleKey)) return;
    const records = list();
    const now = new Date();
    const examples = [
      [5, 'confirmed', 'selangor-room', 'meeting', '09:00', '10:30', 'Weekly team meeting'],
      [9, 'confirmed', 'meeting-room', 'training', '09:30', '11:30', 'Staff training'],
      [9, 'plan', 'projector', 'presentation', '09:30', '11:30', 'Training presentation'],
      [12, 'plan', 'selangor-room', 'meeting', '14:00', '15:00', 'Project planning'],
      [15, 'confirmed', 'meeting-room', 'meeting', '10:00', '11:00', 'Department meeting'],
      [15, 'plan', 'projector', 'presentation', '14:00', '16:00', 'Project presentation'],
      [19, 'plan', 'selangor-room', 'training', '09:00', '12:00', 'Team workshop'],
      [22, 'confirmed', 'selangor-room', 'meeting', '10:00', '11:30', 'Monthly review'],
      [22, 'confirmed', 'projector', 'presentation', '10:00', '11:30', 'Review presentation'],
      [26, 'plan', 'meeting-room', 'meeting', '15:00', '16:00', 'Team catch-up'],
      [28, 'confirmed', 'projector', 'other', '13:00', '14:00', 'Equipment briefing']
    ];
    const ids = new Set(records.map(record => record.id));
    examples.forEach(([day, status, resource, task, startTime, endTime, purpose], index) => {
      const id = `sample-calendar-v1-${day}-${resource}`;
      if (ids.has(id)) return;
      records.push(validate({
        id, status, resource, task, startTime, endTime, purpose,
        date: todayOf(new Date(now.getFullYear(), now.getMonth(), day, 12)),
        meetingRef: `RES-${String(index + 1).padStart(3, '0')}`, remarks: '',
        employee: { ...employee }, createdAt: new Date(now.getTime() - (index + 1) * 60000).toISOString()
      }));
      ids.add(id);
    });
    // Persist examples before marking them seeded so a failed write can safely retry.
    write(records);
    localStorage.setItem(calendarSampleKey, '1');
  }
  function save(input, status) {
    const records = list();
    const record = validate({
      id: crypto.randomUUID(), status, date: input.date, startTime: input.startTime, endTime: input.endTime,
      resource: input.resource, task: input.task, purpose: String(input.purpose || '').trim(),
      meetingRef: String(input.meetingRef || '').trim(), remarks: String(input.remarks || '').trim(),
      employee: { ...employee }, createdAt: new Date().toISOString()
    });
    write([record, ...records]);
    return record;
  }
  function confirm(id) {
    const records = list();
    const record = records.find(row => row.id === id);
    if (!record) throw new Error('Booking no longer exists.');
    record.status = 'confirmed';
    write(records);
  }
  function remove(id) {
    const records = list();
    if (!records.some(row => row.id === id)) throw new Error('Booking no longer exists.');
    write(records.filter(row => row.id !== id));
  }
  window.BookResourceStore = { list, save, confirm, remove, resources, tasks, today, ensureCalendarSamples };
})();
