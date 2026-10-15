(() => {
  const tabs = [document.getElementById('performanceTabIndividual'), document.getElementById('performanceTabTeam')];
  const panels = [document.getElementById('performanceIndividualPanel'), document.getElementById('performanceTeamPanel')];
  const highlightRecords = Array.isArray(window.PERFORMANCE_HIGHLIGHT_DATA) ? window.PERFORMANCE_HIGHLIGHT_DATA : [];
  const theme = () => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';

  function employeeId(value) {
    const id = String(value ?? '').replace(/^#+/, '').trim();
    return id ? `#${id}` : '—';
  }

  function latestEmployeeRecords(records) {
    const latestByEmployee = new Map();
    records.forEach(record => {
      const key = String(record.empNo ?? '').replace(/^#+/, '').trim();
      const score = Number(record.overallScore);
      if (!key || !Number.isFinite(score)) return;
      const current = latestByEmployee.get(key);
      if (!current || String(record.evaluationDate ?? '').localeCompare(String(current.evaluationDate ?? '')) > 0) {
        latestByEmployee.set(key, record);
      }
    });
    return [...latestByEmployee.values()];
  }

  function attentionItem(record, rank) {
    const item = document.createElement('li');
    item.className = 'performance-attention-item';

    const rankLabel = document.createElement('span');
    rankLabel.className = 'performance-attention-rank';
    rankLabel.textContent = String(rank);

    const person = document.createElement('span');
    person.className = 'performance-attention-person';
    const name = document.createElement('strong');
    name.className = 'performance-attention-name';
    name.textContent = record.name || 'Unnamed Employee';
    const id = document.createElement('small');
    id.className = 'performance-attention-employee-id';
    id.textContent = employeeId(record.empNo);
    person.append(name, id);

    const result = document.createElement('span');
    result.className = 'performance-attention-result';
    const score = document.createElement('strong');
    score.className = 'performance-attention-score';
    score.textContent = Number(record.overallScore).toFixed(2);
    const grade = document.createElement('small');
    grade.className = 'performance-attention-grade';
    grade.textContent = `Grade ${record.scoreGrade || '—'}`;
    result.append(score, grade);
    item.append(rankLabel, person, result);
    return item;
  }

  function renderAttentionList(list, records) {
    list.replaceChildren();
    if (!records.length) {
      const empty = document.createElement('li');
      empty.className = 'performance-attention-empty';
      empty.textContent = 'No performance records';
      list.append(empty);
      return;
    }
    records.forEach((record, index) => list.append(attentionItem(record, index + 1)));
  }

  function renderNeedAttention() {
    const employees = latestEmployeeRecords(highlightRecords);
    const ascending = [...employees].sort((left, right) => Number(left.overallScore) - Number(right.overallScore) || left.name.localeCompare(right.name));
    renderAttentionList(document.getElementById('performanceLowestList'), ascending.slice(0, 5));
    renderAttentionList(document.getElementById('performanceTopList'), ascending.slice(-5).reverse());
  }

  function syncBackLink() {
    document.getElementById('performanceBack').href = `../../app${theme()}.html`;
    document.querySelector('[data-option-id="goal-plan"]').href = `options/goal-plan.html?theme=${theme()}`;
    document.querySelector('[data-option-id="goal-progress"]').href = `options/goal-progress.html?theme=${theme()}`;
    document.querySelector('[data-option-id="self-evaluation"]').href = `options/self-evaluation.html?theme=${theme()}`;
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
  document.querySelectorAll('[data-status]').forEach(button => {
    button.addEventListener('click', () => showToast('Performance history is coming soon'));
  });

  window.addEventListener('popstate', () => setScope(new URLSearchParams(location.search).get('scope'), false));
  new MutationObserver(syncBackLink).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  document.addEventListener('DOMContentLoaded', () => {
    setScope(new URLSearchParams(location.search).get('scope'), false);
    syncBackLink();
    renderNeedAttention();
  });
})();
