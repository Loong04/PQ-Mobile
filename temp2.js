
    function openFilterModal() {
      const m = document.getElementById('filterModal');
      if (!m) return;
      m.style.display = 'flex';
      setTimeout(() => { m.style.opacity = '1'; m.querySelector('.modal-content').style.transform = 'translateY(0)'; }, 10);
    }
    function closeFilterModal(e) { if (e && e.target !== e.currentTarget) return; closeFilterModalDirect(); }
    function closeFilterModalDirect() {
      const m = document.getElementById('filterModal');
      if (!m) return;
      m.style.opacity = '0';
      m.querySelector('.modal-content').style.transform = 'translateY(100%)';
      setTimeout(() => { m.style.display = 'none'; }, 280);
    }
    function resetFilterModal() {
      document.getElementById('filterDate').value = '2026-09-20';
      document.getElementById('filterBranchSelect').value = 'all';
      document.getElementById('filterDeptSelect').value = 'all';
      closeFilterModalDirect();
    }
    function applyFilterModal() { closeFilterModalDirect(); }
    function switchTab(tabId) {
      const tabContinuous = document.getElementById('tabContinuous');
      const tabRest = document.getElementById('tabRest');
      const contentContinuous = document.getElementById('contentContinuous');
      const contentRest = document.getElementById('contentRest');
      
      if (tabId === 'continuous') {
        tabContinuous.style.background = 'var(--bg-card)';
        tabContinuous.style.color = 'var(--text-primary)';
        tabContinuous.style.boxShadow = 'var(--shadow-sm)';
        
        tabRest.style.background = 'transparent';
        tabRest.style.color = 'var(--text-muted)';
        tabRest.style.boxShadow = 'none';
        
        contentContinuous.style.display = 'flex';
        contentRest.style.display = 'none';
      } else {
        tabRest.style.background = 'var(--bg-card)';
        tabRest.style.color = 'var(--text-primary)';
        tabRest.style.boxShadow = 'var(--shadow-sm)';
        
        tabContinuous.style.background = 'transparent';
        tabContinuous.style.color = 'var(--text-muted)';
        tabContinuous.style.boxShadow = 'none';
        
        contentRest.style.display = 'flex';
        contentContinuous.style.display = 'none';
      }
    }
    function openDetailModal(title, time, staff, status) {
      document.getElementById('detailTitle').innerText = title;
      document.getElementById('detailTime').innerText = time;
      document.getElementById('detailStaff').innerText = staff;
      document.getElementById('detailStatus').innerText = status;
      const m = document.getElementById('detailModal');
      m.style.display = 'flex';
      setTimeout(() => { m.style.opacity = '1'; m.querySelector('.modal-content').style.transform = 'scale(1)'; }, 10);
    }
    function closeDetailModal(e) { if (e && e.target !== e.currentTarget) return; closeDetailModalDirect(); }
    function closeDetailModalDirect() {
      const m = document.getElementById('detailModal');
      m.style.opacity = '0';
      m.querySelector('.modal-content').style.transform = 'scale(0.85)';
      setTimeout(() => { m.style.display = 'none'; }, 250);
    }
  
