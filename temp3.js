
    // Master Dataset of Daily Manpower Groups
    const masterManpowerDataset = [
      {
        id: 1,
        company: 'GROUP OF COMPANIES (demoAPI)',
        dept: 'ALL DEPARTMENTS',
        section: 'CORPORATE',
        costCenter: 'CC-101 MANAGEMENT',
        workShift: 10,
        noWork: 0,
        otPlan: 0,
        onLeave: 0,
        staff: [
          { name: 'Lee Soon Hock', empNo: '#EBB01', status: 'Work Shift', badgeClass: 'status-badge-green', info: '08:00 AM – 05:00 PM • Morning Shift' },
          { name: 'Siti Nurhaliza', empNo: '#004177', status: 'Work Shift', badgeClass: 'status-badge-green', info: '08:00 AM – 05:00 PM • Morning Shift' },
          { name: 'Tan Wei Ming', empNo: '#0000101', status: 'Work Shift', badgeClass: 'status-badge-green', info: '08:30 AM – 05:30 PM • General Shift' },
          { name: 'Michael Chen', empNo: '#EBB04', status: 'Work Shift', badgeClass: 'status-badge-green', info: '09:00 AM – 06:00 PM • Flexi Shift' }
        ]
      },
      {
        id: 2,
        company: 'GROUP OF COMPANIES (demoAPI)',
        dept: 'HUMAN RESOURCE',
        section: 'GENERAL HR',
        costCenter: 'CC-501 HR & OPS',
        workShift: 1,
        noWork: 0,
        otPlan: 0,
        onLeave: 0,
        staff: [
          { name: 'Wong Kah Fai', empNo: '#EBB02', status: 'Work Shift', badgeClass: 'status-badge-green', info: '08:30 AM – 05:30 PM • HR Operations' }
        ]
      },
      {
        id: 3,
        company: 'KOZATO KIZAI (M) SDN. BHD.',
        dept: 'PLANT OPERATIONS',
        section: 'ASSEMBLY',
        costCenter: 'CC-301 PRODUCTION',
        workShift: 0,
        noWork: 10,
        otPlan: 0,
        onLeave: 0,
        staff: [
          { name: 'Chok Ching Hou', empNo: '#EBB03', status: 'No Work', badgeClass: 'status-badge-amber', info: 'Scheduled Rest Day Off' },
          { name: 'Kavitha Raj', empNo: '#004199', status: 'No Work', badgeClass: 'status-badge-amber', info: 'Public Holiday Off' }
        ]
      },
      {
        id: 4,
        company: 'PEOPLE EDGE SDN BHD',
        dept: 'GENERAL MANAGEMENT',
        section: 'EXECUTIVE',
        costCenter: 'CC-100 ADMIN',
        workShift: 4,
        noWork: 0,
        otPlan: 0,
        onLeave: 0,
        staff: [
          { name: 'David Miller', empNo: '#EBB05', status: 'Work Shift', badgeClass: 'status-badge-green', info: '08:00 AM – 05:00 PM • Management' },
          { name: 'Jessica Taylor', empNo: '#EBB06', status: 'Work Shift', badgeClass: 'status-badge-green', info: '08:00 AM – 05:00 PM • Executive' }
        ]
      },
      {
        id: 5,
        company: 'PEOPLE EDGE SDN BHD',
        dept: 'ACCOUNTS',
        section: 'FOREX',
        costCenter: 'MANAGEMENT',
        workShift: 1,
        noWork: 0,
        otPlan: 0,
        onLeave: 0,
        staff: [
          { name: 'Lee Soon Hock', empNo: '#EBB01', status: 'Work Shift', badgeClass: 'status-badge-green', info: 'FOREX Management • 08:30 – 17:30' }
        ]
      }
    ];

    let currentDateObj = new Date(2026, 8, 20); // 20 Sep 2026

    function formatDateDisplay(d) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = d.getDate();
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      return `${day < 10 ? '0' + day : day} ${month} ${year}`;
    }

    function formatDateISO(d) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    function shiftDate(deltaDays) {
      currentDateObj.setDate(currentDateObj.getDate() + deltaDays);
      const displayStr = formatDateDisplay(currentDateObj);
      document.getElementById('currentDateDisplay').innerText = displayStr;
      document.getElementById('filterTargetDate').value = formatDateISO(currentDateObj);
      updateFilterSummaryDisplay();
      renderManpowerList();
      showToastNotification(`Date shifted to ${displayStr}`);
    }

    function updateFilterSummaryDisplay() {
      const dateStr = formatDateDisplay(currentDateObj);
      const comp = document.getElementById('filterCompanySelect')?.value || 'all';
      const dept = document.getElementById('filterDeptSelect')?.value || 'all';
      const sec = document.getElementById('filterSectionSelect')?.value || 'all';
      const cc = document.getElementById('filterCostCenterSelect')?.value || 'all';

      let parts = [dateStr];
      if (comp !== 'all') {
        parts.push(comp.length > 20 ? comp.substring(0, 18) + '...' : comp);
      } else if (dept !== 'all') {
        parts.push(dept);
      } else if (sec !== 'all') {
        parts.push(sec);
      } else if (cc !== 'all') {
        parts.push(cc);
      } else {
        parts.push('All Companies');
      }

      document.getElementById('filterSummaryText').innerText = parts.join(' • ');
    }

    function renderManpowerList() {
      const companyFilter = document.getElementById('filterCompanySelect')?.value || 'all';
      const deptFilter = document.getElementById('filterDeptSelect')?.value || 'all';
      const sectionFilter = document.getElementById('filterSectionSelect')?.value || 'all';
      const costCenterFilter = document.getElementById('filterCostCenterSelect')?.value || 'all';

      const filtered = masterManpowerDataset.filter(item => {
        const matchCompany = (companyFilter === 'all' || item.company === companyFilter);
        const matchDept = (deptFilter === 'all' || item.dept === deptFilter);
        const matchSection = (sectionFilter === 'all' || item.section === sectionFilter);
        const matchCostCenter = (costCenterFilter === 'all' || item.costCenter === costCenterFilter);
        return matchCompany && matchDept && matchSection && matchCostCenter;
      });

      // Update Total Summary KPIs
      let totWorkShift = 0, totNoWork = 0, totOtPlan = 0, totOnLeave = 0;
      filtered.forEach(it => {
        totWorkShift += it.workShift;
        totNoWork += it.noWork;
        totOtPlan += it.otPlan;
        totOnLeave += it.onLeave;
      });

      document.getElementById('kpiWorkShift').innerText = totWorkShift;
      document.getElementById('kpiNoWork').innerText = totNoWork;
      document.getElementById('kpiOtPlan').innerText = totOtPlan;
      document.getElementById('kpiOnLeave').innerText = totOnLeave;

      const totalRecords = totWorkShift + totNoWork + totOtPlan + totOnLeave;
      document.getElementById('totalRecordsVal').innerText = totalRecords;
      document.getElementById('sectionCountBadge').innerText = `Showing ${filtered.length} Group${filtered.length === 1 ? '' : 's'}`;

      const container = document.getElementById('manpowerListContainer');
      if (!container) return;

      if (filtered.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 40px 20px; color: var(--text-muted); background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border-subtle); margin-top: 10px;">
            <div style="font-size: 32px; margin-bottom: 8px; opacity: 0.6;">🔍</div>
            <div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">No Manpower Records Found</div>
            <div style="font-size: 12px; margin-top: 4px;">Try adjusting or resetting your filter parameters</div>
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map(item => `
        <div class="manpower-card" onclick="openStaffDetailsModal(${item.id})">
          <div class="card-meta-top">
            <div>
              <div class="card-company-tag">
                <i class="fa-solid fa-building" style="font-size: 11px;"></i>
                <span>${item.company}</span>
              </div>
              <div class="card-dept-name">${item.dept}</div>
            </div>
            <div class="card-arrow-pill">
              <span>Details</span>
              <i class="fa-solid fa-chevron-right" style="font-size: 10px;"></i>
            </div>
          </div>

          <div class="card-info-grid">
            <div class="card-info-item">
              <span class="card-info-label">Section</span>
              <span class="card-info-val">${item.section || '-'}</span>
            </div>
            <div class="card-info-item">
              <span class="card-info-label">Cost Center</span>
              <span class="card-info-val">${item.costCenter || '-'}</span>
            </div>
          </div>

          <div class="card-counters-row">
            <div class="card-count-box box-green">
              <span class="card-count-lbl">Work Shift</span>
              <span class="card-count-num">${item.workShift}</span>
            </div>
            <div class="card-count-box box-amber">
              <span class="card-count-lbl">No Work</span>
              <span class="card-count-num">${item.noWork}</span>
            </div>
            <div class="card-count-box box-purple">
              <span class="card-count-lbl">OT Plan</span>
              <span class="card-count-num">${item.otPlan}</span>
            </div>
            <div class="card-count-box box-rose">
              <span class="card-count-lbl">On Leave</span>
              <span class="card-count-num">${item.onLeave}</span>
            </div>
          </div>
        </div>
      `).join('');
    }

    // Modal Operations
    function openFilterModal() {
      const modal = document.getElementById('filterModal');
      if (!modal) return;
      modal.style.display = 'flex';
      setTimeout(() => {
        modal.classList.add('active');
      }, 10);
    }

    function closeFilterModal(e) {
      if (e && e.target !== e.currentTarget) return;
      const modal = document.getElementById('filterModal');
      if (!modal) return;
      modal.classList.remove('active');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 260);
    }

    function resetFilterModal() {
      document.getElementById('filterCompanySelect').value = 'all';
      document.getElementById('filterDeptSelect').value = 'all';
      document.getElementById('filterSectionSelect').value = 'all';
      document.getElementById('filterCostCenterSelect').value = 'all';
      document.getElementById('filterTargetDate').value = '2026-09-20';
      currentDateObj = new Date(2026, 8, 20);
      document.getElementById('currentDateDisplay').innerText = formatDateDisplay(currentDateObj);
      updateFilterSummaryDisplay();
      closeFilterModal();
      renderManpowerList();
      showToastNotification('Filters reset to default');
    }

    function applyFilterModal() {
      const dateVal = document.getElementById('filterTargetDate').value;
      if (dateVal) {
        const parts = dateVal.split('-');
        currentDateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        document.getElementById('currentDateDisplay').innerText = formatDateDisplay(currentDateObj);
      }
      updateFilterSummaryDisplay();
      closeFilterModal();
      renderManpowerList();
      showToastNotification('Filter applied successfully');
    }

    // Staff Roster Details Modal
    function openStaffDetailsModal(id) {
      const item = masterManpowerDataset.find(x => x.id === id);
      if (!item) return;

      document.getElementById('modalCompany').innerHTML = `
        <i class="fa-solid fa-building"></i>
        <span>${item.company}</span>
      `;
      document.getElementById('modalDept').innerText = item.dept;
      document.getElementById('modalSection').innerText = item.section || '-';
      document.getElementById('modalCostCenter').innerText = item.costCenter || '-';
      document.getElementById('modalWorkShift').innerText = item.workShift;
      document.getElementById('modalNoWork').innerText = item.noWork;
      document.getElementById('modalOtPlan').innerText = item.otPlan;
      document.getElementById('modalOnLeave').innerText = item.onLeave;

      const staffCount = item.staff ? item.staff.length : 0;
      document.getElementById('modalStaffCount').innerText = `${staffCount} Staff Member${staffCount === 1 ? '' : 's'}`;

      const container = document.getElementById('modalStaffList');
      if (!item.staff || item.staff.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 24px 16px; color: var(--text-muted); font-size: 13px;">
            <i class="fa-solid fa-user-slash" style="font-size: 24px; margin-bottom: 8px; opacity: 0.5; display: block;"></i>
            No individual staff members recorded for this section.
          </div>
        `;
      } else {
        container.innerHTML = item.staff.map(s => `
          <div class="staff-card-row">
            <div class="staff-avatar-bubble">
              <i class="fa-solid fa-user"></i>
            </div>
            <div class="staff-info-col">
              <!-- Employee Name -->
              <div class="staff-name-text">${s.name}</div>
              <!-- REPOSITORY RULE (AGENTS.md): Employee ID directly BELOW name with leading # -->
              <div class="staff-emp-badge">${s.empNo}</div>
              <div class="staff-detail-desc">
                <i class="fa-regular fa-clock" style="font-size: 10px;"></i>
                <span>${s.info}</span>
              </div>
            </div>
            <div class="staff-status-badge ${s.badgeClass}">
              ${s.status}
            </div>
          </div>
        `).join('');
      }

      const modal = document.getElementById('staffDetailModal');
      if (!modal) return;
      modal.style.display = 'flex';
      setTimeout(() => {
        modal.classList.add('active');
      }, 10);
    }

    function closeStaffDetailsModal(e) {
      if (e && e.target !== e.currentTarget) return;
      const modal = document.getElementById('staffDetailModal');
      if (!modal) return;
      modal.classList.remove('active');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 260);
    }

    function showToastNotification(msg) {
      const toast = document.getElementById('feedbackToast');
      const text = document.getElementById('toastMessage');
      if (!toast || !text) return;
      text.innerText = msg;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2200);
    }

    // Keyboard navigation (ESC closes open modal)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeFilterModal();
        closeStaffDetailsModal();
      }
    });

    // Initialize on load
    document.addEventListener('DOMContentLoaded', () => {
      updateFilterSummaryDisplay();
      renderManpowerList();
    });
  
