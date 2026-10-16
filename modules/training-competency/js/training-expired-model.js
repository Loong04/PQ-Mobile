(() => {
  'use strict';
  function date(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const timestamp = Date.parse(`${value}T00:00:00Z`);
    return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value ? timestamp : null;
  }
  function summarize(definitions, records, today) {
    const cutoff = date(today), skills = new Set(definitions.map(skill => skill.id));
    const expired = cutoff == null ? [] : records.flatMap(record => {
      const expiry = date(record.expiry);
      if (expiry == null || expiry >= cutoff || !skills.has(record.competency) || !record.empNo) return [];
      const value = record.level === '' || record.level == null ? NaN : Number(record.level);
      const level = Number.isInteger(value) && value >= 0 && value <= 5 ? value : 'unrated';
      return [{ ...record, level, overdueDays: Math.round((cutoff - expiry) / 86400000) }];
    }).sort((a, b) => a.expiry.localeCompare(b.expiry) || String(a.name || '').localeCompare(String(b.name || '')) || String(a.empNo).localeCompare(String(b.empNo)));
    const groups = definitions.map(skill => {
      const matches = expired.filter(record => record.competency === skill.id);
      const levels = [...new Set(matches.map(record => record.level))].sort((a, b) => a === 'unrated' ? 1 : b === 'unrated' ? -1 : a - b)
        .map(level => ({ level, count: matches.filter(record => record.level === level).length }));
      return { competency: skill.id, title: skill.title, count: matches.length, levelCount: levels.length, levels, records: matches };
    }).filter(group => group.count).sort((a, b) => b.count - a.count || a.title.localeCompare(b.title));
    return { totalRecords: expired.length, totalEmployees: new Set(expired.map(record => record.empNo)).size, groups };
  }
  window.TrainingExpiredCompetencies = { summarize };
})();
