(() => {
  const source = window.PERFORMANCE_GOAL_PLAN;
  const $ = id => document.getElementById(id);
  const params = new URLSearchParams(window.location.search);
  const competency = params.get('kind') === 'competency';
  const itemName = competency ? 'Competency' : 'Performance Goal';
  const sourceItems = competency ? source.competencies : source.goals;
  const theme = () => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
  const token = params.get('goalReturnToken') || `goal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const snapshotKey = `peoplehcm:performance:goal-plan:snapshot:${token}`;
  const resultKey = `peoplehcm:performance:goal-plan:result:${token}`;
  const goalId = params.get('goalId');

  function parseJson(value) {
    try { return value ? JSON.parse(value) : null; } catch { return null; }
  }

  function readSession(key) {
    try { return window.sessionStorage.getItem(key); } catch { return null; }
  }

  const snapshot = parseJson(readSession(snapshotKey));
  const seededGoal = parseJson(params.get('goalSeed'));
  const editingGoal = goalId ? (competency ? snapshot?.competencies : snapshot?.goals)?.find(goal => goal.id === goalId)
    || sourceItems.find(goal => goal.id === goalId)
    || (seededGoal?.id === goalId ? seededGoal : null) : null;

  function returnUrl() {
    const url = new URL('goal-plan.html', window.location.href);
    url.searchParams.set('theme', theme());
    url.searchParams.set('goalReturnToken', token);
    url.searchParams.set('section', competency ? 'competencies' : 'goals');
    return url;
  }

  function clearError() {
    $('goalFormError').hidden = true;
    $('goalForm').querySelectorAll('[aria-invalid="true"]').forEach(field => field.removeAttribute('aria-invalid'));
  }

  function formValues() {
    if (competency) {
      return {
        id: editingGoal.id,
        title: $('goalTitleInput').value.trim(),
        weightage: Number($('goalWeightageInput').value),
        rating: Number($('goalRatingInput').value),
        remark: $('goalRemarkInput').value.trim()
      };
    }
    const goal = {
      id: editingGoal?.id || `${competency ? 'COMP' : 'GOAL'}-${crypto.randomUUID()}`,
      title: $('goalTitleInput').value.trim(),
      type: $('goalTypeInput').value,
      description: $('goalDescriptionInput').value.trim(),
      targetDescription: $('goalTargetInput').value.trim(),
      deadline: $('goalDeadlineInput').value,
      weightage: Number($('goalWeightageInput').value),
      budgetHours: Number($('goalBudgetHoursInput').value || 0),
      remark: $('goalRemarkInput').value.trim()
    };
    return goal;
  }

  function showError(message, field) {
    $('goalFormError').textContent = message;
    $('goalFormError').hidden = false;
    field.setAttribute('aria-invalid', 'true');
    field.focus({ preventScroll: true });
  }

  function validateGoal(goal) {
    if (!goal.title) return [`${competency ? 'Title' : 'Goal Title'} is required.`, $('goalTitleInput')];
    if (!competency && !goal.type) return ['Goal Type is required.', $('goalTypeInput')];
    if (!competency && !goal.targetDescription) return ['Target Description is required.', $('goalTargetInput')];
    if (!competency && !goal.deadline) return ['Deadline is required.', $('goalDeadlineInput')];
    if (!Number.isFinite(goal.weightage) || goal.weightage <= 0 || goal.weightage > 100) return ['Weightage must be more than 0 and not more than 100.', $('goalWeightageInput')];
    if (competency && (!Number.isFinite(goal.rating) || goal.rating < 0 || goal.rating > 5)) return ['Rating must be from 0 to 5.', $('goalRatingInput')];
    if (!competency && (!Number.isFinite(goal.budgetHours) || goal.budgetHours < 0)) return ['Budget Hours cannot be negative.', $('goalBudgetHoursInput')];
    return null;
  }

  function goBack() {
    window.location.assign(returnUrl().href);
  }

  function populateForm(goal) {
    if (!goal) return;
    $('goalTitleInput').value = goal.title || '';
    $('goalTypeInput').value = goal.type || '';
    $('goalDescriptionInput').value = goal.description || '';
    $('goalTargetInput').value = goal.targetDescription || '';
    $('goalDeadlineInput').value = goal.deadline || '2026-12-31';
    $('goalWeightageInput').value = String(goal.weightage ?? '');
    $('goalRatingInput').value = String(goal.rating ?? '');
    $('goalBudgetHoursInput').value = String(goal.budgetHours ?? 0);
    $('goalRemarkInput').value = goal.remark || '';
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (competency && !editingGoal) {
      window.location.replace(returnUrl().href);
      return;
    }
    (competency ? source.competencyTypes : source.goalTypes).forEach(type => $('goalTypeInput').append(new Option(type, type)));
    if (competency) {
      document.querySelector('label[for="goalTitleInput"]').firstChild.textContent = 'Title ';
      ['goalTypeInput', 'goalDescriptionInput', 'goalTargetInput', 'goalDeadlineInput', 'goalBudgetHoursInput'].forEach(id => {
        $(id).closest('.goal-form-field').hidden = true;
        $(id).required = false;
      });
      $('goalRatingField').hidden = false;
      $('goalRatingInput').required = true;
    }
    $('performanceGoalTitle').textContent = itemName;
    document.title = `PeopleHCM - ${itemName}`;
    if (editingGoal) {
      document.title = `PeopleHCM - Edit ${itemName}`;
      $('performanceGoalTitle').textContent = `Edit ${itemName}`;
      populateForm(editingGoal);
    }
    $('performanceGoalBack').href = returnUrl().href;
    $('performanceGoalBack').setAttribute('aria-label', `Back to ${itemName}`);
    new MutationObserver(() => { $('performanceGoalBack').href = returnUrl().href; }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    $('goalFormCancel').addEventListener('click', goBack);
    $('goalForm').addEventListener('input', clearError);
    $('goalForm').addEventListener('change', clearError);
    $('goalForm').addEventListener('submit', event => {
      event.preventDefault();
      clearError();
      const goal = formValues();
      const error = validateGoal(goal);
      if (error) {
        showError(...error);
        return;
      }

      let stored = false;
      try {
        window.sessionStorage.setItem(resultKey, JSON.stringify({ token, action: editingGoal ? 'updated' : 'added', goal }));
        stored = true;
      } catch {}
      const url = returnUrl();
      if (!stored) url.searchParams.set('goalPayload', JSON.stringify(goal));
      window.location.assign(url.href);
    });
  });
})();
