(() => {
  const $ = id => document.getElementById(id);
  const store = window.PerformanceEvaluationStore;
  const params = new URLSearchParams(location.search);
  const filterKeys = ['keyword', 'company', 'department', 'job', 'period', 'type'];
  const theme = () => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
  const display = value => value === '' || value == null ? '—' : String(value);
  const employeeId = value => value ? `#${String(value).replace(/^#+/, '')}` : '';
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
  };

  function route(file, values = {}, remove = []) {
    const url = new URL(file, location.href);
    url.search = location.search;
    remove.forEach(key => url.searchParams.delete(key));
    Object.entries(values).forEach(([key, value]) => url.searchParams.set(key, value));
    url.searchParams.set('theme', theme());
    return url.href;
  }

  function link(href, label, className = '') {
    const node = element('a', className, label);
    node.href = href;
    node.dataset.evaluationLink = '';
    return node;
  }

  function syncLinks() {
    document.querySelectorAll('a[data-evaluation-link]').forEach(node => {
      const url = new URL(node.href);
      url.searchParams.set('theme', theme());
      node.href = url.href;
    });
  }

  function field(id, labelText, value, multiline = false, key = '') {
    const wrapper = element('div', 'goal-form-field');
    const label = element('label', '', labelText);
    label.htmlFor = id;
    const control = element(multiline ? 'textarea' : 'input');
    control.id = id;
    control.readOnly = true;
    control.value = display(value);
    if (multiline) control.rows = 1;
    else control.type = 'text';
    if (key) control.dataset.field = key;
    wrapper.append(label, control);
    return wrapper;
  }

  function personField(id, label, person = {}) {
    const wrapper = field(id, label, person?.name);
    const idText = employeeId(person?.empNo);
    if (idText) wrapper.append(element('span', 'self-evaluation-employee-id', idText));
    return wrapper;
  }

  function fitTextareas() {
    document.querySelectorAll('textarea[readonly]').forEach(control => {
      control.style.height = 'auto';
      control.style.height = `${control.scrollHeight + control.offsetHeight - control.clientHeight}px`;
    });
  }

  function observeForm() {
    fitTextareas();
    document.fonts.ready.then(fitTextareas);
    new ResizeObserver(fitTextareas).observe(document.querySelector('main'));
  }

  function notFound(formId, message) {
    $(formId).hidden = true;
    $('evaluationNotFound').hidden = false;
    $('evaluationNotFoundMessage').textContent = message;
  }

  function initList() {
    let filters = Object.fromEntries(filterKeys.map(key => [key, (params.get(key) || '').trim()]));
    $('evaluationBack').href = `../index.html?scope=team&theme=${theme()}`;
    const records = store.all();
    const metadata = { company: record => record.company, department: record => record.employee.department,
      job: record => record.employee.position, period: record => record.period, type: record => record.type };
    for (const [key, value] of Object.entries(metadata)) {
      [...new Set(records.map(value).filter(Boolean))].sort().forEach(text => {
        $('evaluationFilterForm').elements[key].append(new Option(text, text));
      });
    }

    function render() {
      const url = new URL(location.href);
      for (const key of filterKeys) {
        if (filters[key]) url.searchParams.set(key, filters[key]);
        else url.searchParams.delete(key);
      }
      url.searchParams.set('theme', theme());
      history.replaceState(null, '', url);
      const keyword = filters.keyword.toLowerCase();
      const visible = store.all().filter(record => (!keyword || [record.employee.name, employeeId(record.employee.empNo), record.evaluationRef,
        record.company, record.employee.department, record.employee.position, record.period, record.type].join(' ').toLowerCase().includes(keyword))
        && Object.entries(metadata).every(([key, value]) => !filters[key] || value(record) === filters[key]));
      $('evaluationCards').replaceChildren(...visible.map(record => {
        const card = element('article', 'evaluation-card');
        card.dataset.evaluationId = record.id;
        const header = element('header', 'evaluation-card-header');
        header.append(element('h2', 'evaluation-employee-name', display(record.employee.name)),
          element('span', 'evaluation-employee-id', employeeId(record.employee.empNo)),
          element('span', 'evaluation-reference', display(record.evaluationRef)));
        const details = element('dl', 'evaluation-card-details');
        for (const [label, value] of [['Period', record.period], ['Type', record.type]]) {
          const row = element('div');
          row.append(element('dt', '', label), element('dd', '', display(value)));
          details.append(row);
        }
        const footer = element('div', 'evaluation-card-footer');
        const update = link(route('performance-evaluation-form.html', { evaluation: record.id }, ['kind', 'item']), 'Update', 'evaluation-update');
        update.setAttribute('aria-label', `Update evaluation for ${record.employee.name}, ${record.evaluationRef}`);
        footer.append(update);
        card.append(header, details, footer);
        return card;
      }));
      $('evaluationTotalRecords').textContent = String(visible.length);
      $('evaluationEmpty').hidden = visible.length > 0;
      $('evaluationFilterSummary').textContent = filterKeys.map(key => filters[key]).filter(Boolean).join(' • ') || 'All Performance Evaluations';
    }

    let inerted = [];
    function closeFilter() {
      $('evaluationFilterOverlay').hidden = true;
      $('evaluationFilterOverlay').classList.remove('is-open');
      $('evaluationFilterTrigger').setAttribute('aria-expanded', 'false');
      inerted.forEach(node => { node.inert = false; });
      inerted = [];
      $('evaluationFilterTrigger').focus({ preventScroll: true });
    }
    $('evaluationFilterTrigger').addEventListener('click', () => {
      filterKeys.forEach(key => { $('evaluationFilterForm').elements[key].value = filters[key]; });
      $('evaluationFilterOverlay').hidden = false;
      $('evaluationFilterOverlay').classList.add('is-open');
      $('evaluationFilterTrigger').setAttribute('aria-expanded', 'true');
      inerted = [...document.querySelectorAll('.phone-container > header, .phone-container > main, .phone-container > phone-bottom-nav, body > preview-top-bar')].filter(node => !node.inert);
      inerted.forEach(node => { node.inert = true; });
      $('evaluationFilterKeyword').focus();
    });
    $('evaluationCloseFilter').addEventListener('click', closeFilter);
    $('evaluationResetFilter').addEventListener('click', () => $('evaluationFilterForm').reset());
    $('evaluationFilterOverlay').addEventListener('click', event => { if (event.target === $('evaluationFilterOverlay')) closeFilter(); });
    $('evaluationFilterForm').addEventListener('submit', event => {
      event.preventDefault();
      filters = Object.fromEntries(filterKeys.map(key => [key, $('evaluationFilterForm').elements[key].value.trim()]));
      render();
      closeFilter();
      document.querySelector('main').scrollTop = 0;
    });
    document.addEventListener('keydown', event => {
      if ($('evaluationFilterOverlay').hidden) return;
      if (event.key === 'Escape') { event.preventDefault(); closeFilter(); }
      if (event.key !== 'Tab') return;
      const controls = [...$('evaluationFilterForm').querySelectorAll('button, input, select')].filter(node => !node.disabled && node.getClientRects().length);
      if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); controls[0].focus(); }
    });
    window.addEventListener('popstate', () => {
      const query = new URLSearchParams(location.search);
      filters = Object.fromEntries(filterKeys.map(key => [key, query.get(key) || '']));
      render();
    });
    render();
  }

  function initDetails() {
    const record = store.all().find(record => record.id === params.get('evaluation'));
    $('evaluationBack').href = route('performance-evaluation.html', {}, ['evaluation', 'kind', 'item']);
    if (!record) { notFound('evaluationDetailsForm', 'This performance evaluation is unavailable. Return to the list to select a record.'); return; }
    const employee = record.employee;
    const general = $('evaluationGeneralFields');
    const period = element('div', 'goal-form-grid');
    period.append(field('evaluationPeriod', 'Period', record.period), field('evaluationType', 'Type', record.type));
    general.replaceChildren(personField('evaluationName', 'Name', employee), field('evaluationPosition', 'Position', employee.position),
      field('evaluationDepartment', 'Department', employee.department), personField('evaluationSupervisor', 'Supervisor', employee.supervisor),
      personField('evaluationReportTo', 'Report To', employee.reportingTo), field('evaluationRef', 'Evaluation Ref#', record.evaluationRef), period);
    for (const [kind, title] of [['goals', 'Goal'], ['competencies', 'Competency']]) {
      const container = $(`evaluation${title}Items`);
      const items = record[kind] || [];
      container.replaceChildren();
      if (!items.length) container.append(element('p', 'self-evaluation-empty', `No ${kind} available for this evaluation.`));
      items.forEach((item, index) => {
        const body = element('article', 'goal-form-body self-evaluation-item evaluation-item');
        body.dataset.itemId = item.id;
        body.setAttribute('aria-label', `${title} ${index + 1} of ${items.length}: ${item.title}`);
        const number = element('span', 'evaluation-item-number', `${String(index + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`);
        number.setAttribute('aria-hidden', 'true');
        const prefix = `evaluation${title}${index + 1}`;
        const metrics = element('div', 'goal-form-grid');
        metrics.append(field(`${prefix}Weightage`, 'Weightage', item.weightage == null ? null : `${item.weightage}%`, false, 'weightage'),
          field(`${prefix}Rating`, 'Rating', item.rating == null ? null : `${item.rating} / 5`, false, 'rating'));
        const update = link(route('performance-evaluation-item.html', { evaluation: record.id, kind, item: item.id }), 'Update', 'evaluation-update');
        update.setAttribute('aria-label', `Update ${title.toLowerCase()}: ${item.title}`);
        body.append(number, field(`${prefix}Title`, 'Title', item.title, true, 'title'), metrics,
          field(`${prefix}Remark`, 'Remark', item.remark, true, 'remark'), update);
        container.append(body);
      });
    }
    $('evaluationDetailsForm').addEventListener('submit', event => event.preventDefault());
    observeForm();
    const kind = params.get('kind');
    const selected = kind === 'goals' ? $('evaluationGoalItems') : kind === 'competencies' ? $('evaluationCompetencyItems') : null;
    if (selected) {
      const item = [...selected.children].find(node => node.dataset.itemId === params.get('item'));
      if (item) { item.scrollIntoView({ block: 'start', behavior: 'instant' }); item.querySelector('a')?.focus({ preventScroll: true }); }
    }
  }

  function initItem() {
    const record = store.all().find(record => record.id === params.get('evaluation'));
    const kind = params.get('kind');
    const title = kind === 'competencies' ? 'Competency' : 'Goal';
    const item = ['goals', 'competencies'].includes(kind) ? record?.[kind]?.find(item => item.id === params.get('item')) : null;
    const returnUrl = () => record ? route('performance-evaluation-form.html', { evaluation: record.id }) : route('performance-evaluation.html', {}, ['evaluation', 'kind', 'item']);
    $('evaluationBack').href = returnUrl();
    $('evaluationItemCancel').href = returnUrl();
    if (!item) { notFound('evaluationItemForm', 'This evaluation item is unavailable. Return to the evaluation to select an item.'); return; }
    $('evaluationPageTitle').textContent = `Update ${title}`;
    $('evaluationItemSectionTitle').textContent = title;
    $('evaluationItemContext').replaceChildren(element('strong', 'evaluation-context-name', record.employee.name),
      element('span', 'self-evaluation-employee-id', employeeId(record.employee.empNo)),
      element('span', 'evaluation-context-reference', record.evaluationRef));
    $('evaluationItemTitle').value = display(item.title);
    $('evaluationItemWeightage').value = item.weightage == null ? '—' : `${item.weightage}%`;
    $('evaluationItemRating').value = item.rating ?? '';
    $('evaluationItemRemark').value = item.remark || '';
    function clearError() {
      $('evaluationItemError').hidden = true;
      $('evaluationItemRating').removeAttribute('aria-invalid');
      $('evaluationItemRemark').removeAttribute('aria-invalid');
    }
    function error(message, control) {
      $('evaluationItemError').textContent = message;
      $('evaluationItemError').hidden = false;
      if (control) { control.setAttribute('aria-invalid', 'true'); control.focus(); }
    }
    $('evaluationItemForm').addEventListener('input', clearError);
    $('evaluationItemForm').addEventListener('submit', event => {
      event.preventDefault();
      clearError();
      const control = $('evaluationItemRating');
      const rating = Number(control.value);
      if (control.value.trim() === '' || !Number.isFinite(rating) || rating < 0 || rating > 5) {
        error('Enter a rating from 0 to 5.', control); return;
      }
      const remark = $('evaluationItemRemark').value.trim();
      if (remark.length > 2000) { error('Remark must be 2,000 characters or fewer.', $('evaluationItemRemark')); return; }
      try { store.update(record.id, kind, item.id, { rating, remark }); }
      catch { error('Unable to save this update. Please try again.'); return; }
      location.assign(returnUrl());
    });
    observeForm();
  }

  document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.evaluationPage;
    if (page === 'list') initList();
    else if (page === 'details') initDetails();
    else if (page === 'item') initItem();
    syncLinks();
  });
  new MutationObserver(syncLinks).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
})();
