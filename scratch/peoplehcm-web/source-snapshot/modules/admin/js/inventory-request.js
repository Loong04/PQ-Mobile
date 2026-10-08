document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  const form = $('inventoryRequestForm');
  if (!form) return;
  const item = $('inventoryRequestItem');
  const quantity = $('inventoryRequestQuantity');
  const requiredBy = $('inventoryRequestRequiredBy');
  const reason = $('inventoryRequestReason');
  const remarks = $('inventoryRequestRemarks');
  const feedback = $('inventoryRequestFeedback');
  let attachments = [];
  let historyRecordId = null;

  const now = new Date();
  requiredBy.min = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');

  function showFeedback(message, error = false) {
    feedback.textContent = message;
    feedback.classList.toggle('is-error', error);
    feedback.hidden = false;
  }

  function clearFeedback() {
    feedback.hidden = true;
    form.querySelectorAll('[aria-invalid="true"]').forEach(control => control.removeAttribute('aria-invalid'));
  }

  function formatDate(value) {
    return new Date(value + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function renderAttachment() {
    const list = $('inventoryAttachmentList');
    list.replaceChildren();
    attachments.forEach((attachment, index) => {
      const row = document.createElement('div');
      row.className = 'form-attachment-item';
      const icon = document.createElement('i');
      icon.className = 'fa-solid fa-paperclip form-attachment-file-icon';
      icon.setAttribute('aria-hidden', 'true');
      const name = document.createElement('span');
      name.className = 'form-attachment-file-name';
      name.textContent = attachment.name;
      name.title = attachment.name;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'form-attachment-remove';
      remove.dataset.removeInventoryAttachment = String(index);
      remove.setAttribute('aria-label', 'Remove ' + attachment.name);
      remove.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
      row.append(icon, name, remove);
      list.append(row);
    });
  }

  form.querySelectorAll('[data-file-picker]').forEach(button => {
    button.addEventListener('click', () => $(button.dataset.filePicker).click());
  });
  ['inventoryRequestFiles', 'inventoryRequestCamera'].forEach(id => {
    $(id).addEventListener('change', event => {
      attachments = attachments.concat(Array.from(event.target.files || []));
      event.target.value = '';
      renderAttachment();
      feedback.hidden = true;
    });
  });
  $('inventoryAttachmentList').addEventListener('click', event => {
    const button = event.target.closest('[data-remove-inventory-attachment]');
    if (!button) return;
    attachments.splice(Number(button.dataset.removeInventoryAttachment), 1);
    renderAttachment();
    form.querySelector('[data-file-picker="inventoryRequestFiles"]').focus();
  });
  form.addEventListener('input', clearFeedback);
  form.addEventListener('change', clearFeedback);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!item.value) {
      item.setAttribute('aria-invalid', 'true');
      showFeedback('Please select a request item to continue.', true);
      item.focus();
      return;
    }
    if (!quantity.value || Number(quantity.value) < 1) {
      quantity.setAttribute('aria-invalid', 'true');
      showFeedback('Please enter a quantity of at least 1.', true);
      quantity.focus();
      return;
    }
    if (!requiredBy.value) {
      requiredBy.setAttribute('aria-invalid', 'true');
      showFeedback('Please select the required date.', true);
      requiredBy.focus();
      return;
    }
    if (requiredBy.value < requiredBy.min) {
      requiredBy.setAttribute('aria-invalid', 'true');
      showFeedback('Required By cannot be earlier than today.', true);
      requiredBy.focus();
      return;
    }
    if (!reason.value) {
      reason.setAttribute('aria-invalid', 'true');
      showFeedback('Please select a reason to continue.', true);
      reason.focus();
      return;
    }
    try {
      const itemLabel = item.selectedOptions[0].textContent;
      const reasonLabel = reason.selectedOptions[0].textContent;
      const record = window.WorkplaceHistoryStore.save({
        id: historyRecordId,
        kind: 'inventory-request',
        title: itemLabel,
        date: requiredBy.min,
        fields: [
          ['Request Item', itemLabel],
          ['Quantity', quantity.value],
          ['Required By', formatDate(requiredBy.value)],
          ['Reason', reasonLabel],
          ['Remarks', remarks.value.trim()],
          ['Attachment', attachments.map(attachment => attachment.name).join(', ')]
        ]
      });
      historyRecordId = record.id;
      showFeedback('Inventory request saved to History on this device.');
    } catch {
      showFeedback('Unable to save this request to History. Please try again.', true);
    }
  });
});
