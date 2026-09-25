const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../modules/attendance/options/shift-plan.html');
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

const oldHeroCard = `        <!-- 1. HERO TOTAL OVERVIEW CARD WITH VIEW CHART BUTTON (AGENTS.MD STANDARD) -->
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
        </div>`;

const newHeroCard = `        <!-- 1. HERO TOTAL OVERVIEW CARD WITH INLINE DONUT CHART -->
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
        </div>`;

if (!content.includes(oldHeroCard)) {
  console.error("Could not find oldHeroCard in shift-plan.html");
} else {
  content = content.replace(oldHeroCard, newHeroCard);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully updated shift-plan.html hero card with inline chart!");
}
