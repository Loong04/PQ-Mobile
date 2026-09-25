const fs = require('fs');
const path = require('path');

const shiftPlanPath = path.resolve(__dirname, '../modules/attendance/options/shift-plan.html');
let content = fs.readFileSync(shiftPlanPath, 'utf8');

const modalIdIdx = content.indexOf('id="chartModal"');
if (modalIdIdx !== -1) {
  const startIdx = content.lastIndexOf('<div class="modal-overlay"', modalIdIdx);
  const endIdx = content.indexOf('<!-- JavaScript Logic -->', startIdx);
  
  const newChartModal = `<!-- CHART POPUP MODAL (View Chart Standard + Donut Chart Display) -->
  <div class="modal-overlay" id="chartModal" onclick="closeModalOnBackdrop(event, 'chartModal')" style="align-items: center; justify-content: center; padding: 16px;">
    <div class="modal-content" onclick="event.stopPropagation()" style="width: 100%; max-width: 360px; background: var(--bg-card); border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); border: 1px solid var(--border-subtle); padding: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="font-size: 16px; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 6px; margin: 0;">
          <i class="fa-solid fa-chart-pie" style="color: #f59e0b;"></i> Headcount by Shift
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
  </div>\n\n  `;

  if (startIdx !== -1 && endIdx !== -1) {
    content = content.substring(0, startIdx) + newChartModal + content.substring(endIdx);
    fs.writeFileSync(shiftPlanPath, content, 'utf8');
    console.log('chartModal successfully updated!');
  } else {
    console.log('Error bounds:', { startIdx, endIdx });
  }
}
