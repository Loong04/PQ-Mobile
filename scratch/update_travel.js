const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../modules/claims/options/travel-claim.html');
let content = fs.readFileSync(file, 'utf8');

// 1. Fix Benefit Type -> Travel Claim Type
content = content.replace('<label class="field-label">Benefit Type :</label>', '<label class="field-label">Travel Claim Type : <span class="req">*</span></label>');

// 2. Add Entitlement Summary Card at top of view-general
const cardHtml = `
        <!-- TRAVEL & MILEAGE ENTITLEMENT SUMMARY CARD -->
        <div style="background: var(--bg-card); border-radius: 20px; padding: 16px; box-shadow: var(--shadow-card); border: 1px solid var(--border-subtle); margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin: 0; line-height: 1.2;">TRAVEL &amp; MILEAGE CLAIM</h3>
              <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); display: block; margin-top: 3px;">RM 535.00 available</span>
            </div>
            <span style="font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 12px; background: rgba(124, 58, 237, 0.15); color: var(--purple-primary); border: 1px solid rgba(124, 58, 237, 0.25);">2026</span>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; background: var(--bg-input); padding: 8px 6px; border-radius: 12px; margin-top: 10px; text-align: center;">
            <div>
              <div style="font-size: 9px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">ENTITLED</div>
              <div style="font-size: 11.5px; font-weight: 800; color: var(--text-primary); margin-top: 2px;">RM 1,000.00</div>
            </div>
            <div>
              <div style="font-size: 9px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">CLAIMED</div>
              <div style="font-size: 11.5px; font-weight: 800; color: var(--text-primary); margin-top: 2px;">RM 420.00</div>
            </div>
            <div>
              <div style="font-size: 9px; font-weight: 700; color: #f59e0b; text-transform: uppercase;">PENDING</div>
              <div style="font-size: 11.5px; font-weight: 800; color: #f59e0b; margin-top: 2px;">RM 45.00</div>
            </div>
            <div>
              <div style="font-size: 9px; font-weight: 700; color: #10b981; text-transform: uppercase;">USABLE</div>
              <div style="font-size: 11.5px; font-weight: 800; color: #10b981; margin-top: 2px;">RM 535.00</div>
            </div>
          </div>
        </div>`;

content = content.replace(/<div class="view-container active" id="view-general">\s*<\/div>/g, '<div class="view-container active" id="view-general">\n' + cardHtml);

fs.writeFileSync(file, content, 'utf8');
console.log('Update travel-claim.html successfully!');
