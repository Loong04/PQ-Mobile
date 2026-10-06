document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('letterRequestForm');
  if (!form) return;
  const type = document.getElementById('letterRequestType');
  const feedback = document.getElementById('letterRequestFeedback');
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
    // The Admin prototype has no letter-request submission API.
    showFeedback('Letter request ready for submission.');
  });
});
