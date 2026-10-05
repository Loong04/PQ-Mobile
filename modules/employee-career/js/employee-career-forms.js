(() => {
  const params = new URLSearchParams(location.search);
  const theme = params.get('theme') === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;

  const employees = {
    EBB01: {
      name: 'Aina Rahman',
      position: 'People Operations Executive',
      hireDate: '15 Jan 2026',
      employmentType: 'Permanent',
      confirmationDue: '15 Jul 2026'
    },
    EBB02: {
      name: 'Daniel Wong',
      position: 'Product Designer',
      hireDate: '03 Feb 2026',
      employmentType: 'Permanent',
      confirmationDue: '03 Aug 2026'
    },
    EBB03: {
      name: 'Nur Izzati',
      position: 'Finance Analyst',
      hireDate: '21 Mar 2026',
      employmentType: 'Contract',
      confirmationDue: '21 Sep 2026'
    }
  };

  function setBackTheme() {
    document.querySelectorAll('[data-option-back]').forEach(link => {
      const url = new URL(link.getAttribute('href'), location.href);
      url.searchParams.set('theme', theme);
      link.href = url.href;
    });
  }

  function showToast(message) {
    const toast = document.getElementById('employeeCareerToast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function renderAttachments(list, files) {
    const sharedStyle = list.classList.contains('form-attachment-list');
    list.replaceChildren();
    files.forEach((file, index) => {
      const row = document.createElement('div');
      row.className = sharedStyle ? 'form-attachment-item' : 'employee-career-attachment';

      const icon = document.createElement('i');
      icon.className = sharedStyle ? 'fa-solid fa-paperclip form-attachment-file-icon' : 'fa-solid fa-paperclip';
      icon.setAttribute('aria-hidden', 'true');

      const name = document.createElement('span');
      if (sharedStyle) name.className = 'form-attachment-file-name';
      name.textContent = file.name;
      name.title = file.name;

      const remove = document.createElement('button');
      remove.type = 'button';
      if (sharedStyle) remove.className = 'form-attachment-remove';
      remove.dataset.removeFile = String(index);
      remove.setAttribute('aria-label', `Remove ${file.name}`);
      remove.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';

      row.append(icon, name, remove);
      list.append(row);
    });
  }

  function initAttachments(form, fileIds, listId) {
    const list = document.getElementById(listId);
    if (!form || !list) return;
    let files = [];

    form.querySelectorAll('[data-file-picker]').forEach(button => {
      button.addEventListener('click', () => document.getElementById(button.dataset.filePicker)?.click());
    });

    fileIds.forEach(id => {
      document.getElementById(id)?.addEventListener('change', event => {
        files = files.concat(Array.from(event.target.files || []));
        renderAttachments(list, files);
        event.target.value = '';
      });
    });

    list.addEventListener('click', event => {
      const button = event.target.closest('[data-remove-file]');
      if (!button) return;
      files.splice(Number(button.dataset.removeFile), 1);
      renderAttachments(list, files);
    });
  }

  function bindSubmit(form, message) {
    form?.addEventListener('submit', event => {
      event.preventDefault();
      showToast(message);
    });
  }

  function bindEmployee(selectId, fields) {
    const select = document.getElementById(selectId);
    if (!select) return;

    function update() {
      const employee = employees[select.value];
      Object.entries(fields).forEach(([fieldId, property]) => {
        const field = document.getElementById(fieldId);
        if (field) field.value = employee?.[property] || '';
      });
    }

    select.addEventListener('change', update);
    update();
  }

  function initFeedback() {
    const form = document.getElementById('feedbackForm');
    if (!form) return;
    initAttachments(form, ['feedbackFiles', 'feedbackCamera'], 'feedbackAttachments');
    bindSubmit(form, 'Feedback submitted successfully');
  }

  function initWhereabout() {
    const form = document.getElementById('whereaboutForm');
    if (!form) return;
    const project = document.getElementById('whereaboutProject');
    const task = document.getElementById('whereaboutTask');
    const tasks = {
      '': [],
      'project-nova': [['site-survey', 'Site Survey'], ['client-briefing', 'Client Briefing'], ['progress-review', 'Progress Review']],
      'peoplehub-rollout': [['staff-training', 'Staff Training'], ['data-review', 'Data Review'], ['launch-support', 'Launch Support']],
      'workplace-refresh': [['vendor-meeting', 'Vendor Meeting'], ['site-inspection', 'Site Inspection'], ['handover', 'Handover']]
    };

    function renderTasks() {
      task.innerHTML = '<option value="">Select Task</option>' + (tasks[project.value] || []).map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
    }

    project.addEventListener('change', renderTasks);
    renderTasks();
    bindSubmit(form, 'Whereabout submitted successfully');
  }

  function initConfirmStaff() {
    const form = document.getElementById('confirmStaffForm');
    if (!form) return;
    bindEmployee('confirmEmployee', {
      confirmName: 'name',
      confirmPosition: 'position',
      confirmHireDate: 'hireDate',
      confirmEmploymentType: 'employmentType',
      confirmDue: 'confirmationDue'
    });
    initAttachments(form, ['confirmFiles', 'confirmCamera'], 'confirmAttachments');
    bindSubmit(form, 'Staff confirmation submitted successfully');
  }

  function initStaffExit() {
    const form = document.getElementById('staffExitForm');
    if (!form) return;
    bindEmployee('exitEmployee', {
      exitName: 'name',
      exitPosition: 'position'
    });
    initAttachments(form, ['exitFiles', 'exitCamera'], 'exitAttachments');
    bindSubmit(form, 'Staff exit submitted successfully');
  }

  function initStaffRequest() {
    const form = document.getElementById('staffRequestForm');
    if (!form) return;
    initAttachments(form, ['requestFiles', 'requestCamera'], 'requestAttachments');
    bindSubmit(form, 'Staff request submitted successfully');
  }

  function init() {
    setBackTheme();
    document.querySelectorAll('.employee-career-form-page select.employee-career-control').forEach(select => {
      const wrapper = document.createElement('div');
      wrapper.className = 'employee-career-form-select';
      select.before(wrapper);
      wrapper.append(select);
    });
    initFeedback();
    initWhereabout();
    initConfirmStaff();
    initStaffExit();
    initStaffRequest();
  }

  window.EmployeeCareerForms = { showToast };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
