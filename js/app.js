/* ========================================================
   PEOPLEHCM MOBILE APP LOGIC & ROUTER
   ======================================================== */

// 1. Central Navigation Route Configuration
// Edit this object to change where any icon or module points!
// Helper: Get Current Theme
function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || localStorage.getItem('peoplehcm_theme') || 'dark';
}

// 1. Central Navigation Route Configuration
// Dynamic routing ensures correct light/dark file is opened based on active theme
const APP_ROUTES = {
  // Navigation & Screen Variants (Resolved dynamically in navTo)
  'home': () => getCurrentTheme() === 'light' ? 'homelight.html' : 'homedark.html',
  'home_v1': () => getCurrentTheme() === 'light' ? 'homelight.html' : 'homedark.html',
  'home_v2': () => getCurrentTheme() === 'light' ? 'applight.html' : 'appdark.html',
  'app': () => getCurrentTheme() === 'light' ? 'applight.html' : 'appdark.html',
  'leave': 'leave.html',
  'team': 'team.html',
  'me': 'me.html',

  // Top Header / Drawer
  'my_profile': 'me.html',
  'settings': '#settings',
  'change_password': '#change-password',
  'help_support': '#help-support',
  'sign_out': 'index.html',

  // V1 Quick Actions
  'apply_leave': 'leave.html',
  'payslip': '#payslip-detail',
  'claim': '#claims-submit',
  'more': () => getCurrentTheme() === 'light' ? 'applight.html' : 'appdark.html',

  // V2 6 Primary Shortcuts
  'attendance': '#attendance-clockin',
  'payslip': '#payslip-detail',
  'claim': '#claims-submit',
  'benefits': '#benefits-portal',
  'documents': '#company-documents',
  'overtime': '#overtime-form',
  'shiftswap': '#shift-swap',
  'taxform': '#tax-ea-form',

  // Explore PeopleHCM Modules
  'time_attendance': '#time-and-attendance',
  'leave_holidays': 'leave.html',
  'claims_expenses': '#claims-and-expenses',
  'payroll_compensation': '#payroll-and-compensation',
  'performance_goals': '#performance-goals',
  'learning_dev': '#learning-development',
  'people_documents': 'team.html',

  // Bottom Navigation
  'calendar': 'calendar.html',
  'nav_home': () => getCurrentTheme() === 'light' ? 'homelight.html' : 'homedark.html',
  'nav_calendar': 'calendar.html',
  'nav_apps': () => getCurrentTheme() === 'light' ? 'applight.html' : 'appdark.html',
  'nav_me': 'me.html'
};

// 2. Safe Navigation Handler
function navTo(routeKey, event) {
  if (event) event.preventDefault();

  let target = APP_ROUTES[routeKey];
  if (typeof target === 'function') {
    target = target();
  }

  if (!target) {
    showToast(`Clicked: ${routeKey}`);
    return;
  }

  // If it's a placeholder hashtag route, show user feedback
  if (target.startsWith('#')) {
    const routeName = routeKey.replace(/_/g, ' ').toUpperCase();
    showToast(`📍 [${routeName}] Ready to connect (${target})`);
  } else {
    window.location.href = target;
  }
}

// 3. Sleek Mobile Toast Notification
let toastTimer = null;
function showToast(message) {
  let toast = document.getElementById('appToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'appToast';
    toast.className = 'app-toast';
    document.querySelector('.phone-container')?.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

// 4. Desktop Top Bar Theme Switcher (Dark / Light)
function setTheme(theme) {
  localStorage.setItem('peoplehcm_theme', theme);
  const currentPath = window.location.pathname.toLowerCase();

  // If currently on paired dark/light pages, navigate to corresponding file
  if (theme === 'light') {
    if (currentPath.includes('appdark.html') || currentPath.includes('app.html') || currentPath.includes('homedark-v2.html') || currentPath.includes('home-v2.html')) {
      window.location.href = 'applight.html';
      return;
    } else if (currentPath.includes('homedark.html') || currentPath.includes('home-v1.html')) {
      window.location.href = 'homelight.html';
      return;
    }
  } else if (theme === 'dark') {
    if (currentPath.includes('applight.html') || currentPath.includes('homelight-v2.html')) {
      window.location.href = 'appdark.html';
      return;
    } else if (currentPath.includes('homelight.html')) {
      window.location.href = 'homedark.html';
      return;
    }
  }

  // For other pages (or in-place switches)
  const html = document.documentElement;
  html.setAttribute('data-theme', theme);

  // Update top switcher bar buttons (Dark Mode / Light Mode only)
  document.querySelectorAll('.theme-btn').forEach(btn => {
    if (btn.getAttribute('data-set-theme') === theme) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function toggleTheme() {
  const current = getCurrentTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
}

function initTheme() {
  const path = window.location.pathname.toLowerCase();
  let defaultTheme = document.documentElement.getAttribute('data-theme') || 'dark';

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('theme')) {
    defaultTheme = urlParams.get('theme');
  } else if (path.includes('light')) {
    defaultTheme = 'light';
  } else if (path.includes('dark')) {
    defaultTheme = 'dark';
  } else {
    defaultTheme = localStorage.getItem('peoplehcm_theme') || defaultTheme;
  }

  document.documentElement.setAttribute('data-theme', defaultTheme);
  document.querySelectorAll('.theme-btn').forEach(btn => {
    if (btn.getAttribute('data-set-theme') === defaultTheme) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// 5. Left Profile Drawer Card Controls
function openProfileDrawer() {
  const overlay = document.getElementById('profileDrawerOverlay');
  if (overlay) overlay.classList.add('active');
}

function closeProfileDrawerDirect() {
  const overlay = document.getElementById('profileDrawerOverlay');
  if (overlay) overlay.classList.remove('active');
}

function closeProfileDrawerModal(e) {
  if (e.target.id === 'profileDrawerOverlay' || e.target.classList.contains('profile-drawer-overlay') || e.target.classList.contains('drawer-overlay')) {
    closeProfileDrawerDirect();
  }
}

function handleSignOut() {
  if (confirm('Are you sure you want to sign out?')) {
    window.location.href = APP_ROUTES.sign_out || 'index.html';
  }
}

// 6. Notification (For You) Bottom Sheet Drawer Controls
function openForYouModal() {
  const overlay = document.getElementById('forYouOverlay');
  if (overlay) overlay.classList.add('active');
}

function closeForYouDirect() {
  const overlay = document.getElementById('forYouOverlay');
  if (overlay) overlay.classList.remove('active');
}

function closeForYouModal(e) {
  if (e.target.id === 'forYouOverlay') closeForYouDirect();
}

function filterForYou(category, btnElement) {
  const tabs = btnElement.parentElement.querySelectorAll('.sheet-filter-pill');
  tabs.forEach(tab => tab.classList.remove('active'));
  btnElement.classList.add('active');

  const cards = document.querySelectorAll('#forYouOverlay .sheet-item-card');
  cards.forEach(card => {
    if (category === 'all' || card.getAttribute('data-fy') === category) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

// 7. V1 Insights Tab Switcher (My vs Team)
function switchInsightTab(tab) {
  const pillMy = document.getElementById('pillMy');
  const pillTeam = document.getElementById('pillTeam');
  const paneMy = document.getElementById('paneMy');
  const paneTeam = document.getElementById('paneTeam');
  const title = document.getElementById('insightCardTitle');

  if (tab === 'my') {
    if (pillMy) pillMy.classList.add('active');
    if (pillTeam) pillTeam.classList.remove('active');
    if (paneMy) paneMy.classList.add('active');
    if (paneTeam) paneTeam.classList.remove('active');
    if (title) title.textContent = 'My Insights';
  } else {
    if (pillTeam) pillTeam.classList.add('active');
    if (pillMy) pillMy.classList.remove('active');
    if (paneTeam) paneTeam.classList.add('active');
    if (paneMy) paneMy.classList.remove('active');
    if (title) title.textContent = 'Team Insights';
  }
}

// 8. V1 Indicators Bottom Sheet Drawer Controls (Team & Individual)
function toggleTeamSection(sectionId) {
  const sec = document.getElementById(sectionId);
  if (sec) {
    sec.classList.toggle('collapsed');
  }
}

function openIndicatorsModal(scope = null, instant = false) {
  // If scope not provided, detect from active tab on the home screen
  if (!scope) {
    const isTeam = document.getElementById('paneTeam')?.classList.contains('active');
    scope = isTeam ? 'team' : 'my';
  }

  const titleEl = document.getElementById('indicatorsSheetTitle');
  const subEl = document.getElementById('indicatorsSheetSubtitle');
  const myFeed = document.getElementById('myIndicatorsFeed');
  const teamFeed = document.getElementById('teamIndicatorsFeed');

  if (scope === 'team') {
    if (titleEl) titleEl.innerText = 'Team Indicator';
    if (subEl) subEl.innerText = 'Department Aggregated Metrics (12) • Breakdown';
    if (myFeed) myFeed.style.display = 'none';
    if (teamFeed) teamFeed.style.display = 'block';
    const cAll = document.getElementById('indicatorCountAll');
    const cPos = document.getElementById('indicatorCountPos');
    const cNeg = document.getElementById('indicatorCountNeg');
    if (cAll) cAll.innerText = '12';
    if (cPos) cPos.innerText = '3';
    if (cNeg) cNeg.innerText = '9';
  } else {
    if (titleEl) titleEl.innerText = 'My Indicators';
    if (subEl) subEl.innerText = 'Personal Work & HR Metrics (14) • Breakdown';
    if (myFeed) myFeed.style.display = 'block';
    if (teamFeed) teamFeed.style.display = 'none';
    const cAll = document.getElementById('indicatorCountAll');
    const cPos = document.getElementById('indicatorCountPos');
    const cNeg = document.getElementById('indicatorCountNeg');
    if (cAll) cAll.innerText = '14';
    if (cPos) cPos.innerText = '4';
    if (cNeg) cNeg.innerText = '10';
  }

  // Reset filter pills to All
  const filterPills = document.querySelectorAll('.sheet-filter-bar .sheet-filter-pill');
  filterPills.forEach((p, idx) => {
    if (idx === 0) p.classList.add('active');
    else p.classList.remove('active');
  });

  const activeContainer = scope === 'team' ? teamFeed : myFeed;
  if (activeContainer) {
    activeContainer.querySelectorAll('.metric-feed-card, .feed-section-label').forEach(el => {
      el.style.display = 'flex';
    });
  }

  const overlay = document.getElementById('indicatorsOverlay');
  if (overlay) {
    if (instant) {
      overlay.classList.add('instant');
      setTimeout(() => overlay.classList.remove('instant'), 300);
    }
    overlay.classList.add('active');
  }
}

function closeIndicatorsDirect() {
  const overlay = document.getElementById('indicatorsOverlay');
  if (overlay) overlay.classList.remove('active');
}

function closeIndicatorsModal(e) {
  if (e.target.id === 'indicatorsOverlay') closeIndicatorsDirect();
}

function filterDrawerIndicators(group, btnElement) {
  const tabs = btnElement.parentElement.querySelectorAll('.sheet-filter-pill');
  tabs.forEach(tab => tab.classList.remove('active'));
  btnElement.classList.add('active');

  const teamFeed = document.getElementById('teamIndicatorsFeed');
  const myFeed = document.getElementById('myIndicatorsFeed');
  const activeFeed = (teamFeed && teamFeed.style.display !== 'none') ? teamFeed : myFeed;
  if (!activeFeed) return;

  const cards = activeFeed.querySelectorAll('.metric-feed-card');
  cards.forEach(card => {
    if (group === 'all' || card.getAttribute('data-group') === group) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });

  const sectionLabels = activeFeed.querySelectorAll('.feed-section-label');
  sectionLabels.forEach(lbl => {
    if (group === 'all' || lbl.getAttribute('data-group') === group) {
      lbl.style.display = 'flex';
    } else {
      lbl.style.display = 'none';
    }
  });
}

// 9. V1 Company Updates Bottom Sheet Drawer Controls
function openUpdatesModal() {
  const overlay = document.getElementById('updatesOverlay');
  if (overlay) overlay.classList.add('active');
}

function closeUpdatesDirect() {
  const overlay = document.getElementById('updatesOverlay');
  if (overlay) overlay.classList.remove('active');
}

function closeUpdatesModal(e) {
  if (e.target.id === 'updatesOverlay') closeUpdatesDirect();
}

function filterUpdates(category, btnElement) {
  const tabs = btnElement.parentElement.querySelectorAll('.sheet-filter-pill');
  tabs.forEach(tab => tab.classList.remove('active'));
  btnElement.classList.add('active');

  const cards = document.querySelectorAll('#updatesOverlay .sheet-item-card');
  cards.forEach(card => {
    if (category === 'all' || card.getAttribute('data-update') === category) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

function openNewsDetail(cardEl, title) {
  if (cardEl) {
    const badge = cardEl.querySelector('.sheet-tag-badge');
    if (badge && badge.classList.contains('red')) {
      badge.classList.remove('red');
      badge.classList.add('green');
      badge.textContent = 'News';
      showToast(`Marked as read: ${title || 'News'}`);
      return;
    }
  }
  showToast(`Opening: ${title || 'News'}`);
}

// 10. Policy & SOP Detail Data & Controller
const POLICY_DATABASE = {
  'DE001': {
    ref: 'DE001',
    title: 'PeopleTime User Guide v2',
    dept: 'ADMINISTRATION',
    policy: {
      name: 'PeopleTime_UserGuide_v2.pdf',
      size: '3.91 MB',
      date: '20/12/2024',
      type: 'PDF Document'
    },
    sop: null,
    guideline: null
  },
  'HR004': {
    ref: 'HR004',
    title: 'Hybrid & Remote Work Policy 2026',
    dept: 'ALL DEPARTMENTS',
    policy: {
      name: 'Remote_Work_Framework_2026.pdf',
      size: '1.45 MB',
      date: '15/01/2026',
      type: 'PDF Document'
    },
    sop: {
      name: 'SOP_WFH_Application_Approval.pdf',
      size: '820 KB',
      date: '18/01/2026',
      type: 'PDF Document'
    },
    guideline: null
  },
  'FN012': {
    ref: 'FN012',
    title: 'Medical & Travel Claims SOP',
    dept: 'FINANCE & ACCOUNTING',
    policy: {
      name: 'Staff_Expense_Reimbursement_Policy.pdf',
      size: '2.10 MB',
      date: '01/02/2026',
      type: 'PDF Document'
    },
    sop: {
      name: 'SOP_Overseas_Travel_Claims_v3.pdf',
      size: '1.15 MB',
      date: '05/02/2026',
      type: 'PDF Document'
    },
    guideline: {
      name: 'Mileage_Per_Diem_Rate_Card.pdf',
      size: '450 KB',
      date: '05/02/2026',
      type: 'PDF Document'
    }
  }
};

function renderFileRow(fileObj, typeName) {
  if (!fileObj) {
    return `<div class="doc-file-empty-text">No ${typeName} document uploaded (N/A)</div>`;
  }
  return `
    <div class="doc-file-icon pdf">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
      </svg>
    </div>
    <div class="doc-file-info" onclick="previewPolicyDoc('${fileObj.name}')" style="cursor: pointer;">
      <div class="doc-file-name">${fileObj.name}</div>
      <div class="doc-file-meta">${fileObj.size} • ${fileObj.type || 'PDF Document'}</div>
    </div>
    <button class="doc-view-btn" onclick="previewPolicyDoc('${fileObj.name}')" title="View Document" aria-label="View Document">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    </button>
  `;
}

function openPolicyDetail(refId) {
  const item = POLICY_DATABASE[refId] || POLICY_DATABASE['DE001'];
  
  const refBadge = document.getElementById('policyRefBadge');
  const titleEl = document.getElementById('policyDetailTitle');
  const deptText = document.getElementById('policyDeptText');
  const policyDate = document.getElementById('policyDatePill');
  const policyFileRow = document.getElementById('policyFileRow');
  const sopDate = document.getElementById('sopDatePill');
  const sopFileRow = document.getElementById('sopFileRow');
  const guidelineDate = document.getElementById('guidelineDatePill');
  const guidelineFileRow = document.getElementById('guidelineFileRow');

  if (refBadge) refBadge.innerText = 'REF: ' + item.ref;
  if (titleEl) titleEl.innerText = item.title;
  if (deptText) deptText.innerText = 'Attention to: ' + item.dept;

  if (policyDate) policyDate.innerText = 'Effective: ' + (item.policy ? item.policy.date : 'N/A');
  if (policyFileRow) policyFileRow.innerHTML = renderFileRow(item.policy, 'Policy');

  if (sopDate) sopDate.innerText = 'Effective: ' + (item.sop ? item.sop.date : 'N/A');
  if (sopFileRow) sopFileRow.innerHTML = renderFileRow(item.sop, 'SOP');

  if (guidelineDate) guidelineDate.innerText = 'Effective: ' + (item.guideline ? item.guideline.date : 'N/A');
  if (guidelineFileRow) guidelineFileRow.innerHTML = renderFileRow(item.guideline, 'Guideline');

  const overlay = document.getElementById('policyDetailOverlay');
  if (overlay) overlay.classList.add('active');
}

function closePolicyDetailDirect() {
  const overlay = document.getElementById('policyDetailOverlay');
  if (overlay) overlay.classList.remove('active');
}

function closePolicyDetailModal(e) {
  if (e.target.id === 'policyDetailOverlay') closePolicyDetailDirect();
}

function previewPolicyDoc(fileName) {
  showToast(`📄 Viewing ${fileName}`);
}

// Auto-run on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('drawer') === 'open' || urlParams.get('openDrawer') === 'true') {
    setTimeout(openProfileDrawer, 100);
  }
  if (urlParams.get('updates') === 'open' || urlParams.get('openUpdates') === 'true') {
    setTimeout(openUpdatesModal, 100);
  }
  if (urlParams.get('tab') === 'team') {
    switchInsightTab('team');
  }
  if (urlParams.get('policy')) {
    setTimeout(() => openPolicyDetail(urlParams.get('policy')), 150);
  }
  if (urlParams.get('indicators') === 'team') {
    setTimeout(() => openIndicatorsModal('team', true), 50);
  } else if (urlParams.get('indicators') === 'open' || urlParams.get('indicators') === 'my') {
    setTimeout(() => openIndicatorsModal('my', true), 50);
  }
  if (urlParams.get('tab')) {
    const t = urlParams.get('tab');
    const btn = document.querySelector(`.me-tab-pill[data-tab="${t}"]`);
    if (btn) switchMeTab(t, btn);
  }
});

// 11. Me Profile Page Logic
function switchMeTab(tabId, btnEl) {
  const allBtns = document.querySelectorAll('.me-tab-pill');
  allBtns.forEach(btn => btn.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  const allPanes = document.querySelectorAll('.me-tab-pane');
  allPanes.forEach(pane => pane.classList.remove('active'));
  const targetPane = document.getElementById('mePane_' + tabId);
  if (targetPane) {
    targetPane.classList.add('active');
  }
}

function toggleAccountMask(btnEl) {
  const accountSpan = document.getElementById('cimbAccountVal');
  if (!accountSpan) return;
  const isMasked = accountSpan.getAttribute('data-masked') === 'true';
  if (isMasked) {
    accountSpan.textContent = accountSpan.getAttribute('data-raw');
    accountSpan.setAttribute('data-masked', 'false');
    if (btnEl) btnEl.textContent = '🔒 Hide';
  } else {
    accountSpan.textContent = '•••• •••• ' + accountSpan.getAttribute('data-raw').slice(-4);
    accountSpan.setAttribute('data-masked', 'true');
    if (btnEl) btnEl.textContent = '👁️ Show';
  }
}

function copyText(text, label) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  }
  showToast(`Copied ${label || 'text'} to clipboard!`);
}

function searchTrainingCourses(query) {
  const q = (query || '').toLowerCase().trim();
  const rows = document.querySelectorAll('.training-row-card');
  let matchCount = 0;
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    if (!q || text.includes(q)) {
      row.style.display = 'flex';
      matchCount++;
    } else {
      row.style.display = 'none';
    }
  });
  const countBadge = document.getElementById('trainingCountBadge');
  if (countBadge) {
    countBadge.textContent = q ? `${matchCount} / 33` : '33';
  }
}

function filterLetters(category, btnEl) {
  const tabs = document.querySelectorAll('.letter-filter-pill');
  tabs.forEach(t => t.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  const rows = document.querySelectorAll('.hr-letter-row');
  let visibleCount = 0;
  rows.forEach(row => {
    const status = row.getAttribute('data-status');
    const type = row.getAttribute('data-type');
    let match = false;
    if (category === 'all') match = true;
    else if (category === 'pending' && status === 'pending') match = true;
    else if (category === 'signed' && status === 'signed') match = true;
    else if (category === type) match = true;

    if (match) {
      row.style.display = 'flex';
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  });
  const countBadge = document.getElementById('lettersCountBadge');
  if (countBadge) {
    countBadge.textContent = category === 'all' ? '31' : `${visibleCount} / 31`;
  }
}

function previewLetterDoc(letterName) {
  showToast(`📄 Document: ${letterName}`);
}

function signLetterAction(letterName) {
  showToast(`✍️ Opening digital signing pad for ${letterName}`);
}

