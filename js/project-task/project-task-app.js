/* Project & Task module navigation. Option content is implemented separately. */
(function () {
  function syncThemeNavigation() {
    const theme = getCurrentTheme();
    const url = new URL(window.location.href);
    url.searchParams.set('theme', theme);
    window.history.replaceState(null, '', url);
    for (const link of document.querySelectorAll('.project-option')) {
      const target = new URL(link.href);
      target.searchParams.set('theme', theme);
      link.href = target.href;
    }
  }

  function switchScope(scope, focusTab = false) {
    const selected = scope === 'team' ? 'team' : 'individual';
    for (const name of ['individual', 'team']) {
      const tab = document.getElementById(`projectTab-${name}`);
      const panel = document.getElementById(`projectPanel-${name}`);
      const active = name === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panel.hidden = !active;
      if (active && focusTab) tab.focus({ preventScroll: true });
    }
    document.getElementById('projectHeaderScope').textContent = selected === 'team' ? 'Team' : 'Individual';
    const url = new URL(window.location.href);
    url.searchParams.set('scope', selected);
    window.history.replaceState(null, '', url);
  }

  document.addEventListener('DOMContentLoaded', () => {
    setTheme(getCurrentTheme());
    syncThemeNavigation();
    document.addEventListener('click', event => {
      if (event.target.closest('[data-set-theme], .project-option')) syncThemeNavigation();
    });
    if (!document.getElementById('projectTab-individual')) return;
    switchScope(new URLSearchParams(window.location.search).get('scope'));
    for (const scope of ['individual', 'team']) {
      const tab = document.getElementById(`projectTab-${scope}`);
      tab.addEventListener('click', () => switchScope(scope));
      tab.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 'individual' : event.key === 'End' ? 'team' : scope === 'individual' ? 'team' : 'individual';
        switchScope(next, true);
      });
    }
  });
})();
