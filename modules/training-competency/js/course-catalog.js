(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const courses = window.TRAINING_COMPETENCY_COURSES || [];
  const defaults = {
    keyword: '',
    effectiveDate: '',
    courseCategory: '',
    trainingType: '',
    developmentArea: '',
    hasOpenClass: false,
    onlineCourse: false,
    showAll: false
  };
  const state = { filters: { ...defaults } };
  const phone = document.querySelector('.phone-container');
  let returnFocus = null;
  let inertElements = [];

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function uniqueValues(key) {
    return [...new Set(courses.map(course => course[key]).filter(Boolean))].sort((left, right) => left.localeCompare(right));
  }

  function setOptions(select, values, allLabel) {
    select.replaceChildren(new Option(allLabel, ''));
    values.forEach(value => select.add(new Option(value, value)));
  }

  function createDetail(label, value) {
    const detail = element('div', 'course-catalog-detail');
    detail.append(element('span', '', label), element('strong', '', value));
    return detail;
  }

  function createCard(course) {
    const card = element('article', 'course-catalog-card');
    card.dataset.courseId = course.id;
    const header = element('header', 'course-catalog-card-header');
    const title = element('h2', 'course-catalog-card-title', course.title);
    title.id = 'courseCatalogTitle-' + course.id;
    card.setAttribute('aria-labelledby', title.id);
    header.append(title);
    card.append(header);
    const details = element('div', 'course-catalog-details');
    details.append(
      createDetail('Development Area', course.developmentArea),
      createDetail('Training Type', course.trainingType),
      createDetail('Duration', course.duration),
      createDetail('Bond Period', course.bondPeriod)
    );
    card.append(details);
    return card;
  }

  function filteredCourses() {
    const filters = state.filters;
    if (filters.showAll) return [...courses];
    const keyword = filters.keyword.toLowerCase();
    return courses.filter(course => {
      const searchable = [
        course.title,
        course.courseCategory,
        course.trainingType,
        course.developmentArea
      ].join(' ').toLowerCase();
      return (!keyword || searchable.includes(keyword))
        && (!filters.effectiveDate || course.effectiveDate === filters.effectiveDate)
        && (!filters.courseCategory || course.courseCategory === filters.courseCategory)
        && (!filters.trainingType || course.trainingType === filters.trainingType)
        && (!filters.developmentArea || course.developmentArea === filters.developmentArea)
        && (!filters.hasOpenClass || course.hasOpenClass)
        && (!filters.onlineCourse || course.onlineCourse);
    });
  }

  function filterSummary() {
    const filters = state.filters;
    if (filters.showAll) return 'Show All';
    const parts = [];
    if (filters.keyword) parts.push('Search: ' + filters.keyword);
    if (filters.effectiveDate) parts.push('Effective: ' + filters.effectiveDate);
    if (filters.courseCategory) parts.push(filters.courseCategory);
    if (filters.trainingType) parts.push(filters.trainingType);
    if (filters.developmentArea) parts.push(filters.developmentArea);
    if (filters.hasOpenClass) parts.push('Has Open Class');
    if (filters.onlineCourse) parts.push('Online Course');
    return parts.length ? parts.join(' • ') : 'All Courses';
  }

  function render() {
    const results = filteredCourses();
    $('courseList').replaceChildren(...results.map(createCard));
    $('courseTotalRecords').textContent = String(results.length);
    $('courseFilterSummary').textContent = filterSummary();
    $('courseEmpty').hidden = results.length > 0;
  }

  function syncShowAllState() {
    const disabled = $('courseFilterShowAll').checked;
    [
      'courseFilterKeyword',
      'courseFilterEffectiveDate',
      'courseFilterCategory',
      'courseFilterTrainingType',
      'courseFilterDevelopmentArea',
      'courseFilterHasOpenClass',
      'courseFilterOnlineCourse'
    ].forEach(id => {
      $(id).disabled = disabled;
    });
  }

  function populateForm() {
    const filters = state.filters;
    $('courseFilterKeyword').value = filters.keyword;
    $('courseFilterEffectiveDate').value = filters.effectiveDate;
    $('courseFilterCategory').value = filters.courseCategory;
    $('courseFilterTrainingType').value = filters.trainingType;
    $('courseFilterDevelopmentArea').value = filters.developmentArea;
    $('courseFilterHasOpenClass').checked = filters.hasOpenClass;
    $('courseFilterOnlineCourse').checked = filters.onlineCourse;
    $('courseFilterShowAll').checked = filters.showAll;
    syncShowAllState();
  }

  function openFilter() {
    const overlay = $('courseFilterOverlay');
    returnFocus = document.activeElement;
    populateForm();
    inertElements = [...phone.children].filter(node => node !== overlay && !node.inert);
    inertElements.forEach(node => {
      node.inert = true;
    });
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    void overlay.offsetHeight;
    overlay.classList.add('active');
    overlay.querySelector('button:not(:disabled), input:not(:disabled), select:not(:disabled)')?.focus({ preventScroll: true });
  }

  function closeFilter() {
    const overlay = $('courseFilterOverlay');
    overlay.classList.remove('active');
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
    inertElements.forEach(node => {
      node.inert = false;
    });
    inertElements = [];
    returnFocus?.focus({ preventScroll: true });
  }

  function applyFilters(filters) {
    state.filters = filters;
    render();
    closeFilter();
    document.querySelector('.course-catalog-content').scrollTop = 0;
  }

  function readForm() {
    return {
      keyword: $('courseFilterKeyword').value.trim(),
      effectiveDate: $('courseFilterEffectiveDate').value,
      courseCategory: $('courseFilterCategory').value,
      trainingType: $('courseFilterTrainingType').value,
      developmentArea: $('courseFilterDevelopmentArea').value,
      hasOpenClass: $('courseFilterHasOpenClass').checked,
      onlineCourse: $('courseFilterOnlineCourse').checked,
      showAll: $('courseFilterShowAll').checked
    };
  }

  function syncBackLink() {
    const theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    $('courseCatalogBack').href = '../index.html?scope=individual&theme=' + theme;
  }

  setOptions($('courseFilterCategory'), uniqueValues('courseCategory'), 'All Course Categories');
  setOptions($('courseFilterTrainingType'), uniqueValues('trainingType'), 'All Training Types');
  setOptions($('courseFilterDevelopmentArea'), uniqueValues('developmentArea'), 'All Development Areas');

  $('courseFilterTrigger').addEventListener('click', openFilter);
  $('courseFilterClose').addEventListener('click', closeFilter);
  $('courseFilterShowAll').addEventListener('change', syncShowAllState);
  $('courseFilterForm').addEventListener('submit', event => {
    event.preventDefault();
    applyFilters(readForm());
  });
  $('courseResetFilter').addEventListener('click', () => applyFilters({ ...defaults }));
  $('courseFilterOverlay').addEventListener('click', event => {
    if (event.target === event.currentTarget) closeFilter();
  });
  document.addEventListener('keydown', event => {
    if ($('courseFilterOverlay').hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeFilter();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...$('courseFilterOverlay').querySelectorAll('button, input, select')]
      .filter(node => !node.disabled && node.getClientRects().length);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  new MutationObserver(syncBackLink).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  syncBackLink();
  render();
})();
