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

window.TRAINING_STAFF_LEARNING_DEVELOPMENT = {
  employee: { empNo: 'EBB06', name: 'Mei Ling', position: 'Accounts Assistant' },
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

window.TRAINING_FEEDBACK_DATA = {
  records: [
    {
      id: 'leadership-crisis-feedback',
      course: 'Leadership & Crisis Management',
      trainingDate: '2026-06-16',
      startDate: '2026-06-15',
      endDate: '2026-06-16',
      description: 'Leadership workshop and crisis response simulation.',
      status: 'Pending'
    },
    {
      id: 'microsoft-feedback',
      course: 'Microsoft',
      trainingDate: '2026-09-24',
      startDate: '2026-09-23',
      endDate: '2026-09-24',
      description: 'Microsoft productivity tools and digital workflow training.',
      status: 'Completed',
      response: {
        remark: 'The Microsoft training was useful and easy to apply at work.',
        ratings: {
          'trainer-knowledge': 4,
          'trainer-preparation': 4,
          'trainer-participation': 4,
          'trainer-response': 4,
          'session-interest': 4
        },
        attachments: [],
        submittedAt: '2026-09-24T09:00:00.000Z'
      }
    }
  ],
  criteria: [
    { id: 'trainer-knowledge', text: 'The trainer was knowledgeable about the subject matter.' },
    { id: 'trainer-preparation', text: 'The trainer was well prepared and organized for the class.' },
    { id: 'trainer-participation', text: 'The trainer encouraged participation from the attendees.' },
    { id: 'trainer-response', text: 'The trainer was responsive to participants’ needs and questions.' },
    { id: 'session-interest', text: 'The trainer kept the session interesting and engaging.' }
  ]
};

window.TRAINING_CALENDAR_DATA = {
  initialMonth: '2026-10',
  events: [
    {
      id: 'microsoft-365-productivity',
      date: '2026-10-20',
      status: 'Approved',
      activity: 'Microsoft 365 Productivity',
      classDetails: {
        class: 'A01',
        description: 'Hands-on productivity training covering collaboration, documents and workflow tools.',
        courseTitle: 'Microsoft 365 Productivity',
        classStatus: 'Scheduled',
        start: '2026-10-20T09:00',
        end: '2026-10-20T17:00',
        venue: 'Training Room 3A',
        closingDate: '2026-10-16T17:00',
        trainer: 'Alicia Tan',
        capacity: '24 Participants',
        remark: 'Please bring a company laptop for the practical exercises.',
        attachment: 'Microsoft 365 Class Guide.pdf'
      },
      requestDetails: {
        documentReference: 'TR-2026-0108',
        documentStatus: 'Approved',
        employee: { empNo: 'EBB12', name: 'Farhan Binti Rahmat' },
        attendanceStatus: 'Registered',
        reason: 'Develop practical digital productivity and team collaboration skills.',
        requireTraveling: 'No',
        requireAccommodation: 'No',
        vegetarian: 'Yes',
        remark: 'Approved under the 2026 learning and development plan.',
        attendedHours: '0',
        attendanceRemark: 'Training has not started.',
        approverComments: 'Approved for the annual digital capability programme.'
      }
    },
    {
      id: 'effective-crisis-management',
      date: '2026-10-27',
      status: 'Submitted',
      activity: 'Effective Crisis Management',
      classDetails: {
        class: 'A02',
        description: 'Scenario-based workshop for managing operational incidents and stakeholder communication.',
        courseTitle: 'Effective Crisis Management',
        classStatus: 'Scheduled',
        start: '2026-10-27T08:30',
        end: '2026-10-27T16:30',
        venue: 'Leadership Centre, Level 8',
        closingDate: '2026-10-23T17:00',
        trainer: 'Daniel Wong',
        capacity: '18 Participants',
        remark: 'Pre-reading materials will be shared before the class.',
        attachment: 'Crisis Management Workbook.pdf'
      },
      requestDetails: {
        documentReference: 'TR-2026-0116',
        documentStatus: 'Approved',
        employee: { empNo: 'EBB12', name: 'Farhan Binti Rahmat' },
        attendanceStatus: 'Registered',
        reason: 'Strengthen leadership response during high-impact operational events.',
        requireTraveling: 'No',
        requireAccommodation: 'No',
        vegetarian: 'Yes',
        remark: 'Included in the leadership development plan.',
        attendedHours: '0',
        attendanceRemark: 'Training has not started.',
        approverComments: 'Approved as part of the leadership capability plan.'
      }
    }
  ]
};
