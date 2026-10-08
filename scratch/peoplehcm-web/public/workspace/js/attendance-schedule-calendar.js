(() => {
  const triggers = document.querySelectorAll('[data-schedule-info-trigger]');
  const dialog = document.getElementById('attendanceScheduleInfo') || document.getElementById('leaveCalendarInfo');
  if (!triggers.length || !dialog) return;
  const phone = document.querySelector('.phone-container');
  const panel = dialog.querySelector('.attendance-schedule-info-panel');
  let motion;
  let closing = false;
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function positionSheet() {
    const bounds = phone.getBoundingClientRect();
    Object.entries({ top: bounds.top, left: bounds.left, width: bounds.width, height: bounds.height }).forEach(([key, value]) => {
      dialog.style.setProperty('--schedule-sheet-' + key, value + 'px');
    });
    dialog.style.setProperty('--schedule-sheet-radius', getComputedStyle(phone).borderRadius);
  }
  function closeSheet() {
    if (closing || !dialog.open) return;
    closing = true;
    const current = getComputedStyle(panel).transform;
    if (motion) motion.cancel();
    if (reducedMotion()) { dialog.close(); return; }
    motion = panel.animate([{ transform: current }, { transform: 'translateY(100%)' }], {
      duration: 180, easing: 'cubic-bezier(.4, 0, 1, 1)', fill: 'forwards'
    });
    motion.finished.then(() => dialog.close()).catch(() => {});
  }
  triggers.forEach(trigger => trigger.addEventListener('click', () => {
    dialog.querySelectorAll('[data-info-scope]').forEach(row => {
      row.hidden = row.dataset.infoScope !== trigger.dataset.calendarInfoScope;
    });
    positionSheet();
    closing = false;
    dialog.showModal();
    if (!reducedMotion()) motion = panel.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], {
      duration: 260, easing: 'cubic-bezier(.16, 1, .3, 1)'
    });
  }));
  dialog.addEventListener('close', () => { if (motion) motion.cancel(); motion = undefined; closing = false; });
  dialog.querySelector('form').addEventListener('submit', event => { event.preventDefault(); closeSheet(); });
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeSheet(); });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) closeSheet();
  });
  window.addEventListener('resize', () => { if (dialog.open) positionSheet(); });
  window.addEventListener('scroll', () => { if (dialog.open) positionSheet(); }, { passive: true });
})();
