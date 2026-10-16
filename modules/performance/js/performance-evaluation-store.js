// Preview edits persist across these pages in the current tab, like Staff Incident.
(() => {
  const key = 'pq_performance_evaluation_preview_v1';
  const kinds = ['goals', 'competencies'];

  function validPatch(patch) {
    if (!patch || typeof patch.evaluationId !== 'string') return false;
    if (patch.action === 'status') return ['Approved', 'Resubmit', 'Cancelled', 'Rejected'].includes(patch.status);
    if (!kinds.includes(patch.kind)) return false;
    if (patch.action === 'add') return patch.kind === 'goals' && patch.item && typeof patch.item.id === 'string';
    if (patch.action === 'delete') return patch.kind === 'goals' && typeof patch.itemId === 'string';
    return typeof patch.itemId === 'string' && Number.isFinite(patch.rating) && patch.rating >= 0 && patch.rating <= 5
      && typeof patch.remark === 'string' && patch.remark.length <= 2000;
  }

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
      if (!record) continue;
      if (patch.action === 'status') {
        record.status = patch.status;
        continue;
      }
      if (patch.action === 'add') {
        if (!record.goals.some(item => item.id === patch.item.id)) record.goals.push({ ...patch.item });
        continue;
      }
      if (patch.action === 'delete') {
        record.goals = record.goals.filter(item => item.id !== patch.itemId);
        continue;
      }
      const item = record[patch.kind]?.find(item => item.id === patch.itemId);
      if (item) Object.assign(item, { rating: patch.rating, remark: patch.remark });
    }
    return records;
  }

  function update(evaluationId, kind, itemId, changes) {
    if (!kinds.includes(kind)) throw new Error('Evaluation section not found.');
    const item = all().find(record => record.id === evaluationId)?.[kind]?.find(item => item.id === itemId);
    if (!item) throw new Error('Evaluation item not found. Return to the evaluation.');
    const patch = { action: 'update', evaluationId, kind, itemId, rating: Number(changes.rating), remark: String(changes.remark ?? '') };
    if (!validPatch(patch)) throw new Error('Enter a rating from 0 to 5 and a remark of up to 2,000 characters.');
    const edits = saved().filter(entry => !(entry.action !== 'add' && entry.evaluationId === evaluationId && entry.kind === kind && entry.itemId === itemId));
    edits.push(patch);
    sessionStorage.setItem(key, JSON.stringify(edits));
  }

  function addGoal(evaluationId, changes) {
    if (!all().some(record => record.id === evaluationId)) throw new Error('Evaluation not found.');
    const item = {
      id: 'goal-' + crypto.randomUUID(),
      title: String(changes.title || '').trim(),
      weightage: Number(changes.weightage),
      rating: Number(changes.rating),
      remark: String(changes.remark || '').trim()
    };
    if (!item.title || !Number.isFinite(item.weightage) || item.weightage <= 0 || item.weightage > 100
      || !Number.isFinite(item.rating) || item.rating < 0 || item.rating > 5 || item.remark.length > 2000) throw new Error('Invalid evaluation goal.');
    const edits = saved();
    edits.push({ action: 'add', evaluationId, kind: 'goals', item });
    sessionStorage.setItem(key, JSON.stringify(edits));
    return item;
  }

  function deleteGoal(evaluationId, itemId) {
    const record = all().find(record => record.id === evaluationId);
    if (!record?.goals.some(item => item.id === itemId)) throw new Error('Evaluation goal not found.');
    const edits = saved().filter(entry => !(entry.evaluationId === evaluationId && entry.kind === 'goals'
      && ((entry.action === 'add' && entry.item.id === itemId) || (entry.action !== 'add' && entry.itemId === itemId))));
    if (!String(itemId).startsWith('goal-') || (window.PERFORMANCE_EVALUATION_DATA || []).some(record => record.id === evaluationId && record.goals?.some(item => item.id === itemId))) {
      edits.push({ action: 'delete', evaluationId, kind: 'goals', itemId });
    }
    sessionStorage.setItem(key, JSON.stringify(edits));
  }

  function setStatus(evaluationId, status) {
    if (!all().some(record => record.id === evaluationId)) throw new Error('Evaluation not found.');
    const patch = { action: 'status', evaluationId, status };
    if (!validPatch(patch)) throw new Error('Evaluation status is invalid.');
    const edits = saved().filter(entry => !(entry.action === 'status' && entry.evaluationId === evaluationId));
    edits.push(patch);
    sessionStorage.setItem(key, JSON.stringify(edits));
  }

  window.PerformanceEvaluationStore = { all, update, addGoal, deleteGoal, setStatus, key };
})();
