// Reference records for the UI preview; replace through the history data provider when connected.
window.EMPLOYEE_CAREER_HISTORY_DATA = {
  feedback: [
    { id: 'feedback-1', empNo: 'EBB12', name: 'Farhan binti rahmat', type: 'Suggestion', category: 'General', title: 'abc', feedbackDate1: '2026-05-01', feedbackDate2: '', note: 'test', remarks: '', submitDate: '2026-05-28', reviewerComment: '', reviewedBy: '', reviewedDate: '', rating: 0, reward: '', attachments: [] },
    { id: 'feedback-2', empNo: 'EBB12', name: 'Farhan binti rahmat', type: 'Wrong Data', category: 'Personal Data', title: 'Bank account number is wrong', feedbackDate1: '2025-12-31', feedbackDate2: '', note: 'Bank account number is wrong', remarks: '', submitDate: '2025-12-31', reviewerComment: '', reviewedBy: '', reviewedDate: '', rating: 0, reward: '', attachments: [] },
    { id: 'feedback-3', empNo: 'EBB12', name: 'Farhan binti rahmat', type: 'Wrong Data', category: 'Personal Data', title: 'hi', feedbackDate1: '2025-12-31', feedbackDate2: '', note: 'hi', remarks: '', submitDate: '2025-12-31', reviewerComment: '', reviewedBy: '', reviewedDate: '', rating: 0, reward: '', attachments: [] }
  ],
  whereabout: [
    { id: 'whereabout-1', description: 'Gffrfff', date: '2026-10-06', startTime: '00:00', endTime: '00:00', project: 'HRDF TRAINING', task: 'POC', state: 'JOHOR', remarks: '' }
  ],
  'career-plan': [
    {
      id: 'career-plan-1', empNo: 'EBB01', name: 'Aina Rahman', position: 'People Operations Executive', department: 'People & Culture',
      careerPath: 'Leadership', nextPosition: 'Team Lead', targetDate: '2027-03-31',
      justification: 'Build the leadership skills needed to lead the People Operations team.',
      actionPlan: 'Complete leadership training.\nLead the onboarding improvement project.\nReview progress with the manager each month.',
      developmentNeeds: 'Team leadership, coaching, project planning and stakeholder communication.',
      remarks: 'Discuss training opportunities and project milestones during the next development review.',
      submitDate: '2026-10-13', status: 'Submitted', attachments: [{ name: 'career-development-plan.pdf' }]
    },
    {
      id: 'career-plan-2', empNo: 'EBB01', name: 'Aina Rahman', position: 'People Operations Executive', department: 'People & Culture',
      careerPath: 'Specialist', nextPosition: 'Senior Specialist', targetDate: '2027-06-30',
      justification: 'Develop deeper expertise in employee experience and people operations.',
      actionPlan: 'Complete the employee experience course.\nDocument core People Operations processes.\nPresent improvement recommendations to the department.',
      developmentNeeds: 'People analytics, process improvement and specialist mentoring.',
      remarks: 'Approved for the next development cycle with quarterly progress reviews.',
      submitDate: '2026-09-15', status: 'Approved', attachments: []
    }
  ]
};
