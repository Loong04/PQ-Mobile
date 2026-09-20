
    let currentView = 'dashboard'; // dashboard | list | chart

    const sampleData = [
      { empNo: "EBB15", name: "Asmawi idris", type: "in", time: "08:04", mode: "Manual Input(People HR)", section: "BENEFITS", cc: "MANAGEMENT" },
      { empNo: "A0001", name: "Natasha thean mei hoi", type: "in", time: "08:00", mode: "Manual Input(People HR)", section: "BENEFITS", cc: "MANAGEMENT" },
      { empNo: "EBB12", name: "Farhan binti rahmat", type: "in", time: "07:34", mode: "Manual Input(People HR)", section: "BENEFITS", cc: "MANAGEMENT" }
    ];

    function goBack() {
      if (currentView === 'chart' || currentView === 'list') {
        setView('dashboard');
      } else {
        history.back();
      }
    }

    function toggleChart() {
      if (currentView === 'chart') {
        setView('list');
      } else if (currentView === 'list') {
        setView('chart');
      }
    }

    function setView(view) {
      currentView = view;
      document.getElementById("view-dashboard").style.display = view === "dashboard" ? "block" : "none";
      document.getElementById("view-list").style.display = view === "list" ? "block" : "none";
      document.getElementById("view-chart").style.display = view === "chart" ? "block" : "none";
      
      const btnChart = document.getElementById("btn-chart-toggle");

      if (view === "list") {
        document.getElementById("headerTitle").innerText = "Clocking Details";
        btnChart.style.display = "flex";
        btnChart.innerHTML = '<i class="fa-solid fa-chart-pie" style="font-size: 15px;"></i>';
        renderList();
      } else if (view === "chart") {
        document.getElementById("headerTitle").innerText = "Summary Analysis";
        btnChart.style.display = "flex";
        btnChart.innerHTML = '<i class="fa-solid fa-table-list" style="font-size: 15px;"></i>';
        
        // Animate donut
        setTimeout(() => {
          document.getElementById("donut-fill").style.strokeDashoffset = "0"; // Full circle for 100%
        }, 50);
      } else {
        document.getElementById("headerTitle").innerText = "Clocking Summary";
        btnChart.style.display = "none";
        document.getElementById("donut-fill").style.strokeDashoffset = "220";
      }
    }

    function openDetails(section) {
      // In a real app, filter data by section here
      setView('list');
    }

    function renderList() {
      const container = document.getElementById('list-container');
      
      container.innerHTML = sampleData.map(item => {
        let iconHtml = '<i class="fa-solid fa-arrow-right-to-bracket clock-type-in"></i>';
        if (item.type === 'out') {
          iconHtml = '<i class="fa-solid fa-arrow-right-from-bracket clock-type-out"></i>';
        }

        return `
          <div class="detail-list-item">
            <div class="staff-avatar-badge">
              <i class="fa-solid fa-user" style="font-size: 20px; opacity: 0.8;"></i>
            </div>
            <div style="flex: 1; min-width: 0;">
              <div class="list-info-row">
                <span class="staff-name" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.empNo} - ${item.name}</span>
              </div>
              <div class="clock-info-row">
                <span style="min-width: 105px;">Clock Type/Time:</span>
                <span class="clock-type-icon">${iconHtml}</span> <span class="clock-time">/ ${item.time}</span>
              </div>
              <div class="clock-info-row" style="margin-bottom: 0; align-items: baseline;">
                <span style="min-width: 105px;">Clock Mode:</span>
                <span class="clock-mode">${item.mode}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Filter Modal Logic
    function openFilterModal() {
      const overlay = document.getElementById("filterModal");
      const content = overlay.querySelector(".modal-content");
      overlay.style.display = "flex";
      setTimeout(() => {
        overlay.style.opacity = "1";
        content.style.transform = "translateY(0)";
      }, 10);
    }
    
    function closeFilterModal(e) {
      if (e && e.target !== e.currentTarget) return;
      closeFilterModalDirect();
    }

    function closeFilterModalDirect() {
      const overlay = document.getElementById("filterModal");
      const content = overlay.querySelector(".modal-content");
      content.style.transform = "translateY(100%)";
      overlay.style.opacity = "0";
      setTimeout(() => { overlay.style.display = "none"; }, 300);
    }

    function resetFilterModal() {
      document.getElementById('f-date').value = '2026-09-20';
      document.getElementById('f-type').value = 'all';
      document.getElementById('f-start-time').value = '00:00';
      document.getElementById('f-end-time').value = '23:59';
      document.getElementById('f-branch').value = 'all';
      document.getElementById('f-dept').value = 'all';
      document.getElementById('f-sec').value = 'all';
      document.getElementById('f-cc').value = 'all';
    }

    function applyFilterModal() {
      // In real app, apply filters
      const d = document.getElementById('f-date').value;
      if (d) {
        const dateObj = new Date(d);
        const day = dateObj.getDate();
        const month = dateObj.toLocaleString('en-US', { month: 'short' });
        const year = dateObj.getFullYear();
        document.getElementById('filterSummaryText').innerHTML = `<span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 8px; font-size: 11.5px;">${day} ${month} ${year}</span>`;
        
        const fdate = `${day.toString().padStart(2, '0')}/${(dateObj.getMonth()+1).toString().padStart(2, '0')}/${year}`;
        document.getElementById('chartStartDate').innerText = fdate;
        document.getElementById('chartEndDate').innerText = fdate;
      }
      closeFilterModalDirect();
    }
  
