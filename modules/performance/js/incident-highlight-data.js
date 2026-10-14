// Preview team incidents. Reuse Work Incident's existing records without changing that source.
// Organization fields and the additional team records are demonstration data until the service is connected.
window.PERFORMANCE_INCIDENT_HIGHLIGHT_DATA = [
  ...(window.PERFORMANCE_WORK_INCIDENTS || []).map(record => ({
    ...record, company: 'PeopleHCM Malaysia', branch: 'Kuala Lumpur', department: 'Sales', position: 'Account Executive'
  })),
  {
    reference: 'WI-2026-0010', empNo: 'EBB02', name: 'Daniel Wong', company: 'PeopleHCM Malaysia', branch: 'Johor Bahru', department: 'Product', position: 'Product Designer',
    incidentDate: '2026-10-11', createdDate: '2026-10-11T15:20', incidentType: 'Commendation', incidentAction: 'Recognition', measureValue: '1 client delivery',
    merit: true, point: 4, remarks: 'Delivered the client review ahead of the agreed deadline.', attachments: []
  },
  {
    reference: 'WI-2026-0009', empNo: 'EBB02', name: 'Daniel Wong', company: 'PeopleHCM Malaysia', branch: 'Johor Bahru', department: 'Product', position: 'Product Designer',
    incidentDate: '2026-10-08', createdDate: '2026-10-08T09:30', incidentType: 'Attendance', incidentAction: 'Reminder', measureValue: '10 minutes',
    merit: false, point: -1, remarks: 'Attendance reminder recorded.', attachments: []
  },
  {
    reference: 'WI-2026-0008', empNo: 'EBB03', name: 'Nur Izzati', company: 'PeopleHCM Services', branch: 'Penang', department: 'Finance', position: 'Finance Analyst',
    incidentDate: '2026-10-10', createdDate: '2026-10-10T11:45', incidentType: 'Initiative', incidentAction: 'Recognition', measureValue: '1 reporting improvement',
    merit: true, point: 2, remarks: 'Improved the reconciliation checklist.', attachments: []
  },
  {
    reference: 'WI-2026-0007', empNo: 'EBB03', name: 'Nur Izzati', company: 'PeopleHCM Services', branch: 'Penang', department: 'Finance', position: 'Finance Analyst',
    incidentDate: '2026-10-07', createdDate: '2026-10-07T16:00', incidentType: 'Safety', incidentAction: 'Warning', measureValue: '1 procedure breach',
    merit: false, point: -4, remarks: 'Procedure review and follow-up training arranged.', attachments: []
  }
];
