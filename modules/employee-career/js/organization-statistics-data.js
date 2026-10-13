(() => {
  // Monthly sample snapshots for the frontend preview, not live organization data.
  const company = 'PEOPLE QUEST SDN BHD';
  const services = 'PEOPLE QUEST SERVICES SDN BHD';
  const units = [
    ['accounts', 'ACCOUNTS', company, 'Department', 10, 6],
    ['audit', 'AUDIT', company, 'Department', 8, 4],
    ['hr', 'HUMAN RESOURCES', company, 'Department', 6, 3],
    ['technology', 'TECHNOLOGY', company, 'Department', 12, 8],
    ['hq', 'HEADQUARTERS', company, 'Branch', 24, 5],
    ['pj', 'PETALING JAYA', company, 'Branch', 12, 7],
    ['payroll', 'PAYROLL', company, 'Section', 4, 5],
    ['recruitment', 'RECRUITMENT', company, 'Section', 2, 2],
    ['finance', 'FINANCE', services, 'Department', 5, 4],
    ['operations', 'OPERATIONS', services, 'Department', 15, 9],
    ['penang', 'PENANG', services, 'Branch', 20, 8]
  ];
  const records = [];
  for (let index = 0; index < 12; index++) {
    const month = new Date(Date.UTC(2025, 10 + index, 1)).toISOString().slice(0, 7);
    units.forEach(([unitId, unit, companyName, orgUnitType, baseCount, baseOvertime], unitIndex) => {
      const headcount = baseCount + Math.floor(index / 4);
      records.push({ unitId, unit, company: companyName, orgUnitType, period: month, headcount,
        mcDays: headcount * (0.5 + unitIndex * 0.1 + index % 3 * 0.1),
        overtimeHours: headcount * (baseOvertime + index % 3),
        lateHours: headcount * (0.75 + unitIndex * 0.15 + index % 4 * 0.25),
        absentDays: headcount * (0.2 + unitIndex * 0.04 + index % 2 * 0.1),
        absentOvertime: headcount * (0.1 + unitIndex * 0.02 + index % 3 * 0.05),
        absentTraining: headcount * (0.05 + unitIndex * 0.01 + index % 2 * 0.05) });
    });
  }
  window.ORGANIZATION_STATISTICS_DATA = records;
})();
