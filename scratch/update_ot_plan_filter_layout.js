const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../modules/attendance/options/ot-plan.html');
let content = fs.readFileSync(filePath, 'utf8');

const oldTopControls = `      <!-- Date Switcher & Filter Button Row -->
      <div style="display: flex; gap: 8px; margin-bottom: 12px; align-items: center;">
        <div class="date-switcher-card" style="flex: 1;">
          <button class="date-nav-btn" onclick="changeDate(-1)" aria-label="Previous Date">
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <div class="date-current-badge">
            <i class="fa-solid fa-calendar-days" style="color: var(--purple-primary); font-size: 14px;"></i>
            <span id="currentDateDisplay">Wed, 23 Sep 2026</span>
          </div>
          <button class="date-nav-btn" onclick="changeDate(1)" aria-label="Next Date">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>

        <!-- Filter Trigger Button Card -->
        <button type="button" class="filter-trigger-btn" onclick="openFilterModal()" aria-label="Filter Roster" title="Filter Roster">
          <i class="fa-solid fa-sliders"></i>
        </button>
      </div>`;

const newTopControls = `      <!-- TOP CONTROL ROW BELOW HEADER: Date Switcher & Filter Info -->
      <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px;">
        
        <!-- Date Navigator Card -->
        <div class="date-switcher-card">
          <button class="date-nav-btn" onclick="changeDate(-1)" aria-label="Previous Date">
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <div class="date-current-badge">
            <i class="fa-solid fa-calendar-days" style="color: var(--purple-primary); font-size: 14px;"></i>
            <span id="currentDateDisplay">Wed, 23 Sep 2026</span>
          </div>
          <button class="date-nav-btn" onclick="changeDate(1)" aria-label="Next Date">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>

        <!-- Filter Trigger Card -->
        <div class="date-switcher-card" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; text-align: left; cursor: pointer;" onclick="openFilterModal()">
          <div style="display: flex; flex-direction: column; gap: 3px; flex: 1;">
            <div style="font-size: 10px; font-weight: 800; color: var(--purple-primary); text-transform: uppercase; letter-spacing: 0.5px;">Current Filter</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px;" id="currentFilterTextDisplay">23 Sep 2026 • All Companies</div>
          </div>
          <button type="button" class="filter-trigger-btn" aria-label="Filter Roster" title="Filter Roster" style="margin: 0; pointer-events: none;">
            <i class="fa-solid fa-sliders"></i>
          </button>
        </div>
      </div>`;

content = content.replace(/\r\n/g, '\n');
const normOld = oldTopControls.replace(/\r\n/g, '\n');

if (!content.includes(normOld)) {
  console.error("Could not find oldTopControls");
} else {
  content = content.replace(normOld, newTopControls);
}

// Update filter text in JS
const oldFilterBtnLogic = `      const filterBtn = document.querySelector('.icon-btn-ghost[title="Filter Roster"]');
      if (filterBtn) {
        if (isFilterActive) {
          filterBtn.style.background = 'var(--purple-primary)';
          filterBtn.style.color = '#ffffff';
          filterBtn.style.borderColor = 'var(--purple-primary)';
        } else {
          filterBtn.style.background = '';
          filterBtn.style.color = '';
          filterBtn.style.borderColor = '';
        }
      }`;

const newFilterBtnLogic = `      const filterDisplayText = document.getElementById('currentFilterTextDisplay');
      if (filterDisplayText) {
        if (isFilterActive) {
          const parts = [];
          if (filterStaffShift !== 'all') parts.push(\`Shift: \${filterStaffShift}\`);
          if (filterBranch !== 'all') parts.push(\`Branch: \${filterBranch}\`);
          if (filterSection !== 'all') parts.push(\`Section: \${filterSection}\`);
          if (filterJobTitle !== 'all') parts.push(\`Title: \${filterJobTitle}\`);
          if (filterSearchKeyword !== '') parts.push(\`"\${filterSearchKeyword}"\`);
          filterDisplayText.textContent = parts.join(' • ');
        } else {
          filterDisplayText.textContent = '23 Sep 2026 • All Companies';
        }
      }`;

const normOldFilterBtn = oldFilterBtnLogic.replace(/\r\n/g, '\n');
if (content.includes(normOldFilterBtn)) {
  content = content.replace(normOldFilterBtn, newFilterBtnLogic);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully updated top filter layout in ot-plan.html");
