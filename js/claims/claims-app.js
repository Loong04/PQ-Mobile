/**
 * PeopleHCM - Claims Application Engine (High Fidelity Screenshot Parity)
 * Matches Screenshots 1 & 2 for Benefit Claim category cards and exact 14-field Claim Form.
 */

(function () {
  let activeOptionId = 'benefit';
  let activeSubCategoryObj = null;
  let isAttachmentUploaded = false;
  let teamQueue = window.MOCK_TEAM_APPROVALS ? [...window.MOCK_TEAM_APPROVALS] : [];

  function showToast(msg) {
    const toast = document.getElementById('toastNotification');
    const toastText = document.getElementById('toastText');
    if (toast && toastText) {
      toastText.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2800);
    }
  }

  function initClaimsApp() {
    renderOptionSquareGrid();
    renderMySubmissions('all');
    renderManagerSquareGrid();
    renderTeamQueue();
    populateFormDropdowns();
  }

  /**
   * Render Recent Submissions & Audit Status List
   */
  function renderMySubmissions(filterType = 'all') {
    const container = document.getElementById('mySubmissionsListContainer');
    const badge = document.getElementById('mySubmissionsCountBadge');
    if (!container) return;

    let items = window.MOCK_MY_SUBMISSIONS || [];
    if (filterType !== 'all') {
      items = items.filter(i => i.status === filterType);
    }

    if (badge) badge.textContent = `${items.length} Records`;

    container.innerHTML = '';
    if (items.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 20px; background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border-subtle); font-size: 12px; color: var(--text-muted);">
          No claim submissions found for this filter.
        </div>
      `;
      return;
    }

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'submission-card';
      card.style.cssText = 'background: var(--bg-card); border-radius: 18px; padding: 14px; border: 1px solid var(--border-subtle); margin-bottom: 10px; transition: transform 0.15s ease; cursor: pointer; display: flex; align-items: center; gap: 12px;';

      const statusClass = item.status === 'pending' ? 'pending' : (item.status === 'approved' ? 'approved' : 'rejected');

      card.innerHTML = `
        <div style="width: 44px; height: 44px; border-radius: 14px; background: var(--bg-input); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">
          ${item.icon || '🧾'}
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
            <div style="font-size: 13.5px; font-weight: 800; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${item.category}</div>
            <span class="status-badge ${statusClass}">${item.statusText}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 11px; font-weight: 600; color: var(--text-muted); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
              ${item.merchant || item.optionName} • ${item.date}
            </div>
            <div style="font-size: 14.5px; font-weight: 900; color: var(--purple-primary); white-space: nowrap; margin-left: 8px;">
              RM ${item.amount.toFixed(2)}
            </div>
          </div>
        </div>
      `;

      container.appendChild(card);
    });
  }

  function filterMySubmissions(filterType, btnEl) {
    document.querySelectorAll('.audit-filter-pill').forEach(el => el.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    renderMySubmissions(filterType);
  }


  /**
   * Render 3 Columns x 2 Rows Max Option Cards Grid on Main Page (5 Items + View All)
   */
  function renderOptionSquareGrid() {
    const container = document.getElementById('claimOptionsHubGrid');
    const badge = document.getElementById('claimModulesCountBadge');
    if (!container) return;

    container.innerHTML = '';
    const options = window.CLAIM_OPTIONS || [];

    if (badge) {
      badge.textContent = `${options.length} Modules`;
    }

    const fileMap = {
      benefit: 'options/benefit-claim.html',
      medical: 'options/medical-claim.html',
      ot: 'options/ot-claim.html',
      travel: 'options/travel-claim.html',
      travel_request: 'options/travel-request.html',
      entertainment: 'options/entertainment-claim.html',
      advance: 'options/advance-claim.html',
      expenses: 'options/expenses-claim.html',
      history: 'options/history.html',
      summary: 'options/summary.html'
    };

    const MAX_VISIBLE = 5;
    const shouldShowViewAll = options.length > 6;
    const displayOptions = shouldShowViewAll ? options.slice(0, MAX_VISIBLE) : options;

    displayOptions.forEach(opt => {
      const card = document.createElement('a');
      card.className = 'claim-square-card';
      card.style.textDecoration = 'none';
      card.href = fileMap[opt.id] || `options/${opt.id}.html`;

      card.innerHTML = `
        <div class="claim-square-icon-wrap">
          ${opt.icon}
        </div>
        <div class="claim-square-title">${opt.name}</div>
      `;

      container.appendChild(card);
    });

    if (shouldShowViewAll) {
      const viewAllCard = document.createElement('div');
      viewAllCard.className = 'claim-square-card';
      viewAllCard.onclick = () => openAllClaimOptionsModal();

      viewAllCard.innerHTML = `
        <div class="claim-square-icon-wrap" style="background: rgba(168, 85, 247, 0.16); color: #c084fc;">
          <i class="fa-solid fa-ellipsis" style="font-size: 18px;"></i>
        </div>
        <div class="claim-square-title" style="color: var(--text-primary);">View All</div>
      `;

      container.appendChild(viewAllCard);
    }
  }

  function openAllClaimOptionsModal() {
    const modal = document.getElementById('allOptionsModalOverlay');
    const container = document.getElementById('allClaimOptionsModalGrid');
    const title = document.getElementById('allOptionsModalTitle');
    if (!modal || !container) return;

    const options = window.CLAIM_OPTIONS || [];
    if (title) title.textContent = `Quick Options (${options.length})`;

    const fileMap = {
      benefit: 'options/benefit-claim.html',
      medical: 'options/medical-claim.html',
      ot: 'options/ot-claim.html',
      travel: 'options/travel-claim.html',
      travel_request: 'options/travel-request.html',
      entertainment: 'options/entertainment-claim.html',
      advance: 'options/advance-claim.html',
      expenses: 'options/expenses-claim.html',
      history: 'options/history.html',
      summary: 'options/summary.html'
    };

    container.innerHTML = '';
    options.forEach(opt => {
      const card = document.createElement('a');
      card.className = 'claim-square-card';
      card.style.textDecoration = 'none';
      card.href = fileMap[opt.id] || `options/${opt.id}.html`;

      card.innerHTML = `
        <div class="claim-square-icon-wrap">
          ${opt.icon}
        </div>
        <div class="claim-square-title">${opt.name}</div>
      `;

      container.appendChild(card);
    });

    modal.classList.add('active');
  }

  function closeAllClaimOptionsModal() {
    const modal = document.getElementById('allOptionsModalOverlay');
    if (modal) modal.classList.remove('active');
  }

  /**
   * Render Manager Options Grid (Navigating to individual manager option files)
   */
  function renderManagerSquareGrid() {
    const container = document.getElementById('managerOptionsGrid');
    if (!container) return;

    container.innerHTML = '';
    const options = window.MANAGER_OPTIONS || [];

    const managerFileMap = {
      benefit_highlight: 'options/benefit-highlight.html',
      staff_entitlement: 'options/staff-entitlement.html',
      expenses_highlight: 'options/expenses-highlight.html',
      staff_summary: 'options/staff-summary.html'
    };

    options.forEach(opt => {
      const card = document.createElement('a');
      card.className = 'claim-square-card';
      card.style.textDecoration = 'none';
      card.href = managerFileMap[opt.id] || `options/${opt.id}.html`;

      card.innerHTML = `
        <div class="claim-square-icon-wrap">
          ${opt.icon}
        </div>
        <div class="claim-square-title">${opt.name}</div>
      `;

      container.appendChild(card);
    });
  }

  function getSubCategoryIcon(id) {
    const iconMap = {
      car_maint: '🚗',
      personal_allow: '👤',
      mobile_phone: '📱',
      optical_dental: '🦷',
      gp_clinic: '🏥',
      specialist: '👨‍⚕️',
      pharmacy: '💊',
      ot_meal: '🍱',
      ot_transport: '🚕',
      mileage: '🚘',
      tolls_parking: '🅿️',
      client_dining: '🍽️',
      travel_adv: '💵',
      office_supplies: '📦'
    };
    return iconMap[id] || '💳';
  }

  /**
   * Navigate from Option Card to Sub-Page 1 (Ultra-Modern Premium Category Cards View)
   */
  function openOptionDetailById(optId) {
    activeOptionId = optId;
    const options = window.CLAIM_OPTIONS || [];
    const opt = options.find(o => o.id === optId);
    if (!opt) return;

    const globalTitleEl = document.getElementById('globalTopTitle');
    const container = document.getElementById('benefitAllowanceCardsContainer');

    if (globalTitleEl) globalTitleEl.textContent = opt.name;

    if (container) {
      container.innerHTML = '';

      const subCats = opt.subCategories || [];
      if (subCats.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 28px 16px; background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border-subtle); font-size: 13px; color: var(--text-muted);">
            No allowance sub-categories defined for this claim option.
          </div>
        `;
      } else {
        subCats.forEach(sub => {
          const icon = getSubCategoryIcon(sub.id);
          const entitled = sub.entitled > 0 ? sub.entitled : 1;
          const claimedPct = Math.min(100, Math.max(0, (sub.claimed / entitled) * 100));
          const pendingPct = Math.min(100, Math.max(0, (sub.pending / entitled) * 100));
          const availPct = Math.min(100, Math.max(0, (sub.usable / entitled) * 100));

          const card = document.createElement('div');
          card.className = 'leave-list-item';
          card.style.cssText = 'background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 18px; padding: 16px; box-shadow: var(--shadow-card); margin-bottom: 14px; transition: transform 0.2s ease;';

          card.innerHTML = `
            <!-- Item Header matching leave.html -->
            <div class="item-header" style="display: flex; justify-content: space-between; align-items: center;">
              <div class="item-title-wrap" style="display: flex; align-items: center; gap: 12px;">
                <div class="item-icon" style="width: 44px; height: 44px; border-radius: 14px; background: var(--bg-input); border: 1px solid var(--border-subtle); color: var(--text-primary); display: flex; align-items: center; justify-content: center; font-size: 20px;">
                  ${icon}
                </div>
                <div>
                  <h3 class="item-name" style="font-size: 14.5px; font-weight: 800; color: var(--text-primary); margin: 0; line-height: 1.2;">${sub.name}</h3>
                  <span class="item-avail" style="font-size: 12px; font-weight: 600; color: var(--text-muted); display: block; margin-top: 3px;">RM ${sub.usable.toFixed(2)} available</span>
                </div>
              </div>
              <button class="btn-apply-sm" style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: #ffffff; padding: 7px 18px; border-radius: 20px; font-size: 12.5px; font-weight: 800; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.35); transition: transform 0.15s ease;" onclick="window.ClaimsEngine.openClaimFormForSubCategory('${sub.id}')">
                Claim
              </button>
            </div>

            <!-- 4-Stat Metric Box matching leave.html -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; background: var(--bg-input); padding: 10px 8px; border-radius: 14px; margin-top: 12px; text-align: center; border: 1px solid var(--border-subtle);">
              <div>
                <div style="font-size: 9px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">ENTITLED</div>
                <div style="font-size: 12px; font-weight: 800; color: var(--text-primary); margin-top: 3px;">RM ${sub.entitled.toFixed(2)}</div>
              </div>
              <div>
                <div style="font-size: 9px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">CLAIMED</div>
                <div style="font-size: 12px; font-weight: 800; color: var(--text-primary); margin-top: 3px;">RM ${sub.claimed.toFixed(2)}</div>
              </div>
              <div>
                <div style="font-size: 9px; font-weight: 800; color: #f59e0b; text-transform: uppercase;">PENDING</div>
                <div style="font-size: 12px; font-weight: 800; color: #f59e0b; margin-top: 3px;">RM ${sub.pending.toFixed(2)}</div>
              </div>
              <div>
                <div style="font-size: 9px; font-weight: 800; color: #10b981; text-transform: uppercase;">AVAILABLE</div>
                <div style="font-size: 12px; font-weight: 800; color: #10b981; margin-top: 3px;">RM ${sub.usable.toFixed(2)}</div>
              </div>
            </div>

            <!-- Multi-segment Progress Bar matching leave.html -->
            <div class="progress-bar-bg" style="height: 6px; background: var(--border-subtle); border-radius: 4px; overflow: hidden; display: flex; margin-top: 10px;">
              <div class="progress-segment segment-taken" style="width: ${claimedPct}%; background: #7c3aed;"></div>
              <div class="progress-segment segment-pending" style="width: ${pendingPct}%; background: #f59e0b;"></div>
              <div class="progress-segment segment-available" style="width: ${availPct}%; background: #10b981;"></div>
            </div>
          `;

          container.appendChild(card);
        });
      }
    }

    // Switch View to Sub-Page 1 (Hide Scope Switcher when in Sub-Pages)
    const switcher = document.getElementById('mainScopeSwitcher');
    if (switcher) switcher.style.display = 'none';

    document.getElementById('optionsGridSubView').style.display = 'none';
    document.getElementById('benefitClaimFormSubPage').style.display = 'none';
    document.getElementById('optionDetailSubPage').style.display = 'block';
    document.querySelector('.main-content').scrollTop = 0;
  }

  /**
   * Navigate from Sub-Page 1 (`Claim` button) to Sub-Page 2 (Form View - Matching Screenshot 2)
   */
  function openClaimFormForSubCategory(subCatId) {
    const options = window.CLAIM_OPTIONS || [];
    const opt = options.find(o => o.id === activeOptionId);
    if (!opt) return;

    const sub = (opt.subCategories || []).find(s => s.id === subCatId);
    if (!sub) return;

    activeSubCategoryObj = sub;

    // Populate Form Summary Info (Screenshot 2 Header)
    const yearVal = document.getElementById('formYearVal');
    const benefitTypeVal = document.getElementById('formBenefitTypeVal');
    const entitledVal = document.getElementById('formEntitledVal');
    const usableVal = document.getElementById('formUsableVal');

    if (yearVal) yearVal.textContent = opt.entitlementYear || '2026';
    if (benefitTypeVal) benefitTypeVal.textContent = sub.name;
    if (entitledVal) entitledVal.textContent = sub.entitled.toFixed(2);
    if (usableVal) usableVal.textContent = sub.usable.toFixed(2);

    // Pre-fill Form Default Values logically
    const claimAmtInput = document.getElementById('formClaimAmount');
    const claimQtyInput = document.getElementById('formClaimQuantity');
    
    if (claimAmtInput) claimAmtInput.value = sub.pending > 0 ? sub.pending.toFixed(2) : '150.00';
    if (claimQtyInput) claimQtyInput.value = 1;

    resetAttachmentStatus();

    // Switch View to Sub-Page 2 (Hide Scope Switcher when in Sub-Pages)
    const switcher = document.getElementById('mainScopeSwitcher');
    if (switcher) switcher.style.display = 'none';

    document.getElementById('optionsGridSubView').style.display = 'none';
    document.getElementById('optionDetailSubPage').style.display = 'none';
    document.getElementById('benefitClaimFormSubPage').style.display = 'block';
    document.querySelector('.main-content').scrollTop = 0;
  }

  function backToOptionsGrid() {
    // Restore global title
    const globalTitleEl = document.getElementById('globalTopTitle');
    if (globalTitleEl) globalTitleEl.textContent = 'Claims & Expenses Hub';
    // Show Scope Switcher on Main Options Grid
    const switcher = document.getElementById('mainScopeSwitcher');
    if (switcher) switcher.style.display = 'flex';

    document.getElementById('benefitClaimFormSubPage').style.display = 'none';
    document.getElementById('optionDetailSubPage').style.display = 'none';
    document.getElementById('optionsGridSubView').style.display = 'block';
    document.querySelector('.main-content').scrollTop = 0;
  }

  function backToCategoryCards() {
    // Hide Scope Switcher when in Sub-Pages
    const switcher = document.getElementById('mainScopeSwitcher');
    if (switcher) switcher.style.display = 'none';

    document.getElementById('benefitClaimFormSubPage').style.display = 'none';
    document.getElementById('optionsGridSubView').style.display = 'none';
    document.getElementById('optionDetailSubPage').style.display = 'block';
    document.querySelector('.main-content').scrollTop = 0;
  }

  /**
   * Populate Form Dropdowns (Month & Currency)
   */
  function populateFormDropdowns() {
    const monthSelect = document.getElementById('formPeriodMonth');
    const currSelect = document.getElementById('formCurrency');

    if (monthSelect) {
      monthSelect.innerHTML = '';
      (window.CLAIM_PERIOD_MONTHS || []).forEach(m => {
        const el = document.createElement('option');
        el.value = m;
        el.textContent = m;
        if (m === 'September') el.selected = true;
        monthSelect.appendChild(el);
      });
    }

    if (currSelect) {
      currSelect.innerHTML = '';
      (window.CURRENCIES || []).forEach(c => {
        const el = document.createElement('option');
        el.value = c;
        el.textContent = c;
        if (c.includes('MYR')) el.selected = true;
        currSelect.appendChild(el);
      });
    }
  }

  function triggerFileUpload() {
    isAttachmentUploaded = true;
    const badge = document.getElementById('formAttachmentBadge');
    if (badge) {
      badge.textContent = '✔ File Attached Successfully';
      badge.style.display = 'block';
    }
    showToast('📄 Selected file attachment!');
  }

  function triggerCameraUpload() {
    isAttachmentUploaded = true;
    const badge = document.getElementById('formAttachmentBadge');
    if (badge) {
      badge.textContent = '✔ Photo Captured Successfully';
      badge.style.display = 'block';
    }
    showToast('📷 Photo captured via camera!');
  }

  function resetAttachmentStatus() {
    isAttachmentUploaded = false;
    const badge = document.getElementById('formAttachmentBadge');
    if (badge) badge.style.display = 'none';
  }

  /**
   * Handle Exact Form Submit (Screenshot 2 Submit Handler)
   */
  function handleExactFormSubmit(e) {
    e.preventDefault();

    const amt = parseFloat(document.getElementById('formClaimAmount').value || '0');
    const sub = activeSubCategoryObj;

    if (sub) {
      sub.pending += amt;
      sub.usable = Math.max(0, sub.usable - amt);
    }

    if (window.MOCK_MY_SUBMISSIONS) {
      window.MOCK_MY_SUBMISSIONS.unshift({
        id: 'CLM-' + Date.now().toString().slice(-6),
        category: sub ? sub.name : 'BENEFIT CLAIM',
        optionName: 'Benefit Claim',
        date: '14 Sep 2026',
        amount: amt,
        status: 'pending',
        statusText: 'Pending Approval',
        merchant: document.getElementById('formPurpose')?.value || 'Benefit Claim',
        receipt: 'Ref #' + (document.getElementById('formReceiptNo')?.value || 'NEW')
      });
    }

    renderMySubmissions('all');
    showToast(`✅ Benefit claim of RM ${amt.toFixed(2)} for ${sub ? sub.name : 'Benefit'} submitted!`);

    // Re-render Sub-Page 1 Cards with updated Usable & Pending values
    openOptionDetailById(activeOptionId);
  }

  function openSummaryModal() {
    openOptionDetailById('summary');
  }

  function openBenefitHighlightModal() {
    showToast('🌟 Loaded Team Benefit Highlight Report');
    const m = document.getElementById('managerDetailModal');
    const t = document.getElementById('managerModalTitle');
    const c = document.getElementById('managerModalBody');
    if (t) t.textContent = 'Benefit Highlight & Analytics';
    if (c) {
      c.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="background: var(--bg-phone); padding: 14px; border-radius: 16px; border: 1px solid var(--border-subtle);">
            <div style="font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Top Team Benefit Usage</div>
            <div style="font-size: 20px; font-weight: 900; color: var(--purple-primary); margin: 4px 0;">Wellness & Gym (45%)</div>
            <div style="font-size: 12px; color: var(--text-muted);">Optical & Vision (30%) • Dental Care (25%)</div>
          </div>
        </div>
      `;
    }
    if (m) m.classList.add('active');
  }

  function openStaffEntitlementModal() {
    showToast('💳 Loaded Staff Benefit Entitlement Roster');
    const m = document.getElementById('managerDetailModal');
    const t = document.getElementById('managerModalTitle');
    const c = document.getElementById('managerModalBody');
    if (t) t.textContent = 'Staff Benefit Entitlements';
    if (c) {
      const staffList = window.MOCK_STAFF_ENTITLEMENTS || [];
      c.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${staffList.map(s => `
            <div style="background: var(--bg-phone); padding: 12px; border-radius: 14px; border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">${s.name}</div>
                <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">${s.dept}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 13px; font-weight: 800; color: var(--secondary);">RM ${s.balance.toFixed(2)}</div>
                <div style="font-size: 10.5px; color: var(--text-muted);">Claimed: ${s.pct}</div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }
    if (m) m.classList.add('active');
  }

  function openExpensesHighlightModal() {
    showToast('📈 Loaded Expenses Highlight & Analytics');
    const m = document.getElementById('managerDetailModal');
    const t = document.getElementById('managerModalTitle');
    const c = document.getElementById('managerModalBody');
    if (t) t.textContent = 'Expenses Spikes & Analytics';
    if (c) {
      c.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="background: var(--bg-phone); padding: 14px; border-radius: 16px; border: 1px solid var(--border-subtle);">
            <div style="font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Department Spend Breakdown</div>
            <div style="font-size: 18px; font-weight: 900; color: var(--text-primary); margin-top: 4px;">RM 4,250.00 / 15,000</div>
            <div style="font-size: 12px; color: var(--secondary); font-weight: 700; margin-top: 2px;">✔ 28.3% Budget Utilized (Normal Range)</div>
          </div>
        </div>
      `;
    }
    if (m) m.classList.add('active');
  }

  function openStaffSummaryModal() {
    showToast('📋 Loaded Staff Claim Summary Report');
    const m = document.getElementById('managerDetailModal');
    const t = document.getElementById('managerModalTitle');
    const c = document.getElementById('managerModalBody');
    if (t) t.textContent = 'Staff Claim YTD Statements';
    if (c) {
      c.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="background: var(--bg-phone); padding: 14px; border-radius: 16px; border: 1px solid var(--border-subtle);">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Subordinates YTD Claim Statement</div>
            <div style="font-size: 11.5px; color: var(--text-muted); line-height: 1.4;">Total Claims Processed: 24 Requests<br>Approved: 21 • Pending: 3 • Rejected: 0</div>
          </div>
          <button class="btn-submit-claim" onclick="window.ClaimsEngine.showToast('📥 Exported Staff Claim Summary PDF Report')">
            <span>Download Team YTD PDF Report</span>
          </button>
        </div>
      `;
    }
    if (m) m.classList.add('active');
  }

  function closeManagerModal() {
    const m = document.getElementById('managerDetailModal');
    if (m) m.classList.remove('active');
  }

  function handleManagerOptionClick(id, name) {
    if (id === 'benefit_highlight') openBenefitHighlightModal();
    else if (id === 'staff_entitlement') openStaffEntitlementModal();
    else if (id === 'expenses_highlight') openExpensesHighlightModal();
    else if (id === 'staff_summary') openStaffSummaryModal();
  }

  function renderTeamQueue() {
    const container = document.getElementById('teamApprovalsQueue');
    const countVal = document.getElementById('teamPendingCountVal');
    const totalVal = document.getElementById('teamPendingTotalVal');
    if (!container) return;

    container.innerHTML = '';
    const pendingCount = teamQueue.length;
    const totalAmt = teamQueue.reduce((acc, curr) => acc + curr.amount, 0);

    if (countVal) countVal.textContent = `${pendingCount} Requests`;
    if (totalVal) totalVal.textContent = `Total: RM ${totalAmt.toFixed(2)}`;

    if (pendingCount === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 30px 10px; background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border-subtle);">
          <div style="font-size: 32px; margin-bottom: 8px;">🎉</div>
          <div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">All Team Claims Approved!</div>
          <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 4px;">No pending team claim requests requiring action.</div>
        </div>
      `;
      return;
    }

    teamQueue.forEach(item => {
      const card = document.createElement('div');
      card.className = 'team-approval-card';
      card.id = `team-card-${item.id}`;

      const empIdFormatted = `#${(item.empNo || '004177').replace(/^#/, '')}`;

      card.innerHTML = `
        <div class="team-user-row" style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
          <div class="team-user-avatar" style="width: 42px; height: 42px; border-radius: 12px; background: ${item.avatarBg}; color: ${item.avatarColor}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px;">${item.avatar}</div>
          <div>
            <div class="team-user-name" style="font-size: 14.5px; font-weight: 800; color: var(--text-primary); line-height: 1.2;">${item.userName}</div>
            <div style="font-size: 11.5px; font-weight: 700; color: var(--text-muted); opacity: 0.8; font-family: monospace, sans-serif; margin-bottom: 4px;">${empIdFormatted}</div>
            <div class="team-user-dept" style="font-size: 11px; font-weight: 600; color: var(--text-muted);">${item.dept}</div>
          </div>
        </div>
        <div class="team-claim-details" style="background: var(--bg-input); border-radius: 14px; padding: 12px 14px; margin-bottom: 12px; border: 1px solid var(--border-subtle);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div style="font-size: 13.5px; font-weight: 800; color: var(--text-primary);">${item.title}</div>
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 600; margin-top: 3px;"><i class="fa-solid fa-receipt" style="margin-right: 4px; color: #7c3aed;"></i>${item.optionName} • ${item.subCatName} • ${item.date}</div>
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 600; margin-top: 2px;"><i class="fa-solid fa-store" style="margin-right: 4px; color: #10b981;"></i>${item.receipt}</div>
            </div>
            <div style="font-size: 15px; font-weight: 900; color: var(--purple-primary); text-align: right;">RM ${item.amount.toFixed(2)}</div>
          </div>
        </div>
        <div class="team-action-buttons" style="display: flex; gap: 8px;">
          <button class="btn-approve" style="flex: 1; padding: 10px; border-radius: 12px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff; border: none; font-size: 12.5px; font-weight: 800; cursor: pointer;" onclick="window.ClaimsEngine.actionTeamClaim(${item.id}, 'approve', '${item.userName}', 'RM ${item.amount.toFixed(2)}')">✔ Approve</button>
          <button class="btn-reject" style="flex: 1; padding: 10px; border-radius: 12px; background: transparent; border: 1px solid #ef4444; color: #ef4444; font-size: 12.5px; font-weight: 800; cursor: pointer;" onclick="window.ClaimsEngine.actionTeamClaim(${item.id}, 'reject', '${item.userName}', 'RM ${item.amount.toFixed(2)}')">✕ Reject</button>
          <button class="btn-detail" style="padding: 10px 14px; border-radius: 12px; background: var(--bg-input); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 12.5px; font-weight: 800; cursor: pointer;" onclick="window.ClaimsEngine.openTeamDetailModal(${item.id})">👁️</button>
        </div>
      `;

      container.appendChild(card);
    });
  }

  function actionTeamClaim(id, action, userName, amount) {
    teamQueue = teamQueue.filter(item => item.id !== id);
    renderTeamQueue();

    if (action === 'approve') {
      showToast(`✔ Approved ${userName}'s claim of ${amount}`);
    } else {
      showToast(`✕ Rejected ${userName}'s claim of ${amount}`);
    }
  }

  function approveAllTeamClaims() {
    teamQueue = [];
    renderTeamQueue();
    showToast('🎉 Approved all pending team claims!');
  }

  /**
   * Switch Scope between Individual and Team Manager
   */
  function switchClaimScope(scope) {
    const tabIndiv = document.getElementById('tabClaimIndividual');
    const tabTeam = document.getElementById('tabClaimTeam');
    const secIndiv = document.getElementById('scopeIndividualSection');
    const secTeam = document.getElementById('scopeTeamSection');

    if (scope === 'team') {
      if (tabIndiv) tabIndiv.classList.remove('active');
      if (tabTeam) tabTeam.classList.add('active');
      if (secIndiv) secIndiv.style.display = 'none';
      if (secTeam) secTeam.style.display = 'block';
      renderManagerSquareGrid();
      renderTeamQueue();
    } else {
      if (tabTeam) tabTeam.classList.remove('active');
      if (tabIndiv) tabIndiv.classList.add('active');
      if (secTeam) secTeam.style.display = 'none';
      if (secIndiv) secIndiv.style.display = 'block';
      renderOptionSquareGrid();
      renderMySubmissions('all');
    }
  }

  /**
   * Handle Centralized Global Back Button Navigation
   */
  function handleGlobalBack() {
    const formPage = document.getElementById('benefitClaimFormSubPage');
    const detailPage = document.getElementById('optionDetailSubPage');
    
    if (formPage && formPage.style.display === 'block') {
      // If we are in Form view, go back to Cards view
      backToCategoryCards();
    } else if (detailPage && detailPage.style.display === 'block') {
      // If we are in Cards view, go back to Main Options grid
      backToOptionsGrid();
    } else {
      // Otherwise default history back
      window.history.back();
    }
  }

  // Global Engine Export
  window.ClaimsEngine = {
    initClaimsApp,
    showToast,
    switchClaimScope,
    openOptionDetailById,
    openClaimFormForSubCategory,
    backToOptionsGrid,
    backToCategoryCards,
    triggerFileUpload,
    triggerCameraUpload,
    handleExactFormSubmit,
    openSummaryModal,
    renderMySubmissions,
    filterMySubmissions,
    actionTeamClaim,
    approveAllTeamClaims,
    closeManagerModal,
    openAllClaimOptionsModal,
    closeAllClaimOptionsModal,
    handleGlobalBack
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClaimsApp);
  } else {
    initClaimsApp();
  }
  window.addEventListener('load', initClaimsApp);
})();

