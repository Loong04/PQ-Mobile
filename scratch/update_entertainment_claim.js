const fs = require('fs');

let html = fs.readFileSync('modules/claims/options/entertainment-claim.html', 'utf-8');

// Replace Main Form fields to match Image 1 & 2
const newMainFormFields = `          <!-- Claim Period : -->
          <div class="field-group">
            <label class="field-label">Claim Period :</label>
            <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 10px;">
              <div class="select-wrapper">
                <select id="v1ClaimPeriodYear" class="form-ctrl">
                  <option value="2026" selected>2026</option>
                  <option value="2025">2025</option>
                </select>
              </div>
              <div class="select-wrapper">
                <select id="v1ClaimPeriodMonth" class="form-ctrl">
                  <option value="September" selected>September</option>
                  <option value="August">August</option>
                  <option value="July">July</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Travelling & Mileage Claim # : -->
          <div class="field-group">
            <label class="field-label">Travelling &amp; Mileage Claim # :</label>
            <div class="select-wrapper">
              <select id="travelClaimNoSelect" class="form-ctrl">
                <option value="" selected>- Select -</option>
                <option value="TRV-2026-001">TRV-2026-001 (Penang Client Visit)</option>
                <option value="TRV-2026-002">TRV-2026-002 (JB Business Trip)</option>
              </select>
            </div>
          </div>

          <!-- Benefit Type : -->
          <div class="field-group">
            <label class="field-label">Benefit Type :</label>
            <div class="select-wrapper">
              <select id="benefitTypeSelect" class="form-ctrl">
                <option value="" selected>Select Benefit</option>
                <option value="CLIENT ENTERTAINMENT">CLIENT ENTERTAINMENT</option>
                <option value="BUSINESS DINING & MEAL">BUSINESS DINING &amp; MEAL</option>
                <option value="CORPORATE GIFT">CORPORATE GIFT</option>
              </select>
            </div>
          </div>

          <!-- Claim Date : -->
          <div class="field-group">
            <label class="field-label">Claim Date :</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <input type="text" id="claimStartDate" class="form-ctrl" value="24/09/2026" />
              <input type="text" id="claimEndDate" class="form-ctrl" value="24/09/2026" />
            </div>
          </div>

          <!-- Cost Centre : -->
          <div class="field-group">
            <label class="field-label">Cost Centre :</label>
            <input type="text" id="costCentreInput" class="form-ctrl" value="MANAGEMENT" />
          </div>

          <!-- Project : -->
          <div class="field-group">
            <label class="field-label">Project :</label>
            <div class="select-wrapper">
              <select id="projectSelect" class="form-ctrl">
                <option value="" selected>- Select Project -</option>
                <option value="PROJ-01">Project Alpha</option>
                <option value="PROJ-02">Enterprise Migration</option>
              </select>
            </div>
          </div>

          <!-- Entertained Person/Org : -->
          <div class="field-group">
            <label class="field-label">Entertained Person/Org :</label>
            <input type="text" id="entertainedPersonInput" class="form-ctrl" placeholder="" />
          </div>

          <!-- Place Entertained : -->
          <div class="field-group">
            <label class="field-label">Place Entertained :</label>
            <input type="text" id="placeEntertainedInput" class="form-ctrl" placeholder="" />
          </div>

          <!-- Purpose : -->
          <div class="field-group">
            <label class="field-label">Purpose :</label>
            <input type="text" id="purposeInput" class="form-ctrl" placeholder="" />
          </div>

          <!-- Currency : -->
          <div class="field-group">
            <label class="field-label">Currency :</label>
            <input type="text" id="currencyInput" class="form-ctrl" value="RINGGIT MALAYSIA" readonly />
          </div>

          <!-- Summary Stat Rows -->
          <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 12px 14px; margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 12.5px; font-weight: 700; color: var(--text-muted);">Total Amount :</span>
              <span id="summaryTotalAmount" style="font-size: 13.5px; font-weight: 800; color: #ffffff;">0.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 12.5px; font-weight: 700; color: var(--text-muted);">No of Internal Attendees :</span>
              <span id="summaryInternalPax" style="font-size: 13.5px; font-weight: 800; color: #ffffff;">0</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 12.5px; font-weight: 700; color: var(--text-muted);">No of External Attendees :</span>
              <span id="summaryExternalPax" style="font-size: 13.5px; font-weight: 800; color: #ffffff;">0</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 12.5px; font-weight: 700; color: var(--text-muted);">Avg Per Pax :</span>
              <span id="summaryAvgPax" style="font-size: 13.5px; font-weight: 800; color: #ffffff;">0.00</span>
            </div>
          </div>

          <!-- Board Approve : -->
          <div class="field-group" style="display: flex; align-items: center; justify-content: space-between;">
            <label class="field-label" style="margin-bottom: 0;">Board Approve :</label>
            <input type="checkbox" id="boardApproveCheck" style="width: 20px; height: 20px; accent-color: var(--purple-primary); cursor: pointer;" />
          </div>

          <!-- Declaration For: -->
          <div style="margin-top: 10px; margin-bottom: 12px;">
            <div style="font-size: 12.5px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">Declaration For:</div>
            <div style="display: flex; flex-direction: column; gap: 8px; padding-left: 4px;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <label class="field-label" style="margin-bottom: 0;">Gift/Ent :</label>
                <input type="checkbox" id="giftEntCheck" style="width: 20px; height: 20px; accent-color: var(--purple-primary); cursor: pointer;" />
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <label class="field-label" style="margin-bottom: 0;">Trv/Hosp :</label>
                <input type="checkbox" id="trvHospCheck" style="width: 20px; height: 20px; accent-color: var(--purple-primary); cursor: pointer;" />
              </div>
            </div>
          </div>

          <!-- Remarks : -->
          <div class="field-group" style="margin-bottom: 0;">
            <label class="field-label">Remarks :</label>
            <input type="text" id="v1Remarks" class="form-ctrl" placeholder="" />
          </div>`;

// Replace the main form fields in html
const mainFormStart = html.indexOf('<!-- Claim Period : -->');
const mainFormEnd = html.indexOf('</div>\n\n        <!-- AGGREGATED SUMMARY ROW');

if (mainFormStart !== -1 && mainFormEnd !== -1) {
  html = html.substring(0, mainFormStart) + newMainFormFields + '\n        ' + html.substring(mainFormEnd);
}

// Now replace openEntryForm function to match Image 3, 4, 5
const newOpenEntryForm = `    function openEntryForm(mode, index = -1) {
      formData.editingIndex = index;
      const catKey = formData.activeCategory;
      const container = document.getElementById('v4SubFormContainer');

      if (catKey === 'details') {
        container.innerHTML = \`
          <div class="form-card">
            <div class="section-header-bar no-top-border">
              <span class="section-title-accent"></span>
              <span class="section-title-text">CLAIM DETAILS</span>
            </div>

            <div class="field-group">
              <label class="field-label">Expense :</label>
              <div class="select-wrapper">
                <select id="expenseTypeSelect" class="form-ctrl">
                  <option value="" selected>Select Expense</option>
                  <option value="DINING & FOOD">DINING &amp; FOOD</option>
                  <option value="BEVERAGES">BEVERAGES</option>
                  <option value="ENTERTAINMENT TICKET">ENTERTAINMENT TICKET</option>
                  <option value="CORPORATE GIFT">CORPORATE GIFT</option>
                </select>
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Date :</label>
              <input type="text" id="detailExpenseDate" class="form-ctrl" value="24/09/2026" />
            </div>

            <div class="field-group">
              <label class="field-label">Project :</label>
              <div class="select-wrapper">
                <select id="detailProjectSelect" class="form-ctrl">
                  <option value="" selected>- Select Project -</option>
                  <option value="PROJ-01">Project Alpha</option>
                  <option value="PROJ-02">Enterprise Migration</option>
                </select>
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Receipt # :</label>
              <input type="text" id="detailReceiptNo" class="form-ctrl" placeholder="" />
            </div>

            <div class="field-group">
              <label class="field-label">Description :</label>
              <input type="text" id="detailDescription" class="form-ctrl" placeholder="" />
            </div>

            <div class="field-group">
              <label class="field-label">Entertained Person/Org :</label>
              <input type="text" id="detailEntertainedPerson" class="form-ctrl" placeholder="" />
            </div>

            <div class="field-group">
              <label class="field-label">Place Entertained :</label>
              <input type="text" id="detailPlaceEntertained" class="form-ctrl" placeholder="" />
            </div>

            <div class="field-group">
              <label class="field-label">Amount :</label>
              <input type="number" id="detailAmountInput" class="form-ctrl" value="0" step="0.01" oninput="calcSubLocalAmount()" />
            </div>

            <div class="field-group">
              <label class="field-label">Foreign Currency :</label>
              <input type="text" id="detailCurrencyInput" class="form-ctrl" value="RINGGIT MALAYSIA" readonly />
            </div>

            <div class="field-group">
              <label class="field-label">Forex Rate :</label>
              <input type="number" id="detailForexRate" class="form-ctrl" value="1" step="0.01" oninput="calcSubLocalAmount()" />
            </div>

            <div class="field-group">
              <label class="field-label">Local Amount :</label>
              <input type="text" id="detailLocalAmount" class="form-ctrl" value="0.00" readonly style="color: var(--purple-primary); font-weight: 800;" />
            </div>

            <!-- Upload Attachments -->
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
      } else if (catKey === 'employees') {
        container.innerHTML = \`
          <div class="form-card">
            <div class="section-header-bar no-top-border">
              <span class="section-title-accent"></span>
              <span class="section-title-text">INTERNAL ATTENDEE</span>
            </div>

            <div class="field-group">
              <label class="field-label">Employee :</label>
              <div class="select-wrapper">
                <select id="employeeSelect" class="form-ctrl" onchange="handleEmployeeSelect(this.value)">
                  <option value="" selected>- Select employee -</option>
                  <option value="EBB01">Sarah Chen (#EBB01)</option>
                  <option value="004177">Marcus Tan (#004177)</option>
                  <option value="0000101">Aisha Omar (#0000101)</option>
                  <option value="000582">Daniel Lee (#000582)</option>
                </select>
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Position :</label>
              <input type="text" id="employeePosition" class="form-ctrl" placeholder="" />
            </div>

            <div class="field-group">
              <label class="field-label">Company:</label>
              <input type="text" id="employeeCompany" class="form-ctrl" placeholder="" />
            </div>

            <div class="field-group">
              <label class="field-label">Department:</label>
              <input type="text" id="employeeDepartment" class="form-ctrl" placeholder="" />
            </div>
          </div>
        \`;
      } else if (catKey === 'guests') {
        container.innerHTML = \`
          <div class="form-card">
            <div class="section-header-bar no-top-border">
              <span class="section-title-accent"></span>
              <span class="section-title-text">EXTERNAL ATTENDEE</span>
            </div>

            <div class="field-group">
              <label class="field-label">Attendee :</label>
              <input type="text" id="guestNameInput" class="form-ctrl" placeholder="" />
            </div>

            <div class="field-group">
              <label class="field-label">Company :</label>
              <input type="text" id="guestCompanyInput" class="form-ctrl" placeholder="" />
            </div>

            <div class="field-group">
              <label class="field-label">Designation :</label>
              <input type="text" id="guestDesignationInput" class="form-ctrl" placeholder="" />
            </div>

            <div class="field-group">
              <label class="field-label">Relationship :</label>
              <div class="select-wrapper">
                <select id="guestRelationshipSelect" class="form-ctrl">
                  <option value="" selected>- Select Relationship -</option>
                  <option value="Client">Client / Customer</option>
                  <option value="Prospect">Prospect Lead</option>
                  <option value="Vendor">Vendor / Supplier</option>
                  <option value="Partner">Business Partner</option>
                </select>
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Detail :</label>
              <input type="text" id="guestDetailInput" class="form-ctrl" placeholder="" />
            </div>
          </div>
        \`;
      }

      switchView('view-4-entry', \`Add \${getCategoryTitle(catKey)}\`);
    }`;

const openEntryStart = html.indexOf('function openEntryForm() {');
const openEntryEnd = html.indexOf('function handleEmployeeSelect(val) {');

if (openEntryStart !== -1 && openEntryEnd !== -1) {
  html = html.substring(0, openEntryStart) + newOpenEntryForm + '\n\n    ' + html.substring(openEntryEnd);
}

fs.writeFileSync('modules/claims/options/entertainment-claim.html', html, 'utf-8');
console.log('Successfully updated entertainment-claim.html with exact data from 5 reference images!');
