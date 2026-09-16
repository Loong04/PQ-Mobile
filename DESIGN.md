# PeopleHCM (PQ Mobile) — Design System & Icon Consistency Specification

## 1. Overview & Aesthetics
PeopleHCM Executive Dossier features a modern, ultra-premium mobile interface tailored for enterprise HCM operations. It utilizes dynamic dark/light mode CSS design tokens, soft glassmorphism, responsive segmented scrollers, and high-contrast accessibility.

---

## 2. Color Palette & Theme Tokens

### Light Mode (`data-theme="light"`)
- **Background Body**: `#f4f6fb`
- **Phone Container**: `#ffffff` (Shadow: `0 20px 60px rgba(0,0,0,0.12)`)
- **Card Background**: `#ffffff` (Border: `rgba(0, 0, 0, 0.08)`)
- **Input Background**: `#f8fafc` (Border: `rgba(0, 0, 0, 0.12)`)
- **Primary Text**: `#0f172a`
- **Muted Text**: `#64748b`

### Dark Mode (`data-theme="dark"`)
- **Background Body**: `#090d16`
- **Phone Container**: `#0f172a` (Shadow: `0 20px 60px rgba(0,0,0,0.5)`)
- **Card Background**: `#1e293b` (Border: `rgba(255, 255, 255, 0.08)`)
- **Input Background**: `#0f172a` (Border: `rgba(255, 255, 255, 0.12)`)
- **Primary Text**: `#f8fafc`
- **Muted Text**: `#94a3b8`

### Brand & Executive Accents
- **Executive Purple Gradient**: `linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%)`
- **Accent Purple Primary**: `#7c3aed` / `#8b5cf6`
- **Modified Amber**: `#f59e0b` (Badges & Highlight borders)
- **Approved Green**: `#10b981` (Status tags & positive metrics)
- **Pending Amber/Orange**: `#f59e0b` (Pending approval states)

---

## 3. Layout Standards

1. **Mobile Frame (`.phone-container`)**:
   - `width: 100%`, `max-width: 420px`, `height: 915px`
   - `border-radius: 44px`, `position: relative`, `overflow: hidden`
2. **Top Navigation Bar (`.bonus-nav-bar`)**:
   - Left: Circular Back Arrow `<svg>`
   - Center: Title Wrap (`EXECUTIVE DOSSIER` eyebrow + Main Title)
   - Right: Three-Dots Action Button `⋮` (`toggleHistoryModal(true)`)
3. **Segmented Scroller (`.change-category-scroller`)**:
   - Smooth horizontal overflow-x scroll
   - Active Pill: Soft purple highlight (`background: #ffffff` / `#7c3aed`, `color: #ffffff`)
   - Right Expand Button (`⊞`): Opens 1-Tap All Categories Grid Sheet (`toggleCatGridSheet(true)`)
4. **Floating Draft Summary Bar (`.change-draft-bar`)**:
   - `position: absolute; bottom: 16px; left: 14px; right: 14px;`
   - Styled as `#0f172a` dark floating card with 16px border-radius and `Review & Submit ➔` button.

---

## 4. Icon & Symbol Consistency Map

To ensure unified user experience across all modules (`me.html`, `change-request.html`, `bonus-history.html`, `salary-history.html`), use the exact icon mappings below:

### Profile & Category Icons
| Category / Module | Standard Icon | Unicode / Usage |
|---|:---:|---|
| Personal Details | 👤 | `👤 Personal` |
| Qualification | 🎓 | `🎓 Qualification` |
| Payroll & Statutory | 💳 | `💳 Payroll & Statutory` |
| Contacts & Address | 📍 | `📍 Contacts & Address` |
| Family Details | 👨‍👩‍👧 | `👨‍👩‍👧 Family` |
| Bonus Statement History | 🎁 | `🎁 Bonus` |
| Salary Revision History | 💰 | `💰 Salary` |
| Work Behaviour & Attendance Trend | 📈 | `📈 Work Behaviour Trend` |
| Change Request | 📝 | `📝 Change Request` |

### Action & Control Icons
| Action / Control | Standard Icon | Function / Description |
|---|:---:|---|
| Top-Right 3-Dots Button | `.me-options-btn` + SVG (`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>`) | Three vertical stroke dots SVG icon opening Request History Modal directly (`toggleHistoryModal(true)`) |
| Request History Audit | 🕒 | History & Status Audit Trail |
| All 5 Categories Grid | 🎛️ / 4-Square Grid SVG (`<svg width="15" height="15"...><rect x="3" y="3".../></svg>`) | 1-Tap All 5 Categories bottom sheet grid switcher with standard card background |
| Add New Item | ➕ | Expand form for adding new records |
| Edit Item Record | ✏️ | Edit existing table item record |
| Delete Record | 🗑️ | Mark item for deletion |
| Confirm / Save | ✔ | Save form or confirm action |
| Close Modal Sheet | ✕ | Dismiss bottom sheets & overlays |
| File Attachment | 📎 / 📄 | Upload document attachment |
| Camera Capture | 📷 | Snap photo attachment |
| Modified Badge | 🔸 | Highlight fields edited by employee |

---

## 5. Implementation Rules
1. **No Chinese UI Text**: Maintain 100% clean English text across all rendered components.
2. **Tab Scroll Interaction**: Tapping any tab pill must invoke `scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })` to keep the active tab visible.
3. **Modal Overlay Standard**: All bottom sheets (`#historyOverlay`, `#reviewOverlay`, `#catGridOverlay`, `#qualSheetOverlay`, `#familySheetOverlay`) must use `toggleOverlay` with `void overlay.offsetHeight` layout reflow to ensure instant 60fps click response and transition animations.


4. **Font Awesome Standard**: All future icons must use the Font Awesome styling and classes (e.g., <i class="fa-solid fa-trash-can"></i>) instead of inline SVGs or emojis, to ensure consistency across the application. The Font Awesome 6.4 CDN is required in the <head> of all pages.
