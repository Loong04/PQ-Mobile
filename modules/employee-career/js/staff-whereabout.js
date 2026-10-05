(() => {
  // Employees visible in the reference. Values outside the screenshot stay blank.
  const referenceRecords = [
    { empNo: '000030', name: 'Andrew', whereabout: 'Annual Leave' },
    { empNo: '000070', name: 'Yee seong liew', whereabout: 'Medical Leave' },
    { empNo: '82828', name: 'Ewi robert', whereabout: 'Medical Leave' },
    { empNo: 'A9999', name: 'Ali bin ahmad', whereabout: 'Medical Leave' },
    { empNo: 'EBB204', name: 'Juliana binti othman', whereabout: '' }
  ].map(row => ({ date: '2026-10-05', time: '-', project: '-', task: '-', branch: '', department: '', ...row }));
  const records = window.EMPLOYEE_CAREER_STAFF_WHEREABOUT_RECORDS || referenceRecords;
  const $ = id => document.getElementById(id);
  const defaults = { date: '2026-10-05', keyword: '', branch: '', department: '', whereabout: '' };
  const filterIds = { date: 'staffWhereaboutDate', keyword: 'staffWhereaboutKeyword', branch: 'staffWhereaboutBranch', department: 'staffWhereaboutDepartment', whereabout: 'staffWhereaboutType' };
  let applied = { ...defaults };
  let returnFocus = null;
  let inerted = [];
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  function render() {
    const keyword = applied.keyword.toLowerCase().replace(/^#/, '');
    const rows = records.filter(row => row.date === applied.date &&
      (!keyword || `${row.empNo} ${row.name}`.toLowerCase().includes(keyword)) &&
      (!applied.branch || row.branch === applied.branch) &&
      (!applied.department || row.department === applied.department) &&
      (!applied.whereabout || row.whereabout === applied.whereabout)
    );
    const container = $('staffWhereaboutRecords');
    container.replaceChildren();
    rows.forEach(row => {
      const card = element('article', 'staff-whereabout-card');
      const header = element('header', 'staff-whereabout-card-header');
      header.append(element('h3', 'staff-whereabout-name', row.name), element('span', 'staff-whereabout-emp-no', '#' + row.empNo));
      const body = element('dl', 'staff-whereabout-card-body');
      [['Whereabout', row.whereabout], ['Time', row.time], ['Project', row.project], ['Task', row.task]].forEach(([label, value]) => {
        const field = element('div', 'staff-whereabout-field');
        field.append(element('dt', '', label), element('dd', '', value || '-'));
        body.append(field);
      });
      card.append(header, body);
      container.append(card);
    });
    $('staffWhereaboutEmpty').hidden = rows.length > 0;
    $('staffWhereaboutTotal').textContent = `${rows.length} ${rows.length === 1 ? 'record' : 'records'}`;
    const summary = [];
    if (applied.keyword) summary.push(`Search: ${applied.keyword}`);
    if (applied.branch) summary.push(applied.branch);
    if (applied.department) summary.push(applied.department);
    if (applied.whereabout) summary.push(applied.whereabout);
    $('staffWhereaboutFilterSummary').textContent = summary.join(' · ') || 'All Employees';
  }

  function validateDate() {
    const valid = Boolean($('staffWhereaboutDate').value && $('staffWhereaboutDate').validity.valid);
    $('staffWhereaboutFilterError').hidden = valid;
    if (valid) $('staffWhereaboutDate').removeAttribute('aria-invalid');
    else $('staffWhereaboutDate').setAttribute('aria-invalid', 'true');
    return valid;
  }

  function fillFilter(values) {
    Object.entries(filterIds).forEach(([key, id]) => { $(id).value = values[key]; });
    validateDate();
  }

  function openFilter() {
    const overlay = $('staffWhereaboutFilterOverlay');
    returnFocus = document.activeElement;
    fillFilter(applied);
    overlay.hidden = false;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    inerted = [...overlay.parentElement.children].filter(node => node !== overlay && !node.inert);
    inerted.forEach(node => { node.inert = true; });
    $('staffWhereaboutDate').focus({ preventScroll: true });
  }

  function closeFilter() {
    const overlay = $('staffWhereaboutFilterOverlay');
    overlay.hidden = true;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    inerted.forEach(node => { node.inert = false; });
    inerted = [];
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  }

  function apply() {
    if (!validateDate()) { $('staffWhereaboutDate').focus(); return; }
    applied = Object.fromEntries(Object.entries(filterIds).map(([key, id]) => [key, $(id).value.trim()]));
    closeFilter();
    render();
    document.querySelector('main').scrollTop = 0;
  }

  function init() {
    ['branch', 'department', 'whereabout'].forEach(key => {
      [...new Set(records.map(row => row[key]).filter(Boolean))].sort().forEach(value => {
        const option = element('option', '', value);
        option.value = value;
        $(filterIds[key]).append(option);
      });
    });
    $('staffWhereaboutFilterTrigger').addEventListener('click', openFilter);
    $('staffWhereaboutCloseFilter').addEventListener('click', closeFilter);
    $('staffWhereaboutResetFilter').addEventListener('click', () => { fillFilter(defaults); apply(); });
    $('staffWhereaboutFilterForm').addEventListener('submit', event => { event.preventDefault(); apply(); });
    $('staffWhereaboutDate').addEventListener('input', validateDate);
    $('staffWhereaboutFilterOverlay').addEventListener('click', event => { if (event.target === event.currentTarget) closeFilter(); });
    document.addEventListener('keydown', event => {
      if ($('staffWhereaboutFilterOverlay').hidden) return;
      if (event.key === 'Escape') { event.preventDefault(); closeFilter(); }
      else if (event.key === 'Tab') {
        const controls = [...$('staffWhereaboutFilterForm').querySelectorAll('button, input, select')].filter(node => !node.disabled && node.getClientRects().length);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    render();
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
