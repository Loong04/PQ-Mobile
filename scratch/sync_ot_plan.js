const fs = require('fs');
const path = require('path');

const shiftPlanPath = path.join(__dirname, '../modules/attendance/options/shift-plan.html');
const otPlanPath = path.join(__dirname, '../modules/attendance/options/ot-plan.html');

let shiftContent = fs.readFileSync(shiftPlanPath, 'utf8');
let otContent = fs.readFileSync(otPlanPath, 'utf8');

// 1. Check style additions
const historyCardStyles = `
    /* History Card Styling */
    .history-card-item {
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(167, 139, 250, 0.03) 100%);
      border: 1px solid rgba(124, 58, 237, 0.3);
      border-radius: 18px;
      padding: 14px 16px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.05);
      text-decoration: none;
      transition: transform 0.2s;
    }
    .history-card-item:active { transform: scale(0.98); }
    [data-theme="dark"] .history-card-item, html[data-theme="dark"] .history-card-item {
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(167, 139, 250, 0.05) 100%);
      border-color: rgba(167, 139, 250, 0.25);
    }
    .history-card-item.ot-theme {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(251, 191, 36, 0.03) 100%);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    [data-theme="dark"] .history-card-item.ot-theme, html[data-theme="dark"] .history-card-item.ot-theme {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(251, 191, 36, 0.05) 100%);
      border-color: rgba(245, 158, 11, 0.25);
    }
    .history-card-item.feedback-theme {
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(167, 139, 250, 0.03) 100%);
      border: 1px solid rgba(124, 58, 237, 0.3);
    }
    [data-theme="dark"] .history-card-item.feedback-theme, html[data-theme="dark"] .history-card-item.feedback-theme {
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(167, 139, 250, 0.05) 100%);
      border-color: rgba(167, 139, 250, 0.25);
    }
    .history-time-row { font-size: 14.5px; font-weight: 800; color: var(--purple-primary); margin-bottom: 5px; display: flex; align-items: center; gap: 6px; }
    [data-theme="dark"] .history-time-row, html[data-theme="dark"] .history-time-row { color: #c084fc; }
    .history-time-row.ot-time { color: #d97706; }
    [data-theme="dark"] .history-time-row.ot-time, html[data-theme="dark"] .history-time-row.ot-time { color: #fbbf24; }
    .history-time-row.feedback-time { color: #7c3aed; }
    [data-theme="dark"] .history-time-row.feedback-time, html[data-theme="dark"] .history-time-row.feedback-time { color: #a78bfa; }
    
    /* Hide scrollbar for sub-view containers */
    .scroll-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px 20px 40px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .scroll-body::-webkit-scrollbar {
      display: none;
    }
`;

if (!otContent.includes('/* History Card Styling */')) {
    otContent = otContent.replace('</style>', `${historyCardStyles}\n  </style>`);
}

// 2. Replace calSummaryCard in otPlan to match shiftPlan's 4 summary triggers
const newCalSummaryCard = `        <div class="cal-summary-card" id="calSummaryCard" style="display: none;">
          <div class="cal-summary-title" id="calSummaryTitle">Tue, 15 Sep 2026</div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0 0 0;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;" onclick="switchView('view-work-shift-summary')">
              <div style="font-size: 12px; font-weight: 800; color: var(--text-muted);">Work Shift</div>
              <div style="background: #52525b; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 11.5px; font-weight: 800;">269.00</div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;" onclick="switchView('view-no-work-summary')">
              <div style="font-size: 12px; font-weight: 800; color: var(--text-muted);">No Work</div>
              <div style="background: #52525b; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 11.5px; font-weight: 800;">13</div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;" onclick="switchView('view-ot-plan-summary')">
              <div style="font-size: 12px; font-weight: 800; color: var(--text-muted);">OT Plan</div>
              <div style="background: #52525b; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 11.5px; font-weight: 800;">73 / 127.00</div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;" onclick="switchView('view-leave-summary')">
              <div style="font-size: 12px; font-weight: 800; color: var(--text-muted);">On Leave</div>
              <div style="background: #52525b; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 11.5px; font-weight: 800;">5.00</div>
            </div>
          </div>
        </div>`;

otContent = otContent.replace(/<div class="cal-summary-card" id="calSummaryCard"[\s\S]*?<\/div>\s*<\/div>\s*<!-- ================= 3\. SUMMARY TAB CONTENT/m, `${newCalSummaryCard}\n      </div>\n\n      <!-- ================= 3. SUMMARY TAB CONTENT`);

// 3. Extract Summary Views + Detail Views from shift-plan.html
const startMarker = '<!-- ================= VIEW: WORK SHIFT SUMMARY ================= -->';
const endMarker = '<!-- ================= BOTTOM SHEET 1: REVIEW CHANGES ================= -->';

const shiftViewsStartIndex = shiftContent.indexOf(startMarker);
const shiftViewsEndIndex = shiftContent.indexOf(endMarker);

if (shiftViewsStartIndex === -1 || shiftViewsEndIndex === -1) {
    console.error('Could not find markers in shift-plan.html');
    process.exit(1);
}

const allViewsToInject = shiftContent.substring(shiftViewsStartIndex, shiftViewsEndIndex).trim();

// In ot-plan.html, find where view-work-shift-summary starts, and where editOtDetailsModal begins
const otStartMarker = '<!-- ================= VIEW: WORK SHIFT SUMMARY ================= -->';
const otEndMarker = '<!-- ================= BOTTOM SHEET 1: EDIT OT DETAILS ================= -->';

const otViewsStartIndex = otContent.indexOf(otStartMarker);
const otViewsEndIndex = otContent.indexOf(otEndMarker);

if (otViewsStartIndex === -1 || otViewsEndIndex === -1) {
    console.error('Could not find markers in ot-plan.html');
    process.exit(1);
}

otContent = otContent.substring(0, otViewsStartIndex) + allViewsToInject + '\n\n    ' + otContent.substring(otViewsEndIndex);

// 4. Inject Datasets and Opening Functions into <script> of ot-plan.html
const jsStartMarker = '// Employee Detail Datasets for Summary Drill-downs';
const jsEndMarker = 'function switchView(viewId)';

const jsStartIndex = shiftContent.indexOf(jsStartMarker);
const jsEndIndex = shiftContent.indexOf(jsEndMarker);

if (jsStartIndex === -1 || jsEndIndex === -1) {
    console.error('Could not find JS markers in shift-plan.html');
    process.exit(1);
}

const jsToInject = shiftContent.substring(jsStartIndex, jsEndIndex).trim();

if (!otContent.includes('const workShiftEmployeeDataset')) {
    otContent = otContent.replace('function switchView(viewId)', `${jsToInject}\n\n    function switchView(viewId)`);
}

fs.writeFileSync(otPlanPath, otContent, 'utf8');
console.log('ot-plan.html successfully updated! New length:', otContent.length);
