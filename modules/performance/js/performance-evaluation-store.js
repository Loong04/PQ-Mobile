// Preview edits persist across these pages in the current tab, like Staff Incident.
// Only the selected item's rating and remark can be changed.
(() => {
  const key = 'pq_performance_evaluation_preview_v1';
  const kinds = ['goals', 'competencies'];
  const validPatch = patch => patch && typeof patch.evaluationId === 'string' && kinds.includes(patch.kind)
    && typeof patch.itemId === 'string' && Number.isFinite(patch.rating) && patch.rating >= 0 && patch.rating <= 5
    && typeof patch.remark === 'string' && patch.remark.length <= 2000;

  function saved() {
    try {
      const value = JSON.parse(sessionStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value.filter(validPatch) : [];
    } catch { return []; }
  }

  function all() {
    const records = structuredClone(window.PERFORMANCE_EVALUATION_DATA || []);
    for (const patch of saved()) {
      const record = records.find(record => record.id === patch.evaluationId);
      const item = record?.[patch.kind]?.find(item => item.id === patch.itemId);
      if (item) Object.assign(item, { rating: patch.rating, remark: patch.remark });
    }
    return records;
  }

  function update(evaluationId, kind, itemId, changes) {
    if (!kinds.includes(kind)) throw new Error('Evaluation section not found.');
    const item = all().find(record => record.id === evaluationId)?.[kind]?.find(item => item.id === itemId);
    if (!item) throw new Error('Evaluation item not found. Return to the evaluation.');
    const patch = { evaluationId, kind, itemId, rating: changes.rating, remark: changes.remark };
    if (!validPatch(patch)) throw new Error('Enter a rating from 0 to 5 and a remark of up to 2,000 characters.');
    const edits = saved().filter(patch => !(patch.evaluationId === evaluationId && patch.kind === kind && patch.itemId === itemId));
    edits.push(patch);
    sessionStorage.setItem(key, JSON.stringify(edits));
  }

  window.PerformanceEvaluationStore = { all, update };
})();
