(() => {
  const { defaults, records } = window.ADMIN_POLICY;
  const $ = id => document.getElementById(id);
  const form = $('policyFilterForm');
  const modal = $('policyFilterModal');
  const trigger = $('policyFilterTrigger');
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const date = value => value ? new Date(value + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '\u2014';
  const theme = () => document.documentElement.dataset.theme || 'dark';
  const readURL = () => {
    const params = new URLSearchParams(location.search);
    return Object.fromEntries(Object.entries(defaults).map(([key, value]) => [key, params.get(key) ?? value]));
  };
  let filters = readURL();
  let inerted = [];

  function saveURL() {
    const url = new URL(location.href);
    Object.keys(defaults).forEach(key => {
      if (filters[key] === defaults[key]) url.searchParams.delete(key);
      else url.searchParams.set(key, filters[key]);
    });
    url.searchParams.set('theme', theme());
    history.replaceState(null, '', url);
  }

  function matchesDates(record, kind) {
    const from = filters[kind + 'From'], to = filters[kind + 'To'];
    const value = record[kind + 'WEF'];
    // A missing optional document is allowed until its date range is filtered explicitly.
    if (!value) return from === defaults[kind + 'From'] && to === defaults[kind + 'To'];
    return (!from || value >= from) && (!to || value <= to);
  }

  function render() {
    const rows = records.filter(record =>
      record.reference.toLowerCase().includes(filters.reference.toLowerCase().trim()) &&
      record.title.toLowerCase().includes(filters.title.toLowerCase().trim()) &&
      (!filters.department || record.department === filters.department) &&
      ['policy', 'sop', 'guideline'].every(kind => matchesDates(record, kind))
    );
    const summary = [filters.department || 'All Departments', filters.title ? 'Title: ' + filters.title : '', filters.reference ? 'Ref: ' + filters.reference : ''];
    ['policy', 'sop', 'guideline'].forEach(kind => {
      if (filters[kind + 'From'] !== defaults[kind + 'From'] || filters[kind + 'To'] !== defaults[kind + 'To']) {
        summary.push((kind === 'sop' ? 'SOP' : kind[0].toUpperCase() + kind.slice(1)) + ' WEF: ' + (filters[kind + 'From'] ? date(filters[kind + 'From']) : 'Any') + ' – ' + (filters[kind + 'To'] ? date(filters[kind + 'To']) : 'Any'));
      }
    });
    if (summary.filter(Boolean).length === 1) summary.push('All Documents');
    $('policyFilterSummary').textContent = summary.filter(Boolean).join(' / ');
    $('policyRecordCount').textContent = rows.length + (rows.length === 1 ? ' Document' : ' Documents');
    $('policyEmptyState').hidden = rows.length > 0;
    $('policyList').innerHTML = rows.map(record => {
      const url = new URL('policy-document.html', location.href);
      url.search = location.search;
      url.searchParams.set('document', record.id);
      url.searchParams.set('theme', theme());
      return `<article class="history-card-item policy-card">
        <a class="policy-card-title-link" href="${escape(url.href)}" aria-label="View ${escape(record.title)} policy"><div><h3>${escape(record.title)}</h3><p>Ref: ${escape(record.reference)}</p></div><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></a>
        <div class="policy-card-body">
        <dl class="policy-card-details"><div><dt>Department</dt><dd>${escape(record.department)}</dd></div><div><dt>Policy WEF</dt><dd>${date(record.policyWEF)}</dd></div><div><dt>SOP WEF</dt><dd>${date(record.sopWEF)}</dd></div><div><dt>Guideline WEF</dt><dd>${date(record.guidelineWEF)}</dd></div></dl>
        <div class="policy-card-footer"><a class="policy-document-link" href="${escape(url.href)}" aria-label="View Policy for ${escape(record.title)}"><span>Policy</span><i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a></div>
        </div>
      </article>`;
    }).join('');
  }

  function fillForm(values) {
    Object.keys(defaults).forEach(key => { form.elements.namedItem(key).value = values[key]; });
    $('policyFilterError').hidden = true;
  }

  function closeFilter() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    inerted.forEach(node => { node.inert = false; });
    inerted = [];
    trigger.focus();
  }

  [...new Set(records.map(record => record.department))].sort().forEach(department => $('policyDepartment').add(new Option(department, department)));
  trigger.addEventListener('click', () => {
    fillForm(filters);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    inerted = [...document.querySelector('.phone-container').children].filter(node => node !== modal && !node.inert);
    inerted.forEach(node => { node.inert = true; });
    form.scrollTop = 0;
    form.querySelector('.claim-filter-fields').scrollTop = 0;
    $('closePolicyFilter').focus();
  });
  $('closePolicyFilter').addEventListener('click', closeFilter);
  modal.addEventListener('click', event => { if (event.target === modal) closeFilter(); });
  $('resetPolicyFilter').addEventListener('click', () => fillForm(defaults));
  $('clearPolicyFilters').addEventListener('click', () => { filters = { ...defaults }; saveURL(); render(); });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const next = Object.fromEntries(Object.keys(defaults).map(key => [key, form.elements.namedItem(key).value.trim()]));
    for (const kind of ['policy', 'sop', 'guideline']) {
      if (next[kind + 'From'] && next[kind + 'To'] && next[kind + 'From'] > next[kind + 'To']) {
        $('policyFilterError').textContent = 'The start date must be on or before the end date.';
        $('policyFilterError').hidden = false;
        form.elements.namedItem(kind + 'From').focus();
        return;
      }
    }
    filters = next;
    saveURL();
    render();
    closeFilter();
  });
  document.addEventListener('keydown', event => {
    if (!modal.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeFilter();
    if (event.key === 'Tab') {
      const controls = [...form.querySelectorAll('button, input, select')];
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.addEventListener('popstate', () => { filters = readURL(); render(); });
  render();
})();
