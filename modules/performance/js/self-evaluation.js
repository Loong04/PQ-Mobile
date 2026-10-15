(() => {
  const source = window.SelfEvaluationStore?.get() || window.PERFORMANCE_SELF_EVALUATION || {};
  const $ = id => document.getElementById(id);
  const display = value => value === null || value === undefined || value === '' ? '—' : String(value);

  function syncBackLink() {
    const theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    $('selfEvaluationBack').href = `../index.html?scope=individual&theme=${theme}`;
    document.querySelectorAll('[data-self-evaluation-link]').forEach(link => {
      const url = new URL(link.href);
      url.searchParams.set('theme', theme);
      link.href = url.href;
    });
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

  function renderItems(containerId, records, prefix, emptyMessage, kind) {
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
      const item = document.createElement('article');
      item.className = 'goal-form-body self-evaluation-item';
      item.dataset.itemId = record.id;
      item.setAttribute('aria-label', `${kind === 'goals' ? 'Goal' : 'Competency'} ${index + 1} of ${records.length}: ${record.title}`);
      const id = `${prefix}${index + 1}`;
      const number = document.createElement('span');
      number.className = 'self-evaluation-item-number';
      number.textContent = `${String(index + 1).padStart(2, '0')} / ${String(records.length).padStart(2, '0')}`;
      number.setAttribute('aria-hidden', 'true');
      const metrics = document.createElement('div');
      metrics.className = 'goal-form-grid';
      metrics.append(
        field(`${id}Weightage`, 'Weightage', record.weightage == null ? null : `${record.weightage}%`),
        field(`${id}Rating`, 'Rating', record.rating == null ? null : `${record.rating} / 5`)
      );
      const update = document.createElement('a');
      update.className = 'self-evaluation-update';
      update.href = `self-evaluation-item.html?kind=${encodeURIComponent(kind)}&item=${encodeURIComponent(record.id)}`;
      update.dataset.selfEvaluationLink = '';
      update.textContent = 'Update';
      update.setAttribute('aria-label', `Update ${kind === 'goals' ? 'goal' : 'competency'}: ${record.title}`);
      item.append(number, field(`${id}Title`, 'Title', record.title, true), metrics, field(`${id}Remark`, 'Remark', record.remark, true), update);
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
    $('selfEvaluationName').value = display(employee.name);
    $('selfEvaluationSupervisor').value = display(employee.supervisor?.name);
    $('selfEvaluationReportTo').value = display(employee.reportingTo?.name);
    for (const [id, value] of Object.entries({
      selfEvaluationPosition: employee.position,
      selfEvaluationDepartment: employee.department,
      selfEvaluationRef: source.evaluationRef,
      selfEvaluationPeriod: source.period,
      selfEvaluationType: source.type
    })) $(id).value = display(value);
    renderItems('selfEvaluationGoalItems', source.goals, 'selfEvaluationGoal', 'No goals available for this evaluation.', 'goals');
    renderItems('selfEvaluationCompetencyItems', source.competencies, 'selfEvaluationCompetency', 'No competencies available for this evaluation.', 'competencies');
    const params = new URLSearchParams(location.search);
    const selected = document.querySelector(`#selfEvaluation${params.get('kind') === 'competencies' ? 'Competency' : 'Goal'}Items [data-item-id="${CSS.escape(params.get('item') || '')}"]`);
    if (selected) {
      selected.scrollIntoView({ block: 'start', behavior: 'instant' });
      selected.querySelector('.self-evaluation-update')?.focus({ preventScroll: true });
    }
    $('selfEvaluationForm').addEventListener('submit', event => event.preventDefault());
    syncBackLink();
    fitRemarks();
    document.fonts.ready.then(fitRemarks);
    new ResizeObserver(fitRemarks).observe($('selfEvaluationForm'));
  });
  new MutationObserver(syncBackLink).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
