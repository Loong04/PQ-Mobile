/* Project & Task module navigation. Option content is implemented separately. */
(function () {
  const individualCalendarEvents = new Map([
    ['2026-10-02', { badge: 'TS', type: 'timesheet', title: 'Draft timesheet' }],
    ['2026-10-05', { badge: 'WP', type: 'work-plan', title: 'Client portal sprint starts' }],
    ['2026-10-12', { badge: 'WP', type: 'work-plan', title: 'Policy archive cleanup starts' }],
    ['2026-10-22', { badge: 'DL', type: 'deadline', title: 'Client portal sprint deadline' }],
    ['2026-10-30', { badge: 'DL', type: 'deadline', title: 'Policy archive cleanup deadline' }]
  ]);
  const individualTimesheetDetails = new Map([
    ['2026-10-02', {
      reference: 'ETS00000002819',
      status: 'Draft',
      dateLabel: '2 Oct 2026',
      normalHours: '7.50',
      otHours: '1.00'
    }]
  ]);
  let calendarYear = 2026;
  let calendarMonth = 9;
  let selectedCalendarDate = '2026-10-02';

  function calendarDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function renderIndividualCalendar() {
    const calendarGrid = document.getElementById('projectCalendarGrid');
    const monthLabel = document.getElementById('projectCalendarMonth');
    if (!calendarGrid || !monthLabel) return;

    const firstOfMonth = new Date(calendarYear, calendarMonth, 1);
    const firstWeekdayOffset = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const totalCells = Math.ceil((firstWeekdayOffset + daysInMonth) / 7) * 7;
    const todayKey = calendarDateKey(new Date());

    monthLabel.textContent = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric'
    }).format(firstOfMonth);
    calendarGrid.replaceChildren();

    for (let cellIndex = 0; cellIndex < totalCells; cellIndex += 1) {
      const dayNumber = cellIndex - firstWeekdayOffset + 1;
      const cellDate = new Date(calendarYear, calendarMonth, dayNumber);
      const dateKey = calendarDateKey(cellDate);
      const calendarEvent = individualCalendarEvents.get(dateKey);
      const day = document.createElement('button');
      day.type = 'button';
      day.className = 'project-calendar-day';
      day.dataset.date = dateKey;
      day.setAttribute('aria-pressed', String(dateKey === selectedCalendarDate));
      day.setAttribute('aria-label', calendarEvent
        ? `${cellDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}: ${calendarEvent.title}`
        : cellDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));

      if (cellDate.getMonth() !== calendarMonth) day.classList.add('is-outside');
      if (dateKey === todayKey) day.classList.add('is-today');
      if (dateKey === selectedCalendarDate) day.classList.add('is-selected');
      if (calendarEvent && cellDate.getMonth() === calendarMonth) {
        day.classList.add('has-event');
        day.dataset.eventType = calendarEvent.type;
      }
      if (cellDate.getMonth() === calendarMonth) {
        day.addEventListener('click', () => {
          selectedCalendarDate = dateKey;
          renderIndividualCalendar();
        });
      }

      const number = document.createElement('span');
      number.textContent = String(cellDate.getDate());
      day.appendChild(number);

      if (calendarEvent && cellDate.getMonth() === calendarMonth) {
        const badge = document.createElement('span');
        badge.className = 'project-calendar-day-badge';
        badge.textContent = calendarEvent.badge;
        day.appendChild(badge);
      }

      calendarGrid.appendChild(day);
    }
    renderCalendarDetails();
  }

  function renderCalendarDetails() {
    const detailsCard = document.getElementById('projectCalendarDetails');
    if (!detailsCard) return;
    const details = individualTimesheetDetails.get(selectedCalendarDate);
    const selectedDate = new Date(`${selectedCalendarDate || ''}T00:00:00`);
    const selectedMonthIsVisible = Number.isFinite(selectedDate.getTime())
      && selectedDate.getFullYear() === calendarYear
      && selectedDate.getMonth() === calendarMonth;
    detailsCard.hidden = !details || !selectedMonthIsVisible;
    if (!details || !selectedMonthIsVisible) return;

    document.getElementById('projectCalendarDetailReference').textContent = details.reference;
    document.getElementById('projectCalendarDetailStatus').textContent = details.status;
    document.getElementById('projectCalendarDetailDate').textContent = details.dateLabel;
    document.getElementById('projectCalendarDetailNormalHours').textContent = details.normalHours;
    document.getElementById('projectCalendarDetailOtHours').textContent = details.otHours;
  }

  function changeCalendarMonth(monthOffset) {
    const nextMonth = new Date(calendarYear, calendarMonth + monthOffset, 1);
    calendarYear = nextMonth.getFullYear();
    calendarMonth = nextMonth.getMonth();
    selectedCalendarDate = null;
    renderIndividualCalendar();
  }

  function syncThemeNavigation() {
    const theme = getCurrentTheme();
    const url = new URL(window.location.href);
    url.searchParams.set('theme', theme);
    window.history.replaceState(null, '', url);
    for (const link of document.querySelectorAll('.project-option, .project-team-action-card')) {
      const target = new URL(link.href);
      target.searchParams.set('theme', theme);
      link.href = target.href;
    }
  }

  function switchScope(scope, focusTab = false) {
    const selected = scope === 'team' ? 'team' : 'individual';
    for (const name of ['individual', 'team']) {
      const tab = document.getElementById(`projectTab-${name}`);
      const panel = document.getElementById(`projectPanel-${name}`);
      const active = name === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panel.hidden = !active;
      if (active && focusTab) tab.focus({ preventScroll: true });
    }
    const url = new URL(window.location.href);
    url.searchParams.set('scope', selected);
    window.history.replaceState(null, '', url);
  }

  function initPendingApprovalSelection() {
    const selectAll = document.getElementById('projectApprovalSelectAll');
    const boxes = [...document.querySelectorAll('#projectTimesheetApprovalList .approval-card-checkbox')];
    if (!selectAll || !boxes.length) return;
    const syncSelectAll = () => {
      const selected = boxes.filter(box => box.checked).length;
      selectAll.checked = selected === boxes.length;
      selectAll.indeterminate = selected > 0 && selected < boxes.length;
    };
    selectAll.addEventListener('change', () => {
      boxes.forEach(box => { box.checked = selectAll.checked; });
      syncSelectAll();
    });
    boxes.forEach(box => box.addEventListener('change', syncSelectAll));
  }

  function initPendingApprovalSheets() {
    const phone = document.querySelector('.phone-container');
    const menu = document.getElementById('projectApprovalMenu');
    const details = document.getElementById('projectApprovalDetails');
    const workflow = document.getElementById('projectApprovalWorkflow');
    if (!phone || !menu || !details || !workflow) return;
    let currentCard = null;
    let currentMenuTrigger = null;
    let activeOverlay = null;
    let returnFocus = null;
    let inertElements = [];
    const openOverlay = (overlay, trigger) => {
      if (activeOverlay) closeOverlay(false);
      activeOverlay = overlay;
      returnFocus = trigger || document.activeElement;
      inertElements = [...phone.children].filter(node => node !== overlay && !node.inert);
      inertElements.forEach(node => { node.inert = true; });
      overlay.hidden = false;
      requestAnimationFrame(() => overlay.classList.add('is-open'));
      overlay.querySelector('button')?.focus({ preventScroll: true });
    };
    const closeOverlay = (restoreFocus = true) => {
      if (!activeOverlay) return;
      activeOverlay.classList.remove('is-open');
      activeOverlay.hidden = true;
      inertElements.forEach(node => { node.inert = false; });
      activeOverlay = null;
      inertElements = [];
      if (restoreFocus) returnFocus?.focus({ preventScroll: true });
    };
    const value = key => currentCard?.dataset[key] || '—';
    const fillDetails = () => {
      const fields = {
        projectApprovalDetailReference: 'reference',
        projectApprovalDetailEmployeeId: 'employeeId',
        projectApprovalDetailEmployeeName: 'employeeName',
        projectApprovalDetailStatus: 'status',
        projectApprovalDetailDate: 'date',
        projectApprovalDetailNormalHours: 'normalHours',
        projectApprovalDetailOtHours: 'otHours'
      };
      Object.entries(fields).forEach(([id, key]) => {
        document.getElementById(id).textContent = value(key);
      });
    };
    document.querySelectorAll('[data-project-approval-menu]').forEach(button => {
      button.addEventListener('click', () => {
        currentCard = button.closest('.project-approval-card');
        currentMenuTrigger = button;
        openOverlay(menu, button);
      });
    });
    document.getElementById('projectApprovalViewDetails').addEventListener('click', event => {
      fillDetails();
      closeOverlay(false);
      openOverlay(details, currentMenuTrigger || event.currentTarget);
    });
    document.getElementById('projectApprovalViewWorkflow').addEventListener('click', event => {
      document.getElementById('projectApprovalWorkflowReference').textContent = value('reference');
      document.getElementById('projectApprovalWorkflowName').textContent = value('employeeName');
      document.getElementById('projectApprovalWorkflowEmployeeId').textContent = value('employeeId');
      closeOverlay(false);
      openOverlay(workflow, currentMenuTrigger || event.currentTarget);
    });
    document.querySelectorAll('[data-close-project-approval]').forEach(button => button.addEventListener('click', () => closeOverlay()));
    [menu, details, workflow].forEach(overlay => overlay.addEventListener('click', event => {
      if (event.target === overlay) closeOverlay();
    }));
    document.addEventListener('keydown', event => {
      if (!activeOverlay) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeOverlay();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setTheme(getCurrentTheme());
    syncThemeNavigation();
    initPendingApprovalSelection();
    initPendingApprovalSheets();
    document.addEventListener('click', event => {
      if (event.target.closest('[data-set-theme], .project-option, .project-team-action-card')) syncThemeNavigation();
    });
    if (!document.getElementById('projectTab-individual')) return;
    document.getElementById('projectCalendarPrevious')?.addEventListener('click', () => changeCalendarMonth(-1));
    document.getElementById('projectCalendarNext')?.addEventListener('click', () => changeCalendarMonth(1));
    renderIndividualCalendar();
    switchScope(new URLSearchParams(window.location.search).get('scope'));
    for (const scope of ['individual', 'team']) {
      const tab = document.getElementById(`projectTab-${scope}`);
      tab.addEventListener('click', () => switchScope(scope));
      tab.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 'individual' : event.key === 'End' ? 'team' : scope === 'individual' ? 'team' : 'individual';
        switchScope(next, true);
      });
    }
    document.documentElement.dataset.projectDashboardReady = 'true';
  });
})();
