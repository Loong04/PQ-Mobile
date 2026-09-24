const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/loong/PQ-Mobile/modules/attendance/options';

// Common CSS snippet to be injected if missing
const commonStyles = `
    /* AGENTS.md View Chart Button Presentation Standard */
    .view-chart-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 7px 13px;
      border-radius: 12px;
      background: rgba(245, 158, 11, 0.14);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #f59e0b;
      font-weight: 800;
      font-size: 12px;
      white-space: nowrap;
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;
      text-decoration: none;
    }
    .view-chart-btn:active {
      transform: scale(0.95);
      background: rgba(245, 158, 11, 0.25);
    }

    /* Collapsible Filter Accordion Card */
    .filter-accordion-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 18px;
      margin-bottom: 14px;
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      transition: border-color 0.2s;
    }
    .filter-header-bar {
      padding: 11px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.12) 0%, rgba(109, 40, 217, 0.05) 100%);
      border-bottom: 1px solid transparent;
      transition: all 0.2s ease;
    }
    .filter-header-bar.expanded {
      border-bottom-color: var(--border-subtle);
    }
    .filter-badge-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 800;
      color: var(--purple-primary);
      letter-spacing: 0.3px;
    }
    .filter-toggle-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(124, 58, 237, 0.15);
      color: var(--purple-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      transition: transform 0.25s ease;
    }
    .filter-toggle-icon.open {
      transform: rotate(180deg);
    }
    .filter-body-container {
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* Modern Enterprise Summary Table Card (Table Grid Show Data) */
    .summary-table-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: var(--shadow-card);
      margin-bottom: 20px;
    }
    .summary-table-hdr {
      display: grid;
      grid-template-columns: 100px 1fr 90px;
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.16) 0%, rgba(109, 40, 217, 0.08) 100%);
      padding: 13px 16px;
      font-size: 11.5px;
      font-weight: 800;
      color: var(--purple-primary);
      text-transform: uppercase;
      letter-spacing: 0.6px;
      border-bottom: 1.5px solid var(--purple-border);
      align-items: center;
    }
    .summary-table-row {
      display: grid;
      grid-template-columns: 100px 1fr 90px;
      padding: 13px 16px;
      border-bottom: 1px solid var(--border-subtle);
      font-size: 12.5px;
      font-weight: 700;
      color: var(--text-primary);
      align-items: center;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .summary-table-row:last-child { border-bottom: none; }
    .summary-table-row:hover { background: rgba(124, 58, 237, 0.04); }
    .summary-table-row:active { transform: scale(0.995); background: rgba(124, 58, 237, 0.08); }
    
    .summary-table-footer {
      display: grid;
      grid-template-columns: 100px 1fr 90px;
      padding: 13px 16px;
      background: rgba(124, 58, 237, 0.08);
      border-top: 1.5px solid var(--purple-border);
      font-size: 12.5px;
      font-weight: 800;
      align-items: center;
    }
`;

// Collapsible Data Filter HTML Component
const filterAccordionHtml = `
        <!-- Collapsible Data Filter Card -->
        <div class="filter-accordion-card">
          <div class="filter-header-bar" id="filterHeaderBar" onclick="toggleFilterAccordion()">
            <div class="filter-badge-title">
              <i class="fa-solid fa-filter" style="font-size: 12px;"></i>
              <span>Data Filter</span>
            </div>
            <div class="filter-toggle-icon" id="filterToggleIcon">
              <i class="fa-solid fa-chevron-down"></i>
            </div>
          </div>

          <div class="filter-body-container" id="filterBodyContainer">
            <!-- Date Filter Row with Prev / Next Navigation -->
            <div class="filter-field-row" style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Date</label>
              <div style="display: flex; align-items: center; background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 2px 6px;">
                <button type="button" class="date-nav-btn" onclick="adjustDate(-1)" title="Previous Day" style="width: 32px; height: 32px; border-radius: 9px; background: rgba(124, 58, 237, 0.12); border: 1px solid rgba(124, 58, 237, 0.25); color: var(--purple-primary); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 11px;">
                  <i class="fa-solid fa-chevron-left"></i>
                </button>
                <input type="date" id="filterDateInput" value="2026-09-24" onchange="handleDateInputChange()" style="flex: 1; border: none; background: transparent; color: var(--text-primary); font-size: 13px; font-weight: 800; text-align: center; outline: none; padding: 8px 4px;">
                <button type="button" class="date-nav-btn" onclick="adjustDate(1)" title="Next Day" style="width: 32px; height: 32px; border-radius: 9px; background: rgba(124, 58, 237, 0.12); border: 1px solid rgba(124, 58, 237, 0.25); color: var(--purple-primary); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 11px;">
                  <i class="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            </div>

            <!-- Shift Type Dropdown -->
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Shift Type</label>
              <select id="filterShiftType" style="width: 100%; background: var(--bg-input); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 12.5px; font-weight: 700; padding: 9px 12px; border-radius: 12px; outline: none;" onchange="applyFilters()">
                <option value="all">- All Shift Types -</option>
                <option value="WORK">Work Shift</option>
                <option value="OFF DAY">OFF DAY</option>
                <option value="LEAVE">Leave</option>
              </select>
            </div>

            <!-- Department Dropdown -->
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Department</label>
              <select id="filterDepartment" style="width: 100%; background: var(--bg-input); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 12.5px; font-weight: 700; padding: 9px 12px; border-radius: 12px; outline: none;" onchange="applyFilters()">
                <option value="all">- All Departments -</option>
                <option value="Accounting">Accounting</option>
                <option value="Operations">Operations</option>
                <option value="Quality Control">Quality Control</option>
                <option value="Production">Production</option>
                <option value="Human Resource">Human Resource</option>
                <option value="Logistics">Logistics</option>
              </select>
            </div>

            <!-- Branch Dropdown -->
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Branch</label>
              <select id="filterBranch" style="width: 100%; background: var(--bg-input); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 12.5px; font-weight: 700; padding: 9px 12px; border-radius: 12px; outline: none;" onchange="applyFilters()">
                <option value="all">- All Branches -</option>
                <option value="HQ Main Branch">HQ Main Branch</option>
                <option value="Times Square Branch">Times Square Branch</option>
                <option value="Subang Factory">Subang Factory</option>
                <option value="Penang Hub">Penang Hub</option>
              </select>
            </div>

            <!-- Action Buttons -->
            <div style="display: flex; justify-content: flex-end; align-items: center; gap: 8px; margin-top: 4px; padding-top: 8px; border-top: 1px dashed var(--border-subtle);">
              <button type="button" onclick="resetFilters()" style="padding: 8px 16px; border-radius: 12px; background: var(--bg-input); border: 1px solid var(--border-subtle); color: var(--text-muted); font-size: 12px; font-weight: 700; cursor: pointer;">
                <i class="fa-solid fa-rotate-left"></i> Reset
              </button>
              <button type="button" onclick="applyFilters()" style="padding: 8px 20px; border-radius: 12px; background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); border: none; color: #ffffff; font-size: 12.5px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);">
                <i class="fa-solid fa-magnifying-glass"></i> Search
              </button>
            </div>
          </div>
        </div>
`;

// Helper JS functions for Accordion toggle if missing
const toggleAccordionJs = `
    function toggleFilterAccordion() {
      const container = document.getElementById('filterBodyContainer');
      const icon = document.getElementById('filterToggleIcon');
      const header = document.getElementById('filterHeaderBar');
      if (!container) return;
      if (container.style.display === 'none') {
        container.style.display = 'flex';
        if (icon) icon.classList.add('open');
        if (header) header.classList.add('expanded');
      } else {
        container.style.display = 'none';
        if (icon) icon.classList.remove('open');
        if (header) header.classList.remove('expanded');
      }
    }
`;

console.log('Script loaded helper constants.');
