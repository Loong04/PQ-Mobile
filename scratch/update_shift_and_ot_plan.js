const fs = require('fs');
const path = require('path');

// ================= 1. UPDATE SHIFT-PLAN.HTML =================
const shiftPath = path.join(__dirname, '../modules/attendance/options/shift-plan.html');
let shiftContent = fs.readFileSync(shiftPath, 'utf8').replace(/\r\n/g, '\n');

// 1a. Replace Filter Modal Body in shift-plan.html with requested 6 fields:
// Date, Shift Type, Department, Branch, Section, Cost Centre
const newFilterModalBody = `<div class="sheet-body" style="padding: 16px 20px; display: flex; flex-direction: column; gap: 14px; max-height: 65vh; overflow-y: auto;">
        <!-- 1. Date -->
        <div>
          <label style="font-size: 11px; font-weight: 800; color: #a78bfa; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">Date</label>
          <input type="date" id="filterDate" value="2026-09-23" style="width: 100%; padding: 12px; border-radius: 12px; background: var(--bg-card); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 13px; font-weight: 700; outline: none;">
        </div>

        <!-- 2. Shift Type -->
        <div>
          <label style="font-size: 11px; font-weight: 800; color: #a78bfa; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">Shift Type</label>
          <select id="filterStaffShift" style="width: 100%; padding: 12px; border-radius: 12px; background: var(--bg-card); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 13px; font-weight: 700; outline: none;">
            <option value="all">- All Shift Types -</option>
            <option value="W01">W01 · Morning Shift (8:30 AM – 5:30 PM)</option>
            <option value="W02">W02 · Regular Day (9:00 AM – 6:00 PM)</option>
            <option value="W03">W03 · Night Shift (10:00 PM – 7:00 AM)</option>
            <option value="OFF">OFF · Rest / Off Day</option>
          </select>
        </div>

        <!-- 3. Department -->
        <div>
          <label style="font-size: 11px; font-weight: 800; color: #a78bfa; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">Department</label>
          <select id="filterDepartment" style="width: 100%; padding: 12px; border-radius: 12px; background: var(--bg-card); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 13px; font-weight: 700; outline: none;">
            <option value="all">- All Departments -</option>
            <option value="Operations">Operations</option>
            <option value="Finance & Accounting">Finance & Accounting</option>
            <option value="Human Resource">Human Resource</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Logistics">Logistics & Warehouse</option>
          </select>
        </div>

        <!-- 4. Branch -->
        <div>
          <label style="font-size: 11px; font-weight: 800; color: #a78bfa; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">Branch</label>
          <select id="filterBranch" style="width: 100%; padding: 12px; border-radius: 12px; background: var(--bg-card); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 13px; font-weight: 700; outline: none;">
            <option value="all">- All Branches -</option>
            <option value="HQ">Headquarters (HQ)</option>
            <option value="TS">Times Square Branch</option>
            <option value="MV">Mid Valley Branch</option>
            <option value="SP">Sunway Pyramid Branch</option>
          </select>
        </div>

        <!-- 5. Section -->
        <div>
          <label style="font-size: 11px; font-weight: 800; color: #a78bfa; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">Section</label>
          <select id="filterSection" style="width: 100%; padding: 12px; border-radius: 12px; background: var(--bg-card); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 13px; font-weight: 700; outline: none;">
            <option value="all">- All Sections -</option>
            <option value="Admin">Admin Executive</option>
            <option value="Barista">Barista Operations</option>
            <option value="Account">Finance & Accounting</option>
            <option value="IT">IT Support & QA</option>
            <option value="HR">Human Resource</option>
          </select>
        </div>

        <!-- 6. Cost Centre -->
        <div>
          <label style="font-size: 11px; font-weight: 800; color: #a78bfa; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">Cost Centre</label>
          <select id="filterCostCentre" style="width: 100%; padding: 12px; border-radius: 12px; background: var(--bg-card); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 13px; font-weight: 700; outline: none;">
            <option value="all">- All Cost Centres -</option>
            <option value="CC1001">CC1001 · HQ Admin</option>
            <option value="CC2002">CC2002 · TS Retail Store</option>
            <option value="CC3003">CC3003 · MV Retail Store</option>
            <option value="CC4004">CC4004 · SP Retail Store</option>
            <option value="CC5005">CC5005 · Central Warehouse</option>
          </select>
        </div>
      </div>`;

const filterBodyRegex = /<div class="sheet-body" style="padding: 16px 20px; display: flex; flex-direction: column; gap: 14px; max-height: 65vh; overflow-y: auto;">[\s\S]*?<\/div>\s*<div class="sheet-footer"/;

shiftContent = shiftContent.replace(filterBodyRegex, newFilterModalBody + '\n      <div class="sheet-footer"');

// 1b. Replace summaryTabView in shift-plan.html to show Donut Chart directly inline outside!
const newShiftSummaryTab = `<div id="summaryTabView" style="display: none; padding-bottom: 24px;">

        <!-- 1. HERO TOTAL OVERVIEW CARD WITH INLINE DONUT CHART -->
        <div class="history-card-item" style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.14) 0%, rgba(109, 40, 217, 0.05) 100%); border: 1px solid rgba(124, 58, 237, 0.3); border-radius: 20px; padding: 18px; margin-bottom: 14px; box-shadow: var(--shadow-sm); cursor: default; flex-direction: column; align-items: stretch; gap: 16px;">
          <!-- Top Header Row -->
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

          <!-- Inline Donut Chart & Legend Display (Outside directly on Summary Tab) -->
          <div style="display: flex; flex-direction: column; align-items: center; gap: 14px; padding-top: 14px; border-top: 1px dashed var(--border-subtle);">
            <div style="position: relative; width: 150px; height: 150px;">
              <svg width="150" height="150" viewBox="0 0 160 160" style="transform: rotate(-90deg);">
                <circle cx="80" cy="80" r="58" fill="transparent" stroke="var(--border-subtle)" stroke-width="22" opacity="0.3"></circle>
                <circle cx="80" cy="80" r="58" fill="transparent" stroke="#06b6d4" stroke-width="22" stroke-dasharray="347.8 364.4" stroke-dashoffset="0"></circle>
                <circle cx="80" cy="80" r="58" fill="transparent" stroke="#f43f5e" stroke-width="22" stroke-dasharray="16.5 364.4" stroke-dashoffset="-347.8"></circle>
              </svg>
              <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div style="font-size: 20px; font-weight: 900; color: var(--text-primary);">287</div>
                <div style="font-size: 9.5px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Total Staff</div>
              </div>
            </div>

            <!-- Legend Container -->
            <div style="width: 100%; display: flex; flex-direction: column; gap: 8px; background: var(--bg-card); padding: 12px; border-radius: 14px; border: 1px solid var(--border-subtle);">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 10px; height: 10px; background: #06b6d4; border-radius: 3px;"></div>
                  <span style="font-size: 12px; font-weight: 800; color: var(--text-primary);">OFF DAY</span>
                </div>
                <span style="font-size: 12px; font-weight: 800; color: #06b6d4;">95.5% (274 Staff)</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 10px; height: 10px; background: #f43f5e; border-radius: 3px;"></div>
                  <span style="font-size: 12px; font-weight: 800; color: var(--text-primary);">W02 · REGULAR DAY</span>
                </div>
                <span style="font-size: 12px; font-weight: 800; color: #f43f5e;">4.5% (13 Staff)</span>
              </div>
            </div>
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
              <div style="font-weight: 800; font-size: 12.5px;">BARISTA</div>
              <div style="text-align: right; font-weight: 800; color: var(--text-primary);">40.00</div>
            </div>
            <div class="summary-table-row">
              <div><span class="table-shift-badge cyan">OFF DAY</span></div>
              <div style="font-weight: 800; font-size: 12.5px;">SHIFT SUPERVISOR</div>
              <div style="text-align: right; font-weight: 800; color: var(--text-primary);">7.00</div>
            </div>
          </div>
          <!-- Table Footer -->
          <div class="summary-table-footer">
            <div style="color: var(--text-primary);">Total</div>
            <div></div>
            <div style="text-align: right; color: var(--purple-primary);" id="summaryTableTotalHeadcount">287.00</div>
          </div>
        </div>

      </div>`;

const shiftSummaryTabRegex = /<div id="summaryTabView" style="display: none; padding-bottom: 24px;">[\s\S]*?<\/div>\s*<\/div>\s*<!-- Sticky Bottom Action Bar/;

shiftContent = shiftContent.replace(shiftSummaryTabRegex, newShiftSummaryTab + '\n\n    <!-- Sticky Bottom Action Bar');

fs.writeFileSync(shiftPath, shiftContent, 'utf8');
console.log("Successfully updated shift-plan.html");


// ================= 2. UPDATE OT-PLAN.HTML =================
const otPath = path.join(__dirname, '../modules/attendance/options/ot-plan.html');
let otContent = fs.readFileSync(otPath, 'utf8').replace(/\r\n/g, '\n');

otContent = otContent.replace(filterBodyRegex, newFilterModalBody + '\n      <div class="sheet-footer"');

const newOtSummaryTab = `<div id="summaryTabView" style="display: none; padding-bottom: 24px;">

        <!-- 1. HERO TOTAL OVERVIEW CARD WITH INLINE DONUT CHART (AGENTS.MD STANDARD) -->
        <div class="history-card-item" style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.14) 0%, rgba(109, 40, 217, 0.05) 100%); border: 1px solid rgba(124, 58, 237, 0.3); border-radius: 20px; padding: 18px; margin-bottom: 14px; box-shadow: var(--shadow-sm); cursor: default; flex-direction: column; align-items: stretch; gap: 16px;">
          <!-- Top Row Header -->
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

          <!-- Inline Donut Chart & Legend Display (Outside directly on Summary Tab) -->
          <div style="display: flex; flex-direction: column; align-items: center; gap: 14px; padding-top: 14px; border-top: 1px dashed var(--border-subtle);">
            <div style="position: relative; width: 150px; height: 150px;">
              <svg width="150" height="150" viewBox="0 0 160 160" style="transform: rotate(-90deg);">
                <circle cx="80" cy="80" r="58" fill="transparent" stroke="var(--border-subtle)" stroke-width="22" opacity="0.3"></circle>
                <!-- OT 1.5 BEFORE: 35.4% (129.0 of 364.4) -->
                <circle cx="80" cy="80" r="58" fill="transparent" stroke="#f59e0b" stroke-width="22" stroke-dasharray="129.0 364.4" stroke-dashoffset="0"></circle>
                <!-- OT 1.5 AFTER: 48.8% (177.8 of 364.4) -->
                <circle cx="80" cy="80" r="58" fill="transparent" stroke="#7c3aed" stroke-width="22" stroke-dasharray="177.8 364.4" stroke-dashoffset="-129.0"></circle>
                <!-- OT 2.0 REST DAY: 15.8% (57.6 of 364.4) -->
                <circle cx="80" cy="80" r="58" fill="transparent" stroke="#3b82f6" stroke-width="22" stroke-dasharray="57.6 364.4" stroke-dashoffset="-306.8"></circle>
              </svg>
              <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div style="font-size: 20px; font-weight: 900; color: var(--text-primary);">127.0h</div>
                <div style="font-size: 9.5px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Total OT</div>
              </div>
            </div>

            <!-- Legend Container -->
            <div style="width: 100%; display: flex; flex-direction: column; gap: 8px; background: var(--bg-card); padding: 12px; border-radius: 14px; border: 1px solid var(--border-subtle);">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 10px; height: 10px; background: #f59e0b; border-radius: 3px;"></div>
                  <span style="font-size: 12px; font-weight: 800; color: var(--text-primary);">OT 1.5 BEFORE WORK</span>
                </div>
                <span style="font-size: 12px; font-weight: 800; color: #f59e0b;">35.4% (45.0h)</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 10px; height: 10px; background: #7c3aed; border-radius: 3px;"></div>
                  <span style="font-size: 12px; font-weight: 800; color: var(--text-primary);">OT 1.5 AFTER WORK</span>
                </div>
                <span style="font-size: 12px; font-weight: 800; color: var(--purple-primary);">48.8% (62.0h)</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 10px; height: 10px; background: #3b82f6; border-radius: 3px;"></div>
                  <span style="font-size: 12px; font-weight: 800; color: var(--text-primary);">OT 2.0 REST DAY</span>
                </div>
                <span style="font-size: 12px; font-weight: 800; color: #3b82f6;">15.8% (20.0h)</span>
              </div>
            </div>
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

const otSummaryTabRegex = /<div id="summaryTabView" style="display: none; padding-bottom: 24px;">[\s\S]*?<\/div>\s*<\/div>\s*<!-- Sticky Bottom Action Bar/;

otContent = otContent.replace(otSummaryTabRegex, newOtSummaryTab + '\n\n    <!-- Sticky Bottom Action Bar');

fs.writeFileSync(otPath, otContent, 'utf8');
console.log("Successfully updated ot-plan.html");
