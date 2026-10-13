(() => {
  const source = window.PERFORMANCE_GOAL_PROGRESS;
  const $ = id => document.getElementById(id);
  const state = {
    goals: source.goals.map(goal => ({ ...goal, records: [] })),
    selectedId: null
  };

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function icon(name) {
    const element = node('i', `fa-solid ${name}`);
    element.setAttribute('aria-hidden', 'true');
    return element;
  }

  function formatNumber(value) {
    return new Intl.NumberFormat('en-MY', { maximumFractionDigits: 2 }).format(Number(value));
  }

  function formatDate(value) {
    if (!value) return 'No updates yet';
    const [year, month, day] = value.split('-').map(Number);
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(year, month - 1, day));
  }

  function latestRecord(goal) {
    return goal.records.at(-1) || null;
  }

  function detail(label, value) {
    const item = node('div', 'goal-progress-detail');
    item.append(node('dt', '', label), node('dd', '', value));
    return item;
  }

  function achievedText(goal) {
    const latest = latestRecord(goal);
    return latest ? `${formatNumber(latest.achievedValue)} ${goal.unit} · ${formatNumber(latest.achievedPercent)}%` : `0 ${goal.unit} · 0%`;
  }

  function renderCard(goal) {
    const card = node('article', 'goal-progress-card');
    const header = node('header', 'goal-progress-card-header');
    const headerCopy = node('div');
    headerCopy.append(
      node('small', 'goal-progress-card-category', goal.category),
      node('h3', 'goal-progress-card-title', goal.title),
      node('span', 'goal-progress-card-context', `${goal.kra} · Unit: ${goal.unit}`)
    );
    header.append(headerCopy, icon('fa-bullseye'));

    const body = node('dl', 'goal-progress-card-body');
    const latest = latestRecord(goal);
    body.append(
      detail('Description', goal.description),
      detail('Target', goal.target),
      detail('Weightage', `${formatNumber(goal.weightage)}%`),
      detail('Deadline', formatDate(goal.deadline)),
      detail('Last Update', formatDate(latest?.date)),
      detail('Achieved', achievedText(goal))
    );

    const footer = node('footer', 'goal-progress-card-footer');
    const update = node('button', 'goal-progress-update');
    update.type = 'button';
    update.append(icon('fa-pen'), node('span', '', 'Update'));
    update.addEventListener('click', () => showUpdate(goal.id));
    footer.append(update);
    card.append(header, body, footer);
    return card;
  }

  function filteredGoals() {
    const period = $('goalProgressPeriodFilter').value;
    const type = $('goalProgressEvaluationFilter').value;
    return state.goals.filter(goal => (!period || goal.period === period) && (!type || goal.evaluationType === type));
  }

  function renderCards() {
    const goals = filteredGoals();
    $('goalProgressCards').replaceChildren(...goals.map(renderCard));
    $('goalProgressTotal').textContent = String(goals.length);
    $('goalProgressEmpty').hidden = goals.length > 0;
  }

  function selectedGoal() {
    return state.goals.find(goal => goal.id === state.selectedId) || null;
  }

  function clearError() {
    $('goalProgressFormError').hidden = true;
    $('goalProgressForm').querySelectorAll('[aria-invalid="true"]').forEach(field => field.removeAttribute('aria-invalid'));
  }

  function clearForm() {
    $('goalProgressForm').reset();
    clearError();
  }

  function showError(message, field) {
    $('goalProgressFormError').textContent = message;
    $('goalProgressFormError').hidden = false;
    field.setAttribute('aria-invalid', 'true');
    field.focus({ preventScroll: true });
  }

  function formValues() {
    const numberValue = id => $(id).value === '' ? null : Number($(id).value);
    return {
      id: `PROGRESS-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: $('goalProgressDate').value,
      hours: numberValue('goalProgressHours'),
      achievedValue: numberValue('goalProgressAchievedValue'),
      achievedPercent: numberValue('goalProgressAchievedPercent'),
      remark: $('goalProgressRemark').value.trim()
    };
  }

  function validate(record) {
    if (!record.date) return ['Date is required.', $('goalProgressDate')];
    if (record.hours === null) return ['Hours Spent is required.', $('goalProgressHours')];
    if (!Number.isFinite(record.hours) || record.hours <= 0) return ['Hours Spent must be more than 0.', $('goalProgressHours')];
    if (record.achievedValue === null) return ['Achieved Value is required.', $('goalProgressAchievedValue')];
    if (!Number.isFinite(record.achievedValue) || record.achievedValue < 0) return ['Achieved Value cannot be negative.', $('goalProgressAchievedValue')];
    if (record.achievedPercent === null) return ['Achieved % is required.', $('goalProgressAchievedPercent')];
    if (!Number.isFinite(record.achievedPercent) || record.achievedPercent < 0 || record.achievedPercent > 100) return ['Achieved % must be between 0 and 100.', $('goalProgressAchievedPercent')];
    return null;
  }

  function renderHistory() {
    const goal = selectedGoal();
    const records = goal?.records || [];
    const rows = records.map(record => {
      const row = node('tr');
      row.append(node('td', '', formatDate(record.date)), node('td', 'goal-progress-achieved-cell', `${formatNumber(record.achievedValue)} ${goal.unit} · ${formatNumber(record.achievedPercent)}%`));
      const actionCell = node('td');
      const remove = node('button', 'goal-progress-delete');
      remove.type = 'button';
      remove.setAttribute('aria-label', `Delete progress from ${formatDate(record.date)}`);
      remove.append(icon('fa-trash'), node('span', '', 'Delete'));
      remove.addEventListener('click', () => {
        goal.records = goal.records.filter(item => item.id !== record.id);
        renderHistory();
      });
      actionCell.append(remove);
      row.append(actionCell);
      return row;
    });
    $('goalProgressTableBody').replaceChildren(...rows);
    $('goalProgressHistoryEmpty').hidden = records.length > 0;
    $('goalProgressTable').hidden = records.length === 0;
    $('goalProgressHistoryCount').textContent = `${records.length} ${records.length === 1 ? 'record' : 'records'}`;
  }

  function showUpdate(goalId) {
    const goal = state.goals.find(item => item.id === goalId);
    if (!goal) return;
    state.selectedId = goalId;
    $('goalProgressCategory').textContent = goal.category;
    $('goalProgressFormHeading').textContent = goal.kra;
    $('goalProgressUnit').textContent = `Unit: ${goal.unit}`;
    $('goalProgressValueUnit').textContent = goal.unit;
    $('goalProgressListView').hidden = true;
    $('goalProgressUpdateView').hidden = false;
    $('goalProgressTitle').textContent = 'Update Goal Progress';
    $('goalProgressBack').setAttribute('aria-label', 'Back to Goal Progress');
    clearForm();
    renderHistory();
    document.querySelector('.goal-progress-content').scrollTop = 0;
  }

  function showList() {
    $('goalProgressUpdateView').hidden = true;
    $('goalProgressListView').hidden = false;
    $('goalProgressTitle').textContent = 'Goal Progress';
    $('goalProgressBack').setAttribute('aria-label', 'Back to Performance');
    renderCards();
    document.querySelector('.goal-progress-update')?.focus({ preventScroll: true });
  }

  function syncBack() {
    const theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    $('goalProgressBack').href = `../index.html?scope=individual&theme=${theme}`;
  }

  function showToast(message) {
    const toast = $('goalProgressToast');
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => toast.classList.remove('show'), 2200);
  }

  document.addEventListener('DOMContentLoaded', () => {
    source.periods.forEach(period => $('goalProgressPeriodFilter').append(new Option(period, period)));
    source.evaluationTypes.forEach(type => $('goalProgressEvaluationFilter').append(new Option(type, type)));
    $('goalProgressPeriodFilter').addEventListener('change', renderCards);
    $('goalProgressEvaluationFilter').addEventListener('change', renderCards);
    $('goalProgressBack').addEventListener('click', event => {
      if ($('goalProgressUpdateView').hidden) return;
      event.preventDefault();
      showList();
    });
    $('goalProgressClear').addEventListener('click', clearForm);
    $('goalProgressForm').addEventListener('input', clearError);
    $('goalProgressForm').addEventListener('change', clearError);
    $('goalProgressForm').addEventListener('submit', event => {
      event.preventDefault();
      clearError();
      const record = formValues();
      const error = validate(record);
      if (error) {
        showError(...error);
        return;
      }
      selectedGoal().records.push(record);
      renderHistory();
      clearForm();
      showToast('Progress added.');
    });
    syncBack();
    renderCards();
  });

  new MutationObserver(syncBack).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
