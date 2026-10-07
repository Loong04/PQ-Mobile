/* Keep Admin option and return links in the currently selected theme. */
document.addEventListener('DOMContentLoaded', () => {
  const scopeTabs = [...document.querySelectorAll('.workplace-scope-tab')];
  function setScope(scope, updateUrl = true) {
    const activeScope = scope === 'team' ? 'team' : 'individual';
    scopeTabs.forEach(tab => {
      const selected = tab.id === (activeScope === 'team' ? 'workplaceTabTeam' : 'workplaceTabIndividual');
      tab.classList.toggle('active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
    });
    document.getElementById('workplaceScopeSubtitle').textContent = activeScope === 'team' ? 'Team' : 'Individual';
    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.set('scope', activeScope);
      url.searchParams.set('theme', getCurrentTheme());
      history.replaceState({}, '', url);
    }
  }
  scopeTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setScope(index === 1 ? 'team' : 'individual'));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const target = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index;
      setScope(target === 1 ? 'team' : 'individual');
      scopeTabs[target].focus();
    });
  });
  if (scopeTabs.length) setScope(new URLSearchParams(location.search).get('scope'), false);
  function updateAdminLinks() {
    document.querySelectorAll('.admin-option, [data-admin-back], [data-document-status]').forEach(link => {
      const url = new URL(link.href, window.location.href);
      url.searchParams.set('theme', getCurrentTheme());
      link.href = url.href;
    });
  }
  updateAdminLinks();
  function updateDocumentStatus() {
    if (!document.getElementById('workplaceDocumentStatus')) return;
    try {
      const totals = window.WorkplaceHistoryStore.counts();
      document.querySelectorAll('[data-document-status]').forEach(link => {
        const count = totals[link.dataset.documentStatus];
        link.querySelector('strong').textContent = count;
        link.setAttribute('aria-label', `${link.querySelector('span').textContent}: ${count} documents. Open History`);
      });
      document.getElementById('workplaceStatusError').hidden = true;
    } catch {
      document.querySelectorAll('[data-document-status] strong').forEach(count => { count.textContent = '—'; });
      document.getElementById('workplaceStatusError').textContent = 'Unable to read saved History.';
      document.getElementById('workplaceStatusError').hidden = false;
    }
  }
  updateDocumentStatus();
  window.addEventListener('pageshow', updateDocumentStatus);
  window.addEventListener('storage', updateDocumentStatus);
  new MutationObserver(updateAdminLinks).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
});
