// Share Staff Incident preview edits across its History and edit form in the current tab.
// This stores attachment metadata; uploaded File objects remain in the form's submission event.
(() => {
  const key = 'pq_staff_incident_preview_v1';
  const fields = ['empNo', 'name', 'position', 'incidentDate', 'incidentType', 'incidentAction', 'measureValue', 'remarks'];
  function saved() {
    try {
      const state = JSON.parse(sessionStorage.getItem(key) || '{}');
      return {
        edits: Array.isArray(state?.edits) ? state.edits.filter(row => row && typeof row.reference === 'string') : [],
        deleted: Array.isArray(state?.deleted) ? state.deleted.filter(reference => typeof reference === 'string') : []
      };
    } catch { return { edits: [], deleted: [] }; }
  }
  function attachmentInfo(file) {
    if (typeof file === 'string') return { name: file };
    if (!file || typeof file.name !== 'string') return null;
    const info = { name: file.name };
    for (const field of ['href', 'url', 'type']) if (typeof file[field] === 'string') info[field] = file[field];
    for (const field of ['size', 'lastModified']) if (Number.isFinite(file[field])) info[field] = file[field];
    return info;
  }
  function editable(record) {
    const patch = Object.fromEntries(fields.filter(field => typeof record[field] === 'string').map(field => [field, record[field]]));
    if (Array.isArray(record.attachments)) patch.attachments = record.attachments.map(attachmentInfo).filter(Boolean);
    return patch;
  }
  function all() {
    const state = saved(), edits = new Map(state.edits.map(row => [row.reference, editable(row)])), deleted = new Set(state.deleted);
    const source = Array.isArray(window.PERFORMANCE_INCIDENT_HIGHLIGHT_DATA) ? window.PERFORMANCE_INCIDENT_HIGHLIGHT_DATA : [];
    return structuredClone(source).map((row, index) => {
      const reference = row.reference || `incident-preview-${index + 1}`;
      return { ...row, reference, ...edits.get(reference) };
    }).filter(row => !deleted.has(row.reference));
  }
  function update(reference, changes) {
    if (!all().some(row => row.reference === reference)) throw new Error('Staff incident not found. Return to History.');
    const state = saved();
    state.edits = state.edits.filter(row => row.reference !== reference);
    state.edits.push({ reference, ...editable(changes) });
    sessionStorage.setItem(key, JSON.stringify(state));
  }
  function remove(reference) {
    if (!all().some(row => row.reference === reference)) throw new Error('Staff incident not found.');
    const state = saved();
    state.deleted.push(reference); state.edits = state.edits.filter(row => row.reference !== reference);
    sessionStorage.setItem(key, JSON.stringify(state));
  }
  window.StaffIncidentPreviewStore = { all, update, remove };
})();
