(() => {
  const key = 'pq_self_evaluation_preview_v1';
  const kinds = ['goals', 'competencies'];

  function baseRecord() {
    const record = structuredClone(window.PERFORMANCE_SELF_EVALUATION || {});
    kinds.forEach(kind => {
      record[kind] = (record[kind] || []).map((item, index) => ({ ...item, id: `${kind === 'goals' ? 'goal' : 'competency'}-${index + 1}` }));
    });
    return record;
  }

  function saved() {
    try {
      const value = JSON.parse(sessionStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function get() {
    const record = baseRecord();
    for (const patch of saved()) {
      if (!kinds.includes(patch.kind)) continue;
      const item = record[patch.kind].find(entry => entry.id === patch.itemId);
      if (item && Number.isFinite(patch.rating) && patch.rating >= 0 && patch.rating <= 5 && typeof patch.remark === 'string') {
        Object.assign(item, { rating: patch.rating, remark: patch.remark });
      }
    }
    return record;
  }

  function update(kind, itemId, changes) {
    if (!kinds.includes(kind)) throw new Error('Evaluation section not found.');
    const item = get()[kind].find(entry => entry.id === itemId);
    if (!item) throw new Error('Evaluation item not found.');
    const patch = { kind, itemId, rating: Number(changes.rating), remark: String(changes.remark ?? '') };
    if (!Number.isFinite(patch.rating) || patch.rating < 0 || patch.rating > 5 || patch.remark.length > 2000) {
      throw new Error('Invalid evaluation update.');
    }
    const edits = saved().filter(entry => !(entry.kind === kind && entry.itemId === itemId));
    edits.push(patch);
    sessionStorage.setItem(key, JSON.stringify(edits));
  }

  window.SelfEvaluationStore = { get, update, key };
})();
