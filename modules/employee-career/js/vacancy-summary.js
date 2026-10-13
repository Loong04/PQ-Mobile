(() => {
  const data = window.EMPLOYEE_CAREER_VACANCIES || [];
  const applicantPage = document.body.dataset.recruitmentView === 'applicants';
  const params = new URLSearchParams(location.search);
  const vacancy = data.find(row => row.id === params.get('vacancy'));
  const source = applicantPage ? (vacancy?.applicants || []) : data;
  const $ = id => document.getElementById(id);
  const level = { SPM: 1, Diploma: 2, Degree: 3, Master: 4 };
  const dateDefaults = { startDate: '1990-01-01', endDate: '2100-12-31' };
  const defaults = applicantPage
    ? { name: '', ...dateDefaults, applicantStatus: '', applicationStatus: '', qualification: '', major: '', industry: '', minExperience: '0', maxPay: '999999' }
    : { status: 'Open', ...dateDefaults, company: '', department: '', job: '', accessCode: '', location: '', qualification: '' };
  const prefix = applicantPage ? 'a_' : 'v_';
  const state = Object.fromEntries(Object.entries(defaults).map(([key, value]) => [key, params.get(prefix + key) ?? value]));
  const unique = key => [...new Set(source.map(row => row[key]))].filter(Boolean).sort();
  const select = (key, label, values, placeholder = `All ${label}`) => ({ key, label, type: 'select', values, placeholder });
  const qualifications = Object.keys(level);
  const fields = applicantPage ? [
    { key: 'name', label: 'Name', type: 'search', placeholder: 'Applicant Name' },
    { key: 'startDate', label: 'Start Date', type: 'date' },
    { key: 'endDate', label: 'End Date', type: 'date' },
    select('applicantStatus', 'Applicant Status', ['New', 'Shortlisted', 'Hired', 'Rejected'], 'All Statuses'),
    select('applicationStatus', 'Application Status', ['Applied', 'Interview', 'Offered', 'Accepted', 'Rejected', 'Withdrawn'], 'All Statuses'),
    select('qualification', 'Qualification Level', qualifications, 'None'),
    select('major', 'Qualification Major', unique('major'), 'All Majors'),
    select('industry', 'Industry', unique('industry'), 'All Industries'),
    { key: 'minExperience', label: 'Min Experience Years', type: 'number' },
    { key: 'maxPay', label: 'Max Expected Pay', type: 'number' }
  ] : [
    select('status', 'Status', ['Open', 'Closed'], 'All Statuses'),
    { key: 'startDate', label: 'Open Start Date', type: 'date' },
    { key: 'endDate', label: 'Open End Date', type: 'date' },
    select('company', 'Company', unique('company'), 'All Companies'),
    select('department', 'Department', unique('department'), 'All Departments'),
    select('job', 'Job', unique('job'), 'All Jobs'),
    select('accessCode', 'Access Code', unique('accessCode'), 'All Access Codes'),
    select('location', 'Location', unique('location'), 'All Locations'),
    select('qualification', 'Min Qualification', qualifications, 'None')
  ];

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function date(value) {
    return new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function field(label, value, wide = false, status = '') {
    const item = node('div', `recruitment-card-field${wide ? ' wide' : ''}`);
    item.append(node('dt', '', label), node('dd', status ? `status-${status.toLowerCase()}` : '', value));
    return item;
  }

  function buildFields() {
    for (const config of fields) {
      const wrapper = node('div');
      const label = node('label', '', config.label);
      label.htmlFor = `recruitment-${config.key}`;
      const input = node(config.type === 'select' ? 'select' : 'input');
      input.id = label.htmlFor;
      input.name = config.key;
      if (config.type === 'select') {
        input.add(new Option(config.placeholder, ''));
        config.values.forEach(value => input.add(new Option(value, value)));
      } else {
        input.type = config.type;
        if (config.placeholder) input.placeholder = config.placeholder;
        if (config.type === 'number') { input.min = '0'; input.step = '0.01'; }
        if (config.type === 'search') input.maxLength = 150;
        if (config.type === 'date') { input.min = '1900-01-01'; input.max = '2100-12-31'; }
      }
      wrapper.append(label, input);
      $('recruitmentFilterFields').append(wrapper);
    }
    // Ignore malformed or obsolete query parameters rather than displaying invalid controls.
    for (const config of fields) {
      const value = state[config.key];
      const input = $('recruitmentFilterForm').elements.namedItem(config.key);
      input.value = value;
      if (value && (!input.value || !input.validity.valid)) state[config.key] = defaults[config.key];
    }
    if (state.startDate && state.endDate && state.startDate > state.endDate) Object.assign(state, dateDefaults);
  }

  function matches(row) {
    const when = applicantPage ? row.appliedOn : row.openedOn;
    if ((state.startDate && when < state.startDate) || (state.endDate && when > state.endDate)) return false;
    if (applicantPage) {
      if (state.name && !row.name.toLowerCase().includes(state.name.trim().toLowerCase())) return false;
      if (row.experience < Number(state.minExperience || 0) || row.expectedPay > Number(state.maxPay || Infinity)) return false;
      return ['applicantStatus', 'applicationStatus', 'qualification', 'major', 'industry'].every(key => !state[key] || row[key] === state[key]);
    }
    if (state.qualification && level[row.qualification] < level[state.qualification]) return false;
    return ['status', 'company', 'department', 'job', 'accessCode', 'location'].every(key => !state[key] || row[key] === state[key]);
  }

  function syncUrl() {
    const url = new URL(location.href);
    Object.entries(state).forEach(([key, value]) => {
      if (value === defaults[key]) url.searchParams.delete(prefix + key);
      else url.searchParams.set(prefix + key, value);
    });
    history.replaceState({}, '', url);
  }

  function applicantUrl(id) {
    const url = new URL('applicant-listing.html', location.href);
    url.searchParams.set('vacancy', id);
    url.searchParams.set('theme', document.documentElement.dataset.theme);
    new URLSearchParams(location.search).forEach((value, key) => { if (key.startsWith('v_')) url.searchParams.set(key, value); });
    return url.href;
  }

  function card(row) {
    const item = node(applicantPage ? 'article' : 'a', `history-card-item recruitment-card ${applicantPage ? 'applicant-card' : 'vacancy-card'}`);
    if (applicantPage) {
      const status = row.applicantStatus.toLowerCase().replace(/\s+/g, '-');
      const statusIcons = { new: 'fa-user-plus', shortlisted: 'fa-list-check', hired: 'fa-check', rejected: 'fa-xmark' };
      const header = node('header', 'history-card-header applicant-card-header');
      const heading = node('div', 'history-card-heading');
      const titleRow = node('div', 'history-card-title-row');
      const badge = node('span', `status-pill applicant-status-badge ${status}`);
      const badgeIcon = node('i', `fa-solid ${statusIcons[status] || 'fa-circle'}`);
      const details = node('dl', 'history-card-details recruitment-card-details applicant-card-details');
      item.dataset.status = status;
      titleRow.append(node('h2', 'history-card-title', row.name));
      heading.append(titleRow);
      badgeIcon.setAttribute('aria-hidden', 'true');
      badge.append(badgeIcon, node('span', '', row.applicantStatus));
      header.append(heading, badge);
      const pay = row.expectedPay.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      details.append(field('Age', String(row.age)), field('Gender', row.gender), field('Years of Experience', row.experience.toFixed(2)), field('Expected Pay (RM)', pay));
      item.append(header, details);
    } else {
      const strip = node('div', 'recruitment-card-strip');
      const details = node('dl', 'recruitment-card-details');
      strip.append(node('h2', '', row.job));
      item.href = applicantUrl(row.id);
      item.dataset.vacancyId = row.id;
      item.setAttribute('aria-label', `View applicants for ${row.job}, ${row.department}, created ${date(row.createdOn)}`);
      const offered = row.applicants.filter(person => ['Offered', 'Accepted'].includes(person.applicationStatus)).length;
      const accepted = row.applicants.filter(person => person.applicationStatus === 'Accepted').length;
      details.append(field('Company', row.company, true), field('Department', row.department), field('Created On', date(row.createdOn)), field('Total Vacancies', String(row.vacancies)), field('Total Application', String(row.applicants.length)), field('Total Offered', String(offered)), field('Total Accepted', String(accepted)));
      item.append(strip, details);
    }
    return item;
  }

  function render() {
    const rows = source.filter(matches);
    $('recruitmentCards').replaceChildren(...rows.map(card));
    $('recruitmentTotal').textContent = String(rows.length);
    $('recruitmentEmpty').hidden = rows.length > 0;
    const summary = [];
    if (!applicantPage) summary.push(state.status ? `${state.status} Vacancies` : 'All Vacancies');
    for (const config of fields) {
      const value = state[config.key];
      if (['status', 'startDate', 'endDate'].includes(config.key) || !value || value === defaults[config.key]) continue;
      summary.push(`${config.label}: ${value}`);
    }
    if (state.startDate !== defaults.startDate || state.endDate !== defaults.endDate) summary.push(`${state.startDate ? date(state.startDate) : 'Any date'} – ${state.endDate ? date(state.endDate) : 'Any date'}`);
    $('recruitmentFilterSummary').textContent = summary.join(' · ') || 'All Applicants';
  }

  function fill(values) {
    fields.forEach(({ key }) => {
      const input = $('recruitmentFilterForm').elements.namedItem(key);
      input.value = values[key];
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    });
    $('recruitmentError').hidden = true;
  }

  function init() {
    buildFields();
    if (applicantPage) {
      const back = new URL('vacancy-summary.html', location.href);
      back.searchParams.set('theme', document.documentElement.dataset.theme);
      params.forEach((value, key) => { if (key.startsWith('v_')) back.searchParams.set(key, value); });
      $('recruitmentBack').href = back.href;
      if (!vacancy) $('recruitmentEmptyText').textContent = 'Select a vacancy from Vacancy Summary to view its applicants.';
    }
    const dialog = $('recruitmentFilter');
    $('recruitmentFilterTrigger').addEventListener('click', () => { fill(state); dialog.showModal(); });
    $('recruitmentClose').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => $('recruitmentFilterTrigger').focus({ preventScroll: true }));
    $('recruitmentReset').addEventListener('click', () => fill(defaults));
    $('recruitmentFilterForm').addEventListener('submit', event => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(event.currentTarget));
      $('recruitmentError').hidden = true;
      fields.forEach(({ key }) => {
        const input = event.currentTarget.elements.namedItem(key);
        input.removeAttribute('aria-invalid');
        input.removeAttribute('aria-describedby');
      });
      if (!event.currentTarget.reportValidity()) return;
      if (values.startDate && values.endDate && values.startDate > values.endDate) {
        const end = event.currentTarget.elements.namedItem('endDate');
        end.setAttribute('aria-invalid', 'true');
        end.setAttribute('aria-describedby', 'recruitmentError');
        $('recruitmentError').hidden = false;
        end.focus();
        return;
      }
      Object.assign(state, values);
      syncUrl();
      render();
      dialog.close();
    });
    render();
    const syncLinkThemes = () => {
      document.querySelectorAll('.vacancy-card, #recruitmentBack').forEach(link => {
        const url = new URL(link.href);
        url.searchParams.set('theme', document.documentElement.dataset.theme);
        link.href = url.href;
      });
    };
    new MutationObserver(syncLinkThemes).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    syncLinkThemes();
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
