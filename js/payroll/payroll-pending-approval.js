(function () {
  const byId = id => document.getElementById(id);
  const tabNames = { tax: 'Tax Relief', deduction: 'Deduction Request' };
  const actions = [['approve', 'Approve', 'fa-check'], ['resubmit', 'Resubmit', 'fa-rotate-left'], ['reject', 'Reject', 'fa-xmark']];
  let activeTab = new URLSearchParams(location.search).get('tab') === 'deduction' ? 'deduction' : 'tax';
  let filter;
  let visible = [];
  const selected = new Set();
  let currentItemId = null;
  let currentSheet = null;
  let opener = null;
  let background = [];

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function icon(name) {
    const element = node('i', 'fa-solid ' + name);
    element.setAttribute('aria-hidden', 'true');
    return element;
  }
  function date(value) {
    const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : '-';
  }
  function money(amount) {
    return 'RM ' + Number(amount).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function field(label, value) {
    const element = node('div', 'payroll-approval-field');
    element.append(node('small', '', label), node('strong', '', value ?? '-'));
    return element;
  }
  function fieldGrid(entries) {
    const grid = node('div', 'payroll-approval-field-grid');
    for (const [label, value] of entries) grid.append(field(label, value));
    return grid;
  }
  function syncNavigation() {
    const url = new URL(location.href);
    url.searchParams.set('theme', getCurrentTheme());
    url.searchParams.set('tab', activeTab);
    history.replaceState(null, '', url);
    const back = new URL(byId('payrollPendingBack').href);
    back.searchParams.set('theme', getCurrentTheme());
    byId('payrollPendingBack').href = back.href;
  }
  function filteredItems() {
    return window.PayrollPendingStore.getPending().filter(item => item.category === activeTab && filter.matches({
      keyword: [tabNames[item.category], ...Object.values(item), '#' + item.empNo].join(' '),
      startDate: item.transactionDate || item.dateFrom,
      endDate: item.transactionDate || item.dateTo,
      submittedAt: item.submitDate || item.requestDate
    }));
  }
  function updateSelection() {
    const selectAll = byId('payrollPendingSelectAll');
    selectAll.checked = visible.length > 0 && selected.size === visible.length;
    selectAll.indeterminate = selected.size > 0 && selected.size < visible.length;
    selectAll.disabled = visible.length === 0;
    byId('payrollPendingSelectedCount').textContent = selected.size;
    byId('payrollPendingBulk').hidden = selected.size === 0;
    document.querySelector('.phone-container').classList.toggle('has-selection', selected.size > 0);
  }
  function actionButtons() {
    const grid = node('div', 'pending-action-grid');
    for (const [action, label, symbol] of actions) {
      const button = node('button', 'action-btn-' + action);
      button.type = 'button';
      button.dataset.payrollAction = action;
      button.append(icon(symbol), node('span', '', label));
      grid.append(button);
    }
    return grid;
  }

  function renderCard(item) {
    const card = node('article', 'approval-request-card');
    card.dataset.itemId = item.id;
    const header = node('header', 'payroll-approval-card-header');
    const checkbox = node('input', 'approval-card-checkbox');
    checkbox.type = 'checkbox';
    checkbox.setAttribute('aria-label', `Select ${item.id} for ${item.employeeName}`);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) selected.add(item.id);
      else selected.delete(item.id);
      updateSelection();
    });
    const employee = node('div', 'payroll-employee-copy');
    employee.append(node('h3', 'employee-name', item.employeeName), node('div', 'employee-id', '#' + item.empNo));
    if (item.department) employee.append(node('div', 'payroll-employee-dept', item.department));
    const menu = node('button', 'three-dots-btn');
    menu.type = 'button';
    menu.title = 'Request Options';
    menu.setAttribute('aria-label', 'Options for ' + item.id);
    menu.setAttribute('aria-haspopup', 'dialog');
    menu.append(icon('fa-ellipsis-vertical'));
    menu.addEventListener('click', () => {
      currentItemId = item.id;
      openSheet('payrollPendingMenu', menu);
    });
    header.append(checkbox, employee, menu);
    header.addEventListener('click', event => { if (!event.target.closest('input, button')) openDetails(item.id, menu); });

    const body = node('div', 'payroll-approval-card-body');
    const statusRow = node('div', 'payroll-approval-status-row');
    const status = node('span', 'payroll-approval-status');
    status.append(icon('fa-hourglass-half'), node('span', '', item.status));
    const submitted = node('div', 'payroll-approval-date');
    const dateCopy = node('span');
    dateCopy.append(document.createTextNode(item.category === 'tax' ? 'Submit Date: ' : 'Request Date: '), node('strong', '', date(item.submitDate || item.requestDate)));
    submitted.append(icon('fa-calendar-check'), dateCopy);
    statusRow.append(status, submitted);
    const reference = node('div', 'payroll-approval-reference');
    reference.append(node('span', '', 'Reference #'), node('strong', '', item.id));
    body.append(statusRow, reference);
    const facts = node('div', 'payroll-approval-facts');
    if (item.category === 'tax') {
      body.append(fieldGrid([['Tax Relief Item', `${item.rebateCode} - ${item.rebateItem}`], ['Description', item.description || '-']]));
      facts.append(fieldGrid([['Txn. Date', date(item.transactionDate)], ['Process', item.process ? 'Yes' : 'No']]));
    } else {
      body.append(fieldGrid([['Deduction Type', item.deductionType], ['Request Type', item.requestType]]));
      facts.append(fieldGrid([['Date From', date(item.dateFrom)], ['Date To', date(item.dateTo)]]));
      const payroll = fieldGrid([['Days', item.days.toFixed(2)], ['Period', item.period], ['Cycle', item.cycle]]);
      payroll.classList.add('payroll-approval-triple');
      facts.append(payroll);
    }
    const amount = node('div', 'payroll-approval-amount');
    amount.append(node('span', '', 'Amount'), node('strong', '', money(item.amount)));
    body.append(facts, amount, actionButtons());
    body.addEventListener('click', event => { if (!event.target.closest('button')) openDetails(item.id, menu); });
    card.append(header, body);
    return card;
  }

  function renderQueue() {
    selected.clear();
    visible = filteredItems();
    byId('payrollPendingCount').textContent = visible.length;
    const queue = byId('payrollPendingQueue');
    if (visible.length) queue.replaceChildren(...visible.map(renderCard));
    else {
      const empty = node('div', 'payroll-pending-empty');
      empty.append(icon('fa-circle-check'), node('h3', '', 'No Pending Requests'), node('p', '', 'There are no requests matching this category and filter.'));
      queue.replaceChildren(empty);
    }
    updateSelection();
  }
  function switchTab(tab, focus = false) {
    activeTab = tab === 'deduction' ? 'deduction' : 'tax';
    for (const button of document.querySelectorAll('[data-payroll-tab]')) {
      const active = button.dataset.payrollTab === activeTab;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      if (active) {
        button.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        if (focus) button.focus({ preventScroll: true });
      }
    }
    byId('payrollPendingPanel').setAttribute('aria-labelledby', 'payrollPendingTab-' + activeTab);
    syncNavigation();
    renderQueue();
    document.querySelector('.payroll-pending-content').scrollTop = 0;
  }

  function toggleOverlay(overlay, open) {
    if (open) {
      overlay.hidden = false;
      void overlay.offsetHeight;
      overlay.classList.add('active');
    } else {
      overlay.classList.remove('active');
      overlay.hidden = true;
    }
  }
  function closeSheet(restoreFocus = true) {
    if (!currentSheet) return;
    toggleOverlay(currentSheet, false);
    background.forEach(({ element, inert }) => { element.inert = inert; });
    background = [];
    currentSheet = null;
    if (restoreFocus && opener?.isConnected) opener.focus({ preventScroll: true });
  }
  function openSheet(id, trigger) {
    closeSheet(false);
    currentSheet = byId(id);
    opener = trigger || document.activeElement;
    background = [...currentSheet.parentElement.children].filter(element => element !== currentSheet).map(element => ({ element, inert: element.inert }));
    background.forEach(({ element }) => { element.inert = true; });
    toggleOverlay(currentSheet, true);
    currentSheet.querySelector('button').focus({ preventScroll: true });
  }
  function openDetails(id, trigger) {
    const item = window.PayrollPendingStore.getPending().find(entry => entry.id === id);
    if (!item) return;
    currentItemId = id;
    byId('payrollPendingDetailsTitle').textContent = tabNames[item.category] + ' Approval';
    const employee = node('div');
    employee.append(node('div', 'employee-name', item.employeeName), node('span', 'employee-id', '#' + item.empNo));
    const rows = [['Document Reference', item.id], ['Status', item.status], ['Employee', employee]];
    if (item.category === 'tax') rows.push(
      ['Tax Relief Item', `${item.rebateCode} - ${item.rebateItem}`], ['Description', item.description || '-'],
      ['Txn. Date', date(item.transactionDate)], ['Amount', money(item.amount)], ['Submit Date', date(item.submitDate)],
      ['Process', item.process ? 'Yes' : 'No']
    );
    else rows.push(
      ['Department', item.department], ['Deduction Type', item.deductionType], ['Request Type', item.requestType],
      ['Date From', date(item.dateFrom)], ['Date To', date(item.dateTo)], ['Days', item.days.toFixed(2)], ['Amount', money(item.amount)],
      ['Period', item.period], ['Cycle', item.cycle], ['Request Date', date(item.requestDate)]
    );
    byId('payrollPendingDetailsTable').querySelector('tbody').replaceChildren(...rows.map(([label, value]) => {
      const row = node('tr');
      const key = node('th', '', label);
      key.scope = 'row';
      const content = node('td');
      if (value instanceof Node) content.append(value);
      else content.textContent = value;
      row.append(key, content);
      return row;
    }));
    document.querySelector('.payroll-approval-details-body').scrollTop = 0;
    openSheet('payrollPendingDetails', trigger);
  }
  function handleAction(button) {
    const action = button.dataset.payrollAction;
    const ids = button.closest('#payrollPendingBulk') ? [...selected] : [button.closest('.approval-request-card')?.dataset.itemId || currentItemId];
    try {
      const count = window.PayrollPendingStore.act(ids, action);
      closeSheet(false);
      renderQueue();
      const result = { approve: 'Approved', resubmit: 'Sent for resubmission:', reject: 'Rejected' }[action];
      showToast(`${result} ${count} request${count === 1 ? '' : 's'}.`);
    } catch { showToast('Unable to save the approval action. Please try again.'); }
  }

  document.addEventListener('DOMContentLoaded', () => {
    setTheme(getCurrentTheme());
    filter = window.PendingApprovalFilter.create('payrollPendingFilter', { summaryId: 'payrollPendingFilterSummary', onApply: renderQueue });
    byId('payrollPendingFilterTrigger').addEventListener('click', () => filter.open());
    for (const button of document.querySelectorAll('[data-payroll-tab]')) {
      button.addEventListener('click', () => switchTab(button.dataset.payrollTab));
      button.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        switchTab(event.key === 'Home' ? 'tax' : event.key === 'End' ? 'deduction' : activeTab === 'tax' ? 'deduction' : 'tax', true);
      });
    }
    byId('payrollPendingSelectAll').addEventListener('change', event => {
      selected.clear();
      if (event.target.checked) visible.forEach(item => selected.add(item.id));
      document.querySelectorAll('.approval-card-checkbox').forEach(checkbox => { checkbox.checked = event.target.checked; });
      updateSelection();
    });
    byId('payrollPendingViewDetails').addEventListener('click', () => openDetails(currentItemId, opener));
    document.addEventListener('click', event => {
      const button = event.target.closest('[data-payroll-action]');
      if (button) handleAction(button);
      if (event.target.closest('[data-close-payroll-sheet]')) closeSheet();
      if (event.target.closest('[data-set-theme]')) syncNavigation();
    });
    for (const overlay of document.querySelectorAll('.payroll-approval-overlay')) {
      overlay.addEventListener('click', event => { if (event.target === overlay) closeSheet(); });
      overlay.addEventListener('keydown', event => {
        if (event.key === 'Escape') { event.preventDefault(); closeSheet(); }
        if (event.key !== 'Tab') return;
        const controls = [...overlay.querySelectorAll('button')].filter(button => !button.disabled);
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      });
    }
    switchTab(activeTab);
  });
})();
