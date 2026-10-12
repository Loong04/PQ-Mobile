(() => {
  // Demo snapshot, not live payroll data. The first six roles/counts are from the
  // supplied reference; the remaining roles and organization allocations are
  // illustrative, with the reference's 34 job types and 282 total headcount.
  const roles = [
    ['ACCOUNT EXECUTIVE', 48, 'FINANCE & ACCOUNTING'],
    ['ACCOUNT MANAGER', 12, 'FINANCE & ACCOUNTING'],
    ['ADMIN EXECUTIVE', 17, 'ADMINISTRATION'],
    ['ADMIN MANAGER', 10, 'ADMINISTRATION'],
    ['BANK TELLER OFFICER', 10, 'OPERATIONS'],
    ['BARISTA', 12, 'OPERATIONS'],
    ['BUSINESS ANALYST', 8, 'PRODUCT & DESIGN'],
    ['CASHIER', 9, 'OPERATIONS'],
    ['CUSTOMER SERVICE EXECUTIVE', 9, 'CUSTOMER SERVICE'],
    ['CUSTOMER SERVICE MANAGER', 4, 'CUSTOMER SERVICE'],
    ['DRIVER', 8, 'OPERATIONS'],
    ['FINANCE EXECUTIVE', 7, 'FINANCE & ACCOUNTING'],
    ['FINANCE MANAGER', 4, 'FINANCE & ACCOUNTING'],
    ['HR EXECUTIVE', 8, 'HUMAN RESOURCE'],
    ['HR MANAGER', 3, 'HUMAN RESOURCE'],
    ['IT EXECUTIVE', 6, 'INFORMATION TECHNOLOGY'],
    ['IT MANAGER', 3, 'INFORMATION TECHNOLOGY'],
    ['MARKETING EXECUTIVE', 7, 'SALES & MARKETING'],
    ['MARKETING MANAGER', 3, 'SALES & MARKETING'],
    ['OPERATIONS EXECUTIVE', 11, 'OPERATIONS'],
    ['OPERATIONS MANAGER', 4, 'OPERATIONS'],
    ['PAYROLL EXECUTIVE', 5, 'HUMAN RESOURCE'],
    ['PROCUREMENT EXECUTIVE', 6, 'PROCUREMENT'],
    ['PROCUREMENT MANAGER', 3, 'PROCUREMENT'],
    ['PROJECT EXECUTIVE', 7, 'PROJECT MANAGEMENT'],
    ['PROJECT MANAGER', 4, 'PROJECT MANAGEMENT'],
    ['RECEPTIONIST', 5, 'ADMINISTRATION'],
    ['SALES EXECUTIVE', 10, 'SALES & MARKETING'],
    ['SALES MANAGER', 5, 'SALES & MARKETING'],
    ['SECURITY OFFICER', 6, 'ADMINISTRATION'],
    ['SOFTWARE ENGINEER', 8, 'INFORMATION TECHNOLOGY'],
    ['STOREKEEPER', 6, 'OPERATIONS'],
    ['TECHNICIAN', 8, 'OPERATIONS'],
    ['WAREHOUSE ASSISTANT', 6, 'OPERATIONS']
  ];
  const branches = ['HEADQUARTERS (HQ)', 'NORTHERN REGION BRANCH', 'SOUTHERN REGION BRANCH'];
  const companies = ['PeopleHCM Sdn Bhd', 'PeopleHCM Services Sdn Bhd'];
  if (!window.MANPOWER_STATISTICS_DATA) {
    window.MANPOWER_STATISTICS_DATA = roles.flatMap(([jobType, total, department], roleIndex) => branches.map((branch, branchIndex) => ({
      company: companies[(roleIndex + branchIndex) % companies.length],
      branch, department, jobType,
      headcount: Math.floor(total / branches.length) + (branchIndex < total % branches.length ? 1 : 0),
      effectiveFrom: '2026-10-05'
    })));
  }

  if (window.MANPOWER_STATISTICS_STAFF) return;

  const referenceEmployees = [
    ['LBS001', 'Muhammad irsyad bin amran'],
    ['82828', 'Ewi robert'],
    ['000031', 'Navin'],
    ['000033', 'Philip'],
    ['000042', 'Daniel'],
    ['000041', 'Muazzin'],
    ['000043', 'Aliff'],
    ['000044', 'Tan'],
    ['000045', 'Cyrus'],
    ['000046', 'Goh']
  ];
  const givenNames = ['Aina', 'Amir', 'Chloe', 'Daniel', 'Farah', 'Hafiz', 'Izzati', 'Jason', 'Kavitha', 'Leon', 'Mei', 'Nadia'];
  const familyNames = ['Abdullah', 'Chan', 'Devi', 'Goh', 'Hassan', 'Ibrahim', 'Kaur', 'Lee', 'Lim', 'Rahman', 'Tan', 'Wong'];
  const round = value => Number(value.toFixed(2));

  function makeEmployee(row, aggregateIndex, employeeIndex) {
    const seed = aggregateIndex * 37 + employeeIndex;
    const reference = aggregateIndex === 0 ? referenceEmployees[employeeIndex] : null;
    const generatedNumber = String(100001 + aggregateIndex * 100 + employeeIndex).padStart(6, '0');
    const name = reference ? reference[1] : `${givenNames[seed % givenNames.length]} ${familyNames[(seed * 5 + aggregateIndex) % familyNames.length]}`;
    const hireYear = 2012 + (seed % 14);
    const birthYear = 1974 + (seed % 28);
    const month = String((seed % 12) + 1).padStart(2, '0');
    const day = String((seed % 27) + 1).padStart(2, '0');
    const metric = (minimum, maximum, multiplier) => round(minimum + ((seed * multiplier) % 101) / 100 * (maximum - minimum));

    return {
      empNo: reference ? reference[0] : generatedNumber,
      name,
      position: row.jobType,
      superior: row.jobType.includes('MANAGER') ? 'GROUP GENERAL MANAGER' : `${row.department} MANAGER`,
      job: row.jobType,
      jobType: row.jobType,
      company: row.company,
      branch: row.branch,
      base: row.branch === 'HEADQUARTERS (HQ)' ? 'KUALA LUMPUR' : row.branch,
      division: row.department === 'OPERATIONS' ? 'BUSINESS OPERATIONS' : 'CORPORATE SERVICES',
      department: row.department,
      section: row.jobType.replace(/ (EXECUTIVE|MANAGER|OFFICER|ASSISTANT)$/u, ''),
      costCenter: row.department,
      line: 'GENERAL',
      hireDate: `${hireYear}-${month}-${day}`,
      birthDate: `${birthYear}-${month}-${day}`,
      competencyPoints: metric(1, 10, 17),
      competencyMatchPercent: metric(0, 100, 29),
      basicPay: metric(1800, 10000, 43),
      incrementPercent: metric(0, 8, 11),
      bonusFactor: metric(0, 3, 7),
      attendancePercent: metric(70, 100, 19),
      monthlyOtHours: metric(0, 20, 13),
      trainingCost: metric(0, 2500, 23),
      performanceScore: metric(0, 100, 31),
      annualAttritionPercent: metric(0, 10, 5),
      effectiveFrom: row.effectiveFrom,
      ...(row.effectiveTo ? { effectiveTo: row.effectiveTo } : {})
    };
  }

  window.MANPOWER_STATISTICS_STAFF = window.MANPOWER_STATISTICS_DATA.flatMap((row, aggregateIndex) => (
    Array.from({ length: row.headcount }, (_, employeeIndex) => makeEmployee(row, aggregateIndex, employeeIndex))
  ));
})();
