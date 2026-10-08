(() => {
  const sampleRecords = [
    { eventType: 'Workshop', date: '2026-10-12', days: 3 },
    { eventType: 'Training', date: '2026-10-02', days: 2 },
    { eventType: 'Team Building', date: '2026-09-18', days: 1 },
    { eventType: 'Training', date: '2026-09-07', days: 1 },
    { eventType: 'Meeting', date: '2026-09-04', days: 1 },
    { eventType: 'Meeting', date: '2026-08-27', days: 1 },
    { eventType: 'Training', date: '2026-08-24', days: 1 },
    { eventType: 'Training', date: '2026-08-10', days: 4 }
  ];
  const records = Array.isArray(window.MY_EVENT_RECORDS) ? window.MY_EVENT_RECORDS : sampleRecords;
  const defaults = { start: '', end: '', eventType: '' };
  let applied = { ...defaults };
  let inerted = [];
  let returnFocus = null;
  const byId = id => document.getElementById(id);
  const formatDate = value => new Date(value + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace('Sept', 'Sep');

  function eventEndDate(record) {
    const date = new Date(record.date + 'T00:00:00');
    date.setDate(date.getDate() + Math.max(1, Math.ceil(Number(record.days) || 1)) - 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function render() {
    const visible = records.filter(record =>
      (!applied.start || eventEndDate(record) >= applied.start) &&
      (!applied.end || record.date <= applied.end) &&
      (!applied.eventType || record.eventType === applied.eventType)
    ).sort((a, b) => b.date.localeCompare(a.date));
    const body = byId('myEventTable').tBodies[0];
    body.replaceChildren();
    visible.forEach(record => {
      const row = body.insertRow();
      [record.eventType, formatDate(record.date), record.days].forEach(value => {
        row.insertCell().textContent = String(value ?? '-');
      });
    });
    if (!visible.length) {
      const cell = body.insertRow().insertCell();
      cell.colSpan = 3;
      cell.className = 'my-event-empty';
      cell.textContent = 'No events found';
    }
    const dates = applied.start && applied.end ? `${formatDate(applied.start)} – ${formatDate(applied.end)}`
      : applied.start ? `From ${formatDate(applied.start)}` : applied.end ? `Until ${formatDate(applied.end)}` : 'All Dates';
    byId('myEventFilterSummary').textContent = `${dates} · ${applied.eventType || 'All Event Types'}`;
  }

  function validateDates() {
    const start = byId('myEventStartDate').value;
    const end = byId('myEventEndDate');
    end.min = start;
    end.setCustomValidity(start && end.value && end.value < start ? 'End Date must be on or after Start Date.' : '');
  }

  function fillFilter(filter) {
    byId('myEventStartDate').value = filter.start;
    byId('myEventEndDate').value = filter.end;
    byId('myEventType').value = filter.eventType;
    validateDates();
  }

  function openFilter() {
    const overlay = byId('myEventFilterOverlay');
    returnFocus = document.activeElement;
    fillFilter(applied);
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    inerted = Array.from(overlay.parentElement.children).filter(element => element !== overlay && !element.inert);
    inerted.forEach(element => { element.inert = true; });
    byId('myEventStartDate').focus({ preventScroll: true });
  }

  function closeFilter() {
    const overlay = byId('myEventFilterOverlay');
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
    inerted.forEach(element => { element.inert = false; });
    inerted = [];
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  }

  function init() {
    const types = new Set(['Training', 'Meeting', ...records.map(record => record.eventType)]);
    [...types].sort().forEach(type => {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      byId('myEventType').appendChild(option);
    });
    byId('myEventFilterTrigger').addEventListener('click', openFilter);
    byId('myEventCloseFilter').addEventListener('click', closeFilter);
    byId('myEventResetFilter').addEventListener('click', () => fillFilter(defaults));
    byId('myEventFilterOverlay').addEventListener('click', event => { if (event.target === event.currentTarget) closeFilter(); });
    byId('myEventFilterForm').addEventListener('input', validateDates);
    byId('myEventFilterForm').addEventListener('submit', event => {
      event.preventDefault();
      validateDates();
      if (!event.currentTarget.reportValidity()) return;
      applied = { start: byId('myEventStartDate').value, end: byId('myEventEndDate').value, eventType: byId('myEventType').value };
      render();
      closeFilter();
    });
    document.addEventListener('keydown', event => {
      if (byId('myEventFilterOverlay').hidden) return;
      if (event.key === 'Escape') { event.preventDefault(); closeFilter(); }
      if (event.key === 'Tab') {
        const controls = Array.from(byId('myEventFilterForm').querySelectorAll('button, input, select'));
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    render();
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
