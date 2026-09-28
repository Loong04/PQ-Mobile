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
      const trip = window.INDIVIDUAL_TRAVEL_DATA?.trips?.[0] || {
        route: 'Kuala Lumpur ➔ Penang',
        destination: 'Penang Branch',
        dateToDate: '28 Sep 2026 – 30 Sep 2026',
        dates: '28–30 Sep 2026 • 3 days',
        reason: 'Official Outstation Travel',
        purpose: 'Client visit',
        status: 'Approved'
      };

      detailBox.innerHTML = `
        <div style="font-size: 13px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">
          Monday, 28 September 2026
        </div>
        <div style="background: var(--bg-input); border-radius: 18px; padding: 14px 16px; border: 1px solid var(--border-subtle);">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(124, 58, 237, 0.15); color: var(--purple-primary); display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0;">
                <i class="fa-solid fa-plane-departure"></i>
              </div>
              <div>
                <div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">${trip.route || 'Kuala Lumpur ➔ Penang'}</div>
                <div style="font-size: 11.5px; font-weight: 600; color: var(--text-muted); margin-top: 1px;">${trip.dates || '28–30 Sep 2026 • 3 days'}</div>
              </div>
            </div>
            <span style="font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 10px; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3);">
              ${trip.status || 'Approved'}
            </span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding-top: 12px; border-top: 1px dashed var(--border-subtle); font-size: 11.5px;">
            <div>
              <span style="color: var(--text-muted); font-weight: 600;">Destination:</span>
              <div style="font-weight: 800; color: var(--text-primary); margin-top: 2px;">${trip.destination || 'Penang Branch'}</div>
            </div>
            <div>
              <span style="color: var(--text-muted); font-weight: 600;">Date to Date:</span>
              <div style="font-weight: 800; color: var(--text-primary); margin-top: 2px;">${trip.dateToDate || '28 Sep 2026 – 30 Sep 2026'}</div>
            </div>
            <div>
              <span style="color: var(--text-muted); font-weight: 600;">Reason:</span>
              <div style="font-weight: 800; color: var(--text-primary); margin-top: 2px;">${trip.reason || 'Official Outstation Travel'}</div>
            </div>
            <div>
              <span style="color: var(--text-muted); font-weight: 600;">Purpose:</span>
              <div style="font-weight: 800; color: var(--purple-primary); margin-top: 2px;">${trip.purpose || 'Client visit'}</div>
            </div>
          </div>
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
   * PENDING APPROVALS DEDICATED VIEW
   * ==========================================
   */
  let currentPendingTab = 'all';

  function showTeamPendingApprovals() {
    const mainEl = document.getElementById('teamMainDashboard');
    const secEl = document.getElementById('teamPendingApprovalSection');
    const titleEl = document.getElementById('globalTopTitle');
    const subtitleEl = document.getElementById('headerSubtitleText');
    const switcherEl = document.getElementById('mainScopeSwitcher');
    
    if (mainEl) mainEl.style.display = 'none';
    if (secEl) secEl.style.display = 'block';
    
    if (titleEl) titleEl.innerHTML = 'Pending Approval';
    if (subtitleEl) subtitleEl.style.display = 'none';
    if (switcherEl) switcherEl.style.display = 'none';
    
    // Scroll to top
    const contentArea = document.querySelector('.main-content');
    if (contentArea) contentArea.scrollTop = 0;
  }

  function hideTeamPendingApprovals() {
    const mainEl = document.getElementById('teamMainDashboard');
    const secEl = document.getElementById('teamPendingApprovalSection');
    const titleEl = document.getElementById('globalTopTitle');
    const subtitleEl = document.getElementById('headerSubtitleText');
    const switcherEl = document.getElementById('mainScopeSwitcher');
    
    if (mainEl) mainEl.style.display = 'block';
    if (secEl) secEl.style.display = 'none';
    
    if (titleEl) titleEl.innerHTML = 'Claims &amp; Expenses';
    if (subtitleEl) subtitleEl.style.display = 'block';
    if (switcherEl) switcherEl.style.display = 'flex';
  }

  function switchPendingTab(tabName, btnElement) {
    currentPendingTab = tabName;
    if (btnElement) {
      const pills = btnElement.parentElement.querySelectorAll('.filter-pill');
      pills.forEach(p => p.classList.remove('active'));
      btnElement.classList.add('active');
    }
    renderTeamQueue();
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
    const badgeCount = document.getElementById('teamPendingCountBadge');
    const dashCount = document.getElementById('teamDashboardPendingCount');
    if (!container) return;

    container.innerHTML = '';
    const pendingCount = teamQueue.length;
    const totalAmt = teamQueue.reduce((acc, curr) => acc + curr.amount, 0);

    if (countVal) countVal.textContent = `${pendingCount} Requests`;
    if (totalVal) totalVal.textContent = `Total: RM ${totalAmt.toFixed(2)}`;
    if (dashCount) dashCount.textContent = pendingCount;

    let filteredQueue = teamQueue;
    if (currentPendingTab !== 'all') {
      filteredQueue = teamQueue.filter(item => {
        if (item.optionName === currentPendingTab) return true;
        const norm = str => (str || '').toLowerCase().replace(/claim/g, '').replace(/s\b/g, '').trim();
        const tabNorm = norm(currentPendingTab);
        const itemNorm = norm(item.optionName);
        return tabNorm && itemNorm && (itemNorm === tabNorm || itemNorm.includes(tabNorm) || tabNorm.includes(itemNorm));
      });
    }

    if (badgeCount) badgeCount.textContent = filteredQueue.length;

    if (filteredQueue.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 30px 10px; background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border-subtle);">
          <div style="font-size: 32px; margin-bottom: 8px;">🎉</div>
          <div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">No Pending Requests</div>
          <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 4px;">There are no requests requiring action for this category.</div>
        </div>
      `;
      return;
    }

    filteredQueue.forEach(item => {
      const card = document.createElement('pending-approval-card');
      card.id = `team-card-${item.id}`;
      
      const empIdFormatted = `#${(item.empNo || '004177').replace(/^#+/, '')}`;
      const claimType = item.optionName || 'Benefit Claim';
      const typeTitle = 'Benefit Type';

      const categoryVal = item.benefitType || item.advanceType || item.expenseType || item.medicalType || item.otType || item.travelType || item.subCatName || item.category || 'General';
      const claimDateVal = item.claimDate || item.date || '12 Sep 2026';
      const submitDateVal = item.submitDate || item.date || '13 Sep 2026';
      const amountStr = typeof item.amount === 'number' ? `RM ${item.amount.toFixed(2)}` : (item.amount || 'RM 0.00');
      const hoursStr = item.hours || '';
      let amountHourVal = amountStr;
      if (hoursStr && hoursStr !== '0' && hoursStr !== '0.0 hrs' && hoursStr !== '-') {
        amountHourVal = `${amountStr} / ${hoursStr}`;
      }

      card.setAttribute('user-name', item.userName);
      card.setAttribute('emp-id', empIdFormatted);
      card.setAttribute('dept', item.dept);
      card.setAttribute('doc-status', item.docStatus || 'Submitted');
      card.setAttribute('claim-type', claimType);
      card.setAttribute('type-label', typeTitle);
      card.setAttribute('benefit-type', categoryVal);
      card.setAttribute('category', categoryVal);
      card.setAttribute('claim-date', claimDateVal);
      card.setAttribute('submit-date', submitDateVal);
      const isBenefitOrMed = claimType.toLowerCase().includes('benefit') || claimType.toLowerCase().includes('medical');
      card.setAttribute('period', isBenefitOrMed ? '' : (item.period || '2026-09'));
      card.setAttribute('amount', amountStr);
      card.setAttribute('hours', hoursStr);
      card.setAttribute('amount-hour', amountHourVal);
      card.setAttribute('receipt', item.receipt || '');
      card.setAttribute('purpose', item.purpose || item.title || '');
      card.setAttribute('title', item.title || '');
      card.setAttribute('item-id', item.id);

      container.appendChild(card);
    });
  }

  function actionTeamClaim(id, action, userName, amount) {
    teamQueue = teamQueue.filter(item => item.id !== id);
    renderTeamQueue();

    if (action === 'approve') {
      showToast(`✔ Approved ${userName}'s claim of ${amount}`);
    } else if (action === 'resubmit') {
      showToast(`ℹ Sent back ${userName}'s claim for resubmission`);
    } else {
      showToast(`✕ Rejected ${userName}'s claim of ${amount}`);
    }
  }

  function toggleSelectAllTeamClaims(checked) {
    const checkboxes = document.querySelectorAll("#teamApprovalsQueue .approval-card-checkbox");
    checkboxes.forEach(cb => cb.checked = checked);
  }

  function approveAllTeamClaims() {
    teamQueue = [];
    renderTeamQueue();
    showToast('🎉 Approved all pending team claims!');
  }

  let currentSelectedClaimData = null;

  function openClaimThreeDotsMenu(btn, itemId) {
    let item = teamQueue.find(q => String(q.id) === String(itemId));
    const card = btn ? btn.closest('pending-approval-card, .approval-request-card') : null;
    
    if (!item && card) {
      const claimType = card.getAttribute('claim-type') || 'Benefit Claim';
      const hoursVal = card.getAttribute('hours') || '';
      const amountVal = card.getAttribute('amount') || 'RM 250.00';
      const amountHourVal = card.getAttribute('amount-hour') || amountVal;

      item = {
        id: itemId || card.getAttribute('item-id') || 1,
        userName: card.getAttribute('user-name') || 'Sarah Chen',
        empNo: (card.getAttribute('emp-id') || '#EBB01').replace(/^#+/, ''),
        dept: card.getAttribute('dept') || 'Marketing Lead • Digital Team',
        optionName: claimType,
        subCatName: card.getAttribute('category') || 'General',
        benefitType: card.getAttribute('category') || 'Optical & Wellness',
        medicalType: card.getAttribute('category') || 'General Consultation',
        period: card.getAttribute('period') || '2026-09',
        claimDate: card.getAttribute('claim-date') || '12 Sep 2026',
        submitDate: card.getAttribute('submit-date') || card.getAttribute('date') || '13 Sep 2026',
        date: card.getAttribute('submit-date') || card.getAttribute('date') || '13 Sep 2026',
        amount: amountVal,
        hours: hoursVal,
        amountHour: amountHourVal,
        purpose: card.getAttribute('purpose') || card.getAttribute('title') || 'General claim reimbursement request',
        receipt: card.getAttribute('receipt') || 'Official Receipt',
        docStatus: card.getAttribute('doc-status') || 'Submitted',
        status: card.getAttribute('doc-status') || 'Submitted'
      };
    } else if (item) {
      const amountStr = typeof item.amount === 'number' ? `RM ${item.amount.toFixed(2)}` : (item.amount || 'RM 0.00');
      const hoursStr = item.hours || '';
      let amtHour = amountStr;
      if (hoursStr && hoursStr !== '0' && hoursStr !== '0.0 hrs' && hoursStr !== '-') {
        amtHour = `${amountStr} / ${hoursStr}`;
      }
      item = {
        ...item,
        amount: amountStr,
        hours: hoursStr,
        amountHour: amtHour,
        claimDate: item.claimDate || item.date || '12 Sep 2026',
        submitDate: item.submitDate || item.date || '13 Sep 2026',
        period: item.period || '2026-09',
        purpose: item.purpose || item.title || 'General claim request',
        docStatus: item.docStatus || 'Submitted',
        status: item.docStatus || 'Submitted'
      };
    }

    currentSelectedClaimData = item;

    const titleEl = document.getElementById('claimThreeDotsName');
    if (titleEl && item) {
      titleEl.textContent = `${item.userName} - Claim Options`;
    }

    const overlay = document.getElementById('claimThreeDotsMenuOverlay');
    if (overlay) {
      overlay.style.display = 'flex';
      overlay.style.pointerEvents = 'auto';
      void overlay.offsetWidth;
      overlay.style.opacity = '1';
      const sheet = overlay.querySelector('.indicators-sheet');
      if (sheet) sheet.style.transform = 'translateY(0)';
    }
  }

  function closeClaimThreeDotsMenu(event) {
    if (event && event.target && event.target.id !== 'claimThreeDotsMenuOverlay' && !event.target.classList.contains('sheet-close-btn') && !event.target.closest('.sheet-close-btn')) {
      return;
    }
    const overlay = document.getElementById('claimThreeDotsMenuOverlay');
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      const sheet = overlay.querySelector('.indicators-sheet');
      if (sheet) sheet.style.transform = 'translateY(100%)';
      setTimeout(() => { overlay.style.display = 'none'; }, 250);
    }
  }

  let activeMedSubTab = 'general';

  function renderBenefitClaimDetail(d) {
    const amountFormatted = typeof d.amount === 'number' ? (d.amount < 0 ? d.amount.toFixed(2) : d.amount.toFixed(2)) : (d.amount || '-5.00');
    const empIdFormatted = d.empNo ? (d.empNo.startsWith('#') ? d.empNo : '#' + d.empNo) : '#EBB12';
    return `
      <div style="display: flex; flex-direction: column; gap: 14px; font-size: 13px;">
        <div class="detail-field-row"><div class="detail-field-label">Document Reference:</div><div class="detail-field-value">${d.docRef || 'CBF000000000025'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Document Status:</div><div class="detail-field-value">${d.docStatus || 'Submitted'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Employee:</div><div class="detail-field-value">${empIdFormatted.replace(/^#/, '')} - ${d.userName || 'Farhan binti rahmat'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Entitlement Year:</div><div class="detail-field-value">${d.entitlementYear || '2019'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Benefit Type:</div><div class="detail-field-value">${d.benefitType || 'PERSONAL ALLOWANCE'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Claim Period:</div><div class="detail-field-value">${d.period || '201902'}</div></div>

        <div style="border-top: 1px solid var(--border-subtle); margin: 6px 0 10px;"></div>

        <div class="detail-field-row"><div class="detail-field-label">From:</div><div class="detail-field-value">${d.fromDate || d.claimDate || '4 Sep 2019'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">To:</div><div class="detail-field-value">${d.toDate || d.claimDate || '4 Sep 2019'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Purpose:</div><div class="detail-field-value">${d.purpose || 'Purpose'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Receipt#:</div><div class="detail-field-value">${d.receiptNo || 'Receipt'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Other Ref.:</div><div class="detail-field-value">${d.otherRef || 'Reference'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Currency:</div><div class="detail-field-value">${d.currency || 'INDONESIAN RUPIAH'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Claim Amount:</div><div class="detail-field-value">${amountFormatted}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Claim Quantity:</div><div class="detail-field-value">${d.claimQuantity !== undefined ? d.claimQuantity : '0'}</div></div>

        <div style="margin-top: 4px;">
          <div style="font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Remarks:</div>
          <div style="color: var(--text-primary); font-weight: 600; line-height: 1.4;">${d.remarks || 'Remarks |undefined|undefined'}</div>
        </div>

        <div style="margin-top: 20px;">
          <div style="font-weight: 700; color: var(--text-secondary); margin-bottom: 8px;">Approver Action Comments:</div>
          <input type="text" id="claimDetailApproverComments" class="detail-mock-input" placeholder="" style="height: 40px;">
        </div>

        <div class="pending-action-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 20px;">
          <button type="button" class="action-btn-approve" style="padding: 10px 4px; font-size: 12px;" onclick="window.ClaimsEngine.actionTeamClaimFromModal(${d.id}, 'approve')">
            <i class="fa-solid fa-check" style="font-size: 12px;"></i> Approve
          </button>
          <button type="button" class="action-btn-resubmit" style="padding: 10px 4px; font-size: 12px;" onclick="window.ClaimsEngine.actionTeamClaimFromModal(${d.id}, 'resubmit')">
            <i class="fa-solid fa-rotate-left" style="font-size: 11.5px;"></i> Resubmit
          </button>
          <button type="button" class="action-btn-reject" style="padding: 10px 4px; font-size: 12px;" onclick="window.ClaimsEngine.actionTeamClaimFromModal(${d.id}, 'reject')">
            <i class="fa-solid fa-xmark" style="font-size: 12px;"></i> Reject
          </button>
        </div>
      </div>
    `;
  }

  function renderMedicalClaimDetail(d, subTab = 'general') {
    const empIdFormatted = d.empNo ? (d.empNo.startsWith('#') ? d.empNo : '#' + d.empNo) : '#EBB05';
    if (subTab === 'general') {
      return `
        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 13px;">
          <div class="detail-field-row"><div class="detail-field-label">Document Reference:</div><div class="detail-field-value">${d.docRef || 'CMD000000000133'}</div></div>
          <div class="detail-field-row"><div class="detail-field-label">Document Status:</div><div class="detail-field-value">${d.docStatus || 'Final Approval'}</div></div>
          <div class="detail-field-row"><div class="detail-field-label">Employee:</div><div class="detail-field-value">${empIdFormatted.replace(/^#/, '')} - ${d.userName || 'Low chin hao'}</div></div>

          <div class="detail-field-row">
            <div class="detail-field-label">Benefit Year :</div>
            <div class="detail-field-value"><div class="detail-mock-input">${d.benefitYear || '2016'}</div></div>
          </div>

          <div class="detail-field-row">
            <div class="detail-field-label">Benefit Type :</div>
            <div class="detail-field-value"><div class="detail-mock-input">${d.benefitType || 'Select Benefit'}</div></div>
          </div>

          <div class="detail-field-row">
            <div class="detail-field-label">Entitled Balance:</div>
            <div class="detail-field-value">
              <span style="background: #475569; color: #ffffff; font-size: 12px; font-weight: 800; padding: 3px 14px; border-radius: 12px; display: inline-block;">${d.entitledBalance || '0.00'}</span>
            </div>
          </div>

          <div class="detail-field-row">
            <div class="detail-field-label">Usable Balance:</div>
            <div class="detail-field-value">
              <span style="background: #475569; color: #ffffff; font-size: 12px; font-weight: 800; padding: 3px 14px; border-radius: 12px; display: inline-block;">${d.usableBalance || '0.00'}</span>
            </div>
          </div>

          <div class="detail-field-row">
            <div class="detail-field-label">Claim Period :</div>
            <div class="detail-field-value" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div class="detail-mock-input">${d.claimPeriodStart || '201601'}</div>
              <div class="detail-mock-input">${d.claimPeriodEnd || '201601'}</div>
            </div>
          </div>

          <div class="detail-field-row">
            <div class="detail-field-label">Receipt Date :</div>
            <div class="detail-field-value" style="width: 58%;"><div class="detail-mock-input">${d.receiptDate || '09/03/2016'}</div></div>
          </div>

          <div class="detail-field-row">
            <div class="detail-field-label">Receipt No. :</div>
            <div class="detail-field-value"><div class="detail-mock-input">${d.receiptNo || ''}</div></div>
          </div>

          <div class="detail-field-row">
            <div class="detail-field-label">Claim Total (RM):</div>
            <div class="detail-field-value" style="font-weight: 800; font-size: 14px;">${d.claimTotal || (typeof d.amount === 'number' ? d.amount.toFixed(2) : d.amount) || '100.00'}</div>
          </div>

          <div class="detail-field-row">
            <div class="detail-field-label">Remark :</div>
            <div class="detail-field-value"><div class="detail-mock-input">${d.remarks || ''}</div></div>
          </div>

          <div style="margin-top: 10px;">
            <div style="font-weight: 700; color: var(--text-secondary); margin-bottom: 8px;">Approver Action Comments:</div>
            <textarea id="claimDetailApproverComments" class="detail-mock-input" style="height: 64px; padding: 8px 10px; resize: none;"></textarea>
          </div>

          <div class="pending-action-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 16px;">
            <button type="button" class="action-btn-approve" style="padding: 10px 4px; font-size: 12px;" onclick="window.ClaimsEngine.actionTeamClaimFromModal(${d.id}, 'approve')">
              <i class="fa-solid fa-check" style="font-size: 12px;"></i> Approve
            </button>
            <button type="button" class="action-btn-resubmit" style="padding: 10px 4px; font-size: 12px;" onclick="window.ClaimsEngine.actionTeamClaimFromModal(${d.id}, 'resubmit')">
              <i class="fa-solid fa-rotate-left" style="font-size: 11.5px;"></i> Resubmit
            </button>
            <button type="button" class="action-btn-reject" style="padding: 10px 4px; font-size: 12px;" onclick="window.ClaimsEngine.actionTeamClaimFromModal(${d.id}, 'reject')">
              <i class="fa-solid fa-xmark" style="font-size: 12px;"></i> Reject
            </button>
          </div>
        </div>
      `;
    } else if (subTab === 'medical') {
      return `
        <div style="display: flex; flex-direction: column; gap: 14px; font-size: 13px;">
          <div>
            <div style="font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Patient's Type :</div>
            <div class="detail-mock-input">${d.patientType || 'Employee'}</div>
          </div>

          <div>
            <div style="font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Patient's Name :</div>
            <div class="detail-mock-input">${d.patientName || ''}</div>
            <div style="color: #ef4444; font-size: 12px; font-weight: 600; margin-top: 4px;">Please Select Patient Name</div>
          </div>

          <div>
            <div style="font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Treatment Type :</div>
            <div class="detail-mock-input">${d.treatmentType || 'Out Patient'}</div>
          </div>

          <div>
            <div style="font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Clinic / Hospital :</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div class="detail-mock-input" style="font-size: 12px;">${d.clinicLocation || '- Select Location -'}</div>
              <div class="detail-mock-input" style="font-size: 12px;">${d.clinicName || '- Select Clinic /Hospital -'}</div>
            </div>
          </div>

          <div>
            <div style="font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Sickness Type :</div>
            <div class="detail-mock-input">${d.sicknessType || '- Select Sickness -'}</div>
          </div>
        </div>
      `;
    } else if (subTab === 'details') {
      return `
        <div style="display: flex; flex-direction: column; font-size: 13px;">
          <div style="background: #4ade80; color: #14532d; font-weight: 800; font-size: 15px; padding: 10px 14px; border-top-left-radius: 12px; border-top-right-radius: 12px;">
            Details
          </div>
          <div style="border: 1.5px solid var(--border-subtle); border-top: none; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; padding: 16px 14px; display: flex; flex-direction: column; gap: 12px; background: var(--bg-card);">
            <div class="detail-field-row" style="margin-bottom: 8px;"><div class="detail-field-label">Receipt No. :</div><div class="detail-field-value">${d.receiptNo || ''}</div></div>
            <div class="detail-field-row" style="margin-bottom: 8px;"><div class="detail-field-label">Expenses :</div><div class="detail-field-value">${d.detailExpenses || 'CONSULTATION'}</div></div>
            <div class="detail-field-row" style="margin-bottom: 8px;"><div class="detail-field-label">Amount :</div><div class="detail-field-value">${d.detailAmount || '0.00'}</div></div>
            <div class="detail-field-row" style="margin-bottom: 8px;"><div class="detail-field-label">Currency :</div><div class="detail-field-value">${d.detailCurrency || 'RINGGIT MALAYSIA'}</div></div>
            <div class="detail-field-row" style="margin-bottom: 8px;"><div class="detail-field-label">Forex Rate :</div><div class="detail-field-value">${d.detailForexRate || '1.0000'}</div></div>
            <div class="detail-field-row" style="margin-bottom: 8px;"><div class="detail-field-label">Local Amount :</div><div class="detail-field-value" style="font-weight: 800;">${d.detailLocalAmount || (typeof d.amount === 'number' ? d.amount.toFixed(2) : d.amount) || '100.00'}</div></div>
          </div>
        </div>
      `;
    }
  }

  function renderOTClaimDetail(d) {
    const empIdFormatted = d.empNo ? (d.empNo.startsWith('#') ? d.empNo : '#' + d.empNo) : '#EBB12';
    return `
      <div style="display: flex; flex-direction: column; gap: 12px; font-size: 13px;">
        <div class="detail-field-row"><div class="detail-field-label">Document #:</div><div class="detail-field-value">${d.docRef || 'BXT000000000283'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Status:</div><div class="detail-field-value">${d.docStatus || 'Submitted'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Employee:</div><div class="detail-field-value">${empIdFormatted.replace(/^#/, '')} - ${d.userName || 'Farhan binti rahmat'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Claim Period :</div><div class="detail-field-value">${d.period || '2024'}</div></div>

        <div style="border-top: 1px solid var(--border-subtle); margin: 4px 0 8px;"></div>

        <div class="detail-field-row"><div class="detail-field-label">Date*</div><div class="detail-field-value">${d.otDate || d.claimDate || '15/04/2024'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">OT Type*</div><div class="detail-field-value">${d.otType || '1.5 OT'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Start Time*</div><div class="detail-field-value">${d.startTime || '18:57:00'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">End Time*</div><div class="detail-field-value">${d.endTime || '23:57:00'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">OT Hours</div><div class="detail-field-value">${d.otHours !== undefined ? d.otHours : '0'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Cross Day?</div><div class="detail-field-value">${d.crossDay || 'False'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Break Hours*</div><div class="detail-field-value">${d.breakHours || '1 Hour'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Break Minutes*</div><div class="detail-field-value">${d.breakMinutes || '- Select Minute -'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Project</div><div class="detail-field-value">${d.project || '- Select Project -'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Reason*</div><div class="detail-field-value">${d.reason || d.purpose || 'OTHERS'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Meal Allowance Amount</div><div class="detail-field-value">${d.mealAllowanceAmount !== undefined ? d.mealAllowanceAmount : '0'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Meal Allowance</div><div class="detail-field-value">${d.mealAllowance || '- Select Meal Allowance -'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Transport</div><div class="detail-field-value">${d.transport || '- Select Transport -'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Distance</div><div class="detail-field-value">${d.distance !== undefined ? d.distance : '0'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Way</div><div class="detail-field-value">${d.way || '- Select Way -'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Mileage Amount</div><div class="detail-field-value">${d.mileageAmount !== undefined ? d.mileageAmount : '0'}</div></div>

        <div style="margin-top: 4px;">
          <div style="font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Remarks</div>
          <div class="detail-mock-input" style="height: 48px; display: flex; align-items: center;">${d.remarks || 'check again for now'}</div>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
          <button type="button" class="detail-action-btn-purple" onclick="window.ClaimsEngine.closeClaimDetailsModal()">Cancel</button>
        </div>

        <div style="margin-top: 14px;">
          <div style="font-weight: 700; color: var(--text-secondary); margin-bottom: 8px;">Approver Action Comments:</div>
          <input type="text" id="claimDetailApproverComments" class="detail-mock-input" placeholder="" style="height: 40px;">
        </div>

        <div class="pending-action-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 18px;">
          <button type="button" class="action-btn-approve" style="padding: 10px 4px; font-size: 12px;" onclick="window.ClaimsEngine.actionTeamClaimFromModal(${d.id}, 'approve')">
            <i class="fa-solid fa-check" style="font-size: 12px;"></i> Approve
          </button>
          <button type="button" class="action-btn-resubmit" style="padding: 10px 4px; font-size: 12px;" onclick="window.ClaimsEngine.actionTeamClaimFromModal(${d.id}, 'resubmit')">
            <i class="fa-solid fa-rotate-left" style="font-size: 11.5px;"></i> Resubmit
          </button>
          <button type="button" class="action-btn-reject" style="padding: 10px 4px; font-size: 12px;" onclick="window.ClaimsEngine.actionTeamClaimFromModal(${d.id}, 'reject')">
            <i class="fa-solid fa-xmark" style="font-size: 12px;"></i> Reject
          </button>
        </div>
      </div>
    `;
  }

  function renderTravelClaimDetail(d) {
    const amtFormatted = typeof d.amount === 'number' ? `RM ${d.amount.toFixed(2)}` : (d.amount || 'RM 96.00');
    const empIdFormatted = d.empNo ? (d.empNo.startsWith('#') ? d.empNo : '#' + d.empNo) : '#000582';
    return `
      <div style="display: flex; flex-direction: column; gap: 13px; font-size: 13px;">
        <div class="detail-field-row"><div class="detail-field-label">Document Reference:</div><div class="detail-field-value">${d.docRef || 'CTR000000000088'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Document Status:</div><div class="detail-field-value">${d.docStatus || 'Submitted'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Employee:</div><div class="detail-field-value">${empIdFormatted.replace(/^#/, '')} - ${d.userName || 'Daniel Lee'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Claim Period:</div><div class="detail-field-value">${d.period || '202609'}</div></div>

        <div style="border-top: 1px solid var(--border-subtle); margin: 6px 0 10px;"></div>

        <div class="detail-field-row"><div class="detail-field-label">From Date:</div><div class="detail-field-value">${d.claimDate || '13 Sep 2026'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">To Date:</div><div class="detail-field-value">${d.claimDate || '13 Sep 2026'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Travel Type:</div><div class="detail-field-value">${d.travelType || d.benefitType || 'Mileage Claim'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Destination:</div><div class="detail-field-value">${d.destination || 'Penang Logistics Hub & Northern Depot'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Transport Mode:</div><div class="detail-field-value">${d.transportMode || 'Personal Vehicle (Sedan)'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Distance:</div><div class="detail-field-value">${d.distance || '120 km'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Mileage Rate:</div><div class="detail-field-value">${d.mileageRate || 'RM 0.80 / km'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Mileage Amount:</div><div class="detail-field-value">RM ${d.mileageAmount || '96.00'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Toll / Parking:</div><div class="detail-field-value">RM ${d.tollsParking || '24.00'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Total Amount:</div><div class="detail-field-value" style="font-weight: 800; color: var(--purple-primary);">${amtFormatted}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Receipt#:</div><div class="detail-field-value">${d.receipt || 'GPS Log & Toll Receipt'}</div></div>

        <div style="margin-top: 4px;">
          <div style="font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Remarks:</div>
          <div style="color: var(--text-primary); font-weight: 600; line-height: 1.4;">${d.purpose || d.title || 'Site Inspection Travel'}</div>
        </div>

        <div style="margin-top: 18px;">
          <div style="font-weight: 700; color: var(--text-secondary); margin-bottom: 8px;">Approver Action Comments:</div>
          <input type="text" id="claimDetailApproverComments" class="detail-mock-input" placeholder="" style="height: 40px;">
        </div>

        <div class="pending-action-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 18px;">
          <button type="button" class="action-btn-approve" style="padding: 10px 4px; font-size: 12px;" onclick="window.ClaimsEngine.actionTeamClaimFromModal(${d.id}, 'approve')">
            <i class="fa-solid fa-check" style="font-size: 12px;"></i> Approve
          </button>
          <button type="button" class="action-btn-resubmit" style="padding: 10px 4px; font-size: 12px;" onclick="window.ClaimsEngine.actionTeamClaimFromModal(${d.id}, 'resubmit')">
            <i class="fa-solid fa-rotate-left" style="font-size: 11.5px;"></i> Resubmit
          </button>
          <button type="button" class="action-btn-reject" style="padding: 10px 4px; font-size: 12px;" onclick="window.ClaimsEngine.actionTeamClaimFromModal(${d.id}, 'reject')">
            <i class="fa-solid fa-xmark" style="font-size: 12px;"></i> Reject
          </button>
        </div>
      </div>
    `;
  }

  function renderEntertainmentClaimDetail(d) {
    const amtFormatted = typeof d.amount === 'number' ? `RM ${d.amount.toFixed(2)}` : (d.amount || 'RM 320.00');
    const empIdFormatted = d.empNo ? (d.empNo.startsWith('#') ? d.empNo : '#' + d.empNo) : '#001290';
    return `
      <div style="display: flex; flex-direction: column; gap: 13px; font-size: 13px;">
        <div class="detail-field-row"><div class="detail-field-label">Document Reference:</div><div class="detail-field-value">${d.docRef || 'CEN000000000042'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Document Status:</div><div class="detail-field-value">${d.docStatus || 'Submitted'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Employee:</div><div class="detail-field-value">${empIdFormatted.replace(/^#/, '')} - ${d.userName || 'Ahmad Razali'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Claim Period:</div><div class="detail-field-value">${d.period || '202609'}</div></div>

        <div style="border-top: 1px solid var(--border-subtle); margin: 6px 0 10px;"></div>

        <div class="detail-field-row"><div class="detail-field-label">Date:</div><div class="detail-field-value">${d.claimDate || '09 Sep 2026'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Entertainment Type:</div><div class="detail-field-value">${d.subCatName || d.benefitType || 'Client Lunch'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Venue / Restaurant:</div><div class="detail-field-value">${d.venue || 'Nobu Kuala Lumpur'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Client / Attendees:</div><div class="detail-field-value">${d.clientAttendees || 'Mr. Robert Tan (CEO, Alpha Corp) + 2 pax'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Purpose:</div><div class="detail-field-value">${d.purpose || 'Quarterly review lunch with key enterprise stakeholders'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Receipt#:</div><div class="detail-field-value">${d.receipt || 'Nobu Invoice #1029'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Currency:</div><div class="detail-field-value">${d.currency || 'RINGGIT MALAYSIA'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Total Amount:</div><div class="detail-field-value" style="font-weight: 800; color: var(--purple-primary);">${amtFormatted}</div></div>

        <div style="margin-top: 4px;">
          <div style="font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Remarks:</div>
          <div style="color: var(--text-primary); font-weight: 600; line-height: 1.4;">${d.remarks || 'Annual enterprise SLA renewal discussion'}</div>
        </div>

        <div style="margin-top: 18px;">
          <div style="font-weight: 700; color: var(--text-secondary); margin-bottom: 8px;">Approver Action Comments:</div>
          <input type="text" id="claimDetailApproverComments" class="detail-mock-input" placeholder="" style="height: 40px;">
        </div>

        <div class="pending-action-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 18px;">
          <button type="button" class="action-btn-approve" style="padding: 10px 4px; font-size: 12px;" onclick="window.ClaimsEngine.actionTeamClaimFromModal(${d.id}, 'approve')">
            <i class="fa-solid fa-check" style="font-size: 12px;"></i> Approve
          </button>
          <button type="button" class="action-btn-resubmit" style="padding: 10px 4px; font-size: 12px;" onclick="window.ClaimsEngine.actionTeamClaimFromModal(${d.id}, 'resubmit')">
            <i class="fa-solid fa-rotate-left" style="font-size: 11.5px;"></i> Resubmit
          </button>
          <button type="button" class="action-btn-reject" style="padding: 10px 4px; font-size: 12px;" onclick="window.ClaimsEngine.actionTeamClaimFromModal(${d.id}, 'reject')">
            <i class="fa-solid fa-xmark" style="font-size: 12px;"></i> Reject
          </button>
        </div>
      </div>
    `;
  }

  function renderAdvanceClaimDetail(d) {
    const amtFormatted = typeof d.amount === 'number' ? `RM ${d.amount.toFixed(2)}` : (d.amount || 'RM 1,500.00');
    const empIdFormatted = d.empNo ? (d.empNo.startsWith('#') ? d.empNo : '#' + d.empNo) : '#0000101';
    return `
      <div style="display: flex; flex-direction: column; gap: 13px; font-size: 13px;">
        <div class="detail-field-row"><div class="detail-field-label">Document Reference:</div><div class="detail-field-value">${d.docRef || 'CAD000000000019'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Document Status:</div><div class="detail-field-value">${d.docStatus || 'Submitted'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Employee:</div><div class="detail-field-value">${empIdFormatted.replace(/^#/, '')} - ${d.userName || 'Aisha Tan'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Claim Period:</div><div class="detail-field-value">${d.period || '202609'}</div></div>

        <div style="border-top: 1px solid var(--border-subtle); margin: 6px 0 10px;"></div>

        <div class="detail-field-row"><div class="detail-field-label">Advance Type:</div><div class="detail-field-value">${d.advanceType || d.benefitType || 'Overseas Travel Advance'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Required Date:</div><div class="detail-field-value">${d.requiredDate || '24 Sep 2026'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Settlement Date:</div><div class="detail-field-value">${d.settlementDate || '15 Oct 2026'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Purpose / Reason:</div><div class="detail-field-value">${d.purpose || 'Tokyo Design Summit 2026 travel advance'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Other Ref.:</div><div class="detail-field-value">${d.otherRef || 'ADV-2026-0902'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Currency:</div><div class="detail-field-value">${d.currency || 'RINGGIT MALAYSIA'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Requested Amount:</div><div class="detail-field-value" style="font-weight: 800; color: var(--purple-primary);">${amtFormatted}</div></div>

        <div style="margin-top: 4px;">
          <div style="font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Remarks:</div>
          <div style="color: var(--text-primary); font-weight: 600; line-height: 1.4;">${d.remarks || 'Advance requisition for flight and lodging booking'}</div>
        </div>

        <div style="margin-top: 18px;">
          <div style="font-weight: 700; color: var(--text-secondary); margin-bottom: 8px;">Approver Action Comments:</div>
          <input type="text" id="claimDetailApproverComments" class="detail-mock-input" placeholder="" style="height: 40px;">
        </div>

        <div class="pending-action-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 18px;">
          <button type="button" class="action-btn-approve" style="padding: 10px 4px; font-size: 12px;" onclick="window.ClaimsEngine.actionTeamClaimFromModal(${d.id}, 'approve')">
            <i class="fa-solid fa-check" style="font-size: 12px;"></i> Approve
          </button>
          <button type="button" class="action-btn-resubmit" style="padding: 10px 4px; font-size: 12px;" onclick="window.ClaimsEngine.actionTeamClaimFromModal(${d.id}, 'resubmit')">
            <i class="fa-solid fa-rotate-left" style="font-size: 11.5px;"></i> Resubmit
          </button>
          <button type="button" class="action-btn-reject" style="padding: 10px 4px; font-size: 12px;" onclick="window.ClaimsEngine.actionTeamClaimFromModal(${d.id}, 'reject')">
            <i class="fa-solid fa-xmark" style="font-size: 12px;"></i> Reject
          </button>
        </div>
      </div>
    `;
  }

  function renderExpenseClaimDetail(d) {
    const amtFormatted = typeof d.amount === 'number' ? `RM ${d.amount.toFixed(2)}` : (d.amount || 'RM 215.00');
    const empIdFormatted = d.empNo ? (d.empNo.startsWith('#') ? d.empNo : '#' + d.empNo) : '#004177';
    return `
      <div style="display: flex; flex-direction: column; gap: 13px; font-size: 13px;">
        <div class="detail-field-row"><div class="detail-field-label">Document Reference:</div><div class="detail-field-value">${d.docRef || 'CEX000000000057'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Document Status:</div><div class="detail-field-value">${d.docStatus || 'Submitted'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Employee:</div><div class="detail-field-value">${empIdFormatted.replace(/^#/, '')} - ${d.userName || 'Marcus Tan'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Claim Period:</div><div class="detail-field-value">${d.period || '202609'}</div></div>

        <div style="border-top: 1px solid var(--border-subtle); margin: 6px 0 10px;"></div>

        <div class="detail-field-row"><div class="detail-field-label">Expense Category:</div><div class="detail-field-value">${d.expenseType || d.benefitType || 'Subscriptions & Software'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Expense Date:</div><div class="detail-field-value">${d.claimDate || '20 Sep 2026'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Merchant / Supplier:</div><div class="detail-field-value">${d.merchant || 'Digital Tools SaaS Inc.'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Receipt#:</div><div class="detail-field-value">${d.receiptNo || 'INV-29014'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Tax Invoice:</div><div class="detail-field-value">${d.taxInvoice || 'Yes (SST 6%)'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Currency:</div><div class="detail-field-value">${d.currency || 'RINGGIT MALAYSIA'}</div></div>
        <div class="detail-field-row"><div class="detail-field-label">Total Amount:</div><div class="detail-field-value" style="font-weight: 800; color: var(--purple-primary);">${amtFormatted}</div></div>

        <div style="margin-top: 4px;">
          <div style="font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Remarks:</div>
          <div style="color: var(--text-primary); font-weight: 600; line-height: 1.4;">${d.purpose || 'Cloud development tools and sandbox subscriptions'}</div>
        </div>

        <div style="margin-top: 18px;">
          <div style="font-weight: 700; color: var(--text-secondary); margin-bottom: 8px;">Approver Action Comments:</div>
          <input type="text" id="claimDetailApproverComments" class="detail-mock-input" placeholder="" style="height: 40px;">
        </div>

        <div class="pending-action-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 18px;">
          <button type="button" class="action-btn-approve" style="padding: 10px 4px; font-size: 12px;" onclick="window.ClaimsEngine.actionTeamClaimFromModal(${d.id}, 'approve')">
            <i class="fa-solid fa-check" style="font-size: 12px;"></i> Approve
          </button>
          <button type="button" class="action-btn-resubmit" style="padding: 10px 4px; font-size: 12px;" onclick="window.ClaimsEngine.actionTeamClaimFromModal(${d.id}, 'resubmit')">
            <i class="fa-solid fa-rotate-left" style="font-size: 11.5px;"></i> Resubmit
          </button>
          <button type="button" class="action-btn-reject" style="padding: 10px 4px; font-size: 12px;" onclick="window.ClaimsEngine.actionTeamClaimFromModal(${d.id}, 'reject')">
            <i class="fa-solid fa-xmark" style="font-size: 12px;"></i> Reject
          </button>
        </div>
      </div>
    `;
  }

  function triggerClaimViewDetails(itemId) {
    closeClaimThreeDotsMenu();

    if (itemId !== undefined && itemId !== null) {
      const found = teamQueue.find(q => String(q.id) === String(itemId)) ||
                    (window.MOCK_TEAM_APPROVALS || []).find(q => String(q.id) === String(itemId));
      if (found) {
        currentSelectedClaimData = found;
      }
    }

    if (!currentSelectedClaimData) return;
    const data = currentSelectedClaimData;

    const optName = data.optionName || 'Benefit Claim';
    const optLower = optName.toLowerCase();

    // AGENTS.md Header Naming Standard:
    let headerTitleText = 'Benefit Claim Approval';
    if (optLower.includes('medical')) {
      headerTitleText = 'Medical Claim Approval';
    } else if (optLower.includes('ot') || optLower.includes('overtime')) {
      headerTitleText = 'OT Claim Approval';
    } else if (optLower.includes('travel')) {
      headerTitleText = 'Travel Claim Approval';
    } else if (optLower.includes('entertainment')) {
      headerTitleText = 'Entertainment Claim Approval';
    } else if (optLower.includes('advance')) {
      headerTitleText = 'Advance Claim Approval';
    } else if (optLower.includes('expense')) {
      headerTitleText = 'Expense Claim Approval';
    }

    const titleEl = document.getElementById('claimDetailHeaderTitle');
    if (titleEl) titleEl.textContent = headerTitleText;

    const bodyEl = document.getElementById('claimDetailsDynamicBody');
    const medNavEl = document.getElementById('medClaimBottomNavBar');

    if (optLower.includes('medical')) {
      activeMedSubTab = 'general';
      if (medNavEl) medNavEl.style.display = 'flex';
      updateMedSubTabsUI('general');
      if (bodyEl) bodyEl.innerHTML = renderMedicalClaimDetail(data, 'general');
    } else {
      if (medNavEl) medNavEl.style.display = 'none';
      if (bodyEl) {
        if (optLower.includes('benefit')) {
          bodyEl.innerHTML = renderBenefitClaimDetail(data);
        } else if (optLower.includes('ot') || optLower.includes('overtime')) {
          bodyEl.innerHTML = renderOTClaimDetail(data);
        } else if (optLower.includes('travel')) {
          bodyEl.innerHTML = renderTravelClaimDetail(data);
        } else if (optLower.includes('entertainment')) {
          bodyEl.innerHTML = renderEntertainmentClaimDetail(data);
        } else if (optLower.includes('advance')) {
          bodyEl.innerHTML = renderAdvanceClaimDetail(data);
        } else if (optLower.includes('expense')) {
          bodyEl.innerHTML = renderExpenseClaimDetail(data);
        } else {
          bodyEl.innerHTML = renderBenefitClaimDetail(data);
        }
      }
    }

    const overlay = document.getElementById('claimDetailsModalOverlay');
    if (overlay) {
      overlay.style.display = 'flex';
      overlay.style.pointerEvents = 'auto';
      void overlay.offsetWidth;
      overlay.style.opacity = '1';
      overlay.style.transform = 'translateY(0)';
    }
  }

  function updateMedSubTabsUI(tabName) {
    const tabs = [
      { name: 'general', id: 'medSubTabGeneral' },
      { name: 'medical', id: 'medSubTabMedical' },
      { name: 'details', id: 'medSubTabDetails' }
    ];

    tabs.forEach(t => {
      const btn = document.getElementById(t.id);
      if (!btn) return;
      const indicator = btn.querySelector('.tab-indicator');
      if (t.name === tabName) {
        btn.classList.add('active');
        btn.style.color = '#ffffff';
        if (indicator) indicator.style.display = 'block';
      } else {
        btn.classList.remove('active');
        btn.style.color = '#94a3b8';
        if (indicator) indicator.style.display = 'none';
      }
    });
  }

  function switchMedSubTab(tabName) {
    activeMedSubTab = tabName;
    updateMedSubTabsUI(tabName);
    if (!currentSelectedClaimData) return;
    const bodyEl = document.getElementById('claimDetailsDynamicBody');
    if (bodyEl) {
      bodyEl.innerHTML = renderMedicalClaimDetail(currentSelectedClaimData, tabName);
    }
  }

  function closeClaimDetailsModal(event) {
    if (event && event.target && event.target.id !== 'claimDetailsModalOverlay' && !event.target.closest('#claimDetailBackBtn') && !event.target.classList.contains('sheet-close-btn') && !event.target.closest('.sheet-close-btn')) {
      return;
    }
    const overlay = document.getElementById('claimDetailsModalOverlay');
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      overlay.style.transform = 'translateY(16px)';
      setTimeout(() => { overlay.style.display = 'none'; }, 220);
    }
  }

  function actionTeamClaimFromModal(id, action) {
    const item = teamQueue.find(q => q.id === id) || currentSelectedClaimData;
    const userName = item?.userName || 'Employee';
    const amountStr = typeof item?.amount === 'number' ? `RM ${item.amount.toFixed(2)}` : (item?.amount || 'RM 0.00');

    teamQueue = teamQueue.filter(q => q.id !== id);
    renderTeamQueue();
    closeClaimDetailsModal();

    if (action === 'approve') {
      showToast(`✔ Approved ${userName}'s claim of ${amountStr}`);
    } else if (action === 'resubmit') {
      showToast(`ℹ Sent back ${userName}'s claim for resubmission`);
    } else {
      showToast(`✕ Rejected ${userName}'s claim of ${amountStr}`);
    }
  }

  function openDetailMoreMenu() {
    triggerClaimViewWorkflow();
  }

  function triggerClaimViewWorkflow() {
    closeClaimThreeDotsMenu();
    setTimeout(() => {
      const overlay = document.getElementById('claimWorkflowModalOverlay');
      if (overlay) {
        overlay.style.display = 'flex';
        overlay.style.pointerEvents = 'auto';
        void overlay.offsetWidth;
        overlay.style.opacity = '1';
        const sheet = overlay.querySelector('.indicators-sheet');
        if (sheet) sheet.style.transform = 'translateY(0)';
      }
    }, 200);
  }

  function closeClaimWorkflowModal(event) {
    if (event && event.target && event.target.id !== 'claimWorkflowModalOverlay' && !event.target.classList.contains('sheet-close-btn') && !event.target.closest('.sheet-close-btn')) {
      return;
    }
    const overlay = document.getElementById('claimWorkflowModalOverlay');
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      const sheet = overlay.querySelector('.indicators-sheet');
      if (sheet) sheet.style.transform = 'translateY(100%)';
      setTimeout(() => { overlay.style.display = 'none'; }, 250);
    }
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
    const secEl = document.getElementById('teamPendingApprovalSection');
    if (secEl && secEl.style.display === 'block') {
      hideTeamPendingApprovals();
    } else {
      window.history.back();
    }
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
    renderTeamQueue,
    actionTeamClaim,
    approveAllTeamClaims,
    toggleSelectAllTeamClaims,
    openAllClaimOptionsModal,
    closeAllClaimOptionsModal,
    showTeamPendingApprovals,
    hideTeamPendingApprovals,
    switchPendingTab,
    openClaimThreeDotsMenu,
    closeClaimThreeDotsMenu,
    triggerClaimViewDetails,
    closeClaimDetailsModal,
    switchMedSubTab,
    actionTeamClaimFromModal,
    openDetailMoreMenu,
    triggerClaimViewWorkflow,
    closeClaimWorkflowModal,
    handleGlobalBack
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClaimsApp);
  } else {
    initClaimsApp();
  }
  window.addEventListener('load', initClaimsApp);
})();
