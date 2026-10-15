// Demonstration competency assignments and assessment history for the team report.
(() => {
  const definitions = [
    { id: 'effective-communication', title: 'Effective Communication', skillGroup: 'People Area', requiredLevel: 4, reference: 'COMP-COM-001',
      description: 'Communicates information clearly, listens actively and adapts messages to different stakeholders.',
      evidence: 'Clear written communication, constructive feedback and effective stakeholder presentations.' },
    { id: 'tunnel-engineering', title: 'Tunnel Engineering', skillGroup: 'Technical Area', requiredLevel: 4, reference: 'COMP-ENG-002',
      description: 'Applies tunnel engineering principles, evaluates ground conditions and follows safe construction practices.',
      evidence: 'Technical assessments, engineering reviews and practical application of safety standards.' },
    { id: 'leadership-management', title: 'Leadership & Management', skillGroup: 'Leadership Area', requiredLevel: 4, reference: 'COMP-LDR-003',
      description: 'Guides teams, sets clear priorities and supports employee development through sound decisions and coaching.',
      evidence: 'Team planning, coaching discussions, decision making and progress against agreed objectives.' }
  ];
  const assignments = [
    ['effective-communication', [0, 1, 2, 3, 4, 5], [4, 3, 4, 4, 3, 2]],
    ['tunnel-engineering', [0, 2, 4], [3, 3, 2]],
    ['leadership-management', [0, 1, 3], [4, 3, 4]]
  ];
  const records = assignments.flatMap(([competency, indexes, levels]) => indexes.map((index, offset) => {
    const employee = window.STAFF_COMPETENCY_DATA[index];
    const level = levels[offset];
    const lastAssessment = competency === 'tunnel-engineering' ? '2026-08-08' : '2026-09-15';
    return {
      ...employee, line: 'GENERAL', competency, level, firstCertification: '2024-09-16', lastAssessment,
      expiry: index === 4 ? '2026-11-30' : '2027-09-14', dueForRenewal: index === 4,
      assessments: [
        { date: lastAssessment, level, remarks: 'Demonstrates the competency in day-to-day work and applies feedback consistently.', assessor: 'Angeline Loren Alan' },
        { date: '2025-09-12', level: Math.max(1, level - 1), remarks: 'Completed the previous assessment; further practice and development were recommended.', assessor: 'Muhammad Ali Bin Man' }
      ]
    };
  }));
  const storageKey = 'peoplehcm.competencyAssessments.v1';
  const hasAssignment = (empNo, competency) => records.some(record => record.empNo === empNo && record.competency === competency);
  const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;

  function savedAssessments() {
    const raw = localStorage.getItem(storageKey);
    if (raw === null) return [];
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved) || !saved.every(item => item && typeof item.id === 'string'
      && hasAssignment(item.empNo, item.competency) && Number.isInteger(item.level) && item.level >= 1 && item.level <= 5
      && validDate(item.date) && typeof item.remarks === 'string' && item.remarks.length <= 2000
      && typeof item.assessor === 'string' && item.assessor.length <= 200)
      || new Set(saved.map(item => item.id)).size !== saved.length) throw new Error('Saved assessments could not be loaded. Please check browser storage and reload before saving.');
    return saved;
  }

  function applyAssessment(item) {
    const record = records.find(record => record.empNo === item.empNo && record.competency === item.competency);
    record.level = item.level;
    record.lastAssessment = item.date;
    record.assessments.unshift({ date: item.date, level: item.level, remarks: item.remarks, assessor: item.assessor });
  }

  let loadError = '';
  try { savedAssessments().forEach(applyAssessment); }
  catch { loadError = 'Saved assessments could not be loaded. Please check browser storage and reload before saving.'; }

  function submitAssessments(empNo, values) {
    if (loadError) throw new Error(loadError);
    if (!Array.isArray(values) || !values.length || values.some(item => !hasAssignment(empNo, item.competency)
      || !Number.isInteger(item.level) || item.level < 1 || item.level > 5)
      || new Set(values.map(item => item.competency)).size !== values.length) throw new Error('Select a current level between 1 and 5 for each competency.');
    const saved = savedAssessments();
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const assessor = window.STAFF_COMPETENCY_DATA.find(employee => employee.empNo === 'EBB12')?.name || 'Current User';
    const additions = values.map(item => ({ id: crypto.randomUUID(), empNo, competency: item.competency, level: item.level,
      date, remarks: 'Competency assessment submitted.', assessor }));
    localStorage.setItem(storageKey, JSON.stringify([...saved, ...additions]));
    additions.forEach(applyAssessment);
  }

  window.COMPETENCY_SUMMARY_DATA = { definitions, records, loadError, submitAssessments };
})();
