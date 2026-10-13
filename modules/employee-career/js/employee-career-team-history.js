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
    draft: { tone: 'draft', icon: 'fa-file-pen' },
    rejected: { tone: 'rejected', icon: 'fa-xmark' }
  };
  const defaultKind = 'staff-confirmation';
  const requestedKind = new URLSearchParams(location.search).get('category');
  let kind = Object.hasOwn(labels, requestedKind) ? requestedKind : defaultKind;

  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);

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
      <span class="team-history-record-ref">Ref: ${escape(record.id || '\u2014')}</span>
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
    const records = Array.isArray(data[kind]) ? data[kind] : [];
    document.querySelectorAll('[data-team-history-kind]').forEach(button => {
      const active = button.dataset.teamHistoryKind === kind;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    const title = document.getElementById('teamHistoryCategoryTitle');
    const count = document.getElementById('teamHistoryRecordCount');
    const list = document.getElementById('teamHistoryList');
    const empty = document.getElementById('teamHistoryEmpty');
    if (title) title.textContent = `${labels[kind]} History`;
    if (count) count.textContent = String(records.length);
    if (list) list.innerHTML = records.map(cardMarkup).join('');
    if (empty) empty.hidden = records.length > 0;
  }

  function selectKind(nextKind) {
    if (!Object.hasOwn(labels, nextKind)) return;
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
    render();
    document.querySelector(`[data-team-history-kind="${kind}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
