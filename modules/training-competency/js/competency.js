(() => {
  const data = window.TRAINING_COMPETENCY_INDIVIDUAL || { employee: {}, competencies: [] };
  const $ = id => document.getElementById(id);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let activeOverlay = null;
  let returnFocus = null;
  let inertedElements = [];

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = String(text);
    return element;
  }

  function formatDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
    if (!match) return '—';
    return `${match[3]} ${monthNames[Number(match[2]) - 1]} ${match[1]}`;
  }

  function currentTheme() {
    return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
  }

  function syncBackLink() {
    $('competencyBack').href = `../index.html?scope=individual&theme=${currentTheme()}`;
  }

  function createCardDetail(label, value, field) {
    const detail = node('span', 'competency-card-detail');
    detail.dataset.field = field;
    detail.append(node('span', '', label), node('strong', '', value || '—'));
    return detail;
  }

  function renderSummary() {
    $('competencyEmployeeName').textContent = data.employee.name || '—';
    $('competencyEmployeePosition').textContent = data.employee.position || '—';
    $('competencyEmployeeDepartment').textContent = data.employee.department || '—';
    $('competencyTotalRecords').textContent = String(data.competencies.length);
  }

  function renderCards() {
    const cards = data.competencies.map(record => {
      const card = node('button', 'competency-card');
      card.type = 'button';
      card.dataset.competencyId = record.id;
      card.setAttribute('aria-haspopup', 'dialog');
      card.setAttribute('aria-controls', 'competencyDetailsOverlay');
      card.setAttribute('aria-label', `View competency details for ${record.skill}`);

      const header = node('span', 'competency-card-header');
      const title = node('strong', 'competency-card-title', record.skill);
      header.append(title);

      const details = node('span', 'competency-card-details');
      details.append(
        createCardDetail('Current Level', record.currentLevel, 'current-level'),
        createCardDetail('Need Level', record.needLevel, 'need-level'),
        createCardDetail('Gap', record.gap, 'gap'),
        createCardDetail('Last Assessment Date', formatDate(record.lastAssessmentDate), 'last-assessment-date'),
        createCardDetail('Skill Expiry Date', formatDate(record.skillExpiryDate), 'skill-expiry-date'),
        createCardDetail('Remarks', record.remarks, 'remarks')
      );

      card.append(header, details);
      card.addEventListener('click', () => openDetails(record, card));
      return card;
    });
    $('competencyList').replaceChildren(...cards);
  }

  function createDetailRow(label, value) {
    const row = node('tr');
    const heading = node('th', 'detail-popout-label', label);
    heading.scope = 'row';
    row.append(heading, node('td', 'detail-popout-value', value || '—'));
    return row;
  }

  function renderDetails(record) {
    $('competencyDetailsRows').replaceChildren(
      createDetailRow('Skill', record.skill),
      createDetailRow('Name', data.employee.name),
      createDetailRow('Position', data.employee.position),
      createDetailRow('Department', data.employee.department)
    );

    const assessmentTables = record.assessments.map(assessment => {
      const wrapper = node('div', 'competency-assessment-record');
      const table = node('table', 'detail-popout-table competency-assessment-table');
      table.setAttribute('aria-label', `${record.skill} assessment on ${formatDate(assessment.assessmentDate)}`);
      const body = node('tbody');
      body.append(
        createDetailRow('Assessment Date', formatDate(assessment.assessmentDate)),
        createDetailRow('Level', assessment.level),
        createDetailRow('Remark', assessment.remark),
        createDetailRow('Assessor', assessment.assessor)
      );
      table.append(body);
      wrapper.append(table);
      return wrapper;
    });
    $('competencyAssessmentList').replaceChildren(...assessmentTables);
  }

  function setPageInert(inert) {
    if (inert) {
      if (inertedElements.length) return;
      const previewBar = document.querySelector('preview-top-bar');
      const overlay = $('competencyDetailsOverlay');
      const targets = [
        ...(previewBar ? [previewBar] : []),
        ...[...overlay.parentElement.children].filter(element => element !== overlay)
      ];
      inertedElements = targets.map(element => ({ element, inert: element.inert }));
      targets.forEach(element => { element.inert = true; });
      return;
    }
    inertedElements.forEach(({ element, inert: previous }) => {
      if (element.isConnected) element.inert = previous;
    });
    inertedElements = [];
  }

  function openDetails(record, trigger) {
    renderDetails(record);
    returnFocus = trigger;
    activeOverlay = $('competencyDetailsOverlay');
    activeOverlay.hidden = false;
    activeOverlay.setAttribute('aria-hidden', 'false');
    activeOverlay.querySelector('.detail-popout-body').scrollTop = 0;
    setPageInert(true);
    $('competencyDetailsClose').focus({ preventScroll: true });
  }

  function closeDetails(restoreFocus = true) {
    if (!activeOverlay) return;
    activeOverlay.hidden = true;
    activeOverlay.setAttribute('aria-hidden', 'true');
    activeOverlay = null;
    setPageInert(false);
    if (restoreFocus && returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    returnFocus = null;
  }

  $('competencyDetailsClose').addEventListener('click', () => closeDetails());
  $('competencyDetailsOverlay').addEventListener('click', event => {
    if (event.target === $('competencyDetailsOverlay')) closeDetails();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && activeOverlay) closeDetails();
  });
  new MutationObserver(syncBackLink).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  document.addEventListener('DOMContentLoaded', () => {
    renderSummary();
    renderCards();
    syncBackLink();
  });
})();
