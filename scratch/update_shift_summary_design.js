const fs = require('fs');
const path = require('path');

const shiftPlanPath = path.resolve(__dirname, '../modules/attendance/options/shift-plan.html');
const shiftSummaryPath = path.resolve(__dirname, '../modules/attendance/options/shift-summary.html');

const updatedSummaryHtml = `
      <!-- ================= 3. SUMMARY TAB CONTENT (MATCHING TARGET DESIGN) ================= -->
      <div id="summaryTabView" style="display: none; padding-bottom: 24px;">

        <!-- 1. DATA FILTER PILL ACCORDION CARD -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 20px; overflow: hidden; margin-bottom: 16px; box-shadow: var(--shadow-sm);">
          <div class="filter-header-bar-pill" onclick="toggleFilterAccordion()" id="filterHeaderBar">
            <span class="filter-header-pill-title">Data Filter</span>
            <div class="filter-header-pill-icon open" id="filterToggleIcon">
              <i class="fa-solid fa-chevron-down"></i>
            </div>
          </div>

          <div id="filterBodyContainer" style="padding: 6px 16px 14px; display: flex; flex-direction: column; gap: 8px;">
            <!-- Date Filter Row -->
            <div class="filter-row-grid">
              <label class="filter-row-label">Date:</label>
              <div class="filter-row-input-wrap">
                <input type="text" id="filterDateDisplay" value="24/09/2026" style="flex: 1; border: none; background: transparent; color: var(--text-primary); font-size: 13px; font-weight: 800; outline: none;" readonly>
                <button type="button" class="date-circle-btn" onclick="adjustDate(-1)" title="Previous Day">
                  <i class="fa-solid fa-arrow-left"></i>
                </button>
                <button type="button" class="date-circle-btn" onclick="adjustDate(1)" title="Next Day">
                  <i class="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>

            <!-- Shift Type Row -->
            <div class="filter-row-grid">
              <label class="filter-row-label">Shift Type:</label>
              <div class="filter-row-input-wrap">
                <select id="filterShiftType" style="flex: 1; border: none; background: transparent; color: var(--text-primary); font-size: 12.5px; font-weight: 700; outline: none;" onchange="applyFilters()">
                  <option value="all">- All Shift Types -</option>
                  <option value="N/A">N/A (Unassigned)</option>
                  <option value="OFF DAY">OFF DAY</option>
                </select>
                <i class="fa-solid fa-circle-xmark" style="color: var(--text-muted); cursor: pointer; font-size: 13px;" onclick="resetShiftTypeFilter()"></i>
              </div>
            </div>

            <!-- Department Row -->
            <div class="filter-row-grid">
              <label class="filter-row-label">Department:</label>
              <div class="filter-row-input-wrap">
                <select id="filterDepartment" style="flex: 1; border: none; background: transparent; color: var(--text-primary); font-size: 12.5px; font-weight: 700; outline: none;" onchange="applyFilters()">
                  <option value="all">- All Departments -</option>
                  <option value="Accounting">Accounting</option>
                  <option value="Operations">Operations</option>
                  <option value="Quality Control">Quality Control</option>
                  <option value="Production">Production</option>
                  <option value="Human Resource">Human Resource</option>
                  <option value="Logistics">Logistics</option>
                </select>
              </div>
            </div>

            <!-- Branch Row -->
            <div class="filter-row-grid">
              <label class="filter-row-label">Branch:</label>
              <div class="filter-row-input-wrap">
                <select id="filterBranch" style="flex: 1; border: none; background: transparent; color: var(--text-primary); font-size: 12.5px; font-weight: 700; outline: none;" onchange="applyFilters()">
                  <option value="all">- All Branches -</option>
                  <option value="HQ Main Branch">HQ Main Branch</option>
                  <option value="Times Square Branch">Times Square Branch</option>
                  <option value="Subang Factory">Subang Factory</option>
                  <option value="Penang Hub">Penang Hub</option>
                </select>
              </div>
            </div>

            <!-- Section Row -->
            <div class="filter-row-grid">
              <label class="filter-row-label">Section:</label>
              <div class="filter-row-input-wrap">
                <select id="filterSection" style="flex: 1; border: none; background: transparent; color: var(--text-primary); font-size: 12.5px; font-weight: 700; outline: none;" onchange="applyFilters()">
                  <option value="all">- All Sections -</option>
                  <option value="General Operations">General Operations</option>
                  <option value="Assembly Line">Assembly Line</option>
                  <option value="Finance Operations">Finance Operations</option>
                </select>
              </div>
            </div>

            <!-- Cost Centre Row -->
            <div class="filter-row-grid">
              <label class="filter-row-label">Cost Centre:</label>
              <div class="filter-row-input-wrap">
                <select id="filterCostCentre" style="flex: 1; border: none; background: transparent; color: var(--text-primary); font-size: 12.5px; font-weight: 700; outline: none;" onchange="applyFilters()">
                  <option value="all">- All Cost Centers -</option>
                  <option value="CC-101 HQ Ops">CC-101 HQ Ops</option>
                  <option value="CC-202 Tech Dept">CC-202 Tech Dept</option>
                  <option value="CC-303 Accounts">CC-303 Accounts</option>
                  <option value="CC-404 Logistics">CC-404 Logistics</option>
                </select>
              </div>
            </div>

            <!-- Action Buttons Row -->
            <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px; padding-top: 8px;">
              <button type="button" class="btn-filter-reset" onclick="resetFilters()" style="padding: 7px 18px; border-radius: 8px; font-size: 12.5px; font-weight: 700;">Reset</button>
              <button type="button" class="btn-filter-search" onclick="applyFilters()" style="padding: 7px 20px; border-radius: 8px; font-size: 12.5px; font-weight: 800;">Search</button>
            </div>
          </div>
        </div>

        <!-- 2. INLINE DONUT CHART & LEGEND CONTAINER (MATCHING TARGET SCREENSHOT) -->
        <div class="inline-chart-container" style="padding: 8px 4px 14px; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle);">
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 8px;">
            <!-- Donut SVG Slices -->
            <div style="position: relative; width: 160px; height: 160px; flex-shrink: 0;">
              <svg width="160" height="160" viewBox="0 0 160 160" style="transform: rotate(-90deg);">
                <circle cx="80" cy="80" r="58" fill="transparent" stroke="var(--border-subtle)" stroke-width="26" opacity="0.3"></circle>
                <!-- Cyan slice for OFF DAY (95.47%) -->
                <circle cx="80" cy="80" r="58" fill="transparent" stroke="#06b6d4" stroke-width="26" stroke-dasharray="347.8 364.4" stroke-dashoffset="0" id="chartCyanSlice"></circle>
                <!-- Rose slice for N/A (4.53%) -->
                <circle cx="80" cy="80" r="58" fill="transparent" stroke="#f43f5e" stroke-width="26" stroke-dasharray="16.5 364.4" stroke-dashoffset="-347.8" id="chartRoseSlice"></circle>
              </svg>
            </div>

            <!-- Legend List on Right -->
            <div style="flex: 1; display: flex; flex-direction: column; gap: 24px; padding-left: 24px;">
              <!-- Item 1: OFF DAY -->
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <div style="font-size: 13px; font-weight: 800; color: var(--text-primary); text-transform: uppercase;">OFF DAY</div>
                  <div style="font-size: 13px; font-weight: 800; color: #06b6d4; margin-top: 2px;" id="legendOffDayVal">95.47% 274</div>
                </div>
                <div style="width: 14px; height: 14px; background: #06b6d4; border-radius: 2px;"></div>
              </div>
              <!-- Item 2: N/A -->
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <div style="font-size: 13px; font-weight: 800; color: var(--text-primary); text-transform: uppercase;">N/A</div>
                  <div style="font-size: 13px; font-weight: 800; color: #f43f5e; margin-top: 2px;" id="legendNaVal">4.53% 13</div>
                </div>
                <div style="width: 14px; height: 14px; background: #f43f5e; border-radius: 2px;"></div>
              </div>
            </div>
          </div>

          <!-- Centered text below chart -->
          <div style="text-align: center; margin-top: 14px;">
            <div style="font-size: 15px; font-weight: 800; color: var(--text-primary);">Headcount by Shift</div>
            <div style="font-size: 14px; font-weight: 800; color: var(--text-primary); margin-top: 3px;" id="chartTotalHeadcountLabel">Total Headcount :287</div>
          </div>
        </div>

        <!-- 3. SHIFT BREAKDOWN TABLE (MATCHING TARGET SCREENSHOT PURPLE HEADER GRID) -->
        <div class="summary-table-card" style="border-radius: 12px; overflow: hidden; border: 1px solid var(--border-subtle);">
          <!-- Purple Table Header -->
          <div style="display: grid; grid-template-columns: 85px 1fr 90px; background: rgba(124, 58, 237, 0.18); padding: 12px 16px; font-size: 13px; font-weight: 800; color: var(--purple-primary); border-bottom: 1px solid var(--border-subtle);">
            <div>Shift</div>
            <div>Job Title</div>
            <div style="text-align: right;">Headcount</div>
          </div>

          <!-- Rows Container -->
          <div id="summaryTableRowsContainer">
            <div class="summary-table-row" style="display: grid; grid-template-columns: 85px 1fr 90px; padding: 12px 16px; border-bottom: 1px solid var(--border-subtle); font-size: 12.5px; font-weight: 700; color: var(--text-primary);">
              <div>N/A</div>
              <div style="font-weight: 800;">ACCOUNT EXECUTIVE</div>
              <div style="text-align: right; font-weight: 800;">3.00</div>
            </div>
            <div class="summary-table-row" style="display: grid; grid-template-columns: 85px 1fr 90px; padding: 12px 16px; border-bottom: 1px solid var(--border-subtle); font-size: 12.5px; font-weight: 700; color: var(--text-primary);">
              <div>N/A</div>
              <div style="font-weight: 800;">BARTENDER</div>
              <div style="text-align: right; font-weight: 800;">1.00</div>
            </div>
            <div class="summary-table-row" style="display: grid; grid-template-columns: 85px 1fr 90px; padding: 12px 16px; border-bottom: 1px solid var(--border-subtle); font-size: 12.5px; font-weight: 700; color: var(--text-primary);">
              <div>N/A</div>
              <div style="font-weight: 800;">PRODUCTION OPERATOR</div>
              <div style="text-align: right; font-weight: 800;">4.00</div>
            </div>
            <div class="summary-table-row" style="display: grid; grid-template-columns: 85px 1fr 90px; padding: 12px 16px; border-bottom: 1px solid var(--border-subtle); font-size: 12.5px; font-weight: 700; color: var(--text-primary);">
              <div>N/A</div>
              <div style="font-weight: 800;">QUALITY CHECKER</div>
              <div style="text-align: right; font-weight: 800;">2.00</div>
            </div>
            <div class="summary-table-row" style="display: grid; grid-template-columns: 85px 1fr 90px; padding: 12px 16px; border-bottom: 1px solid var(--border-subtle); font-size: 12.5px; font-weight: 700; color: var(--text-primary);">
              <div>N/A</div>
              <div style="font-weight: 800;">OPERATION DIRECTOR</div>
              <div style="text-align: right; font-weight: 800;">1.00</div>
            </div>
            <div class="summary-table-row" style="display: grid; grid-template-columns: 85px 1fr 90px; padding: 12px 16px; border-bottom: 1px solid var(--border-subtle); font-size: 12.5px; font-weight: 700; color: var(--text-primary);">
              <div>N/A</div>
              <div style="font-weight: 800;">CLEANING SPECIALIST</div>
              <div style="text-align: right; font-weight: 800;">2.00</div>
            </div>
            <div class="summary-table-row" style="display: grid; grid-template-columns: 85px 1fr 90px; padding: 12px 16px; border-bottom: 1px solid var(--border-subtle); font-size: 12.5px; font-weight: 700; color: var(--text-primary);">
              <div>OFF DAY</div>
              <div style="font-weight: 800;">PRODUCTION OPERATOR</div>
              <div style="text-align: right; font-weight: 800;">180.00</div>
            </div>
            <div class="summary-table-row" style="display: grid; grid-template-columns: 85px 1fr 90px; padding: 12px 16px; border-bottom: 1px solid var(--border-subtle); font-size: 12.5px; font-weight: 700; color: var(--text-primary);">
              <div>OFF DAY</div>
              <div style="font-weight: 800;">SENIOR BARISTA</div>
              <div style="text-align: right; font-weight: 800;">35.00</div>
            </div>
            <div class="summary-table-row" style="display: grid; grid-template-columns: 85px 1fr 90px; padding: 12px 16px; border-bottom: 1px solid var(--border-subtle); font-size: 12.5px; font-weight: 700; color: var(--text-primary);">
              <div>OFF DAY</div>
              <div style="font-weight: 800;">HR EXECUTIVE</div>
              <div style="text-align: right; font-weight: 800;">12.00</div>
            </div>
            <div class="summary-table-row" style="display: grid; grid-template-columns: 85px 1fr 90px; padding: 12px 16px; border-bottom: 1px solid var(--border-subtle); font-size: 12.5px; font-weight: 700; color: var(--text-primary);">
              <div>OFF DAY</div>
              <div style="font-weight: 800;">ACCOUNT EXECUTIVE</div>
              <div style="text-align: right; font-weight: 800;">15.00</div>
            </div>
            <div class="summary-table-row" style="display: grid; grid-template-columns: 85px 1fr 90px; padding: 12px 16px; border-bottom: 1px solid var(--border-subtle); font-size: 12.5px; font-weight: 700; color: var(--text-primary);">
              <div>OFF DAY</div>
              <div style="font-weight: 800;">WAREHOUSE ASSISTANT</div>
              <div style="text-align: right; font-weight: 800;">32.00</div>
            </div>
          </div>
        </div>

      </div>
`;

const extraCss = `
    /* Filter Accordion Header Bar Pill (Matching Target Screenshot) */
    .filter-header-bar-pill {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      color: #ffffff;
      padding: 10px 16px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
    }
    .filter-header-pill-title {
      font-size: 14px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: 0.3px;
    }
    .filter-header-pill-icon {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #ffffff;
      color: #7c3aed;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      transition: transform 0.25s ease;
    }
    .filter-header-pill-icon.open {
      transform: rotate(180deg);
    }

    /* Filter 2-Column Row Layout matching Target Screenshot */
    .filter-row-grid {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 8px;
    }
    .filter-row-label {
      font-size: 12.5px;
      font-weight: 700;
      color: var(--text-primary);
      width: 95px;
      flex-shrink: 0;
    }
    .filter-row-input-wrap {
      flex: 1;
      display: flex;
      align-items: center;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      padding: 6px 10px;
      gap: 6px;
    }
    .date-circle-btn {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #0284c7;
      color: #ffffff;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 11px;
      flex-shrink: 0;
      transition: transform 0.15s;
    }
    .date-circle-btn:active { transform: scale(0.9); }
`;

// Apply to shift-plan.html
let shiftContent = fs.readFileSync(shiftPlanPath, 'utf8');

// Insert extraCss if not present
if (!shiftContent.includes('.filter-header-bar-pill')) {
  shiftContent = shiftContent.replace('</style>', `${extraCss}\n  </style>`);
}

// Replace summaryTabView content
const startIdx = shiftContent.indexOf('<div id="summaryTabView"');
const endIdx = shiftContent.indexOf('<!-- ================= VIEW: WORK SHIFT SUMMARY ================= -->');

if (startIdx !== -1 && endIdx !== -1) {
  shiftContent = shiftContent.substring(0, startIdx) + updatedSummaryHtml + '\n\n    ' + shiftContent.substring(endIdx);
  fs.writeFileSync(shiftPlanPath, shiftContent, 'utf8');
  console.log('shift-plan.html summaryTabView updated successfully!');
} else {
  console.log('ERROR: Could not locate summaryTabView boundaries in shift-plan.html', { startIdx, endIdx });
}
