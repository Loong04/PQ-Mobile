import re

with open('modules/claims/options/expenses-claim.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's replace expenses-claim.html with full 4-Level Drill-Down UI layout
new_expenses_html = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Claims - Expense Claim</title>
  <script src="../../../js/components.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="../../../css/theme.css">
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: var(--bg-primary, #0f172a);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: var(--text-primary, #f8fafc);
      -webkit-tap-highlight-color: transparent;
    }

    .phone-container {
      max-width: 430px;
      margin: 0 auto;
      background: var(--bg-primary, #0f172a);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      position: relative;
      padding-bottom: 30px;
    }

    /* Top Sticky Header */
    .cal-top-header {
      background: linear-gradient(180deg, rgba(124, 58, 237, 0.28) 0%, rgba(15, 23, 42, 0) 100%);
      padding: 12px 18px 14px;
      position: sticky;
      top: 0;
      z-index: 40;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    .header-nav-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 4px;
    }

    .header-back-btn {
      width: 36px;
      height: 36px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .header-title-text {
      font-size: 18.5px;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
      letter-spacing: -0.3px;
    }

    /* Main Scroll Area */
    .main-content {
      flex: 1;
      padding: 0 16px 20px;
    }

    /* Views System */
    .view-container {
      display: none;
      animation: fadeIn 0.2s ease-in-out;
    }

    .view-container.active {
      display: block;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Form Cards */
    .form-card {
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 18px;
      margin-bottom: 16px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    }

    .section-title-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 15px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .section-header-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 14px;
    }

    .section-title-accent {
      width: 4px;
      height: 16px;
      background: var(--purple-primary, #8b5cf6);
      border-radius: 4px;
    }

    .section-title-text {
      font-size: 13.5px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    /* Form Controls */
    .field-group {
      margin-bottom: 14px;
    }

    .field-label {
      display: block;
      font-size: 12.5px;
      font-weight: 700;
      color: var(--text-secondary, #94a3b8);
      margin-bottom: 6px;
    }

    .field-label .req {
      color: #ef4444;
      margin-left: 2px;
    }

    .form-ctrl {
      width: 100%;
      padding: 12px 14px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      color: #ffffff;
      font-size: 14px;
      font-weight: 600;
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.2s;
    }

    .form-ctrl:focus {
      border-color: var(--purple-primary, #8b5cf6);
    }

    .select-wrapper {
      position: relative;
    }

    .select-wrapper::after {
      content: "\\f0d7";
      font-family: "Font Awesome 6 Free";
      font-weight: 900;
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      pointer-events: none;
      font-size: 13px;
    }

    select.form-ctrl {
      appearance: none;
      -webkit-appearance: none;
      padding-right: 36px;
      cursor: pointer;
    }

    /* Aggregated Summary Row */
    .summary-aggregate-row {
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 18px;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .summary-aggregate-row:active {
      transform: scale(0.98);
      background: rgba(124, 58, 237, 0.25);
    }

    .agg-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .agg-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: rgba(124, 58, 237, 0.2);
      border: 1px solid rgba(124, 58, 237, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--purple-primary, #8b5cf6);
      font-size: 18px;
    }

    .agg-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-secondary, #94a3b8);
      margin-bottom: 2px;
    }

    .agg-amount {
      font-size: 18px;
      font-weight: 900;
      color: #ffffff;
    }

    .agg-btn-drill {
      width: 36px;
      height: 36px;
      border-radius: 12px;
      background: var(--purple-primary, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 15px;
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
    }

    /* Category Cards (View 2) */
    .category-card {
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 18px;
      padding: 16px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .category-card:active {
      transform: scale(0.98);
      background: rgba(30, 41, 59, 0.9);
    }

    /* Item Card (View 3) */
    .item-record-card {
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 14px 16px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .empty-state-box {
      text-align: center;
      padding: 36px 20px;
      background: rgba(30, 41, 59, 0.4);
      border: 1px dashed rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      margin-bottom: 20px;
    }

    /* Buttons */
    .btn-submit-primary {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      border: none;
      color: #ffffff;
      padding: 12px 28px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);
      transition: transform 0.15s;
    }

    .btn-submit-primary:active { transform: scale(0.96); }

    .btn-draft-bright {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.18);
      color: #ffffff;
      padding: 12px 22px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: transform 0.15s;
    }

    .btn-draft-bright:active { transform: scale(0.96); }

    .btn-step-back {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: var(--text-secondary, #94a3b8);
      padding: 10px 20px;
      border-radius: 9999px;
      font-size: 13.5px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .file-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(124, 58, 237, 0.15);
      border: 1px solid rgba(124, 58, 237, 0.3);
      border-radius: 8px;
      padding: 4px 10px;
      font-size: 11.5px;
      color: #c4b5fd;
    }
  </style>
</head>
<body>

  <preview-top-bar active-page="claims"></preview-top-bar>

  <div class="phone-container">
    
    <!-- TOP STICKY HEADER -->
    <div class="cal-top-header">
      <phone-status-bar time="13:08" style="color: #ffffff;"></phone-status-bar>
      
      <div class="header-nav-row">
        <div style="display: flex; align-items: center; gap: 12px;">
          <a href="javascript:void(0)" class="header-back-btn" onclick="handleHeaderBack()" aria-label="Back">
            <i class="fa-solid fa-chevron-left" style="font-size: 16px;"></i>
          </a>
          <h1 class="header-title-text" id="headerNavTitle">Expense Claim</h1>
        </div>
        <div style="color: #ffffff; opacity: 0.8; cursor: pointer; padding: 4px;">
          <i class="fa-solid fa-ellipsis-vertical" style="font-size: 18px;"></i>
        </div>
      </div>
    </div>

    <!-- MAIN SCROLLABLE CONTENT -->
    <div class="main-content">

      <!-- ========================================================= -->
      <!-- VIEW 1: MAIN APPLICATION VIEW (Level 1) -->
      <!-- ========================================================= -->
      <div class="view-container active" id="view-1-main">

        <!-- MAIN INFO CARD -->
        <div class="form-card">
          <div class="section-title-bar">
            <i class="fa-solid fa-file-invoice-dollar" style="color: var(--purple-primary);"></i>
            <span>Main Form Info</span>
          </div>

          <!-- Claim Period (Year) & Month -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;" class="field-group">
            <div>
              <label class="field-label">Claim Period :</label>
              <input type="text" id="claimPeriodYear" class="form-ctrl" value="2026" readonly />
            </div>
            <div>
              <label class="field-label">Month :</label>
              <div class="select-wrapper">
                <select id="claimPeriodMonth" class="form-ctrl">
                  <option value="January">January</option>
                  <option value="February">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                  <option value="May">May</option>
                  <option value="June">June</option>
                  <option value="July">July</option>
                  <option value="August">August</option>
                  <option value="September" selected>September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Date From & Date To -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;" class="field-group">
            <div>
              <label class="field-label">Date From :</label>
              <input type="date" id="claimDateFrom" class="form-ctrl" value="2026-09-23" />
            </div>
            <div>
              <label class="field-label">Date To :</label>
              <input type="date" id="claimDateTo" class="form-ctrl" value="2026-09-23" />
            </div>
          </div>

          <!-- Benefit Year & Benefit Type -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;" class="field-group">
            <div>
              <label class="field-label">Benefit Year :</label>
              <input type="text" id="benefitYear" class="form-ctrl" value="2026" readonly />
            </div>
            <div>
              <label class="field-label">Benefit Type :</label>
              <div class="select-wrapper">
                <select id="benefitTypeSelect" class="form-ctrl">
                  <option value="" selected>Select Benefit</option>
                  <option value="GENERAL EXPENSE">General Expense</option>
                  <option value="OFFICE SUPPLIES">Office Supplies</option>
                  <option value="SUBSCRIPTIONS">Subscriptions & Software</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Cost Centre & Charge To -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;" class="field-group">
            <div>
              <label class="field-label">Cost Centre :</label>
              <div class="select-wrapper">
                <select id="costCentreSelect" class="form-ctrl">
                  <option value="MANAGEMENT" selected>MANAGEMENT</option>
                  <option value="ADMINISTRATION">ADMINISTRATION</option>
                  <option value="FINANCE & ACCOUNTING">FINANCE & ACCOUNTING</option>
                  <option value="SALES & MARKETING">SALES & MARKETING</option>
                  <option value="IT DEPARTMENT">IT DEPARTMENT</option>
                </select>
              </div>
            </div>
            <div>
              <label class="field-label">Charge To :</label>
              <div class="select-wrapper">
                <select id="chargeToSelect" class="form-ctrl">
                  <option value="Company" selected>Company</option>
                  <option value="Client">Client</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Purpose -->
          <div class="field-group">
            <label class="field-label">Purpose : <span class="req">*</span></label>
            <input type="text" id="claimPurpose" class="form-ctrl" value="Stationery & Office Purchases" placeholder="Enter claim purpose..." />
          </div>

          <!-- Project -->
          <div class="field-group">
            <label class="field-label">Project :</label>
            <div class="select-wrapper">
              <select id="projectSelect" class="form-ctrl">
                <option value="" selected>Select Project</option>
                <option value="HQ Digitalization">HQ Digitalization</option>
                <option value="Mobile HCM App">Mobile HCM App</option>
              </select>
            </div>
          </div>

          <!-- Claim Currency -->
          <div class="field-group">
            <label class="field-label">Claim Currency :</label>
            <input type="text" class="form-ctrl" value="RINGGIT MALAYSIA" readonly />
          </div>

          <!-- Remarks -->
          <div class="field-group" style="margin-bottom: 0;">
            <label class="field-label">Remarks :</label>
            <textarea id="claimRemarks" class="form-ctrl" rows="2" placeholder="Enter remarks..." style="resize: none;"></textarea>
          </div>
        </div>

        <!-- AGGREGATED SUMMARY ROW (Drill-down to View 2) -->
        <div class="summary-aggregate-row" onclick="switchView('view-2-categories', 'Claim Categories')">
          <div class="agg-left">
            <div class="agg-icon-box">
              <i class="fa-solid fa-receipt"></i>
            </div>
            <div>
              <div class="agg-title">Total Claim</div>
              <div class="agg-amount" id="mainTotalClaimDisplay">RM 165.00</div>
            </div>
          </div>
          <div class="agg-btn-drill">
            <i class="fa-solid fa-chevron-right"></i>
          </div>
        </div>

        <!-- UPLOAD ATTACHMENTS (Main Form) -->
        <div class="form-card">
          <div class="section-title-bar">
            <i class="fa-solid fa-paperclip" style="color: var(--purple-primary);"></i>
            <span>Upload Attachments</span>
          </div>
          <div style="display: flex; align-items: center; justify-content: center; gap: 36px; padding: 10px 0;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;" onclick="triggerFileUpload('main')">
              <div style="width: 52px; height: 52px; border-radius: 50%; background: rgba(124, 58, 237, 0.12); border: 1px solid rgba(124, 58, 237, 0.3); display: flex; align-items: center; justify-content: center; color: var(--purple-primary); font-size: 20px;">
                <i class="fa-solid fa-file-arrow-up"></i>
              </div>
              <span style="font-size: 12.5px; font-weight: 700; color: var(--purple-primary);">Select File</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;" onclick="triggerFileUpload('main')">
              <div style="width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 20px; box-shadow: 0 6px 18px rgba(124, 58, 237, 0.45);">
                <i class="fa-solid fa-camera"></i>
              </div>
              <span style="font-size: 12.5px; font-weight: 800; color: var(--text-primary);">Take Picture</span>
            </div>
          </div>
          <div id="mainChipsList" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; justify-content: center;"></div>
        </div>

        <!-- BOTTOM ACTION BUTTONS -->
        <div style="display: flex; justify-content: flex-end; align-items: center; gap: 12px; margin-top: 18px;">
          <button type="button" class="btn-draft-bright" onclick="saveDraft()">
            <i class="fa-solid fa-floppy-disk"></i>
            <span>Draft</span>
          </button>
          <button type="button" class="btn-submit-primary" onclick="submitExpenseClaim()">
            <span>Submit</span>
            <i class="fa-solid fa-paper-plane"></i>
          </button>
        </div>

      </div>

      <!-- ========================================================= -->
      <!-- VIEW 2: CLAIM CATEGORIES VIEW (Level 2) -->
      <!-- ========================================================= -->
      <div class="view-container" id="view-2-categories">
        
        <div style="font-size: 14px; font-weight: 800; color: #ffffff; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-layer-group" style="color: var(--purple-primary);"></i>
          <span>Select Expense Category</span>
        </div>

        <!-- CATEGORY: EXPENSE ITEMS -->
        <div class="category-card" onclick="openCategoryItems('expense')">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 44px; height: 44px; border-radius: 14px; background: rgba(124, 58, 237, 0.18); border: 1px solid rgba(124, 58, 237, 0.35); display: flex; align-items: center; justify-content: center; color: var(--purple-primary); font-size: 18px;">
              <i class="fa-solid fa-receipt"></i>
            </div>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #ffffff;">Expense Items</div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;" id="catExpenseCount">2 records added</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 16px; font-weight: 900; color: #ffffff;" id="catExpenseSum">RM 165.00</div>
            <i class="fa-solid fa-chevron-right" style="color: var(--text-secondary); font-size: 14px;"></i>
          </div>
        </div>

        <!-- BOTTOM RETURN BUTTON -->
        <div style="margin-top: 24px;">
          <button type="button" class="btn-step-back" onclick="switchView('view-1-main', 'Expense Claim')">
            <i class="fa-solid fa-arrow-left"></i>
            <span>Back to Application</span>
          </button>
        </div>
      </div>

      <!-- ========================================================= -->
      <!-- VIEW 3: ITEM LIST VIEW (Level 3) -->
      <!-- ========================================================= -->
      <div class="view-container" id="view-3-list">
        
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div style="font-size: 15px; font-weight: 800; color: #ffffff;" id="view3CatTitle">Expense Items</div>
          <button type="button" class="btn-submit-primary" style="padding: 8px 16px; font-size: 12.5px;" onclick="openSubForm('add')">
            <i class="fa-solid fa-plus"></i>
            <span>Add Item</span>
          </button>
        </div>

        <div id="v3ItemListContainer">
          <!-- Populated by JS -->
        </div>

        <!-- BOTTOM RETURN BUTTON -->
        <div style="margin-top: 20px;">
          <button type="button" class="btn-step-back" onclick="switchView('view-2-categories', 'Claim Categories')">
            <i class="fa-solid fa-arrow-left"></i>
            <span>Back to Categories</span>
          </button>
        </div>
      </div>

      <!-- ========================================================= -->
      <!-- VIEW 4: ITEM DETAIL ENTRY VIEW (Level 4) -->
      <!-- ========================================================= -->
      <div class="view-container" id="view-4-entry">
        
        <!-- SUB-FORM FORM CARDS CONTAINER -->
        <div id="v4SubFormContainer">
          <!-- Populated by JS for Expense Details -->
        </div>

        <!-- BOTTOM ACTION BUTTONS (Matching Screenshot 2026-09-24 110146.png) -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px;">
          <button type="button" class="btn-step-back" onclick="switchView('view-3-list', getCategoryTitle(formData.activeCategory))">
            <i class="fa-solid fa-xmark"></i>
            <span>Cancel</span>
          </button>
          <button type="button" class="btn-submit-primary" onclick="saveSubItem()">
            <i class="fa-solid fa-floppy-disk"></i>
            <span>Save Item</span>
          </button>
        </div>

      </div>

    </div>
  </div>

  <input type="file" id="globalFileInput" style="display: none;" onchange="handleFileSelect(this)" />

  <script>
    const formData = {
      currentView: 'view-1-main',
      activeCategory: 'expense',
      editingIndex: -1,
      items: {
        expense: [
          { id: '1', receiptNo: 'RCP-9901', expense: 'Office Supplies', company: 'Popular Bookstore', businessRN: 'RN-88102', desc: 'Stationery & Printing', amount: 120.00 },
          { id: '2', receiptNo: 'RCP-9905', expense: 'Meal & Entertainment', company: 'Starbucks Discussion', businessRN: 'RN-88105', desc: 'Client Discussion Coffee', amount: 45.00 }
        ]
      }
    };

    let activeUploadContext = 'main';
    const mainAttachments = [];
    const subAttachments = [];

    function switchView(viewId, title) {
      document.querySelectorAll('.view-container').forEach(el => el.classList.remove('active'));
      const target = document.getElementById(viewId);
      if (target) target.classList.add('active');

      formData.currentView = viewId;
      if (title) {
        document.getElementById('headerNavTitle').innerText = title;
      }
      window.scrollTo(0, 0);
    }

    function handleHeaderBack() {
      if (formData.currentView === 'view-4-entry') {
        switchView('view-3-list', getCategoryTitle(formData.activeCategory));
      } else if (formData.currentView === 'view-3-list') {
        switchView('view-2-categories', 'Claim Categories');
      } else if (formData.currentView === 'view-2-categories') {
        switchView('view-1-main', 'Expense Claim');
      } else {
        window.location.href = '../index.html';
      }
    }

    function getCategoryTitle(catKey) {
      return 'Expense Items';
    }

    function openCategoryItems(categoryKey) {
      formData.activeCategory = categoryKey;
      renderView3List();
      switchView('view-3-list', getCategoryTitle(categoryKey));
    }

    function renderView3List() {
      const catKey = formData.activeCategory;
      const container = document.getElementById('v3ItemListContainer');
      const items = formData.items[catKey] || [];
      const catName = getCategoryTitle(catKey);

      document.getElementById('view3CatTitle').innerText = catName;

      if (items.length === 0) {
        container.innerHTML = `
          <div class="empty-state-box">
            <div style="width: 54px; height: 54px; border-radius: 50%; background: rgba(124, 58, 237, 0.15); display: flex; align-items: center; justify-content: center; color: var(--purple-primary); font-size: 22px; margin: 0 auto 12px;">
              <i class="fa-solid fa-receipt"></i>
            </div>
            <div style="font-size: 15px; font-weight: 800; color: #ffffff; margin-bottom: 4px;">No items added yet</div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px;">Click button below to add your first expense item</div>
            <button type="button" class="btn-submit-primary" style="padding: 9px 20px; font-size: 13px;" onclick="openSubForm('add')">
              <i class="fa-solid fa-plus"></i>
              <span>+ Add Item</span>
            </button>
          </div>
        `;
        return;
      }

      let html = '';
      items.forEach((item, idx) => {
        html += `
          <div class="item-record-card">
            <div style="flex: 1;" onclick="openSubForm('edit', ${idx})">
              <div style="font-size: 14.5px; font-weight: 800; color: #ffffff;">${item.company || item.expense}</div>
              <div style="font-size: 11.5px; color: var(--text-secondary); margin-top: 3px;">
                ${item.receiptNo ? item.receiptNo + ' • ' : ''}${item.desc || item.expense}
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="font-size: 15px; font-weight: 900; color: #ffffff;">RM ${item.amount.toFixed(2)}</div>
              <button type="button" onclick="deleteSubItem(${idx})" style="background: rgba(239, 68, 68, 0.14); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; width: 32px; height: 32px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                <i class="fa-solid fa-trash-can" style="font-size: 12px;"></i>
              </button>
            </div>
          </div>
        `;
      });

      container.innerHTML = html;
    }

    function openSubForm(mode, index = -1) {
      formData.editingIndex = index;
      const catKey = formData.activeCategory;
      const container = document.getElementById('v4SubFormContainer');
      const item = index >= 0 ? formData.items[catKey][index] : null;

      container.innerHTML = `
        <div class="form-card">
          <div class="section-header-bar no-top-border">
            <span class="section-title-accent"></span>
            <span class="section-title-text">EXPENSE DETAILS</span>
          </div>

          <div class="field-group">
            <label class="field-label">Receipt No. :</label>
            <input type="text" id="eReceiptNo" class="form-ctrl" value="${item ? item.receiptNo : ''}" placeholder="" />
          </div>

          <div class="field-group">
            <label class="field-label">Expenses :</label>
            <div class="select-wrapper">
              <select id="eTypeSelect" class="form-ctrl">
                <option value="" ${!item || !item.expense ? 'selected' : ''}>Select Expense</option>
                <option value="Office Supplies" ${item && item.expense === 'Office Supplies' ? 'selected' : ''}>Office Supplies</option>
                <option value="Meal & Entertainment" ${item && item.expense === 'Meal & Entertainment' ? 'selected' : ''}>Meal & Entertainment</option>
                <option value="Subscriptions & Software" ${item && item.expense === 'Subscriptions & Software' ? 'selected' : ''}>Subscriptions & Software</option>
                <option value="Travel Mileage & Tolls" ${item && item.expense === 'Travel Mileage & Tolls' ? 'selected' : ''}>Travel Mileage & Tolls</option>
              </select>
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Company Name :</label>
            <input type="text" id="eCompanyName" class="form-ctrl" value="${item ? item.company : ''}" placeholder="" />
          </div>

          <div class="field-group">
            <label class="field-label">Business RN :</label>
            <input type="text" id="eBusinessRN" class="form-ctrl" value="${item ? item.businessRN : ''}" placeholder="" />
          </div>

          <div class="field-group">
            <label class="field-label">Description :</label>
            <input type="text" id="eDesc" class="form-ctrl" value="${item ? item.desc : ''}" placeholder="" />
          </div>

          <div class="field-group">
            <label class="field-label">Amount :</label>
            <input type="number" id="eAmount" class="form-ctrl" value="${item ? item.amount : 0}" step="0.01" />
          </div>

          <div style="margin-top: 14px;">
            <label class="field-label" style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px; display: block;">Upload Attachments</label>
            <div style="display: flex; align-items: center; justify-content: center; gap: 36px; padding: 8px 0;">
              <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;" onclick="triggerFileUpload('sub')">
                <div style="width: 50px; height: 50px; border-radius: 50%; background: rgba(124, 58, 237, 0.12); border: 1px solid rgba(124, 58, 237, 0.3); display: flex; align-items: center; justify-content: center; color: var(--purple-primary); font-size: 18px;">
                  <i class="fa-solid fa-file-arrow-up"></i>
                </div>
                <span style="font-size: 12px; font-weight: 700; color: var(--purple-primary);">Select File</span>
              </div>
              <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;" onclick="triggerFileUpload('sub')">
                <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 18px; box-shadow: 0 6px 18px rgba(124, 58, 237, 0.45);">
                  <i class="fa-solid fa-camera"></i>
                </div>
                <span style="font-size: 12px; font-weight: 800; color: var(--text-primary);">Take Picture</span>
              </div>
            </div>
            <div id="subChipsList" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; justify-content: center;"></div>
          </div>
        </div>
      `;

      switchView('view-4-entry', 'Configure Expense Items');
    }

    function saveSubItem() {
      const catKey = formData.activeCategory;
      const rec = document.getElementById('eReceiptNo')?.value || '';
      const exp = document.getElementById('eTypeSelect')?.value || 'Office Supplies';
      const comp = document.getElementById('eCompanyName')?.value || 'Expense';
      const biz = document.getElementById('eBusinessRN')?.value || '';
      const desc = document.getElementById('eDesc')?.value || '';
      const amt = parseFloat(document.getElementById('eAmount')?.value || 0);

      const newItem = { id: Date.now().toString(), receiptNo: rec, expense: exp, company: comp, businessRN: biz, desc: desc, amount: amt };

      if (formData.editingIndex >= 0) {
        formData.items[catKey][formData.editingIndex] = newItem;
      } else {
        formData.items[catKey].push(newItem);
      }

      updateTotals();
      openCategoryItems(catKey);
      if (typeof showToast === 'function') showToast('✓ Expense Item saved!');
    }

    function deleteSubItem(index) {
      const catKey = formData.activeCategory;
      formData.items[catKey].splice(index, 1);
      updateTotals();
      renderView3List();
      if (typeof showToast === 'function') showToast('Item deleted');
    }

    function updateTotals() {
      const expSum = (formData.items.expense || []).reduce((sum, item) => sum + item.amount, 0);

      document.getElementById('catExpenseSum').innerText = `RM ${expSum.toFixed(2)}`;
      document.getElementById('catExpenseCount').innerText = `${formData.items.expense.length} records added`;

      document.getElementById('mainTotalClaimDisplay').innerText = `RM ${expSum.toFixed(2)}`;
    }

    function triggerFileUpload(ctx) {
      activeUploadContext = ctx;
      document.getElementById('globalFileInput').click();
    }

    function handleFileSelect(input) {
      if (input.files && input.files.length > 0) {
        const fname = input.files[0].name;
        if (activeUploadContext === 'main') {
          mainAttachments.push(fname);
          renderChips('mainChipsList', mainAttachments);
        } else {
          subAttachments.push(fname);
          renderChips('subChipsList', subAttachments);
        }
      }
    }

    function renderChips(containerId, list) {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = list.map(f => `
        <div class="file-chip">
          <i class="fa-solid fa-paperclip"></i>
          <span>${f}</span>
        </div>
      `).join('');
    }

    function saveDraft() {
      if (typeof showToast === 'function') showToast('💾 Expense Claim draft saved!');
      else alert('Expense Claim draft saved!');
    }

    function submitExpenseClaim() {
      if (typeof showToast === 'function') showToast('🚀 Expense Claim submitted successfully!');
      else alert('Expense Claim submitted successfully!');
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 1200);
    }
  </script>
</body>
</html>
'''

with open('modules/claims/options/expenses-claim.html', 'w', encoding='utf-8') as f:
    f.write(new_expenses_html)

print('Updated expenses-claim.html to 4-Level Drill-Down UI layout successfully.')
