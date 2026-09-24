import os

file_path = r"C:\Users\loong\PQ-Mobile\modules\claims\options\travel-claim.html"

new_html = """<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Claims - Travel Mileage</title>
  <script src="../../../js/components.js"></script>
  <script src="../../../js/app.js" defer></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="../../../css/theme.css">
  <link rel="stylesheet" href="../../../css/app.css">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    body {
      background-color: var(--bg-page);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      color: var(--text-primary);
      padding: 20px 0;
    }

    .phone-container {
      width: 100%;
      max-width: 420px;
      height: 900px;
      background: var(--bg-phone);
      border-radius: 44px;
      overflow: hidden;
      box-shadow: var(--shadow-phone);
      position: relative;
      display: flex;
      flex-direction: column;
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px 16px 100px;
      position: relative;
      z-index: 10;
      scrollbar-width: none;
    }
    .main-content::-webkit-scrollbar { display: none; }

    .cal-top-header {
      background: linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%);
      padding: 12px 16px 16px;
      border-bottom-left-radius: 24px;
      border-bottom-right-radius: 24px;
      box-shadow: 0 8px 24px rgba(76, 29, 149, 0.28);
      position: relative;
      z-index: 20;
    }

    /* VIEW CONTAINERS (DRILL-DOWN ISOLATION) */
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

    .form-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 22px;
      padding: 20px 18px;
      margin-bottom: 14px;
      box-shadow: var(--shadow-card);
      position: relative;
    }

    .section-header-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding-top: 14px;
      margin-top: 14px;
      margin-bottom: 18px;
      border-top: 1px dashed var(--border-subtle);
    }
    .section-header-bar.no-top-border {
      border-top: none;
      padding-top: 0;
      margin-top: 0;
    }
    .section-title-accent {
      width: 3.5px;
      height: 15px;
      background: #a855f7;
      border-radius: 2px;
      display: inline-block;
      flex-shrink: 0;
    }
    .section-title-text {
      font-size: 13px;
      font-weight: 800;
      color: var(--text-primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .field-group {
      margin-bottom: 16px;
    }

    .field-label {
      display: block;
      font-size: 13px;
      font-weight: 700;
      color: var(--text-muted);
      margin-bottom: 6px;
    }

    .req { color: #ef4444; }

    .form-ctrl {
      width: 100%;
      background: var(--bg-input);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 12px 14px;
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text-primary);
      outline: none;
      transition: all 0.2s ease;
      appearance: none;
    }
    .form-ctrl:focus {
      border-color: var(--purple-primary);
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
    }
    .form-ctrl[readonly] {
      opacity: 0.9;
      background: rgba(255, 255, 255, 0.03);
    }

    .select-wrapper { position: relative; }
    .select-wrapper::after {
      content: "\\f0d7";
      font-family: "Font Awesome 6 Free";
      font-weight: 900;
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      pointer-events: none;
      font-size: 12px;
    }

    .btn-step-back {
      padding: 11px 20px;
      border-radius: 20px;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      font-size: 13.5px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: var(--shadow-sm);
    }

    .btn-step-next {
      padding: 11px 24px;
      border-radius: 20px;
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      border: none;
      color: #ffffff;
      font-size: 13.5px;
      font-weight: 800;
      cursor: pointer;
      white-space: nowrap;
      box-shadow: 0 4px 16px rgba(124, 58, 237, 0.45);
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-draft-bright {
      padding: 11px 22px;
      border-radius: 20px;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      font-size: 13.5px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: var(--shadow-sm);
    }

    .btn-submit-primary {
      padding: 11px 24px;
      border-radius: 20px;
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      border: none;
      color: #ffffff;
      font-size: 13.5px;
      font-weight: 800;
      cursor: pointer;
      white-space: nowrap;
      box-shadow: 0 4px 16px rgba(124, 58, 237, 0.45);
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-add-purple {
      padding: 10px 22px;
      border-radius: 20px;
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      border: none;
      color: #ffffff;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      white-space: nowrap;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .category-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 20px;
      padding: 16px 18px;
      margin-bottom: 12px;
      box-shadow: var(--shadow-card);
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .category-card:active {
      transform: scale(0.98);
      border-color: var(--purple-primary);
    }

    .file-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(124, 58, 237, 0.12);
      border: 1px solid rgba(124, 58, 237, 0.25);
      color: var(--purple-primary);
      padding: 5px 10px;
      border-radius: 8px;
      font-size: 11.5px;
      font-weight: 700;
      margin-top: 6px;
    }
  </style>
</head>
<body>

  <preview-top-bar active-page="claims"></preview-top-bar>

  <div class="phone-container">
    
    <!-- Top Header -->
    <div class="cal-top-header">
      <phone-status-bar time="9:41" style="color: #ffffff;"></phone-status-bar>

      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <button type="button" id="headerBackBtn" onclick="handleHeaderBack()" aria-label="Back" title="Back"
            style="background: rgba(255, 255, 255, 0.18); border: 1px solid rgba(255, 255, 255, 0.25); width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #ffffff; outline: none;">
            <i class="fa-solid fa-chevron-left" style="font-size: 16px;"></i>
          </button>
          <h1 id="headerTitleText" style="font-size: 18px; font-weight: 800; color: #ffffff; margin: 0;">Travel Mileage</h1>
        </div>
      </div>
    </div>

    <!-- Main Scrollable Area -->
    <div class="main-content">
      
      <!-- ========================================================= -->
      <!-- GLOBAL PERSISTENT CONTEXT CARD (Appears in all 4 views) -->
      <!-- ========================================================= -->
      <div class="context-card" style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 20px; padding: 14px 16px; margin-bottom: 16px; box-shadow: var(--shadow-card);">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 42px; height: 42px; border-radius: 14px; background: rgba(124, 58, 237, 0.15); border: 1px solid rgba(124, 58, 237, 0.3); color: var(--purple-primary); display: flex; align-items: center; justify-content: center; font-size: 18px;">
              <i class="fa-solid fa-plane-departure"></i>
            </div>
            <div>
              <div style="font-size: 14.5px; font-weight: 800; color: var(--text-primary); line-height: 1.2;">SALLY FIELD</div>
              <!-- EMPLOYEE ID DISPLAY STANDARD FROM AGENTS.MD RULE -->
              <div style="font-size: 11.5px; font-weight: 700; color: var(--text-muted); opacity: 0.8; font-family: monospace, sans-serif; margin-bottom: 4px;">#A100</div>
              <div style="font-size: 11px; font-weight: 600; color: var(--text-muted);">Travelling &amp; Mileage Claim Form</div>
            </div>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; display: block;">DATE SUBMIT</span>
            <span style="font-size: 12.5px; font-weight: 800; color: var(--purple-primary);">23/09/2026</span>
          </div>
        </div>
      </div>

      <!-- ========================================================= -->
      <!-- VIEW 1: MAIN FORM VIEW (主表单页) -->
      <!-- ========================================================= -->
      <div class="view-container active" id="view-1-main">
        
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
        </div>

        <!-- MAIN INFO FORM CARD -->
        <div class="form-card">
          
          <div class="section-header-bar no-top-border">
            <span class="section-title-accent"></span>
            <span class="section-title-text">APPLICATION DETAILS</span>
          </div>

          <!-- Claim Period : -->
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

          <!-- Travelling Request # : -->
          <div class="field-group">
            <label class="field-label">Travelling Request # :</label>
            <div class="select-wrapper">
              <select id="v1TravellingReqNo" class="form-ctrl">
                <option value="" selected>- Select Travelling Request # -</option>
                <option value="TR-2026-001">TR-2026-001 (KL Site Visit)</option>
                <option value="TR-2026-002">TR-2026-002 (Penang Client Meeting)</option>
              </select>
            </div>
          </div>

          <!-- Travel Claim Type : -->
          <div class="field-group">
            <label class="field-label">Travel Claim Type : <span class="req">*</span></label>
            <div class="select-wrapper">
              <select id="v1TravelClaimType" class="form-ctrl">
                <option value="Travel Record" selected>Travel Record</option>
                <option value="MILEAGE">MILEAGE (RM0.80/KM)</option>
                <option value="PARKING & TOLLS">PARKING &amp; TOLL RECEIPTS</option>
                <option value="ACCOMMODATION & FLIGHTS">ACCOMMODATION &amp; FLIGHTS</option>
              </select>
            </div>
          </div>

          <!-- Claim Date : -->
          <div class="field-group">
            <label class="field-label">Claim Date :</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <input type="text" id="v1ClaimStartDate" class="form-ctrl" value="23/09/2026" />
              <input type="text" id="v1ClaimEndDate" class="form-ctrl" value="23/09/2026" />
            </div>
          </div>

          <!-- Cost Centre : -->
          <div class="field-group">
            <label class="field-label">Cost Centre :</label>
            <div class="select-wrapper">
              <select id="v1CostCentre" class="form-ctrl">
                <option value="MANAGEMENT" selected>MANAGEMENT</option>
                <option value="ADMINISTRATION">ADMINISTRATION</option>
                <option value="FINANCE & ACCOUNTING">FINANCE &amp; ACCOUNTING</option>
                <option value="IT DEPARTMENT">IT DEPARTMENT</option>
              </select>
            </div>
          </div>

          <!-- Charge To : -->
          <div class="field-group">
            <label class="field-label">Charge To :</label>
            <div class="select-wrapper">
              <select id="v1ChargeTo" class="form-ctrl">
                <option value="" selected>- Select Charge -</option>
                <option value="Company HQ">Company HQ</option>
                <option value="Project Budget">Project Budget</option>
                <option value="Client Account">Client Account</option>
              </select>
            </div>
          </div>

          <!-- Purpose : -->
          <div class="field-group">
            <label class="field-label">Purpose :</label>
            <input type="text" id="v1Purpose" class="form-ctrl" placeholder="Enter travel purpose..." />
          </div>

          <!-- Project : -->
          <div class="field-group">
            <label class="field-label">Project :</label>
            <div class="select-wrapper">
              <select id="v1Project" class="form-ctrl">
                <option value="" selected>- Select Project -</option>
                <option value="HQ Digitalization">HQ Digitalization</option>
                <option value="Mobile HCM App">Mobile HCM App</option>
                <option value="Regional Expansion">Regional Expansion</option>
              </select>
            </div>
          </div>

          <!-- Claim Currency : -->
          <div class="field-group">
            <label class="field-label">Claim Currency :</label>
            <div class="select-wrapper">
              <select id="v1ClaimCurrency" class="form-ctrl">
                <option value="RINGGIT MALAYSIA" selected>RINGGIT MALAYSIA</option>
                <option value="US DOLLAR">US DOLLAR</option>
                <option value="SINGAPORE DOLLAR">SINGAPORE DOLLAR</option>
              </select>
            </div>
          </div>

          <!-- Remark : -->
          <div class="field-group">
            <label class="field-label">Remark :</label>
            <input type="text" id="v1Remark" class="form-ctrl" value="" placeholder="Additional remarks..." />
          </div>

        </div>

        <!-- AGGREGATED SUMMARY ROW (Level 1 Total Claim & Drill-down Entry) -->
        <div class="category-summary-row" onclick="switchView('view-2-categories', 'Claim Categories')" style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.12) 0%, rgba(109, 40, 217, 0.18) 100%); border: 1.5px solid rgba(124, 58, 237, 0.4); border-radius: 22px; padding: 18px; margin-bottom: 16px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 6px 20px rgba(124, 58, 237, 0.18); transition: transform 0.2s ease;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 46px; height: 46px; border-radius: 14px; background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.45);">
              <i class="fa-solid fa-calculator"></i>
            </div>
            <div>
              <div style="font-size: 11px; font-weight: 800; color: var(--purple-primary); text-transform: uppercase; letter-spacing: 0.5px;">TOTAL CLAIM AMOUNT</div>
              <div id="v1TotalClaimDisplay" style="font-size: 20px; font-weight: 900; color: var(--text-primary); margin-top: 2px;">RM 0.00</div>
              <div id="v1ItemsCountSubtitle" style="font-size: 11.5px; font-weight: 600; color: var(--text-muted); margin-top: 1px;">0 claim items added</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; background: rgba(124, 58, 237, 0.2); border: 1px solid rgba(124, 58, 237, 0.4); padding: 8px 14px; border-radius: 14px; color: var(--purple-primary); font-size: 12.5px; font-weight: 800;">
            <span>Details</span>
            <i class="fa-solid fa-chevron-right"></i>
          </div>
        </div>

        <!-- ATTACHMENTS CARD -->
        <div class="form-card">
          <label class="field-label" style="font-size: 13.5px; font-weight: 800; color: var(--text-primary); margin-bottom: 12px; display: block;">Upload Main Attachments</label>
          
          <div style="display: flex; align-items: center; justify-content: center; gap: 36px; padding: 8px 0;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;" onclick="triggerFileUpload('main')">
              <div style="width: 54px; height: 54px; border-radius: 50%; background: rgba(124, 58, 237, 0.12); border: 1px solid rgba(124, 58, 237, 0.3); display: flex; align-items: center; justify-content: center; color: var(--purple-primary); font-size: 18px;">
                <i class="fa-solid fa-file-arrow-up"></i>
              </div>
              <span style="font-size: 12.5px; font-weight: 700; color: var(--purple-primary);">Select File(s)</span>
            </div>

            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;" onclick="triggerFileUpload('main')">
              <div style="width: 54px; height: 54px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 18px; box-shadow: 0 6px 18px rgba(124, 58, 237, 0.45);">
                <i class="fa-solid fa-camera"></i>
              </div>
              <span style="font-size: 12.5px; font-weight: 800; color: var(--text-primary);">Take Picture</span>
            </div>
          </div>

          <div id="mainChipsList" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; justify-content: center;"></div>
        </div>

        <!-- BOTTOM ACTION BUTTONS -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 18px;">
          <button type="button" class="btn-draft-bright" onclick="saveDraft()">
            <i class="fa-solid fa-floppy-disk"></i>
            <span>Draft</span>
          </button>
          <button type="button" class="btn-submit-primary" onclick="submitTravelClaim()">
            <span>Submit Claim</span>
            <i class="fa-solid fa-paper-plane"></i>
          </button>
        </div>

      </div>

      <!-- ========================================================= -->
      <!-- VIEW 2: CATEGORY SUMMARY VIEW (分类聚合导航页) -->
      <!-- ========================================================= -->
      <div class="view-container" id="view-2-categories">
        
        <div style="margin-bottom: 14px;">
          <h2 style="font-size: 15px; font-weight: 800; color: var(--text-primary);">Claim Categories (3)</h2>
          <span style="font-size: 12px; font-weight: 600; color: var(--text-muted);">Select a category to view or add detailed item receipts</span>
        </div>

        <!-- CATEGORY 1: MILEAGE CLAIM -->
        <div class="category-card" onclick="openCategoryItems('mileage')">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 44px; height: 44px; border-radius: 14px; background: rgba(124, 58, 237, 0.15); border: 1px solid rgba(124, 58, 237, 0.3); color: var(--purple-primary); display: flex; align-items: center; justify-content: center; font-size: 18px;">
              <i class="fa-solid fa-route"></i>
            </div>
            <div>
              <div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">Mileage Claim</div>
              <div id="catMileageSubtitle" style="font-size: 11.5px; font-weight: 600; color: var(--text-muted); margin-top: 2px;">0 items added (RM 0.80/KM)</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div id="catMileageAmount" style="font-size: 15px; font-weight: 800; color: var(--purple-primary);">RM 0.00</div>
            <i class="fa-solid fa-chevron-right" style="color: var(--text-muted); font-size: 14px;"></i>
          </div>
        </div>

        <!-- CATEGORY 2: TRAVELLING RECEIPT -->
        <div class="category-card" onclick="openCategoryItems('travel')">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 44px; height: 44px; border-radius: 14px; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); color: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 18px;">
              <i class="fa-solid fa-ticket-simple"></i>
            </div>
            <div>
              <div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">Travelling Receipt</div>
              <div id="catTravelSubtitle" style="font-size: 11.5px; font-weight: 600; color: var(--text-muted); margin-top: 2px;">0 items added (Flights, Trains, Grab)</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div id="catTravelAmount" style="font-size: 15px; font-weight: 800; color: #3b82f6;">RM 0.00</div>
            <i class="fa-solid fa-chevron-right" style="color: var(--text-muted); font-size: 14px;"></i>
          </div>
        </div>

        <!-- CATEGORY 3: OTHER EXPENSES -->
        <div class="category-card" onclick="openCategoryItems('expense')">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 44px; height: 44px; border-radius: 14px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 18px;">
              <i class="fa-solid fa-receipt"></i>
            </div>
            <div>
              <div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">Other Expenses</div>
              <div id="catExpenseSubtitle" style="font-size: 11.5px; font-weight: 600; color: var(--text-muted); margin-top: 2px;">0 items added (Hotel, Tolls, Meals)</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div id="catExpenseAmount" style="font-size: 15px; font-weight: 800; color: #10b981;">RM 0.00</div>
            <i class="fa-solid fa-chevron-right" style="color: var(--text-muted); font-size: 14px;"></i>
          </div>
        </div>

        <!-- BOTTOM ACTION BUTTONS -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px;">
          <button type="button" class="btn-step-back" onclick="switchView('view-1-main', 'Travel Mileage')">
            <i class="fa-solid fa-arrow-left"></i>
            <span>Back to Application</span>
          </button>
          <button type="button" class="btn-submit-primary" onclick="submitTravelClaim()">
            <span>Submit Claim</span>
            <i class="fa-solid fa-paper-plane"></i>
          </button>
        </div>

      </div>

      <!-- ========================================================= -->
      <!-- VIEW 3: ITEM LIST VIEW (明细项列表页) -->
      <!-- ========================================================= -->
      <div class="view-container" id="view-3-list">
        
        <!-- Category Summary Title Header -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 20px; padding: 16px; margin-bottom: 16px; box-shadow: var(--shadow-sm); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div id="v3CategoryIconBox" style="width: 42px; height: 42px; border-radius: 14px; background: rgba(124, 58, 237, 0.15); color: var(--purple-primary); display: flex; align-items: center; justify-content: center; font-size: 18px;">
              <i class="fa-solid fa-list-check"></i>
            </div>
            <div>
              <h2 id="v3CategoryTitleText" style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin: 0;">Mileage Items List</h2>
              <span id="v3CategoryItemsCount" style="font-size: 11.5px; font-weight: 600; color: var(--text-muted);">0 items recorded</span>
            </div>
          </div>
          <button type="button" class="btn-add-purple" onclick="openEntryForm()">
            <i class="fa-solid fa-plus"></i>
            <span>Add Item</span>
          </button>
        </div>

        <!-- DYNAMIC ITEMS LIST / EMPTY STATE CONTAINER -->
        <div id="v3ItemsContainer">
          <!-- Populated by JS -->
        </div>

        <!-- BOTTOM ACTION BUTTONS -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px;">
          <button type="button" class="btn-step-back" onclick="switchView('view-2-categories', 'Claim Categories')">
            <i class="fa-solid fa-arrow-left"></i>
            <span>Back to Categories</span>
          </button>
          <button type="button" class="btn-submit-primary" onclick="submitTravelClaim()">
            <span>Submit Claim</span>
            <i class="fa-solid fa-paper-plane"></i>
          </button>
        </div>

      </div>

      <!-- ========================================================= -->
      <!-- VIEW 4: ITEM DETAIL ENTRY VIEW (子表单录入页) -->
      <!-- ========================================================= -->
      <div class="view-container" id="view-4-entry">
        
        <!-- SUB-FORM FORM CARDS CONTAINER -->
        <div id="v4SubFormContainer">
          <!-- Populated by JS according to active category (Mileage / Travel / Expense) -->
        </div>

        <!-- BOTTOM ACTION BUTTONS -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px;">
          <button type="button" class="btn-step-back" onclick="switchView('view-3-list')">
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

    <!-- Hidden File Input -->
    <input type="file" id="hiddenTravelFileInput" accept="image/*,.pdf" style="display: none;" onchange="handleFileSelected(this)">

    <phone-bottom-nav active="apps"></phone-bottom-nav>
  </div>

  <!-- STATE MANAGEMENT & DRILL-DOWN NAVIGATION SCRIPT -->
  <script>
    // =========================================================
    // UNIFIED GLOBAL FORM STATE (SCHEMA & STATE ARCHITECTURE)
    // =========================================================
    const formData = {
      applicationInfo: {
        claimPeriodYear: '2026',
        claimPeriodMonth: 'September',
        travellingReqNo: '',
        travelClaimType: 'Travel Record',
        claimStartDate: '23/09/2026',
        claimEndDate: '23/09/2026',
        costCentre: 'MANAGEMENT',
        chargeTo: 'Company HQ',
        purpose: '',
        project: 'HQ Digitalization',
        claimCurrency: 'RINGGIT MALAYSIA',
        remark: ''
      },
      claimDetails: {
        mileageItems: [],
        travelItems: [],
        generalExpenseItems: []
      },
      activeCategory: 'mileage', // 'mileage' | 'travel' | 'expense'
      currentView: 'view-1-main',
      uploadTarget: 'main'
    };

    // =========================================================
    // NAVIGATION & VIEW DRILL-DOWN LOGIC
    // =========================================================
    function switchView(viewId, headerTitle) {
      formData.currentView = viewId;
      document.querySelectorAll('.view-container').forEach(el => el.classList.remove('active'));
      const targetView = document.getElementById(viewId);
      if (targetView) targetView.classList.add('active');

      const titleTextEl = document.getElementById('headerTitleText');
      if (titleTextEl && headerTitle) {
        titleTextEl.innerText = headerTitle;
      }

      const mainContent = document.querySelector('.main-content');
      if (mainContent) mainContent.scrollTop = 0;
      window.scrollTo(0, 0);
    }

    function handleHeaderBack() {
      if (formData.currentView === 'view-4-entry') {
        switchView('view-3-list', getCategoryTitle(formData.activeCategory));
      } else if (formData.currentView === 'view-3-list') {
        switchView('view-2-categories', 'Claim Categories');
      } else if (formData.currentView === 'view-2-categories') {
        switchView('view-1-main', 'Travel Mileage');
      } else {
        window.location.href = '../index.html';
      }
    }

    function getCategoryTitle(catKey) {
      if (catKey === 'mileage') return 'Mileage Claim Items';
      if (catKey === 'travel') return 'Travelling Receipt Items';
      if (catKey === 'expense') return 'Other Expenses Items';
      return 'Claim Items';
    }

    // =========================================================
    // LEVEL 2 & LEVEL 3 CATEGORY MANAGEMENT
    // =========================================================
    function openCategoryItems(categoryKey) {
      formData.activeCategory = categoryKey;
      renderView3List();
      switchView('view-3-list', getCategoryTitle(categoryKey));
    }

    function renderView3List() {
      const catKey = formData.activeCategory;
      const iconBox = document.getElementById('v3CategoryIconBox');
      const titleText = document.getElementById('v3CategoryTitleText');
      const countText = document.getElementById('v3CategoryItemsCount');
      const container = document.getElementById('v3ItemsContainer');

      let items = [];
      let catName = '';
      let iconHtml = '';

      if (catKey === 'mileage') {
        items = formData.claimDetails.mileageItems;
        catName = 'Mileage Claim Items';
        iconHtml = '<i class="fa-solid fa-route"></i>';
      } else if (catKey === 'travel') {
        items = formData.claimDetails.travelItems;
        catName = 'Travelling Receipt Items';
        iconHtml = '<i class="fa-solid fa-ticket-simple"></i>';
      } else if (catKey === 'expense') {
        items = formData.claimDetails.generalExpenseItems;
        catName = 'Other Expenses Items';
        iconHtml = '<i class="fa-solid fa-receipt"></i>';
      }

      if (iconBox) iconBox.innerHTML = iconHtml;
      if (titleText) titleText.innerText = catName;
      if (countText) countText.innerText = `${items.length} item(s) recorded`;

      if (items.length === 0) {
        container.innerHTML = `
          <div style="background: var(--bg-card); border: 1.5px dashed var(--border-subtle); border-radius: 22px; padding: 36px 20px; text-align: center; margin-bottom: 16px;">
            <div style="width: 58px; height: 58px; border-radius: 50%; background: rgba(124, 58, 237, 0.1); color: var(--purple-primary); display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 12px;">
              <i class="fa-solid fa-folder-open"></i>
            </div>
            <div style="font-size: 14.5px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">No items added yet</div>
            <div style="font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 18px;">Click below to add a new line item receipt for ${catName}</div>
            <button type="button" class="btn-add-purple" onclick="openEntryForm()">
              <i class="fa-solid fa-plus"></i>
              <span>Add ${catName.replace(' Items', '')}</span>
            </button>
          </div>
        `;
        return;
      }

      let html = '';
      items.forEach((item, idx) => {
        if (catKey === 'mileage') {
          html += `
            <div class="form-card" style="margin-bottom: 10px;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">${item.orig} → ${item.dest}</div>
                  <div style="font-size: 11.5px; font-weight: 600; color: var(--text-muted); margin-top: 2px;">
                    ${item.distanceKm} KM (${item.vehicle || 'Car'}) • ${item.way || 'Return'}
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="font-size: 15px; font-weight: 800; color: var(--purple-primary);">RM ${item.amount.toFixed(2)}</div>
                  <i class="fa-solid fa-trash-can" style="color: #ef4444; cursor: pointer; font-size: 15px;" onclick="deleteSubItem(${idx})"></i>
                </div>
              </div>
              ${item.desc ? `<div style="font-size: 11px; color: var(--text-muted); font-style: italic; margin-top: 6px;">"${item.desc}"</div>` : ''}
            </div>
          `;
        } else if (catKey === 'travel') {
          html += `
            <div class="form-card" style="margin-bottom: 10px;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">${item.orig} → ${item.dest} (${item.transport || 'Transit'})</div>
                  <div style="font-size: 11.5px; font-weight: 600; color: var(--text-muted); margin-top: 2px;">
                    Task: ${item.task || 'General Travel'} • Players: ${item.noOfPlayers || 1}
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="font-size: 15px; font-weight: 800; color: #3b82f6;">RM ${item.amount.toFixed(2)}</div>
                  <i class="fa-solid fa-trash-can" style="color: #ef4444; cursor: pointer; font-size: 15px;" onclick="deleteSubItem(${idx})"></i>
                </div>
              </div>
              ${item.desc ? `<div style="font-size: 11px; color: var(--text-muted); font-style: italic; margin-top: 6px;">"${item.desc}"</div>` : ''}
            </div>
          `;
        } else if (catKey === 'expense') {
          html += `
            <div class="form-card" style="margin-bottom: 10px;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">${item.type} ${item.receiptNo ? `(#${item.receiptNo})` : ''}</div>
                  <div style="font-size: 11.5px; font-weight: 600; color: var(--text-muted); margin-top: 2px;">
                    ${item.companyName || 'General Merchant'} ${item.project ? `• ${item.project}` : ''}
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="font-size: 15px; font-weight: 800; color: #10b981;">RM ${item.amount.toFixed(2)}</div>
                  <i class="fa-solid fa-trash-can" style="color: #ef4444; cursor: pointer; font-size: 15px;" onclick="deleteSubItem(${idx})"></i>
                </div>
              </div>
              ${item.desc ? `<div style="font-size: 11px; color: var(--text-muted); font-style: italic; margin-top: 6px;">"${item.desc}"</div>` : ''}
            </div>
          `;
        }
      });

      container.innerHTML = html;
    }

    function deleteSubItem(idx) {
      const catKey = formData.activeCategory;
      if (catKey === 'mileage') {
        formData.claimDetails.mileageItems.splice(idx, 1);
      } else if (catKey === 'travel') {
        formData.claimDetails.travelItems.splice(idx, 1);
      } else if (catKey === 'expense') {
        formData.claimDetails.generalExpenseItems.splice(idx, 1);
      }

      recalcAllTotals();
      renderView3List();

      if (typeof showToast === 'function') {
        showToast('🗑️ Line item removed successfully!');
      }
    }

    // =========================================================
    // LEVEL 4 ENTRY FORM BUILDER & LOGIC
    // =========================================================
    function openEntryForm() {
      const catKey = formData.activeCategory;
      const container = document.getElementById('v4SubFormContainer');

      if (catKey === 'mileage') {
        container.innerHTML = `
          <div class="form-card">
            <div class="section-header-bar no-top-border">
              <span class="section-title-accent"></span>
              <span class="section-title-text">MILEAGE ENTRY DETAILS</span>
            </div>

            <div class="field-group">
              <label class="field-label">Origin Location : <span class="req">*</span></label>
              <div class="select-wrapper">
                <select id="mOriginSelect" class="form-ctrl">
                  <option value="Kuala Lumpur HQ" selected>Kuala Lumpur HQ</option>
                  <option value="Petaling Jaya Office">Petaling Jaya Office</option>
                  <option value="Shah Alam Warehouse">Shah Alam Warehouse</option>
                </select>
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Destination Location : <span class="req">*</span></label>
              <div class="select-wrapper">
                <select id="mDestSelect" class="form-ctrl">
                  <option value="Penang Branch" selected>Penang Branch</option>
                  <option value="Johor Bahru Site">Johor Bahru Site</option>
                  <option value="Cyberjaya Tech Park">Cyberjaya Tech Park</option>
                </select>
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Departure :</label>
              <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 10px;">
                <input type="text" class="form-ctrl" value="23/09/2026" />
                <input type="text" class="form-ctrl" value="13:07" />
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Arrival :</label>
              <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 10px;">
                <input type="text" class="form-ctrl" value="23/09/2026" />
                <input type="text" class="form-ctrl" value="15:07" />
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Way :</label>
              <div class="select-wrapper">
                <select id="mWaySelect" class="form-ctrl">
                  <option value="Return" selected>Return</option>
                  <option value="One Way">One Way</option>
                </select>
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Vehicle :</label>
              <div class="select-wrapper">
                <select id="mVehicleSelect" class="form-ctrl">
                  <option value="Personal Car (VAA 1234)" selected>Personal Car (VAA 1234)</option>
                  <option value="Company Car (WXX 8899)">Company Car (WXX 8899)</option>
                  <option value="Motorcycle (BQQ 7766)">Motorcycle (BQQ 7766)</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;" class="field-group">
              <div>
                <label class="field-label">Meter In :</label>
                <input type="number" id="mMeterIn" class="form-ctrl" value="1000" oninput="calcSubMileage()" />
              </div>
              <div>
                <label class="field-label">Meter Out :</label>
                <input type="number" id="mMeterOut" class="form-ctrl" value="1350" oninput="calcSubMileage()" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;" class="field-group">
              <div>
                <label class="field-label">Distance (KM):</label>
                <input type="number" id="mDistanceKm" class="form-ctrl" value="350" oninput="calcSubMileageKm()" />
              </div>
              <div>
                <label class="field-label">Amount (RM):</label>
                <input type="number" id="mAmount" class="form-ctrl" value="280.00" step="0.01" />
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Description :</label>
              <input type="text" id="mDesc" class="form-ctrl" placeholder="e.g. Site visit trip" />
            </div>

            <!-- Attachments -->
            <div style="margin-top: 14px;">
              <label class="field-label" style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px; display: block;">Upload Item Attachments</label>
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
      } else if (catKey === 'travel') {
        container.innerHTML = `
          <div class="form-card">
            <div class="section-header-bar no-top-border">
              <span class="section-title-accent"></span>
              <span class="section-title-text">TRAVELLING RECEIPT DETAILS</span>
            </div>

            <div class="field-group">
              <label class="field-label">Origin Location :</label>
              <div class="select-wrapper">
                <select id="tOriginSelect" class="form-ctrl">
                  <option value="Kuala Lumpur" selected>Kuala Lumpur</option>
                  <option value="Petaling Jaya">Petaling Jaya</option>
                </select>
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Destination Location :</label>
              <div class="select-wrapper">
                <select id="tDestSelect" class="form-ctrl">
                  <option value="Penang" selected>Penang</option>
                  <option value="Johor Bahru">Johor Bahru</option>
                </select>
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Transport Type :</label>
              <div class="select-wrapper">
                <select id="tTransportSelect" class="form-ctrl">
                  <option value="Flight" selected>Flight</option>
                  <option value="Express Train">Express Train</option>
                  <option value="Grab / Taxi">Grab / Taxi</option>
                </select>
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Task :</label>
              <div class="select-wrapper">
                <select id="tTaskSelect" class="form-ctrl">
                  <option value="Client Implementation" selected>Client Implementation</option>
                  <option value="Site Survey">Site Survey</option>
                </select>
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Amount (RM): <span class="req">*</span></label>
              <input type="number" id="tAmount" class="form-ctrl" value="180.00" step="0.01" />
            </div>

            <div class="field-group">
              <label class="field-label">Description :</label>
              <input type="text" id="tDesc" class="form-ctrl" placeholder="e.g. Flight ticket receipt" />
            </div>
          </div>
        `;
      } else if (catKey === 'expense') {
        container.innerHTML = `
          <div class="form-card">
            <div class="section-header-bar no-top-border">
              <span class="section-title-accent"></span>
              <span class="section-title-text">OTHER EXPENSE DETAILS</span>
            </div>

            <div class="field-group">
              <label class="field-label">Receipt No. :</label>
              <input type="text" id="eReceiptNo" class="form-ctrl" value="REC-8899" placeholder="Enter receipt number" />
            </div>

            <div class="field-group">
              <label class="field-label">Expense Category : <span class="req">*</span></label>
              <div class="select-wrapper">
                <select id="eTypeSelect" class="form-ctrl">
                  <option value="Hotel Accommodation" selected>Hotel Accommodation</option>
                  <option value="Flight Ticket">Flight Ticket</option>
                  <option value="Tolls & Parking">Tolls &amp; Parking</option>
                  <option value="Client Dining">Client Dining</option>
                </select>
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Merchant / Company Name :</label>
              <input type="text" id="eCompanyName" class="form-ctrl" value="Hilton KL" placeholder="Merchant name" />
            </div>

            <div class="field-group">
              <label class="field-label">Amount (RM): <span class="req">*</span></label>
              <input type="number" id="eAmount" class="form-ctrl" value="220.00" step="0.01" />
            </div>

            <div class="field-group">
              <label class="field-label">Description :</label>
              <input type="text" id="eDesc" class="form-ctrl" placeholder="e.g. 1 night hotel stay" />
            </div>
          </div>
        `;
      }

      switchView('view-4-entry', `Add ${getCategoryTitle(catKey).replace(' Items', '')}`);
    }

    function calcSubMileage() {
      const mIn = parseFloat(document.getElementById('mMeterIn').value) || 0;
      const mOut = parseFloat(document.getElementById('mMeterOut').value) || 0;
      const dist = Math.max(0, mOut - mIn);
      document.getElementById('mDistanceKm').value = dist;
      document.getElementById('mAmount').value = (dist * 0.80).toFixed(2);
    }

    function calcSubMileageKm() {
      const dist = parseFloat(document.getElementById('mDistanceKm').value) || 0;
      document.getElementById('mAmount').value = (dist * 0.80).toFixed(2);
    }

    function saveSubItem() {
      const catKey = formData.activeCategory;

      if (catKey === 'mileage') {
        const orig = document.getElementById('mOriginSelect').value;
        const dest = document.getElementById('mDestSelect').value;
        const dist = parseFloat(document.getElementById('mDistanceKm').value) || 0;
        const amt = parseFloat(document.getElementById('mAmount').value) || 0;
        const vehicle = document.getElementById('mVehicleSelect').value;
        const way = document.getElementById('mWaySelect').value;
        const desc = document.getElementById('mDesc').value;

        formData.claimDetails.mileageItems.push({
          orig, dest, distanceKm: dist, amount: amt, vehicle, way, desc
        });
      } else if (catKey === 'travel') {
        const orig = document.getElementById('tOriginSelect').value;
        const dest = document.getElementById('tDestSelect').value;
        const transport = document.getElementById('tTransportSelect').value;
        const task = document.getElementById('tTaskSelect').value;
        const amt = parseFloat(document.getElementById('tAmount').value) || 0;
        const desc = document.getElementById('tDesc').value;

        formData.claimDetails.travelItems.push({
          orig, dest, transport, task, amount: amt, desc
        });
      } else if (catKey === 'expense') {
        const receiptNo = document.getElementById('eReceiptNo').value;
        const type = document.getElementById('eTypeSelect').value;
        const companyName = document.getElementById('eCompanyName').value;
        const amt = parseFloat(document.getElementById('eAmount').value) || 0;
        const desc = document.getElementById('eDesc').value;

        formData.claimDetails.generalExpenseItems.push({
          receiptNo, type, companyName, amount: amt, desc
        });
      }

      recalcAllTotals();
      openCategoryItems(catKey);

      if (typeof showToast === 'function') {
        showToast('✅ Line item saved successfully!');
      }
    }

    // =========================================================
    // AUTO ROLLUP & TOTAL CALCULATIONS
    // =========================================================
    function recalcAllTotals() {
      const mTotal = formData.claimDetails.mileageItems.reduce((sum, i) => sum + i.amount, 0);
      const tTotal = formData.claimDetails.travelItems.reduce((sum, i) => sum + i.amount, 0);
      const eTotal = formData.claimDetails.generalExpenseItems.reduce((sum, i) => sum + i.amount, 0);
      const grandTotal = mTotal + tTotal + eTotal;
      const totalCount = formData.claimDetails.mileageItems.length + formData.claimDetails.travelItems.length + formData.claimDetails.generalExpenseItems.length;

      formData.totalAmount = grandTotal;

      // Update Level 1 Display
      const v1TotalEl = document.getElementById('v1TotalClaimDisplay');
      const v1SubEl = document.getElementById('v1ItemsCountSubtitle');
      if (v1TotalEl) v1TotalEl.innerText = `RM ${grandTotal.toFixed(2)}`;
      if (v1SubEl) v1SubEl.innerText = `${totalCount} claim item(s) added`;

      // Update Level 2 Category Cards
      const catMEl = document.getElementById('catMileageAmount');
      const catMSub = document.getElementById('catMileageSubtitle');
      if (catMEl) catMEl.innerText = `RM ${mTotal.toFixed(2)}`;
      if (catMSub) catMSub.innerText = `${formData.claimDetails.mileageItems.length} items added (RM 0.80/KM)`;

      const catTEl = document.getElementById('catTravelAmount');
      const catTSub = document.getElementById('catTravelSubtitle');
      if (catTEl) catTEl.innerText = `RM ${tTotal.toFixed(2)}`;
      if (catTSub) catTSub.innerText = `${formData.claimDetails.travelItems.length} items added (Flights, Trains, Grab)`;

      const catEEl = document.getElementById('catExpenseAmount');
      const catESub = document.getElementById('catExpenseSubtitle');
      if (catEEl) catEEl.innerText = `RM ${eTotal.toFixed(2)}`;
      if (catESub) catESub.innerText = `${formData.claimDetails.generalExpenseItems.length} items added (Hotel, Tolls, Meals)`;
    }

    // =========================================================
    // ATTACHMENTS & UTILS
    // =========================================================
    function triggerFileUpload(target) {
      formData.uploadTarget = target;
      const input = document.getElementById('hiddenTravelFileInput');
      if (input) input.click();
    }

    function handleFileSelected(input) {
      if (!input.files || !input.files[0]) return;
      const file = input.files[0];
      const containerId = `${formData.uploadTarget}ChipsList`;
      const container = document.getElementById(containerId);
      if (container) {
        const chip = document.createElement('div');
        chip.className = 'file-chip';
        chip.innerHTML = `<i class="fa-solid fa-paperclip"></i> ${file.name} <i class="fa-solid fa-xmark" style="cursor:pointer; margin-left:4px;" onclick="this.parentElement.remove()"></i>`;
        container.appendChild(chip);
      }
    }

    function saveDraft() {
      if (typeof showToast === 'function') {
        showToast('💾 Travel Mileage draft saved successfully!');
      } else {
        alert('Travel Mileage draft saved successfully!');
      }
    }

    function submitTravelClaim() {
      if (typeof showToast === 'function') {
        showToast('🚀 Travel Mileage submitted successfully!');
      } else {
        alert('Travel Mileage submitted successfully!');
      }
      window.location.href = '../index.html';
    }

    // Initialize on page load
    window.addEventListener('DOMContentLoaded', () => {
      recalcAllTotals();
    });
  </script>
</body>
</html>
"""

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_html)

print("Hierarchical Drill-down Travel Mileage form updated successfully!")
