(() => {
  const key = 'pq_self_evaluation_preview_v1';
  const kinds = ['goals', 'competencies'];
  function baseRecord() {
    const record = structuredClone(window.PERFORMANCE_SELF_EVALUATION || {});
    kinds.forEach(kind => { record[kind] = (record[kind] || []).map((item, index) => ({ ...item, id: item.id || `${kind === 'goals' ? 'goal' : 'competency'}-${index + 1}` })); });
    return record;
  }
  function saved() { try { const value = JSON.parse(sessionStorage.getItem(key) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } }
  function get() {
    const record = baseRecord();
    for (const patch of saved()) {
      if (!kinds.includes(patch.kind)) continue;
      if (patch.action === 'add' && patch.kind === 'goals' && patch.item?.id) {
        if (!record.goals.some(item => item.id === patch.item.id)) record.goals.push({ ...patch.item });
        continue;
      }
      const item = record[patch.kind].find(entry => entry.id === patch.itemId);
      if (item && Number.isFinite(patch.rating) && patch.rating >= 0 && patch.rating <= 5 && typeof patch.remark === 'string') Object.assign(item, { rating: patch.rating, remark: patch.remark });
    }
    return record;
  }
  function update(kind, itemId, changes) {
    if (!kinds.includes(kind) || !get()[kind].some(item => item.id === itemId)) throw new Error('Evaluation item not found.');
    const patch = { action: 'update', kind, itemId, rating: Number(changes.rating), remark: String(changes.remark ?? '') };
    if (!Number.isFinite(patch.rating) || patch.rating < 0 || patch.rating > 5 || patch.remark.length > 2000) throw new Error('Invalid evaluation update.');
    const edits = saved().filter(entry => !(entry.action !== 'add' && entry.kind === kind && entry.itemId === itemId));
    edits.push(patch); sessionStorage.setItem(key, JSON.stringify(edits));
  }
  function addGoal(changes) {
    const item = { id: 'goal-' + crypto.randomUUID(), title: String(changes.title || '').trim(), weightage: Number(changes.weightage), rating: Number(changes.rating), remark: String(changes.remark || '').trim() };
    if (!item.title || !Number.isFinite(item.weightage) || item.weightage <= 0 || item.weightage > 100 || !Number.isFinite(item.rating) || item.rating < 0 || item.rating > 5 || item.remark.length > 2000) throw new Error('Invalid evaluation goal.');
    const edits = saved(); edits.push({ action: 'add', kind: 'goals', item }); sessionStorage.setItem(key, JSON.stringify(edits)); return item;
  }
  window.SelfEvaluationStore = { get, update, addGoal, key };
})();
