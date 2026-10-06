(() => {
  const params = new URLSearchParams(location.search);
  const record = window.ADMIN_POLICY.records.find(item => item.id === params.get('document'));
  const back = document.getElementById('policyDocumentBack');
  function updateBack() {
    const url = new URL('policy-sop.html', location.href);
    Object.keys(window.ADMIN_POLICY.defaults).forEach(key => { if (params.has(key)) url.searchParams.set(key, params.get(key)); });
    url.searchParams.set('theme', document.documentElement.dataset.theme || 'dark');
    back.href = url.href;
  }
  updateBack();
  new MutationObserver(updateBack).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  if (!record) {
    document.getElementById('policyDocumentUnavailable').hidden = false;
    return;
  }
  document.title = 'PeopleHCM - ' + record.filename;
  document.getElementById('policyDocumentFilename').textContent = record.filename;
  document.getElementById('policyDocumentMeta').textContent = record.title + ' · Policy';
  const image = document.getElementById('policyDocumentImage');
  image.addEventListener('error', () => {
    document.getElementById('policyDocumentPreview').hidden = true;
    document.getElementById('policyDocumentUnavailable').hidden = false;
  });
  image.src = record.preview;
  document.getElementById('policyDocumentPreview').hidden = false;
})();
