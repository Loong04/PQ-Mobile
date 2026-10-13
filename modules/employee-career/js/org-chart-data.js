window.EMPLOYEE_CAREER_ORG_CHART = {
  id: 'alex',
  name: 'Alex Wong',
  empNo: 'EBB01',
  position: 'Group HR Manager',
  unit: 'Executive',
  age: 38,
  serviceYears: 6.5,
  status: 'active',
  initials: 'AW',
  tone: 'violet',
  children: [
    {
      id: 'siti', name: 'Siti Nurhaliza', empNo: 'EBB05', position: 'Senior HR Executive', unit: 'Human Resource', age: 32, serviceYears: 4.2, status: 'active', initials: 'SN', tone: 'rose',
      children: [
        { id: 'kavitha', name: 'Kavitha A/P Gopal', empNo: 'EBB19', position: 'HR Administrator', unit: 'Human Resource', age: 27, serviceYears: 2, status: 'active', initials: 'KG', tone: 'blue' },
        { id: 'danial', name: 'Danial Ariff', empNo: 'EBB22', position: 'Training Coordinator', unit: 'Learning & Development', age: 29, serviceYears: 1.5, status: 'resigned', initials: 'DA', tone: 'slate' }
      ]
    },
    {
      id: 'ahmad', name: 'Ahmad Razak', empNo: 'EBB08', position: 'Payroll Officer', unit: 'Payroll', age: 35, serviceYears: 5, status: 'active', initials: 'AR', tone: 'emerald',
      children: [
        { id: 'lee', name: 'Lee Jia Ling', empNo: 'EBB25', position: 'Junior Payroll Assistant', unit: 'Payroll', age: 24, serviceYears: 0.8, status: 'active', initials: 'LJ', tone: 'cyan' },
        { id: 'vacant-payroll', name: 'Vacant Position', position: 'Payroll Assistant', unit: 'Payroll', status: 'vacant', initials: 'VP', tone: 'amber' }
      ]
    },
    {
      id: 'tan', name: 'Tan Wei Lun', empNo: 'EBB14', position: 'Talent Acquisition Specialist', unit: 'Talent Acquisition', age: 30, serviceYears: 3.5, status: 'active', initials: 'TW', tone: 'violet',
      children: [
        { id: 'aina', name: 'Nur Aina', empNo: 'EBB30', position: 'Recruitment Coordinator', unit: 'Talent Acquisition', age: 25, serviceYears: 1.2, status: 'active', initials: 'NA', tone: 'pink' }
      ]
    },
    { id: 'nurul', name: 'Nurul Aishah', empNo: 'EBB27', position: 'Compensation & Benefits Executive', unit: 'Rewards', age: 33, serviceYears: 4, status: 'resigned', initials: 'NA', tone: 'slate' },
    { id: 'marcus', name: 'Marcus Chen', empNo: 'EBB31', position: 'HRIS Analyst', unit: 'HR Technology', age: 28, serviceYears: 2.1, status: 'active', initials: 'MC', tone: 'sky' }
  ]
};
