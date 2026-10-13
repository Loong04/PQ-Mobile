// Readable records from the supplied CV history screenshots, used by the UI preview.
window.EMPLOYEE_CAREER_CV_HISTORY_DATA = window.EMPLOYEE_CAREER_CV_HISTORY_DATA || (() => {
  const changed = value => ({value, changed: true});
  // Fictional preview data for history records whose original screenshots had no profile details.
  const exampleProfile = {
    personal: {
      'Name': 'Farhan binti rahmat', 'Birth Date': '18 Jul 1984',
      'Personal Email': changed('farhan.rahmat@example.com'),
      'Marital Status': 'Married', 'Marriage Date': '12 Jun 2010',
      'Passport #': 'DEMO-PASSPORT-01', 'Passport Expiry': '18 Jul 2024',
      'Driving License': 'Class D', 'Driving License Expiry': '18 Jul 2023',
      'Key Level': 'Management'
    },
    qualification: {
      'Qualification': "Bachelor's Degree", 'Description': 'Bachelor of Business Administration',
      'Major': 'Human Resource Management', 'Institute': 'Universiti Malaya',
      'Other Institute Name': '', 'CGPA': '3.62', 'Certificate #': 'DEMO-QUAL-001',
      'Year From': 2003, 'Year To': 2006, 'Highest': 'Yes', 'Notes': 'Graduated with honours.'
    },
    payroll: {
      'EPF #': 'DEMO-EPF-001', 'Socso #': 'DEMO-SOCSO-001', 'Tax #': 'DEMO-TAX-001',
      'Tabung Haji #': '', 'ASB #': '', 'Spouse EPF #': 'DEMO-EPF-002',
      'Spouse Tax #': 'DEMO-TAX-002', 'Bank': 'CIMB', 'Account #': 'DEMO-ACCOUNT-001',
      'Handicap?': 'No', 'Spouse Handicap?': 'No', 'Spouse Working?': 'Yes'
    },
    contacts: {
      'Company Email': 'farhan.rahmat@peoplehcm.example', 'Phone #': '03-0000 0101',
      'Mobile #': changed('012-000 0101'), 'Address': '12, Jalan Contoh\nTaman Contoh',
      'Postal Code': '47300', 'City': 'Petaling Jaya', 'State': 'SELANGOR', 'Country': 'MALAYSIA',
      'Emergency Contact #': '012-000 0102', 'Contact Name': 'Ahmad Rahmat',
      'Contact Address': '12, Jalan Contoh\nTaman Contoh', 'Contact Postal Code': '47300',
      'Contact City': 'Petaling Jaya', 'Contact State': 'SELANGOR', 'Contact Country': 'MALAYSIA',
      'Remarks': 'Husband — emergency contact'
    },
    family: {
      deleted: [],
      existing: [{name: 'Ahmad Rahmat', relation: 'HUSBAND'}, {name: 'Nur Aina', relation: 'DAUGHTER'}]
    }
  };
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
    profile: number === 100 ? approvedProfile : {
      ...exampleProfile,
      personal: {
        ...exampleProfile.personal,
        'Age': Number(submittedAt.slice(0, 4)) - 1984 - (submittedAt.slice(5) < '07-18' ? 1 : 0)
      }
    }
  }));
})();
