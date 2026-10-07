function renderManpowerCards(container, records) {
  container.replaceChildren();
  records.forEach(record => {
    const card = document.createElement('section');
    card.className = 'history-card-item manpower-group-card';
    card.dataset.groupId = record.id;
    card.innerHTML = '<h2 class="manpower-company-header"></h2><div class="manpower-group-content"><div class="manpower-group-fields"><div class="manpower-group-field"><small>Section</small><strong data-section></strong></div><div class="manpower-group-field"><small>Cost Center</small><strong data-cost-center></strong></div></div><div class="manpower-group-actions" role="group"></div></div>';
    card.querySelector('.manpower-company-header').textContent = record.company;
    card.querySelector('[data-section]').textContent = record.section;
    card.querySelector('[data-cost-center]').textContent = record.costCenter;
    const actions = card.querySelector('.manpower-group-actions');
    actions.setAttribute('aria-label', `Manpower categories for ${record.company}, ${record.section}`);
    for (const [key, label, colorClass] of [
      ['workShift', 'Work Shift', 'val-work-shift'],
      ['noWork', 'No Work', 'val-no-work'],
      ['otPlan', 'OT Plan', 'val-ot-plan'],
      ['onLeave', 'On Leave', 'val-on-leave']
    ]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.manpowerType = key;
      button.innerHTML = '<span></span><strong></strong>';
      button.querySelector('span').textContent = label;
      const value = button.querySelector('strong');
      value.textContent = record[key];
      value.className = record[key] > 0 ? colorClass : 'val-zero';
      button.setAttribute('aria-label', `${label}, ${record[key]} records, ${record.company}, ${record.section}`);
      button.addEventListener('click', () => openKpiDetails(key, record));
      actions.append(button);
    }
    container.append(card);
  });
}
