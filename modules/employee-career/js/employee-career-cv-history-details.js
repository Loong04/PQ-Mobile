(() => {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const sections = {
    personal: {title: 'Personal', fields: ['Name', 'Birth Date', 'Age', 'Personal Email', 'Marital Status', 'Marriage Date', 'Passport #', 'Passport Expiry', 'Driving License', 'Driving License Expiry', 'Key Level']},
    qualification: {title: 'Qualification', fields: ['Qualification', 'Description', 'Major', 'Institute', 'Other Institute Name', 'CGPA', 'Certificate #', 'Year From', 'Year To', 'Highest', 'Notes']},
    payroll: {title: 'Payroll', fields: ['EPF #', 'Socso #', 'Tax #', 'Tabung Haji #', 'ASB #', 'Spouse EPF #', 'Spouse Tax #', 'Bank', 'Account #', 'Handicap?', 'Spouse Handicap?', 'Spouse Working?']},
    contacts: {title: 'Contacts', fields: ['Company Email', 'Phone #', 'Mobile #', 'Address', 'Postal Code', 'City', 'State', 'Country', 'Emergency Contact #', 'Contact Name', 'Contact Address', 'Contact Postal Code', 'Contact City', 'Contact State', 'Contact Country', 'Remarks']},
    family: {title: 'Family', fields: []}
  };
  const normalize = value => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const aliases = {
    fullname: 'Name', qualificationlevel: 'Qualification', majorfieldofstudy: 'Major',
    institutename: 'Institute', highestqualification: 'Highest', incometax: 'Tax #',
    bankname: 'Bank', bankaccount: 'Account #', bankaccountnumber: 'Account #', accountnumber: 'Account #',
    officephone: 'Phone #', phonenumber: 'Phone #', mobilephone: 'Mobile #', mobilenumber: 'Mobile #',
    passportnumber: 'Passport #', emergencycontactnumber: 'Emergency Contact #',
    emergencycontactname: 'Contact Name', emergencycontactremarks: 'Remarks',
    emergencycontactpostalcode: 'Contact Postal Code', emergencycontactcity: 'Contact City'
  };
  const familyLabels = new Set(['memberfullname', 'relation', 'status', 'rank', 'newnricbirthcert', 'taxstatus', 'allocation', 'beneficiary', 'deletefamilymember']);
  const deletion = change => String(change.fieldId || '').startsWith('family_delete_') || normalize(change.label) === 'deletefamilymember';
  function changeOwner(change) {
    const label = aliases[normalize(change.label)] || change.label;
    if (Object.hasOwn(sections, change.section)) return {section: change.section, label};
    const fieldId = String(change.fieldId || '');
    if (fieldId.startsWith('qual_')) return {section: 'qualification', label};
    if (/^(fam_|family_delete_)/.test(fieldId) || familyLabels.has(normalize(change.label))) return {section: 'family', label};
    if (/^addressline[123]$/.test(normalize(change.label))) return {section: 'contacts', label};
    const owner = Object.keys(sections).find(key => sections[key].fields.some(field => normalize(field) === normalize(label)));
    return {section: owner || 'personal', label};
  }
  const display = value => value === '' || value == null ? '\u2014' : escape(value);
  const employee = row => `<span class="cv-history-detail-employee"><span class="history-employee-name">${display(row.name || row.employeeName)}</span>${row.empNo ? `<span class="history-employee-id">#${escape(String(row.empNo).replace(/^#/, ''))}</span>` : ''}</span>`;

  function fieldRows(row, section) {
    const snapshot = row.profile?.[section] || {};
    const values = new Map(sections[section].fields.map(label => [label, snapshot[label]]));
    for (const change of row.changes || []) {
      if (!change || !change.label || deletion(change)) continue;
      const owner = changeOwner(change);
      if (owner.section !== section) continue;
      const label = sections[section].fields.find(field => normalize(field) === normalize(owner.label)) || owner.label;
      values.set(label, {value: change.newVal, previous: change.oldVal, changed: true});
    }
    return [...values].map(([label, field]) => {
      const structured = field !== null && typeof field === 'object';
      const value = structured ? field.value : field;
      const changed = structured && field.changed;
      return `<tr><th scope="row">${escape(label)}</th><td data-cv-field="${escape(label)}"${changed ? ' class="cv-history-field-changed"' : ''}><span class="cv-history-field-value">${display(value)}</span>${structured && Object.hasOwn(field, 'previous') ? `<span class="cv-history-previous-value">Previous: ${display(field.previous)}</span>` : ''}</td></tr>`;
    }).join('');
  }

  function familyTable(title, members, emptyText) {
    const rows = members.map(member => `<tr${member.changed ? ' class="cv-history-field-changed"' : ''}><td><span class="cv-history-field-value">${display(member.name)}</span></td><td><span class="cv-history-field-value">${display(member.relation)}</span></td></tr>`).join('');
    return `<section class="cv-history-family-section"><h3>${title}</h3><table class="history-detail-table cv-history-family-table"><thead><tr><th scope="col">Name</th><th scope="col">Relation</th></tr></thead><tbody>${rows || `<tr><td colspan="2" class="cv-history-empty-members">${emptyText}</td></tr>`}</tbody></table></section>`;
  }

  function render(row, statusMarkup, submittedDate) {
    const tabs = Object.entries(sections).map(([key, section]) => `<button type="button" class="cv-history-detail-tab${key === 'personal' ? ' active' : ''}" id="cv-tab-${key}" role="tab" aria-selected="${key === 'personal'}" aria-controls="cv-panel-${key}" tabindex="${key === 'personal' ? '0' : '-1'}" data-cv-tab="${key}">${section.title}</button>`).join('');
    const metadata = `<table class="history-detail-table cv-history-metadata"><tbody><tr><th scope="row">Approver Remarks</th><td>${display(row.approverRemarks)}</td></tr><tr><th scope="row">Document Reference</th><td>${display(row.reference || row.id)}</td></tr><tr><th scope="row">Document Status</th><td>${statusMarkup}</td></tr><tr><th scope="row">Employee</th><td>${employee(row)}</td></tr><tr><th scope="row">Submitted Date</th><td>${submittedDate}</td></tr></tbody></table>`;
    const panels = Object.keys(sections).map(key => {
      let content;
      if (key === 'family') {
        const family = row.profile?.family || {};
        const removed = (row.changes || []).filter(change => change && deletion(change)).map(change => ({name: change.oldVal, relation: '', changed: true}));
        const deleted = [...(family.deleted || []), ...removed];
        const deletedNames = new Set(deleted.map(member => member.name));
        const existing = (family.existing || []).filter(member => !deletedNames.has(member.name));
        const requested = fieldRows(row, 'family');
        content = familyTable('Deleted Family Member', deleted, 'No deleted family members') + familyTable('Existing Family Member', existing, 'No family members recorded') + (requested ? `<section class="cv-history-family-section"><h3>Requested Family Changes</h3><table class="history-detail-table"><tbody>${requested}</tbody></table></section>` : '');
      } else content = (key === 'personal' ? metadata : '') + `<table class="history-detail-table cv-history-fields"><tbody>${fieldRows(row, key)}</tbody></table>`;
      return `<section class="cv-history-detail-panel" id="cv-panel-${key}" role="tabpanel" aria-labelledby="cv-tab-${key}"${key === 'personal' ? '' : ' hidden'}>${content}</section>`;
    }).join('');
    return `<div class="cv-history-detail-tabs" role="tablist" aria-label="CV details">${tabs}</div>${panels}`;
  }

  function selectTab(body, key, focus = false) {
    if (!Object.hasOwn(sections, key)) return;
    body.querySelectorAll('[data-cv-tab]').forEach(tab => {
      const active = tab.dataset.cvTab === key;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      body.querySelector('#cv-panel-' + tab.dataset.cvTab).hidden = !active;
      if (active) {
        if (focus) tab.focus({preventScroll: true});
        tab.scrollIntoView({block: 'nearest', inline: 'nearest'});
      }
    });
    body.scrollTop = 0;
  }

  function keydown(event, body) {
    const tab = event.target.closest('[data-cv-tab]');
    if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const keys = Object.keys(sections);
    const index = keys.indexOf(tab.dataset.cvTab);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? keys.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + keys.length) % keys.length;
    event.preventDefault();
    selectTab(body, keys[next], true);
  }
  window.EmployeeCareerCVHistoryDetails = {render, selectTab, keydown};
})();
