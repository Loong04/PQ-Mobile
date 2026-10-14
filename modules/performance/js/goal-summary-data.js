// Independent demonstration goals for the team summary until the goal service is connected.
// These preview percentages do not change the Goal Plan or Goal Progress records.
window.PERFORMANCE_GOAL_SUMMARY_DATA = (() => {
  const employees = {
    EBB12: { name: 'Farhan Binti Rahmat', company: 'PeopleHCM Malaysia', branch: 'Kuala Lumpur', department: 'Human Resource', job: 'Group HR Manager' },
    EBB03: { name: 'Nur Izzati', company: 'PeopleHCM Services', branch: 'Penang', department: 'Finance', job: 'Finance Analyst' },
    EBB02: { name: 'Daniel Wong', company: 'PeopleHCM Malaysia', branch: 'Johor Bahru', department: 'Product', job: 'Product Designer' },
    EBB01: { name: 'Aina Rahman', company: 'PeopleHCM Malaysia', branch: 'Kuala Lumpur', department: 'People Operations', job: 'People Operations Executive' }
  };
  const goals = [
    ['GS-001', 'EBB03', 'Financial', 'Improve reconciliation accuracy', 80, '2026', 'Annual Review'],
    ['GS-002', 'EBB03', 'Financial', 'Deliver finance reporting on time', 100, '2026', 'Annual Review'],
    ['GS-003', 'EBB02', 'Customer', 'Improve customer review outcomes', 60, '2026', 'Annual Review'],
    ['GS-004', 'EBB02', 'Customer', 'Strengthen customer feedback follow-up', 80, '2025', 'Annual Review'],
    ['GS-005', 'EBB01', 'Process', 'Streamline onboarding procedures', 50, '2026', 'Mid-Year Review'],
    ['GS-006', 'EBB01', 'Process', 'Improve documentation quality', 90, '2026', 'Annual Review'],
    ['GS-007', 'EBB02', 'Learning & Growth', 'Complete professional development', 75, '2026', 'Mid-Year Review'],
    ['GS-008', 'EBB12', 'People', 'Reduce Staff Attrition', 90, '2026', 'Annual Review'],
    ['GS-009', 'EBB12', 'People', 'Improve Staff Satisfaction', 80, '2026', 'Annual Review'],
    ['GS-010', 'EBB03', 'People', 'Improve team knowledge sharing', 100, '2026', 'Mid-Year Review']
  ];
  return goals.map(([id, empNo, goalType, title, achievedPercent, period, evaluationType]) => ({ id, empNo, ...employees[empNo], goalType, title, achievedPercent, period, evaluationType }));
})();
