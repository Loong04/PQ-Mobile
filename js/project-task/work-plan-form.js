(() => {
  function syncReturnLinks() {
    const theme = getCurrentTheme() === 'light' ? 'light' : 'dark';
    document.querySelectorAll('[data-work-plan-back]').forEach(link => {
      link.href = `../index.html?scope=individual&theme=${theme}`;
    });
  }
  document.addEventListener('DOMContentLoaded', syncReturnLinks);
  new MutationObserver(syncReturnLinks).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
})();
