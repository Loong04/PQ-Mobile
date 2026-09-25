/**
 * PeopleHCM - Claims Application Engine
 * Renders Individual & Team Dashboards matching screenshots 1 & 2.
 * Adheres strictly to AGENTS.md rules & DESIGN.md guidelines.
 */

(function () {
  let activeScope = 'individual'; // 'individual' or 'team'
  let activeBreakdownCategory = 'benefits'; // 'benefits' or 'claims'
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
    renderDashboardScope(activeScope);
    populateFormDropdowns();
  }

  /**
   * Switch between Individual and Team scope
   */
  function switchClaimScope(scope) {
    activeScope = scope;
    const tabIndiv = document.getElementById('tabClaimIndividual');
    const tabTeam = document.getElementById('tabClaimTeam');
    const secIndiv = document.getElementById('scopeIndividualSection');
    const secTeam = document.getElementById('scopeTeamSection');
    const subtitle = document.getElementById('headerSubtitleText');

    if (scope === 'team') {
      if (tabIndiv) tabIndiv.classList.remove('active');
      if (tabTeam) tabTeam.classList.add('active');
      if (secIndiv) secIndiv.style.display = 'none';
      if (secTeam) secTeam.style.display = 'block';
      if (subtitle) subtitle.textContent = 'Team Overview';
      renderTeamDashboard();
    } else {
      if (tabTeam) tabTeam.classList.remove('active');
      if (tabIndiv) tabIndiv.classList.add('active');
      if (secTeam) secTeam.style.display = 'none';
      if (secIndiv) secIndiv.style.display = 'block';
      if (subtitle) subtitle.textContent = 'Individual';
      renderIndividualDashboard();
    }
  }

  function renderDashboardScope(scope) {
    switchClaimScope(scope);
  }

  /**
   * ==========================================
   * 1. INDIVIDUAL DASHBOARD RENDERING
   * ==========================================
   */
  function renderIndividualDashboard() {
    renderBreakdownDonutChart('individual', activeBreakdownCategory);
    renderIndividualCalendar();
    renderOptionSquareGrid();
    renderMySubmissions('all');
  }

  /**
   * ==========================================
   * 2. TEAM DASHBOARD RENDERING
   * ==========================================
   */
  function renderTeamDashboard() {
    renderBreakdownDonutChart('team', activeBreakdownCategory);
    renderTeamCalendar();
    renderManagerSquareGrid();
    renderTeamQueue();
  }

  /**
   * ==========================================
   * DYNAMIC SVG DONUT CHART & LEGEND
   * ==========================================
   */
  function toggleBreakdownCategory(scope, cat) {
    activeBreakdownCategory = cat;
    
    // Update button states
    const benefitsBtn = document.getElementById(`${scope}-breakdown-benefits-btn`);
    const claimsBtn = document.getElementById(`${scope}-breakdown-claims-btn`);

    if (benefitsBtn && claimsBtn) {
      if (cat === 'benefits') {
        benefitsBtn.className = 'breakdown-toggle-pill active';
        claimsBtn.className = 'breakdown-toggle-pill';
      } else {
        benefitsBtn.className = 'breakdown-toggle-pill';
        claimsBtn.className = 'breakdown-toggle-pill active';
      }
    }

    renderBreakdownDonutChart(scope, cat);
  }

  function renderBreakdownDonutChart(scope, cat) {
    const dataSet = window.CLAIM_BREAKDOWN_DATA?.[scope]?.[cat];
    if (!dataSet) return;

    const chartContainer = document.getElementById(`${scope}-donut-svg-container`);
    const legendContainer = document.getElementById(`${scope}-breakdown-legend-container`);
    if (!chartContainer || !legendContainer) return;

    const items = dataSet.items;
    const totalVal = items.reduce((acc, i) => acc + i.value, 0);

    // SVG Donut calculation: Radius R=38, Center (50,50), Circumference = 2*PI*38 = 238.761
    const R = 38;
    const C = 238.761;
    let offset = 0;

    let circlesSvg = '';
    items.forEach(item => {
      const pct = item.value / totalVal;
      const dashLen = pct * C;
      const dashOffset = -offset;
      offset += dashLen;

      circlesSvg += `
        <circle 
          cx="50" cy="50" r="${R}" 
          fill="none" 
          stroke="${item.color}" 
          stroke-width="12" 
          stroke-dasharray="${dashLen.toFixed(2)} ${(C - dashLen).toFixed(2)}" 
          stroke-dashoffset="${dashOffset.toFixed(2)}"
          transform="rotate(-90 50 50)"
          style="transition: all 0.4s ease;"
        />
      `;
    });

    chartContainer.innerHTML = `
      <svg viewBox="0 0 100 100" style="width: 170px; height: 170px; display: block; margin: 0 auto; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.15));">
        <circle cx="50" cy="50" r="${R}" fill="none" stroke="var(--bg-input)" stroke-width="12" />
        ${circlesSvg}
        <text x="50" y="46" text-anchor="middle" font-size="9.5" font-weight="900" fill="var(--text-primary)">${dataSet.total}</text>
        <text x="50" y="57" text-anchor="middle" font-size="5" font-weight="700" fill="var(--text-muted)">${dataSet.label}</text>
      </svg>
    `;

    // Render Legend List
    legendContainer.innerHTML = `
      <div style="display: flex; justify-content: space-between; padding: 4px 8px; font-size: 11px; font-weight: 700; color: var(--text-muted); border-bottom: 1px solid var(--border-subtle); margin-bottom: 8px;">
        <span>Category</span>
        <div style="display: flex; gap: 32px;">
          <span>Amount</span>
          <span>Share</span>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${items.map(item => `
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; padding: 2px 4px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 10px; height: 10px; border-radius: 3px; background: ${item.color}; display: inline-block;"></span>
              <span style="font-weight: 700; color: var(--text-primary);">${item.category}</span>
            </div>
            <div style="display: flex; gap: 24px; font-weight: 800;">
              <span style="color: var(--text-primary); text-align: right; min-width: 60px;">${item.amount}</span>
              <span style="color: var(--text-muted); text-align: right; min-width: 40px; font-weight: 700;">${item.share}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * ==========================================
   * INDIVIDUAL TRAVEL CALENDAR (Screenshot 1)
   * ==========================================
   */
  function renderIndividualCalendar() {
    const gridContainer = document.getElementById('individual-calendar-grid');
    if (!gridContainer) return;

    // September 2026 (1st is Tuesday)
    // Days layout: 1 to 30
    const travelDays = [28, 29, 30];
    const today = 24;

    let daysHtml = '';
    // Empty padding slot for Monday 31 Aug
    daysHtml += `<div class="cal-day empty"></div>`;

    for (let d = 1; d <= 30; d++) {
      let isToday = (d === today);
      let isTravel = travelDays.includes(d);
      let classes = ['cal-day'];

      if (isToday) classes.push('today');
      if (isTravel) classes.push('travel-highlight');
      if (d === 28) classes.push('active-pill');

      daysHtml += `
        <div class="${classes.join(' ')}" onclick="selectIndividualCalendarDay(${d})">
          <span>${d}</span>
          ${isTravel ? '<span class="dot-indicator"></span>' : ''}
        </div>
      `;
    }

    gridContainer.innerHTML = daysHtml;
    updateIndividualTripDetail(28);
  }

  function selectIndividualCalendarDay(day) {
    document.querySelectorAll('#individual-calendar-grid .cal-day').forEach(el => {
      el.classList.remove('active-pill');
      if (el.textContent.trim().startsWith(day.toString())) {
        el.classList.add('active-pill');
      }
    });
    updateIndividualTripDetail(day);
  }

  function updateIndividualTripDetail(day) {
    const detailBox = document.getElementById('individual-trip-detail-card');
    if (!detailBox) return;

    if (day >= 28 && day <= 30) {
      detailBox.innerHTML = `
        <div style="font-size: 13px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">
          Monday, 28 September 2026
        </div>
        <div style="background: var(--bg-input); border-radius: 16px; padding: 12px 14px; border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 13.5px; font-weight: 800; color: var(--text-primary);">Kuala Lumpur ➔ Penang</div>
            <div style="font-size: 11.5px; font-weight: 600; color: var(--text-muted); margin-top: 3px;">28–30 Sep 2026 • 3 days</div>
            <div style="font-size: 11px; font-weight: 600; color: var(--text-muted); margin-top: 1px;">Client visit</div>
          </div>
          <span style="font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 10px; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3);">
            Approved
          </span>
        </div>
      `;
    } else if (day === 24) {
      detailBox.innerHTML = `
        <div style="font-size: 13px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">
          Thursday, 24 September 2026 (Today)
        </div>
        <div style="background: var(--bg-input); border-radius: 16px; padding: 12px 14px; border: 1px solid var(--border-subtle); font-size: 12px; color: var(--text-muted);">
          No travel schedules for today. Office working day.
        </div>
      `;
    } else {
      detailBox.innerHTML = `
        <div style="font-size: 13px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">
          September ${day}, 2026
        </div>
        <div style="background: var(--bg-input); border-radius: 16px; padding: 12px 14px; border: 1px solid var(--border-subtle); font-size: 12px; color: var(--text-muted);">
          No travel records for this date.
        </div>
      `;
    }
  }

  /**
   * ==========================================
   * TEAM TRAVEL CALENDAR (Screenshot 2)
   * ==========================================
   */
  function renderTeamCalendar() {
    const gridContainer = document.getElementById('team-calendar-grid');
    if (!gridContainer) return;

    const travelBadges = window.TEAM_TRAVEL_DATA?.travelBadges || {};
    const today = 24;

    let daysHtml = '';
    // Empty padding slot for Monday 31 Aug
    daysHtml += `<div class="cal-day empty"></div>`;

    for (let d = 1; d <= 30; d++) {
      let isToday = (d === today);
      let count = travelBadges[d] || 0;
      let classes = ['cal-day'];

      if (isToday) classes.push('today');
      if (count > 0) classes.push('staff-travel-highlight');
      if (d === 28) classes.push('active-pill');

      daysHtml += `
        <div class="${classes.join(' ')}" onclick="selectTeamCalendarDay(${d})">
          <span>${d}</span>
          ${count > 0 ? `<span class="staff-count-badge">${count}</span>` : ''}
        </div>
      `;
    }

    gridContainer.innerHTML = daysHtml;
    updateTeamTripDetail(28);
  }

  function selectTeamCalendarDay(day) {
    document.querySelectorAll('#team-calendar-grid .cal-day').forEach(el => {
      el.classList.remove('active-pill');
      if (el.textContent.trim().startsWith(day.toString())) {
        el.classList.add('active-pill');
      }
    });
    updateTeamTripDetail(day);
  }

  function updateTeamTripDetail(day) {
    const detailBox = document.getElementById('team-trip-detail-card');
    if (!detailBox) return;

    const data = window.TEAM_TRAVEL_DATA;
    if (!data) return;

    if (day >= 28 && day <= 30) {
      const staffList = data.staffTrips;
      detailBox.innerHTML = `
        <div style="font-size: 13.5px; font-weight: 800; color: var(--text-primary); margin-bottom: 10px;">
          Monday 28 September - ${staffList.length} staff
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${staffList.map(s => `
            <div style="background: var(--bg-input); border-radius: 14px; padding: 10px 12px; border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 13px; font-weight: 800; color: var(--text-primary); line-height: 1.2;">${s.name}</div>
                <!-- AGENTS.md Employee ID Presentation Standard: Directly below name, leading # -->
                <div style="font-size: 11.5px; font-weight: 700; color: var(--text-muted); opacity: 0.8; font-family: monospace, sans-serif; margin-bottom: 4px;">#${s.empNo.replace(/^#/, '')}</div>
                <div style="font-size: 11px; font-weight: 600; color: var(--text-muted);">${s.trip}</div>
              </div>
              <span style="font-size: 10.5px; font-weight: 800; padding: 3px 9px; border-radius: 8px; ${s.status === 'Approved' ? 'background: rgba(16, 185, 129, 0.15); color: #10b981;' : 'background: rgba(245, 158, 11, 0.15); color: #f59e0b;'}">
                ${s.status}
              </span>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      detailBox.innerHTML = `
        <div style="font-size: 13.5px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">
          September ${day}, 2026
        </div>
        <div style="background: var(--bg-input); border-radius: 16px; padding: 12px 14px; border: 1px solid var(--border-subtle); font-size: 12px; color: var(--text-muted);">
          No staff travel scheduled for this date.
        </div>
      `;
    }
  }

  /**
   * ==========================================
   * RECENT SUBMISSIONS (INDIVIDUAL)
   * ==========================================
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
   * ==========================================
   * QUICK OPTIONS GRID HUB
   * ==========================================
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
    const shouldShowViewAll = options.length > 5;
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
        <div class="claim-square-icon-wrap" style="background: rgba(124, 58, 237, 0.16); color: #7c3aed;">
          <i class="fa-solid fa-grip" style="font-size: 18px;"></i>
        </div>
        <div class="claim-square-title" style="color: var(--text-primary); font-weight: 800;">View All</div>
      `;

      container.appendChild(viewAllCard);
    }
  }

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

    const MAX_VISIBLE = 5;
    const shouldShowViewAll = options.length > 5;
    const displayOptions = shouldShowViewAll ? options.slice(0, MAX_VISIBLE) : options;

    displayOptions.forEach(opt => {
      const card = document.createElement('a');
      card.className = 'claim-square-card';
      card.style.textDecoration = 'none';
      card.href = opt.link || managerFileMap[opt.id] || `options/${opt.id}.html`;

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
        <div class="claim-square-icon-wrap" style="background: rgba(124, 58, 237, 0.16); color: #7c3aed;">
          <i class="fa-solid fa-grip" style="font-size: 18px;"></i>
        </div>
        <div class="claim-square-title" style="color: var(--text-primary); font-weight: 800;">View All</div>
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
   * ==========================================
   * TEAM APPROVALS QUEUE (TEAM DASHBOARD)
   * ==========================================
   */
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
            <!-- AGENTS.md Employee ID Presentation Standard: Directly below name, leading # -->
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
   * ==========================================
   * FORM DROPDOWNS & ATTACHMENTS
   * ==========================================
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

  function handleGlobalBack() {
    window.history.back();
  }

  // Global Engine Export
  window.ClaimsEngine = {
    initClaimsApp,
    showToast,
    switchClaimScope,
    toggleBreakdownCategory,
    selectIndividualCalendarDay,
    selectTeamCalendarDay,
    renderMySubmissions,
    filterMySubmissions,
    actionTeamClaim,
    approveAllTeamClaims,
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
