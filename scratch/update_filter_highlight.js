const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Remove old Filter Trigger Card from the top
    const oldFilterRegex = /<!-- Filter Trigger Card -->\s*<div class="date-switcher-card"[^>]*onclick="openFilterModal\(\)"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
    // Wait, the div structure is:
    /*
      <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px;">
        <!-- Date Navigator Card -->
        ...
        <!-- Filter Trigger Card -->
        <div class="date-switcher-card" ...>...</div>
      </div>
    */
    // I will just replace the Filter Trigger Card with nothing.
    content = content.replace(/<!-- Filter Trigger Card -->[\s\S]*?<\/button>\s*<\/div>\s*/g, '');

    // 2. Insert the Consistent Standard Filter Bar into the staffTabView
    const filterHtml = `
        <!-- Consistent Standard Filter Bar -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 18px; padding: 12px 16px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;" onclick="openFilterModal()">
          <div style="flex: 1; min-width: 0; padding-right: 12px;">
            <div style="font-size: 10.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Current Filter</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="currentFilterTextDisplay">23 Sep 2026 • All Companies</div>
          </div>
          <button type="button" style="width: 40px; height: 40px; border-radius: 14px; background: var(--bg-input); border: 1px solid var(--border-subtle); color: var(--purple-primary); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.15s; flex-shrink: 0;" title="Open Filter Options" onmousedown="this.style.transform='scale(0.94)'" onmouseup="this.style.transform='scale(1)'">
            <i class="fa-solid fa-sliders" style="font-size: 16px;"></i>
          </button>
        </div>
`;
    // Insert into staffTabView where <!-- Old filter summary bar removed --> is
    content = content.replace(/<!-- Old filter summary bar removed -->/, filterHtml);

    // 3. Add CSS for cal-summary column highlighting
    const cssToAdd = `
    .cal-summary-col {
      display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer;
      padding: 6px 4px;
      border-radius: 16px;
      border: 1.5px solid transparent;
      transition: all 0.2s ease;
    }
    .cal-summary-col.active {
      border-color: var(--purple-primary);
      background: rgba(124, 58, 237, 0.08);
    }
    .cal-summary-col.active > div:last-child {
      background: var(--purple-primary) !important;
      color: #ffffff !important;
      border-color: var(--purple-primary) !important;
    }
`;
    content = content.replace(/(<style>)/, `$1\n${cssToAdd}`);

    // 4. Update the 4 columns html to use the class and add onclick logic
    // They look like: <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer;" onclick="switchMainTab('staff')">
    let colIndex = 0;
    content = content.replace(/<div style="display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer;" onclick="switchMainTab\('staff'\)">/g, () => {
        colIndex++;
        return `<div class="cal-summary-col" onclick="selectCalSummary(this); switchMainTab('staff')">`;
    });

    // 5. Add the javascript function for selectCalSummary
    const jsToAdd = `
    function selectCalSummary(element) {
      document.querySelectorAll('.cal-summary-col').forEach(el => el.classList.remove('active'));
      element.classList.add('active');
    }
`;
    content = content.replace(/(<\/script>)/, `${jsToAdd}\n$1`);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath);
}

const shiftPlanPath = path.join('C:', 'Users', 'loong', 'PQ-Mobile', 'modules', 'attendance', 'options', 'shift-plan.html');
const otPlanPath = path.join('C:', 'Users', 'loong', 'PQ-Mobile', 'modules', 'attendance', 'options', 'ot-plan.html');

processFile(shiftPlanPath);
processFile(otPlanPath);
