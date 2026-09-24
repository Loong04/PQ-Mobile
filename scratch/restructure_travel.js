const fs = require('fs');
const path = require('path');

const filePath = 'C:\\\\Users\\\\loong\\\\PQ-Mobile\\\\modules\\\\claims\\\\options\\\\travel-claim.html';
let content = fs.readFileSync(filePath, 'utf-8');

// We'll split the content there.
let step2Idx = content.indexOf('<!-- STEP 2: MILEAGE (EXACT FIELDS FROM PHOTO 4 & 5) -->');
if (step2Idx === -1) step2Idx = content.indexOf('<!-- STEP 2: MILEAGE');

let step3Idx = content.indexOf('<!-- STEP 3: TRAVEL');
let step4Idx = content.indexOf('<!-- STEP 4: EXPENSE');
let viewHubIdx = content.indexOf('<!-- ================= VIEW HUB ================= -->');

let part1 = content.substring(0, step2Idx); // Contains up to end of step 1

// Let's close view-general properly
const stickyGeneral = `
      <!-- Sticky Action Footer for General -->
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

part1 = part1 + stickyGeneral;

// Now step 2
let part2Raw = content.substring(step2Idx, step3Idx);
let part2 = `
    <!-- View Mileage -->
    <div class="view-container" id="view-mileage">
      <div class="main-content">
        ${part2Raw}
      </div>
      <div class="sticky-action-bar">
        <button type="button" class="btn-draft-bright" onclick="switchView('view-hub')">
          <i class="fa-solid fa-chevron-left"></i>
          <span>Back</span>
        </button>
        <button type="button" class="btn-submit-primary" onclick="switchView('view-hub')">
          <span>Done</span>
          <i class="fa-solid fa-check"></i>
        </button>
      </div>
    </div>
`;

// step 3
let part3Raw = content.substring(step3Idx, step4Idx);
let part3 = `
    <!-- View Travelling -->
    <div class="view-container" id="view-travelling">
      <div class="main-content">
        ${part3Raw}
      </div>
      <div class="sticky-action-bar">
        <button type="button" class="btn-draft-bright" onclick="switchView('view-hub')">
          <i class="fa-solid fa-chevron-left"></i>
          <span>Back</span>
        </button>
        <button type="button" class="btn-submit-primary" onclick="switchView('view-hub')">
          <span>Done</span>
          <i class="fa-solid fa-check"></i>
        </button>
      </div>
    </div>
`;

// step 4
let part4Raw = content.substring(step4Idx, viewHubIdx);
let part4 = `
    <!-- View Expense -->
    <div class="view-container" id="view-expense">
      <div class="main-content">
        ${part4Raw}
      </div>
      <div class="sticky-action-bar">
        <button type="button" class="btn-draft-bright" onclick="switchView('view-hub')">
          <i class="fa-solid fa-chevron-left"></i>
          <span>Back</span>
        </button>
        <button type="button" class="btn-submit-primary" onclick="switchView('view-hub')">
          <span>Done</span>
          <i class="fa-solid fa-check"></i>
        </button>
      </div>
    </div>
`;

// Now view-hub
let partHubRaw = content.substring(viewHubIdx);
partHubRaw = partHubRaw.replace('style="background: #f8fafc; padding-top: 24px;"', 'style="padding-top: 24px;"');
partHubRaw = partHubRaw.replace(/background: #f1f5f9;/g, 'background: var(--bg-input);');
partHubRaw = partHubRaw.replace(/color: #64748b;/g, 'color: var(--text-muted);');

let scriptIdx = partHubRaw.indexOf('<script>');
if (scriptIdx === -1) scriptIdx = partHubRaw.indexOf('</body>');

let partHubHtml = partHubRaw.substring(0, scriptIdx);
let partRest = partHubRaw.substring(scriptIdx);

const stickyHub = `
      <div class="sticky-action-bar">
        <button type="button" class="btn-draft-bright" onclick="switchView('view-general')">
          <i class="fa-solid fa-chevron-left"></i>
          <span>Back</span>
        </button>
        <button type="button" class="btn-submit-primary" style="background: #22c55e; border-color: #16a34a; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);" onclick="submitTravelClaim()">
          <span>Submit Claim</span>
        </button>
      </div>
    </div> <!-- end view-hub -->
`;

partHubHtml = partHubHtml.replace('</div> <!-- end view-hub -->', '');
partHubHtml = partHubHtml.replace('</div>\n    </div> <!-- end view-hub -->', '');
let partHub = partHubHtml + stickyHub;

let finalContent = part1 + part2 + part3 + part4 + partHub + partRest;

fs.writeFileSync(filePath, finalContent, 'utf-8');
console.log("Done transforming travel-claim.html");
