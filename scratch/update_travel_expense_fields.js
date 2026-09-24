const fs = require('fs');

// Update travel-claim.html
let travelHtml = fs.readFileSync('modules/claims/options/travel-claim.html', 'utf-8');

// Replace the expense subform html inside travel-claim.html
const oldExpenseSnippetPattern = /\} else if \(catKey === 'expense'\) \{[\s\S]*?container\.innerHTML = `[\s\S]*?`;\s*\}/;

const newExpenseSnippet = `} else if (catKey === 'expense') {
        const item = index >= 0 ? formData.items[catKey][index] : null;
        container.innerHTML = \`
          <div class="form-card">
            <div class="section-header-bar no-top-border">
              <span class="section-title-accent"></span>
              <span class="section-title-text">EXPENSE DETAILS</span>
            </div>

            <div class="field-group">
              <label class="field-label">Expense :</label>
              <div class="select-wrapper">
                <select id="eTypeSelect" class="form-ctrl">
                  <option value="" \${!item || !item.expense ? 'selected' : ''}>Select Expense</option>
                  <option value="Hotel Accommodation" \${item && item.expense === 'Hotel Accommodation' ? 'selected' : ''}>Hotel Accommodation</option>
                  <option value="Flight Ticket" \${item && item.expense === 'Flight Ticket' ? 'selected' : ''}>Flight Ticket</option>
                  <option value="Tolls & Parking" \${item && item.expense === 'Tolls & Parking' ? 'selected' : ''}>Tolls &amp; Parking</option>
                  <option value="Office Supplies" \${item && item.expense === 'Office Supplies' ? 'selected' : ''}>Office Supplies</option>
                  <option value="Meals & Entertainment" \${item && item.expense === 'Meals & Entertainment' ? 'selected' : ''}>Meals &amp; Entertainment</option>
                </select>
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Expense From :</label>
              <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 10px;">
                <input type="text" id="eDateFrom" class="form-ctrl" value="24/09/2026" />
                <input type="text" id="eTimeFrom" class="form-ctrl" value="10:56" />
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Expense To :</label>
              <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 10px;">
                <input type="text" id="eDateTo" class="form-ctrl" value="24/09/2026" />
                <input type="text" id="eTimeTo" class="form-ctrl" value="12:56" />
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Project :</label>
              <div class="select-wrapper">
                <select id="eProjectSelect" class="form-ctrl">
                  <option value="" selected>- Select Project -</option>
                  <option value="PROJ-01">Project Alpha</option>
                  <option value="PROJ-02">Enterprise Migration</option>
                </select>
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Receipt # :</label>
              <input type="text" id="eReceiptNo" class="form-ctrl" value="\${item ? item.receiptNo : ''}" placeholder="" />
            </div>

            <div class="field-group">
              <label class="field-label">Description :</label>
              <input type="text" id="eDesc" class="form-ctrl" value="\${item ? item.desc : ''}" placeholder="" />
            </div>

            <div class="field-group">
              <label class="field-label">Company Name</label>
              <input type="text" id="eCompanyName" class="form-ctrl" value="\${item ? item.company : ''}" placeholder="" />
            </div>

            <div class="field-group">
              <label class="field-label">Business RN</label>
              <input type="text" id="eBusinessRN" class="form-ctrl" value="\${item ? item.businessRN : ''}" placeholder="" />
            </div>

            <div class="field-group">
              <label class="field-label">Amount :</label>
              <input type="number" id="eAmount" class="form-ctrl" value="\${item ? item.amount : 0}" step="0.01" oninput="calcSubExpenseLocal()" />
            </div>

            <div class="field-group">
              <label class="field-label">Claim Currency :</label>
              <input type="text" id="eCurrency" class="form-ctrl" value="RINGGIT MALAYSIA" readonly />
            </div>

            <div class="field-group">
              <label class="field-label">Forex Rate :</label>
              <input type="number" id="eForex" class="form-ctrl" value="1" step="0.001" oninput="calcSubExpenseLocal()" />
            </div>

            <div class="field-group">
              <label class="field-label">Local Amount :</label>
              <input type="text" id="eLocalAmount" class="form-ctrl" value="\${item ? item.amount.toFixed(2) : '0.00'}" readonly style="color: var(--purple-primary); font-weight: 800;" />
            </div>

            <div style="margin-top: 14px;">
              <label class="field-label" style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px; display: block;">Upload Attachments:</label>
              <div style="display: flex; align-items: center; justify-content: center; gap: 36px; padding: 8px 0;">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;" onclick="triggerFileUpload('sub')">
                  <div style="width: 50px; height: 50px; border-radius: 50%; background: rgba(124, 58, 237, 0.12); border: 1px solid rgba(124, 58, 237, 0.3); display: flex; align-items: center; justify-content: center; color: var(--purple-primary); font-size: 18px;">
                    <i class="fa-solid fa-file-arrow-up"></i>
                  </div>
                  <span style="font-size: 12px; font-weight: 700; color: var(--purple-primary);">Select File(s)</span>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;" onclick="triggerFileUpload('sub')">
                  <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 18px; box-shadow: 0 6px 18px rgba(124, 58, 237, 0.45);">
                    <i class="fa-solid fa-camera"></i>
                  </div>
                  <span style="font-size: 12px; font-weight: 800; color: var(--text-primary);">Take a Picture</span>
                </div>
              </div>
              <div id="subChipsList" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; justify-content: center;"></div>
            </div>
          </div>
        \`;
      }`;

travelHtml = travelHtml.replace(oldExpenseSnippetPattern, newExpenseSnippet);

// Ensure calcSubExpenseLocal function exists
if (!travelHtml.includes('function calcSubExpenseLocal')) {
  travelHtml = travelHtml.replace('function calcSubMileage() {', `function calcSubExpenseLocal() {
      const amt = parseFloat(document.getElementById('eAmount')?.value || 0);
      const forex = parseFloat(document.getElementById('eForex')?.value || 1);
      const locEl = document.getElementById('eLocalAmount');
      if (locEl) locEl.value = (amt * forex).toFixed(2);
    }

    function calcSubMileage() {`);
}

fs.writeFileSync('modules/claims/options/travel-claim.html', travelHtml, 'utf-8');
console.log('Updated travel-claim.html Expense subform with exact fields from WhatsApp Image 2026-09-24 at 11.11.55.jpeg');

// Also update expenses-claim.html
let expensesHtml = fs.readFileSync('modules/claims/options/expenses-claim.html', 'utf-8');

const oldExpSubformPattern = /openSubForm\(mode, index = -1\) \{[\s\S]*?switchView\('view-4-entry', 'Configure Expense Items'\);\s*\}/;

const newExpSubform = `openSubForm(mode, index = -1) {
      formData.editingIndex = index;
      const catKey = formData.activeCategory;
      const container = document.getElementById('v4SubFormContainer');
      const item = index >= 0 ? formData.items[catKey][index] : null;

      container.innerHTML = \`
        <div class="form-card">
          <div class="section-header-bar no-top-border">
            <span class="section-title-accent"></span>
            <span class="section-title-text">EXPENSE DETAILS</span>
          </div>

          <div class="field-group">
            <label class="field-label">Expense :</label>
            <div class="select-wrapper">
              <select id="eTypeSelect" class="form-ctrl">
                <option value="" \${!item || !item.expense ? 'selected' : ''}>Select Expense</option>
                <option value="Office Supplies" \${item && item.expense === 'Office Supplies' ? 'selected' : ''}>Office Supplies</option>
                <option value="Meal & Entertainment" \${item && item.expense === 'Meal & Entertainment' ? 'selected' : ''}>Meal & Entertainment</option>
                <option value="Subscriptions & Software" \${item && item.expense === 'Subscriptions & Software' ? 'selected' : ''}>Subscriptions & Software</option>
                <option value="Travel Mileage & Tolls" \${item && item.expense === 'Travel Mileage & Tolls' ? 'selected' : ''}>Travel Mileage & Tolls</option>
              </select>
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Expense From :</label>
            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 10px;">
              <input type="text" id="eDateFrom" class="form-ctrl" value="24/09/2026" />
              <input type="text" id="eTimeFrom" class="form-ctrl" value="10:56" />
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Expense To :</label>
            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 10px;">
              <input type="text" id="eDateTo" class="form-ctrl" value="24/09/2026" />
              <input type="text" id="eTimeTo" class="form-ctrl" value="12:56" />
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Project :</label>
            <div class="select-wrapper">
              <select id="eProjectSelect" class="form-ctrl">
                <option value="" selected>- Select Project -</option>
                <option value="PROJ-01">Project Alpha</option>
                <option value="PROJ-02">Enterprise Migration</option>
              </select>
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Receipt # :</label>
            <input type="text" id="eReceiptNo" class="form-ctrl" value="\${item ? item.receiptNo : ''}" placeholder="" />
          </div>

          <div class="field-group">
            <label class="field-label">Description :</label>
            <input type="text" id="eDesc" class="form-ctrl" value="\${item ? item.desc : ''}" placeholder="" />
          </div>

          <div class="field-group">
            <label class="field-label">Company Name</label>
            <input type="text" id="eCompanyName" class="form-ctrl" value="\${item ? item.company : ''}" placeholder="" />
          </div>

          <div class="field-group">
            <label class="field-label">Business RN</label>
            <input type="text" id="eBusinessRN" class="form-ctrl" value="\${item ? item.businessRN : ''}" placeholder="" />
          </div>

          <div class="field-group">
            <label class="field-label">Amount :</label>
            <input type="number" id="eAmount" class="form-ctrl" value="\${item ? item.amount : 0}" step="0.01" oninput="calcSubExpenseLocal()" />
          </div>

          <div class="field-group">
            <label class="field-label">Claim Currency :</label>
            <input type="text" id="eCurrency" class="form-ctrl" value="RINGGIT MALAYSIA" readonly />
          </div>

          <div class="field-group">
            <label class="field-label">Forex Rate :</label>
            <input type="number" id="eForex" class="form-ctrl" value="1" step="0.001" oninput="calcSubExpenseLocal()" />
          </div>

          <div class="field-group">
            <label class="field-label">Local Amount :</label>
            <input type="text" id="eLocalAmount" class="form-ctrl" value="\${item ? item.amount.toFixed(2) : '0.00'}" readonly style="color: var(--purple-primary); font-weight: 800;" />
          </div>

          <div style="margin-top: 14px;">
            <label class="field-label" style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px; display: block;">Upload Attachments:</label>
            <div style="display: flex; align-items: center; justify-content: center; gap: 36px; padding: 8px 0;">
              <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;" onclick="triggerFileUpload('sub')">
                <div style="width: 50px; height: 50px; border-radius: 50%; background: rgba(124, 58, 237, 0.12); border: 1px solid rgba(124, 58, 237, 0.3); display: flex; align-items: center; justify-content: center; color: var(--purple-primary); font-size: 18px;">
                  <i class="fa-solid fa-file-arrow-up"></i>
                </div>
                <span style="font-size: 12px; font-weight: 700; color: var(--purple-primary);">Select File(s)</span>
              </div>
              <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;" onclick="triggerFileUpload('sub')">
                <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 18px; box-shadow: 0 6px 18px rgba(124, 58, 237, 0.45);">
                  <i class="fa-solid fa-camera"></i>
                </div>
                <span style="font-size: 12px; font-weight: 800; color: var(--text-primary);">Take a Picture</span>
              </div>
            </div>
            <div id="subChipsList" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; justify-content: center;"></div>
          </div>
        </div>
      \`;

      switchView('view-4-entry', 'Configure Expense Items');
    }`;

expensesHtml = expensesHtml.replace(oldExpSubformPattern, newExpSubform);

if (!expensesHtml.includes('function calcSubExpenseLocal')) {
  expensesHtml = expensesHtml.replace('function saveSubItem() {', `function calcSubExpenseLocal() {
      const amt = parseFloat(document.getElementById('eAmount')?.value || 0);
      const forex = parseFloat(document.getElementById('eForex')?.value || 1);
      const locEl = document.getElementById('eLocalAmount');
      if (locEl) locEl.value = (amt * forex).toFixed(2);
    }

    function saveSubItem() {`);
}

fs.writeFileSync('modules/claims/options/expenses-claim.html', expensesHtml, 'utf-8');
console.log('Updated expenses-claim.html with exact fields from WhatsApp Image 2026-09-24 at 11.11.55.jpeg');
