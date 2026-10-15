// Preview evaluation record, matching the employee shown in Goal Plan.
// Replace this record with the evaluation service response when connected.
window.PERFORMANCE_SELF_EVALUATION = {
  employee: {
    name: 'Farhan Binti Rahmat',
    empNo: 'EBB12',
    position: 'Group HR Manager',
    department: 'Human Resource',
    supervisor: { name: 'Angeline Loren Alan', empNo: 'EBB04' },
    reportingTo: { name: 'Muhammad Ali Bin Man', empNo: 'EBB01' }
  },
  evaluationRef: 'SE-2026-0012',
  period: 'FY 2026A',
  type: 'Annual Appraisal',
  goals: [
    {
      title: 'Reduce Staff Attrition',
      weightage: 70,
      rating: 4,
      remark: 'Conducted staff satisfaction surveys and introduced flexible benefits to support retention.'
    },
    {
      title: 'Improve Staff Satisfaction',
      weightage: 30,
      rating: 4,
      remark: 'Reviewed survey findings quarterly and followed up on agreed workplace improvements.'
    }
  ],
  competencies: [
    {
      title: 'Leadership & People Management',
      weightage: 40,
      rating: 4,
      remark: 'Supported team development through regular coaching and clear performance expectations.'
    },
    {
      title: 'Communication & Collaboration',
      weightage: 35,
      rating: 4,
      remark: 'Worked closely with department leaders and communicated HR initiatives clearly.'
    },
    {
      title: 'Problem Solving & Decision Making',
      weightage: 25,
      rating: 3,
      remark: 'Used employee feedback and HR data to guide decisions and resolve operational issues.'
    }
  ]
};
