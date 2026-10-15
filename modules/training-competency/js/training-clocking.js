(() => {
  'use strict';

  const employeeId = window.TRAINING_COMPETENCY_INDIVIDUAL?.employee?.empNo || 'current-user';
  const storageKey = `peoplehcm.trainingClocking.records.v1.${employeeId}`;
  const clockIn = document.getElementById('trainingClockIn');
  const clockOut = document.getElementById('trainingClockOut');
  const rows = document.getElementById('trainingClockingRows');
  const empty = document.getElementById('trainingClockingEmpty');
  const status = document.getElementById('trainingClockingStatus');
  let records = loadRecords();
  const previewRecords = createPreviewRecords();
  let timer = 0;

  function theme() {
    return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
  }

  function syncBackLink() {
    document.getElementById('trainingClockingBack').href = `../index.html?scope=individual&theme=${theme()}`;
  }

  function formatDate(date) {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function formatTime(date) {
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

  function updateCurrentTime() {
    const now = new Date();
    document.getElementById('trainingClockingDay').textContent = now.toLocaleDateString('en-GB', { weekday: 'long' });
    document.getElementById('trainingClockingDate').textContent = formatDate(now);
    document.getElementById('trainingClockingTime').textContent = formatTime(now);
  }

  // Display two completed preview sessions without persisting them or changing clocking state.
  function createPreviewRecords() {
    const today = new Date();
    return [2, 1].flatMap(daysAgo => ['Clock In', 'Clock Out'].map(type => {
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);
      date.setHours(type === 'Clock In' ? 9 : 17, 0, 0, 0);
      return {
        timestamp: date.toISOString(),
        date: formatDate(date),
        type,
        time: formatTime(date)
      };
    }));
  }

  function startClock() {
    window.clearInterval(timer);
    updateCurrentTime();
    timer = window.setInterval(updateCurrentTime, 1000);
  }

  function stopClock() {
    window.clearInterval(timer);
    timer = 0;
  }

  function validRecord(record) {
    return record
      && typeof record.id === 'string'
      && record.employeeId === employeeId
      && typeof record.timestamp === 'string'
      && typeof record.date === 'string'
      && typeof record.time === 'string'
      && ['Clock In', 'Clock Out'].includes(record.type);
  }

  function loadRecords() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return Array.isArray(saved) ? saved.filter(validRecord) : [];
    } catch {
      return [];
    }
  }

  function saveRecords() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(records));
      return true;
    } catch {
      status.textContent = 'Unable to save the clocking record';
      return false;
    }
  }

  function isClockedIn() {
    return records.at(-1)?.type === 'Clock In';
  }

  function createRow(record, preview = false) {
    const row = document.createElement('tr');
    if (preview) row.dataset.preview = 'true';
    const date = document.createElement('td');
    const typeCell = document.createElement('td');
    const type = document.createElement('span');
    const time = document.createElement('td');
    date.textContent = record.date;
    type.className = 'training-clocking-type';
    type.dataset.type = record.type;
    type.textContent = record.type;
    typeCell.append(type);
    time.textContent = record.time;
    row.append(date, typeCell, time);
    return row;
  }

  function render() {
    const history = [...previewRecords.map(record => ({ record, preview: true })), ...records.map(record => ({ record, preview: false }))]
      .sort((left, right) => right.record.timestamp.localeCompare(left.record.timestamp));
    rows.replaceChildren(...history.map(({ record, preview }) => createRow(record, preview)));
    empty.hidden = history.length > 0;
    clockIn.disabled = isClockedIn();
    clockOut.disabled = !isClockedIn();
    if (!records.length) status.textContent = 'Ready to clock in';
    else if (isClockedIn()) status.textContent = `Currently clocked in since ${records.at(-1).time}`;
    else status.textContent = `Last clocked out at ${records.at(-1).time}`;
  }

  function addRecord(type) {
    if ((type === 'Clock In' && isClockedIn()) || (type === 'Clock Out' && !isClockedIn())) return;
    const now = new Date();
    const record = {
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      employeeId,
      timestamp: now.toISOString(),
      date: formatDate(now),
      type,
      time: formatTime(now)
    };
    records.push(record);
    if (!saveRecords()) {
      records.pop();
      render();
      status.textContent = 'Unable to save the clocking record';
      return;
    }
    render();
    status.textContent = `${type === 'Clock In' ? 'Clocked in' : 'Clocked out'} at ${record.time}`;
  }

  clockIn.addEventListener('click', () => addRecord('Clock In'));
  clockOut.addEventListener('click', () => addRecord('Clock Out'));
  new MutationObserver(syncBackLink).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  syncBackLink();
  render();
  startClock();
  window.addEventListener('pagehide', stopClock);
  window.addEventListener('pageshow', startClock);
})();
