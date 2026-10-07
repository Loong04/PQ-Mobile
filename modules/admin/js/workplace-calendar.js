(() => {
  'use strict';
  const grid = document.getElementById('workplaceCalendarGrid');
  if (!grid) return;
  const monthTitle = document.getElementById('workplaceCalendarMonth');
  const selectedTime = document.getElementById('workplaceCalendarSelectedDate');
  const selection = document.getElementById('workplaceCalendarSelection');
  const current = new Date();
  const today = new Date(current.getFullYear(), current.getMonth(), current.getDate(), 12);
  let selected = new Date(today);
  let month = new Date(today.getFullYear(), today.getMonth(), 1, 12);
  const isoDate = date => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  const fullDate = date => date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  function render() {
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
      button.setAttribute('aria-label', fullDate(date) + (isToday ? ', Today' : ''));
      button.setAttribute('aria-pressed', String(isSelected));
      if (isToday) button.setAttribute('aria-current', 'date');
      const number = document.createElement('span');
      number.className = 'cal-date-num';
      number.textContent = date.getDate();
      button.append(number);
      fragment.append(button);
    }
    grid.replaceChildren(fragment);
    selection.hidden = !selectedVisible;
    selectedTime.dateTime = isoDate(selected);
    selectedTime.textContent = fullDate(selected);
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
    if (button) selectDate(parseDate(button));
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
  render();
})();
