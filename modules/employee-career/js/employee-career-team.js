(() => {
  const $ = id => document.getElementById(id);
  const source = window.EMPLOYEE_CAREER_STAFF_EVENTS || [];
  const events = [
    ['active', 'Active', 281], ['birthday', 'Birthday', 44], ['confirmation', 'Confirmation Due', 3],
    ['retirement-due', 'Retirement Due', 1], ['medical', 'Medical Check', 6],
    ['confirmation-past', 'Confirmation Past Due', 237], ['retirement', 'Retirement Past Due', 80], ['contract', 'Contract Expiry Past Due', 29]
  ].map(([id, title, total]) => ({ id, title, total, records: source.find(item => item.id === id)?.records || [] }));
  $('employeeCareerActiveHeadcountTotal').textContent = String(events.find(item => item.id === 'active').total);
  let opener;
  let background = [];
  let appliedEvent = '';
  let filterBackground = [];
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  function renderEvents() {
    const selected = appliedEvent;
    const selectedEvent = events.find(item => item.id === selected);
    $('employeeCareerEventFilterSummary').textContent = selectedEvent?.title || 'All Events';
    $('employeeCareerStaffEventRows').replaceChildren(...events.filter(item => !selected || item.id === selected).map(item => {
      const row = element('tr');
      row.append(element('td', '', item.title), element('td', '', String(item.total)));
      const cell = element('td');
      const button = element('button', 'employee-career-event-detail');
      button.type = 'button';
      button.dataset.careerEventDetail = item.id;
      button.setAttribute('aria-label', `View details for ${item.title}`);
      button.setAttribute('aria-haspopup', 'dialog');
      button.append(element('span', '', 'Detail'));
      button.addEventListener('click', () => openEvent(item, button));
      cell.append(button);
      row.append(cell);
      return row;
    }));
  }
  function closeEventFilter() {
    const overlay = $('employeeCareerEventFilterOverlay');
    if (overlay.hidden) return;
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-open');
    $('employeeCareerEventFilterTrigger').setAttribute('aria-expanded', 'false');
    filterBackground.forEach(node => { node.inert = false; });
    filterBackground = [];
    $('employeeCareerEventFilterTrigger').focus({ preventScroll: true });
  }
  function openEventFilter() {
    const overlay = $('employeeCareerEventFilterOverlay');
    const phone = overlay.parentElement;
    $('employeeCareerEventFilter').value = appliedEvent;
    filterBackground = [
      ...[...phone.children].filter(node => node !== overlay && !node.inert),
      ...[...document.body.children].filter(node => node !== phone && !node.inert)
    ];
    filterBackground.forEach(node => { node.inert = true; });
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-open');
    $('employeeCareerEventFilterTrigger').setAttribute('aria-expanded', 'true');
    $('employeeCareerEventFilter').focus({ preventScroll: true });
  }
  function applyEventFilter() {
    appliedEvent = $('employeeCareerEventFilter').value;
    closeEventFilter();
    renderEvents();
  }
  function resetEventFilter() {
    $('employeeCareerEventFilter').value = '';
    appliedEvent = '';
    closeEventFilter();
    renderEvents();
  }
  function closeEvent() {
    const overlay = $('employeeCareerTeamEventOverlay');
    if (overlay.hidden) return;
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
    background.forEach(node => { node.inert = false; });
    background = [];
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  }
  function openEvent(item, trigger) {
    const overlay = $('employeeCareerTeamEventOverlay');
    opener = trigger;
    $('employeeCareerTeamEventTitle').textContent = item.title;
    $('employeeCareerTeamEventTotal').textContent = String(item.total);
    $('employeeCareerTeamEventPeople').replaceChildren(...item.records.map(record => {
      const row = element('tr', 'career-event-person');
      const person = element('td');
      person.append(element('strong', 'career-event-person-name', record.name), element('span', 'career-event-person-id', '#' + record.empNo));
      const date = element('td', 'career-event-person-date', record.date ? new Date(record.date + 'T12:00:00').toLocaleDateString('en-GB') : '—');
      row.append(person, date);
      return row;
    }));
    $('employeeCareerTeamEventEmpty').hidden = item.records.length > 0;
    $('employeeCareerTeamEventDetails').querySelector('table').hidden = !item.records.length;
    $('employeeCareerTeamEventAvailable').hidden = !item.records.length || item.records.length === item.total;
    $('employeeCareerTeamEventAvailable').textContent = `${item.records.length} available employee records of ${item.total}.`;
    overlay.querySelector('.detail-popout-body').scrollTop = 0;
    background = [...overlay.parentElement.children].filter(node => node !== overlay && !node.inert);
    background.forEach(node => { node.inert = true; });
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    $('employeeCareerTeamEventClose').focus({ preventScroll: true });
  }
  function init() {
    if (!$('employeeCareerStaffEvents')) return;
    events.forEach(item => { const option = element('option', '', item.title); option.value = item.id; $('employeeCareerEventFilter').append(option); });
    $('employeeCareerEventFilterTrigger').addEventListener('click', openEventFilter);
    $('employeeCareerEventFilterClose').addEventListener('click', closeEventFilter);
    $('employeeCareerEventFilterReset').addEventListener('click', resetEventFilter);
    $('employeeCareerEventFilterForm').addEventListener('submit', event => { event.preventDefault(); applyEventFilter(); });
    $('employeeCareerEventFilterOverlay').addEventListener('click', event => { if (event.target === event.currentTarget) closeEventFilter(); });
    $('employeeCareerActiveHeadcount').addEventListener('click', () => {
      const url = new URL('../employee-career/options/team/active-headcount.html', location.href);
      url.searchParams.set('theme', document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
      location.href = url.href;
    });
    $('employeeCareerVacantPositionTotal').textContent = String(window.EMPLOYEE_CAREER_VACANT_POSITION?.total || 0);
    $('employeeCareerVacantPosition').addEventListener('click', () => {
      const url = new URL('options/team/vacant-position.html', location.href);
      url.searchParams.set('theme', document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
      location.href = url.href;
    });
    const pending = (window.EMPLOYEE_CAREER_PENDING_DATA || []).filter(item => !item.status || item.status === 'pending').length;
    $('employeeCareerPendingCount').textContent = String(pending);
    $('employeeCareerTeamTaskCount').textContent = `${pending} ${pending === 1 ? 'Task' : 'Tasks'}`;
    $('employeeCareerPendingApproval').addEventListener('click', () => {
      const url = new URL($('employeeCareerPendingApproval').href);
      url.searchParams.set('theme', document.documentElement.dataset.theme);
      $('employeeCareerPendingApproval').href = url.href;
    });
    $('employeeCareerTeamEventClose').addEventListener('click', closeEvent);
    $('employeeCareerTeamEventOverlay').addEventListener('click', event => { if (event.target === event.currentTarget) closeEvent(); });
    document.addEventListener('keydown', event => {
      const filterOverlay = $('employeeCareerEventFilterOverlay');
      if (!filterOverlay.hidden) {
        if (event.key === 'Escape') { event.preventDefault(); closeEventFilter(); }
        if (event.key === 'Tab') {
          const controls = [...filterOverlay.querySelectorAll('button, input, select, [tabindex="0"]')].filter(node => node.getClientRects().length && !node.disabled);
          const first = controls[0], last = controls.at(-1);
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
        return;
      }
      if ($('employeeCareerTeamEventOverlay').hidden) return;
      if (event.key === 'Escape') { event.preventDefault(); closeEvent(); }
      if (event.key === 'Tab') {
        const controls = [...$('employeeCareerTeamEventOverlay').querySelectorAll('button, [tabindex="0"]')].filter(node => node.getClientRects().length && !node.disabled);
        const first = controls[0], last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    renderEvents();
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
