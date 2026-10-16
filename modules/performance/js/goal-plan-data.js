window.PERFORMANCE_GOAL_PLAN = {
  employee: {
    name: 'Farhan Binti Rahmat',
    empNo: 'EBB12',
    position: 'Group HR Manager',
    department: 'Human Resource',
    supervisor: { name: 'Angeline Loren Alan', empNo: 'EBB04' },
    reportingTo: { name: 'Muhammad Ali Bin Man', empNo: 'EBB01' }
  },
  period: 'FY 2026A',
  appraisalType: 'Annual Appraisal',
  status: 'Draft',
  goalTypes: ['Financial', 'Customer', 'Process', 'Learning & Growth', 'People'],
  competencyTypes: ['Core', 'Functional', 'Leadership'],
  competencies: [
    { id: 'COMP-2026-001', title: 'Leadership & People Management', weightage: 40, rating: 4, remark: 'Supported team development through regular coaching and clear performance expectations.' },
    { id: 'COMP-2026-002', title: 'Communication & Collaboration', weightage: 35, rating: 4, remark: 'Communicated clearly and collaborated effectively across departments.' },
    { id: 'COMP-2026-003', title: 'Problem Solving & Decision Making', weightage: 25, rating: 4, remark: 'Used feedback and HR data to make sound and practical decisions.' }
  ],
  goals: [
    {
      id: 'GOAL-2026-001',
      title: 'Reduce Staff Attrition',
      type: 'People',
      description: 'Reduce annual staff attrition through stronger retention planning and manager follow-up.',
      targetDescription: 'Base Target: 10%\nStretch Target: 8%',
      deadline: '2026-12-31',
      weightage: 70,
      budgetHours: 0,
      remark: 'Conduct staff satisfaction survey and implement flexible benefits.'
    },
    {
      id: 'GOAL-2026-002',
      title: 'Improve Staff Satisfaction',
      type: 'People',
      description: 'Increase employee satisfaction across key workplace experience measures.',
      targetDescription: 'Base Target: 95%\nStretch Target: 100%',
      deadline: '2026-12-31',
      weightage: 30,
      budgetHours: 16,
      remark: 'Review survey findings quarterly and track agreed improvements.'
    }
  ]
};
