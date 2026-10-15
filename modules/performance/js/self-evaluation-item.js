(() => {
  const $ = id => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const store = window.SelfEvaluationStore;
  const kind = params.get('kind');
  const itemId = params.get('item');
  const validKinds = ['goals', 'competencies'];
  const theme = () => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
  const sectionTitle = () => kind === 'competencies' ? 'Competency' : 'Goal';

  function returnUrl() {
    const url = new URL('self-evaluation.html', location.href);
    if (validKinds.includes(kind)) url.searchParams.set('kind', kind);
    if (itemId) url.searchParams.set('item', itemId);
    url.searchParams.set('theme', theme());
    return url.href;
  }

  function syncLinks() {
    $('selfEvaluationItemBack').href = returnUrl();
    $('selfEvaluationItemCancel').href = returnUrl();
  }

  function showError(message, control) {
    $('selfEvaluationItemError').textContent = message;
    $('selfEvaluationItemError').hidden = false;
    if (control) {
      control.setAttribute('aria-invalid', 'true');
      control.focus();
    }
  }

  function clearError() {
    $('selfEvaluationItemError').hidden = true;
    $('selfEvaluationItemRating').removeAttribute('aria-invalid');
    $('selfEvaluationItemRemark').removeAttribute('aria-invalid');
  }

  function fitTextareas() {
    document.querySelectorAll('#selfEvaluationItemForm textarea').forEach(control => {
      control.style.height = 'auto';
      control.style.height = `${control.scrollHeight + control.offsetHeight - control.clientHeight}px`;
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const record = store?.get();
    const item = validKinds.includes(kind) ? record?.[kind]?.find(entry => entry.id === itemId) : null;
    syncLinks();
    if (!item) {
      $('selfEvaluationItemForm').hidden = true;
      $('selfEvaluationItemNotFound').hidden = false;
      return;
    }
    const title = sectionTitle();
    $('selfEvaluationItemPageTitle').textContent = `Update ${title}`;
    $('selfEvaluationItemSectionTitle').textContent = title;
    $('selfEvaluationItemTitle').value = item.title ?? '';
    $('selfEvaluationItemWeightage').value = item.weightage == null ? '—' : `${item.weightage}%`;
    $('selfEvaluationItemRating').value = item.rating ?? '';
    $('selfEvaluationItemRemark').value = item.remark ?? '';
    $('selfEvaluationItemForm').addEventListener('input', clearError);
    $('selfEvaluationItemForm').addEventListener('submit', event => {
      event.preventDefault();
      clearError();
      const ratingControl = $('selfEvaluationItemRating');
      const rating = Number(ratingControl.value);
      if (ratingControl.value.trim() === '' || !Number.isFinite(rating) || rating < 0 || rating > 5) {
        showError('Enter a rating from 0 to 5.', ratingControl);
        return;
      }
      const remark = $('selfEvaluationItemRemark').value.trim();
      if (remark.length > 2000) {
        showError('Remark must be 2,000 characters or fewer.', $('selfEvaluationItemRemark'));
        return;
      }
      try {
        store.update(kind, item.id, { rating, remark });
        location.assign(returnUrl());
      } catch {
        showError('Unable to save this update. Please try again.');
      }
    });
    fitTextareas();
    document.fonts.ready.then(fitTextareas);
    new ResizeObserver(fitTextareas).observe($('selfEvaluationItemForm'));
  });

  new MutationObserver(syncLinks).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
