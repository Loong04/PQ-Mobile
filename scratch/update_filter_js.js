const fs = require('fs');
const path = require('path');

function updateFile(filename) {
  const filePath = path.join(__dirname, '../modules/attendance/options/', filename);
  let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

  // Replace resetFilterRoster
  const oldReset = `    function resetFilterRoster() {
      const yyyy = currentDate.getFullYear();
      const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
      const dd = String(currentDate.getDate()).padStart(2, '0');
      if (document.getElementById('filterDate')) document.getElementById('filterDate').value = \`\${yyyy}-\${mm}-\${dd}\`;
      if (document.getElementById('filterStaffShift')) document.getElementById('filterStaffShift').value = 'all';
      if (document.getElementById('filterSearchKeyword')) document.getElementById('filterSearchKeyword').value = '';
      if (document.getElementById('filterBranch')) document.getElementById('filterBranch').value = 'all';
      if (document.getElementById('filterSection')) document.getElementById('filterSection').value = 'all';
      if (document.getElementById('filterJobTitle')) document.getElementById('filterJobTitle').value = 'all';
      renderStaffCards();
      showToast('Filters reset!');
    }`;

  const newReset = `    function resetFilterRoster() {
      const yyyy = currentDate.getFullYear();
      const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
      const dd = String(currentDate.getDate()).padStart(2, '0');
      if (document.getElementById('filterDate')) document.getElementById('filterDate').value = \`\${yyyy}-\${mm}-\${dd}\`;
      if (document.getElementById('filterStaffShift')) document.getElementById('filterStaffShift').value = 'all';
      if (document.getElementById('filterDepartment')) document.getElementById('filterDepartment').value = 'all';
      if (document.getElementById('filterBranch')) document.getElementById('filterBranch').value = 'all';
      if (document.getElementById('filterSection')) document.getElementById('filterSection').value = 'all';
      if (document.getElementById('filterCostCentre')) document.getElementById('filterCostCentre').value = 'all';
      if (document.getElementById('filterJobTitle')) document.getElementById('filterJobTitle').value = 'all';
      renderStaffCards();
      showToast('Filters reset!');
    }`;

  if (content.includes(oldReset)) {
    content = content.replace(oldReset, newReset);
  }

  // Update updateFilterTextDisplay
  const oldTextDisplay = `    function updateFilterTextDisplay() {
      const displayEl = document.getElementById('currentFilterTextDisplay');
      if (!displayEl) return;
      const options = { day: '2-digit', month: 'short', year: 'numeric' };
      const dateStr = currentDate.toLocaleDateString('en-GB', options);
      
      const filterStaffShift = document.getElementById('filterStaffShift') ? document.getElementById('filterStaffShift').value : 'all';
      const filterSearchKeyword = document.getElementById('filterSearchKeyword') ? document.getElementById('filterSearchKeyword').value.trim() : '';
      const filterBranch = document.getElementById('filterBranch') ? document.getElementById('filterBranch').value : 'all';
      const filterSection = document.getElementById('filterSection') ? document.getElementById('filterSection').value : 'all';
      const filterJobTitle = document.getElementById('filterJobTitle') ? document.getElementById('filterJobTitle').value : 'all';
      
      const isFilterActive = (filterStaffShift !== 'all') || (filterSearchKeyword !== '') || (filterBranch !== 'all') || (filterSection !== 'all') || (filterJobTitle !== 'all');
      
      if (isFilterActive) {
        const parts = [];
        if (filterStaffShift !== 'all') parts.push(filterStaffShift);
        if (filterBranch !== 'all') parts.push(filterBranch);
        if (filterSection !== 'all') parts.push(filterSection);
        if (filterJobTitle !== 'all') parts.push(filterJobTitle);
        if (filterSearchKeyword !== '') parts.push(\`"\${filterSearchKeyword}"\`);
        displayEl.textContent = \`\${dateStr} • \${parts.join(', ')}\`;
      } else {
        displayEl.textContent = \`\${dateStr} • All Companies\`;
      }
    }`;

  const newTextDisplay = `    function updateFilterTextDisplay() {
      const displayEl = document.getElementById('currentFilterTextDisplay');
      if (!displayEl) return;
      const options = { day: '2-digit', month: 'short', year: 'numeric' };
      const dateStr = currentDate.toLocaleDateString('en-GB', options);
      
      const filterStaffShift = document.getElementById('filterStaffShift') ? document.getElementById('filterStaffShift').value : 'all';
      const filterDepartment = document.getElementById('filterDepartment') ? document.getElementById('filterDepartment').value : 'all';
      const filterBranch = document.getElementById('filterBranch') ? document.getElementById('filterBranch').value : 'all';
      const filterSection = document.getElementById('filterSection') ? document.getElementById('filterSection').value : 'all';
      const filterCostCentre = document.getElementById('filterCostCentre') ? document.getElementById('filterCostCentre').value : 'all';
      
      const isFilterActive = (filterStaffShift !== 'all') || (filterDepartment !== 'all') || (filterBranch !== 'all') || (filterSection !== 'all') || (filterCostCentre !== 'all');
      
      if (isFilterActive) {
        const parts = [];
        if (filterStaffShift !== 'all') parts.push(filterStaffShift);
        if (filterDepartment !== 'all') parts.push(filterDepartment);
        if (filterBranch !== 'all') parts.push(filterBranch);
        if (filterSection !== 'all') parts.push(filterSection);
        if (filterCostCentre !== 'all') parts.push(filterCostCentre);
        displayEl.textContent = \`\${dateStr} • \${parts.join(', ')}\`;
      } else {
        displayEl.textContent = \`\${dateStr} • All Companies\`;
      }
    }`;

  if (content.includes(oldTextDisplay)) {
    content = content.replace(oldTextDisplay, newTextDisplay);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Updated filter JS for " + filename);
}

updateFile('shift-plan.html');
updateFile('ot-plan.html');
