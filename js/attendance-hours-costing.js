(() => {
  const source = window.HOURS_COSTING_REPORT;
  if (!source) return;
  const defaults = { keyword: '', from: source.from, to: source.to, costingType: 'Total Work hours', costCenter: 'all' };
  const fields = { keyword: 'filterKeywordInput', from: 'filterStartDateInput', to: 'filterEndDateInput', costingType: 'filterCostingTypeSelect', costCenter: 'filterCostCenterSelect' };
  const modal = document.getElementById('highlightFilterModal');
  const form = document.getElementById('highlightFilterForm');
  const content = document.querySelector('.main-content');
  const dateText = value => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value + 'T00:00:00Z'));
  const moneyText = value => 'RM ' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  let applied = { ...defaults };
  let returnFocus = null;
  let previousOverflow = '';

  function renderReport() {
    const keyword = applied.keyword.toLowerCase();
    const records = source.records.filter(row => (!keyword || row.name.toLowerCase().includes(keyword) || ('#' + row.empNo).toLowerCase().includes(keyword))
      && row.dateISO >= applied.from && row.dateISO <= applied.to
      && row.costingType === applied.costingType
      && (applied.costCenter === 'all' || row.costCenter === applied.costCenter));
    const body = document.getElementById('employeeCostingList');
    body.replaceChildren();
    for (const record of records) {
      const row = body.insertRow();
      row.className = 'emp-card';
      row.insertCell().textContent = dateText(record.dateISO);
      const employee = row.insertCell();
      const name = document.createElement('div');
      name.className = 'emp-card-name';
      name.textContent = record.name;
      const id = document.createElement('div');
      id.className = 'emp-card-id';
      id.textContent = '#' + record.empNo;
      employee.append(name, id);
      const amount = row.insertCell();
      amount.className = 'hours-number';
      amount.textContent = moneyText(record.costVal);
    }
    if (!records.length) {
      const cell = body.insertRow().insertCell();
      cell.colSpan = 3;
      cell.className = 'attendance-report-empty';
      cell.textContent = 'No records match the current filter.';
    }
    document.getElementById('totalRecordsVal').textContent = records.length;
    document.getElementById('totalCostVal').textContent = moneyText(records.reduce((total, row) => total + Math.round(row.costVal * 100), 0) / 100);
    const summary = [dateText(applied.from) + ' – ' + dateText(applied.to), applied.costingType, applied.costCenter === 'all' ? 'All Cost Centers' : applied.costCenter];
    if (applied.keyword) summary.unshift('“' + applied.keyword + '”');
    document.getElementById('highlightFilterSummaryText').textContent = summary.join(' • ');
  }

  function showFilter(open) {
    if (open) {
      returnFocus = document.activeElement;
      previousOverflow = content.style.overflowY;
      content.style.overflowY = 'hidden';
      for (const [key, id] of Object.entries(fields)) {
        const field = document.getElementById(id);
        field.setCustomValidity('');
        field.value = applied[key];
      }
    } else {
      content.style.overflowY = previousOverflow;
    }
    modal.hidden = !open;
    for (const child of document.querySelector('.phone-container').children) {
      if (child !== modal) child.inert = open;
    }
    if (open) document.getElementById(fields.keyword).focus();
    else if (returnFocus?.isConnected) returnFocus.focus();
  }

  window.openHighlightFilterModal = () => showFilter(true);
  window.closeHighlightFilterModal = event => { if (!event || event.target === event.currentTarget) showFilter(false); };
  window.resetHighlightFilterModal = () => { applied = { ...defaults }; renderReport(); showFilter(false); };
  for (const value of [...new Set(source.records.map(row => row.costCenter))].sort()) {
    document.getElementById(fields.costCenter).add(new Option(value, value));
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const from = document.getElementById(fields.from), to = document.getElementById(fields.to);
    to.setCustomValidity(to.value < from.value ? 'End date must be on or after the start date.' : '');
    if (!form.reportValidity()) return;
    for (const [key, id] of Object.entries(fields)) applied[key] = document.getElementById(id).value.trim();
    renderReport();
    showFilter(false);
    content.scrollTop = 0;
  });
  form.addEventListener('input', () => document.getElementById(fields.to).setCustomValidity(''));
  document.addEventListener('keydown', event => {
    if (modal.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); showFilter(false); }
    if (event.key === 'Tab') {
      const controls = [...modal.querySelectorAll('button, input, select')];
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  renderReport();
})();
