window.TRAINING_COMPETENCY_INDIVIDUAL = {
  employee: {
    empNo: 'EBB12',
    name: 'Farhan Binti Rahmat',
    position: 'Group HR Manager',
    department: 'Human Resource'
  },
  competencies: [
    {
      id: 'effective-communication',
      skill: 'Effective Communication',
      currentLevel: '4',
      needLevel: '4',
      gap: '0',
      lastAssessmentDate: '2026-09-15',
      skillExpiryDate: '2027-09-14',
      remarks: 'Consistently communicates clearly across teams.',
      assessments: [
        {
          assessmentDate: '2026-09-15',
          level: '4',
          remark: 'Demonstrates strong stakeholder communication.',
          assessor: 'Angeline Loren Alan'
        },
        {
          assessmentDate: '2025-09-12',
          level: '3',
          remark: 'Good communication with room to improve facilitation.',
          assessor: 'Muhammad Ali Bin Man'
        }
      ]
    },
    {
      id: 'tunnel-engineering',
      skill: 'Tunnel Engineering',
      currentLevel: '3',
      needLevel: '4',
      gap: '-1',
      lastAssessmentDate: '2026-08-08',
      skillExpiryDate: '2027-08-07',
      remarks: 'Developing capability for complex ground conditions.',
      assessments: [
        {
          assessmentDate: '2026-08-08',
          level: '3',
          remark: 'Applies core tunnel engineering principles independently.',
          assessor: 'Daniel Wong'
        },
        {
          assessmentDate: '2025-07-19',
          level: '2',
          remark: 'Requires guidance for complex ground conditions.',
          assessor: 'Angeline Loren Alan'
        }
      ]
    }
  ]
};

window.TRAINING_COMPETENCY_COURSES = [
  {
    id: 'microsoft',
    title: 'Microsoft',
    effectiveDate: '2026-10-20',
    courseCategory: 'Digital Skills',
    trainingType: 'Online',
    developmentArea: 'Technology',
    hasOpenClass: true,
    onlineCourse: true,
    duration: '2 Days',
    bondPeriod: 'No Bond'
  },
  {
    id: 'effective-crisis-management',
    title: 'Effective Crisis Management',
    effectiveDate: '2026-11-05',
    courseCategory: 'Leadership',
    trainingType: 'Classroom',
    developmentArea: 'Leadership & Management',
    hasOpenClass: false,
    onlineCourse: false,
    duration: '1 Day',
    bondPeriod: '6 Months'
  }
];

window.TRAINING_LEARNING_DEVELOPMENT = {
  period: '2026',
  periodStart: '2026-01-01',
  description: 'Annual Learning & Development Plan',
  activities: [
    {
      id: 'leadership-crisis',
      activity: 'Leadership & Crisis Management',
      budgetHours: 24,
      deadline: '2026-12-31',
      reviewMonths: 3,
      reviewDue: '2026-10-31',
      records: [
        { id: 'leadership-workshop', start: '2026-03-02', end: '2026-03-03', hours: 6, progress: 25, remarks: 'Completed the leadership workshop and practised team coaching.' },
        { id: 'crisis-simulation', start: '2026-06-15', end: '2026-06-16', hours: 8, progress: 50, remarks: 'Applied the crisis response framework in a team simulation.' }
      ]
    },
    {
      id: 'hr-analytics',
      activity: 'HR Analytics & Reporting',
      budgetHours: 18,
      deadline: '2026-11-30',
      reviewMonths: 1,
      reviewDue: '2026-10-31',
      records: [
        { id: 'analytics-foundation', start: '2026-04-06', end: '2026-04-07', hours: 4, progress: 30, remarks: 'Completed the analytics foundation module and built a sample HR report.' }
      ]
    }
  ]
};
