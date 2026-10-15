(() => {
  const source = window.PERFORMANCE_SELF_EVALUATION || {};
  const $ = id => document.getElementById(id);
  const display = value => value === null || value === undefined || value === '' ? '—' : String(value);

  function syncBackLink() {
    const theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    $('selfEvaluationBack').href = `../index.html?scope=individual&theme=${theme}`;
  }

  function setPerson(nameId, employeeId, person = {}) {
    $(nameId).value = display(person.name);
    const id = String(person.empNo ?? '').replace(/^#+/, '');
    $(employeeId).textContent = id ? `#${id}` : '';
    $(employeeId).hidden = !id;
  }

  function field(id, labelText, value, multiline = false) {
    const wrapper = document.createElement('div');
    wrapper.className = 'goal-form-field';
    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = labelText;
    const control = document.createElement(multiline ? 'textarea' : 'input');
    control.id = id;
    control.readOnly = true;
    control.value = display(value);
    if (multiline) control.rows = 1;
    else control.type = 'text';
    wrapper.append(label, control);
    return wrapper;
  }

  function renderItems(containerId, records, prefix, emptyMessage) {
    const container = $(containerId);
    container.replaceChildren();
    if (!Array.isArray(records) || !records.length) {
      const empty = document.createElement('p');
      empty.className = 'self-evaluation-empty';
      empty.textContent = emptyMessage;
      container.append(empty);
      return;
    }
    records.forEach((record, index) => {
      const item = document.createElement('div');
      item.className = 'goal-form-body self-evaluation-item';
      const id = `${prefix}${index + 1}`;
      const metrics = document.createElement('div');
      metrics.className = 'goal-form-grid';
      metrics.append(
        field(`${id}Weightage`, 'Weightage', record.weightage == null ? null : `${record.weightage}%`),
        field(`${id}Rating`, 'Rating', record.rating == null ? null : `${record.rating} / 5`)
      );
      item.append(field(`${id}Title`, 'Title', record.title, true), metrics, field(`${id}Remark`, 'Remark', record.remark, true));
      container.append(item);
    });
  }

  function fitRemarks() {
    document.querySelectorAll('#selfEvaluationForm textarea').forEach(control => {
      control.style.height = 'auto';
      control.style.height = `${control.scrollHeight + control.offsetHeight - control.clientHeight}px`;
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const employee = source.employee || {};
    setPerson('selfEvaluationName', 'selfEvaluationEmployeeId', employee);
    setPerson('selfEvaluationSupervisor', 'selfEvaluationSupervisorId', employee.supervisor);
    setPerson('selfEvaluationReportTo', 'selfEvaluationReportToId', employee.reportingTo);
    for (const [id, value] of Object.entries({
      selfEvaluationPosition: employee.position,
      selfEvaluationDepartment: employee.department,
      selfEvaluationRef: source.evaluationRef,
      selfEvaluationPeriod: source.period,
      selfEvaluationType: source.type
    })) $(id).value = display(value);
    renderItems('selfEvaluationGoalItems', source.goals, 'selfEvaluationGoal', 'No goals available for this evaluation.');
    renderItems('selfEvaluationCompetencyItems', source.competencies, 'selfEvaluationCompetency', 'No competencies available for this evaluation.');
    $('selfEvaluationForm').addEventListener('submit', event => event.preventDefault());
    syncBackLink();
    fitRemarks();
    document.fonts.ready.then(fitRemarks);
    new ResizeObserver(fitRemarks).observe($('selfEvaluationForm'));
  });
  new MutationObserver(syncBackLink).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
