(() => {
  // Demo exit events for the current 12-month reporting period.
  const today = new Date();
  const monthlyCounts = [2, 1, 3, 2, 2, 1, 3, 2, 1, 2, 2, 1];
  const names = ['Nadia Abdullah', 'Marcus Lim', 'Suresh Kumar', 'Nur Farhana', 'Adrian Lee', 'Amirah Hassan', 'Ravi Menon', 'Chloe Tan', 'Hakim Ismail', 'Melissa Wong', 'Aisyah Omar', 'Benjamin Chua', 'Farid Rahman', 'Priya Nair', 'Diana Low', 'Zul Ariffin', 'Sarah Goh', 'Imran Aziz', 'Hannah Teoh', 'Azlina Yusof', 'Kelvin Ng', 'Nur Syafiqah'];
  const profiles = [
    { branch: 'HEADQUARTERS (HQ)', department: 'HUMAN RESOURCE', section: 'People Operations', position: 'HR EXECUTIVE', skillGroup: 'Human Resources' },
    { branch: 'NORTHERN REGION BRANCH', department: 'FINANCE & ACCOUNTING', section: 'Financial Reporting', position: 'ACCOUNT EXECUTIVE', skillGroup: 'Finance' },
    { branch: 'SOUTHERN REGION BRANCH', department: 'OPERATIONS', section: 'Regional Operations', position: 'OPERATIONS SUPERVISOR', skillGroup: 'Operations' },
    { branch: 'EAST COAST BRANCH', department: 'SALES & MARKETING', section: 'Sales Support', position: 'SALES EXECUTIVE', skillGroup: 'Sales' },
    { branch: 'CENTRAL REGION BRANCH', department: 'INFORMATION TECHNOLOGY', section: 'Technology Services', position: 'SOFTWARE ENGINEER', skillGroup: 'Technology' },
    { branch: 'SABAH BRANCH', department: 'ADMINISTRATION', section: 'Office Administration', position: 'ADMIN EXECUTIVE', skillGroup: 'Administration' },
    { branch: 'SARAWAK BRANCH', department: 'PRODUCT & DESIGN', section: 'User Experience', position: 'PRODUCT DESIGNER', skillGroup: 'Design' }
  ];
  const reasons = ['Career Opportunity', 'Personal Reasons', 'Relocation', 'Retirement', 'Contract Completion', 'Mutual Separation'];
  const iso = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  let index = 0;
  window.EMPLOYEE_CAREER_ATTRITION_DATA = monthlyCounts.flatMap((count, monthIndex) => Array.from({ length: count }, (_, dayIndex) => {
    const profile = profiles[index % profiles.length];
    const day = monthIndex === 11 ? Math.min(3 + dayIndex * 7, today.getDate()) : 3 + dayIndex * 7;
    const row = {
      ...profile,
      empNo: 'EX' + String(index + 1).padStart(4, '0'),
      name: names[index],
      job: profile.position,
      reason: reasons[index % reasons.length],
      birthDate: iso(new Date(today.getFullYear() - 24 - (index * 3) % 29, 0, 15)),
      hireDate: iso(new Date(today.getFullYear() - 1 - index % 14, 1, 1)),
      exitDate: iso(new Date(today.getFullYear(), today.getMonth() - 11 + monthIndex, day))
    };
    index++;
    return row;
  }));
})();
