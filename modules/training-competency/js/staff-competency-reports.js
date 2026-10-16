(() => {
  'use strict';
  const number = value => value === '' || value == null || !Number.isFinite(Number(value)) ? null : Number(value);
  const date = value => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const timestamp = Date.parse(`${value}T00:00:00Z`);
    return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value ? timestamp : null;
  };
  const inRange = (value, min, max) => (min === '' || min == null || (value != null && value >= Number(min)))
    && (max === '' || max == null || (value != null && value <= Number(max)));
  function yearsSince(value, today) {
    if (date(value) == null || date(today) == null || value > today) return null;
    return Number(today.slice(0, 4)) - Number(value.slice(0, 4)) - (today.slice(5) < value.slice(5) ? 1 : 0);
  }
  function matches(employee, filters) {
    const query = String(filters.keyword || '').trim().toLowerCase().replace(/^#+/, '');
    return (!query || [employee.name, employee.empNo, employee.company, employee.branch, employee.department, employee.position].join(' ').toLowerCase().includes(query))
      && Object.entries({ company: 'company', branch: 'branch', department: 'department', job: 'position' }).every(([key, field]) => !filters[key] || employee[field] === filters[key]);
  }
  function assessmentRows(employees, records, definitions, filters = {}, today) {
    const skills = new Map(definitions.map(item => [item.id, item]));
    return employees.filter(employee => matches(employee, filters)).map(employee => {
      const assignments = records.filter(record => record.empNo === employee.empNo && (!filters.skillGroup || skills.get(record.competency)?.skillGroup === filters.skillGroup));
      const dates = assignments.map(item => item.lastAssessment).filter(value => date(value) != null && value <= today).sort();
      const lastAssessment = dates.at(-1) || '';
      return { ...employee, assignmentCount: assignments.length, lastAssessment,
        daysSince: lastAssessment ? Math.floor((date(today) - date(lastAssessment)) / 86400000) : null };
    }).filter(employee => (!filters.skillGroup || employee.assignmentCount > 0)
      && (filters.days === '' || filters.days == null || employee.daysSince == null || employee.daysSince > Number(filters.days)));
  }
  function searchRows(employees, records, definitions, filters = {}, today) {
    const people = new Map(employees.map(item => [item.empNo, item]));
    const skills = new Map(definitions.map(item => [item.id, item]));
    return records.flatMap(record => {
      const employee = people.get(record.empNo), skill = skills.get(record.competency);
      if (!employee || !skill || !matches(employee, filters) || (filters.competency && skill.id !== filters.competency)
        || (filters.skillGroup && skill.skillGroup !== filters.skillGroup)) return [];
      const rawLevel = number(record.level), rawRequired = number(skill.requiredLevel);
      const level = rawLevel != null && Number.isInteger(rawLevel) && rawLevel >= 0 && rawLevel <= 5 ? rawLevel : null;
      const requiredLevel = rawRequired != null && Number.isInteger(rawRequired) && rawRequired >= 0 && rawRequired <= 5 ? rawRequired : null;
      const age = yearsSince(employee.dateOfBirth, today), yos = yearsSince(employee.dateJoined, today);
      if (!inRange(level, filters.levelMin, filters.levelMax) || !inRange(age, filters.ageMin, filters.ageMax) || !inRange(yos, filters.yosMin, filters.yosMax)) return [];
      return [{ ...employee, ...record, name: employee.name, title: skill.title, skillGroup: skill.skillGroup, level, requiredLevel,
        gap: level == null || requiredLevel == null ? null : level - requiredLevel, age, yos }];
    });
  }
  function gapGroups(rows, definitions, sign) {
    return definitions.map(skill => {
      const unique = new Map(rows.filter(row => row.competency === skill.id && row.gap != null && (sign === 'positive' ? row.gap > 0 : row.gap < 0)).map(row => [row.empNo, row]));
      return { competency: skill.id, title: skill.title, count: unique.size, rows: [...unique.values()] };
    }).filter(group => group.count).sort((a, b) => b.count - a.count || a.title.localeCompare(b.title));
  }
  window.StaffCompetencyReports = { assessmentRows, searchRows, gapGroups };
})();
