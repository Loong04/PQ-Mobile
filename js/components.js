/* ========================================================
   PEOPLEHCM REUSABLE WEB COMPONENTS LIBRARY
   Zero build tool required. 100% offline & file:// compatible.
   ======================================================== */

// 1. Desktop Preview Top Bar Component (Only Dark Mode & Light Mode buttons outside the phone)
class PreviewTopBar extends HTMLElement {
  connectedCallback() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    this.innerHTML = `
      <div class="theme-switch-bar">
        <button class="mode-btn theme-btn ${currentTheme === 'dark' ? 'active' : ''}" data-set-theme="dark" onclick="setTheme('dark')">🌙 Dark Mode</button>
        <button class="mode-btn theme-btn ${currentTheme === 'light' ? 'active' : ''}" data-set-theme="light" onclick="setTheme('light')">☀️ Light Mode</button>
      </div>
    `;
  }
}
customElements.define('preview-top-bar', PreviewTopBar);

// 2. Phone Status Bar Component
class PhoneStatusBar extends HTMLElement {
  connectedCallback() {
    const time = this.getAttribute('time') || '9:41';
    this.innerHTML = `
      <div class="status-bar">
        <span>${time}</span>
        <div class="status-icons">
          <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
            <path d="M1 10h2v2H1v-2zm4-3h2v5H5V7zm4-4h2v9H9V3zm4-3h2v12h-2V0z" />
          </svg>
          <svg width="15" height="12" viewBox="0 0 15 12" fill="currentColor">
            <path d="M7.5 3C9.7 3 11.6 3.9 13 5.3L14.4 3.9C12.6 2.1 10.2 1 7.5 1S2.4 2.1.6 3.9L2 5.3C3.4 3.9 5.3 3 7.5 3zm0 4c1.4 0 2.6.6 3.5 1.5L12.4 7C11.1 5.7 9.4 5 7.5 5S3.9 5.7 2.6 7l1.4 1.5C4.9 7.6 6.1 7 7.5 7zm0 4c.8 0 1.5.3 2.1.9L10.7 11C9.9 10.1 8.8 9.5 7.5 9.5s-2.4.6-3.2 1.5l1.1.9c.6-.6 1.3-.9 2.1-.9z" />
          </svg>
          <svg width="22" height="11" viewBox="0 0 24 12" fill="currentColor">
            <rect x="1" y="1" width="19" height="10" rx="3" fill="none" stroke="currentColor" stroke-width="1.5" />
            <rect x="3" y="3" width="13" height="6" rx="1.5" fill="currentColor" />
            <path d="M22 4.5v3a1.5 1.5 0 000-3z" fill="currentColor" />
          </svg>
        </div>
      </div>
    `;
  }
}
customElements.define('phone-status-bar', PhoneStatusBar);

// 3. Hero Background Component (Deep Purple Glowing Constellation)
class PhoneHeroBg extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="hero-bg">
        <svg viewBox="0 0 420 520" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#c084fc" stop-opacity="0.35" />
              <stop offset="50%" stop-color="#a855f7" stop-opacity="0.5" />
              <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.3" />
            </linearGradient>
            <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path d="M-30 110 Q 90 60 210 120 T 440 90" stroke="url(#waveGrad)" stroke-width="1.8" />
          <path d="M-10 160 Q 140 100 270 150 T 450 130" stroke="rgba(192, 132, 252, 0.4)" stroke-width="1.4" />
          <path d="M120 -10 Q 250 50 350 140 T 450 190" stroke="rgba(168, 85, 247, 0.25)" stroke-width="1.2" stroke-dasharray="3 3" />

          <line x1="250" y1="75" x2="330" y2="100" stroke="rgba(192, 132, 252, 0.45)" stroke-width="1.2" />
          <line x1="330" y1="100" x2="390" y2="140" stroke="rgba(192, 132, 252, 0.45)" stroke-width="1.2" />
          <line x1="250" y1="75" x2="280" y2="140" stroke="rgba(192, 132, 252, 0.35)" stroke-width="1" />
          <line x1="280" y1="140" x2="350" y2="160" stroke="rgba(192, 132, 252, 0.4)" stroke-width="1.2" />

          <circle cx="250" cy="75" r="7" fill="rgba(192, 132, 252, 0.3)" filter="url(#neonGlow)" />
          <circle cx="250" cy="75" r="3.5" fill="#e9d5ff" />
          <circle cx="330" cy="100" r="9" fill="rgba(192, 132, 252, 0.35)" filter="url(#neonGlow)" />
          <circle cx="330" cy="100" r="4.5" fill="#f5f3ff" />
          <circle cx="280" cy="140" r="6" fill="rgba(192, 132, 252, 0.25)" filter="url(#neonGlow)" />
          <circle cx="280" cy="140" r="3" fill="#c084fc" />
          <circle cx="350" cy="160" r="8" fill="rgba(56, 189, 248, 0.3)" filter="url(#neonGlow)" />
          <circle cx="350" cy="160" r="4" fill="#bae6fd" />
        </svg>
      </div>
    `;
  }
}
customElements.define('phone-hero-bg', PhoneHeroBg);

// 4. App Header with Burger Menu, Logo, and Profile Avatar (No in-phone theme button)
class AppHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="app-header">
        <div class="header-left">
          <!-- Burger Menu Button (Opens Left Profile & Nav Drawer) -->
          <button class="burger-btn" onclick="openProfileDrawer()" aria-label="Open Navigation Menu" title="Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>
          </button>

          <!-- Brand Logo -->
          <div class="logo-container">
            <svg class="logo-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="12" r="4.5" stroke="#ffffff" stroke-width="2.5" />
              <circle cx="22" cy="12" r="4.5" stroke="#ffffff" stroke-width="2.5" />
              <circle cx="10" cy="22" r="4.5" stroke="#c084fc" stroke-width="2.5" />
              <path d="M10 16.5V17.5M14.5 12H17.5" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />
            </svg>
            <div class="logo-text">
              <h1>PeopleHCM</h1>
              <span>by PeopleQuest</span>
            </div>
          </div>
        </div>

        <div class="header-actions">
          <!-- User Profile Avatar -->
          <div class="profile-wrap" title="Sarah Jenkins" onclick="openProfileDrawer()" style="cursor: pointer;">
            <img class="profile-img"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Sarah">
          </div>
        </div>
      </div>
    `;
  }
}
customElements.define('app-header', AppHeader);

// 5. Left Profile Drawer Card Component (Slide-in Menu without inside theme button)
class LeftProfileDrawer extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="profile-drawer-overlay drawer-overlay" id="profileDrawerOverlay" onclick="closeProfileDrawerModal(event)">
        <div class="profile-drawer-card drawer-card" onclick="event.stopPropagation()">
          <div class="profile-drawer-top">
            <span class="drawer-pill-tag">PEOPLEHCM MENU</span>
            <button class="drawer-close-btn" onclick="closeProfileDrawerDirect()" aria-label="Close menu">✕</button>
          </div>

          <div class="drawer-user-box">
            <div class="drawer-avatar-wrap">
              <img class="drawer-avatar-img"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                alt="Sarah Jenkins">
              <div class="drawer-avatar-badge"></div>
            </div>
            <div class="drawer-user-info">
              <div class="drawer-user-name">Sarah Jenkins</div>
              <div class="drawer-user-role">Senior Product Designer</div>
              <div class="drawer-user-email">sarah.j@peoplequest.com</div>
            </div>
          </div>

          <div class="drawer-badge-row">
            <span class="drawer-dept-badge">Product & Design</span>
            <span class="drawer-id-badge">ID: PQ-8042</span>
          </div>

          <div class="drawer-divider"></div>

          <div class="drawer-nav-list">
            <!-- 1. Home -->
            <a class="drawer-menu-item ${window.location.pathname.includes('homedark.html') || window.location.pathname.includes('homelight.html') || window.location.pathname.includes('home-v1') ? 'active' : ''}" href="javascript:void(0)" onclick="navTo('home', event); closeProfileDrawerDirect();">
              <div class="drawer-menu-icon" style="background: rgba(168, 85, 247, 0.16); color: #c084fc;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <div class="drawer-menu-text">
                <div class="drawer-menu-label">Home</div>
                <div class="drawer-menu-desc">Main dashboard screen</div>
              </div>
              <span class="drawer-menu-arrow">›</span>
            </a>

            <!-- 2. Settings -->
            <a class="drawer-menu-item" href="javascript:void(0)" onclick="navTo('settings', event); closeProfileDrawerDirect();">
              <div class="drawer-menu-icon" style="background: rgba(148, 163, 184, 0.16); color: #94a3b8;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </div>
              <div class="drawer-menu-text">
                <div class="drawer-menu-label">Settings</div>
                <div class="drawer-menu-desc">Preferences & notifications</div>
              </div>
              <span class="drawer-menu-arrow">›</span>
            </a>

            <!-- 3. Change Password -->
            <a class="drawer-menu-item" href="javascript:void(0)" onclick="navTo('change_password', event); closeProfileDrawerDirect();">
              <div class="drawer-menu-icon" style="background: rgba(148, 163, 184, 0.16); color: #94a3b8;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <div class="drawer-menu-text">
                <div class="drawer-menu-label">Change Password</div>
                <div class="drawer-menu-desc">Security & 2FA</div>
              </div>
              <span class="drawer-menu-arrow">›</span>
            </a>

            <!-- 4. Sign Out -->
            <a class="drawer-menu-item" href="javascript:void(0)" onclick="handleSignOut(); closeProfileDrawerDirect();">
              <div class="drawer-menu-icon" style="background: rgba(244, 63, 94, 0.16); color: #f43f5e;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </div>
              <div class="drawer-menu-text">
                <div class="drawer-menu-label" style="color: #f43f5e;">Sign Out</div>
                <div class="drawer-menu-desc">Log out of account</div>
              </div>
              <span class="drawer-menu-arrow" style="color: #f43f5e;">›</span>
            </a>
          </div>

          <div class="drawer-footer" style="padding-top: 18px;">
            <span style="display: block; font-size: 9.5px; color: var(--text-caption); text-align: center;">PEOPLEHCM V2.4 • PEOPLEQUEST</span>
          </div>
        </div>
      </div>
    `;
  }
}
customElements.define('left-profile-drawer', LeftProfileDrawer);

// 6. Notification "For You" Bottom Sheet Component
class NotificationSheet extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="indicators-overlay" id="forYouOverlay" onclick="closeForYouModal(event)">
        <div class="indicators-sheet" onclick="event.stopPropagation()">
          <div class="sheet-handle"></div>

          <div class="sheet-header">
            <div class="sheet-title">
              <h3>For You (7)</h3>
              <p>Action Items & Reminders</p>
            </div>
            <button class="sheet-close-btn" onclick="closeForYouDirect()" aria-label="Close">✕</button>
          </div>

          <!-- 3 Tabs: All, Pending Approval, Pending Resubmit -->
          <div class="sheet-filter-bar">
            <button class="sheet-filter-pill active" onclick="filterForYouTab('all', this)">
              <span>All (7)</span>
            </button>
            <button class="sheet-filter-pill" onclick="filterForYouTab('pending_approval', this)">
              <span>Pending Approval</span>
              <span class="sheet-tag-badge red" id="badgePendingApprovalCount">4</span>
            </button>
            <button class="sheet-filter-pill" onclick="filterForYouTab('pending_resubmit', this)">
              <span>Pending Resubmit</span>
              <span class="sheet-tag-badge amber" id="badgePendingResubmitCount">3</span>
            </button>
          </div>

          <!-- Custom Floating Rounded Dropdown Filter -->
          <div class="custom-dropdown-container">
            <button class="sheet-doctype-bar-row" onclick="toggleDocTypeDropdown(event)" type="button" aria-label="Select Document Type">
              <div class="doctype-bar-left" style="flex: 1; min-width: 0;">
                <div class="doctype-icon-box">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                </div>
                <div id="selectedDocTypeLabel">
                  <span class="doctype-placeholder">Document Type Filter</span>
                </div>
              </div>
              <div class="doctype-select-arrow">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </button>

            <!-- Multi-Select Rounded Popup Menu (border-radius: 18px) -->
            <div class="custom-dropdown-menu multi-select" id="docTypeDropdownMenu">
              <div class="dropdown-item active" data-value="all" onclick="toggleMultiSelectDocType('all', this, event)">
                <div class="chk-box-wrap">
                  <input type="checkbox" checked id="chk-all">
                  <span>All Document Types</span>
                </div>
              </div>
              <div class="dropdown-item" data-value="Leave Request" onclick="toggleMultiSelectDocType('Leave Request', this, event)">
                <div class="chk-box-wrap">
                  <input type="checkbox" id="chk-leave">
                  <span>Leave Request</span>
                </div>
              </div>
              <div class="dropdown-item" data-value="Medical Claim" onclick="toggleMultiSelectDocType('Medical Claim', this, event)">
                <div class="chk-box-wrap">
                  <input type="checkbox" id="chk-claim">
                  <span>Medical Claim</span>
                </div>
              </div>
              <div class="dropdown-item" data-value="Overtime" onclick="toggleMultiSelectDocType('Overtime', this, event)">
                <div class="chk-box-wrap">
                  <input type="checkbox" id="chk-ot">
                  <span>Overtime</span>
                </div>
              </div>
              <div class="dropdown-item" data-value="Change Request" onclick="toggleMultiSelectDocType('Change Request', this, event)">
                <div class="chk-box-wrap">
                  <input type="checkbox" id="chk-change">
                  <span>Change Request</span>
                </div>
              </div>
              <div class="dropdown-item" data-value="Tax EA Form" onclick="toggleMultiSelectDocType('Tax EA Form', this, event)">
                <div class="chk-box-wrap">
                  <input type="checkbox" id="chk-tax">
                  <span>Tax EA Form</span>
                </div>
              </div>
              <div class="dropdown-item" data-value="Performance Goal" onclick="toggleMultiSelectDocType('Performance Goal', this, event)">
                <div class="chk-box-wrap">
                  <input type="checkbox" id="chk-kpi">
                  <span>Performance Goal</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Active Selected Filter Pills (Horizontal Scroll Row) -->
          <div class="active-filter-pills-row" id="activeFilterPillsRow" style="display: none;"></div>

          <div class="sheet-list-scroll" id="forYouListScroll">
            <!-- Grouped by File Type Accordions -->
            <div id="forYouGroupedContainer">
              <!-- Dynamically populated via renderNotificationGroupedUI() -->
            </div>

            <!-- Empty State when filtered results are 0 -->
            <div id="forYouEmptyState" style="display: none; text-align: center; padding: 36px 12px; color: var(--text-muted); font-size: 12.5px; font-weight: 600;">
              <div style="font-size: 26px; margin-bottom: 6px;">🔍</div>
              No notifications match your selected filter.
            </div>
          </div>
        </div>
      </div>
      
      <!-- Integrated Approval Details Modal Sheet -->
      <approval-detail-sheet></approval-detail-sheet>
    `;
  }
}
customElements.define('notification-sheet', NotificationSheet);

// 6.5 Approval Detail Sheet Web Component
class ApprovalDetailSheet extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="approval-detail-overlay" id="approvalDetailOverlay" onclick="closeApprovalDetailDirect(event)">
        <div class="approval-detail-sheet" onclick="event.stopPropagation()">
          <div class="sheet-handle"></div>

          <div class="sheet-header" style="margin-bottom: 12px;">
            <div class="sheet-title">
              <h3 id="approvalModalTitle">Approval Request Details</h3>
              <p id="approvalModalSubTitle">Review details & take action</p>
            </div>
            <button class="sheet-close-btn" onclick="closeApprovalDetailDirect()" aria-label="Close">✕</button>
          </div>

          <!-- Applicant Card -->
          <div class="approval-applicant-card" id="approvalApplicantCard">
            <!-- Populated via JS -->
          </div>

          <!-- Details Grid -->
          <div class="approval-meta-grid" id="approvalMetaGrid">
            <!-- Populated via JS -->
          </div>

          <!-- Action Buttons Bar -->
          <div class="approval-action-bar" id="approvalActionBar">
            <button class="btn-reject" onclick="actionRejectRequest()">
              <span>❌ Reject / Request Info</span>
            </button>
            <button class="btn-approve" onclick="actionApproveRequest()">
              <span>✅ Approve Request</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
customElements.define('approval-detail-sheet', ApprovalDetailSheet);

// 7. Phone Bottom Navigation Bar Component
class PhoneBottomNav extends HTMLElement {
  connectedCallback() {
    const active = this.getAttribute('active') || 'home';
    this.innerHTML = `
      <div class="bottom-nav">
        <!-- 1. Home -->
        <a class="nav-item ${active === 'home' ? 'active' : ''}" href="javascript:void(0)" onclick="navTo('home', event)">
          <div class="nav-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <span>Home</span>
        </a>

        <!-- 2. Notification -->
        <a class="nav-item ${active === 'notifications' || active === 'notification' ? 'active' : ''}" href="javascript:void(0)" onclick="openForYouModal()">
          <div class="nav-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <div class="nav-badge-red">2</div>
          </div>
          <span>Notification</span>
        </a>

        <!-- 3. Center Apps 4-Dots FAB (The App Icon!) -->
        <button class="fab-btn ${active === 'apps' ? 'active' : ''}" aria-label="App Shortcuts" onclick="navTo('nav_apps', event)" title="App Shortcuts">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="6.5" height="6.5" rx="2" fill="#ffffff" />
            <rect x="13.5" y="4" width="6.5" height="6.5" rx="2" fill="#ffffff" />
            <rect x="4" y="13.5" width="6.5" height="6.5" rx="2" fill="#ffffff" />
            <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2" fill="#ffffff" />
          </svg>
        </button>

        <!-- 4. Favourite -->
        <a class="nav-item ${active === 'favourite' || active === 'fav' ? 'active' : ''}" href="javascript:void(0)" onclick="openFavouriteModal(event)">
          <div class="nav-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
          <span>Favourite</span>
        </a>

        <!-- 5. Me -->
        <a class="nav-item ${active === 'me' || active === 'more' ? 'active' : ''}" href="javascript:void(0)" onclick="navTo('me', event)">
          <div class="nav-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <span>Me</span>
        </a>

        <!-- Home Indicator Bar -->
        <div class="home-bar"></div>
      </div>
    `;
  }
}
customElements.define('phone-bottom-nav', PhoneBottomNav);

// 8. Instant Favourite Bottom Sheet Component
class FavouriteSheet extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="fav-sheet-overlay" id="favSheetOverlay" onclick="closeFavSheet(event)">
        <div class="fav-sheet-content" onclick="event.stopPropagation()">
          <div class="sheet-handle"></div>

          <div class="fav-sheet-header">
            <div>
              <h3 style="font-size: 17px; font-weight: 800; color: var(--text-primary); margin: 0;">⭐ My Favourites</h3>
              <p style="font-size: 11.5px; color: var(--text-muted); margin: 2px 0 0 0;" id="favSheetSubtitle">Quick Access Shortcuts</p>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="fav-edit-btn" id="favEditToggleBtn" onclick="toggleFavEditMode()">✏️ Customize</button>
              <button class="sheet-close-btn" onclick="closeFavSheetDirect()" aria-label="Close">✕</button>
            </div>
          </div>

          <!-- Mode 1: Quick Favourites Grid View (Default) -->
          <div class="fav-grid-view" id="favGridView">
            <!-- Dynamically populated via JS -->
          </div>

          <!-- Mode 2: Customize Catalog List View (Hidden by default) -->
          <div id="favEditView" style="display: none; flex-direction: column; gap: 8px; max-height: 340px; overflow-y: auto; padding-right: 4px;">
            <!-- Catalog with Star Toggles -->
          </div>
        </div>
      </div>
    `;
  }
}
customElements.define('favourite-sheet', FavouriteSheet);

// 8. Indicators Bottom Sheet Component (Team & Individual Indicators)
// 8. Indicators Bottom Sheet Component (Team & Individual Indicators - Card Design)
class IndicatorsSheet extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="indicators-overlay" id="indicatorsOverlay" onclick="closeIndicatorsModal(event)">
        <div class="indicators-sheet" onclick="event.stopPropagation()">
          <div class="sheet-handle"></div>

          <div class="sheet-header">
            <div class="sheet-title">
              <h3 id="indicatorsSheetTitle">Team Indicator</h3>
              <p id="indicatorsSheetSubtitle">Department Aggregated Metrics (12) • Breakdown</p>
            </div>
            <button class="sheet-close-btn" onclick="closeIndicatorsDirect()" aria-label="Close">✕</button>
          </div>

          <!-- Segmented Filter Control (No scope bar, directly filter cards) -->
          <div class="sheet-filter-bar">
            <button class="sheet-filter-pill active" onclick="filterDrawerIndicators('all', this)">
              <span>All</span>
              <span class="sheet-tag-badge neutral" id="indicatorCountAll">12</span>
            </button>
            <button class="sheet-filter-pill" onclick="filterDrawerIndicators('positive', this)">
              <span>Positive</span>
              <span class="sheet-tag-badge green" id="indicatorCountPos">3</span>
            </button>
            <button class="sheet-filter-pill" onclick="filterDrawerIndicators('negative', this)">
              <span>Negative</span>
              <span class="sheet-tag-badge red" id="indicatorCountNeg">9</span>
            </button>
          </div>

          <!-- Scrollable Indicators Cards List -->
          <div class="sheet-list-scroll" id="indicatorsListContainer">
            <div id="feedCardsContainer">
              
              <!-- FEED: TEAM INDICATORS (Rich Card Design with Avg ... metrics) -->
              <div id="teamIndicatorsFeed">
                <!-- Positive Section (3) -->
                <div class="feed-section-label positive" data-group="positive">
                  <span>👍 Positive Indicator (3)</span>
                </div>

                <!-- 1. Avg Competency Match% -->
                <div class="metric-feed-card" data-group="positive">
                  <div class="feed-card-header">
                    <div class="feed-card-left">
                      <div class="feed-icon-box" style="background: var(--tag-violet-bg); color: var(--tag-violet-text);">🎯</div>
                      <div class="feed-card-title-group">
                        <h5>Avg Competency Match%</h5>
                        <span>Department Skill Benchmark</span>
                      </div>
                    </div>
                    <span class="feed-badge-pill positive">▲ +100.00%</span>
                  </div>
                  <div class="feed-card-body">
                    <div class="feed-val-block">
                      <span class="feed-val-big">4.53</span>
                      <span class="feed-val-unit">pts</span>
                    </div>
                    <span style="font-size: 11px; font-weight: 700; color: var(--tag-green-text);">Target achieved</span>
                  </div>
                </div>

                <!-- 2. Avg Goal Achievement% -->
                <div class="metric-feed-card" data-group="positive">
                  <div class="feed-card-header">
                    <div class="feed-card-left">
                      <div class="feed-icon-box" style="background: var(--tag-amber-bg); color: var(--tag-amber-text);">🏆</div>
                      <div class="feed-card-title-group">
                        <h5>Avg Goal Achievement%</h5>
                        <span>Team Milestone OKR Progress</span>
                      </div>
                    </div>
                    <span class="feed-badge-pill neutral">— 0.00%</span>
                  </div>
                  <div class="feed-card-body">
                    <div class="feed-val-block">
                      <span class="feed-val-big">0.00</span>
                      <span class="feed-val-unit">%</span>
                    </div>
                    <span style="font-size: 11px; font-weight: 600; color: var(--text-muted);">Quarterly cycle active</span>
                  </div>
                </div>

                <!-- 3. Avg Attendance% (Alert Highlight) -->
                <div class="metric-feed-card highlight-alert" data-group="positive">
                  <div class="feed-card-header">
                    <div class="feed-card-left">
                      <div class="feed-icon-box" style="background: var(--status-action-bg); color: var(--status-action-text);">📅</div>
                      <div class="feed-card-title-group">
                        <h5>Avg Attendance%</h5>
                        <span>Department Punctual Attendance</span>
                      </div>
                    </div>
                    <span class="feed-badge-pill alert">▼ -1.04%</span>
                  </div>
                  <div class="feed-card-body">
                    <div class="feed-val-block">
                      <span class="feed-val-big" style="color: var(--status-action-text);">69.39</span>
                      <span class="feed-val-unit" style="color: var(--status-action-text); font-weight: 800;">%</span>
                    </div>
                    <span style="font-size: 11px; font-weight: 700; color: var(--status-action-text);">Below 70% threshold</span>
                  </div>
                </div>

                <!-- Negative Section (9) -->
                <div class="feed-section-label negative" data-group="negative">
                  <span>👎 Negative Indicator (9)</span>
                </div>

                <!-- 4. Avg Odd Clocking Count -->
                <div class="metric-feed-card" data-group="negative">
                  <div class="feed-card-header">
                    <div class="feed-card-left">
                      <div class="feed-icon-box" style="background: var(--status-normal-bg); color: var(--text-secondary);">⏱️</div>
                      <div class="feed-card-title-group">
                        <h5>Avg Odd Clocking Count</h5>
                        <span>Irregular Punch Occurrences</span>
                      </div>
                    </div>
                    <span class="feed-badge-pill positive">▼ -56.76%</span>
                  </div>
                  <div class="feed-card-body">
                    <div class="feed-val-block">
                      <span class="feed-val-big">0.37</span>
                      <span class="feed-val-unit">avg</span>
                    </div>
                    <span style="font-size: 11px; font-weight: 700; color: var(--tag-green-text);">Significant reduction</span>
                  </div>
                </div>

                <!-- 5. Avg Late In Count -->
                <div class="metric-feed-card" data-group="negative">
                  <div class="feed-card-header">
                    <div class="feed-card-left">
                      <div class="feed-icon-box" style="background: var(--tag-amber-bg); color: var(--tag-amber-text);">⏰</div>
                      <div class="feed-card-title-group">
                        <h5>Avg Late In Count</h5>
                        <span>Morning Arrival Delays</span>
                      </div>
                    </div>
                    <span class="feed-badge-pill positive">▼ -12.50%</span>
                  </div>
                  <div class="feed-card-body">
                    <div class="feed-val-block">
                      <span class="feed-val-big">2.80</span>
                      <span class="feed-val-unit">times</span>
                    </div>
                    <span style="font-size: 11px; font-weight: 700; color: var(--tag-green-text);">Punctuality improved</span>
                  </div>
                </div>

                <!-- 6. Avg Absent Count -->
                <div class="metric-feed-card" data-group="negative">
                  <div class="feed-card-header">
                    <div class="feed-card-left">
                      <div class="feed-icon-box" style="background: var(--status-normal-bg); color: var(--text-secondary);">👤</div>
                      <div class="feed-card-title-group">
                        <h5>Avg Absent Count</h5>
                        <span>Unscheduled Team Absences</span>
                      </div>
                    </div>
                    <span class="feed-badge-pill positive">▼ -1.76%</span>
                  </div>
                  <div class="feed-card-body">
                    <div class="feed-val-block">
                      <span class="feed-val-big">8.51</span>
                      <span class="feed-val-unit">days</span>
                    </div>
                    <span style="font-size: 11px; font-weight: 700; color: var(--tag-green-text);">Mild decrease</span>
                  </div>
                </div>

                <!-- 7. Avg Emergency Leave Count -->
                <div class="metric-feed-card" data-group="negative">
                  <div class="feed-card-header">
                    <div class="feed-card-left">
                      <div class="feed-icon-box" style="background: var(--tag-amber-bg); color: var(--tag-amber-text);">🚨</div>
                      <div class="feed-card-title-group">
                        <h5>Avg Emergency Leave Count</h5>
                        <span>Ad-hoc Emergency Requests</span>
                      </div>
                    </div>
                    <span class="feed-badge-pill neutral">— 0.00%</span>
                  </div>
                  <div class="feed-card-body">
                    <div class="feed-val-block">
                      <span class="feed-val-big">0.00</span>
                      <span class="feed-val-unit">leaves</span>
                    </div>
                    <span style="font-size: 11px; color: var(--text-muted);">No emergency leaves</span>
                  </div>
                </div>

                <!-- 8. Avg Medical Leave Count (Alert Highlight) -->
                <div class="metric-feed-card highlight-alert" data-group="negative">
                  <div class="feed-card-header">
                    <div class="feed-card-left">
                      <div class="feed-icon-box" style="background: var(--status-action-bg); color: var(--status-action-text);">🏥</div>
                      <div class="feed-card-title-group">
                        <h5>Avg Medical Leave Count</h5>
                        <span>Clinic Medical Certs (MC)</span>
                      </div>
                    </div>
                    <span class="feed-badge-pill alert">▲ +16.67%</span>
                  </div>
                  <div class="feed-card-body">
                    <div class="feed-val-block">
                      <span class="feed-val-big" style="color: var(--status-action-text);">0.30</span>
                      <span class="feed-val-unit" style="color: var(--status-action-text); font-weight: 800;">days</span>
                    </div>
                    <span style="font-size: 11px; font-weight: 700; color: var(--status-action-text);">Seasonal clinic visits up</span>
                  </div>
                </div>

                <!-- 9. Avg OT Absent Count -->
                <div class="metric-feed-card" data-group="negative">
                  <div class="feed-card-header">
                    <div class="feed-card-left">
                      <div class="feed-icon-box" style="background: var(--tag-violet-bg); color: var(--tag-violet-text);">🌙</div>
                      <div class="feed-card-title-group">
                        <h5>Avg OT Absent Count</h5>
                        <span>Overtime Attendance Failure</span>
                      </div>
                    </div>
                    <span class="feed-badge-pill neutral">— 0.00%</span>
                  </div>
                  <div class="feed-card-body">
                    <div class="feed-val-block">
                      <span class="feed-val-big">0.00</span>
                      <span class="feed-val-unit">shifts</span>
                    </div>
                    <span style="font-size: 11px; color: var(--text-muted);">Overtime fully fulfilled</span>
                  </div>
                </div>

                <!-- 10. Avg Unauthorised OT Count -->
                <div class="metric-feed-card" data-group="negative">
                  <div class="feed-card-header">
                    <div class="feed-card-left">
                      <div class="feed-icon-box" style="background: var(--tag-rose-bg); color: var(--tag-rose-text);">⚡</div>
                      <div class="feed-card-title-group">
                        <h5>Avg Unauthorised OT Count</h5>
                        <span>Unapproved Extra Working Hours</span>
                      </div>
                    </div>
                    <span class="feed-badge-pill neutral">— -1.03%</span>
                  </div>
                  <div class="feed-card-body">
                    <div class="feed-val-block">
                      <span class="feed-val-big">11.63</span>
                      <span class="feed-val-unit">hrs</span>
                    </div>
                    <span style="font-size: 11px; color: var(--text-muted);">Manager sign-off pending</span>
                  </div>
                </div>

                <!-- 11. Avg Training Absent Count -->
                <div class="metric-feed-card" data-group="negative">
                  <div class="feed-card-header">
                    <div class="feed-card-left">
                      <div class="feed-icon-box" style="background: var(--tag-blue-bg); color: var(--tag-blue-text);">🎓</div>
                      <div class="feed-card-title-group">
                        <h5>Avg Training Absent Count</h5>
                        <span>Mandatory Training Absence</span>
                      </div>
                    </div>
                    <span class="feed-badge-pill neutral">— 0.00%</span>
                  </div>
                  <div class="feed-card-body">
                    <div class="feed-val-block">
                      <span class="feed-val-big">0.00</span>
                      <span class="feed-val-unit">courses</span>
                    </div>
                    <span style="font-size: 11px; color: var(--text-muted);">100% training attendance</span>
                  </div>
                </div>

                <!-- 12. Avg Early Out Count -->
                <div class="metric-feed-card" data-group="negative">
                  <div class="feed-card-header">
                    <div class="feed-card-left">
                      <div class="feed-icon-box" style="background: var(--tag-amber-bg); color: var(--tag-amber-text);">🚪</div>
                      <div class="feed-card-title-group">
                        <h5>Avg Early Out Count</h5>
                        <span>Early Departures Before Shift End</span>
                      </div>
                    </div>
                    <span class="feed-badge-pill neutral">— 0.00%</span>
                  </div>
                  <div class="feed-card-body">
                    <div class="feed-val-block">
                      <span class="feed-val-big">0.00</span>
                      <span class="feed-val-unit">early</span>
                    </div>
                    <span style="font-size: 11px; color: var(--text-muted);">Full work day maintained</span>
                  </div>
                </div>
              </div> <!-- /#teamIndicatorsFeed -->

              <!-- FEED: MY INDICATORS (Card Format for My tab) -->
              <div id="myIndicatorsFeed" style="display: none;">
                <!-- Positive Section (4) -->
                <div class="feed-section-label positive" data-group="positive">
                  <span>👍 Positive Indicator (4)</span>
                </div>

                <div class="metric-feed-card" data-group="positive">
                  <div class="feed-card-header">
                    <div class="feed-card-left">
                      <div class="feed-icon-box" style="background: var(--tag-violet-bg); color: var(--tag-violet-text);">🎯</div>
                      <div class="feed-card-title-group">
                        <h5>Competency Match%</h5>
                        <span>Job Role Skill Benchmark</span>
                      </div>
                    </div>
                    <span class="feed-badge-pill neutral">— 0.00%</span>
                  </div>
                  <div class="feed-card-body">
                    <div class="feed-val-block">
                      <span class="feed-val-big">67</span>
                      <span class="feed-val-unit">%</span>
                    </div>
                    <span style="font-size: 11px; font-weight: 700; color: var(--purple-text);">Target: 70%</span>
                  </div>
                </div>

                <div class="metric-feed-card" data-group="positive">
                  <div class="feed-card-header">
                    <div class="feed-card-left">
                      <div class="feed-icon-box" style="background: var(--tag-amber-bg); color: var(--tag-amber-text);">🏆</div>
                      <div class="feed-card-title-group">
                        <h5>Goal Achievement%</h5>
                        <span>Quarterly OKRs & Milestone Progress</span>
                      </div>
                    </div>
                    <span class="feed-badge-pill neutral">— 0.00%</span>
                  </div>
                  <div class="feed-card-body">
                    <div class="feed-val-block">
                      <span class="feed-val-big">0.00</span>
                      <span class="feed-val-unit">%</span>
                    </div>
                    <span style="font-size: 11px; font-weight: 600; color: var(--text-muted);">Review cycle active</span>
                  </div>
                </div>

                <div class="metric-feed-card highlight-positive" data-group="positive">
                  <div class="feed-card-header">
                    <div class="feed-card-left">
                      <div class="feed-icon-box" style="background: var(--tag-green-bg); color: var(--tag-green-text);">📅</div>
                      <div class="feed-card-title-group">
                        <h5>Attendance%</h5>
                        <span>Verified Monthly Punctual Punch</span>
                      </div>
                    </div>
                    <span class="feed-badge-pill positive">▲ +4.21%</span>
                  </div>
                  <div class="feed-card-body">
                    <div class="feed-val-block">
                      <span class="feed-val-big">95.00</span>
                      <span class="feed-val-unit">%</span>
                    </div>
                    <span style="font-size: 11px; font-weight: 700; color: var(--tag-green-text);">Excellent compliance</span>
                  </div>
                </div>

                <div class="metric-feed-card" data-group="positive">
                  <div class="feed-card-header">
                    <div class="feed-card-left">
                      <div class="feed-icon-box" style="background: var(--tag-teal-bg); color: var(--tag-teal-text);">🛡️</div>
                      <div class="feed-card-title-group">
                        <h5>Work Incident Points</h5>
                        <span>Safety & Disciplinary Compliance</span>
                      </div>
                    </div>
                    <span class="feed-badge-pill neutral">— 0.00%</span>
                  </div>
                  <div class="feed-card-body">
                    <div class="feed-val-block">
                      <span class="feed-val-big">0.00</span>
                      <span class="feed-val-unit">pts</span>
                    </div>
                    <span style="font-size: 11px; font-weight: 700; color: var(--tag-teal-text);">Clean record</span>
                  </div>
                </div>

                <!-- Negative Section (10) -->
                <div class="feed-section-label negative" data-group="negative">
                  <span>👎 Negative Indicator (10)</span>
                </div>

                <div class="metric-feed-card" data-group="negative">
                  <div class="feed-card-header">
                    <div class="feed-card-left">
                      <div class="feed-icon-box" style="background: var(--status-normal-bg); color: var(--text-secondary);">⏱️</div>
                      <div class="feed-card-title-group">
                        <h5>Odd Clocking Count</h5>
                        <span>Irregular Time Punch Log</span>
                      </div>
                    </div>
                    <span class="feed-badge-pill neutral">— 0.00%</span>
                  </div>
                  <div class="feed-card-body">
                    <div class="feed-val-block">
                      <span class="feed-val-big">0</span>
                      <span class="feed-val-unit">times</span>
                    </div>
                    <span style="font-size: 11px; color: var(--text-muted);">No abnormal punches</span>
                  </div>
                </div>

                <div class="metric-feed-card" data-group="negative">
                  <div class="feed-card-header">
                    <div class="feed-card-left">
                      <div class="feed-icon-box" style="background: var(--tag-amber-bg); color: var(--tag-amber-text);">⏰</div>
                      <div class="feed-card-title-group">
                        <h5>Late In Count</h5>
                        <span>Morning Arrival Performance</span>
                      </div>
                    </div>
                    <span class="feed-badge-pill positive">▼ 0.00%</span>
                  </div>
                  <div class="feed-card-body">
                    <div class="feed-val-block">
                      <span class="feed-val-big">0</span>
                      <span class="feed-val-unit">late</span>
                    </div>
                    <span style="font-size: 11px; font-weight: 700; color: var(--tag-green-text);">100% on time</span>
                  </div>
                </div>

                <div class="metric-feed-card" data-group="negative">
                  <div class="feed-card-header">
                    <div class="feed-card-left">
                      <div class="feed-icon-box" style="background: var(--status-action-bg); color: var(--status-action-text);">👤</div>
                      <div class="feed-card-title-group">
                        <h5>Absent Count</h5>
                        <span>Unexcused Non-attendance Record</span>
                      </div>
                    </div>
                    <span class="feed-badge-pill positive">▼ 0.00%</span>
                  </div>
                  <div class="feed-card-body">
                    <div class="feed-val-block">
                      <span class="feed-val-big">0</span>
                      <span class="feed-val-unit">days</span>
                    </div>
                    <span style="font-size: 11px; font-weight: 700; color: var(--tag-green-text);">Zero absenteeism</span>
                  </div>
                </div>

                <div class="metric-feed-card" data-group="negative">
                  <div class="feed-card-header">
                    <div class="feed-card-left">
                      <div class="feed-icon-box" style="background: var(--tag-amber-bg); color: var(--tag-amber-text);">🚨</div>
                      <div class="feed-card-title-group">
                        <h5>Emergency Leave Count</h5>
                        <span>Ad-hoc Unplanned Leaves</span>
                      </div>
                    </div>
                    <span class="feed-badge-pill neutral">— 0.00%</span>
                  </div>
                  <div class="feed-card-body">
                    <div class="feed-val-block">
                      <span class="feed-val-big">0</span>
                      <span class="feed-val-unit">req</span>
                    </div>
                    <span style="font-size: 11px; color: var(--text-muted);">All leaves planned</span>
                  </div>
                </div>

                <div class="metric-feed-card" data-group="negative">
                  <div class="feed-card-header">
                    <div class="feed-card-left">
                      <div class="feed-icon-box" style="background: var(--tag-rose-bg); color: var(--tag-rose-text);">🏥</div>
                      <div class="feed-card-title-group">
                        <h5>Medical Leave Count</h5>
                        <span>Approved Doctor Clinic MC</span>
                      </div>
                    </div>
                    <span class="feed-badge-pill neutral">— 0.00%</span>
                  </div>
                  <div class="feed-card-body">
                    <div class="feed-val-block">
                      <span class="feed-val-big">1</span>
                      <span class="feed-val-unit">day</span>
                    </div>
                    <span style="font-size: 11px; color: var(--text-muted);">MC verified by clinic</span>
                  </div>
                </div>

                <div class="metric-feed-card" data-group="negative">
                  <div class="feed-card-header">
                    <div class="feed-card-left">
                      <div class="feed-icon-box" style="background: var(--tag-violet-bg); color: var(--tag-violet-text);">🌙</div>
                      <div class="feed-card-title-group">
                        <h5>OT Absent Count</h5>
                        <span>Overtime Schedule Compliance</span>
                      </div>
                    </div>
                    <span class="feed-badge-pill neutral">— 0.00%</span>
                  </div>
                  <div class="feed-card-body">
                    <div class="feed-val-block">
                      <span class="feed-val-big">0</span>
                      <span class="feed-val-unit">shifts</span>
                    </div>
                    <span style="font-size: 11px; color: var(--text-muted);">Full OT fulfilled</span>
                  </div>
                </div>

                <div class="metric-feed-card highlight-alert" data-group="negative">
                  <div class="feed-card-header">
                    <div class="feed-card-left">
                      <div class="feed-icon-box" style="background: var(--status-action-bg); color: var(--status-action-text);">⚡</div>
                      <div class="feed-card-title-group">
                        <h5>Unauthorised OT Count</h5>
                        <span>Worked Without Supervisor Sign-off</span>
                      </div>
                    </div>
                    <span class="feed-badge-pill alert">▲ +11.76%</span>
                  </div>
                  <div class="feed-card-body">
                    <div class="feed-val-block">
                      <span class="feed-val-big" style="color: var(--status-action-text);">17</span>
                      <span class="feed-val-unit" style="color: var(--status-action-text); font-weight: 800;">hrs</span>
                    </div>
                    <span style="font-size: 11px; font-weight: 700; color: var(--status-action-text);">Requires manager sign</span>
                  </div>
                </div>

                <div class="metric-feed-card" data-group="negative">
                  <div class="feed-card-header">
                    <div class="feed-card-left">
                      <div class="feed-icon-box" style="background: var(--tag-blue-bg); color: var(--tag-blue-text);">🎓</div>
                      <div class="feed-card-title-group">
                        <h5>Training Absent Count</h5>
                        <span>Mandatory Course Compliance</span>
                      </div>
                    </div>
                    <span class="feed-badge-pill neutral">— 0.00%</span>
                  </div>
                  <div class="feed-card-body">
                    <div class="feed-val-block">
                      <span class="feed-val-big">0</span>
                      <span class="feed-val-unit">missed</span>
                    </div>
                    <span style="font-size: 11px; color: var(--text-muted);">Courses completed</span>
                  </div>
                </div>

                <div class="metric-feed-card" data-group="negative">
                  <div class="feed-card-header">
                    <div class="feed-card-left">
                      <div class="feed-icon-box" style="background: var(--tag-amber-bg); color: var(--tag-amber-text);">⚠️</div>
                      <div class="feed-card-title-group">
                        <h5>Warning Letter Count</h5>
                        <span>Formal HR Advisory Notices</span>
                      </div>
                    </div>
                    <span class="feed-badge-pill neutral">— 0.00%</span>
                  </div>
                  <div class="feed-card-body">
                    <div class="feed-val-block">
                      <span class="feed-val-big">0</span>
                      <span class="feed-val-unit">letters</span>
                    </div>
                    <span style="font-size: 11px; font-weight: 700; color: var(--tag-green-text);">Exemplary conduct</span>
                  </div>
                </div>

                <div class="metric-feed-card" data-group="negative">
                  <div class="feed-card-header">
                    <div class="feed-card-left">
                      <div class="feed-icon-box" style="background: var(--tag-violet-bg); color: var(--tag-violet-text);">✉️</div>
                      <div class="feed-card-title-group">
                        <h5>Unacknowledged Letter Count</h5>
                        <span>HR Circulars Pending Signature</span>
                      </div>
                    </div>
                    <span class="feed-badge-pill positive">▼ 0.00%</span>
                  </div>
                  <div class="feed-card-body">
                    <div class="feed-val-block">
                      <span class="feed-val-big">0</span>
                      <span class="feed-val-unit">pending</span>
                    </div>
                    <span style="font-size: 11px; font-weight: 700; color: var(--tag-green-text);">All docs signed</span>
                  </div>
                </div>
              </div> <!-- /#myIndicatorsFeed -->

            </div>
          </div>
        </div>
      </div>
    `;
  }
}
customElements.define('indicators-sheet', IndicatorsSheet);

// 9. Company Updates Bottom Sheet Component
class CompanyUpdatesSheet extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="indicators-overlay" id="updatesOverlay" onclick="closeUpdatesModal(event)">
        <div class="indicators-sheet" onclick="event.stopPropagation()">
          <div class="sheet-handle"></div>

          <div class="sheet-header">
            <div class="sheet-title">
              <h3>Company Updates (6)</h3>
              <p>News • Policy & SOP • Announcements</p>
            </div>
            <button class="sheet-close-btn" onclick="closeUpdatesDirect()" aria-label="Close">✕</button>
          </div>

          <div class="sheet-filter-bar">
            <button class="sheet-filter-pill active" onclick="filterUpdates('all', this)">
              <span>All (6)</span>
            </button>
            <button class="sheet-filter-pill" onclick="filterUpdates('news', this)">
              <span>News (3)</span>
            </button>
            <button class="sheet-filter-pill" onclick="filterUpdates('policy', this)">
              <span>Policy & SOP (3)</span>
            </button>
          </div>

          <div class="sheet-list-scroll">
            <!-- 1. NEWS (Red = Unread) -->
            <div class="sheet-item-card" data-update="news" onclick="openNewsDetail(this, 'Town Hall')">
              <div class="item-left-box">
                <div class="item-icon-box" style="background: var(--tag-violet-bg); color: var(--tag-violet-text);" title="Company Uploaded Cover">
                  <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=100&auto=format&fit=crop&q=80" alt="Town Hall" class="item-thumb-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                  <span style="display:none;">📢</span>
                </div>
                <div class="item-info">
                  <h5>Town Hall this Friday: Q3 Strategy</h5>
                  <span>Leadership update at 3:00 PM • Today</span>
                </div>
              </div>
              <div class="item-right-box">
                <span class="sheet-tag-badge red">Unread</span>
              </div>
            </div>

            <!-- 2. NEWS (Green = Read / News) -->
            <div class="sheet-item-card" data-update="news" onclick="openNewsDetail(this, 'Industry Award')">
              <div class="item-left-box">
                <div class="item-icon-box" style="background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #ffffff;" title="Company/Dept Monogram">
                  <span class="dept-badge">PQ</span>
                </div>
                <div class="item-info">
                  <h5>PeopleQuest wins industry award</h5>
                  <span>Best Enterprise HCM Solution 2026 • Yesterday</span>
                </div>
              </div>
              <div class="item-right-box">
                <span class="sheet-tag-badge green">News</span>
              </div>
            </div>

            <!-- 3. NEWS (Green = Read / News, changed from grey) -->
            <div class="sheet-item-card" data-update="news" onclick="openNewsDetail(this, 'PeopleHCM 3.0')">
              <div class="item-left-box">
                <div class="item-icon-box" style="background: var(--tag-blue-bg); color: var(--tag-blue-text);" title="Smart Category Icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                </div>
                <div class="item-info">
                  <h5>PeopleHCM 3.0 Mobile Launch</h5>
                  <span>Instant leave approvals & AI insights • 3d ago</span>
                </div>
              </div>
              <div class="item-right-box">
                <span class="sheet-tag-badge green">News</span>
              </div>
            </div>

            <!-- 4. POLICY & SOP (DE001: PeopleTime User Guide v2) -->
            <div class="sheet-item-card" data-update="policy" onclick="openPolicyDetail('DE001')">
              <div class="item-left-box">
                <div class="item-icon-box" style="background: var(--tag-teal-bg); color: var(--tag-teal-text);" title="Document Policy">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                </div>
                <div class="item-info">
                  <h5>PeopleTime User Guide v2</h5>
                  <span>Attention to: ADMINISTRATION</span>
                </div>
              </div>
              <div class="item-right-box">
                <span class="sheet-tag-badge blue">DE001</span>
              </div>
            </div>

            <!-- 5. POLICY & SOP (HR004: Hybrid & Remote Work Policy) -->
            <div class="sheet-item-card" data-update="policy" onclick="openPolicyDetail('HR004')">
              <div class="item-left-box">
                <div class="item-icon-box" style="background: var(--tag-blue-bg); color: var(--tag-blue-text);" title="Company Policy">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <line x1="12" y1="10" x2="12" y2="14"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                </div>
                <div class="item-info">
                  <h5>Hybrid & Remote Work Policy 2026</h5>
                  <span>Attention to: ALL DEPARTMENTS</span>
                </div>
              </div>
              <div class="item-right-box">
                <span class="sheet-tag-badge green">HR004</span>
              </div>
            </div>

            <!-- 6. POLICY & SOP (FN012: Medical & Travel Claims SOP) -->
            <div class="sheet-item-card" data-update="policy" onclick="openPolicyDetail('FN012')">
              <div class="item-left-box">
                <div class="item-icon-box" style="background: var(--tag-amber-bg); color: var(--tag-amber-text);" title="SOP Guide">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <div class="item-info">
                  <h5>Medical & Travel Claims SOP</h5>
                  <span>Attention to: FINANCE & ACCOUNTING</span>
                </div>
              </div>
              <div class="item-right-box">
                <span class="sheet-tag-badge amber" style="background: var(--tag-amber-bg); color: var(--tag-amber-text);">FN012</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
customElements.define('company-updates-sheet', CompanyUpdatesSheet);

// 10. Policy & SOP Detail Bottom Sheet Modal Component
class PolicyDetailSheet extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="indicators-overlay policy-detail-overlay" id="policyDetailOverlay" onclick="closePolicyDetailModal(event)">
        <div class="indicators-sheet policy-detail-sheet" onclick="event.stopPropagation()">
          <div class="sheet-handle"></div>

          <div class="policy-sheet-header">
            <div class="policy-ref-badge" id="policyRefBadge">REF: DE001</div>
            <button class="sheet-close-btn" onclick="closePolicyDetailDirect()" aria-label="Close">✕</button>
          </div>

          <div class="policy-title-section">
            <h3 class="policy-detail-title" id="policyDetailTitle">PeopleTime User Guide v2</h3>
            <div class="policy-dept-banner" id="policyDeptBanner">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16"></path>
                <line x1="9" y1="9" x2="9" y2="9.01"></line>
                <line x1="15" y1="9" x2="15" y2="9.01"></line>
                <line x1="9" y1="13" x2="9" y2="13.01"></line>
                <line x1="15" y1="13" x2="15" y2="13.01"></line>
              </svg>
              <span id="policyDeptText">Attention to: ADMINISTRATION</span>
            </div>
          </div>

          <div class="policy-scroll-content">
            <!-- 1. Policy Document -->
            <div class="policy-doc-card">
              <div class="doc-card-header">
                <span class="doc-type-pill policy">1. Policy Document</span>
                <span class="doc-date-pill" id="policyDatePill">Effective: 20/12/2024</span>
              </div>
              <div class="doc-file-row" id="policyFileRow">
                <div class="doc-file-icon pdf">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                </div>
                <div class="doc-file-info">
                  <div class="doc-file-name" id="policyFileName">PeopleTime_UserGuide_v2.pdf</div>
                  <div class="doc-file-meta" id="policyFileMeta">3.91 MB • PDF Document</div>
                </div>
                <button class="doc-view-btn" onclick="previewPolicyDoc('PeopleTime_UserGuide_v2.pdf')" title="View Document" aria-label="View Document">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>

            <!-- 2. SOP Document -->
            <div class="policy-doc-card">
              <div class="doc-card-header">
                <span class="doc-type-pill sop">2. Standard Operating Procedure (SOP)</span>
                <span class="doc-date-pill" id="sopDatePill">Effective: N/A</span>
              </div>
              <div class="doc-file-row" id="sopFileRow">
                <div class="doc-file-empty-text">No SOP document uploaded (N/A)</div>
              </div>
            </div>

            <!-- 3. Guideline Document -->
            <div class="policy-doc-card">
              <div class="doc-card-header">
                <span class="doc-type-pill guideline">3. Operational Guideline</span>
                <span class="doc-date-pill" id="guidelineDatePill">Effective: N/A</span>
              </div>
              <div class="doc-file-row" id="guidelineFileRow">
                <div class="doc-file-empty-text">No Guideline document uploaded (N/A)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
customElements.define('policy-detail-sheet', PolicyDetailSheet);

