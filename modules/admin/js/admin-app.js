/* Keep Admin option and return links in the currently selected theme. */
document.addEventListener('DOMContentLoaded', () => {
  function updateAdminLinks() {
    document.querySelectorAll('.admin-option, [data-admin-back]').forEach(link => {
      const url = new URL(link.href, window.location.href);
      url.searchParams.set('theme', getCurrentTheme());
      link.href = url.href;
    });
  }
  updateAdminLinks();
  new MutationObserver(updateAdminLinks).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
});

