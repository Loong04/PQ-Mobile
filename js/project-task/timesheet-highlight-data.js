/* Deterministic Team preview activities; all highlight totals are derived from these records. */
(function () {
  const employees = [
    ['EBB12', 'Farhan binti rahmat', 'Headquarters (HQ)', 'Human Resource', 'HR Operations', 'M1', 'Sarah Jenkins'],
    ['EBB27', 'Aina Rahman', 'Headquarters (HQ)', 'Finance', 'Payroll', 'E2', 'Marcus Vance'],
    ['EBB41', 'Daniel Lee', 'Penang', 'IT Support & Systems', 'Development', 'E3', 'Sarah Jenkins'],
    ['EBB36', 'Nur Izzati', 'Johor Bahru', 'Human Resource', 'HR Operations', 'E1', 'Farhan Rahmat'],
    ['EBB01', 'Muhammad ali bin man', 'Headquarters (HQ)', 'IT Support & Systems', 'Infrastructure', 'E2', 'Sarah Jenkins'],
    ['99104', 'James yong xian', 'Penang', 'Engineering', 'Quality Assurance', 'E3', 'Marcus Vance'],
    ['EBB05', 'Low chin hao', 'Johor Bahru', 'IT Support & Systems', 'Infrastructure', 'E2', 'Farhan Rahmat'],
    ['EBB30', 'Siti Aisyah', 'Headquarters (HQ)', 'Finance', 'Payroll', 'E1', 'Marcus Vance']
  ];
  const projects = ['Project Alpha (HCM Rebrand)', 'Internal System Maintenance', 'Client Portal Upgrade', 'Mobile HCM App', 'Payroll Validation', 'Policy Archive Cleanup', 'System Configuration'];
  const tasks = ['System Deployment', 'System Maintenance', 'Portal Upgrade', 'Setup', 'Testing', 'Review', 'Support'];
  const records = [];
  for (let month = 0; month < 10; month++) {
    employees.forEach(([empNo, name, branch, department, section, grade, supervisor], index) => {
      for (let activity = 0; activity < 2; activity++) {
        const project = (index + month + activity) % projects.length;
        records.push({
          id: `TSH-${month + 1}-${empNo}-${activity}`, empNo, name, branch, department, section, grade, supervisor,
          date: `2026-${String(month + 1).padStart(2, '0')}-${String(activity + 1).padStart(2, '0')}`,
          project: projects[project], task: tasks[(project + activity) % tasks.length], hours: 2 + ((index + month + activity) % 7) * 0.5
        });
      }
    });
  }
  window.TIMESHEET_HIGHLIGHT_DATA = records;
})();
