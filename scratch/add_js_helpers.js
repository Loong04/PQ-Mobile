const fs = require('fs');
const path = require('path');

const shiftPlanPath = path.resolve(__dirname, '../modules/attendance/options/shift-plan.html');
const shiftSummaryPath = path.resolve(__dirname, '../modules/attendance/options/shift-summary.html');

const helperJs = `
    function adjustDate(offset) {
      if (!window.currentSummaryFilterDate) {
        window.currentSummaryFilterDate = new Date(2026, 8, 24);
      }
      window.currentSummaryFilterDate.setDate(window.currentSummaryFilterDate.getDate() + offset);
      const d = window.currentSummaryFilterDate;
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      
      const displayEl = document.getElementById('filterDateDisplay');
      if (displayEl) displayEl.value = \`\${dd}/\${mm}/\${yyyy}\`;
      const inputEl = document.getElementById('filterDateInput');
      if (inputEl) inputEl.value = \`\${yyyy}-\${mm}-\${dd}\`;
      
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const dateFormattedStr = \`\${dd} \${monthNames[d.getMonth()]} \${yyyy}\`;
      const subDateEl = document.getElementById('kpiDateSubtitle');
      if (subDateEl) subDateEl.textContent = dateFormattedStr;
    }

    function resetShiftTypeFilter() {
      const select = document.getElementById('filterShiftType');
      if (select) {
        select.value = 'all';
        if (typeof applyFilters === 'function') applyFilters();
      }
    }
`;

function injectJs(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('function adjustDate')) {
    content = content.replace('</script>', `${helperJs}\n  </script>`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Injected adjustDate into ${path.basename(filePath)}`);
  }
}

injectJs(shiftPlanPath);
injectJs(shiftSummaryPath);
