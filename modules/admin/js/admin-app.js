/* Keep Admin option and return links in the currently selected theme. */
document.addEventListener('DOMContentLoaded', () => {
  const scopeTabs = [...document.querySelectorAll('.workplace-scope-tab')];
  const optionsDialog = document.getElementById('workplaceOptionsDialog');
  const optionsTrigger = document.querySelector('[data-workplace-options-open]');
  function positionOptionsDialog() {
    if (!optionsDialog) return;
    const phone = document.querySelector('.phone-container');
    const bounds = phone.getBoundingClientRect();
    Object.entries({ top: bounds.top, left: bounds.left, width: bounds.width, height: bounds.height }).forEach(([key, value]) => {
      optionsDialog.style.setProperty('--schedule-sheet-' + key, value + 'px');
    });
    optionsDialog.style.setProperty('--schedule-sheet-radius', getComputedStyle(phone).borderRadius);
  }
  function closeOptionsDialog() {
    if (optionsDialog?.open) optionsDialog.close();
  }
  optionsTrigger?.addEventListener('click', () => {
    positionOptionsDialog();
    optionsDialog.showModal();
  });
  optionsDialog?.addEventListener('click', event => {
    if (event.target === optionsDialog) closeOptionsDialog();
  });
  window.addEventListener('resize', () => {
    if (optionsDialog?.open) positionOptionsDialog();
  });
  function setScope(scope, updateUrl = true) {
    const activeScope = scope === 'team' ? 'team' : 'individual';
    if (activeScope === 'team') closeOptionsDialog();
    scopeTabs.forEach(tab => {
      const selected = tab.id === (activeScope === 'team' ? 'workplaceTabTeam' : 'workplaceTabIndividual');
      tab.classList.toggle('active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
    });
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
    document.querySelectorAll('a.admin-option, .team-pending-approval-action, [data-admin-back], [data-document-status]').forEach(link => {
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
