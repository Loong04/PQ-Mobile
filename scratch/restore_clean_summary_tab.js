const fs = require('fs');
const path = require('path');

const shiftPlanPath = path.resolve(__dirname, '../modules/attendance/options/shift-plan.html');

const cleanSummaryTabViewHtml = `
      <!-- ================= 3. SUMMARY TAB CONTENT ================= -->
      <div id="summaryTabView" style="display: none; padding-bottom: 24px;">

        <!-- 1. HERO TOTAL OVERVIEW CARD WITH VIEW CHART BUTTON (AGENTS.MD STANDARD) -->
        <div class="history-card-item" style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.14) 0%, rgba(109, 40, 217, 0.05) 100%); border: 1px solid rgba(124, 58, 237, 0.3); border-radius: 20px; padding: 16px 18px; margin-bottom: 14px; box-shadow: var(--shadow-sm); cursor: default;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div style="font-size: 11px; font-weight: 800; color: var(--purple-primary); text-transform: uppercase; letter-spacing: 0.6px;">Total Headcount</div>
              <div style="font-size: 28px; font-weight: 900; color: var(--text-primary); margin: 2px 0;" id="kpiTotalHeadcount">287 Staff</div>
              <div style="font-size: 11.5px; font-weight: 600; color: var(--text-muted); display: flex; align-items: center; gap: 8px;">
                <span><i class="fa-regular fa-calendar" style="margin-right: 4px;"></i><span id="kpiDateSubtitle">23 Sep 2026</span></span>
                <span>&bull;</span>
                <span><span id="kpiShiftCount" style="color: var(--purple-primary); font-weight: 800;">2</span> Shifts</span>
              </div>
            </div>

            <!-- AGENTS.md View Chart Button Presentation Standard -->
            <button type="button" class="view-chart-btn" onclick="openChartModal()" title="View Chart">
              <i class="fa-solid fa-chart-pie"></i><span>View Chart</span>
            </button>
          </div>
        </div>

        <!-- 2. SHIFT SUMMARY DATA TABLE HEADER -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding: 0 4px;">
          <div style="font-size: 13.5px; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-table-list" style="color: var(--purple-primary);"></i>
            <span>Shift Breakdown Table</span>
          </div>
          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); background: var(--bg-card); padding: 4px 10px; border-radius: 10px; border: 1px solid var(--border-subtle);" id="tableRecordCountBadge">
            11 Records
          </div>
        </div>

        <!-- 3. SHIFT SUMMARY DATA TABLE (TABLE SHOW GRID) -->
        <div class="summary-table-card">
          <!-- Table Header -->
          <div class="summary-table-hdr">
            <div>Shift</div>
            <div>Job Title</div>
            <div style="text-align: right;">Headcount</div>
          </div>

          <!-- Table Body Rows -->
          <div id="summaryTableRowsContainer">
            <div class="summary-table-row">
              <div><span class="table-shift-badge rose">N/A</span></div>
              <div style="font-weight: 800; font-size: 12.5px;">ACCOUNT EXECUTIVE</div>
              <div style="text-align: right; font-weight: 800; color: var(--text-primary);">3.00</div>
            </div>
            <div class="summary-table-row">
              <div><span class="table-shift-badge rose">N/A</span></div>
              <div style="font-weight: 800; font-size: 12.5px;">BARTENDER</div>
              <div style="text-align: right; font-weight: 800; color: var(--text-primary);">1.00</div>
            </div>
            <div class="summary-table-row">
              <div><span class="table-shift-badge rose">N/A</span></div>
              <div style="font-weight: 800; font-size: 12.5px;">PRODUCTION OPERATOR</div>
              <div style="text-align: right; font-weight: 800; color: var(--text-primary);">4.00</div>
            </div>
            <div class="summary-table-row">
              <div><span class="table-shift-badge rose">N/A</span></div>
              <div style="font-weight: 800; font-size: 12.5px;">QUALITY CHECKER</div>
              <div style="text-align: right; font-weight: 800; color: var(--text-primary);">2.00</div>
            </div>
            <div class="summary-table-row">
              <div><span class="table-shift-badge rose">N/A</span></div>
              <div style="font-weight: 800; font-size: 12.5px;">OPERATION DIRECTOR</div>
              <div style="text-align: right; font-weight: 800; color: var(--text-primary);">1.00</div>
            </div>
            <div class="summary-table-row">
              <div><span class="table-shift-badge rose">N/A</span></div>
              <div style="font-weight: 800; font-size: 12.5px;">CLEANING SPECIALIST</div>
              <div style="text-align: right; font-weight: 800; color: var(--text-primary);">2.00</div>
            </div>
            <div class="summary-table-row">
              <div><span class="table-shift-badge cyan">OFF DAY</span></div>
              <div style="font-weight: 800; font-size: 12.5px;">PRODUCTION OPERATOR</div>
              <div style="text-align: right; font-weight: 800; color: var(--text-primary);">180.00</div>
            </div>
            <div class="summary-table-row">
              <div><span class="table-shift-badge cyan">OFF DAY</span></div>
              <div style="font-weight: 800; font-size: 12.5px;">SENIOR BARISTA</div>
              <div style="text-align: right; font-weight: 800; color: var(--text-primary);">35.00</div>
            </div>
            <div class="summary-table-row">
              <div><span class="table-shift-badge cyan">OFF DAY</span></div>
              <div style="font-weight: 800; font-size: 12.5px;">HR EXECUTIVE</div>
              <div style="text-align: right; font-weight: 800; color: var(--text-primary);">12.00</div>
            </div>
            <div class="summary-table-row">
              <div><span class="table-shift-badge cyan">OFF DAY</span></div>
              <div style="font-weight: 800; font-size: 12.5px;">ACCOUNT EXECUTIVE</div>
              <div style="text-align: right; font-weight: 800; color: var(--text-primary);">15.00</div>
            </div>
            <div class="summary-table-row">
              <div><span class="table-shift-badge cyan">OFF DAY</span></div>
              <div style="font-weight: 800; font-size: 12.5px;">WAREHOUSE ASSISTANT</div>
              <div style="text-align: right; font-weight: 800; color: var(--text-primary);">32.00</div>
            </div>
          </div>

          <!-- Table Footer Total Row -->
          <div class="summary-table-footer">
            <div style="color: var(--purple-primary); font-weight: 900;">Total</div>
            <div style="color: var(--text-muted); font-size: 11.5px;" id="footerShiftCategorySummary">2 Shifts &bull; 11 Roles</div>
            <div style="text-align: right; color: var(--purple-primary); font-size: 14px; font-weight: 900;" id="footerTotalHeadcount">287.00</div>
          </div>
        </div>

      </div>
`;

// Also check chartModal content in shift-plan.html to make sure it contains the Donut Chart and legend
const chartModalHtml = `
  <!-- CHART POPUP MODAL (View Chart Standard + Donut Chart Display) -->
  <div class="modal-overlay" id="chartModal" onclick="closeModalOnBackdrop(event, 'chartModal')" style="align-items: center; justify-content: center; padding: 16px;">
    <div class="modal-content" onclick="event.stopPropagation()" style="width: 100%; max-width: 360px; background: var(--bg-card); border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); border: 1px solid var(--border-subtle); padding: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="font-size: 16px; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 6px; margin: 0;">
          <i class="fa-solid fa-chart-pie" style="color: #f59e0b;"></i> Roster Distribution Chart
        </h3>
        <button onclick="closeModal('chartModal')" style="width: 28px; height: 28px; border-radius: 50%; background: var(--bg-input); border: 1px solid var(--border-subtle); color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: center;">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Donut Chart & Legend -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 14px;">
        <div style="position: relative; width: 160px; height: 160px;">
          <svg width="160" height="160" viewBox="0 0 160 160" style="transform: rotate(-90deg);">
            <circle cx="80" cy="80" r="58" fill="transparent" stroke="var(--border-subtle)" stroke-width="24" opacity="0.3"></circle>
            <circle cx="80" cy="80" r="58" fill="transparent" stroke="#06b6d4" stroke-width="24" stroke-dasharray="347.8 364.4" stroke-dashoffset="0"></circle>
            <circle cx="80" cy="80" r="58" fill="transparent" stroke="#f43f5e" stroke-width="24" stroke-dasharray="16.5 364.4" stroke-dashoffset="-347.8"></circle>
          </svg>
          <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="font-size: 22px; font-weight: 900; color: var(--text-primary);">287</div>
            <div style="font-size: 10px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Total</div>
          </div>
        </div>

        <div style="width: 100%; display: flex; flex-direction: column; gap: 10px; background: var(--bg-input); padding: 12px; border-radius: 14px; border: 1px solid var(--border-subtle);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 12px; height: 12px; background: #06b6d4; border-radius: 3px;"></div>
              <span style="font-size: 12.5px; font-weight: 800; color: var(--text-primary);">OFF DAY</span>
            </div>
            <span style="font-size: 12.5px; font-weight: 800; color: #06b6d4;">95.47% (274)</span>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 12px; height: 12px; background: #f43f5e; border-radius: 3px;"></div>
              <span style="font-size: 12.5px; font-weight: 800; color: var(--text-primary);">N/A (Unassigned)</span>
            </div>
            <span style="font-size: 12.5px; font-weight: 800; color: #f43f5e;">4.53% (13)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

let content = fs.readFileSync(shiftPlanPath, 'utf8');

const startIdx = content.indexOf('<div id="summaryTabView"');
const endIdx = content.indexOf('<!-- ================= VIEW: WORK SHIFT SUMMARY ================= -->');

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + cleanSummaryTabViewHtml + '\n\n    ' + content.substring(endIdx);
}

// Replace chartModal
const chartModalStart = content.indexOf('<!-- CHART POPUP MODAL');
const chartModalEnd = content.indexOf('</div>\n  </div>', chartModalStart);

if (chartModalStart !== -1 && chartModalEnd !== -1) {
  content = content.substring(0, chartModalStart) + chartModalHtml + content.substring(chartModalEnd + 12);
}

fs.writeFileSync(shiftPlanPath, content, 'utf8');
console.log('Restored clean single-filter summaryTabView and chartModal in shift-plan.html!');
