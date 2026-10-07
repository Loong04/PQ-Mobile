/* Keep Admin option and return links in the currently selected theme. */
document.addEventListener('DOMContentLoaded', () => {
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
