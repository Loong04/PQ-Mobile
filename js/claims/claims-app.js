/**
 * PeopleHCM - Claims Application Engine (Square Grid Design)
 * Individual & Manager Scope Operations.
 * Manager Options: Benefit Highlight, Staff Benefit Entitlement, Expenses Highlight, Staff Claim Summary
 */

(function () {
  let activeScope = 'individual';
  let teamQueue = window.MOCK_TEAM_APPROVALS ? [...window.MOCK_TEAM_APPROVALS] : [];

  function showToast(msg) {
    const toast = document.getElementById('toastNotification');
    const toastText = document.getElementById('toastText');
    if (toast && toastText) {
      toastText.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2600);
    }
  }

  function initClaimsApp() {
    renderOptionSquareGrid();
    renderManagerSquareGrid();
    renderTeamQueue();
    populateFormModalOptions();
  }

  /**
   * Render Individual Square Grid Options
   */
  function renderOptionSquareGrid() {
    const container = document.getElementById('claimOptionsHubGrid');
    if (!container) return;

    container.innerHTML = '';
    const options = window.CLAIM_OPTIONS || [];

    options.forEach(opt => {
      const card = document.createElement('div');
      card.className = 'claim-square-card';
      card.setAttribute('data-option', opt.id);

      card.onclick = () => {
        if (opt.id === 'summary') {
          openSummaryModal();
        } else {
          openOptionDetail(opt.name, `RM ${opt.entitlementYearly.toLocaleString()}`, `RM ${opt.claimedYTD.toFixed(2)}`, `RM ${opt.availableBalance.toFixed(2)}`, opt.subCategories);
        }
      };

      card.innerHTML = `
        <div class="claim-square-icon-wrap">
          ${opt.icon}
        </div>
        <div class="claim-square-title">${opt.name}</div>
      `;

      container.appendChild(card);
    });
  }

  /**
   * Render Manager Square Grid Options (Benefit Highlight, Staff Entitlement, Expenses Highlight, Staff Summary)
   */
  function renderManagerSquareGrid() {
    const container = document.getElementById('managerOptionsGrid');
    if (!container) return;

    container.innerHTML = '';
    const options = window.MANAGER_OPTIONS || [];

    options.forEach(opt => {
      const card = document.createElement('div');
      card.className = 'claim-square-card';
      card.setAttribute('data-option', opt.id);

      card.onclick = () => handleManagerOptionClick(opt.id, opt.name);

      card.innerHTML = `
        <div class="claim-square-icon-wrap">
          ${opt.icon}
        </div>
        <div class="claim-square-title">${opt.name}</div>
      `;

      container.appendChild(card);
    });
  }

  /**
   * Manager Option Click Router
   */
  function handleManagerOptionClick(id, name) {
    if (id === 'benefit_highlight') {
      openBenefitHighlightModal();
    } else if (id === 'staff_entitlement') {
      openStaffEntitlementModal();
    } else if (id === 'expenses_highlight') {
      openExpensesHighlightModal();
    } else if (id === 'staff_summary') {
      openStaffSummaryModal();
    }
  }

  function renderTeamQueue() {
    const container = document.getElementById('teamApprovalsQueue');
    if (!container) return;

    container.innerHTML = '';
    if (teamQueue.length === 0) {
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

      card.innerHTML = `
        <div class="team-user-row">
          <div class="team-user-avatar" style="background: ${item.avatarBg}; color: ${item.avatarColor};">${item.avatar}</div>
          <div>
            <div class="team-user-name">${item.userName}</div>
            <div class="team-user-dept">${item.dept}</div>
          </div>
        </div>
        <div class="team-claim-details">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">${item.title}</div>
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 600; margin-top: 2px;">📁 ${item.optionName} • ${item.subCatName} • ${item.date}</div>
            </div>
            <div style="font-size: 14.5px; font-weight: 900; color: var(--text-primary);">RM ${item.amount.toFixed(2)}</div>
          </div>
        </div>
        <div class="team-action-buttons">
          <button class="btn-approve" onclick="window.ClaimsEngine.actionTeamClaim(${item.id}, 'approve', '${item.userName}', 'RM ${item.amount.toFixed(2)}')">✔ Approve</button>
          <button class="btn-reject" onclick="window.ClaimsEngine.actionTeamClaim(${item.id}, 'reject', '${item.userName}', 'RM ${item.amount.toFixed(2)}')">✕ Reject</button>
        </div>
      `;

      container.appendChild(card);
    });
  }

  function populateFormModalOptions() {
    const optSelect = document.getElementById('modalOptionSelect');
    if (!optSelect) return;

    const options = window.CLAIM_OPTIONS || [];
    optSelect.innerHTML = '';
    options.filter(o => o.id !== 'summary').forEach(opt => {
      const el = document.createElement('option');
      el.value = opt.id;
      el.textContent = `${opt.icon} ${opt.name}`;
      optSelect.appendChild(el);
    });

    updateSubCatSelect();
    optSelect.onchange = updateSubCatSelect;
  }

  function updateSubCatSelect() {
    const optSelect = document.getElementById('modalOptionSelect');
    const subSelect = document.getElementById('modalSubCatSelect');
    if (!optSelect || !subSelect) return;

    const options = window.CLAIM_OPTIONS || [];
    const optKey = optSelect.value;
    const option = options.find(o => o.id === optKey) || options[0];

    subSelect.innerHTML = '';
    if (option && option.subCategories && option.subCategories.length > 0) {
      option.subCategories.forEach(s => {
        const el = document.createElement('option');
        el.value = s.id;
        el.textContent = `${s.icon} ${s.name}`;
        subSelect.appendChild(el);
      });
    } else {
      const el = document.createElement('option');
      el.value = 'general';
      el.textContent = '🧾 General Claim Request';
      subSelect.appendChild(el);
    }
  }

  function switchClaimScope(scope) {
    activeScope = scope;
    const tabInd = document.getElementById('tabClaimIndividual');
    const tabTeam = document.getElementById('tabClaimTeam');
    const secInd = document.getElementById('scopeIndividualSection');
    const secTeam = document.getElementById('scopeTeamSection');

    if (scope === 'individual') {
      if (tabInd) tabInd.classList.add('active');
      if (tabTeam) tabTeam.classList.remove('active');
      if (secInd) secInd.style.display = 'block';
      if (secTeam) secTeam.style.display = 'none';
      showToast('👤 Switched to Individual Claims Hub');
    } else {
      if (tabTeam) tabTeam.classList.add('active');
      if (tabInd) tabInd.classList.remove('active');
      if (secInd) secInd.style.display = 'none';
      if (secTeam) secTeam.style.display = 'block';
      showToast('👥 Switched to Team Manager Portal');
    }
  }

  function openSubmitModal() {
    populateFormModalOptions();
    const m = document.getElementById('submitClaimModal');
    if (m) m.classList.add('active');
  }

  function openSubmitModalWithOption(optionKey) {
    const optSelect = document.getElementById('modalOptionSelect');
    if (optSelect) {
      optSelect.value = optionKey;
      updateSubCatSelect();
    }
    openSubmitModal();
  }

  function closeSubmitModal() {
    const m = document.getElementById('submitClaimModal');
    if (m) m.classList.remove('active');
  }

  function handleClaimSubmit(e) {
    e.preventDefault();
    const optKey = document.getElementById('modalOptionSelect').value;
    const amount = parseFloat(document.getElementById('modalAmount').value || '0');
    const merchant = document.getElementById('modalMerchant').value;

    const options = window.CLAIM_OPTIONS || [];
    const optObj = options.find(o => o.id === optKey);

    closeSubmitModal();
    showToast(`✅ Submitted RM ${amount.toFixed(2)} for ${optObj ? optObj.name : 'Claim'}!`);

    const form = document.getElementById('claimSubmitForm');
    if (form) form.reset();
  }

  // Manager Option Modal Handlers
  function openBenefitHighlightModal() {
    showToast('🌟 Loaded Team Benefit Highlight Report');
    const m = document.getElementById('managerDetailModal');
    const t = document.getElementById('managerModalTitle');
    const c = document.getElementById('managerModalBody');
    if (t) t.textContent = 'Benefit Highlight';
    if (c) {
      c.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="background: var(--bg-phone); padding: 14px; border-radius: 16px; border: 1px solid var(--border-subtle);">
            <div style="font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Top Team Benefit Usage</div>
            <div style="font-size: 20px; font-weight: 900; color: var(--purple-primary); margin: 4px 0;">Wellness & Gym (45%)</div>
            <div style="font-size: 12px; color: var(--text-muted);">Optical & Vision (30%) • Dental Care (25%)</div>
          </div>
          <div style="background: var(--bg-phone); padding: 12px; border-radius: 14px; border: 1px solid var(--border-subtle); font-size: 12px; color: var(--text-primary); line-height: 1.5;">
            💡 <strong>Insight:</strong> 80% of direct reports utilized their Wellness & Fitness allowance this quarter.
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
    if (t) t.textContent = 'Staff Benefit Entitlement';
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
    if (t) t.textContent = 'Expenses Highlight';
    if (c) {
      c.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="background: var(--bg-phone); padding: 14px; border-radius: 16px; border: 1px solid var(--border-subtle);">
            <div style="font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Department Spend Breakdown</div>
            <div style="font-size: 18px; font-weight: 900; color: var(--text-primary); margin-top: 4px;">RM 4,250.00 / 15,000</div>
            <div style="font-size: 12px; color: var(--secondary); font-weight: 700; margin-top: 2px;">✔ 28.3% Budget Utilized (Normal Range)</div>
          </div>
          <div style="background: var(--bg-phone); padding: 12px; border-radius: 14px; border: 1px solid var(--border-subtle); font-size: 12px; color: var(--text-primary); line-height: 1.5;">
            🚗 <strong>Mileage Alert:</strong> Client travel expenses peaked in September due to TRX site visits.
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
    if (t) t.textContent = 'Staff Claim Summary';
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

  function openOptionDetail(title, limit, used, balance, subCats) {
    const t = document.getElementById('folderDetailTitle');
    const l = document.getElementById('detailLimit');
    const u = document.getElementById('detailUsed');
    const b = document.getElementById('detailBalance');
    const subContainer = document.getElementById('detailSubCategories');
    const m = document.getElementById('folderDetailModal');

    if (t) t.textContent = `${title} Details`;
    if (l) l.textContent = limit;
    if (u) u.textContent = used;
    if (b) b.textContent = balance;

    if (subContainer) {
      if (subCats && subCats.length > 0) {
        subContainer.innerHTML = `
          <div style="font-size: 11.5px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px;">Sub-Categories Breakdown</div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${subCats.map(s => `
              <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-phone); padding: 10px 12px; border-radius: 12px; border: 1px solid var(--border-subtle);">
                <span style="font-size: 12px; font-weight: 700; color: var(--text-primary);">${s.icon} ${s.name}</span>
                <span style="font-size: 12px; font-weight: 800; color: var(--purple-primary);">Limit: RM ${s.limit.toFixed(0)}</span>
              </div>
            `).join('')}
          </div>
        `;
        subContainer.style.display = 'block';
      } else {
        subContainer.style.display = 'none';
      }
    }

    if (m) m.classList.add('active');
  }

  function closeFolderDetail() {
    const m = document.getElementById('folderDetailModal');
    if (m) m.classList.remove('active');
  }

  function openSummaryModal() {
    showToast('📊 Loaded YTD Claim Summary & Financial Report');
    openOptionDetail('Annual Claim Summary', 'RM 10,420.00 Total Entitlement', 'RM 2,810.00 Used', 'RM 7,610.00 Remaining', []);
  }

  function openReceiptModal(merchant, amount, date) {
    const rm = document.getElementById('receiptMerchant');
    const ra = document.getElementById('receiptAmount');
    const m = document.getElementById('receiptModal');

    if (rm) rm.textContent = `${merchant} • ${date}`;
    if (ra) ra.textContent = amount;
    if (m) m.classList.add('active');
  }

  function closeReceiptModal() {
    const m = document.getElementById('receiptModal');
    if (m) m.classList.remove('active');
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

  // Global Engine Export
  window.ClaimsEngine = {
    initClaimsApp,
    showToast,
    switchClaimScope,
    openSubmitModal,
    openSubmitModalWithOption,
    closeSubmitModal,
    handleClaimSubmit,
    openOptionDetail,
    closeFolderDetail,
    openSummaryModal,
    openReceiptModal,
    closeReceiptModal,
    actionTeamClaim,
    approveAllTeamClaims,
    closeManagerModal
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClaimsApp);
  } else {
    initClaimsApp();
  }
})();
