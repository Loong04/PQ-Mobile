const fs = require('fs');
const path = require('path');

const filePath = 'C:\\\\Users\\\\loong\\\\PQ-Mobile\\\\modules\\\\claims\\\\options\\\\advance-claim.html';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Remove the old stepper
let stepperStart = content.indexOf('<!-- STEPPER HEADER -->');
let stepperEnd = content.indexOf('<!-- ================= STEP 1: GENERAL ================= -->');
if (stepperStart !== -1 && stepperEnd !== -1) {
    content = content.substring(0, stepperStart) + content.substring(stepperEnd);
}

// 2. Change viewAdvanceForm to view-general
content = content.replace('      <!-- VIEW 2: ADVANCE CLAIM FORM -->\n      <div id="viewAdvanceForm" style="display: none;">\n        \n', 
  '      <!-- VIEW 2: ADVANCE CLAIM FORM -->\n      <div class="view-container" id="view-general" style="display: none;">\n        <div class="main-content">\n');

// 3. Add the Total Claim and Attachment card at the bottom of General instead of the "Next" button.
let nav1Start = content.indexOf('<!-- Bottom Navigation Row -->');
let nav1End = content.indexOf('</div>\n\n        </div>\n\n        <!-- ================= STEP 2: EXPENSE ================= -->');

const nav1Replacement = `
          <!-- Total Claim Card (Navigates to Hub) -->
          <div class="form-card" style="padding: 16px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; margin-bottom: 14px; margin-top: 20px;" onclick="switchView('view-hub')">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 40px; height: 40px; background: rgba(30, 58, 138, 0.1); border-radius: 12px; display: flex; justify-content: center; align-items: center; color: #1e3a8a; font-size: 18px;">
                <i class="fa-solid fa-file-invoice-dollar"></i>
              </div>
              <div>
                <div style="font-size: 13px; font-weight: 700; color: var(--text-muted); margin-bottom: 4px;">Total Advance <span style="color: red;">*</span></div>
                <div id="totalClaimAmountDisplay" style="font-size: 15px; font-weight: 800; color: #1e3a8a;">RM 0.00</div>
              </div>
            </div>
            <div style="width: 32px; height: 32px; background: rgba(0,0,0,0.04); border-radius: 8px; display: flex; justify-content: center; align-items: center; font-size: 14px; color: var(--text-muted);">
              <i class="fa-solid fa-plus"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="sticky-action-bar">
        <button type="button" class="btn-draft-bright" onclick="saveDraft()">
          <i class="fa-solid fa-floppy-disk"></i>
          <span>Draft</span>
        </button>
        <button type="button" class="btn-submit-primary" onclick="switchView('view-hub')">
          <span>Next: Add Details</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div> <!-- end view-general -->
`;

if (nav1Start !== -1 && nav1End !== -1) {
    content = content.substring(0, nav1Start) + nav1Replacement + content.substring(nav1End + 18);
}

// Now for Step 2: Expense
content = content.replace('<div id="stepContent-2" style="display: none;">', '<div class="view-container" id="view-expense" style="display: none;">\n      <div class="main-content">\n        <div id="stepContent-2">');

let nav2Start = content.indexOf('<!-- Bottom Navigation Row -->', nav1Start + 50); // skip first one
let nav2End = content.indexOf('</div>\n\n        </div>\n\n      </div> <!-- end viewAdvanceForm -->');

if (nav2End === -1) nav2End = content.indexOf('</div>\n\n        </div>\n      </div>');

const nav2Replacement = `
        </div>
      </div>
      <div class="sticky-action-bar">
        <button type="button" class="btn-draft-bright" onclick="switchView('view-hub')">
          <i class="fa-solid fa-chevron-left"></i>
          <span>Back</span>
        </button>
        <button type="button" class="btn-submit-primary" onclick="switchView('view-hub')">
          <span>Save Details</span>
          <i class="fa-solid fa-check"></i>
        </button>
      </div>
    </div> <!-- end view-expense -->
`;
if (nav2Start !== -1 && nav2End !== -1) {
    content = content.substring(0, nav2Start) + nav2Replacement + content.substring(nav2End);
}


// Remove trailing tags
content = content.replace('</div> <!-- end viewAdvanceForm -->\n    </div> <!-- end main-content -->\n', '');
content = content.replace('      </div> <!-- end viewAdvanceForm -->\n', '');


// Now insert the Hub view right before the <script> tag
const hubHtml = `
    <!-- ================= VIEW HUB ================= -->
    <div class="view-container" id="view-hub" style="display: none;">
      <div class="main-content" style="padding-top: 24px;">
        <!-- Top Application Summary -->
        <div class="form-card" style="border: none; box-shadow: 0 4px 16px rgba(0,0,0,0.04); margin-bottom: 24px; background: var(--bg-input);">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <div style="width: 42px; height: 42px; background: rgba(255,255,255,0.05); border-radius: 12px; display: flex; justify-content: center; align-items: center; color: var(--text-muted); font-size: 18px;">
              <i class="fa-solid fa-clipboard-list"></i>
            </div>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">New Application</div>
              <div style="font-size: 12px; font-weight: 600; color: var(--text-muted);">Advance Request Form</div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 100px 1fr; gap: 10px; margin-bottom: 8px;">
            <div style="font-size: 13px; font-weight: 700; color: #dc2626;">Date Submit</div>
            <div style="font-size: 13px; font-weight: 700; color: #1e3a8a;">23/09/2026</div>
          </div>
          <div style="display: grid; grid-template-columns: 100px 1fr; gap: 10px; margin-bottom: 8px;">
            <div style="font-size: 13px; font-weight: 700; color: #dc2626;">Employee #</div>
            <div style="font-size: 13px; font-weight: 700; color: #1e3a8a;">A100</div>
          </div>
          <div style="display: grid; grid-template-columns: 100px 1fr; gap: 10px;">
            <div style="font-size: 13px; font-weight: 700; color: #dc2626;">Name</div>
            <div style="font-size: 13px; font-weight: 700; color: #1e3a8a;">SALLY FIELD</div>
          </div>
        </div>

        <!-- Claim Details section -->
        <div class="form-card" style="border: none; box-shadow: 0 4px 16px rgba(0,0,0,0.04); padding: 0; overflow: hidden; background: var(--bg-card);">
          <div style="padding: 16px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--border-subtle);">
            <div style="color: #1e3a8a; font-size: 16px;">
              <i class="fa-solid fa-file-invoice"></i>
            </div>
            <div style="font-size: 15px; font-weight: 800; color: var(--text-primary);">Advance Details</div>
          </div>

          <div class="hub-row" onclick="switchView('view-expense')" style="padding: 16px; display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 38px; height: 38px; background: rgba(30, 58, 138, 0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #1e3a8a; font-size: 15px;"><i class="fa-solid fa-receipt"></i></div>
              <div>
                <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Advance Amount</div>
                <div id="hubTotalExpense" style="font-size: 15px; font-weight: 800; color: #1e3a8a;">RM 0.00</div>
              </div>
            </div>
            <div style="color: var(--text-muted);"><i class="fa-solid fa-chevron-right"></i></div>
          </div>
        </div>
      </div>
      <div class="sticky-action-bar">
        <button type="button" class="btn-draft-bright" onclick="switchView('view-general')">
          <i class="fa-solid fa-chevron-left"></i>
          <span>Back</span>
        </button>
        <button type="button" class="btn-submit-primary" style="background: #22c55e; border-color: #16a34a; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);" onclick="submitAdvanceClaim()">
          <span>Submit Request</span>
        </button>
      </div>
    </div> <!-- end view-hub -->
`;

let scriptStart = content.indexOf('<script>');
if (scriptStart !== -1) {
    content = content.substring(0, scriptStart) + hubHtml + "\n" + content.substring(scriptStart);
} else {
    let bodyEnd = content.indexOf('</body>');
    if (bodyEnd !== -1) {
        content = content.substring(0, bodyEnd) + hubHtml + "\n" + content.substring(bodyEnd);
    }
}

content = content.replace('function openAdvanceClaimForm() {', 'function openAdvanceClaimForm() {\n      document.querySelector(\'.main-content\').parentElement.style.display = \'none\';\n      switchView(\'view-general\');\n      // keep old logic for reference\n');
content = content.replace('function closeAdvanceClaimForm() {', 'function switchView(viewId) {\n      document.querySelectorAll(\'.view-container\').forEach(el => {\n          if (el.id && el.id.startsWith(\'view-\')) el.style.display = \'none\';\n      });\n      document.getElementById(viewId).style.display = \'block\';\n      window.scrollTo(0,0);\n    }\n\n    function closeAdvanceClaimForm() {');

// One more fix: rewrite travel-claim.html without the stepper using string replacement!
const travelPath = 'C:\\\\Users\\\\loong\\\\PQ-Mobile\\\\modules\\\\claims\\\\options\\\\travel-claim.html';
let travelContent = fs.readFileSync(travelPath, 'utf-8');
const tStepperStart = travelContent.indexOf('<!-- STEPPER HEADER -->');
const tStepperEnd = travelContent.indexOf('<!-- Step 4 -->');
if (tStepperStart !== -1 && tStepperEnd !== -1) {
    // find the </div> that closes the stepper-container, after Step 4
    let afterStep4 = travelContent.substring(tStepperEnd);
    let closeDiv = afterStep4.indexOf('</div>');
    let nextDiv = afterStep4.indexOf('</div>', closeDiv + 6);
    if (nextDiv !== -1) {
        travelContent = travelContent.substring(0, tStepperStart) + afterStep4.substring(nextDiv + 6);
    }
}
fs.writeFileSync(travelPath, travelContent, 'utf-8');


fs.writeFileSync(filePath, content, 'utf-8');
console.log("Rewrite Complete!");
