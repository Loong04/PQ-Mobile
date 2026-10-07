// Local preview fixtures. Summary figures and the visible employee rows are
// transcribed from the supplied screenshots. Their assignment to the existing
// demo company groups is for preview navigation, not a production association.
// Screenshots show only part of some employee lists: headcount is the supplied
// total, not the number of visible employee rows.
const manpowerWorkEmployees = [
  ['000054', 'Anderson ng', 'ACCOUNT EXECUTIVE'],
  ['000070', 'Yee seong liew', 'PAYABLES EXECUTIVE'],
  ['0099', 'Hanis', 'ADMIN EXECUTIVE'],
  ['500007', 'Tony', 'HR MANAGER'],
  ['500012', 'Sim', 'RECRUITMENT OFFICER'],
  ['EBB01', 'Muhammad ali bin man', 'OPERATION DIRECTOR'],
  ['JOF0023', 'Safiq ahmad', 'ACCOUNT EXECUTIVE']
].map(([empNo, name, jobTitle]) => ({ empNo, name, jobTitle, scheduledHours: 8, workHours: 0 }));
const manpowerNoWorkEmployees = [
  ['00012345', 'TEST', 'ACCOUNT EXECUTIVE'],
  ['012345', 'hey', 'BARTENDER'],
  ['620578', 'BHIM BAHADUR TAMANG', 'PRODUCTION OPERATOR'],
  ['620657', 'PRITIMAN GURUNG', 'PRODUCTION OPERATOR'],
  ['620675', 'HAFIZUR RAHMAN', 'OPERATION DIRECTOR'],
  ['620717', 'MD SHOHEL', 'PRODUCTION OPERATOR'],
  ['620803', 'SHER BAHADUR THAPA MAGAR', 'PRODUCTION OPERATOR']
].map(([empNo, name, jobTitle]) => ({ empNo, name, jobTitle }));
const manpowerOtEmployees = [
  ['0000101', 'Lee Soon Hock', 'ACCOUNT MANAGER'],
  ['000020', 'Tay siow kung', 'BFT & COM.EXECUTIVE'],
  ['000031', 'Navin', 'ACCOUNT EXECUTIVE'],
  ['000033', 'Philip', 'ACCOUNT EXECUTIVE'],
  ['000053', 'Tony stunk', 'BARISTA'],
  ['000072', 'Ang hin kee', 'BARISTA']
].map(([empNo, name, jobTitle]) => ({ empNo, name, jobTitle, hours: 1 }));

const manpowerPreviewDetails = {
  1: {
    workShift: [
      { id: 'shift-0700', shift: '0700:1500', headcount: 20, scheduledHours: 160, workHours: 0, employees: manpowerWorkEmployees }
    ]
  },
  2: {
    workShift: [
      { id: 'shift-0800', shift: '0800:1700(B)', headcount: 1, scheduledHours: 8, workHours: 0, employees: [
        { empNo: 'EBB02', name: 'Wong Kah Fai', jobTitle: 'HR EXECUTIVE', scheduledHours: 8, workHours: 0 }
      ] }
    ]
  },
  3: {
    noWork: [
      { id: 'no-work', shift: '', headcount: 13, employees: manpowerNoWorkEmployees }
    ]
  },
  4: {
    workShift: [
      { id: 'shift-0815', shift: '0815:1715', headcount: 2, scheduledHours: 16, workHours: 0, employees: [
        { empNo: 'EBB05', name: 'David Miller', jobTitle: 'MANAGER', scheduledHours: 8, workHours: 0 },
        { empNo: 'EBB06', name: 'Jessica Taylor', jobTitle: 'EXECUTIVE', scheduledHours: 8, workHours: 0 }
      ] },
      { id: 'shift-0830', shift: '0830:1730', headcount: 1, scheduledHours: 8, workHours: 0, employees: [
        { empNo: 'EBB04', name: 'Michael Chen', jobTitle: 'EXECUTIVE', scheduledHours: 8, workHours: 0 }
      ] }
    ],
    otPlan: [
      { id: 'ot-before', shift: '8.30:17.30W', otType: 'OT 1.5 BEFORE WORK', headcount: 30, hours: 30, employees: manpowerOtEmployees },
      { id: 'ot-15', shift: '8.30:17.30W', otType: '1.5 OT', headcount: 62, hours: 105, employees: [] }
    ]
  },
  5: {
    workShift: [
      { id: 'shift-w01', shift: '8.30:17.30W', headcount: 236, scheduledHours: 1888, workHours: 0, employees: [
        { empNo: '0000101', name: 'Lee Soon Hock', jobTitle: 'ACCOUNT MANAGER', scheduledHours: 8, workHours: 0 }
      ] }
    ],
    onLeave: [
      { id: 'leave-annual', shift: '8.30:17.30W', leaveType: 'ANNUAL LEAVE', headcount: 1, employees: [
        { empNo: 'EBB226', name: 'Azhar bin omar', jobTitle: 'PRODUCTION OPERATOR', leaveType: 'ANNUAL LEAVE', leaveDay: 1 }
      ] },
      { id: 'leave-unpaid', shift: '8.30:17.30W', leaveType: 'UNPAID LEAVE', headcount: 2, employees: [] }
    ]
  }
};

function getManpowerPreviewCounts(groupId) {
  const details = manpowerPreviewDetails[groupId] || {};
  return Object.fromEntries(['workShift', 'noWork', 'otPlan', 'onLeave'].map(type => [
    type, (details[type] || []).reduce((total, record) => total + record.headcount, 0)
  ]));
}
