(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const draftKey = 'peoplehcm.trainingNeed.draft.v1';
  const submissionsKey = 'peoplehcm.trainingNeed.submissions.v1';
  const courses = window.TRAINING_COMPETENCY_COURSES || [];
  const employee = window.TRAINING_COMPETENCY_INDIVIDUAL?.employee || {};
  const fields = {
    periodStart: 'needPeriodStart', periodEnd: 'needPeriodEnd',
    careerTarget: 'needCareerTarget', weakness: 'needWeakness', remarks: 'needRemarks'
  };
  let details = [];
  let editingIndex = -1;
  let returnFocus = null;
  let mainScrollTop = 0;

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function icon(name) {
    const element = node('i', `fa-solid fa-${name}`);
    element.setAttribute('aria-hidden', 'true');
    return element;
  }

  function notify(message) {
    if (typeof showToast === 'function') showToast(message);
  }

  function error(message) {
    $('needFormError').textContent = message;
    $('needFormError').hidden = !message;
    if (message) $('needFormError').scrollIntoView({ block: 'nearest' });
  }

  function goBack() {
    location.href = `../index.html?scope=individual&theme=${document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'}`;
  }

  function setView(entry) {
    $('trainingNeedForm').hidden = entry;
    $('trainingNeedEntryForm').hidden = !entry;
    $('needPageTitle').textContent = entry ? `${editingIndex < 0 ? 'Add' : 'Edit'} Training Details` : 'Training Need';
    document.querySelector('.main-content').scrollTop = entry ? 0 : mainScrollTop;
    if (entry) $('needDevelopmentArea').focus({ preventScroll: true });
    else if (returnFocus?.isConnected) returnFocus.focus();
    else $('needAddItem').focus();
  }

  function populateCourses(selected = '') {
    const area = $('needDevelopmentArea').value;
    const select = $('needCourse');
    select.replaceChildren(new Option('Select course', ''));
    courses.filter(course => course.developmentArea === area).forEach(course => select.add(new Option(course.title, course.id)));
    select.value = selected;
    select.disabled = !area;
  }

  function dateText(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
  }

  function createItem(item, index) {
    const card = node('article', 'need-item');
    const header = node('div', 'need-item-header');
    const toggle = node('button', 'need-item-toggle');
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', `needItemBody${index}`);
    const copy = node('span', 'need-item-copy');
    const course = courses.find(course => course.id === item.course);
    copy.append(node('strong', '', course?.title || item.course), node('small', '', `Target Date: ${dateText(item.targetDate)}`));
    const chevron = icon('chevron-down');
    toggle.append(copy, chevron);
    const body = node('dl', 'need-item-body');
    body.id = `needItemBody${index}`;
    body.hidden = true;
    [['Development Area', item.developmentArea], ['Course', course?.title || item.course], ['Target Date', dateText(item.targetDate)], ['Justification', item.justification]].forEach(([label, value]) => {
      const row = node('div', 'need-data-row');
      row.append(node('dt', '', label), node('dd', '', value));
      body.append(row);
    });
    toggle.addEventListener('click', () => {
      body.hidden = !body.hidden;
      toggle.setAttribute('aria-expanded', String(!body.hidden));
      chevron.className = `fa-solid fa-chevron-${body.hidden ? 'down' : 'up'}`;
    });
    header.append(toggle);
    [['edit', 'pen-to-square', 'Edit Item'], ['delete', 'trash-can', 'Delete Item']].forEach(([action, symbol, label]) => {
      const button = node('button', 'need-item-action');
      button.type = 'button';
      button.dataset.action = action;
      button.title = label;
      button.setAttribute('aria-label', `${label}: ${course?.title || item.course}`);
      button.append(icon(symbol));
      button.addEventListener('click', () => {
        if (action === 'edit') openEntry(index, button);
        else {
          details.splice(index, 1);
          render();
          $('needAddItem').focus({ preventScroll: true });
        }
      });
      header.append(button);
    });
    card.append(header, body);
    return card;
  }

  function render() {
    $('needItemCount').textContent = `Total Items: ${details.length}`;
    const container = $('needItemsContainer');
    if (details.length) container.replaceChildren(...details.map(createItem));
    else {
      const empty = node('div', 'need-empty');
      empty.append(icon('clipboard-list'), node('strong', '', 'No entries yet'), node('p', '', 'Tap + to add your training details.'));
      container.replaceChildren(empty);
    }
    error('');
  }

  function openEntry(index = -1, trigger = $('needAddItem')) {
    mainScrollTop = document.querySelector('.main-content').scrollTop;
    editingIndex = index;
    returnFocus = trigger;
    $('trainingNeedEntryForm').reset();
    $('needTargetDate').setCustomValidity('');
    $('needJustification').setCustomValidity('');
    const item = details[index];
    $('needEntryTitle').textContent = `${item ? 'Edit' : 'Add'} Training Details`;
    $('needDevelopmentArea').value = item?.developmentArea || '';
    populateCourses(item?.course || '');
    $('needTargetDate').value = item?.targetDate || '';
    $('needTargetDate').min = $('needPeriodStart').value;
    $('needTargetDate').max = $('needPeriodEnd').value;
    $('needJustification').value = item?.justification || '';
    setView(true);
  }

  function collect() {
    const application = Object.fromEntries(Object.entries(fields).map(([key, id]) => [key, $(id).value.trim()]));
    return { ...application, employee: { ...employee }, details: details.map(item => ({ ...item })) };
  }

  function saveDraft() {
    try {
      localStorage.setItem(draftKey, JSON.stringify({ ...collect(), status: 'Draft', updatedAt: new Date().toISOString() }));
      error('');
      notify('Training Need draft saved successfully');
    } catch {
      error('Unable to save the draft. Please check browser storage and try again.');
    }
  }

  function validateApplication() {
    const start = $('needPeriodStart').value;
    const end = $('needPeriodEnd').value;
    $('needPeriodEnd').setCustomValidity(start && end && end < start ? 'The end date must be on or after the start date.' : '');
    ['needCareerTarget', 'needWeakness'].forEach(id => $(id).setCustomValidity($(id).value.trim() ? '' : 'Please complete this field.'));
    if (!$('trainingNeedForm').reportValidity()) return false;
    if (!details.length) {
      error('Add at least one training detail before submitting.');
      $('needAddItem').focus();
      return false;
    }
    if (details.some(item => item.targetDate < start || item.targetDate > end)) {
      error('Each Target Date must be within the Training Period. Please edit the training details.');
      return false;
    }
    return true;
  }

  $('needName').value = employee.name || '';
  $('needPosition').value = employee.position || '';
  $('needDepartment').value = employee.department || '';
  $('needDevelopmentArea').add(new Option('Select development area', ''));
  [...new Set(courses.map(course => course.developmentArea))].sort().forEach(area => $('needDevelopmentArea').add(new Option(area, area)));
  populateCourses();
  let draftLoadError = false;
  try {
    const saved = JSON.parse(localStorage.getItem(draftKey));
    if (saved && typeof saved === 'object') {
      Object.entries(fields).forEach(([key, id]) => { if (typeof saved[key] === 'string') $(id).value = saved[key]; });
      details = Array.isArray(saved.details) ? saved.details.filter(item => item && ['developmentArea', 'course', 'targetDate', 'justification'].every(key => typeof item[key] === 'string') && courses.some(course => course.id === item.course && course.developmentArea === item.developmentArea)) : [];
    }
  } catch { draftLoadError = true; }
  render();
  if (draftLoadError) error('The saved draft could not be loaded. You can start a new Training Need.');

  $('needAddItem').addEventListener('click', () => openEntry());
  $('needDevelopmentArea').addEventListener('change', () => populateCourses());
  $('needCancelItem').addEventListener('click', () => setView(false));
  $('needBack').addEventListener('click', () => $('trainingNeedEntryForm').hidden ? goBack() : setView(false));
  $('needCancel').addEventListener('click', goBack);
  $('needSaveDraft').addEventListener('click', saveDraft);
  document.querySelectorAll('.form-ctrl').forEach(input => input.addEventListener('input', () => input.setCustomValidity('')));

  $('trainingNeedEntryForm').addEventListener('submit', event => {
    event.preventDefault();
    $('needJustification').setCustomValidity($('needJustification').value.trim() ? '' : 'Please enter a justification.');
    if (!$('trainingNeedEntryForm').reportValidity()) return;
    const item = { developmentArea: $('needDevelopmentArea').value, course: $('needCourse').value, targetDate: $('needTargetDate').value, justification: $('needJustification').value.trim() };
    if (editingIndex >= 0) details[editingIndex] = item;
    else details.push(item);
    render();
    setView(false);
    notify(`Training detail ${editingIndex >= 0 ? 'updated' : 'added'} successfully`);
  });

  $('trainingNeedForm').addEventListener('submit', event => {
    event.preventDefault();
    if (!validateApplication()) return;
    try {
      const saved = JSON.parse(localStorage.getItem(submissionsKey) || '[]');
      if (!Array.isArray(saved)) throw new Error('Invalid submissions');
      saved.push({ ...collect(), id: crypto.randomUUID(), status: 'Submitted', submittedAt: new Date().toISOString() });
      localStorage.setItem(submissionsKey, JSON.stringify(saved));
      localStorage.removeItem(draftKey);
      notify('Training Need submitted successfully');
      goBack();
    } catch {
      error('Unable to submit. Your form is still here; please try again.');
    }
  });
})();
