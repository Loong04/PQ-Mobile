(() => {
  const statuses = [
    { id: 'other', label: 'Other', count: 108, color: '#14b8a6' },
    { id: 'due-to-retire', label: 'Due to Retire', count: 77, color: '#475569' },
    { id: 'probation-overdue', label: 'Probation Overdue', count: 52, color: '#3b82f6' },
    { id: 'confirmed', label: 'Confirmed', count: 18, color: '#ec4899' },
    { id: 'contract-due', label: 'Contract Due', count: 14, color: '#f59e0b' },
    { id: 'temporary', label: 'Temporary', count: 5, color: '#65a30d' },
    { id: 'on-contract', label: 'On Contract', count: 4, color: '#d946ef' },
    { id: 'on-probation', label: 'On Probation', count: 3, color: '#6366f1' }
  ];

  const confirmedSamples = [
    ['000019', 'Tee ang lung', 'G5-BARISTA', 'ACCOUNT EXECUTIVE', 'ACCOUNTS', '25.92'],
    ['000023', 'Jason ling soon kam', 'G4-OFFICER', 'ACCOUNT EXECUTIVE', 'ACCOUNTS', '18.40'],
    ['000030', 'Andrew', 'G5-BARISTA', 'ACCOUNT EXECUTIVE', 'ACCOUNTS', '14.75'],
    ['000033', 'Robin anderson', 'G4-OFFICER', 'ADMIN EXECUTIVE - 3', 'ADMINISTRATION', '12.30'],
    ['000043', 'Tan', 'G5-BARISTA', 'ACCOUNT EXECUTIVE', 'ACCOUNTS', '10.20'],
    ['000045', 'Goh', 'G4-OFFICER', 'ACCOUNT EXECUTIVE', 'ACCOUNTS', '9.85'],
    ['A0001', 'Natasha thean mei hoi', 'G3-EXECUTIVE', 'HR MANAGER 3', 'HUMAN RESOURCE', '8.60'],
    ['CA800', 'Kavira kaur d/o mahinder', 'G4-OFFICER', 'ADMIN EXECUTIVE', 'ADMINISTRATION', '7.25'],
    ['EBB08', 'Norliza binti mohammad', 'G3-EXECUTIVE', 'GROUP FINANCE MANAGER', 'FINANCE & ACCOUNTING', '16.50'],
    ['EBB09', 'Crystal chong ya hui', 'G3-EXECUTIVE', 'PAYROLL EXECUTIVE', 'HUMAN RESOURCE', '6.80']
  ].map(([empNo, name, grade, position, department, serviceYears]) => ({
    status: 'confirmed',
    empNo,
    name,
    grade,
    position,
    superior: department === 'ACCOUNTS' || department === 'FINANCE & ACCOUNTING'
      ? 'GROUP FINANCE MANAGER'
      : department === 'HUMAN RESOURCE' ? 'GROUP HR MANAGER' : 'ADMINISTRATION MANAGER',
    job: position,
    company: 'PEOPLE QUEST SDN BHD',
    branch: 'TIMES SQUARE BRANCH',
    base: 'KUALA LUMPUR',
    division: 'CORPORATE SERVICES',
    department,
    section: department === 'HUMAN RESOURCE' ? 'PEOPLE OPERATIONS' : department,
    costCenter: department === 'HUMAN RESOURCE' ? 'HUMAN RESOURCE' : 'MANAGEMENT',
    line: 'GENERAL',
    serviceYears
  }));

  const givenNames = [
    'Aina', 'Amir', 'Chloe', 'Daniel', 'Farah', 'Hafiz', 'Izzati', 'Jason', 'Kavitha', 'Leon',
    'Mei', 'Nadia', 'Nurul', 'Ravi', 'Sabrina', 'Syafiq', 'Wei Ming', 'Yasmin', 'Zara', 'Zulkifli'
  ];
  const familyNames = [
    'Abdullah', 'Chan', 'Devi', 'Goh', 'Hassan', 'Ibrahim', 'Kaur', 'Lee', 'Lim', 'Rahman',
    'Tan', 'Wong', 'Ismail', 'Krishnan', 'Low', 'Mahmud', 'Nordin', 'Ong', 'Salleh', 'Yap'
  ];
  const organizations = [
    { division: 'CORPORATE SERVICES', department: 'FINANCE & ACCOUNTING', section: 'FINANCIAL REPORTING', costCenter: 'CC-FIN' },
    { division: 'CORPORATE SERVICES', department: 'HUMAN RESOURCE', section: 'PEOPLE OPERATIONS', costCenter: 'CC-HR' },
    { division: 'BUSINESS OPERATIONS', department: 'OPERATIONS', section: 'REGIONAL OPERATIONS', costCenter: 'CC-OPS' },
    { division: 'TECHNOLOGY', department: 'INFORMATION TECHNOLOGY', section: 'TECHNOLOGY SERVICES', costCenter: 'CC-IT' },
    { division: 'COMMERCIAL', department: 'SALES & MARKETING', section: 'SALES SUPPORT', costCenter: 'CC-SALES' },
    { division: 'CORPORATE SERVICES', department: 'ADMINISTRATION', section: 'OFFICE ADMINISTRATION', costCenter: 'CC-ADMIN' },
    { division: 'TECHNOLOGY', department: 'PRODUCT & DESIGN', section: 'USER EXPERIENCE', costCenter: 'CC-DESIGN' },
    { division: 'BUSINESS OPERATIONS', department: 'CUSTOMER SERVICE', section: 'CUSTOMER EXPERIENCE', costCenter: 'CC-CS' }
  ];
  const positions = [
    ['G2-EXECUTIVE', 'ACCOUNT EXECUTIVE'],
    ['G3-EXECUTIVE', 'HR EXECUTIVE'],
    ['G2-OFFICER', 'OPERATIONS OFFICER'],
    ['G3-EXECUTIVE', 'SOFTWARE ENGINEER'],
    ['G2-EXECUTIVE', 'SALES EXECUTIVE'],
    ['G2-OFFICER', 'ADMIN OFFICER'],
    ['G3-EXECUTIVE', 'PRODUCT DESIGNER'],
    ['G2-EXECUTIVE', 'CUSTOMER SERVICE EXECUTIVE']
  ];
  const branches = ['TIMES SQUARE BRANCH', 'HEADQUARTERS (HQ)', 'NORTHERN REGION BRANCH', 'SOUTHERN REGION BRANCH'];

  function generatedEmployee(status, statusIndex, employeeIndex) {
    const statusOffset = statuses.slice(0, statusIndex).reduce((total, item) => total + item.count, 0);
    const serial = statusOffset + employeeIndex + 1;
    const organization = organizations[(serial - 1) % organizations.length];
    const [grade, position] = positions[(serial - 1) % positions.length];
    const branch = branches[(serial - 1) % branches.length];
    return {
      status: status.id,
      empNo: `AH${String(serial).padStart(5, '0')}`,
      name: `${givenNames[(serial - 1) % givenNames.length]} ${familyNames[Math.floor((serial - 1) / givenNames.length) % familyNames.length]}`,
      grade,
      position,
      superior: `${organization.department} MANAGER`,
      job: position,
      company: 'PEOPLE QUEST SDN BHD',
      branch,
      base: branch === 'HEADQUARTERS (HQ)' || branch === 'TIMES SQUARE BRANCH' ? 'KUALA LUMPUR' : branch,
      division: organization.division,
      department: organization.department,
      section: organization.section,
      costCenter: organization.costCenter,
      line: 'GENERAL',
      serviceYears: (1 + (serial % 250) / 10).toFixed(2)
    };
  }

  const employees = statuses.flatMap((status, statusIndex) => {
    const samples = status.id === 'confirmed' ? confirmedSamples : [];
    return [
      ...samples,
      ...Array.from(
        { length: status.count - samples.length },
        (_, generatedIndex) => generatedEmployee(status, statusIndex, samples.length + generatedIndex)
      )
    ];
  });

  window.EMPLOYEE_CAREER_ACTIVE_HEADCOUNT = {
    asAt: '2026-10-12',
    statuses,
    employees
  };
})();
