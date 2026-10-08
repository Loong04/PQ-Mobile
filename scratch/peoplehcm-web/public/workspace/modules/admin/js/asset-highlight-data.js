/* Preview allocations, kept separate so a live asset feed can replace them. Values are stored in cents. */
(function () {
  const employees = [
    ['EBB01', 'Muhammad ali bin man', 'Headquarters (HQ)', 'IT Support & Systems'],
    ['EBB05', 'Low chin hao', 'Johor Bahru', 'IT Support & Systems'],
    ['EBB12', 'Farhan binti rahmat', 'Headquarters (HQ)', 'Human Resource'],
    ['EBB27', 'Aina Rahman', 'Headquarters (HQ)', 'Finance'],
    ['EBB30', 'Siti Aisyah', 'Headquarters (HQ)', 'Finance'],
    ['EBB36', 'Nur Izzati', 'Johor Bahru', 'Human Resource'],
    ['EBB41', 'Daniel Lee', 'Penang', 'IT Support & Systems'],
    ['99104', 'James yong xian', 'Penang', 'Engineering']
  ];
  const allocations = [
    [0, 'Laptop', 'Dell Latitude laptop', 420000, '2026-09-01'],
    [0, 'Monitor', 'Dell 27-inch monitor', 85000, '2026-10-01'],
    [0, 'Accessories', 'Wireless keyboard and mouse', 12000, '2026-10-01'],
    [1, 'Laptop', 'HP ProBook laptop', 380000, '2026-09-01'],
    [1, 'Monitor', 'HP 24-inch monitor', 65000, '2026-10-01'],
    [2, 'Laptop', 'Lenovo ThinkPad laptop', 320000, '2026-09-01'],
    [2, 'Monitor', 'Lenovo 24-inch monitor', 75000, '2026-10-01'],
    [3, 'Laptop', 'Dell Vostro laptop', 280000, '2026-09-01'],
    [4, 'Laptop', 'HP ProBook laptop', 260000, '2026-10-01'],
    [5, 'Laptop', 'Lenovo ThinkPad laptop', 230000, '2026-10-01'],
    [6, 'Laptop', 'Dell Latitude laptop', 450000, '2026-10-01'],
    [7, 'Laptop', 'HP EliteBook laptop', 390000, '2026-10-01']
  ];
  window.WORKPLACE_ASSET_DATA = allocations.map(([employee, assetType, description, valueCents, effectiveDate], index) => {
    const [empNo, name, branch, department] = employees[employee];
    return { id: `AST-${String(index + 1).padStart(4, '0')}`, empNo, name, branch, department, company: employee < 4 ? 'PeopleHCM Sdn Bhd' : 'PQ Services Sdn Bhd', assetType, description, valueCents, effectiveDate, count: 1 };
  });
})();
