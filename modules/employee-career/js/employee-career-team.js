(() => {
  const $ = id => document.getElementById(id);
  const source = window.EMPLOYEE_CAREER_STAFF_EVENTS || [];
  const events = [
    ['active', 'Active', 282], ['birthday', 'Birthday', 44], ['confirmation', 'Confirmation Due', 3],
    ['retirement-due', 'Retirement Due', 1], ['medical', 'Medical Check', 6],
    ['confirmation-past', 'Confirmation Past Due', 237], ['retirement', 'Retirement Past Due', 80], ['contract', 'Contract Expiry Past Due', 29]
  ].map(([id, title, total]) => ({ id, title, total, records: source.find(item => item.id === id)?.records || [] }));
  $('employeeCareerActiveHeadcountTotal').textContent = String(events.find(item => item.id === 'active').total);
  let opener;
  let background = [];
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  function renderEvents() {
    const selected = $('employeeCareerEventFilter').value;
    $('employeeCareerStaffEventRows').replaceChildren(...events.filter(item => !selected || item.id === selected).map(item => {
      const row = element('tr');
      row.append(element('td', '', item.title), element('td', '', String(item.total)));
      for (const kind of ['detail', 'chart']) {
        const cell = element('td');
        const button = element('button', 'employee-career-event-' + kind);
        button.type = 'button';
        button.dataset[kind === 'detail' ? 'careerEventDetail' : 'careerEventChart'] = item.id;
        button.setAttribute('aria-label', `${kind === 'detail' ? 'View details' : 'View chart'} for ${item.title}`);
        button.setAttribute('aria-haspopup', 'dialog');
        if (kind === 'chart') {
          const icon = element('i', 'fa-solid fa-chart-pie');
          icon.setAttribute('aria-hidden', 'true');
          button.append(icon);
        }
        button.append(element('span', '', kind === 'detail' ? 'Detail' : 'View Chart'));
        button.addEventListener('click', () => openEvent(item, kind, button));
        cell.append(button);
        row.append(cell);
      }
      return row;
    }));
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
  function openEvent(item, kind, trigger) {
    const overlay = $('employeeCareerTeamEventOverlay');
    opener = trigger;
    $('employeeCareerTeamEventTitle').textContent = item.title;
    $('employeeCareerTeamEventTotal').textContent = String(item.total);
    $('employeeCareerTeamEventDetails').hidden = kind !== 'detail';
    $('employeeCareerTeamEventChart').hidden = kind !== 'chart';
    if (kind === 'detail') {
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
    } else {
      const max = Math.max(...events.map(event => event.total));
      $('employeeCareerTeamEventBars').replaceChildren(...events.map(event => {
        const row = element('div', 'career-event-chart-row' + (event.id === item.id ? ' is-selected' : ''));
        row.append(element('span', 'career-event-chart-label', event.title), element('strong', 'career-event-chart-value', String(event.total)));
        const track = element('div', 'career-event-chart-track');
        track.setAttribute('aria-hidden', 'true');
        const fill = element('span', 'career-event-chart-fill');
        fill.style.width = `${event.total / max * 100}%`;
        track.append(fill);
        row.append(track);
        return row;
      }));
    }
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
    $('employeeCareerEventFilter').addEventListener('change', renderEvents);
    $('employeeCareerActiveHeadcount').addEventListener('click', () => showToast('Active Headcount is coming soon.'));
    $('employeeCareerVacantPosition').addEventListener('click', () => showToast('Vacant Position is coming soon.'));
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
