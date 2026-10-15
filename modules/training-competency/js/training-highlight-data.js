// Independent sample training attendance; replace with the training reporting service when connected.
window.TRAINING_HIGHLIGHT_DATA = (() => {
  const employees = {
    EBB12: { name: 'Farhan Binti Rahmat', branch: 'Kuala Lumpur', department: 'Human Resource', position: 'Group HR Manager' },
    EBB03: { name: 'Nur Izzati', branch: 'Penang', department: 'Finance', position: 'Finance Analyst' },
    EBB02: { name: 'Daniel Wong', branch: 'Johor Bahru', department: 'Product', position: 'Product Designer' },
    EBB01: { name: 'Aina Rahman', branch: 'Kuala Lumpur', department: 'People Operations', position: 'People Operations Executive' }
  };
  const sessions = [
    ['TH-001', 'EBB12', '2026-08-12', 'Channel Assembly', 'Technical Skills', 1],
    ['TH-002', 'EBB12', '2026-09-18', 'Bolt Fitment', 'Technical Skills', 1],
    ['TH-003', 'EBB12', '2026-10-02', 'Effective Crisis Management', 'Leadership & Management', 2],
    ['TH-004', 'EBB03', '2026-09-10', 'Microsoft', 'Technology', 2],
    ['TH-005', 'EBB03', '2026-10-05', 'HR Analytics', 'Technology', 1],
    ['TH-006', 'EBB02', '2026-08-20', 'Channel Assembly', 'Technical Skills', .5],
    ['TH-007', 'EBB02', '2026-09-18', 'Bolt Fitment', 'Technical Skills', 1.5],
    ['TH-008', 'EBB01', '2026-09-01', 'Effective Communication', 'Communication', 1],
    ['TH-009', 'EBB01', '2026-10-09', 'Microsoft', 'Technology', 2]
  ];
  return sessions.map(([id, empNo, date, courseTitle, developmentArea, days]) => ({ id, empNo, ...employees[empNo], date, courseTitle, developmentArea, days }));
})();
