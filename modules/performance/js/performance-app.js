(() => {
  const tabs = [document.getElementById('performanceTabIndividual'), document.getElementById('performanceTabTeam')];
  const panels = [document.getElementById('performanceIndividualPanel'), document.getElementById('performanceTeamPanel')];
  const highlightRecords = Array.isArray(window.PERFORMANCE_HIGHLIGHT_DATA) ? window.PERFORMANCE_HIGHLIGHT_DATA : [];
  const theme = () => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';

  function latestEmployeeRecords(records) {
    const latestByEmployee = new Map();
    records.forEach(record => {
      const key = String(record.empNo ?? '').replace(/^#+/, '').trim();
      if (!key) return;
      const current = latestByEmployee.get(key);
      if (!current || String(record.evaluationDate ?? '').localeCompare(String(current.evaluationDate ?? '')) > 0) {
        latestByEmployee.set(key, record);
      }
    });
    return [...latestByEmployee.values()].filter(record => {
      const score = Number(record.overallScore);
      return record.overallScore !== null && record.overallScore !== undefined && String(record.overallScore).trim() !== '' && Number.isFinite(score) && score >= 0 && score <= 100;
    });
  }

  function renderNeedAttention() {
    const employees = latestEmployeeRecords(highlightRecords);
    const average = records => records.length ? (records.reduce((total, record) => total + Number(record.overallScore), 0) / records.length).toFixed(2) : '—';
    const container = document.getElementById('performanceScoreGroups');
    container.replaceChildren();
    const bands = [
      { range: '80–100', label: '80 to 100', min: 80, max: 101, tone: 'high' },
      { range: '60–<80', label: '60 to below 80', min: 60, max: 80, tone: 'medium' },
      { range: '40–<60', label: '40 to below 60', min: 40, max: 60, tone: 'low' },
      { range: '0–<40', label: '0 to below 40', min: 0, max: 40, tone: 'critical' }
    ];
    const element = (tag, className, text) => {
      const node = document.createElement(tag);
      node.className = className;
      if (text !== undefined) node.textContent = text;
      return node;
    };
    bands.forEach(band => {
      const records = employees.filter(record => Number(record.overallScore) >= band.min && Number(record.overallScore) < band.max);
      const row = element('tr', 'performance-score-group');
      const range = element('th', 'performance-score-range', band.range);
      range.scope = 'row';
      const count = element('td', 'performance-score-count', String(records.length));
      const averageCell = element('td', 'performance-score-average');
      averageCell.append(element('strong', '', average(records)));
      row.append(range, count, averageCell);
      container.append(row);
    });
  }

  function syncBackLink() {
    document.getElementById('performancePendingApproval').href = `options/pending-approval.html?theme=${theme()}`;
    document.getElementById('performanceBack').href = `../../app${theme()}.html`;
    document.querySelector('[data-option-id="goal-plan"]').href = `options/goal-plan.html?theme=${theme()}`;
    document.querySelector('[data-option-id="goal-progress"]').href = `options/goal-progress.html?theme=${theme()}`;
    document.querySelector('[data-option-id="self-evaluation"]').href = `options/self-evaluation.html?theme=${theme()}`;
    document.querySelector('[data-option-id="self-review"]').href = `options/self-review.html?theme=${theme()}`;
    document.querySelector('[data-task-id="goal-plan"]').href = `options/goal-plan.html?theme=${theme()}`;
    document.querySelector('[data-task-id="self-evaluation"]').href = `options/self-evaluation.html?theme=${theme()}`;
    document.querySelector('[data-task-id="self-review"]').href = `options/self-review.html?theme=${theme()}`;
    document.querySelector('[data-option-id="performance-evaluation"]').href = `options/performance-evaluation.html?theme=${theme()}`;
    document.querySelector('[data-option-id="work-incident"]').href = `options/work-incident.html?theme=${theme()}`;
    document.querySelector('[data-option-id="performance-highlight"]').href = `options/performance-highlight.html?theme=${theme()}`;
    document.querySelector('[data-option-id="incident-highlight"]').href = `options/incident-highlight.html?theme=${theme()}`;
    document.querySelector('[data-option-id="staff-incident"]').href = `options/staff-incident.html?theme=${theme()}`;
    document.querySelector('[data-option-id="goal-summary"]').href = `options/goal-summary.html?theme=${theme()}`;
    document.querySelector('[data-option-id="history"]').href = `options/history.html?theme=${theme()}`;
  }

  function setScope(scope, updateUrl = true) {
    const activeIndex = scope === 'team' ? 1 : 0;
    tabs.forEach((tab, index) => {
      const active = index === activeIndex;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[index].hidden = !active;
    });
    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.set('scope', activeIndex === 1 ? 'team' : 'individual');
      url.searchParams.set('theme', theme());
      history.replaceState(null, '', url);
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setScope(index === 1 ? 'team' : 'individual'));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index;
      setScope(nextIndex === 1 ? 'team' : 'individual');
      tabs[nextIndex].focus();
    });
  });

  document.querySelectorAll('button[data-option-id]').forEach(button => {
    button.addEventListener('click', () => {
      const title = button.querySelector('.performance-option-title').textContent.trim();
      showToast(`${title} is coming soon`);
    });
  });
  const appraisalToggle = document.getElementById('performanceAppraisalToggle');
  const appraisalDetails = document.getElementById('performanceAppraisalDetails');
  appraisalToggle.addEventListener('click', () => {
    const expanded = appraisalToggle.getAttribute('aria-expanded') === 'true';
    appraisalToggle.setAttribute('aria-expanded', String(!expanded));
    appraisalDetails.hidden = expanded;
    appraisalToggle.querySelector('span').textContent = expanded ? 'View appraisal details' : 'Hide appraisal details';
  });

  document.querySelectorAll('[data-status]').forEach(button => {
    button.addEventListener('click', () => showToast('Performance history is coming soon'));
  });

  window.addEventListener('popstate', () => setScope(new URLSearchParams(location.search).get('scope'), false));
  new MutationObserver(syncBackLink).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  document.addEventListener('DOMContentLoaded', () => {
    setScope(new URLSearchParams(location.search).get('scope'), false);
    syncBackLink();
    renderNeedAttention();
    syncPendingCounts();
  });
  function syncPendingCounts() {
    const count = window.PerformancePendingStore.getPending().length;
    document.getElementById('performancePendingCount').textContent = count;
    document.getElementById('performanceActionRequiredCount').textContent = `${count} ${count === 1 ? 'Task' : 'Tasks'}`;
  }
  window.addEventListener('pageshow', syncPendingCounts);
})();
