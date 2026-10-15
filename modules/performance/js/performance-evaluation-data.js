// Team evaluation preview records. Replace with the evaluation service when connected.
// Keep separate from the read-only Self Evaluation record and report datasets.
window.PERFORMANCE_EVALUATION_DATA = (() => {
  const base = structuredClone(window.PERFORMANCE_SELF_EVALUATION);
  const assignIds = (items, prefix) => items.map((item, index) => ({ ...item, id: `${prefix}-${index + 1}` }));
  const create = (id, company, employee, period, type, status, documentDate, remark, goals) => ({
    id, evaluationRef: id, company, employee, period, type, status, documentDate, remark,
    goals: assignIds(goals, 'goal'),
    competencies: assignIds(structuredClone(base.competencies), 'competency')
  });
  return [
    create('PE-2026-0012', 'PeopleHCM Malaysia', base.employee, base.period, base.type, 'In Progress', '12 Jan 2026',
      'Annual performance evaluation for FY 2026A.', base.goals),
    create('PE-2026-0003', 'PeopleHCM Services', {
      name: 'Nur Izzati', empNo: 'EBB03', position: 'Finance Analyst', department: 'Finance',
      supervisor: { name: 'Daniel Lee', empNo: 'EBB08' }, reportingTo: { name: 'Muhammad Ali Bin Man', empNo: 'EBB01' }
    }, 'FY 2026A', 'Annual Appraisal', 'Completed', '20 Feb 2026', 'Annual appraisal completed and acknowledged.', [
      { title: 'Improve Reconciliation Accuracy', weightage: 60, rating: 4, remark: 'Reviewed exceptions and improved monthly reconciliation checks.' },
      { title: 'Deliver Finance Reporting on Time', weightage: 40, rating: 4, remark: 'Completed monthly reporting within the agreed deadlines.' }
    ]),
    create('PE-2026-0002', 'PeopleHCM Malaysia', {
      name: 'Daniel Wong', empNo: 'EBB02', position: 'Product Designer', department: 'Product',
      supervisor: { name: 'Jason Tan', empNo: 'EBB52' }, reportingTo: { name: 'Daniel Lee', empNo: 'EBB08' }
    }, 'FY 2026A', 'Annual Appraisal', 'In Progress', '15 Feb 2026', 'Manager review is currently in progress.', [
      { title: 'Improve Customer Review Outcomes', weightage: 65, rating: 3, remark: 'Used customer feedback to refine product designs.' },
      { title: 'Strengthen Customer Feedback Follow-up', weightage: 35, rating: 4, remark: 'Tracked design feedback and followed up on agreed changes.' }
    ]),
    create('PE-2025-0001', 'PeopleHCM Malaysia', {
      name: 'Aina Rahman', empNo: 'EBB01', position: 'People Operations Executive', department: 'People Operations',
      supervisor: { name: 'Farhan Binti Rahmat', empNo: 'EBB12' }, reportingTo: { name: 'Angeline Loren Alan', empNo: 'EBB04' }
    }, 'FY 2025A', 'Mid-Year Review', 'Completed', '30 Jun 2025', 'Mid-year performance review completed.', [
      { title: 'Streamline Onboarding Procedures', weightage: 50, rating: 4, remark: 'Simplified onboarding checklists and coordinated new starter support.' },
      { title: 'Improve Documentation Quality', weightage: 50, rating: 3, remark: 'Updated employee guides and reviewed process documentation.' }
    ])
  ];
})();
