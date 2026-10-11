(() => {
  const $ = id => document.getElementById(id);
  const actions = [['approve', 'Approve', 'fa-check'], ['backup', 'Backup', 'fa-shield-halved'], ['resubmit', 'Resubmit', 'fa-rotate-left'], ['reject', 'Reject', 'fa-xmark']];
  const records = (window.EMPLOYEE_CAREER_PENDING_DATA || []).map(item => ({ ...item, status: item.status || 'pending' }));
  const approvers = window.EMPLOYEE_CAREER_BACKUP_APPROVERS || [];
  const selected = new Set();
  let category = '';
  let visible = [];
  let filter;
  let currentId;
  let sheet;
  let opener;
  let background = [];
  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = String(text);
    return element;
  };
  const icon = name => { const element = node('i', 'fa-solid ' + name); element.setAttribute('aria-hidden', 'true'); return element; };
  const date = value => { const iso = window.PendingApprovalFilter.toISO(value); return iso ? iso.split('-').reverse().join('/') : (value || '—'); };
  const current = () => records.find(item => item.id === currentId);
  function identity(name, empNo, position) {
    const element = node('div', 'payroll-employee-copy');
    element.append(node('strong', 'employee-name', name || 'Employee'));
    if (empNo) element.append(node('span', 'employee-id', '#' + String(empNo).replace(/^#+/, '')));
    if (position) element.append(node('div', 'career-pending-note', position));
    return element;
  }
  function field(label, value) {
    const element = node('div', 'payroll-approval-field');
    element.append(node('small', '', label), node('strong', '', value == null || value === '' ? '—' : value));
    return element;
  }
  function actionButtons() {
    const grid = node('div', 'pending-action-grid');
    actions.forEach(([action, label, symbol]) => {
      const button = node('button', 'action-btn-' + action);
      button.type = 'button';
      button.dataset.careerApprovalAction = action;
      button.append(icon(symbol), node('span', '', label));
      grid.append(button);
    });
    return grid;
  }
  function updateSelection() {
    $('careerPendingSelectAll').checked = visible.length > 0 && visible.every(item => selected.has(item.id));
    $('careerPendingSelectAll').indeterminate = selected.size > 0 && !$('careerPendingSelectAll').checked;
    $('careerPendingSelectAll').disabled = !visible.length;
    $('careerPendingSelectedCount').textContent = String(selected.size);
    $('careerPendingBulk').hidden = !selected.size;
    document.querySelector('.phone-container').classList.toggle('has-selection', selected.size > 0);
  }
  function renderCard(item) {
    const card = node('article', 'approval-request-card');
    card.dataset.careerRequestId = item.id;
    const header = node('header', 'payroll-approval-card-header');
    const checkbox = node('input', 'approval-card-checkbox');
    checkbox.type = 'checkbox';
    checkbox.checked = selected.has(item.id);
    checkbox.setAttribute('aria-label', `Select ${item.reference || item.id} for ${item.employeeName}`);
    checkbox.addEventListener('change', () => { if (checkbox.checked) selected.add(item.id); else selected.delete(item.id); updateSelection(); });
    const menu = node('button', 'three-dots-btn');
    menu.type = 'button';
    menu.setAttribute('aria-label', `Request options for ${item.employeeName}`);
    menu.setAttribute('aria-haspopup', 'dialog');
    menu.append(icon('fa-ellipsis-vertical'));
    menu.addEventListener('click', () => { currentId = item.id; openSheet('careerPendingMenu', menu); });
    header.append(checkbox, identity(item.employeeName, item.empNo, item.position), menu);
    const body = node('div', 'payroll-approval-card-body');
    const review = node('div', 'career-pending-review');
    review.tabIndex = 0;
    review.setAttribute('role', 'button');
    review.setAttribute('aria-label', `View ${item.type || 'request'} details for ${item.employeeName}`);
    const status = node('div', 'payroll-approval-status-row');
    const badge = node('span', 'payroll-approval-status');
    badge.append(icon('fa-hourglass-half'), node('span', '', 'Pending Approval'));
    status.append(badge, node('span', 'payroll-approval-date', date(item.submitDate)));
    const fields = node('div', 'payroll-approval-field-grid');
    [['Type', item.type], ['Reference', item.reference || item.id], ...(item.summary || [])].forEach(([label, value]) => fields.append(field(label, value)));
    review.append(status, fields);
    review.addEventListener('click', () => openDetails(item.id, review));
    review.addEventListener('keydown', event => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); openDetails(item.id, review); } });
    body.append(review);
    if (item.backupApprover) body.append(node('div', 'career-pending-backup-assignment', `Backup Approver: ${item.backupApprover.name}`));
    body.append(actionButtons());
    card.append(header, body);
    return card;
  }
  function render() {
    const focused = document.activeElement;
    const focusedCard = focused?.closest('[data-career-request-id]');
    visible = records.filter(item => item.status === 'pending' && (!category || item.type === category) && filter.matches({ keyword: `${item.employeeName} ${item.empNo} ${item.reference || item.id} ${item.type}`, startDate: item.startDate || item.submitDate, endDate: item.endDate || item.submitDate, submittedAt: item.submitDate }));
    const ids = new Set(visible.map(item => item.id));
    [...selected].forEach(id => { if (!ids.has(id)) selected.delete(id); });
    $('careerPendingQueue').replaceChildren(...visible.map(renderCard));
    $('careerPendingCount').textContent = String(visible.length);
    $('careerPendingEmpty').hidden = visible.length > 0;
    $('careerPendingEmptyText').textContent = records.some(item => item.status === 'pending') ? 'Try another request type or filter.' : 'Employee & Career requests awaiting review will appear here.';
    document.querySelectorAll('[data-career-pending-tab]').forEach(tab => {
      const active = tab.dataset.careerPendingTab === category;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active) $('careerPendingPanel').setAttribute('aria-labelledby', tab.id);
    });
    updateSelection();
    if (focusedCard && !focused.isConnected) {
      const replacement = [...$('careerPendingQueue').children].find(card => card.dataset.careerRequestId === focusedCard.dataset.careerRequestId);
      const selector = focused.dataset.careerApprovalAction ? `[data-career-approval-action="${focused.dataset.careerApprovalAction}"]` : focused.matches('.three-dots-btn') ? '.three-dots-btn' : focused.matches('.approval-card-checkbox') ? '.approval-card-checkbox' : '.career-pending-review';
      (replacement?.querySelector(selector) || $('careerPendingFilterTrigger')).focus({ preventScroll: true });
    }
  }
  function closeSheet(restore = true) {
    if (!sheet) return;
    sheet.hidden = true;
    sheet.classList.remove('active');
    background.forEach(element => { element.inert = false; });
    background = [];
    sheet = null;
    if (restore) (opener?.isConnected ? opener : $('careerPendingFilterTrigger')).focus({ preventScroll: true });
  }
  function openSheet(id, trigger) {
    const returnTarget = sheet ? opener : document.activeElement;
    closeSheet(false);
    opener = trigger || returnTarget;
    sheet = $(id);
    background = [...sheet.parentElement.children].filter(element => element !== sheet && !element.inert);
    background.forEach(element => { element.inert = true; });
    sheet.hidden = false;
    sheet.classList.add('active');
    sheet.querySelector('button').focus({ preventScroll: true });
  }
  function openDetails(id, trigger) {
    currentId = id;
    const item = current();
    if (!item) return;
    $('careerPendingDetailsTitle').textContent = item.approvalTitle || `${item.type || 'Request'} Approval`;
    const tbody = $('careerPendingDetailsTable').tBodies[0];
    tbody.replaceChildren();
    const comments = node('textarea', 'payroll-approval-comments');
    comments.id = 'careerPendingComments';
    comments.setAttribute('aria-label', 'Approver Comments');
    comments.value = item.approverComments || '';
    comments.addEventListener('input', () => { item.approverComments = comments.value; });
    const rows = [['Document Reference', item.reference || item.id], ['Document Status', 'Pending Approval'], ['Employee', identity(item.employeeName, item.empNo, item.position)], ['Type', item.type], ['Submit Date', date(item.submitDate)], ...(item.details || [])];
    if (item.backupApprover) rows.push(['Backup Approver', identity(item.backupApprover.name, item.backupApprover.empNo, item.backupApprover.role)]);
    if (item.attachments?.length) {
      const files = node('div', 'payroll-approval-files');
      item.attachments.forEach(file => {
        const entry = node('div', 'payroll-approval-file');
        entry.append(icon('fa-paperclip'));
        let label = node('span', '', file.name);
        if (file.url) { const url = new URL(file.url, location.href); if (['https:', 'http:', 'file:'].includes(url.protocol)) { label = node('a', '', file.name); label.href = url.href; label.target = '_blank'; label.rel = 'noopener'; } }
        entry.append(label);
        files.append(entry);
      });
      rows.push(['Attachments', files]);
    }
    rows.push(['Approver Comments', comments]);
    rows.forEach(([label, value]) => {
      const row = node('tr');
      const heading = node('th', '', label);
      heading.scope = 'row';
      const cell = node('td');
      cell.append(value instanceof HTMLElement ? value : document.createTextNode(value == null || value === '' ? '—' : String(value)));
      row.append(heading, cell);
      tbody.append(row);
    });
    $('careerPendingDetailsActions').replaceChildren(actionButtons());
    $('careerPendingDetails').querySelector('.payroll-approval-details-body').scrollTop = 0;
    openSheet('careerPendingDetails', trigger);
  }
  function openWorkflow() {
    const item = current();
    if (!item) return;
    $('careerPendingWorkflowRequest').replaceChildren(field('Document Reference', item.reference || item.id), identity(item.employeeName, item.empNo), field('Request Type', item.type));
    $('careerPendingWorkflowSteps').replaceChildren(...(item.workflow || []).map(step => {
      const entry = node('li', 'payroll-approval-workflow-step');
      entry.append(field(step.title || 'Approval Step', step.status || 'Pending'));
      if (step.name) entry.append(identity(step.name, step.empNo, step.role));
      if (step.date) entry.append(field('Date', date(step.date)));
      return entry;
    }));
    if (!item.workflow?.length) $('careerPendingWorkflowSteps').append(node('li', 'career-pending-note', 'No approval steps available.'));
    $('careerPendingWorkflowAudit').replaceChildren(...(item.audit || []).map(event => {
      const entry = node('li');
      entry.append(field(event.title || 'Activity', date(event.date)));
      if (event.description) entry.append(node('span', '', event.description));
      return entry;
    }));
    if (!item.audit?.length) $('careerPendingWorkflowAudit').append(node('li', 'career-pending-note', 'No audit history available.'));
    openSheet('careerPendingWorkflow');
  }
  function openBackup() {
    $('careerPendingBackupPeople').replaceChildren(...approvers.map((person, index) => {
      const button = node('button', 'career-pending-backup-person');
      button.type = 'button';
      button.dataset.careerBackupIndex = String(index);
      button.append(identity(person.name, person.empNo, person.role), icon('fa-chevron-right'));
      return button;
    }));
    $('careerPendingBackupEmpty').hidden = approvers.length > 0;
    openSheet('careerPendingBackup');
  }
  function decide(action, ids) {
    const items = records.filter(item => item.status === 'pending' && ids.includes(item.id));
    if (!items.length) { showToast('Please select at least one request.'); return; }
    const status = { approve: 'approved', resubmit: 'resubmit', reject: 'rejected' }[action];
    if (!status) return;
    items.forEach(item => { item.status = status; selected.delete(item.id); });
    closeSheet();
    render();
    showToast(`${items.length} ${items.length === 1 ? 'request' : 'requests'} ${action === 'resubmit' ? 'returned for resubmission' : status}.`);
    window.dispatchEvent(new CustomEvent('employee-career-approval-change', { detail: { action, records: items.map(item => ({ ...item })) } }));
  }
  function init() {
    const types = [...new Set([...(window.EMPLOYEE_CAREER_PENDING_CATEGORIES || []), ...records.map(item => item.type).filter(Boolean)])];
    ['', ...types].forEach((type, index) => {
      const tab = node('button', 'filter-pill', type || 'All Requests');
      tab.type = 'button'; tab.id = 'careerPendingTab-' + index; tab.dataset.careerPendingTab = type;
      tab.setAttribute('role', 'tab'); tab.setAttribute('aria-controls', 'careerPendingPanel');
      tab.addEventListener('click', () => { category = type; render(); });
      $('careerPendingTabs').append(tab);
    });
    $('careerPendingTabs').addEventListener('keydown', event => {
      const tabs = [...$('careerPendingTabs').children];
      const index = tabs.indexOf(document.activeElement);
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); tabs[next].click(); tabs[next].focus(); }
    });
    filter = window.PendingApprovalFilter.create('careerPendingFilter', { summaryId: 'careerPendingFilterSummary', onApply: render });
    $('careerPendingFilterTrigger').addEventListener('click', filter.open);
    $('careerPendingSelectAll').addEventListener('change', event => { visible.forEach(item => { if (event.target.checked) selected.add(item.id); else selected.delete(item.id); }); render(); });
    $('careerPendingViewDetails').addEventListener('click', () => openDetails(currentId));
    $('careerPendingViewWorkflow').addEventListener('click', openWorkflow);
    $('careerPendingBack').addEventListener('click', () => { const url = new URL($('careerPendingBack').href); url.searchParams.set('theme', document.documentElement.dataset.theme); $('careerPendingBack').href = url.href; });
    document.addEventListener('click', event => {
      if (event.target.closest('[data-close-career-sheet]') || event.target === sheet) { closeSheet(); return; }
      const backup = event.target.closest('[data-career-backup-index]');
      if (backup && current()) { const person = approvers[Number(backup.dataset.careerBackupIndex)]; current().backupApprover = { ...person }; closeSheet(); render(); showToast(`Backup Approver updated to ${person.name}.`); return; }
      const button = event.target.closest('[data-career-approval-action]');
      if (button) { currentId = button.closest('[data-career-request-id]')?.dataset.careerRequestId || currentId; if (button.dataset.careerApprovalAction === 'backup') openBackup(); else decide(button.dataset.careerApprovalAction, [currentId]); }
      const bulk = event.target.closest('[data-career-bulk-action]');
      if (bulk) decide(bulk.dataset.careerBulkAction, [...selected]);
    });
    document.addEventListener('keydown', event => {
      if (!sheet) return;
      if (event.key === 'Escape') { event.preventDefault(); closeSheet(); }
      if (event.key === 'Tab' && sheet) {
        const controls = [...sheet.querySelectorAll('button, input, textarea, a')].filter(element => !element.disabled && element.getClientRects().length);
        const first = controls[0], last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    render();
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
