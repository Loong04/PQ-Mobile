const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../modules/attendance/options/ot-plan.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. New summaryTabView content
const oldSummaryTab = `<div id="summaryTabView" style="display: none;">
        
        <!-- Total OT Summary Card -->
        <div class="card" style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.16) 0%, rgba(109, 40, 217, 0.06) 100%); border-color: rgba(124, 58, 237, 0.3);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div style="font-size: 11.5px; font-weight: 700; color: var(--purple-primary); text-transform: uppercase;">Total Planned Overtime</div>
              <div style="font-size: 26px; font-weight: 900; color: var(--text-primary); margin-top: 2px;" id="summaryTotalHours">5.0 Hours</div>
              <div style="font-size: 11px; font-weight: 600; color: var(--text-muted); margin-top: 2px;" id="summaryTotalStaff">2 Staff Selected</div>
            </div>
            <!-- AGENTS.md View Chart Button Standard -->
            <button type="button" class="view-chart-btn" onclick="openChartModal()">
              <i class="fa-solid fa-chart-pie"></i><span>View Chart</span>
            </button>
          </div>
        </div>

        <!-- Estimated Cost Breakdown Card -->
        <div class="card">
          <div style="font-size: 13.5px; font-weight: 800; color: var(--text-primary); margin-bottom: 10px;">OT Cost Breakdown</div>
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12.5px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-muted); font-weight: 600;">OT 1.5 Rate (1.5x)</span>
              <span style="font-weight: 800; color: var(--text-primary);">RM 17.28 / hr</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed var(--border-subtle); padding-top: 8px;">
              <span style="color: var(--text-muted); font-weight: 600;">Total Estimated Cost</span>
              <span style="font-weight: 800; color: var(--purple-primary);" id="summaryTotalCost">RM 86.40</span>
            </div>
          </div>
        </div>

      </div>`;

const newSummaryTab = `<div id="summaryTabView" style="display: none; padding-bottom: 24px;">

        <!-- 1. HERO TOTAL OVERVIEW CARD WITH VIEW CHART BUTTON (AGENTS.MD STANDARD) -->
        <div class="history-card-item" style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.14) 0%, rgba(109, 40, 217, 0.05) 100%); border: 1px solid rgba(124, 58, 237, 0.3); border-radius: 20px; padding: 16px 18px; margin-bottom: 14px; box-shadow: var(--shadow-sm); cursor: default;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div style="font-size: 11px; font-weight: 800; color: var(--purple-primary); text-transform: uppercase; letter-spacing: 0.6px;">Total Planned Overtime</div>
              <div style="font-size: 28px; font-weight: 900; color: var(--text-primary); margin: 2px 0;" id="summaryTotalHours">127.00 Hours</div>
              <div style="font-size: 11.5px; font-weight: 600; color: var(--text-muted); display: flex; align-items: center; gap: 8px;">
                <span><i class="fa-regular fa-calendar" style="margin-right: 4px;"></i><span id="summaryTotalStaff">73 Staff Selected</span></span>
                <span>&bull;</span>
                <span id="summaryTotalDate">23 Sep 2026</span>
              </div>
            </div>

            <!-- AGENTS.md View Chart Button Presentation Standard -->
            <button type="button" class="view-chart-btn" onclick="openChartModal()" title="View Chart">
              <i class="fa-solid fa-chart-pie"></i><span>View Chart</span>
            </button>
          </div>
        </div>

        <!-- 2. ESTIMATED COST BREAKDOWN CARD -->
        <div class="card" style="margin-bottom: 14px;">
          <div style="font-size: 13.5px; font-weight: 800; color: var(--text-primary); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-calculator" style="color: var(--purple-primary);"></i>
            <span>OT Cost Breakdown</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12.5px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-muted); font-weight: 600;">OT 1.5 Rate (1.5x)</span>
              <span style="font-weight: 800; color: var(--text-primary);">RM 17.28 / hr</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-muted); font-weight: 600;">OT 2.0 Rate (2.0x)</span>
              <span style="font-weight: 800; color: var(--text-primary);">RM 23.04 / hr</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed var(--border-subtle); padding-top: 8px;">
              <span style="color: var(--text-muted); font-weight: 600;">Total Estimated Cost</span>
              <span style="font-weight: 800; color: var(--purple-primary);" id="summaryTotalCost">RM 2,367.36</span>
            </div>
          </div>
        </div>

        <!-- 3. OT BREAKDOWN DATA TABLE HEADER -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding: 0 4px;">
          <div style="font-size: 13.5px; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-table-list" style="color: var(--purple-primary);"></i>
            <span>OT Breakdown Table</span>
          </div>
          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); background: var(--bg-card); padding: 4px 10px; border-radius: 10px; border: 1px solid var(--border-subtle);">
            3 OT Types
          </div>
        </div>

        <!-- 4. OT BREAKDOWN TABLE -->
        <div class="summary-table-card">
          <div class="summary-table-hdr">
            <div>OT Type</div>
            <div>Job Title</div>
            <div style="text-align: right;">Staff</div>
            <div style="text-align: right;">Hours</div>
          </div>
          <div id="summaryOtTableRows">
            <div class="summary-table-row">
              <div><span class="table-shift-badge amber">OT 1.5 BEFORE</span></div>
              <div style="font-weight: 800; font-size: 12px;">ACCOUNT EXEC</div>
              <div style="text-align: right; font-weight: 800;">28</div>
              <div style="text-align: right; font-weight: 800; color: var(--purple-primary);">45.00</div>
            </div>
            <div class="summary-table-row">
              <div><span class="table-shift-badge purple">OT 1.5 AFTER</span></div>
              <div style="font-weight: 800; font-size: 12px;">BARISTA OPERATIONS</div>
              <div style="text-align: right; font-weight: 800;">35</div>
              <div style="text-align: right; font-weight: 800; color: var(--purple-primary);">62.00</div>
            </div>
            <div class="summary-table-row">
              <div><span class="table-shift-badge blue">OT 2.0 REST DAY</span></div>
              <div style="font-weight: 800; font-size: 12px;">QA ENGINEER</div>
              <div style="text-align: right; font-weight: 800;">10</div>
              <div style="text-align: right; font-weight: 800; color: var(--purple-primary);">20.00</div>
            </div>
          </div>
          <div class="summary-table-footer">
            <div style="color: var(--text-primary);">Total</div>
            <div></div>
            <div style="text-align: right; color: var(--text-primary);">73</div>
            <div style="text-align: right; color: var(--purple-primary);">127.00</div>
          </div>
        </div>

      </div>`;

// 2. New chartModal content
const oldChartModalStart = '  <!-- CHART POPUP MODAL (AGENTS.md View Chart Standard) -->';
const oldChartModalEnd = '  </div>\n\n  <!-- JavaScript Logic -->';

const newChartModal = `  <!-- CHART POPUP MODAL (AGENTS.md View Chart Standard + Donut Chart Display) -->
  <div class="modal-overlay" id="chartModal" onclick="closeModalOnBackdrop(event, 'chartModal')" style="align-items: center; justify-content: center; padding: 16px;">
    <div class="modal-content" onclick="event.stopPropagation()" style="width: 100%; max-width: 360px; background: var(--bg-card); border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); border: 1px solid var(--border-subtle); padding: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="font-size: 16px; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 6px; margin: 0;">
          <i class="fa-solid fa-chart-pie" style="color: #f59e0b;"></i> OT Distribution Chart
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
            <!-- OT 1.5 BEFORE: 35.4% (129.0 of 364.4) -->
            <circle cx="80" cy="80" r="58" fill="transparent" stroke="#f59e0b" stroke-width="24" stroke-dasharray="129.0 364.4" stroke-dashoffset="0"></circle>
            <!-- OT 1.5 AFTER: 48.8% (177.8 of 364.4) -->
            <circle cx="80" cy="80" r="58" fill="transparent" stroke="#7c3aed" stroke-width="24" stroke-dasharray="177.8 364.4" stroke-dashoffset="-129.0"></circle>
            <!-- OT 2.0 REST DAY: 15.8% (57.6 of 364.4) -->
            <circle cx="80" cy="80" r="58" fill="transparent" stroke="#3b82f6" stroke-width="24" stroke-dasharray="57.6 364.4" stroke-dashoffset="-306.8"></circle>
          </svg>
          <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="font-size: 20px; font-weight: 900; color: var(--text-primary);">127.0h</div>
            <div style="font-size: 10px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Total OT</div>
          </div>
        </div>

        <div style="width: 100%; display: flex; flex-direction: column; gap: 10px; background: var(--bg-input); padding: 12px; border-radius: 14px; border: 1px solid var(--border-subtle);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 12px; height: 12px; background: #f59e0b; border-radius: 3px;"></div>
              <span style="font-size: 12px; font-weight: 800; color: var(--text-primary);">OT 1.5 BEFORE WORK</span>
            </div>
            <span style="font-size: 12px; font-weight: 800; color: #f59e0b;">35.4% (45.0h)</span>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 12px; height: 12px; background: #7c3aed; border-radius: 3px;"></div>
              <span style="font-size: 12px; font-weight: 800; color: var(--text-primary);">OT 1.5 AFTER WORK</span>
            </div>
            <span style="font-size: 12px; font-weight: 800; color: var(--purple-primary);">48.8% (62.0h)</span>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 12px; height: 12px; background: #3b82f6; border-radius: 3px;"></div>
              <span style="font-size: 12px; font-weight: 800; color: var(--text-primary);">OT 2.0 REST DAY</span>
            </div>
            <span style="font-size: 12px; font-weight: 800; color: #3b82f6;">15.8% (20.0h)</span>
          </div>
        </div>
      </div>
    </div>
  </div>`;

// Normalize \r\n to \n for replacement
const normContent = content.replace(/\r\n/g, '\n');
const normOldTab = oldSummaryTab.replace(/\r\n/g, '\n');

if (!normContent.includes(normOldTab)) {
  console.error("Could not find oldSummaryTab in ot-plan.html");
} else {
  content = normContent.replace(normOldTab, newSummaryTab);
}

// Replace chart modal
const chartRegex = /<!-- CHART POPUP MODAL [\s\S]*?<\/div>\s*<\/div>\s*<!-- JavaScript Logic -->/;
if (!chartRegex.test(content)) {
  console.error("Could not match chartModal regex");
} else {
  content = content.replace(chartRegex, newChartModal + '\n\n  <!-- JavaScript Logic -->');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully updated ot-plan.html");
