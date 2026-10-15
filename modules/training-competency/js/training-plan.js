(() => {
  const source = window.TRAINING_PLAN_DATA || {};
  const $ = id => document.getElementById(id);
  const display = value => value === '' || value == null ? '—' : String(value);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = String(text);
    return element;
  };

  function dateText(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
    if (!match) return '—';
    const [, year, month, day] = match;
    const date = new Date(`${year}-${month}-${day}T00:00:00Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return '—';
    return `${day} ${months[Number(month) - 1]} ${year}`;
  }

  function syncBackLink() {
    const theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    $('trainingPlanBack').href = `../index.html?scope=individual&theme=${theme}`;
  }

  function renderPerson(container, person) {
    container.replaceChildren(node('strong', '', display(person?.name)));
    const id = String(person?.empNo ?? '').replace(/^#+/, '');
    if (id) container.append(node('span', 'training-plan-employee-id', `#${id}`));
  }

  function detail(label, value, field) {
    const row = node('div', 'training-plan-detail');
    row.dataset.field = field;
    row.append(node('dt', '', label), node('dd', '', display(value)));
    return row;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const employee = source.employee || {};
    const courses = Array.isArray(source.courses) ? source.courses : [];
    $('trainingPlanPosition').textContent = display(employee.position);
    renderPerson($('trainingPlanSupervisor'), employee.supervisor);
    renderPerson($('trainingPlanReportingTo'), employee.reportingTo);
    $('trainingPlanTotalRecords').textContent = String(courses.length);
    $('trainingPlanCourses').replaceChildren(...courses.map((course, index) => {
      const card = node('article', 'training-plan-card');
      card.dataset.courseId = course.id;
      const header = node('header', 'training-plan-card-header');
      const title = node('h2', '', display(course.title));
      title.id = `trainingPlanCourse${index + 1}`;
      card.setAttribute('aria-labelledby', title.id);
      header.append(title);
      const details = node('dl', 'training-plan-card-details');
      const status = detail('Attendance Status', course.attendanceStatus, 'attendance-status');
      if (course.attendanceStatus === 'Completed') status.classList.add('training-plan-completed');
      else if (course.attendanceStatus === 'Not Attended') status.classList.add('training-plan-pending');
      const remarks = detail('Remarks', course.remarks, 'remarks');
      details.append(detail('Last Attended', course.lastAttended ? dateText(course.lastAttended) : 'Not yet attended', 'last-attended'),
        status, detail('Next Due Date', dateText(course.nextDueDate), 'next-due-date'), remarks);
      card.append(header, details);
      return card;
    }));
    $('trainingPlanEmpty').hidden = courses.length > 0;
    syncBackLink();
  });
  new MutationObserver(syncBackLink).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
