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

    /* STEPPER HEADER (① General —— ② Mileage —— ③ Travel —— ④ Expense) */
    .stepper-container {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      position: relative;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 20px;
      padding: 14px 18px;
      margin-bottom: 18px;
      box-shadow: var(--shadow-sm);
    }

    .stepper-line-bg {
      position: absolute;
      top: 27px;
      left: 48px;
      right: 48px;
      height: 2px;
      background: var(--border-subtle);
      z-index: 1;
    }

    .stepper-line-active {
      position: absolute;
      top: 27px;
      left: 48px;
      width: 0%;
      max-width: calc(100% - 96px);
      height: 2px;
      background: var(--purple-primary);
      z-index: 2;
      transition: width 0.3s ease;
    }

    .step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      position: relative;
      z-index: 5;
      cursor: pointer;
      min-width: 44px;
    }

    .step-circle {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #1e1b4b;
      border: 1.5px solid var(--border-subtle);
      color: var(--text-muted);
      font-size: 12px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 6;
      transition: all 0.25s ease;
    }

    .step-item.active .step-circle {
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      border-color: #7c3aed;
      color: #ffffff;
      box-shadow: 0 0 12px rgba(124, 58, 237, 0.45);
    }

    .step-item.completed .step-circle {
      background: #064e3b;
      border-color: #10b981;
      color: #10b981;
    }

    .step-title {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      transition: color 0.25s ease;
      text-align: center;
    }

    .step-item.active .step-title {
      color: var(--text-primary);
      font-weight: 800;
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

    /* Elegant Section Header Bar */
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

    .req {
      color: #ef4444;
    }

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
      color: var(--text-muted);
      pointer-events: none;
      font-size: 12px;
    }

    .btn-step-back {
      padding: 10px 20px;
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
      padding: 10px 24px;
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
      padding: 10px 22px;
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
      padding: 10px 24px;
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
      padding: 10px 24px;
      border-radius: 20px;
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      border: none;
      color: #ffffff;
      font-size: 13.5px;
      font-weight: 800;
      cursor: pointer;
      white-space: nowrap;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
      display: inline-flex;
      align-items: center;
      gap: 8px;
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
          <a href="../index.html" class="me-back-btn" aria-label="Back" title="Back"
            style="background: rgba(255, 255, 255, 0.18); border: 1px solid rgba(255, 255, 255, 0.25); width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #ffffff; text-decoration: none;">
            <i class="fa-solid fa-chevron-left" style="font-size: 16px;"></i>
          </a>
          <h1 id="headerTitleText" style="font-size: 18px; font-weight: 800; color: #ffffff; margin: 0;">Travel Mileage</h1>
        </div>
      </div>
    </div>

    <!-- Main Content Container -->
    <div class="main-content">
      
      <!-- STEPPER HEADER (① General —— ② Mileage —— ③ Travel —— ④ Expense) -->
      <div class="stepper-container">
        <div class="stepper-line-bg"></div>
        <div class="stepper-line-active" id="stepperLineActive"></div>
        
        <div class="step-item active" id="stepHeader-1" onclick="switchTravelStep(1)">
          <div class="step-circle">1</div>
          <span class="step-title">General</span>
        </div>
        
        <div class="step-item" id="stepHeader-2" onclick="switchTravelStep(2)">
          <div class="step-circle">2</div>
          <span class="step-title">Mileage</span>
        </div>
        
        <div class="step-item" id="stepHeader-3" onclick="switchTravelStep(3)">
          <div class="step-circle">3</div>
          <span class="step-title">Travel</span>
        </div>
        
        <div class="step-item" id="stepHeader-4" onclick="switchTravelStep(4)">
          <div class="step-circle">4</div>
          <span class="step-title">Expense</span>
        </div>
      </div>

      <!-- ========================================================= -->
      <!-- STEP 1: GENERAL -->
      <!-- ========================================================= -->
      <div id="stepContent-1" style="display: block;">

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

        <div class="form-card">
          
          <!-- Claim Period : -->
          <div class="field-group">
            <label class="field-label">Claim Period :</label>
            <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 10px;">
              <div class="select-wrapper">
                <select class="form-ctrl">
                  <option value="2026" selected>2026</option>
                  <option value="2025">2025</option>
                </select>
              </div>
              <div class="select-wrapper">
                <select class="form-ctrl">
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
              <select class="form-ctrl">
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
              <select class="form-ctrl">
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
              <input type="text" class="form-ctrl" value="23/09/2026" />
              <input type="text" class="form-ctrl" value="23/09/2026" />
            </div>
          </div>

          <!-- Cost Centre : -->
          <div class="field-group">
            <label class="field-label">Cost Centre :</label>
            <div class="select-wrapper">
              <select class="form-ctrl">
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
              <select class="form-ctrl">
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
            <input type="text" id="travelPurposeInput" class="form-ctrl" placeholder="" />
          </div>

          <!-- Project : -->
          <div class="field-group">
            <label class="field-label">Project :</label>
            <div class="select-wrapper">
              <select class="form-ctrl">
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
              <select class="form-ctrl">
                <option value="RINGGIT MALAYSIA" selected>RINGGIT MALAYSIA</option>
                <option value="US DOLLAR">US DOLLAR</option>
                <option value="SINGAPORE DOLLAR">SINGAPORE DOLLAR</option>
              </select>
            </div>
          </div>

          <!-- Claim Total : -->
          <div class="field-group">
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 0;">
              <span class="field-label" style="margin-bottom: 0;">Claim Total :</span>
              <span id="travelClaimTotalDisplay" style="font-size: 14.5px; font-weight: 700; color: var(--text-primary);">0.00</span>
            </div>
          </div>

          <!-- Remark : -->
          <div class="field-group">
            <label class="field-label">Remark :</label>
            <input type="text" id="travelRemarksInput" class="form-ctrl" value="" />
          </div>

          <!-- Upload Attachments -->
          <div style="margin-top: 14px;">
            <label class="field-label" style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px; display: block;">Upload Attachments</label>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 36px; padding: 12px 0 6px;">
              <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;" onclick="triggerFileUpload('step1')">
                <div style="width: 58px; height: 58px; border-radius: 50%; background: rgba(124, 58, 237, 0.12); border: 1px solid rgba(124, 58, 237, 0.3); display: flex; align-items: center; justify-content: center; color: var(--purple-primary); font-size: 20px;">
                  <i class="fa-solid fa-file-arrow-up"></i>
                </div>
                <span style="font-size: 13px; font-weight: 700; color: var(--purple-primary);">Select File(s)</span>
              </div>

              <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;" onclick="triggerFileUpload('step1')">
                <div style="width: 58px; height: 58px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 20px; box-shadow: 0 6px 18px rgba(124, 58, 237, 0.45);">
                  <i class="fa-solid fa-camera"></i>
                </div>
                <span style="font-size: 13px; font-weight: 800; color: var(--text-primary);">Take a Picture</span>
              </div>
            </div>

            <div id="step1ChipsList" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; justify-content: center;"></div>
          </div>

        </div>

        <!-- Bottom Navigation Row -->
        <div style="display: flex; justify-content: flex-end; align-items: center; gap: 10px; margin-top: 18px;">
          <button type="button" class="btn-draft-bright" onclick="saveDraft()">
            <i class="fa-solid fa-floppy-disk"></i>
            <span>Draft</span>
          </button>
          <button type="button" class="btn-step-next" onclick="switchTravelStep(2)">
            <span>Next: Mileage</span>
            <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>

      </div>

      <!-- ========================================================= -->
      <!-- STEP 2: MILEAGE -->
      <!-- ========================================================= -->
      <div id="stepContent-2" style="display: none;">
        
        <div class="form-card">
          
          <!-- Mileage Details Header Bar -->
          <div class="section-header-bar no-top-border">
            <span class="section-title-accent"></span>
            <span class="section-title-text">MILEAGE DETAILS</span>
          </div>

          <!-- Origin : -->
          <div class="field-group">
            <label class="field-label">Origin :</label>
            <div class="select-wrapper">
              <select id="mileageOriginSelect" class="form-ctrl">
                <option value="" selected>- Select Location -</option>
                <option value="Kuala Lumpur HQ">Kuala Lumpur HQ</option>
                <option value="Petaling Jaya Office">Petaling Jaya Office</option>
                <option value="Shah Alam Warehouse">Shah Alam Warehouse</option>
              </select>
            </div>
          </div>

          <!-- Destination : -->
          <div class="field-group">
            <label class="field-label">Destination :</label>
            <div class="select-wrapper">
              <select id="mileageDestSelect" class="form-ctrl">
                <option value="" selected>- Select Location -</option>
                <option value="Penang Branch">Penang Branch</option>
                <option value="Johor Bahru Site">Johor Bahru Site</option>
                <option value="Cyberjaya Tech Park">Cyberjaya Tech Park</option>
              </select>
            </div>
          </div>

          <!-- Departure : -->
          <div class="field-group">
            <label class="field-label">Departure :</label>
            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 10px;">
              <input type="text" class="form-ctrl" value="23/09/2026" />
              <input type="text" class="form-ctrl" value="13:07" />
            </div>
          </div>

          <!-- Arrival : -->
          <div class="field-group">
            <label class="field-label">Arrival :</label>
            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 10px;">
              <input type="text" class="form-ctrl" value="23/09/2026" />
              <input type="text" class="form-ctrl" value="15:07" />
            </div>
          </div>

          <!-- Way : -->
          <div class="field-group">
            <label class="field-label">Way :</label>
            <div class="select-wrapper">
              <select class="form-ctrl">
                <option value="Return" selected>Return</option>
                <option value="One Way">One Way</option>
              </select>
            </div>
          </div>

          <!-- Project : -->
          <div class="field-group">
            <label class="field-label">Project :</label>
            <div class="select-wrapper">
              <select class="form-ctrl">
                <option value="" selected>- Select Project -</option>
                <option value="HQ Digitalization">HQ Digitalization</option>
                <option value="Mobile HCM App">Mobile HCM App</option>
              </select>
            </div>
          </div>

          <!-- Vehicle : -->
          <div class="field-group">
            <label class="field-label">Vehicle :</label>
            <div class="select-wrapper">
              <select class="form-ctrl">
                <option value="" selected>- Select Vehicle -</option>
                <option value="Company Car (WXX 8899)">Company Car (WXX 8899)</option>
                <option value="Personal Car (VAA 1234)">Personal Car (VAA 1234)</option>
                <option value="Motorcycle (BQQ 7766)">Motorcycle (BQQ 7766)</option>
              </select>
            </div>
          </div>

          <!-- Meter In : & Meter Out : -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;" class="field-group">
            <div>
              <label class="field-label">Meter In :</label>
              <input type="number" id="meterInInput" class="form-ctrl" value="0" oninput="calcDistanceMileage()" />
            </div>
            <div>
              <label class="field-label">Meter Out :</label>
              <input type="number" id="meterOutInput" class="form-ctrl" value="0" oninput="calcDistanceMileage()" />
            </div>
          </div>

          <!-- Distance(KM): & Amount : -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;" class="field-group">
            <div>
              <label class="field-label">Distance(KM):</label>
              <input type="number" id="distanceKmInput" class="form-ctrl" value="0" oninput="calcAmountFromKm()" />
            </div>
            <div>
              <label class="field-label">Amount :</label>
              <input type="number" id="mileageAmountInput" class="form-ctrl" value="0" step="0.01" />
            </div>
          </div>

          <!-- Description : -->
          <div class="field-group">
            <label class="field-label">Description :</label>
            <input type="text" id="mileageDescInput" class="form-ctrl" value="" placeholder="" />
          </div>

          <!-- Upload Attachments -->
          <div style="margin-top: 14px;">
            <label class="field-label" style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px; display: block;">Upload Attachments</label>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 36px; padding: 12px 0 6px;">
              <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;" onclick="triggerFileUpload('step2')">
                <div style="width: 58px; height: 58px; border-radius: 50%; background: rgba(124, 58, 237, 0.12); border: 1px solid rgba(124, 58, 237, 0.3); display: flex; align-items: center; justify-content: center; color: var(--purple-primary); font-size: 20px;">
                  <i class="fa-solid fa-file-arrow-up"></i>
                </div>
                <span style="font-size: 13px; font-weight: 700; color: var(--purple-primary);">Select File(s)</span>
              </div>

              <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;" onclick="triggerFileUpload('step2')">
                <div style="width: 58px; height: 58px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 20px; box-shadow: 0 6px 18px rgba(124, 58, 237, 0.45);">
                  <i class="fa-solid fa-camera"></i>
                </div>
                <span style="font-size: 13px; font-weight: 800; color: var(--text-primary);">Take a Picture</span>
              </div>
            </div>

            <div id="step2ChipsList" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; justify-content: center;"></div>
          </div>

          <!-- Add Button -->
          <div style="margin-top: 14px; margin-bottom: 16px;">
            <button type="button" class="btn-add-purple" onclick="addMileageItem()">
              <span>Add</span>
            </button>
          </div>

          <!-- Added Line Items Table / Summary List -->
          <div>
            <div style="font-size: 12.5px; font-weight: 700; color: var(--text-muted); margin-bottom: 8px;">Added Line Items:</div>
            <div id="mileageItemsListContainer">
              <div style="font-size: 12px; color: var(--text-muted); font-style: italic; padding: 6px 0;">No mileage line items added yet. Click "Add" above.</div>
            </div>
          </div>

        </div>

        <!-- Bottom Navigation Row -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 18px;">
          <button type="button" class="btn-step-back" onclick="switchTravelStep(1)">
            <i class="fa-solid fa-arrow-left"></i>
            <span>Back</span>
          </button>
          <div style="display: flex; gap: 10px;">
            <button type="button" class="btn-draft-bright" onclick="saveDraft()">
              <i class="fa-solid fa-floppy-disk"></i>
              <span>Draft</span>
            </button>
            <button type="button" class="btn-step-next" onclick="switchTravelStep(3)">
              <span>Next: Travel</span>
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>

      </div>

      <!-- ========================================================= -->
      <!-- STEP 3: TRAVEL -->
      <!-- ========================================================= -->
      <div id="stepContent-3" style="display: none;">
        
        <div class="form-card">
          
          <!-- Travel Details Header Bar -->
          <div class="section-header-bar no-top-border">
            <span class="section-title-accent"></span>
            <span class="section-title-text">TRAVEL DETAILS</span>
          </div>

          <!-- Origin : -->
          <div class="field-group">
            <label class="field-label">Origin :</label>
            <div class="select-wrapper">
              <select class="form-ctrl">
                <option value="" selected>- Select Location -</option>
                <option value="Kuala Lumpur">Kuala Lumpur</option>
                <option value="Petaling Jaya">Petaling Jaya</option>
                <option value="Singapore">Singapore</option>
              </select>
            </div>
          </div>

          <!-- Destination : -->
          <div class="field-group">
            <label class="field-label">Destination :</label>
            <div class="select-wrapper">
              <select class="form-ctrl">
                <option value="" selected>- Select Location -</option>
                <option value="Penang">Penang</option>
                <option value="Johor Bahru">Johor Bahru</option>
                <option value="Jakarta">Jakarta</option>
              </select>
            </div>
          </div>

          <!-- Departure : -->
          <div class="field-group">
            <label class="field-label">Departure :</label>
            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 10px;">
              <input type="text" class="form-ctrl" value="23/09/2026" />
              <input type="text" class="form-ctrl" value="13:07" />
            </div>
          </div>

          <!-- Arrival : -->
          <div class="field-group">
            <label class="field-label">Arrival :</label>
            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 10px;">
              <input type="text" class="form-ctrl" value="23/09/2026" />
              <input type="text" class="form-ctrl" value="15:07" />
            </div>
          </div>

          <!-- Transport : -->
          <div class="field-group">
            <label class="field-label">Transport :</label>
            <div class="select-wrapper">
              <select class="form-ctrl">
                <option value="" selected>- Select Transport -</option>
                <option value="Flight">Flight</option>
                <option value="Express Train">Express Train</option>
                <option value="Grab / Taxi">Grab / Taxi</option>
                <option value="Rental Car">Rental Car</option>
              </select>
            </div>
          </div>

          <!-- Way : -->
          <div class="field-group">
            <label class="field-label">Way :</label>
            <div class="select-wrapper">
              <select class="form-ctrl">
                <option value="Return" selected>Return</option>
                <option value="One Way">One Way</option>
              </select>
            </div>
          </div>

          <!-- No Of Player : -->
          <div class="field-group">
            <label class="field-label">No Of Player :</label>
            <input type="number" class="form-ctrl" value="1" min="1" />
          </div>

          <!-- Project : -->
          <div class="field-group">
            <label class="field-label">Project :</label>
            <div class="select-wrapper">
              <select class="form-ctrl">
                <option value="" selected>- Select Project -</option>
                <option value="HQ Digitalization">HQ Digitalization</option>
                <option value="Mobile HCM App">Mobile HCM App</option>
              </select>
            </div>
          </div>

          <!-- Task : -->
          <div class="field-group">
            <label class="field-label">Task :</label>
            <div class="select-wrapper">
              <select class="form-ctrl">
                <option value="" selected>- Select Task -</option>
                <option value="Site Survey">Site Survey</option>
                <option value="Client Implementation">Client Implementation</option>
                <option value="Staff Training">Staff Training</option>
              </select>
            </div>
          </div>

          <!-- Description : -->
          <div class="field-group">
            <label class="field-label">Description :</label>
            <input type="text" id="travelDescInput" class="form-ctrl" value="" placeholder="" />
          </div>

          <!-- Remark : -->
          <div class="field-group">
            <label class="field-label">Remark :</label>
            <input type="text" id="travelReceiptInput" class="form-ctrl" value="" placeholder="" />
          </div>

          <!-- Amount : -->
          <div class="field-group">
            <label class="field-label">Amount :</label>
            <input type="number" id="travelAmountInput" class="form-ctrl" value="0" step="0.01" />
          </div>

          <!-- Upload Attachments -->
          <div style="margin-top: 14px;">
            <label class="field-label" style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px; display: block;">Upload Attachments</label>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 36px; padding: 12px 0 6px;">
              <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;" onclick="triggerFileUpload('step3')">
                <div style="width: 58px; height: 58px; border-radius: 50%; background: rgba(124, 58, 237, 0.12); border: 1px solid rgba(124, 58, 237, 0.3); display: flex; align-items: center; justify-content: center; color: var(--purple-primary); font-size: 20px;">
                  <i class="fa-solid fa-file-arrow-up"></i>
                </div>
                <span style="font-size: 13px; font-weight: 700; color: var(--purple-primary);">Select File(s)</span>
              </div>

              <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;" onclick="triggerFileUpload('step3')">
                <div style="width: 58px; height: 58px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 20px; box-shadow: 0 6px 18px rgba(124, 58, 237, 0.45);">
                  <i class="fa-solid fa-camera"></i>
                </div>
                <span style="font-size: 13px; font-weight: 800; color: var(--text-primary);">Take a Picture</span>
              </div>
            </div>

            <div id="step3ChipsList" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; justify-content: center;"></div>
          </div>

          <!-- Add Button -->
          <div style="margin-top: 14px; margin-bottom: 16px;">
            <button type="button" class="btn-add-purple" onclick="addTravelItem()">
              <span>Add</span>
            </button>
          </div>

          <!-- Added Line Items Table / Summary List -->
          <div>
            <div style="font-size: 12.5px; font-weight: 700; color: var(--text-muted); margin-bottom: 8px;">Added Line Items:</div>
            <div id="travelItemsListContainer">
              <div style="font-size: 12px; color: var(--text-muted); font-style: italic; padding: 6px 0;">No travel line items added yet. Click "Add" above.</div>
            </div>
          </div>

        </div>

        <!-- Bottom Navigation Row -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 18px;">
          <button type="button" class="btn-step-back" onclick="switchTravelStep(2)">
            <i class="fa-solid fa-arrow-left"></i>
            <span>Back</span>
          </button>
          <div style="display: flex; gap: 10px;">
            <button type="button" class="btn-draft-bright" onclick="saveDraft()">
              <i class="fa-solid fa-floppy-disk"></i>
              <span>Draft</span>
            </button>
            <button type="button" class="btn-step-next" onclick="switchTravelStep(4)">
              <span>Next: Expense</span>
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>

      </div>

      <!-- ========================================================= -->
      <!-- STEP 4: EXPENSE -->
      <!-- ========================================================= -->
      <div id="stepContent-4" style="display: none;">
        
        <div class="form-card">
          
          <!-- Expense Details Header Bar -->
          <div class="section-header-bar no-top-border">
            <span class="section-title-accent"></span>
            <span class="section-title-text">EXPENSE DETAILS</span>
          </div>

          <!-- Receipt No. : -->
          <div class="field-group">
            <label class="field-label">Receipt No. :</label>
            <input type="text" id="expReceiptNoInput" class="form-ctrl" value="" placeholder="" />
          </div>

          <!-- Expenses : -->
          <div class="field-group">
            <label class="field-label">Expenses :</label>
            <div class="select-wrapper">
              <select id="expTypeSelect" class="form-ctrl">
                <option value="" selected>Select Expense</option>
                <option value="Hotel Accommodation">Hotel Accommodation</option>
                <option value="Flight Ticket">Flight Ticket</option>
                <option value="Tolls & Parking">Tolls &amp; Parking</option>
                <option value="Client Dining">Client Dining</option>
              </select>
            </div>
          </div>

          <!-- Expenses From Date : -->
          <div class="field-group">
            <label class="field-label">Expenses From Date :</label>
            <input type="date" id="expFromDateInput" class="form-ctrl" value="2026-09-23" />
          </div>

          <!-- Expenses From Time : -->
          <div class="field-group">
            <label class="field-label">Expenses From Time :</label>
            <input type="time" id="expFromTimeInput" class="form-ctrl" value="09:00" />
          </div>

          <!-- Expenses To Date : -->
          <div class="field-group">
            <label class="field-label">Expenses To Date :</label>
            <input type="date" id="expToDateInput" class="form-ctrl" value="2026-09-23" />
          </div>

          <!-- Expenses To Time : -->
          <div class="field-group">
            <label class="field-label">Expenses To Time :</label>
            <input type="time" id="expToTimeInput" class="form-ctrl" value="18:00" />
          </div>

          <!-- Project : -->
          <div class="field-group">
            <label class="field-label">Project :</label>
            <div class="select-wrapper">
              <select id="expProjectSelect" class="form-ctrl">
                <option value="" selected>Select Project</option>
                <option value="Project Alpha (HQ Migration)">Project Alpha (HQ Migration)</option>
                <option value="Project Beta (Regional Expansion)">Project Beta (Regional Expansion)</option>
                <option value="PQ Mobile Enhancements">PQ Mobile Enhancements</option>
                <option value="Client Site Deployment">Client Site Deployment</option>
              </select>
            </div>
          </div>

          <!-- Company Name : -->
          <div class="field-group">
            <label class="field-label">Company Name :</label>
            <input type="text" id="expCompanyNameInput" class="form-ctrl" value="" placeholder="Enter Company Name" />
          </div>

          <!-- Business RN : -->
          <div class="field-group">
            <label class="field-label">Business RN :</label>
            <input type="text" id="expBusinessRNInput" class="form-ctrl" value="" placeholder="Enter Business Registration No." />
          </div>

          <!-- Description : -->
          <div class="field-group">
            <label class="field-label">Description :</label>
            <input type="text" id="expDescriptionInput" class="form-ctrl" value="" placeholder="Enter description" />
          </div>

          <!-- Amount : -->
          <div class="field-group">
            <label class="field-label">Amount :</label>
            <input type="number" id="expAmountInput" class="form-ctrl" value="0" step="0.01" oninput="calcExpLocalAmount()" />
          </div>

          <!-- Currency : -->
          <div class="field-group">
            <label class="field-label">Currency :</label>
            <div class="select-wrapper">
              <select id="expCurrencySelect" class="form-ctrl" onchange="calcExpLocalAmount()">
                <option value="RINGGIT MALAYSIA" selected>RINGGIT MALAYSIA</option>
                <option value="US DOLLAR">US DOLLAR</option>
                <option value="SINGAPORE DOLLAR">SINGAPORE DOLLAR</option>
              </select>
            </div>
          </div>

          <!-- Forex Rate : -->
          <div class="field-group">
            <label class="field-label">Forex Rate :</label>
            <input type="number" id="expForexRateInput" class="form-ctrl" value="1.000" step="0.001" oninput="calcExpLocalAmount()" />
          </div>

          <!-- Local Amount : -->
          <div class="field-group">
            <label class="field-label">Local Amount :</label>
            <input type="text" id="expLocalAmountInput" class="form-ctrl" value="" readonly />
          </div>

          <!-- Upload Attachments -->
          <div style="margin-top: 14px;">
            <label class="field-label" style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px; display: block;">Upload Attachments</label>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 36px; padding: 12px 0 6px;">
              <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;" onclick="triggerFileUpload('step4')">
                <div style="width: 58px; height: 58px; border-radius: 50%; background: rgba(124, 58, 237, 0.12); border: 1px solid rgba(124, 58, 237, 0.3); display: flex; align-items: center; justify-content: center; color: var(--purple-primary); font-size: 20px;">
                  <i class="fa-solid fa-file-arrow-up"></i>
                </div>
                <span style="font-size: 13px; font-weight: 700; color: var(--purple-primary);">Select File(s)</span>
              </div>

              <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;" onclick="triggerFileUpload('step4')">
                <div style="width: 58px; height: 58px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 20px; box-shadow: 0 6px 18px rgba(124, 58, 237, 0.45);">
                  <i class="fa-solid fa-camera"></i>
                </div>
                <span style="font-size: 13px; font-weight: 800; color: var(--text-primary);">Take a Picture</span>
              </div>
            </div>

            <div id="step4ChipsList" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; justify-content: center;"></div>
          </div>

          <!-- Add Button -->
          <div style="margin-top: 14px; margin-bottom: 16px;">
            <button type="button" class="btn-add-purple" onclick="addGeneralExpenseItem()">
              <span>Add</span>
            </button>
          </div>

          <!-- Added Line Items Table -->
          <div>
            <div style="font-size: 12.5px; font-weight: 700; color: var(--text-muted); margin-bottom: 8px;">Added Line Items:</div>
            <div id="generalExpenseItemsListContainer">
              <div style="font-size: 12px; color: var(--text-muted); font-style: italic; padding: 6px 0;">No expense line items added yet. Click "Add" above.</div>
            </div>
          </div>

        </div>

        <!-- Bottom Navigation Row with Save Draft and Submit -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 18px;">
          <button type="button" class="btn-step-back" onclick="switchTravelStep(3)">
            <i class="fa-solid fa-arrow-left"></i>
            <span>Back</span>
          </button>
          <div style="display: flex; gap: 10px;">
            <button type="button" class="btn-draft-bright" onclick="saveDraft()">
              <i class="fa-solid fa-floppy-disk"></i>
              <span>Draft</span>
            </button>
            <button type="button" class="btn-submit-primary" onclick="submitTravelClaim()">
              <span>Submit</span>
              <i class="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </div>

      </div>

    </div>

    <!-- Hidden File Input -->
    <input type="file" id="hiddenTravelFileInput" accept="image/*,.pdf" style="display: none;" onchange="handleFileSelected(this)">

    <phone-bottom-nav active="apps"></phone-bottom-nav>
  </div>

  <script>
    let currentStep = 1;
    let currentUploadTarget = 'step1';
    const mileageItems = [];
    const travelItems = [];
    const generalExpenseItems = [];

    function switchTravelStep(stepNum) {
      currentStep = stepNum;
      
      // Update Stepper Line Active Width (4 steps: 0%, 33.33%, 66.66%, 100%)
      const lineActive = document.getElementById('stepperLineActive');
      if (lineActive) {
        if (stepNum === 1) lineActive.style.width = '0%';
        else if (stepNum === 2) lineActive.style.width = '33.33%';
        else if (stepNum === 3) lineActive.style.width = '66.66%';
        else if (stepNum === 4) lineActive.style.width = '100%';
      }

      // Update Header Stepper Items
      for (let i = 1; i <= 4; i++) {
        const item = document.getElementById(`stepHeader-${i}`);
        const content = document.getElementById(`stepContent-${i}`);
        if (!item || !content) continue;

        if (i === stepNum) {
          item.className = 'step-item active';
          content.style.display = 'block';
        } else if (i < stepNum) {
          item.className = 'step-item completed';
          content.style.display = 'none';
        } else {
          item.className = 'step-item';
          content.style.display = 'none';
        }
      }
      
      const mainContent = document.querySelector('.main-content');
      if (mainContent) mainContent.scrollTop = 0;
      window.scrollTo(0, 0);
    }

    function calcDistanceMileage() {
      const mIn = parseFloat(document.getElementById('meterInInput').value) || 0;
      const mOut = parseFloat(document.getElementById('meterOutInput').value) || 0;
      const dist = Math.max(0, mOut - mIn);
      document.getElementById('distanceKmInput').value = dist;
      document.getElementById('mileageAmountInput').value = (dist * 0.80).toFixed(2);
      recalcTotalClaim();
    }

    function calcAmountFromKm() {
      const dist = parseFloat(document.getElementById('distanceKmInput').value) || 0;
      document.getElementById('mileageAmountInput').value = (dist * 0.80).toFixed(2);
      recalcTotalClaim();
    }

    function calcExpLocalAmount() {
      const amt = parseFloat(document.getElementById('expAmountInput').value) || 0;
      const rate = parseFloat(document.getElementById('expForexRateInput').value) || 1;
      const local = (amt * rate).toFixed(2);
      document.getElementById('expLocalAmountInput').value = local;
    }

    function triggerFileUpload(target) {
      currentUploadTarget = target;
      const input = document.getElementById('hiddenTravelFileInput');
      if (input) input.click();
    }

    function handleFileSelected(input) {
      if (!input.files || !input.files[0]) return;
      const file = input.files[0];
      const containerId = `${currentUploadTarget}ChipsList`;
      const container = document.getElementById(containerId);
      if (container) {
        const chip = document.createElement('div');
        chip.className = 'file-chip';
        chip.innerHTML = `<i class="fa-solid fa-paperclip"></i> ${file.name} <i class="fa-solid fa-xmark" style="cursor:pointer; margin-left:4px;" onclick="this.parentElement.remove()"></i>`;
        container.appendChild(chip);
      }
    }

    function addMileageItem() {
      const orig = document.getElementById('mileageOriginSelect').value || 'KL HQ';
      const dest = document.getElementById('mileageDestSelect').value || 'Penang';
      const amt = parseFloat(document.getElementById('mileageAmountInput').value) || 0;

      mileageItems.push({ orig, dest, amount: amt });
      renderMileageItems();
      recalcTotalClaim();

      if (typeof showToast === 'function') {
        showToast(`✅ Mileage item [${orig} → ${dest}] added!`);
      }
    }

    function renderMileageItems() {
      const container = document.getElementById('mileageItemsListContainer');
      if (mileageItems.length === 0) {
        container.innerHTML = `<div style="font-size: 12px; color: var(--text-muted); font-style: italic; padding: 6px 0;">No mileage line items added yet. Click "Add" above.</div>`;
        return;
      }

      let html = '';
      mileageItems.forEach((item, idx) => {
        html += `
          <div style="background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: 14px; padding: 10px 12px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">${item.orig} → ${item.dest}</div>
              <div style="font-size: 11px; font-weight: 600; color: var(--text-muted);">Mileage Claim</div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="font-size: 14px; font-weight: 800; color: var(--purple-primary);">RM ${item.amount.toFixed(2)}</div>
              <i class="fa-solid fa-trash-can" style="color: #ef4444; cursor: pointer; font-size: 14px;" onclick="mileageItems.splice(${idx},1); renderMileageItems(); recalcTotalClaim();"></i>
            </div>
          </div>
        `;
      });
      container.innerHTML = html;
    }

    function addTravelItem() {
      const desc = document.getElementById('travelDescInput').value || 'Travel Transit';
      const amt = parseFloat(document.getElementById('travelAmountInput').value) || 0;

      travelItems.push({ desc, amount: amt });
      renderTravelItems();
      recalcTotalClaim();

      if (typeof showToast === 'function') {
        showToast(`✅ Travel item [${desc}] added!`);
      }
    }

    function renderTravelItems() {
      const container = document.getElementById('travelItemsListContainer');
      if (travelItems.length === 0) {
        container.innerHTML = `<div style="font-size: 12px; color: var(--text-muted); font-style: italic; padding: 6px 0;">No travel line items added yet. Click "Add" above.</div>`;
        return;
      }

      let html = '';
      travelItems.forEach((item, idx) => {
        html += `
          <div style="background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: 14px; padding: 10px 12px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">${item.desc}</div>
              <div style="font-size: 11px; font-weight: 600; color: var(--text-muted);">Travel Receipt</div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="font-size: 14px; font-weight: 800; color: var(--purple-primary);">RM ${item.amount.toFixed(2)}</div>
              <i class="fa-solid fa-trash-can" style="color: #ef4444; cursor: pointer; font-size: 14px;" onclick="travelItems.splice(${idx},1); renderTravelItems(); recalcTotalClaim();"></i>
            </div>
          </div>
        `;
      });
      container.innerHTML = html;
    }

    function addGeneralExpenseItem() {
      const type = document.getElementById('expTypeSelect').value || 'General Expense';
      const receiptNo = document.getElementById('expReceiptNoInput').value || '';
      const fromDate = document.getElementById('expFromDateInput').value || '';
      const fromTime = document.getElementById('expFromTimeInput').value || '';
      const toDate = document.getElementById('expToDateInput').value || '';
      const toTime = document.getElementById('expToTimeInput').value || '';
      const project = document.getElementById('expProjectSelect').value || '';
      const companyName = document.getElementById('expCompanyNameInput').value || '';
      const businessRN = document.getElementById('expBusinessRNInput').value || '';
      const desc = document.getElementById('expDescriptionInput').value || '';
      const amt = parseFloat(document.getElementById('expLocalAmountInput').value) || 0;

      generalExpenseItems.push({
        type,
        receiptNo,
        fromDate,
        fromTime,
        toDate,
        toTime,
        project,
        companyName,
        businessRN,
        desc,
        amount: amt
      });

      renderGeneralExpenseItems();
      recalcTotalClaim();

      if (typeof showToast === 'function') {
        showToast(`✅ Expense item [${type}] added!`);
      }
    }

    function renderGeneralExpenseItems() {
      const container = document.getElementById('generalExpenseItemsListContainer');
      if (generalExpenseItems.length === 0) {
        container.innerHTML = `<div style="font-size: 12px; color: var(--text-muted); font-style: italic; padding: 6px 0;">No expense line items added yet. Click "Add" above.</div>`;
        return;
      }

      let html = '';
      generalExpenseItems.forEach((item, idx) => {
        const timeRange = (item.fromDate || item.toDate) ? `${item.fromDate} ${item.fromTime} → ${item.toDate} ${item.toTime}` : '';
        html += `
          <div style="background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: 14px; padding: 10px 12px; margin-bottom: 8px; display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">${item.type} ${item.receiptNo ? `(#${item.receiptNo})` : ''}</div>
                <div style="font-size: 11px; font-weight: 600; color: var(--text-muted);">${item.companyName ? item.companyName : 'Expense Item'} ${item.project ? `• ${item.project}` : ''}</div>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="font-size: 14px; font-weight: 800; color: var(--purple-primary);">RM ${item.amount.toFixed(2)}</div>
                <i class="fa-solid fa-trash-can" style="color: #ef4444; cursor: pointer; font-size: 14px;" onclick="generalExpenseItems.splice(${idx},1); renderGeneralExpenseItems(); recalcTotalClaim();"></i>
              </div>
            </div>
            ${timeRange ? `<div style="font-size: 10.5px; font-weight: 600; color: var(--text-muted);"><i class="fa-regular fa-clock"></i> ${timeRange}</div>` : ''}
            ${item.businessRN ? `<div style="font-size: 10.5px; font-weight: 600; color: var(--text-muted);">Business RN: ${item.businessRN}</div>` : ''}
            ${item.desc ? `<div style="font-size: 10.5px; color: var(--text-muted); font-style: italic;">"${item.desc}"</div>` : ''}
          </div>
        `;
      });
      container.innerHTML = html;
    }

    function recalcTotalClaim() {
      const mTotal = mileageItems.reduce((sum, item) => sum + item.amount, 0);
      const tTotal = travelItems.reduce((sum, item) => sum + item.amount, 0);
      const eTotal = generalExpenseItems.reduce((sum, item) => sum + item.amount, 0);
      const grandTotal = mTotal + tTotal + eTotal;
      const disp = document.getElementById('travelClaimTotalDisplay');
      if (disp) disp.innerText = grandTotal.toFixed(2);
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
  </script>
</body>
</html>
"""

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_html)

print("Updated travel-claim.html successfully!")
