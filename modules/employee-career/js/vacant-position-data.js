(() => {
  const palette = ['#14b8a6', '#475569', '#3b82f6', '#ec4899', '#f59e0b', '#65a30d', '#d946ef', '#6366f1'];
  const groups = new Map();
  (window.EMPLOYEE_CAREER_VACANCIES || []).forEach(record => {
    if (record.status !== 'Open' || !record.job || !(Number(record.vacancies) > 0)) return;
    if (!groups.has(record.job)) groups.set(record.job, { job: record.job, count: 0, records: [] });
    const group = groups.get(record.job);
    group.count += Number(record.vacancies);
    group.records.push(record);
  });
  const jobs = [...groups.values()].sort((a, b) => a.job.localeCompare(b.job))
    .map((group, index) => ({ ...group, color: palette[index % palette.length] }));
  window.EMPLOYEE_CAREER_VACANT_POSITION = {
    jobs,
    total: jobs.reduce((sum, group) => sum + group.count, 0)
  };
})();
