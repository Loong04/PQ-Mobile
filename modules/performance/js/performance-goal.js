(() => {
  const source = window.PERFORMANCE_GOAL_PLAN;
  const $ = id => document.getElementById(id);
  const params = new URLSearchParams(window.location.search);
  const theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
  const token = params.get('goalReturnToken') || `goal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const resultKey = `peoplehcm:performance:goal-plan:result:${token}`;

  function returnUrl() {
    const url = new URL('goal-plan.html', window.location.href);
    url.searchParams.set('theme', theme);
    url.searchParams.set('goalReturnToken', token);
    return url;
  }

  function clearError() {
    $('goalFormError').hidden = true;
    $('goalForm').querySelectorAll('[aria-invalid="true"]').forEach(field => field.removeAttribute('aria-invalid'));
  }

  function formValues() {
    return {
      id: `GOAL-${Date.now()}`,
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

  function showError(message, field) {
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

  function goBack() {
    window.location.assign(returnUrl().href);
  }

  document.addEventListener('DOMContentLoaded', () => {
    source.goalTypes.forEach(type => $('goalTypeInput').append(new Option(type, type)));
    $('performanceGoalBack').href = returnUrl().href;
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
        window.sessionStorage.setItem(resultKey, JSON.stringify({ token, goal }));
        stored = true;
      } catch {}
      const url = returnUrl();
      if (!stored) url.searchParams.set('goalPayload', JSON.stringify(goal));
      window.location.assign(url.href);
    });
  });
})();
