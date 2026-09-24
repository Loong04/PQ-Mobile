const fs = require('fs');

let html = fs.readFileSync('modules/claims/options/travel-claim.html', 'utf-8');

const targetFunction = `    function renderView3List() {
      const catKey = formData.activeCategory;
      const iconBox = document.getElementById('v3CategoryIconBox');
      const titleText = document.getElementById('v3CategoryTitleText');
      const countText = document.getElementById('v3CategoryItemsCount');
      const container = document.getElementById('v3ItemsContainer');

      let items = [];
      let catName = getCategoryTitle(catKey);
      let iconHtml = '';

      if (catKey === 'mileage') {
        items = formData.claimDetails.mileageItems || [];
        iconHtml = '<i class="fa-solid fa-route"></i>';
      } else if (catKey === 'travel') {
        items = formData.claimDetails.travelItems || [];
        iconHtml = '<i class="fa-solid fa-plane-departure"></i>';
      } else if (catKey === 'expense') {
        items = formData.claimDetails.generalExpenseItems || [];
        iconHtml = '<i class="fa-solid fa-receipt"></i>';
      }

      if (iconBox) iconBox.innerHTML = iconHtml;
      if (titleText) titleText.innerText = catName;
      if (countText) countText.innerText = \`\${items.length} records in this category\`;

      if (!container) return;

      if (items.length === 0) {
        container.innerHTML = \`
          <div style="text-align: center; padding: 40px 20px; background: rgba(30, 41, 59, 0.4); border: 1px dashed rgba(255, 255, 255, 0.15); border-radius: 20px;">
            <div style="width: 50px; height: 50px; border-radius: 50%; background: rgba(124, 58, 237, 0.15); display: flex; align-items: center; justify-content: center; color: var(--purple-primary); font-size: 20px; margin: 0 auto 12px;">
              \${iconHtml}
            </div>
            <div style="font-size: 14.5px; font-weight: 800; color: #ffffff; margin-bottom: 4px;">No items added yet</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">Click the button below to add your first record</div>
            <button type="button" class="btn-submit-primary" style="padding: 9px 20px; font-size: 13px;" onclick="openEntryForm()">
              <i class="fa-solid fa-plus"></i>
              <span>+ Add Item</span>
            </button>
          </div>
        \`;
        return;
      }

      let listHtml = '';
      items.forEach((item, idx) => {
        if (catKey === 'mileage') {
          listHtml += \`
            <div class="form-card" style="margin-bottom: 10px;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">\${item.orig || 'Origin'} → \${item.dest || 'Destination'}</div>
                  <div style="font-size: 11.5px; font-weight: 600; color: var(--text-muted); margin-top: 2px;">
                    \${item.distKm || 0} KM • Meter: \${item.meterIn || 0} - \${item.meterOut || 0}
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="font-size: 15px; font-weight: 800; color: var(--purple-primary);">RM \${(item.amount || 0).toFixed(2)}</div>
                  <i class="fa-solid fa-trash-can" style="color: #ef4444; cursor: pointer; font-size: 15px;" onclick="deleteSubItem(\${idx})"></i>
                </div>
              </div>
            </div>
          \`;
        } else if (catKey === 'travel') {
          listHtml += \`
            <div class="form-card" style="margin-bottom: 10px;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">\${item.orig || 'Location'} → \${item.dest || 'Destination'} (\${item.transport || 'Transit'})</div>
                  <div style="font-size: 11.5px; font-weight: 600; color: var(--text-muted); margin-top: 2px;">
                    \${item.receiptNo ? 'Ref: ' + item.receiptNo + ' • ' : ''}\${item.noOfDays || 1} Days
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="font-size: 15px; font-weight: 800; color: #3b82f6;">RM \${(item.amount || 0).toFixed(2)}</div>
                  <i class="fa-solid fa-trash-can" style="color: #ef4444; cursor: pointer; font-size: 15px;" onclick="deleteSubItem(\${idx})"></i>
                </div>
              </div>
            </div>
          \`;
        } else if (catKey === 'expense') {
          listHtml += \`
            <div class="form-card" style="margin-bottom: 10px;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">\${item.type || item.expense || 'Expense Item'} \${item.receiptNo ? \`(#\${item.receiptNo})\` : ''}</div>
                  <div style="font-size: 11.5px; font-weight: 600; color: var(--text-muted); margin-top: 2px;">
                    \${item.companyName || item.company || 'Merchant'} \${item.project ? \`• \${item.project}\` : ''}
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="font-size: 15px; font-weight: 800; color: #10b981;">RM \${(item.amount || 0).toFixed(2)}</div>
                  <i class="fa-solid fa-trash-can" style="color: #ef4444; cursor: pointer; font-size: 15px;" onclick="deleteSubItem(\${idx})"></i>
                </div>
              </div>
            </div>
          \`;
        }
      });

      container.innerHTML = listHtml;
    }`;

// Replace between function renderView3List() { and function deleteSubItem(idx) {
const startIdx = html.indexOf('function renderView3List() {');
const endIdx = html.indexOf('function deleteSubItem(idx) {');

if (startIdx !== -1 && endIdx !== -1) {
  html = html.substring(0, startIdx) + targetFunction.trim() + '\n\n    ' + html.substring(endIdx);
  fs.writeFileSync('modules/claims/options/travel-claim.html', html, 'utf-8');
  console.log('Successfully fixed renderView3List in travel-claim.html');
} else {
  console.error('Could not locate indices', startIdx, endIdx);
}
