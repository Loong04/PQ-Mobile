# PQ Mobile - Comprehensive Theme, Hero & Filter Specification

This document defines the mandatory design, layout, theme color, hero section, and filter implementation standards across the PQ Mobile application.

---

## 🎯 1. Core Principles
- **Visual Consistency**: All pages across the app (Home, App, Leave, Me, Calendar, Favourites, Subordinates, etc.) MUST adhere to unified layout boundaries, color tokens, and header height standards.
- **Executive Purple Brand Theme**: The primary brand theme is anchored on the Executive Purple gradient (`#4c1d95` → `#6d28d9` → `#7c3aed`).
- **Dual Filter Interaction**: Support both instant horizontal **Filter Pills** for quick toggling and a **Bottom Sheet Filter Modal** for detailed multi-field filtering.
- **Tag-Driven Status Cards**: Cards reflecting application statuses (*Submitted*, *Approved*, *Rejected*, *Cancelled*) MUST dynamically adapt their borders, badges, inner detail containers, and gradient glows based on their status tag.

---

## 🎨 2. Theme & Hero Section Specification

### A. Top Executive Header Bar (`.cal-top-header`)
Used across Leave Dashboard, Calendar, Me Profile, and Favourites pages:
```css
.cal-top-header {
  background: linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%);
  padding: 0 0 14px;
  border-bottom-left-radius: 22px;
  border-bottom-right-radius: 22px;
  box-shadow: 0 8px 24px rgba(76, 29, 149, 0.28);
  position: relative;
  z-index: 20;
}
```

### B. Hero Background Component (`.hero-bg` / `<phone-hero-bg>`)
Used on Home (`homedark.html`, `homelight.html`) and App (`appdark.html`, `applight.html`) pages:
- **100% Layout & Height Parity**: Height is fixed to **520px** in BOTH Light Mode and Dark Mode.
- **Background Image**: Features `hero-purple-mesh.jpg` centered at top with SVG neon constellation overlay.
- **Gradient Overlay**: Fades gracefully into `var(--bg-phone)` (`#f6f8fc` in Light Mode, `#090a16` in Dark Mode).

```css
.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 520px;
  background:
    url('hero-purple-mesh.jpg') center top / cover no-repeat,
    radial-gradient(circle at 85% 12%, rgba(168, 85, 247, 0.45) 0%, transparent 50%),
    linear-gradient(178deg, #4c1d95 0%, #6d28d9 35%, #7c3aed 70%, #5b21b6 90%, var(--bg-phone) 100%);
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

[data-theme="dark"] .hero-bg {
  height: 520px;
  background:
    url('hero-purple-mesh.jpg') center top / cover no-repeat,
    radial-gradient(circle at 85% 12%, rgba(168, 85, 247, 0.45) 0%, transparent 50%),
    linear-gradient(178deg, #2e1065 0%, #4c1d95 35%, #6d28d9 70%, #7c3aed 90%, var(--bg-phone) 100%);
}

[data-theme="light"] .hero-bg {
  height: 520px;
  background:
    url('hero-purple-mesh.jpg') center top / cover no-repeat,
    radial-gradient(circle at 85% 12%, rgba(168, 85, 247, 0.45) 0%, transparent 50%),
    linear-gradient(178deg, #4c1d95 0%, #6d28d9 35%, #7c3aed 70%, #5b21b6 90%, var(--bg-phone) 100%);
}
```

### C. Me Page Hero Pass Card (`.me-pass-card`)
A frosted glassmorphism pass embedded within the top Executive Purple header block:
```css
.me-pass-card {
  margin: 4px 14px 14px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.08) 100%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 16px 16px 14px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  box-shadow: 0 12px 30px -8px rgba(76, 29, 149, 0.35);
  position: relative;
  overflow: hidden;
  color: #ffffff;
}
```

### D. Dynamic Scroll Color Controller (`initExploreScrollListener`)
To solve contrast collision when scrolling between the light page background (`#f6f8fc`) and top purple hero background (`#4c1d95`):
- **Original Position** (unscrolled, resting on light page background): `.explore-title` text color is **Dark Slate (`#0f172a`)**.
- **Scrolled Position** (scrolled upwards into the top purple hero background, `scrollTop > 80`): `.explore-title` text color automatically transitions to **Pure White (`#ffffff`)** with subtle text shadow for 100% legibility.

```javascript
function initExploreScrollListener() {
  const mainScroll = document.querySelector('.main-content');
  const exploreTitle = document.querySelector('.explore-title');
  if (!mainScroll || !exploreTitle) return;

  function handleExploreScroll() {
    const isLight = (document.documentElement.getAttribute('data-theme') || 'dark') === 'light';
    if (!isLight) { exploreTitle.style.color = '#ffffff'; return; }

    if (mainScroll.scrollTop > 80) {
      exploreTitle.style.color = '#ffffff'; // White font over purple hero background
    } else {
      exploreTitle.style.color = '#0f172a'; // Black font over light page background
    }
  }

  mainScroll.addEventListener('scroll', handleExploreScroll, { passive: true });
}
```

### E. Section Header Spacing (`.explore-header`)
To prevent visual crowding against the hero background image and quick-access pills above it, `.explore-header` enforces a top margin of `38px`:
```css
.explore-header {
  margin-top: 38px !important;
  margin-bottom: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

---

## 🏷️ 3. Tag-Based History Card Design System

History cards in **My Leave History** adapt their visual design dynamically based on the status tag attribute (`data-status="submitted"`, `approved`, `rejected`, `cancelled`).

### Status Theme Specification
| Status Tag | Accent Border | Card Background Glow | Badge Color | Inner Box Background |
| :--- | :--- | :--- | :--- | :--- |
| **Submitted** (`⏳`) | `5px solid #f59e0b` | `linear-gradient(135deg, var(--bg-card), rgba(245, 158, 11, 0.06))` | Amber (`#d97706` / `#fbbf24`) | `rgba(245, 158, 11, 0.05)` |
| **Approved** (`✅`) | `5px solid #10b981` | `linear-gradient(135deg, var(--bg-card), rgba(16, 185, 129, 0.06))` | Emerald (`#059669` / `#34d399`) | `rgba(16, 185, 129, 0.05)` |
| **Rejected** (`❌`) | `5px solid #ef4444` | `linear-gradient(135deg, var(--bg-card), rgba(239, 68, 68, 0.06))` | Crimson (`#dc2626` / `#f87171`) | `rgba(239, 68, 68, 0.05)` |
| **Cancelled** (`🚫`) | `5px solid #64748b` | `linear-gradient(135deg, var(--bg-card), rgba(100, 116, 139, 0.06))` | Slate Gray (`#475569` / `#94a3b8`) | `rgba(100, 116, 139, 0.05)` |

### Mandated Global Card Status CSS (`css/app.css`)
```css
/* Card Status Variants */
.history-item-card[data-status="submitted"],
.status-item-card[data-status="submitted"] {
  border-left: 5px solid #f59e0b;
  background: linear-gradient(135deg, var(--bg-card) 0%, rgba(245, 158, 11, 0.06) 100%);
}
.history-item-card[data-status="approved"],
.status-item-card[data-status="approved"] {
  border-left: 5px solid #10b981;
  background: linear-gradient(135deg, var(--bg-card) 0%, rgba(16, 185, 129, 0.06) 100%);
}
.history-item-card[data-status="rejected"],
.status-item-card[data-status="rejected"] {
  border-left: 5px solid #ef4444;
  background: linear-gradient(135deg, var(--bg-card) 0%, rgba(239, 68, 68, 0.06) 100%);
}
.history-item-card[data-status="cancelled"],
.status-item-card[data-status="cancelled"] {
  border-left: 5px solid #64748b;
  background: linear-gradient(135deg, var(--bg-card) 0%, rgba(100, 116, 139, 0.06) 100%);
}

/* Badge Status Styles (Dark & Light Mode Parity) */
.history-item-card[data-status="submitted"] .card-status-badge,
.card-status-badge[data-status="submitted"] {
  color: #d97706; background: rgba(245, 158, 11, 0.14); border: 1px solid rgba(245, 158, 11, 0.35);
}
[data-theme="dark"] .history-item-card[data-status="submitted"] .card-status-badge,
[data-theme="dark"] .card-status-badge[data-status="submitted"] {
  color: #fbbf24; background: rgba(245, 158, 11, 0.22); border-color: rgba(245, 158, 11, 0.45);
}

.history-item-card[data-status="approved"] .card-status-badge,
.card-status-badge[data-status="approved"] {
  color: #059669; background: rgba(16, 185, 129, 0.14); border: 1px solid rgba(16, 185, 129, 0.35);
}
[data-theme="dark"] .history-item-card[data-status="approved"] .card-status-badge,
[data-theme="dark"] .card-status-badge[data-status="approved"] {
  color: #34d399; background: rgba(16, 185, 129, 0.22); border-color: rgba(16, 185, 129, 0.45);
}

.history-item-card[data-status="rejected"] .card-status-badge,
.card-status-badge[data-status="rejected"] {
  color: #dc2626; background: rgba(239, 68, 68, 0.14); border: 1px solid rgba(239, 68, 68, 0.35);
}
[data-theme="dark"] .history-item-card[data-status="rejected"] .card-status-badge,
[data-theme="dark"] .card-status-badge[data-status="rejected"] {
  color: #f87171; background: rgba(239, 68, 68, 0.22); border-color: rgba(239, 68, 68, 0.45);
}
```

---

## 🔍 4. App-Wide Standard Filter Specification

### A. Current Filter Header Bar
Placed at the top of filterable sections:
```html
<div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 18px; padding: 12px 16px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-sm);">
  <div>
    <div style="font-size: 10.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 3px;">
      Current Filter
    </div>
    <div style="font-size: 13px; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
      <span style="font-size: 14px; opacity: 0.85;">ஃ</span>
      <span id="[Page]FilterSummaryText">All Types >> 2026</span>
    </div>
  </div>
  <!-- Sliders Filter Button Trigger -->
  <button type="button" onclick="open[Page]FilterModal()" title="Open Filter Options"
    style="width: 44px; height: 44px; border-radius: 14px; background: var(--bg-input); border: 1px solid var(--border-subtle); color: var(--purple-primary); display: flex; align-items: center; justify-content: center; cursor: pointer;">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line>
      <line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line>
      <line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line>
      <line x1="17" y1="16" x2="23" y2="16"></line>
    </svg>
  </button>
</div>
```

### B. Filter Pills Scroller & Dynamic Header Title Sync
When switching category filter tabs (`Leave`, `Leave Credit`, `Time Off`), the top header title MUST update dynamically:
- `Leave` active → Header Title: **My Leave History**
- `Leave Credit` active → Header Title: **My Leave Credit History**
- `Time Off` active → Header Title: **My Time Off History**

> **Layout Streamlining**: The status filter pills row (`All`, `Submitted`, `Approved`, `Rejected`) has been removed from the main history view to avoid UI redundancy, as status filtering is centrally managed inside the Bottom Sheet Filter Modal.

```javascript
function updateHistoryHeaderTitle() {
  const headerTitle = document.getElementById('headerTitleText');
  if (!headerTitle) return;
  if (currentHistoryTab === 'credit') {
    headerTitle.innerText = 'My Leave Credit History';
  } else if (currentHistoryTab === 'offtime') {
    headerTitle.innerText = 'My Time Off History';
  } else {
    headerTitle.innerText = 'My Leave History';
  }
}
```

### C. Bottom Sheet Filter Modal
```html
<div id="[Page]FilterModalOverlay" onclick="close[Page]FilterModal(event)"
  style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 9999; display: none; align-items: flex-end; justify-content: center; opacity: 0; transition: opacity 0.3s ease;">
  
  <div class="filter-bottom-sheet-content" onclick="event.stopPropagation()"
    style="width: 100%; max-width: 480px; background: var(--bg-card); border-top-left-radius: 28px; border-top-right-radius: 28px; padding: 20px 20px 28px; box-shadow: 0 -10px 30px rgba(0,0,0,0.3); border: 1px solid var(--border-subtle); transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);">
    
    <!-- Drag handle pill -->
    <div style="width: 36px; height: 4px; background: var(--border-subtle); border-radius: 4px; margin: 0 auto 16px; opacity: 0.7;"></div>

    <!-- Header Row -->
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
      <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 0;">Filter</h3>
      <button type="button" onclick="reset[Page]FilterModal()"
        style="padding: 7px 14px; border-radius: 20px; background: var(--bg-input); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
        <span>↻</span> Reset
      </button>
    </div>

    <!-- Submit CTA Button -->
    <button type="button" onclick="submit[Page]FilterModal()"
      style="width: 100%; padding: 15px; border-radius: 18px; background: linear-gradient(135deg, #7c3aed, #6366f1); color: #ffffff; font-size: 15px; font-weight: 800; border: none; cursor: pointer; box-shadow: 0 8px 20px rgba(124, 58, 237, 0.35);">
      Apply Filter
    </button>
  </div>
</div>
```

### D. Tab-Specific Filter Fields
- **Leave & Leave Credit Tabs**: Show Reference, Start Date, End Date, **Leave Type**, and Status filter fields.
- **Time Off Tab**: Render **ONLY** 3 mandated fields: Search Keyword, Start Date, and End Date (Leave Type & Status are hidden).

```javascript
if (currentHistoryTab === 'offtime') {
  // Time Off filter: Only show Search Keyword, Start Date, End Date
  if (refLabel) refLabel.innerText = 'Search Keyword';
  if (refInput) refInput.placeholder = 'e.g. Late Start, Outstation, OT...';
  if (fromLabel) fromLabel.innerText = 'Start Date';
  if (toLabel) toLabel.innerText = 'End Date';
  if (leaveTypeGroup) leaveTypeGroup.style.display = 'none';
  if (statusGroup) statusGroup.style.display = 'none';
} else {
  // Leave & Credit tabs: Show Leave Type & Status
  if (refLabel) refLabel.innerText = 'Reference';
  if (refInput) refInput.placeholder = (currentHistoryTab === 'credit') ? 'e.g. CR-2026-0005' : 'e.g. LV-2026-0041';
  if (fromLabel) fromLabel.innerText = 'Start Date';
  if (toLabel) toLabel.innerText = 'End Date';
  if (leaveTypeGroup) leaveTypeGroup.style.display = (currentHistoryTab === 'leave' || currentHistoryTab === 'credit') ? 'block' : 'none';
  if (statusGroup) statusGroup.style.display = 'block';
}
```

### E. Dynamic Filter Summary Text Formatting (`#historyFilterSummaryText`)
The summary header text (`ஃ [Summary Text] >> [Category]`) MUST dynamically construct its display label based on all active input selections:
1. **Keyword / Ref**: Enclosed in quotes (e.g., `"LV-2026-0041"` or `"Outstation"`).
2. **Status**: Shows chosen status name (e.g., `Approved`, `Submitted`).
3. **Leave Type**: Shows chosen type name (e.g., `Annual Leave`, `Medical Leave`).
4. **Date Range**: Formatted as `10 Sep 2026 - 20 Sep 2026` (or `From 10 Sep 2026` / `Until 20 Sep 2026`).
5. **Default**: If no active filters are set, falls back to `All Applications >> [CategoryTab]`.

```javascript
function buildHistoryFilterSummary() {
  // Combines selected keyword, status, leave type, and date range into:
  // "Approved | 10 Sep 2026 - 20 Sep 2026 >> Leave"
}
```

---

## ⚡ 5. State Synchronization
1. Selecting a **Filter Pill** updates modal state, summary text (`[Summary Text] >> [Year]`), and top **Header Title**.
2. Submitting from the **Filter Modal** updates active **Filter Pill** classes and `#historyFilterSummaryText`.
3. Resetting from the **Filter Modal** restores default selections and resets summary text to `All Applications >> [Category]`.

---
*Updated on: 2026-09-12 | Consolidated master specification for PQ Mobile.*
