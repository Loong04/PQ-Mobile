(() => {
  if (window.MANPOWER_STATISTICS_DATA) return;
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
  window.MANPOWER_STATISTICS_DATA = roles.flatMap(([jobType, total, department], roleIndex) => branches.map((branch, branchIndex) => ({
    company: companies[(roleIndex + branchIndex) % companies.length],
    branch, department, jobType,
    headcount: Math.floor(total / branches.length) + (branchIndex < total % branches.length ? 1 : 0),
    effectiveFrom: '2026-10-05'
  })));
})();
