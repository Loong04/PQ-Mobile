// Readable records from the supplied CV history screenshots, used by the UI preview.
window.EMPLOYEE_CAREER_CV_HISTORY_DATA = window.EMPLOYEE_CAREER_CV_HISTORY_DATA || (() => {
  const changed = value => ({value, changed: true});
  const approvedProfile = {
    personal: {
      'Name': changed('SITI NURHALIZA BTE RAHMAN'),
      'Birth Date': changed('22 Apr 1960'),
      'Age': 0,
      'Personal Email': '',
      'Marital Status': changed('Married'),
      'Marriage Date': changed('17 Jul 1984'),
      'Passport #': changed('A212222048'),
      'Passport Expiry': changed('25 Mar 2015'),
      'Driving License': '',
      'Driving License Expiry': '',
      'Key Level': ''
    },
    qualification: {
      'Qualification': '', 'Description': '', 'Major': '', 'Institute': '',
      'Other Institute Name': '', 'CGPA': '0.00', 'Certificate #': '',
      'Year From': 0, 'Year To': 0, 'Highest': 'No', 'Notes': ''
    },
    payroll: {
      'EPF #': '', 'Socso #': '', 'Tax #': '', 'Tabung Haji #': '', 'ASB #': '',
      'Spouse EPF #': '', 'Spouse Tax #': '', 'Bank': 'CIMB',
      'Account #': changed('10447856855254'), 'Handicap?': 'No',
      'Spouse Handicap?': changed('Yes'), 'Spouse Working?': changed('Yes')
    },
    contacts: {
      'Company Email': changed('th.yew@peoplequest.com.my'),
      'Phone #': changed('012-3512223'), 'Mobile #': changed('02-79560000'),
      'Address': '10, JALAN UPTOWN 2\n#05-33- JALAN 2228\nDAMANSARA KOTA',
      'Postal Code': '40860', 'City': 'Damansara', 'State': 'SELANGOR', 'Country': 'MALAYSIA',
      'Emergency Contact #': changed('04-6677778'), 'Contact Name': changed('RAZALI'),
      'Contact Address': 'AS CORRESPONDENCE ADDRESS', 'Contact Postal Code': '',
      'Contact City': '', 'Contact State': '', 'Contact Country': 'MALAYSIA', 'Remarks': changed('FATHER')
    },
    family: {
      deleted: [],
      existing: [
        {name: 'TAI KIM CHUAN', relation: 'BROTHER', changed: true},
        {name: 'ABU KADIR BIN MAHMUD', relation: 'HUSBAND', changed: true}
      ]
    }
  };
  return [
    [98, '2019-11-13', 'Cancelled'], [99, '2019-11-13', 'Cancelled'],
    [100, '2019-11-13', 'Approved'], [101, '2020-01-05', 'Cancelled'],
    [102, '2020-01-05', 'Cancelled'], [103, '2020-03-30', 'Cancelled'],
    [110, '2020-05-14', 'Cancelled'], [104, '2020-07-13', 'Cancelled'],
    [224, '2021-08-09', 'Approved'], [225, '2021-08-09', 'Approved']
  ].map(([number, submittedAt, status]) => ({
    id: 'ECR' + String(number).padStart(16, '0'),
    reference: 'ECR' + String(number).padStart(16, '0'),
    title: 'CV Change Request', name: 'Farhan binti rahmat', empNo: 'EBB12',
    submittedAt, status, changes: [],
    approverRemarks: number === 100 ? 'redo' : '',
    profile: number === 100 ? approvedProfile : {}
  }));
})();
