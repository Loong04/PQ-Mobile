(() => {
  const draftKey = 'peoplehcm:key-staff-nomination:draft:v1';
  const fieldIds = ['nominationEmployee', 'nominationDate', 'nominationTalentPool', 'nominationKeyLevel', 'nominationJustification', 'nominationRemarks'];
  function init() {
    const form = document.getElementById('keyStaffNominationForm');
    if (!form) return;
    const $ = id => document.getElementById(id);
    const status = message => { $('nominationDraftStatus').textContent = message; $('nominationDraftStatus').hidden = false; };
    const toast = message => window.EmployeeCareerForms.showToast(message);
    const currentAttachmentNames = () => [...form.querySelectorAll('.form-attachment-file-name')].map(node => node.textContent);
    let pendingAttachmentNames = [];
    const today = new Date();
    $('nominationDate').value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    try {
      const draft = JSON.parse(localStorage.getItem(draftKey) || 'null');
      if (draft?.fields && typeof draft.fields === 'object') {
        pendingAttachmentNames = Array.isArray(draft.attachmentNames) ? draft.attachmentNames.filter(name => typeof name === 'string') : [];
        fieldIds.forEach(id => { if (typeof draft.fields[id] === 'string') $(id).value = draft.fields[id]; });
        $('nominationEmployee').dispatchEvent(new Event('change', { bubbles: true }));
        status(pendingAttachmentNames.length ? 'Draft restored. Please reattach your files before submitting.' : 'Draft restored.');
      }
    } catch { status('Could not restore the saved draft. You can continue filling in the form.'); }

    $('nominationSaveDraft').addEventListener('click', () => {
      const fields = Object.fromEntries(fieldIds.map(id => [id, $(id).value]));
      const attachmentNames = [...new Set([...pendingAttachmentNames, ...currentAttachmentNames()])];
      try {
        localStorage.setItem(draftKey, JSON.stringify({ fields, attachmentNames }));
        status(attachmentNames.length ? 'Draft saved on this device. Reattach your files if you reopen it.' : 'Draft saved on this device.');
        toast('Draft saved');
      } catch { toast('Could not save the draft on this device.'); }
    });
    form.addEventListener('change', event => {
      if (event.target.matches('input[type="file"]')) {
        const attached = currentAttachmentNames();
        pendingAttachmentNames = pendingAttachmentNames.filter(name => !attached.includes(name));
      }
    });
    form.addEventListener('input', event => {
      if (event.target.matches('[required]')) {
        event.target.setCustomValidity('');
        event.target.removeAttribute('aria-invalid');
      }
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      fieldIds.forEach(id => {
        const field = $(id);
        field.setCustomValidity(field.value.trim() ? '' : 'Please complete this field.');
        if (field.validity.valid) field.removeAttribute('aria-invalid');
        else field.setAttribute('aria-invalid', 'true');
      });
      if (!form.reportValidity()) return;
      // This prototype validates the form; it has no nomination submission API.
      toast('Nomination ready for submission');
    });
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
