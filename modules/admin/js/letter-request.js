document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('letterRequestForm');
  if (!form) return;
  const type = document.getElementById('letterRequestType');
  const feedback = document.getElementById('letterRequestFeedback');
  let historyRecordId = null;
  function showFeedback(message, error = false) {
    feedback.textContent = message;
    feedback.classList.toggle('is-error', error);
    feedback.hidden = false;
  }
  type.addEventListener('change', () => {
    type.removeAttribute('aria-invalid');
    feedback.hidden = true;
  });
  form.addEventListener('input', () => { feedback.hidden = true; });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!type.value) {
      type.setAttribute('aria-invalid', 'true');
      showFeedback('Please select a letter type to continue.', true);
      type.focus();
      return;
    }
    if (!form.reportValidity()) return;
    try {
      const today = new Date();
      const date = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
      const title = type.selectedOptions[0].textContent;
      const record = window.WorkplaceHistoryStore.save({
        id: historyRecordId, kind: 'letter-request', title, date,
        fields: [['Letter Type', title], ['Description', document.getElementById('letterRequestDescription').value],
          ['1st Merge Text', document.getElementById('letterRequestMerge1').value], ['2nd Merge Text', document.getElementById('letterRequestMerge2').value],
          ['3rd Merge Text', document.getElementById('letterRequestMerge3').value], ['Reason', document.getElementById('letterRequestReason').value],
          ['Remarks', document.getElementById('letterRequestRemarks').value]]
      });
      historyRecordId = record.id;
      showFeedback('Letter request saved to History on this device.');
    } catch {
      showFeedback('Unable to save this request to History. Please try again.', true);
    }
  });
});
