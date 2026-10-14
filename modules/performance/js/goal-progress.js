(() => {
  const source = window.PERFORMANCE_GOAL_PROGRESS;
  const $ = id => document.getElementById(id);
  const state = {
    goals: source.goals.map(goal => ({ ...goal, records: [] })),
    selectedId: null,
    editingRecordId: null,
    filters: { period: '', evaluationType: '' }
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
    header.append(headerCopy);

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
    const period = state.filters.period;
    const type = state.filters.evaluationType;
    return state.goals.filter(goal => (!period || goal.period === period) && (!type || goal.evaluationType === type));
  }

  function renderCards() {
    const goals = filteredGoals();
    $('goalProgressCards').replaceChildren(...goals.map(renderCard));
    $('goalProgressTotal').textContent = String(goals.length);
    $('goalProgressEmpty').hidden = goals.length > 0;
    $('goalProgressFilterSummary').textContent = `${state.filters.period || 'All Periods'} • ${state.filters.evaluationType || 'All Evaluation Types'}`;
  }

  function setFilterBackgroundInert(value) {
    document.querySelectorAll('.phone-container > header, .phone-container > main, .phone-container > phone-bottom-nav, .phone-container > #goalProgressToast, body > preview-top-bar').forEach(element => { element.inert = value; });
  }
  function openFilter() {
    $('goalProgressPeriodFilter').value = state.filters.period;
    $('goalProgressEvaluationFilter').value = state.filters.evaluationType;
    $('goalProgressFilterModal').classList.add('active'); $('goalProgressFilterModal').setAttribute('aria-hidden', 'false');
    $('goalProgressFilterTrigger').setAttribute('aria-expanded', 'true'); setFilterBackgroundInert(true);
    $('goalProgressPeriodFilter').focus();
  }
  function closeFilter() {
    $('goalProgressFilterModal').classList.remove('active'); $('goalProgressFilterModal').setAttribute('aria-hidden', 'true');
    $('goalProgressFilterTrigger').setAttribute('aria-expanded', 'false'); setFilterBackgroundInert(false);
    $('goalProgressFilterTrigger').focus({ preventScroll: true });
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
    state.editingRecordId = null;
    $('goalProgressAdd').querySelector('span').textContent = 'Add';
    $('goalProgressAdd').querySelector('i').className = 'fa-solid fa-plus';
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
      id: state.editingRecordId || `PROGRESS-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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
      const actions = node('div', 'goal-progress-row-actions');
      const edit = node('button', 'goal-progress-row-action goal-progress-edit');
      edit.type = 'button';
      edit.setAttribute('aria-label', `Edit progress from ${formatDate(record.date)}`); edit.title = 'Edit';
      edit.append(icon('fa-pen-to-square'));
      edit.addEventListener('click', () => {
        clearError(); state.editingRecordId = record.id;
        $('goalProgressDate').value = record.date;
        $('goalProgressHours').value = record.hours;
        $('goalProgressAchievedValue').value = record.achievedValue;
        $('goalProgressAchievedPercent').value = record.achievedPercent;
        $('goalProgressRemark').value = record.remark;
        $('goalProgressAdd').querySelector('span').textContent = 'Update';
        $('goalProgressAdd').querySelector('i').className = 'fa-solid fa-pen-to-square';
        document.querySelector('.goal-progress-content').scrollTop = 0;
        $('goalProgressDate').focus({ preventScroll: true });
      });
      const remove = node('button', 'goal-progress-row-action goal-progress-delete');
      remove.type = 'button';
      remove.setAttribute('aria-label', `Delete progress from ${formatDate(record.date)}`);
      remove.title = 'Delete'; remove.append(icon('fa-trash'));
      remove.addEventListener('click', () => {
        if (state.editingRecordId === record.id) clearForm();
        goal.records = goal.records.filter(item => item.id !== record.id);
        renderHistory();
        ($('goalProgressTableBody').querySelector('.goal-progress-delete') || $('goalProgressDate')).focus({ preventScroll: true });
      });
      actions.append(edit, remove); actionCell.append(actions);
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
    $('goalProgressFilterTrigger').addEventListener('click', openFilter);
    $('goalProgressCloseFilter').addEventListener('click', closeFilter);
    $('goalProgressResetFilter').addEventListener('click', () => $('goalProgressFilterForm').reset());
    $('goalProgressFilterForm').addEventListener('submit', event => {
      event.preventDefault();
      state.filters = { period: $('goalProgressPeriodFilter').value, evaluationType: $('goalProgressEvaluationFilter').value };
      renderCards(); closeFilter();
    });
    $('goalProgressFilterModal').addEventListener('click', event => { if (event.target === event.currentTarget) closeFilter(); });
    document.addEventListener('keydown', event => {
      const modal = $('goalProgressFilterModal'); if (!modal.classList.contains('active')) return;
      if (event.key === 'Escape') { event.preventDefault(); closeFilter(); return; }
      if (event.key !== 'Tab') return;
      const focusable = [...modal.querySelectorAll('button,select')].filter(element => !element.disabled && element.getClientRects().length);
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
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
      const goal = selectedGoal(), isEditing = state.editingRecordId !== null;
      if (isEditing) {
        const index = goal.records.findIndex(item => item.id === state.editingRecordId);
        if (index < 0) { showError('Progress record not found. Clear the form and try again.', $('goalProgressDate')); return; }
        goal.records[index] = record;
      } else goal.records.push(record);
      renderHistory();
      clearForm();
      showToast(isEditing ? 'Progress updated.' : 'Progress added.');
    });
    syncBack();
    renderCards();
  });

  new MutationObserver(syncBack).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
