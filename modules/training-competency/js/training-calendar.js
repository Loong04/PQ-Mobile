(() => {
  const source = window.TRAINING_CALENDAR_DATA || { initialMonth: '2026-10', events: [] };
  const pageType = document.body.dataset.trainingCalendarPage;
  const params = new URLSearchParams(location.search);
  const theme = () => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';

  function parseDateKey(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
    return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
  }

  function formatDate(value) {
    const date = parseDateKey(value);
    return date ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date) : value;
  }

  function formatTime(value) {
    const match = /T(\d{2}):(\d{2})/.exec(value || '');
    if (!match) return '-';
    const hour = Number(match[1]);
    const minute = match[2];
    return `${hour % 12 || 12}:${minute} ${hour >= 12 ? 'PM' : 'AM'}`;
  }

  function formatDateTime(value) {
    const [dateKey] = (value || '').split('T');
    return `${formatDate(dateKey)}, ${formatTime(value)}`;
  }

  function calendarUrl(date) {
    const query = new URLSearchParams({ date, theme: theme() });
    return `training-calendar.html?${query}`;
  }

  function detailsUrl(event) {
    const query = new URLSearchParams({ request: event.id, date: event.date, theme: theme() });
    return `training-request-details.html?${query}`;
  }

  function initCalendar() {
    const grid = document.getElementById('trainingCalendarGrid');
    const monthTitle = document.getElementById('trainingCalendarMonth');
    const overlay = document.getElementById('trainingCalendarSheet');
    const eventsList = document.getElementById('trainingCalendarEvents');
    const sheetDate = document.getElementById('trainingCalendarSheetDate');
    const closeButton = document.getElementById('trainingCalendarSheetClose');
    const main = document.querySelector('main');
    const requestedDate = parseDateKey(params.get('date'));
    const initialParts = (source.initialMonth || '2026-10').split('-').map(Number);
    let visibleMonth = requestedDate || new Date(initialParts[0], initialParts[1] - 1, 1);
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    let selectedDate = requestedDate ? params.get('date') : '';
    let lastTrigger = null;

    function syncLinks() {
      document.getElementById('trainingCalendarBack').href = `../index.html?scope=individual&theme=${theme()}`;
      eventsList.querySelectorAll('[data-request-id]').forEach(link => {
        const event = source.events.find(item => item.id === link.dataset.requestId);
        if (event) link.href = detailsUrl(event);
      });
    }

    function eventsFor(dateKey) {
      return source.events.filter(event => event.date === dateKey);
    }

    function closeSheet(restoreFocus = true) {
      if (overlay.getAttribute('aria-hidden') === 'true') return;
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      main.inert = false;
      if (restoreFocus && lastTrigger?.isConnected) lastTrigger.focus({ preventScroll: true });
    }

    function openSheet(dateKey, trigger) {
      const events = eventsFor(dateKey);
      if (!events.length) return;
      selectedDate = dateKey;
      lastTrigger = trigger;
      document.querySelectorAll('.training-calendar-day').forEach(day => day.classList.toggle('selected', day.dataset.date === dateKey));
      sheetDate.textContent = formatDate(dateKey);
      eventsList.replaceChildren(...events.map(event => {
        const card = document.createElement('article');
        card.className = 'training-calendar-event-card';
        const heading = document.createElement('h3');
        heading.className = 'training-calendar-event-header';
        heading.textContent = event.activity;
        const body = document.createElement('div');
        body.className = 'training-calendar-event-body';
        const time = document.createElement('div');
        time.className = 'training-calendar-event-time';
        time.textContent = `${formatTime(event.classDetails.start)} – ${formatTime(event.classDetails.end)}`;
        const actions = document.createElement('div');
        actions.className = 'training-calendar-event-actions';
        const detail = document.createElement('a');
        detail.className = 'training-calendar-detail';
        detail.dataset.requestId = event.id;
        detail.href = detailsUrl(event);
        detail.textContent = 'Detail';
        actions.append(detail);
        body.append(time, actions);
        card.append(heading, body);
        return card;
      }));
      syncLinks();
      main.inert = true;
      overlay.setAttribute('aria-hidden', 'false');
      requestAnimationFrame(() => {
        overlay.classList.add('is-open');
        closeButton.focus({ preventScroll: true });
      });
    }

    function dateKey(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    function render() {
      const year = visibleMonth.getFullYear();
      const month = visibleMonth.getMonth();
      monthTitle.textContent = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(visibleMonth);
      const mondayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
      const firstCell = new Date(year, month, 1 - mondayOffset);
      const fragment = document.createDocumentFragment();
      for (let index = 0; index < 42; index += 1) {
        const date = new Date(firstCell.getFullYear(), firstCell.getMonth(), firstCell.getDate() + index);
        const key = dateKey(date);
        const events = eventsFor(key);
        const day = document.createElement(events.length ? 'button' : 'span');
        day.className = 'training-calendar-day';
        day.dataset.date = key;
        day.dataset.hasEvents = String(Boolean(events.length));
        day.textContent = date.getDate();
        if (date.getMonth() !== month) day.classList.add('outside-month');
        if (key === '2026-10-15') day.classList.add('today');
        if (key === selectedDate) day.classList.add('selected');
        if (events.length) {
          day.type = 'button';
          day.setAttribute('aria-label', `${formatDate(key)}, ${events.length} training ${events.length === 1 ? 'activity' : 'activities'}`);
          day.addEventListener('click', () => openSheet(key, day));
        }
        fragment.append(day);
      }
      grid.replaceChildren(fragment);
    }

    document.getElementById('trainingCalendarPrevious').addEventListener('click', () => {
      closeSheet(false);
      visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
      selectedDate = '';
      render();
    });
    document.getElementById('trainingCalendarNext').addEventListener('click', () => {
      closeSheet(false);
      visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
      selectedDate = '';
      render();
    });
    closeButton.addEventListener('click', () => closeSheet());
    document.getElementById('trainingCalendarSheetCancel').addEventListener('click', () => closeSheet());
    overlay.addEventListener('click', event => { if (event.target === overlay) closeSheet(); });
    overlay.querySelector('[role="dialog"]').addEventListener('click', event => event.stopPropagation());
    document.addEventListener('keydown', event => {
      if (overlay.getAttribute('aria-hidden') === 'true') return;
      if (event.key === 'Escape') { event.preventDefault(); closeSheet(); return; }
      if (event.key !== 'Tab') return;
      const controls = [...overlay.querySelectorAll('button,a[href]')].filter(control => control.getClientRects().length);
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    new MutationObserver(syncLinks).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    render();
    syncLinks();
    if (selectedDate && eventsFor(selectedDate).length) {
      const trigger = grid.querySelector(`[data-date="${selectedDate}"]`);
      requestAnimationFrame(() => openSheet(selectedDate, trigger));
    }
  }

  function statusMarkup(value, modifier = '') {
    const span = document.createElement('span');
    span.className = `training-request-status ${modifier}`.trim();
    span.textContent = value;
    return span;
  }

  function field(label, value, name, renderer) {
    const row = document.createElement('div');
    row.className = 'training-request-field';
    if (name) row.dataset.field = name;
    const term = document.createElement('dt');
    term.textContent = label;
    const description = document.createElement('dd');
    if (renderer) description.append(renderer());
    else description.textContent = value || '-';
    row.append(term, description);
    return row;
  }

  function initDetails() {
    const event = source.events.find(item => item.id === params.get('request'));
    const details = document.getElementById('trainingRequestDetails');
    const unavailable = document.getElementById('trainingRequestUnavailable');
    const classFields = document.getElementById('trainingClassDetails');
    const requestFields = document.getElementById('trainingRequestFields');
    const selectedDate = event?.date || params.get('date') || source.events[0]?.date || source.initialMonth + '-01';

    function syncLinks() {
      const href = calendarUrl(selectedDate);
      document.getElementById('trainingRequestBack').href = href;
      document.getElementById('trainingRequestCancel').href = href;
    }

    syncLinks();
    new MutationObserver(syncLinks).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    if (!event) {
      details.hidden = true;
      unavailable.hidden = false;
      return;
    }

    const classData = event.classDetails;
    const requestData = event.requestDetails;
    classFields.replaceChildren(
      field('Class', classData.class),
      field('Description', classData.description),
      field('Course Title', classData.courseTitle),
      field('Class Status', '', 'class-status', () => statusMarkup(classData.classStatus, 'scheduled')),
      field('Start', formatDateTime(classData.start)),
      field('End', formatDateTime(classData.end)),
      field('Venue', classData.venue),
      field('Trainer / Facilitator', classData.trainer),
      field('Class Capacity', classData.capacity),
      field('Remark', classData.remark)
    );
    requestFields.replaceChildren(
      field('Document Reference', requestData.documentReference),
      field('Document Status', '', 'document-status', () => statusMarkup(requestData.documentStatus)),
      field('Employee', '', 'employee', () => {
        const wrapper = document.createElement('span');
        const name = document.createElement('span');
        name.className = 'training-request-employee-name';
        name.textContent = requestData.employee.name;
        const employeeId = document.createElement('span');
        employeeId.className = 'training-request-employee-id';
        employeeId.textContent = `#${String(requestData.employee.empNo).replace(/^#/, '')}`;
        wrapper.append(name, employeeId);
        return wrapper;
      }),
      field('Attendance Status', '', 'attendance-status', () => statusMarkup(requestData.attendanceStatus, 'registered')),
      field('Reason', requestData.reason),
      field('Is Require Traveling', requestData.requireTraveling),
      field('Is Require Accommodation', requestData.requireAccommodation),
      field('Is Vegetarian', requestData.vegetarian),
      field('Remark', requestData.remark),
      field('Attended Hours', requestData.attendedHours),
      field('Attendance Remark', requestData.attendanceRemark),
      field('Approver Comments', requestData.approverComments)
    );
  }

  if (pageType === 'calendar') initCalendar();
  if (pageType === 'details') initDetails();
})();
