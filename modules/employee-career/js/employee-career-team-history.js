(() => {
  const data = window.EMPLOYEE_CAREER_TEAM_HISTORY_DATA || {};
  const labels = {
    'staff-confirmation': 'Staff Confirmation',
    'staff-exit': 'Staff Exit',
    'staff-request': 'Staff Request',
    'staff-engagement': 'Staff Engagement'
  };
  const statusMeta = {
    approved: { tone: 'approved', icon: 'fa-check' },
    completed: { tone: 'approved', icon: 'fa-check' },
    pending: { tone: 'submitted', icon: 'fa-clock' },
    'follow-up required': { tone: 'submitted', icon: 'fa-rotate-right' },
    'to resubmit': { tone: 'resubmit', icon: 'fa-rotate-left' },
    draft: { tone: 'draft', icon: 'fa-file-pen' },
    rejected: { tone: 'rejected', icon: 'fa-xmark' }
  };
  const defaultKind = 'staff-confirmation';
  const requestedKind = new URLSearchParams(location.search).get('category');
  let kind = Object.hasOwn(labels, requestedKind) ? requestedKind : defaultKind;
  const confirmationDefaults = { startDate: '', endDate: '' };
  let confirmationFilter = { ...confirmationDefaults };
  let activeOverlay = null;
  let returnFocus = null;
  let inerted = [];

  const $ = id => document.getElementById(id);

  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);

  function formatDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
    if (!match) return value || '';
    const [, year, month, day] = match;
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))));
  }

  function confirmationFilterSummary() {
    const { startDate, endDate } = confirmationFilter;
    if (startDate && endDate) return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    if (startDate) return `From ${formatDate(startDate)}`;
    if (endDate) return `Until ${formatDate(endDate)}`;
    return 'All Submission Dates';
  }

  function visibleRecords() {
    const records = Array.isArray(data[kind]) ? data[kind] : [];
    if (kind !== 'staff-confirmation') return records;
    const { startDate, endDate } = confirmationFilter;
    if (!startDate && !endDate) return records;
    return records.filter(record => {
      const submittedDate = String(record.submittedDate || '');
      if (!submittedDate) return false;
      return (!startDate || submittedDate >= startDate) && (!endDate || submittedDate <= endDate);
    });
  }

  function updateUrl() {
    const url = new URL(location.href);
    url.searchParams.set('category', kind);
    history.replaceState({}, '', url);
  }

  function statusMarkup(record) {
    const label = String(record.status || 'Pending');
    const meta = statusMeta[label.toLowerCase()] || statusMeta.pending;
    return {
      tone: meta.tone,
      html: `<span class="status-pill ${meta.tone}"><i class="fa-solid ${meta.icon}" aria-hidden="true"></i><span>${escape(label)}</span></span>`
    };
  }

  function fieldMarkup(fields) {
    return (Array.isArray(fields) ? fields : []).map(([label, value]) => `
      <span class="history-card-row">
        <span>${escape(label)}</span>
        <strong>${escape(value || '\u2014')}</strong>
      </span>`).join('');
  }

  function headingMarkup(record) {
    if (kind === 'staff-request') {
      return `<span class="history-card-heading team-history-request-heading">
        <span class="team-history-request-title">${escape(record.title || '\u2014')}</span>
        <span class="team-history-request-ref">Ref: ${escape(record.reference || record.id || '\u2014')}</span>
      </span>`;
    }

    const empNo = String(record.empNo || '').replace(/^#+/, '');
    return `<span class="history-card-heading team-history-employee-heading">
      <span class="team-history-employee-name">${escape(record.employeeName || '\u2014')}</span>
      <span class="team-history-employee-id">#${escape(empNo)}</span>
      ${kind === 'staff-confirmation' ? '' : `<span class="team-history-record-ref">Ref: ${escape(record.id || '\u2014')}</span>`}
    </span>`;
  }

  function cardMarkup(record) {
    const status = statusMarkup(record);
    const name = kind === 'staff-request' ? record.title : record.employeeName;
    return `<article class="history-card-item team-history-card" data-status="${status.tone}" aria-label="${escape(name || labels[kind])}, ${escape(record.status || 'Pending')}">
      <span class="history-card-header">
        ${headingMarkup(record)}
        ${status.html}
      </span>
      <span class="history-card-details team-history-card-details">
        ${fieldMarkup(record.fields)}
      </span>
    </article>`;
  }

  function render() {
    const records = visibleRecords();
    document.querySelectorAll('[data-team-history-kind]').forEach(button => {
      const active = button.dataset.teamHistoryKind === kind;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    const title = $('teamHistoryCategoryTitle');
    const count = $('teamHistoryRecordCount');
    const list = $('teamHistoryList');
    const empty = $('teamHistoryEmpty');
    const emptyCopy = $('teamHistoryEmptyCopy');
    const filterBar = $('teamConfirmationFilterBar');
    if (filterBar) filterBar.hidden = kind !== 'staff-confirmation';
    if ($('teamConfirmationFilterSummary')) $('teamConfirmationFilterSummary').textContent = confirmationFilterSummary();
    if (title) title.textContent = `${labels[kind]} History`;
    if (count) count.textContent = String(records.length);
    if (list) list.innerHTML = records.map(cardMarkup).join('');
    if (empty) empty.hidden = records.length > 0;
    if (emptyCopy) {
      const filteredConfirmation = kind === 'staff-confirmation' && (confirmationFilter.startDate || confirmationFilter.endDate);
      emptyCopy.textContent = filteredConfirmation
        ? 'No records match the selected submission dates.'
        : 'There are no records in this category yet.';
    }
  }

  function fillConfirmationFilter(values) {
    $('teamConfirmationStartDate').value = values.startDate;
    $('teamConfirmationEndDate').value = values.endDate;
    $('teamConfirmationFilterError').hidden = true;
    $('teamConfirmationFilterError').textContent = '';
    $('teamConfirmationStartDate').removeAttribute('aria-invalid');
    $('teamConfirmationEndDate').removeAttribute('aria-invalid');
  }

  function openConfirmationFilter() {
    if (kind !== 'staff-confirmation') return;
    const overlay = $('teamConfirmationFilterOverlay');
    fillConfirmationFilter(confirmationFilter);
    activeOverlay = overlay;
    returnFocus = document.activeElement;
    overlay.hidden = false;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    inerted = [...overlay.parentElement.children].filter(node => node !== overlay && !node.inert);
    inerted.forEach(node => { node.inert = true; });
    $('teamConfirmationStartDate').focus({ preventScroll: true });
  }

  function closeConfirmationFilter({ restoreFocus = true } = {}) {
    if (!activeOverlay) return;
    activeOverlay.hidden = true;
    activeOverlay.classList.remove('is-open');
    activeOverlay.setAttribute('aria-hidden', 'true');
    activeOverlay = null;
    inerted.forEach(node => { node.inert = false; });
    inerted = [];
    if (restoreFocus && returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    returnFocus = null;
  }

  function applyConfirmationFilter() {
    const start = $('teamConfirmationStartDate');
    const end = $('teamConfirmationEndDate');
    const error = $('teamConfirmationFilterError');
    start.removeAttribute('aria-invalid');
    end.removeAttribute('aria-invalid');
    error.hidden = true;
    error.textContent = '';

    const invalidRange = start.value && end.value && start.value > end.value;
    const invalidDate = !start.validity.valid ? start : !end.validity.valid ? end : null;
    if (invalidRange || invalidDate) {
      const field = invalidDate || end;
      error.textContent = invalidRange ? 'End Date must be on or after Start Date.' : 'Enter a valid date.';
      error.hidden = false;
      field.setAttribute('aria-invalid', 'true');
      field.focus({ preventScroll: true });
      return;
    }

    confirmationFilter = { startDate: start.value, endDate: end.value };
    closeConfirmationFilter();
    render();
    document.querySelector('main')?.scrollTo({ top: 0 });
  }

  function selectKind(nextKind) {
    if (!Object.hasOwn(labels, nextKind)) return;
    if (activeOverlay) closeConfirmationFilter({ restoreFocus: false });
    kind = nextKind;
    updateUrl();
    render();
    document.querySelector(`[data-team-history-kind="${kind}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  function init() {
    updateUrl();
    document.querySelector('.team-history-tabs')?.addEventListener('click', event => {
      const button = event.target.closest('[data-team-history-kind]');
      if (button) selectKind(button.dataset.teamHistoryKind);
    });
    $('teamConfirmationFilterTrigger')?.addEventListener('click', openConfirmationFilter);
    $('teamConfirmationCloseFilter')?.addEventListener('click', closeConfirmationFilter);
    $('teamConfirmationResetFilter')?.addEventListener('click', () => {
      fillConfirmationFilter(confirmationDefaults);
      applyConfirmationFilter();
    });
    $('teamConfirmationFilterForm')?.addEventListener('submit', event => {
      event.preventDefault();
      applyConfirmationFilter();
    });
    $('teamConfirmationFilterOverlay')?.addEventListener('click', event => {
      if (event.target === event.currentTarget) closeConfirmationFilter();
    });
    document.addEventListener('keydown', event => {
      if (!activeOverlay) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeConfirmationFilter();
        return;
      }
      if (event.key !== 'Tab') return;
      const controls = [...activeOverlay.querySelectorAll('button, input, select, textarea, a[href]')]
        .filter(node => !node.disabled && node.getClientRects().length);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    render();
    document.querySelector(`[data-team-history-kind="${kind}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
