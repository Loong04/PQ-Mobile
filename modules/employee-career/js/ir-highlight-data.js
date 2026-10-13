(() => {
  const employees = [
    ['EBB12', 'Farhan Binti Rahmat'],
    ['EBB20', 'Daniel Wong'],
    ['EBB27', 'Aina Rahman'],
    ['EBB36', 'Nur Izzati'],
    ['EBB41', 'Daniel Lee'],
    ['EBB52', 'Jason Tan'],
    ['EBB61', 'Muhammad Hafiz']
  ];
  const cases = [
    [0, '2026-02-14', 'Late Attendance', 'Verbal Warning'],
    [0, '2026-05-03', 'Absenteeism', 'Written Warning'],
    [0, '2026-09-18', 'Misconduct', 'Show Cause Letter'],
    [1, '2026-03-22', 'Policy Breach', 'Counselling'],
    [1, '2026-08-11', 'Insubordination', 'Final Warning'],
    [2, '2026-01-19', 'Late Attendance', 'Verbal Warning'],
    [2, '2026-07-09', 'Negligence', 'Written Warning'],
    [3, '2026-04-15', 'Absenteeism', 'Show Cause Letter'],
    [3, '2026-10-02', 'Policy Breach', 'Counselling'],
    [4, '2026-06-07', 'Misconduct', 'Final Warning'],
    [4, '2026-09-26', 'Late Attendance', 'Written Warning'],
    [5, '2026-02-28', 'Safety Violation', 'Counselling'],
    [5, '2026-08-30', 'Negligence', 'Verbal Warning'],
    [6, '2026-05-21', 'Insubordination', 'Show Cause Letter']
  ];

  window.EMPLOYEE_CAREER_IR_CASE_DATA = cases.map(([employee, date, offence, action], index) => {
    const [empNo, name] = employees[employee];
    return { id: `IR-${String(index + 1).padStart(4, '0')}`, empNo, name, date, offence, action };
  });
})();
