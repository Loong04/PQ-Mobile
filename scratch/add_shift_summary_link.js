const fs = require('fs');
const path = require('path');

const teamPath = path.join(__dirname, '../modules/attendance/options/team.html');
let teamContent = fs.readFileSync(teamPath, 'utf8');

const targetStr = `          <!-- 13. Hours Costing -->
          <a
            href="hours-costing.html"
            class="card"
            style="
              margin-bottom: 0;
              padding: 12px 6px;
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              text-decoration: none;
              box-sizing: border-box;
              transition: transform 0.15s;
            "
            onmousedown="this.style.transform = 'scale(0.96)'"
            onmouseup="this.style.transform = 'scale(1)'"
          >
            <div
              style="
                width: 38px;
                height: 38px;
                border-radius: 12px;
                background: rgba(16, 185, 129, 0.15);
                color: #10b981;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 8px;
              "
            >
              <i class="fa-solid fa-coins" style="font-size: 16px"></i>
            </div>
            <span
              style="
                font-size: 12px;
                font-weight: 800;
                color: var(--text-primary);
                line-height: 1.2;
              "
              >Hours<br />Costing</span
            >
          </a>`;

const replacementStr = `${targetStr}

          <!-- 14. Shift Summary -->
          <a
            href="shift-summary.html"
            class="card"
            style="
              margin-bottom: 0;
              padding: 12px 6px;
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              text-decoration: none;
              box-sizing: border-box;
              transition: transform 0.15s;
            "
            onmousedown="this.style.transform = 'scale(0.96)'"
            onmouseup="this.style.transform = 'scale(1)'"
          >
            <div
              style="
                width: 38px;
                height: 38px;
                border-radius: 12px;
                background: rgba(124, 58, 237, 0.15);
                color: var(--purple-primary);
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 8px;
              "
            >
              <i class="fa-solid fa-business-time" style="font-size: 16px"></i>
            </div>
            <span
              style="
                font-size: 12px;
                font-weight: 800;
                color: var(--text-primary);
                line-height: 1.2;
              "
              >Shift<br />Summary</span
            >
          </a>`;

if (!teamContent.includes('href="shift-summary.html"')) {
    teamContent = teamContent.replace(targetStr, replacementStr);
    fs.writeFileSync(teamPath, teamContent, 'utf8');
    console.log('Added shift-summary.html link to team.html');
} else {
    console.log('shift-summary.html link already in team.html');
}
