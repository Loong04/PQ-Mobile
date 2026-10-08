(() => {
  'use strict';
  const grid = document.getElementById('workplaceCalendarGrid');
  if (!grid) return;
  const monthTitle = document.getElementById('workplaceCalendarMonth');
  const store = window.BookResourceStore;
  const dialog = document.getElementById('workplaceBookingDetails');
  const bookingList = document.getElementById('workplaceBookingRecords');
  const feedback = document.getElementById('workplaceBookingFeedback');
  const loadError = document.getElementById('workplaceCalendarError');
  let bookings = [];
  const current = new Date();
  const today = new Date(current.getFullYear(), current.getMonth(), current.getDate(), 12);
  let selected = new Date(today);
  let month = new Date(today.getFullYear(), today.getMonth(), 1, 12);
  const isoDate = date => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  const fullDate = date => date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function selectedBookings() {
    return bookings.filter(record => record.date === isoDate(selected));
  }

  function positionDetails() {
    const phone = document.querySelector('.phone-container');
    const bounds = phone.getBoundingClientRect();
    Object.entries({ top: bounds.top, left: bounds.left, width: bounds.width, height: bounds.height }).forEach(([key, value]) => {
      dialog.style.setProperty('--schedule-sheet-' + key, value + 'px');
    });
    dialog.style.setProperty('--schedule-sheet-radius', getComputedStyle(phone).borderRadius);
  }

  function renderDetails() {
    const records = selectedBookings();
    const date = document.getElementById('workplaceBookingDate');
    date.dateTime = isoDate(selected);
    date.textContent = fullDate(selected);
    bookingList.replaceChildren();
    for (const record of records) {
      const planned = record.status === 'plan';
      const card = node('article', 'history-card-item');
      card.dataset.recordId = record.id;
      card.dataset.status = planned ? 'draft' : 'approved';
      const header = node('div', 'history-card-header');
      const heading = node('div', 'history-card-heading');
      heading.append(
        node('h4', 'history-card-title', store.resources.find(resource => resource.id === record.resource).name),
        node('span', 'booking-employee-name', record.employee.name),
        node('span', 'booking-employee-id', '#' + record.employee.empNo.replace(/^#+/, ''))
      );
      header.append(heading, node('span', 'status-pill ' + (planned ? 'draft' : 'approved'), planned ? 'Plan' : 'Confirmed'));
      const details = node('dl', 'history-card-details workplace-booking-rows');
      const rows = [
        ['Booking Date', new Date(record.date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })],
        ['Time', `${record.startTime} – ${record.endTime}`],
        ['Task', store.tasks.find(task => task.id === record.task).name],
        ['Purpose', record.purpose], ['Meeting Ref #', record.meetingRef], ['Remarks', record.remarks]
      ];
      for (const [label, value] of rows) {
        if (!value) continue;
        const row = node('div', 'workplace-booking-row');
        row.append(node('dt', '', label), node('dd', '', value));
        details.append(row);
      }
      const actions = node('div', 'history-card-actions');
      const action = node('button', planned ? 'history-submit-btn' : 'history-cancel-btn', planned ? 'Confirm' : 'Delete');
      action.type = 'button';
      action.dataset.bookingAction = planned ? 'confirm' : 'delete';
      action.setAttribute('aria-label', `${planned ? 'Confirm' : 'Delete'} ${store.resources.find(resource => resource.id === record.resource).name}, ${record.startTime} – ${record.endTime}`);
      actions.append(action);
      card.append(header, details, actions);
      bookingList.append(card);
    }
    if (!records.length && dialog.open) dialog.close();
  }

  function openDetails() {
    if (!selectedBookings().length) return;
    feedback.hidden = true;
    renderDetails();
    positionDetails();
    dialog.showModal();
  }

  function render() {
    try {
      store.ensureCalendarSamples();
      bookings = store.list();
      loadError.hidden = true;
    } catch {
      bookings = [];
      loadError.textContent = 'Unable to load resource bookings. Please try again.';
      loadError.hidden = false;
    }
    const counts = new Map();
    bookings.forEach(record => counts.set(record.date, (counts.get(record.date) || 0) + 1));
    monthTitle.textContent = month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    grid.setAttribute('aria-label', monthTitle.textContent + ' dates');
    const firstWeekday = (month.getDay() + 6) % 7;
    const monthLength = new Date(month.getFullYear(), month.getMonth() + 1, 0, 12).getDate();
    const length = Math.ceil((firstWeekday + monthLength) / 7) * 7;
    const selectedVisible = selected.getFullYear() === month.getFullYear() && selected.getMonth() === month.getMonth();
    const tabDate = selectedVisible ? isoDate(selected) : isoDate(month);
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < length; index++) {
      const date = new Date(month.getFullYear(), month.getMonth(), index - firstWeekday + 1, 12);
      const key = isoDate(date);
      const isToday = key === isoDate(today);
      const isSelected = key === isoDate(selected);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'cal-day-cell' + (date.getMonth() !== month.getMonth() ? ' other-month' : '') + (isToday ? ' is-today' : '') + (isSelected ? ' selected' : '');
      button.dataset.date = key;
      button.tabIndex = key === tabDate ? 0 : -1;
      const count = counts.get(key) || 0;
      button.setAttribute('aria-label', fullDate(date) + (isToday ? ', Today' : '') + (count ? `, ${count} resource booking${count === 1 ? '' : 's'}` : ''));
      button.classList.toggle('has-bookings', count > 0);
      if (count) {
        button.setAttribute('aria-haspopup', 'dialog');
        button.setAttribute('aria-controls', 'workplaceBookingDetails');
      }
      button.setAttribute('aria-pressed', String(isSelected));
      if (isToday) button.setAttribute('aria-current', 'date');
      const number = document.createElement('span');
      number.className = 'cal-date-num';
      number.textContent = date.getDate();
      button.append(number);
      if (count) button.append(node('span', 'workplace-booking-count', count));
      fragment.append(button);
    }
    grid.replaceChildren(fragment);
    if (dialog.open) renderDetails();
  }

  function selectDate(date) {
    selected = date;
    month = new Date(date.getFullYear(), date.getMonth(), 1, 12);
    render();
    const button = grid.querySelector(`[data-date="${isoDate(date)}"]`);
    button.focus({ preventScroll: true });
    const scroller = document.querySelector('.admin-content');
    const focused = button.getBoundingClientRect();
    const viewport = scroller.getBoundingClientRect();
    const navigation = document.querySelector('.bottom-nav');
    const visibleBottom = Math.min(viewport.bottom, navigation ? navigation.getBoundingClientRect().top : viewport.bottom);
    if (focused.top < viewport.top) scroller.scrollTop += focused.top - viewport.top - 8;
    else if (focused.bottom > visibleBottom) scroller.scrollTop += focused.bottom - visibleBottom + 8;
  }

  function parseDate(button) {
    const [year, monthNumber, day] = button.dataset.date.split('-').map(Number);
    return new Date(year, monthNumber - 1, day, 12);
  }

  function shiftMonth(direction) {
    month = new Date(month.getFullYear(), month.getMonth() + direction, 1, 12);
    render();
  }

  document.getElementById('workplaceCalendarPrevious').addEventListener('click', () => shiftMonth(-1));
  document.getElementById('workplaceCalendarNext').addEventListener('click', () => shiftMonth(1));
  grid.addEventListener('click', event => {
    const button = event.target.closest('button[data-date]');
    if (button) {
      selectDate(parseDate(button));
      openDetails();
    }
  });
  grid.addEventListener('keydown', event => {
    const button = event.target.closest('button[data-date]');
    if (!button) return;
    const date = parseDate(button);
    const offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (Object.hasOwn(offsets, event.key)) date.setDate(date.getDate() + offsets[event.key]);
    else if (event.key === 'Home') date.setDate(date.getDate() - (date.getDay() + 6) % 7);
    else if (event.key === 'End') date.setDate(date.getDate() + 6 - (date.getDay() + 6) % 7);
    else if (event.key === 'PageUp' || event.key === 'PageDown') {
      const day = date.getDate();
      date.setDate(1);
      date.setMonth(date.getMonth() + (event.key === 'PageUp' ? -1 : 1));
      date.setDate(Math.min(day, new Date(date.getFullYear(), date.getMonth() + 1, 0, 12).getDate()));
    } else return;
    event.preventDefault();
    selectDate(date);
  });
  bookingList.addEventListener('click', event => {
    const button = event.target.closest('[data-booking-action]');
    if (!button) return;
    const id = button.closest('[data-record-id]').dataset.recordId;
    try {
      if (button.dataset.bookingAction === 'confirm') store.confirm(id);
      else store.remove(id);
      render();
      feedback.textContent = button.dataset.bookingAction === 'confirm' ? 'Booking confirmed.' : 'Booking deleted.';
      feedback.classList.remove('is-error');
      feedback.hidden = false;
      if (dialog.open) {
        const updated = [...bookingList.querySelectorAll('[data-record-id]')].find(card => card.dataset.recordId === id);
        (updated?.querySelector('button') || bookingList.querySelector('button')).focus({ preventScroll: true });
      }
    } catch {
      feedback.textContent = 'Unable to update this booking. Please try again.';
      feedback.classList.add('is-error');
      feedback.hidden = false;
    }
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    grid.querySelector(`[data-date="${isoDate(selected)}"]`)?.focus({ preventScroll: true });
  });
  window.addEventListener('resize', () => { if (dialog.open) positionDetails(); });
  window.addEventListener('scroll', () => { if (dialog.open) positionDetails(); }, { passive: true });
  window.addEventListener('pageshow', render);
  window.addEventListener('storage', event => {
    if (event.key === 'peoplehcm:workplace:book-resource:v1' || event.key === null) render();
  });
  render();
})();
