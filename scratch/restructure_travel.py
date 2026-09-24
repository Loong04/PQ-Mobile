import os

file_path = r"C:\Users\loong\PQ-Mobile\modules\claims\options\travel-claim.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove the old stepper
stepper_start = content.find('<!-- STEPPER HEADER -->')
stepper_end = content.find('<!-- ========================================================= -->\n        <!-- STEP 1: GENERAL')
if stepper_start != -1 and stepper_end != -1:
    content = content[:stepper_start] + content[stepper_end:]

# 2. Change viewTravelForm to view-general
content = content.replace('<div id="viewTravelForm">', '<div class="view-container active" id="view-general">\n      <div class="main-content">')
content = content.replace('<div id="stepContent-1" style="display: block;">', '<div id="stepContent-1">')

# 3. Add the Total Claim and Attachment card at the bottom of General instead of the "Next: Mileage" button.
# We'll replace the "Bottom Navigation Row" in Step 1.
nav1_start = content.find('<!-- Bottom Navigation Row -->')
nav1_end = content.find('</div>\n\n        </div>\n\n        <!-- ========================================================= -->\n        <!-- STEP 2: MILEAGE')

nav1_replacement = """
          <!-- Total Claim Card (Navigates to Hub) -->
          <div class="form-card" style="padding: 16px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; margin-bottom: 14px; margin-top: 20px;" onclick="switchView('view-hub')">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 40px; height: 40px; background: rgba(30, 58, 138, 0.1); border-radius: 12px; display: flex; justify-content: center; align-items: center; color: #1e3a8a; font-size: 18px;">
                <i class="fa-solid fa-file-invoice-dollar"></i>
              </div>
              <div>
                <div style="font-size: 13px; font-weight: 700; color: var(--text-muted); margin-bottom: 4px;">Total Claim <span style="color: red;">*</span></div>
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
"""

if nav1_start != -1 and nav1_end != -1:
    content = content[:nav1_start] + nav1_replacement + content[nav1_end + 18:]
    # The +18 skips the </div></div>

# Now for Step 2: Mileage
content = content.replace('<div id="stepContent-2" style="display: none;">', '<div class="view-container" id="view-mileage">\n      <div class="main-content">\n        <div id="stepContent-2">')

# We need to replace the bottom navigation for Step 2
nav2_start = content.find('<!-- Bottom Navigation Row (Step 2) -->')
nav2_end = content.find('</div>\n\n        </div>\n\n        <!-- ========================================================= -->\n        <!-- STEP 3: TRAVEL')

nav2_replacement = """
        </div>
      </div>
      <div class="sticky-action-bar">
        <button type="button" class="btn-draft-bright" onclick="switchView('view-hub')">
          <i class="fa-solid fa-chevron-left"></i>
          <span>Back</span>
        </button>
        <button type="button" class="btn-submit-primary" onclick="switchView('view-hub')">
          <span>Save Mileage</span>
          <i class="fa-solid fa-check"></i>
        </button>
      </div>
    </div> <!-- end view-mileage -->
"""
if nav2_start != -1 and nav2_end != -1:
    content = content[:nav2_start] + nav2_replacement + content[nav2_end + 18:]


# Step 3: Travel
content = content.replace('<div id="stepContent-3" style="display: none;">', '<div class="view-container" id="view-travelling">\n      <div class="main-content">\n        <div id="stepContent-3">')

nav3_start = content.find('<!-- Bottom Navigation Row (Step 3) -->')
nav3_end = content.find('</div>\n\n        </div>\n\n        <!-- ========================================================= -->\n        <!-- STEP 4: EXPENSE')

nav3_replacement = """
        </div>
      </div>
      <div class="sticky-action-bar">
        <button type="button" class="btn-draft-bright" onclick="switchView('view-hub')">
          <i class="fa-solid fa-chevron-left"></i>
          <span>Back</span>
        </button>
        <button type="button" class="btn-submit-primary" onclick="switchView('view-hub')">
          <span>Save Travel</span>
          <i class="fa-solid fa-check"></i>
        </button>
      </div>
    </div> <!-- end view-travelling -->
"""
if nav3_start != -1 and nav3_end != -1:
    content = content[:nav3_start] + nav3_replacement + content[nav3_end + 18:]

# Step 4: Expense
content = content.replace('<div id="stepContent-4" style="display: none;">', '<div class="view-container" id="view-expense">\n      <div class="main-content">\n        <div id="stepContent-4">')

nav4_start = content.find('<!-- Bottom Navigation Row (Step 4) -->')
nav4_end = content.find('</div>\n\n        </div>\n\n      </div> <!-- end viewTravelForm -->')

if nav4_end == -1: # Try another common end tag
    nav4_end = content.find('</div>\n\n        </div>\n      </div>')

nav4_replacement = """
        </div>
      </div>
      <div class="sticky-action-bar">
        <button type="button" class="btn-draft-bright" onclick="switchView('view-hub')">
          <i class="fa-solid fa-chevron-left"></i>
          <span>Back</span>
        </button>
        <button type="button" class="btn-submit-primary" onclick="switchView('view-hub')">
          <span>Save Expense</span>
          <i class="fa-solid fa-check"></i>
        </button>
      </div>
    </div> <!-- end view-expense -->
"""

if nav4_start != -1 and nav4_end != -1:
    content = content[:nav4_start] + nav4_replacement + content[nav4_end:]


# Remove `</div> <!-- end viewTravelForm -->`
content = content.replace('</div> <!-- end viewTravelForm -->\n    </div> <!-- end main-content -->\n', '')
content = content.replace('      </div> <!-- end viewTravelForm -->', '')
content = content.replace('    </div> <!-- end main-content -->\n    <div class="sticky-action-bar">', '')


# Now append the Hub view right before the script tag or body end
hub_html = """
    <!-- ================= VIEW HUB ================= -->
    <div class="view-container" id="view-hub">
      <div class="main-content" style="padding-top: 24px;">
        <!-- Top Application Summary -->
        <div class="form-card" style="border: none; box-shadow: 0 4px 16px rgba(0,0,0,0.04); margin-bottom: 24px; background: var(--bg-input);">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <div style="width: 42px; height: 42px; background: rgba(255,255,255,0.05); border-radius: 12px; display: flex; justify-content: center; align-items: center; color: var(--text-muted); font-size: 18px;">
              <i class="fa-solid fa-clipboard-list"></i>
            </div>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">New Application</div>
              <div style="font-size: 12px; font-weight: 600; color: var(--text-muted);">Claim | Travelling & Mileage Claim Form</div>
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
            <div style="font-size: 15px; font-weight: 800; color: var(--text-primary);">Claim Details</div>
          </div>

          <div class="hub-row" onclick="switchView('view-mileage')" style="padding: 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); cursor: pointer;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 38px; height: 38px; background: rgba(30, 58, 138, 0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #1e3a8a; font-size: 15px;"><i class="fa-solid fa-route"></i></div>
              <div>
                <div style="font-size: 13px; font-weight: 700; color: var(--text-muted); margin-bottom: 4px;">Total Mileage Claim</div>
                <div id="hubTotalMileage" style="font-size: 15px; font-weight: 800; color: #1e3a8a;">RM 0.00</div>
              </div>
            </div>
            <div style="color: var(--text-muted);"><i class="fa-solid fa-chevron-right"></i></div>
          </div>

          <div class="hub-row" onclick="switchView('view-travelling')" style="padding: 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); cursor: pointer;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 38px; height: 38px; background: rgba(30, 58, 138, 0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #1e3a8a; font-size: 15px;"><i class="fa-solid fa-ticket-airline"></i></div>
              <div>
                <div style="font-size: 13px; font-weight: 700; color: var(--text-muted); margin-bottom: 4px;">Total Travelling Claim</div>
                <div id="hubTotalTravel" style="font-size: 15px; font-weight: 800; color: #1e3a8a;">RM 0.00</div>
              </div>
            </div>
            <div style="color: var(--text-muted);"><i class="fa-solid fa-chevron-right"></i></div>
          </div>

          <div class="hub-row" onclick="switchView('view-expense')" style="padding: 16px; display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 38px; height: 38px; background: rgba(30, 58, 138, 0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #1e3a8a; font-size: 15px;"><i class="fa-solid fa-bed"></i></div>
              <div>
                <div style="font-size: 13px; font-weight: 700; color: var(--text-muted); margin-bottom: 4px;">Other Expenses Claim</div>
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
        <button type="button" class="btn-submit-primary" style="background: #22c55e; border-color: #16a34a; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);" onclick="submitTravelClaim()">
          <span>Submit Claim</span>
        </button>
      </div>
    </div> <!-- end view-hub -->
"""

# Insert Hub HTML right before the <script> tags or before </body> if script tags don't exist
script_start = content.find('<script>')
if script_start != -1:
    # also remove any old submitTravelClaim button if there is one lingering in the HTML structure
    content = content[:script_start].replace('<button type="button" class="btn-submit-primary" style="background: #22c55e; border-color: #16a34a; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);" onclick="submitTravelClaim()">\n            <span>Submit</span>\n          </button>', '')
    content = content[:script_start] + hub_html + "\n" + content[script_start:]
else:
    body_end = content.find('</body>')
    if body_end != -1:
        content = content[:body_end] + hub_html + "\n" + content[body_end:]


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Rewrite Complete!")
