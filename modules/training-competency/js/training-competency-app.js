(() => {
  const tabs = [
    document.getElementById('trainingCompetencyTabIndividual'),
    document.getElementById('trainingCompetencyTabTeam')
  ];
  const panels = [
    document.getElementById('trainingCompetencyIndividualPanel'),
    document.getElementById('trainingCompetencyTeamPanel')
  ];
  const theme = () => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';

  function syncBackLink() {
    document.getElementById('trainingCompetencyBack').href = `../../app${theme()}.html`;
    document.querySelector('[data-option-id="competency"]').href = `options/competency.html?theme=${theme()}`;
    document.querySelector('[data-option-id="course-catalog"]').href = `options/course-catalog.html?theme=${theme()}`;
    document.querySelector('[data-option-id="training-need"]').href = `options/training-need.html?theme=${theme()}`;
    document.querySelector('[data-option-id="learning-development-plan"]').href = `options/learning-development-plan.html?theme=${theme()}`;
    document.querySelector('[data-option-id="training-plan"]').href = `options/training-plan.html?theme=${theme()}`;
    document.querySelector('[data-option-id="training-clocking"]').href = `options/training-clocking.html?theme=${theme()}`;
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
      const title = button.querySelector('.training-competency-option-title').textContent.trim();
      showToast(`${title} is coming soon`);
    });
  });

  document.querySelectorAll('[data-status]').forEach(button => {
    button.addEventListener('click', () => showToast('Training history is coming soon'));
  });

  window.addEventListener('popstate', () => setScope(new URLSearchParams(location.search).get('scope'), false));
  new MutationObserver(syncBackLink).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  document.addEventListener('DOMContentLoaded', () => {
    setScope(new URLSearchParams(location.search).get('scope'), false);
    syncBackLink();
  });
})();
