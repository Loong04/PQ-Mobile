/* Preview data based on the supplied Policy / SOP reference screen. */
window.ADMIN_POLICY = {
  defaults: {
    reference: '', title: '', department: '',
    policyFrom: '2016-09-01', policyTo: '2100-12-31',
    sopFrom: '2016-09-01', sopTo: '2100-12-31',
    guidelineFrom: '2016-09-01', guidelineTo: '2100-12-31'
  },
  records: [{
    id: 'check-title', reference: 'POL-001', title: 'CHECK TITLE',
    department: 'ADMINISTRATION',
    policyWEF: '2024-12-20', sopWEF: '', guidelineWEF: '',
    filename: 'PeopleTime_UserGuide_v2.pdf',
    preview: '../assets/peopletime-user-guide-preview.svg'
  }]
};
