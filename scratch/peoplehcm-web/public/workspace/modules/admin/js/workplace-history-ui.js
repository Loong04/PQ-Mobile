document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  const labels = { 'guest-visit': 'Guest Visit', 'letter-request': 'Letter Request', 'inventory-request': 'Inventory Request' };
  const statuses = {
    submitted: ['Submitted', 'fa-paper-plane'],
    resubmit: ['Resubmit', 'fa-rotate-right'],
    approved: ['Approved', 'fa-check'],
    rejected: ['Rejected', 'fa-xmark'],
    draft: ['Draft', 'fa-floppy-disk'],
    cancelled: ['Cancelled', 'fa-ban']
  };
  const referencePrefixes = { 'guest-visit': 'FGV', 'letter-request': 'DRQ', 'inventory-request': 'IRQ' };
  const currentEmployee = { empNo: '#EBB12', name: 'Farhan binti rahmat' };
  const requested = new URLSearchParams(location.search).get('category');
  let kind = labels[requested] ? requested : 'guest-visit';
  const emptyFilter = () => ({ from: '', to: '', status: '', type: '' });
  const filters = { 'guest-visit': emptyFilter(), 'letter-request': emptyFilter(), 'inventory-request': emptyFilter() };
  let records = [];
  let modal = null;
  let opener = null;
  let inerted = [];
  let samplesReady = false;
  const emptyValue = '\u2014';
  const date = value => {
    if (!value) return emptyValue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const parsed = new Date(value + 'T00:00:00');
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace(' Sept ', ' Sep ');
  };
  const fieldMap = row => Object.fromEntries(row.fields);
  const fieldValue = (fields, ...names) => names.map(name => fields[name]).find(value => String(value || '').trim()) || '';
  const employeeNumber = value => value ? (String(value).startsWith('#') ? String(value) : '#' + value) : emptyValue;

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function statusPill(status) {
    const [label, icon] = statuses[status] || [status || 'Unknown', 'fa-circle-info'];
    const pill = node('span', 'status-pill ' + (status || 'unknown'));
    const glyph = node('i', 'fa-solid ' + icon);
    glyph.setAttribute('aria-hidden', 'true');
    pill.append(glyph, document.createTextNode(label));
    return pill;
  }

  function referenceNumber(row, fields = fieldMap(row)) {
    const explicit = fieldValue(fields, 'Reference #', 'Reference No.', 'Reference');
    if (explicit) return explicit;
    if (row.id.startsWith('sample-')) return emptyValue;
    const seed = String(row.id || row.createdAt || row.date || row.title);
    let hash = 2166136261;
    for (let index = 0; index < seed.length; index++) {
      hash ^= seed.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    const timestamp = Number.isFinite(Date.parse(row.createdAt)) ? String(Date.parse(row.createdAt)) : '';
    const digits = (timestamp + String(hash >>> 0).padStart(10, '0')).slice(-13).padStart(13, '0');
    return (referencePrefixes[row.kind] || 'REQ') + digits;
  }

  function cardContent(row) {
    const fields = fieldMap(row);
    if (row.kind === 'guest-visit') {
      return {
        title: 'Guest Visit',
        rows: [
          ['Visit Date', date(fieldValue(fields, 'Visit Date') || row.date)],
          ['Visit Time', fieldValue(fields, 'Visit Time', 'Time') || emptyValue],
          ['Visitor', fieldValue(fields, 'Visitor', 'Total Guest') || emptyValue]
        ]
      };
    }
    if (row.kind === 'letter-request') {
      return {
        title: fieldValue(fields, 'Description') || row.title,
        rows: [
          ['Submitted Date', date(fieldValue(fields, 'Submitted Date', 'Submit Date') || row.date)],
          ['Type', fieldValue(fields, 'Type', 'Letter Type') || row.title],
          ['Acknowledged On', date(fieldValue(fields, 'Acknowledged On'))]
        ]
      };
    }
    return {
      title: fieldValue(fields, 'Inventory Item', 'Request Item', 'Inventory Type') || row.title,
      rows: [
        ['Request Date', date(fieldValue(fields, 'Request Date', 'Submit Date') || row.date)],
        ['Quantity', fieldValue(fields, 'Quantity') || emptyValue]
      ]
    };
  }

  function appendTable(parent, rows, className = '') {
    const table = node('table', ('history-detail-table ' + className).trim());
    const tbody = table.createTBody();
    for (const [label, value] of rows) {
      const tr = tbody.insertRow();
      const th = node('th', '', label);
      th.scope = 'row';
      tr.append(th);
      const cell = tr.insertCell();
      cell.dataset.detailField = label;
      if (value instanceof Node) cell.append(value);
      else cell.textContent = String(value || emptyValue);
    }
    parent.append(table);
    return table;
  }

  function appendSection(body, title) {
    const section = node('section', 'history-detail-section');
    section.append(node('h3', 'history-detail-section-title', title));
    body.append(section);
    return section;
  }

  function splitDescription(value) {
    return String(value || '').split(/\s*(?:\u2022|\u00e2\u20ac\u00a2)\s*/).map(part => part.trim());
  }

  function requestFlag(value, words) {
    const request = String(value || '').toLowerCase();
    if (!request || request === 'none') return 'No';
    return words.some(word => request.includes(word)) ? 'Yes' : 'No';
  }

  function guestDetail(row, body) {
    const fields = fieldMap(row);
    const otherRequest = fieldValue(fields, 'Other Request');
    appendTable(body, [
      ['Reference #', referenceNumber(row, fields)],
      ['Emp #', employeeNumber(fieldValue(fields, 'Emp #', 'Employee #') || currentEmployee.empNo)],
      ['Name', fieldValue(fields, 'Name', 'Employee Name') || currentEmployee.name],
      ['Visit Date', date(fieldValue(fields, 'Visit Date') || row.date)],
      ['Visit Time', fieldValue(fields, 'Visit Time', 'Time') || emptyValue],
      ['Visitor', fieldValue(fields, 'Visitor', 'Total Guest') || emptyValue],
      ['Submit Date', date(fieldValue(fields, 'Submit Date', 'Submitted Date') || row.date)],
      ['Location', fieldValue(fields, 'Location') || emptyValue],
      ['Request Meal?', fieldValue(fields, 'Request Meal?', 'Meal') || 'No'],
      ['Floor Visit?', fieldValue(fields, 'Floor Visit?') || requestFlag(otherRequest, ['floor visit'])],
      ['Sit Arrange?', fieldValue(fields, 'Sit Arrange?') || requestFlag(otherRequest, ['sit arrange', 'sitting arrangement', 'seating arrangement'])],
      ['Multi Room?', fieldValue(fields, 'Multi Room?') || requestFlag(otherRequest, ['multi room'])],
      ['Remarks', fieldValue(fields, 'Remarks', 'Remark') || emptyValue],
      ['Status', statusPill(row.status)]
    ], 'history-detail-main-table');

    const guestSection = appendSection(body, 'Guest Information');
    const guests = row.fields.filter(([label]) => /^Guest \d+$/i.test(label));
    for (const [label, value] of guests) {
      const [name, company, relation, position] = splitDescription(value);
      const subcard = node('div', 'history-detail-subcard');
      subcard.setAttribute('aria-label', label);
      appendTable(subcard, [
        ['Reference #', referenceNumber(row, fields)],
        ['Company', company || emptyValue],
        ['Relation', relation || emptyValue],
        ['Name', name || emptyValue],
        ['Position', position || emptyValue]
      ], 'history-detail-nested-table');
      guestSection.append(subcard);
    }

    const attendeeSection = appendSection(body, 'Internal Attendee');
    const attendees = row.fields.filter(([label]) => /^Attendee \d+$/i.test(label));
    for (const [label, value] of attendees) {
      const [name = '', empNo = '', description = ''] = String(value || '').split('\n');
      const [department, position] = splitDescription(description);
      const subcard = node('div', 'history-detail-subcard');
      subcard.setAttribute('aria-label', label);
      appendTable(subcard, [
        ['Reference #', referenceNumber(row, fields)],
        ['Emp #', employeeNumber(empNo)],
        ['Name', name || emptyValue],
        ['Department', department || emptyValue],
        ['Position', position || emptyValue]
      ], 'history-detail-nested-table');
      attendeeSection.append(subcard);
    }

    const attachmentSection = appendSection(body, 'Attachment');
    const attachments = fieldValue(fields, 'Attachments', 'Attachment', 'FileName').split(',').map(value => value.trim()).filter(value => value && value.toLowerCase() !== 'none');
    for (const attachment of attachments) {
      const item = node('div', 'history-detail-attachment');
      const icon = node('i', 'fa-solid fa-paperclip');
      icon.setAttribute('aria-hidden', 'true');
      item.append(icon, node('span', '', attachment));
      attachmentSection.append(item);
    }
  }

  function letterDetail(row, body) {
    const fields = fieldMap(row);
    appendTable(body, [
      ['Request Date', date(fieldValue(fields, 'Request Date') || row.date)],
      ['Reference #', referenceNumber(row, fields)],
      ['Type', fieldValue(fields, 'Type', 'Letter Type') || row.title],
      ['Status', statusPill(row.status)],
      ['Description', fieldValue(fields, 'Description') || row.title || emptyValue],
      ['1st Merge Text', fieldValue(fields, '1st Merge Text') || emptyValue],
      ['2nd Merge Text', fieldValue(fields, '2nd Merge Text') || emptyValue],
      ['3rd Merge Text', fieldValue(fields, '3rd Merge Text') || emptyValue],
      ['Reason', fieldValue(fields, 'Reason') || emptyValue],
      ['Remark', fieldValue(fields, 'Remark', 'Remarks') || emptyValue],
      ['FileName', fieldValue(fields, 'FileName', 'Attachment', 'Attachments') || emptyValue],
      ['Acknowledged On', date(fieldValue(fields, 'Acknowledged On'))]
    ], 'history-detail-main-table');
  }

  function inventoryDetail(row, body) {
    const fields = fieldMap(row);
    const detailRows = [
      ['Reference #', referenceNumber(row, fields)],
      ['Status', statusPill(row.status)],
      ['Submit Date', date(fieldValue(fields, 'Submit Date', 'Request Date') || row.date)],
      ['Required By', date(fieldValue(fields, 'Required By'))],
      ['Inventory Item', fieldValue(fields, 'Inventory Item', 'Request Item', 'Inventory Type') || row.title],
      ['Quantity', fieldValue(fields, 'Quantity') || emptyValue],
      ['UOM', fieldValue(fields, 'UOM', 'Unit') || emptyValue],
      ['Reason', fieldValue(fields, 'Reason') || emptyValue],
      ['Submitter', employeeNumber(fieldValue(fields, 'Submitter', 'Emp #') || currentEmployee.empNo)],
      ['Remark', fieldValue(fields, 'Remark', 'Remarks') || emptyValue],
      ['Approver Remark', fieldValue(fields, 'Approver Remark') || emptyValue],
      ['Is Assigned?', fieldValue(fields, 'Is Assigned?') || 'No']
    ];
    const attachment = fieldValue(fields, 'Attachment', 'Attachments', 'FileName');
    if (attachment && attachment.toLowerCase() !== 'none') detailRows.push(['Attachments', attachment]);
    appendTable(body, detailRows, 'history-detail-main-table');
  }

  function recordType(row) {
    const fields = fieldMap(row);
    return row.kind === 'letter-request' ? fieldValue(fields, 'Type', 'Letter Type') || row.title
      : fieldValue(fields, 'Inventory Item', 'Request Item', 'Inventory Type') || row.title;
  }

  function render() {
    try {
      if (!samplesReady) {
        window.WorkplaceHistoryStore.ensureSamples(window.WORKPLACE_HISTORY_DATA || []);
        window.WorkplaceHistoryStore.migrateCancelledToSubmitted();
        samplesReady = true;
      }
      records = window.WorkplaceHistoryStore.list();
      $('historyLoadError').hidden = true;
    } catch {
      records = [];
      $('historyLoadError').textContent = 'Unable to read saved History. Please try again.';
      $('historyLoadError').hidden = false;
    }
    document.querySelectorAll('[data-history-kind]').forEach(button => {
      const active = button.dataset.historyKind === kind;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const filter = filters[kind];
    const rows = records.filter(row => row.kind === kind
      && (!filter.from || row.date >= filter.from)
      && (!filter.to || row.date <= filter.to)
      && (!filter.status || row.status === filter.status)
      && (!filter.type || recordType(row) === filter.type));
    document.querySelector('.admin-heading h1').textContent = kind === 'inventory-request' ? 'Inventory History' : labels[kind] + ' History';
    $('historyCategoryTitle').textContent = labels[kind] + ' History';
    $('historyRecordHeading').hidden = kind !== 'inventory-request';
    $('historyRecordCount').textContent = 'Total Records: ' + rows.length;
    const summary = [
      filter.from ? 'From ' + date(filter.from) : '',
      filter.to ? 'To ' + date(filter.to) : '',
      filter.status ? (statuses[filter.status]?.[0] || filter.status) : '',
      filter.type
    ].filter(Boolean);
    $('historyFilterSummary').textContent = summary.join(' / ') || 'All ' + labels[kind];
    $('historyEmptyState').hidden = !!rows.length || !$('historyLoadError').hidden;
    $('historyEmptyDescription').textContent = summary.length ? 'Try another filter.' : 'Saved ' + labels[kind] + ' requests will appear here.';
    const list = $('workplaceHistoryList');
    list.replaceChildren();
    for (const row of rows) {
      const content = cardContent(row);
      const card = node('article', 'history-card-item');
      card.dataset.recordId = row.id;
      card.dataset.status = row.status;
      const main = node('button', 'history-card-main');
      main.type = 'button';
      main.setAttribute('aria-haspopup', 'dialog');
      main.setAttribute('aria-controls', 'historyDetailsModal');
      const reference = referenceNumber(row);
      const description = `${content.title}, ${date(row.date)}, ${statuses[row.status]?.[0] || row.status}${reference !== emptyValue ? ', ' + reference : ''}`;
      main.setAttribute('aria-label', `View ${labels[row.kind]} details: ${description}`);
      const header = node('span', 'history-card-header');
      const heading = node('span', 'history-card-heading');
      heading.append(node('span', 'history-card-title', content.title));
      if (reference !== emptyValue) heading.append(node('span', 'history-card-ref', 'Ref: ' + reference));
      header.append(heading, statusPill(row.status));
      const details = node('span', 'history-card-details');
      for (const [label, value] of content.rows) {
        const line = node('span', 'history-card-row');
        line.append(node('span', '', label), node('strong', '', value || emptyValue));
        details.append(line);
      }
      main.append(header, details);
      card.append(main);
      const actions = node('div', 'history-card-actions');
      for (const action of ['draft', 'resubmit'].includes(row.status) ? ['apply', 'cancel'] : ['submitted', 'approved'].includes(row.status) ? ['cancel'] : []) {
        const button = node('button', action === 'apply' ? 'history-submit-btn' : 'history-cancel-btn', action === 'apply' ? 'Apply' : 'Cancel');
        button.type = 'button';
        button.dataset.historyAction = action;
        button.setAttribute('aria-label', `${action === 'apply' ? 'Apply' : 'Cancel'} ${description}`);
        actions.append(button);
      }
      if (actions.childElementCount) card.append(actions);
      list.append(card);
    }
  }

  function openModal(id, focusId) {
    modal = $(id);
    opener = document.activeElement;
    inerted = [...document.querySelector('.phone-container').children].filter(child => child !== modal && !child.inert);
    inerted.forEach(child => { child.inert = true; });
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    $(focusId).focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    inerted.forEach(child => { child.inert = false; });
    inerted = [];
    modal = null;
    (opener?.isConnected ? opener : $('historyFilterTrigger')).focus();
  }

  function fillFilter() {
    const filter = filters[kind];
    $('historyFilterTitle').textContent = 'Filter ' + labels[kind] + ' History';
    $('historyDateFrom').value = filter.from;
    $('historyDateTo').value = filter.to;
    $('historyStatus').value = filter.status;
    $('historyStatusField').hidden = kind === 'guest-visit';
    $('historyStatusLabel').textContent = kind === 'letter-request' ? 'Letter Status' : 'Status';
    $('historyTypeField').hidden = kind === 'guest-visit';
    $('historyTypeLabel').textContent = kind === 'letter-request' ? 'Letter Type' : 'Request Item';
    $('historyType').replaceChildren(new Option(kind === 'inventory-request' ? 'All Items' : 'All Types', ''));
    [...new Set(records.filter(row => row.kind === kind).map(recordType))].sort().forEach(type => $('historyType').add(new Option(type, type)));
    $('historyType').value = filter.type;
    $('historyFilterError').hidden = true;
  }

  function showDetails(row) {
    $('historyDetailTitle').textContent = row.kind === 'inventory-request' ? 'Inventory Details' : labels[row.kind] + ' Details';
    const body = $('historyDetailBody');
    body.replaceChildren();
    if (row.kind === 'guest-visit') guestDetail(row, body);
    else if (row.kind === 'letter-request') letterDetail(row, body);
    else inventoryDetail(row, body);
    openModal('historyDetailsModal', 'closeHistoryDetails');
  }

  document.querySelectorAll('[data-history-kind]').forEach(button => button.addEventListener('click', () => {
    kind = button.dataset.historyKind;
    $('historyActionFeedback').hidden = true;
    const url = new URL(location.href);
    url.searchParams.set('category', kind);
    history.replaceState(null, '', url);
    render();
  }));
  $('workplaceHistoryList').addEventListener('click', event => {
    const card = event.target.closest('[data-record-id]');
    const record = card && records.find(row => row.id === card.dataset.recordId);
    if (!record) return;
    const action = event.target.closest('[data-history-action]');
    if (action) {
      try {
        window.WorkplaceHistoryStore.setStatus(record.id, action.dataset.historyAction === 'apply' ? 'submitted' : 'cancelled');
        render();
        $('historyActionFeedback').textContent = action.dataset.historyAction === 'apply' ? 'Request submitted.' : 'Request cancelled.';
        $('historyActionFeedback').hidden = false;
        const updated = [...document.querySelectorAll('[data-record-id]')].find(card => card.dataset.recordId === record.id);
        (updated?.querySelector('.history-card-main') || $('historyFilterTrigger')).focus({ preventScroll: true });
      } catch {
        $('historyActionFeedback').textContent = 'Unable to update this request. Please try again.';
        $('historyActionFeedback').hidden = false;
      }
    } else if (event.target.closest('.history-card-main')) showDetails(record);
  });
  $('historyFilterTrigger').addEventListener('click', () => {
    fillFilter();
    openModal('historyFilterModal', 'closeHistoryFilter');
  });
  $('resetHistoryFilter').addEventListener('click', () => {
    filters[kind] = emptyFilter();
    fillFilter();
    render();
  });
  $('historyFilterForm').addEventListener('submit', event => {
    event.preventDefault();
    const from = $('historyDateFrom').value;
    const to = $('historyDateTo').value;
    if (from && to && from > to) {
      $('historyFilterError').textContent = 'End Date must be on or after Start Date.';
      $('historyFilterError').hidden = false;
      $('historyDateTo').focus();
      return;
    }
    filters[kind] = { from, to, status: kind === 'guest-visit' ? '' : $('historyStatus').value, type: kind === 'guest-visit' ? '' : $('historyType').value };
    render();
    closeModal();
  });
  $('closeHistoryFilter').addEventListener('click', closeModal);
  $('closeHistoryDetails').addEventListener('click', closeModal);
  [$('historyFilterModal'), $('historyDetailsModal')].forEach(overlay => overlay.addEventListener('click', event => {
    if (event.target === overlay) closeModal();
  }));
  document.addEventListener('keydown', event => {
    if (!modal) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key !== 'Tab') return;
    const controls = [...modal.querySelectorAll('input,select,button,[tabindex="0"]')]
      .filter(control => !control.disabled && control.getClientRects().length);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  window.addEventListener('pageshow', render);
  window.addEventListener('storage', render);
  render();
});
