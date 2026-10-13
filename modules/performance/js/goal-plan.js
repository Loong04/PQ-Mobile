(() => {
  const source = window.PERFORMANCE_GOAL_PLAN;
  const $ = id => document.getElementById(id);
  const RETURN_TOKEN_PARAM = 'goalReturnToken';
  const SNAPSHOT_KEY_PREFIX = 'peoplehcm:performance:goal-plan:snapshot:';
  const RESULT_KEY_PREFIX = 'peoplehcm:performance:goal-plan:result:';
  const state = {
    status: source.status,
    goals: source.goals.map(goal => ({ ...goal })),
    selectedId: null,
    editingId: null
  };
  let activeOverlay = null;
  let returnFocus = null;
  let inerted = [];
  let toastTimer = null;

  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = String(text);
    return element;
  };
  const icon = name => {
    const element = node('i', `fa-solid ${name}`);
    element.setAttribute('aria-hidden', 'true');
    return element;
  };
  const formatNumber = value => Number(value).toFixed(2);
  const formatDate = value => {
    if (!value) return 'Not set';
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
  };
  const selectedGoal = () => state.goals.find(goal => goal.id === state.selectedId);
  const currentTheme = () => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
  const readSession = key => {
    try { return window.sessionStorage.getItem(key); } catch { return null; }
  };
  const writeSession = (key, value) => {
    try {
      window.sessionStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  };
  const removeSession = key => {
    try { window.sessionStorage.removeItem(key); } catch {}
  };
  const parseJson = value => {
    try { return value ? JSON.parse(value) : null; } catch { return null; }
  };

  function syncBack() {
    $('goalPlanBack').href = `../index.html?scope=individual&theme=${currentTheme()}`;
  }

  function beginAddGoal() {
    const token = `goal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    writeSession(`${SNAPSHOT_KEY_PREFIX}${token}`, JSON.stringify({
      token,
      status: state.status,
      goals: state.goals
    }));
    const params = new URLSearchParams({ theme: currentTheme(), [RETURN_TOKEN_PARAM]: token });
    window.location.assign(`performance-goal.html?${params.toString()}`);
  }

  function consumeGoalReturn() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get(RETURN_TOKEN_PARAM);
    if (!token) return false;
    const snapshotKey = `${SNAPSHOT_KEY_PREFIX}${token}`;
    const resultKey = `${RESULT_KEY_PREFIX}${token}`;
    const snapshot = parseJson(readSession(snapshotKey));
    const result = parseJson(readSession(resultKey));
    removeSession(snapshotKey);
    removeSession(resultKey);

    if (snapshot?.token === token && Array.isArray(snapshot.goals)) {
      state.goals = snapshot.goals.map(goal => ({ ...goal }));
      state.status = snapshot.status || 'Draft';
    }

    let returnedGoal = result?.token === token ? result.goal : null;
    if (!returnedGoal && params.has('goalPayload')) returnedGoal = parseJson(params.get('goalPayload'));
    if (returnedGoal && typeof returnedGoal === 'object' && returnedGoal.id && returnedGoal.title) {
      state.goals.push({ ...returnedGoal });
      state.status = 'Draft';
      return true;
    }
    return false;
  }

  function showToast(message) {
    const toast = $('goalPlanToast');
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function releaseOverlay(restoreFocus) {
    if (!activeOverlay) return;
    activeOverlay.hidden = true;
    activeOverlay = null;
    inerted.forEach(element => { element.inert = false; });
    inerted = [];
    if (restoreFocus && returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    if (restoreFocus) returnFocus = null;
  }

  function openOverlay(overlay, initialFocus) {
    const origin = returnFocus || document.activeElement;
    releaseOverlay(false);
    returnFocus = origin;
    activeOverlay = overlay;
    overlay.hidden = false;
    inerted = [...overlay.parentElement.children].filter(element => element !== overlay && !element.inert);
    inerted.forEach(element => { element.inert = true; });
    requestAnimationFrame(() => initialFocus?.focus({ preventScroll: true }));
  }

  function closeOverlay() {
    releaseOverlay(true);
  }

  function renderEmployee() {
    const employee = source.employee;
    $('goalPlanEmployeeName').textContent = employee.name;
    $('goalPlanEmployeeId').textContent = `#${String(employee.empNo).replace(/^#/, '')}`;
    $('goalPlanPosition').textContent = employee.position;
    $('goalPlanDepartment').textContent = employee.department;
    $('goalPlanSupervisorName').textContent = employee.supervisor.name;
    $('goalPlanSupervisorId').textContent = `#${String(employee.supervisor.empNo).replace(/^#/, '')}`;
    $('goalPlanReportingName').textContent = employee.reportingTo.name;
    $('goalPlanReportingId').textContent = `#${String(employee.reportingTo.empNo).replace(/^#/, '')}`;
    $('goalPlanPeriod').textContent = source.period;
    $('goalPlanAppraisalType').textContent = source.appraisalType;
  }

  function metric(label, value) {
    const item = node('span', 'goal-plan-metric');
    item.append(node('small', '', label), node('strong', '', value));
    return item;
  }

  function renderCard(goal) {
    const card = node('article', 'goal-plan-card');
    card.dataset.goalId = goal.id;
    const header = node('header', 'goal-plan-card-header');
    header.append(node('strong', 'goal-plan-card-title', goal.title));

    const body = node('button', 'goal-plan-card-body');
    body.type = 'button';
    body.setAttribute('aria-label', `View details for ${goal.title}`);
    body.setAttribute('aria-haspopup', 'dialog');
    const target = node('span', 'goal-plan-card-target');
    target.append(node('small', '', 'Target'), node('span', '', goal.targetDescription || 'No target provided'));
    const metrics = node('span', 'goal-plan-card-metrics');
    metrics.append(metric('Weightage', `${formatNumber(goal.weightage)}%`), metric('Deadline', formatDate(goal.deadline)));
    body.append(target, metrics);
    body.addEventListener('click', () => openDetails(goal));

    const actions = node('div', 'goal-plan-card-actions');
    const update = node('button', 'goal-plan-card-update');
    update.type = 'button';
    update.append(icon('fa-pen'), node('span', '', 'Update'));
    update.addEventListener('click', () => {
      state.selectedId = goal.id;
      openForm(goal);
    });
    const remove = node('button', 'goal-plan-card-delete');
    remove.type = 'button';
    remove.append(icon('fa-trash'), node('span', '', 'Delete'));
    remove.addEventListener('click', () => {
      state.selectedId = goal.id;
      openDelete();
    });
    actions.append(update, remove);
    card.append(header, body, actions);
    return card;
  }

  function totalWeightage() {
    return state.goals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0);
  }

  function render() {
    $('goalPlanCards').replaceChildren(...state.goals.map(renderCard));
    $('goalPlanTotalGoals').textContent = String(state.goals.length);
    $('goalPlanTotalWeightage').textContent = `${formatNumber(totalWeightage())}%`;
    $('goalPlanEmpty').hidden = state.goals.length > 0;
  }

  function detailRow(label, value) {
    const row = node('tr');
    const heading = node('th', 'detail-popout-label', label);
    heading.scope = 'row';
    row.append(heading, node('td', 'detail-popout-value', value || 'Not provided'));
    return row;
  }

  function openDetails(goal) {
    state.selectedId = goal.id;
    $('goalDetailsTitle').textContent = goal.title;
    $('goalDetailsRows').replaceChildren(
      detailRow('Goal Title', goal.title),
      detailRow('Goal Type', goal.type),
      detailRow('Goal Description', goal.description),
      detailRow('Target Description', goal.targetDescription),
      detailRow('Deadline', formatDate(goal.deadline)),
      detailRow('Weightage', `${formatNumber(goal.weightage)}%`),
      detailRow('Budget Hours', formatNumber(goal.budgetHours || 0)),
      detailRow('Remark', goal.remark)
    );
    openOverlay($('goalDetailsOverlay'), $('goalDetailsClose'));
    $('goalDetailsOverlay').querySelector('.detail-popout-body').scrollTop = 0;
  }

  function clearFormError() {
    $('goalFormError').hidden = true;
    $('goalForm').querySelectorAll('[aria-invalid="true"]').forEach(field => field.removeAttribute('aria-invalid'));
  }

  function formValues() {
    return {
      title: $('goalTitleInput').value.trim(),
      type: $('goalTypeInput').value,
      description: $('goalDescriptionInput').value.trim(),
      targetDescription: $('goalTargetInput').value.trim(),
      deadline: $('goalDeadlineInput').value,
      weightage: Number($('goalWeightageInput').value),
      budgetHours: Number($('goalBudgetHoursInput').value || 0),
      remark: $('goalRemarkInput').value.trim()
    };
  }

  function showFormError(message, field) {
    $('goalFormError').textContent = message;
    $('goalFormError').hidden = false;
    field.setAttribute('aria-invalid', 'true');
    field.focus({ preventScroll: true });
  }

  function validateGoal(goal) {
    if (!goal.title) return ['Goal Title is required.', $('goalTitleInput')];
    if (!goal.type) return ['Goal Type is required.', $('goalTypeInput')];
    if (!goal.targetDescription) return ['Target Description is required.', $('goalTargetInput')];
    if (!goal.deadline) return ['Deadline is required.', $('goalDeadlineInput')];
    if (!Number.isFinite(goal.weightage) || goal.weightage <= 0 || goal.weightage > 100) return ['Weightage must be more than 0 and not more than 100.', $('goalWeightageInput')];
    if (!Number.isFinite(goal.budgetHours) || goal.budgetHours < 0) return ['Budget Hours cannot be negative.', $('goalBudgetHoursInput')];
    return null;
  }

  function populateForm(goal) {
    $('goalForm').reset();
    $('goalTitleInput').value = goal?.title || '';
    $('goalTypeInput').value = goal?.type || '';
    $('goalDescriptionInput').value = goal?.description || '';
    $('goalTargetInput').value = goal?.targetDescription || '';
    $('goalDeadlineInput').value = goal?.deadline || '2026-12-31';
    $('goalWeightageInput').value = goal ? String(goal.weightage) : '';
    $('goalBudgetHoursInput').value = goal ? String(goal.budgetHours || 0) : '0';
    $('goalRemarkInput').value = goal?.remark || '';
  }

  function openForm(goal) {
    state.editingId = goal?.id || null;
    clearFormError();
    populateForm(goal);
    $('goalFormTitle').textContent = goal ? 'Update Performance Goal' : 'Add Performance Goal';
    $('goalFormSave').textContent = goal ? 'Update Goal' : 'Save Goal';
    openOverlay($('goalFormOverlay'), $('goalTitleInput'));
  }

  function openDelete() {
    const goal = selectedGoal();
    if (!goal) return;
    $('goalDeleteMessage').textContent = `"${goal.title}" will be removed from your Goal Plan.`;
    openOverlay($('goalDeleteOverlay'), $('goalDeleteCancel'));
  }

  function submitPlan() {
    if (!state.goals.length) {
      showToast('Add at least one goal before submitting.');
      return;
    }
    if (Math.abs(totalWeightage() - 100) > .001) {
      showToast('Total weightage must equal 100.00% before submitting.');
      return;
    }
    state.status = 'Submitted';
    render();
    showToast('Goal Plan submitted successfully.');
  }

  $('goalPlanAdd').addEventListener('click', beginAddGoal);
  $('goalDetailsClose').addEventListener('click', closeOverlay);
  $('goalFormClose').addEventListener('click', closeOverlay);
  $('goalFormCancel').addEventListener('click', closeOverlay);
  $('goalDeleteCancel').addEventListener('click', closeOverlay);

  $('goalDeleteConfirm').addEventListener('click', () => {
    const goal = selectedGoal();
    if (!goal) return;
    state.goals = state.goals.filter(item => item.id !== goal.id);
    state.selectedId = null;
    state.status = 'Draft';
    render();
    closeOverlay();
    showToast('Goal deleted.');
  });

  $('goalForm').addEventListener('input', clearFormError);
  $('goalForm').addEventListener('change', clearFormError);
  $('goalForm').addEventListener('submit', event => {
    event.preventDefault();
    clearFormError();
    const goal = formValues();
    const error = validateGoal(goal);
    if (error) {
      showFormError(...error);
      return;
    }
    if (state.editingId) {
      const index = state.goals.findIndex(item => item.id === state.editingId);
      if (index >= 0) state.goals[index] = { ...state.goals[index], ...goal };
      showToast('Goal updated.');
    } else {
      state.goals.push({ id: `GOAL-${Date.now()}`, ...goal });
      showToast('Goal added.');
    }
    state.status = 'Draft';
    state.editingId = null;
    render();
    closeOverlay();
  });

  $('goalPlanSaveDraft').addEventListener('click', () => {
    state.status = 'Draft';
    render();
    showToast('Goal Plan draft saved.');
  });
  $('goalPlanSubmit').addEventListener('click', submitPlan);

  [$('goalDetailsOverlay'), $('goalDeleteOverlay')].forEach(overlay => {
    overlay.addEventListener('click', event => { if (event.target === overlay) closeOverlay(); });
  });
  $('goalFormOverlay').addEventListener('click', event => {
    if (event.target === $('goalFormOverlay')) closeOverlay();
  });
  document.addEventListener('keydown', event => {
    if (!activeOverlay) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeOverlay();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...activeOverlay.querySelectorAll('button, input, select, textarea, [tabindex="0"]')].filter(element => !element.disabled && element.getClientRects().length);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  new MutationObserver(syncBack).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  document.addEventListener('DOMContentLoaded', () => {
    source.goalTypes.forEach(type => $('goalTypeInput').append(new Option(type, type)));
    const addedGoal = consumeGoalReturn();
    renderEmployee();
    syncBack();
    render();
    if (addedGoal) showToast('Goal added.');
  });
})();
