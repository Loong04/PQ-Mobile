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

  function attachmentUrl(value) {
    if (!value) return null;
    try {
      const url = new URL(value, location.href);
      if (url.protocol === 'https:' || url.protocol === 'http:') return url.href;
      const modulePath = new URL('../../', location.href).pathname;
      if (location.protocol === 'file:' && url.protocol === 'file:' && url.pathname.startsWith(modulePath)) return url.href;
    } catch { /* Unavailable attachments remain plain text. */ }
    return null;
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
    const isConfirmation = kind === 'staff-confirmation';
    const tag = isConfirmation ? 'button' : 'article';
    const fields = isConfirmation
      ? [['Recommendation', record.recommendation], ['Submitted', formatDate(record.submittedDate)], ['Adjustment', record.adjustment]]
      : record.fields;
    const triggerAttributes = isConfirmation
      ? `type="button" data-confirmation-id="${escape(record.id || '')}" aria-haspopup="dialog" aria-controls="teamConfirmationDetailsOverlay"`
      : '';
    return `<${tag} ${triggerAttributes} class="history-card-item team-history-card" data-status="${status.tone}" aria-label="${isConfirmation ? 'View details for ' : ''}${escape(name || labels[kind])}, ${escape(record.status || 'Pending')}">
      <span class="history-card-header">
        ${headingMarkup(record)}
        ${status.html}
      </span>
      <span class="history-card-details team-history-card-details">
        ${fieldMarkup(fields)}
      </span>
    </${tag}>`;
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

  function openOverlay(overlay, focusTarget, returnTarget = document.activeElement) {
    activeOverlay = overlay;
    returnFocus = returnTarget;
    overlay.hidden = false;
    overlay.classList.toggle('is-open', overlay.classList.contains('standard-filter-sheet'));
    overlay.setAttribute('aria-hidden', 'false');
    inerted = [...overlay.parentElement.children].filter(node => node !== overlay && !node.inert);
    inerted.forEach(node => { node.inert = true; });
    focusTarget.focus({ preventScroll: true });
  }

  function closeOverlay({ restoreFocus = true } = {}) {
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

  function openConfirmationDetails(record, trigger) {
    const overlay = $('teamConfirmationDetailsOverlay');
    const display = value => value === '' || value == null ? '—' : String(value);
    const fields = [
      ['Reference #', record.reference || record.id],
      ['Emp #', `#${String(record.empNo || '').replace(/^#+/, '')}`],
      ['Name', record.employeeName],
      ['Position', record.position],
      ['Hire Date', formatDate(record.hireDate)],
      ['Employment Type', record.employmentType],
      ['Confirm Due', formatDate(record.confirmDue)],
      ['Recommendation', record.recommendation],
      ['Effective Date', formatDate(record.effectiveDate)],
      ['Extension Months', record.extensionMonths],
      ['Adjustment', record.adjustment],
      ['Score', record.score == null ? null : `${record.score} / 100`],
      ['Remark', record.remark]
    ];
    const rows = fields.map(([label, value]) => {
      const row = document.createElement('tr');
      const labelCell = document.createElement('th');
      const valueCell = document.createElement('td');
      labelCell.scope = 'row';
      labelCell.className = 'detail-popout-label';
      labelCell.textContent = label;
      valueCell.className = 'detail-popout-value';
      valueCell.textContent = display(value);
      row.append(labelCell, valueCell);
      return row;
    });
    const attachmentRow = document.createElement('tr');
    const attachmentLabel = document.createElement('th');
    const attachmentValue = document.createElement('td');
    attachmentLabel.scope = 'row';
    attachmentLabel.className = 'detail-popout-label';
    attachmentLabel.textContent = 'Attachment';
    attachmentValue.className = 'detail-popout-value';
    if (!record.attachments?.length) attachmentValue.textContent = 'No attachments';
    else {
      const attachmentList = document.createElement('span');
      attachmentList.className = 'team-history-detail-attachments';
      record.attachments.forEach(attachment => {
        const url = attachmentUrl(attachment.url);
        const item = document.createElement(url ? 'a' : 'span');
        const icon = document.createElement('i');
        const name = document.createElement('span');
        item.className = 'team-history-detail-attachment';
        if (url) {
          item.href = url;
          item.target = '_blank';
          item.rel = 'noopener noreferrer';
          item.download = attachment.name || 'attachment';
          item.setAttribute('aria-label', `Download attachment ${attachment.name || 'Attachment'}`);
        }
        icon.className = 'fa-solid fa-paperclip';
        icon.setAttribute('aria-hidden', 'true');
        name.textContent = attachment.name || 'Attachment';
        item.append(icon, name);
        attachmentList.append(item);
      });
      attachmentValue.append(attachmentList);
    }
    attachmentRow.append(attachmentLabel, attachmentValue);
    rows.push(attachmentRow);
    $('teamConfirmationDetailsRows').replaceChildren(...rows);
    $('teamConfirmationDetailsSubtitle').textContent = `#${String(record.empNo || '').replace(/^#+/, '')} · ${record.employeeName || '—'}`;
    overlay.querySelector('.detail-popout-body').scrollTop = 0;
    openOverlay(overlay, $('teamConfirmationCloseDetails'), trigger);
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
    openOverlay(overlay, $('teamConfirmationStartDate'), $('teamConfirmationFilterTrigger'));
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
    closeOverlay();
    render();
    document.querySelector('main')?.scrollTo({ top: 0 });
  }

  function selectKind(nextKind) {
    if (!Object.hasOwn(labels, nextKind)) return;
    if (activeOverlay) closeOverlay({ restoreFocus: false });
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
    $('teamHistoryList')?.addEventListener('click', event => {
      const trigger = event.target.closest('[data-confirmation-id]');
      if (!trigger) return;
      const record = (data['staff-confirmation'] || []).find(item => String(item.id) === trigger.dataset.confirmationId);
      if (record) openConfirmationDetails(record, trigger);
    });
    $('teamConfirmationFilterTrigger')?.addEventListener('click', openConfirmationFilter);
    $('teamConfirmationCloseFilter')?.addEventListener('click', closeOverlay);
    $('teamConfirmationCloseDetails')?.addEventListener('click', closeOverlay);
    $('teamConfirmationResetFilter')?.addEventListener('click', () => {
      fillConfirmationFilter(confirmationDefaults);
      applyConfirmationFilter();
    });
    $('teamConfirmationFilterForm')?.addEventListener('submit', event => {
      event.preventDefault();
      applyConfirmationFilter();
    });
    $('teamConfirmationFilterOverlay')?.addEventListener('click', event => {
      if (event.target === event.currentTarget) closeOverlay();
    });
    $('teamConfirmationDetailsOverlay')?.addEventListener('click', event => {
      if (event.target === event.currentTarget) closeOverlay();
    });
    document.addEventListener('keydown', event => {
      if (!activeOverlay) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeOverlay();
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
