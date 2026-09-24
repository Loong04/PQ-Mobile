const fs = require('fs');
const path = require('path');

function processFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');

    // 1. CSS for view-container
    if (!content.includes('.view-container')) {
        const css = `
    /* Hub and Spoke View Container */
    .view-container { display: none; width: 100%; height: 100%; position: absolute; top: 0; left: 0; background: var(--bg-body); z-index: 10; overflow: hidden; flex-direction: column; }
    .view-container.active { display: flex; z-index: 20; }
`;
        content = content.replace("/* Toast Notification */", css + "\n    /* Toast Notification */");
    }

    // 2. JS for switchView
    if (!content.includes('function switchView(')) {
        const js = `
    function switchView(viewId) {
      document.querySelectorAll('.view-container').forEach(el => {
        el.classList.remove('active');
        // also ensure inline display is updated for safety
        el.style.display = 'none';
      });
      const target = document.getElementById(viewId);
      if (target) {
        target.classList.add('active');
        target.style.display = 'flex';
      }
    }
`;
        content = content.replace("function showToast(msg)", js + "\n    function showToast(msg)");
    }

    // 3. 4. 5.
    const new_views = `
    <!-- ================= VIEW: WORK SHIFT SUMMARY ================= -->
    <div id="view-work-shift-summary" class="view-container">
      <div class="app-header" style="position: sticky; top: 0; z-index: 100;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <button type="button" onclick="switchView('view-main')" style="background: none; border: none; color: #ffffff; cursor: pointer; padding: 0;">
              <i class="fa-solid fa-arrow-left" style="font-size: 20px;"></i>
            </button>
            <h1 style="font-size: 19px; font-weight: 800; color: #ffffff; margin: 0;">Work Shift Summary</h1>
          </div>
        </div>
      </div>
      <div style="background: rgba(124, 58, 237, 0.1); padding: 12px 16px; border-bottom: 1px solid rgba(124, 58, 237, 0.2);">
        <div style="font-size: 12px; font-weight: 700; color: var(--purple-primary);">Date: 23 Sep 2026</div>
        <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); margin-top: 4px;">Total Records: 6</div>
      </div>
      <div style="flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; padding-bottom: 40px;">
        
        <!-- Card 1 -->
        <div class="card" style="padding: 16px; position: relative; overflow: hidden; margin-bottom: 0;">
          <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--purple-primary);"></div>
          <div style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 12px;">0700:1500</div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Headcount:</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">21</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Scheduled Hours:</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">168.00</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Work Hours:</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">137.57</div>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="card" style="padding: 16px; position: relative; overflow: hidden; margin-bottom: 0;">
          <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--purple-primary);"></div>
          <div style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 12px;">0800:1700(B)</div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Headcount:</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">3</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Scheduled Hours:</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">24.00</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Work Hours:</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">24.00</div>
          </div>
        </div>

        <!-- Card 3 -->
        <div class="card" style="padding: 16px; position: relative; overflow: hidden; margin-bottom: 0;">
          <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--purple-primary);"></div>
          <div style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 12px;">0815:1715</div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Headcount:</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">1</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Scheduled Hours:</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">8.00</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Work Hours:</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">8.00</div>
          </div>
        </div>

        <!-- Card 4 -->
        <div class="card" style="padding: 16px; position: relative; overflow: hidden; margin-bottom: 0;">
          <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--purple-primary);"></div>
          <div style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 12px;">0830:1730</div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Headcount:</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">1</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Scheduled Hours:</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">8.00</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Work Hours:</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">8.00</div>
          </div>
        </div>

        <!-- Card 5 -->
        <div class="card" style="padding: 16px; position: relative; overflow: hidden; margin-bottom: 0;">
          <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--purple-primary);"></div>
          <div style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 12px;">1500:2300</div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Headcount:</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">1</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Scheduled Hours:</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">8.00</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Work Hours:</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">0.00</div>
          </div>
        </div>

        <!-- Card 6 -->
        <div class="card" style="padding: 16px; position: relative; overflow: hidden; margin-bottom: 0;">
          <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #3b82f6;"></div>
          <div style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 12px;">8.30:17.30W</div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Headcount:</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">242</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Scheduled Hours:</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">1,936.00</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Work Hours:</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">1,316.09</div>
          </div>
        </div>

      </div>
    </div>

    <!-- ================= VIEW: NO WORK SUMMARY ================= -->
    <div id="view-no-work-summary" class="view-container">
      <div class="app-header" style="position: sticky; top: 0; z-index: 100;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <button type="button" onclick="switchView('view-main')" style="background: none; border: none; color: #ffffff; cursor: pointer; padding: 0;">
              <i class="fa-solid fa-arrow-left" style="font-size: 20px;"></i>
            </button>
            <h1 style="font-size: 19px; font-weight: 800; color: #ffffff; margin: 0;">No Work Summary</h1>
          </div>
        </div>
      </div>
      <div style="background: rgba(124, 58, 237, 0.1); padding: 12px 16px; border-bottom: 1px solid rgba(124, 58, 237, 0.2);">
        <div style="font-size: 12px; font-weight: 700; color: var(--purple-primary);">Date: 23 Sep 2026</div>
        <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); margin-top: 4px;">Total Records: 1</div>
      </div>
      <div style="flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; padding-bottom: 40px;">
        
        <div class="card" style="padding: 16px; position: relative; overflow: hidden; margin-bottom: 0;">
          <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #3b82f6;"></div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 14px; font-weight: 800; color: var(--text-muted);">Headcount:</div>
            <div style="font-size: 15px; font-weight: 800; color: var(--text-primary);">13</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= VIEW: OT PLAN SUMMARY ================= -->
    <div id="view-ot-plan-summary" class="view-container">
      <div class="app-header" style="position: sticky; top: 0; z-index: 100;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <button type="button" onclick="switchView('view-main')" style="background: none; border: none; color: #ffffff; cursor: pointer; padding: 0;">
              <i class="fa-solid fa-arrow-left" style="font-size: 20px;"></i>
            </button>
            <h1 style="font-size: 19px; font-weight: 800; color: #ffffff; margin: 0;">OT Plan Summary</h1>
          </div>
        </div>
      </div>
      <div style="background: rgba(124, 58, 237, 0.1); padding: 12px 16px; border-bottom: 1px solid rgba(124, 58, 237, 0.2);">
        <div style="font-size: 12px; font-weight: 700; color: var(--purple-primary);">Date: 23 Sep 2026</div>
        <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); margin-top: 4px;">Total Records: 2</div>
      </div>
      <div style="flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; padding-bottom: 40px;">
        
        <div class="card" style="padding: 16px; position: relative; overflow: hidden; margin-bottom: 0;">
          <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #3b82f6;"></div>
          <div style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 12px;">8.30:17.30W</div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">OT Type:</div>
            <div style="font-size: 12px; font-weight: 800; color: var(--text-primary); text-transform: uppercase;">OT 1.5 BEFORE WORK</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Headcount:</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">21</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Hours:</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">21.00</div>
          </div>
        </div>

        <div class="card" style="padding: 16px; position: relative; overflow: hidden; margin-bottom: 0;">
          <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #3b82f6;"></div>
          <div style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 12px;">8.30:17.30W</div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">OT Type:</div>
            <div style="font-size: 12px; font-weight: 800; color: var(--text-primary); text-transform: uppercase;">1.5 OT</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Headcount:</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">59</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Hours:</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">106.00</div>
          </div>
        </div>

      </div>
    </div>

    <!-- ================= VIEW: LEAVE SUMMARY ================= -->
    <div id="view-leave-summary" class="view-container">
      <div class="app-header" style="position: sticky; top: 0; z-index: 100;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <button type="button" onclick="switchView('view-main')" style="background: none; border: none; color: #ffffff; cursor: pointer; padding: 0;">
              <i class="fa-solid fa-arrow-left" style="font-size: 20px;"></i>
            </button>
            <h1 style="font-size: 19px; font-weight: 800; color: #ffffff; margin: 0;">Leave Summary</h1>
          </div>
        </div>
      </div>
      <div style="background: rgba(124, 58, 237, 0.1); padding: 12px 16px; border-bottom: 1px solid rgba(124, 58, 237, 0.2);">
        <div style="font-size: 12px; font-weight: 700; color: var(--purple-primary);">Date: 23 Sep 2026</div>
        <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); margin-top: 4px;">Total Records: 3</div>
      </div>
      <div style="flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; padding-bottom: 40px;">
        
        <div class="card" style="padding: 16px; position: relative; overflow: hidden; margin-bottom: 0;">
          <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #3b82f6;"></div>
          <div style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 12px;">8.30:17.30W</div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Leave Type:</div>
            <div style="font-size: 12px; font-weight: 800; color: var(--text-primary); text-transform: uppercase;">ANNUAL LEAVE</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Headcount:</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">2.00</div>
          </div>
        </div>

        <div class="card" style="padding: 16px; position: relative; overflow: hidden; margin-bottom: 0;">
          <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #3b82f6;"></div>
          <div style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 12px;">8.30:17.30W</div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Leave Type:</div>
            <div style="font-size: 12px; font-weight: 800; color: var(--text-primary); text-transform: uppercase;">MEDICAL LEAVE</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Headcount:</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">2.00</div>
          </div>
        </div>

        <div class="card" style="padding: 16px; position: relative; overflow: hidden; margin-bottom: 0;">
          <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #3b82f6;"></div>
          <div style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 12px;">8.30:17.30W</div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Leave Type:</div>
            <div style="font-size: 12px; font-weight: 800; color: var(--text-primary); text-transform: uppercase;">UNPAID LEAVE</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Headcount:</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">1.00</div>
          </div>
        </div>

      </div>
    </div>
`;
    if (!content.includes('id="view-main"')) {
        content = content.replace('<div class="phone-container">', '<div class="phone-container" style="position: relative;">\n    <div id="view-main" class="view-container active" style="display: flex; flex-direction: column; height: 100%; overflow: hidden;">');
        
        let splitContent = content.split(/<!-- =================/);
        // The first split part is before any modal. Let's find the first one that has "modal-overlay"
        
        let matchFound = false;
        let newParts = [];
        newParts.push(splitContent[0]);
        for(let i=1; i<splitContent.length; i++) {
            if (!matchFound && splitContent[i].includes('class="modal-overlay"')) {
                // We inject it right here before this modal!
                newParts.push('</div> <!-- end view-main -->\n\n' + new_views + '\n\n    <!-- =================' + splitContent[i]);
                matchFound = true;
            } else {
                newParts.push('<!-- =================' + splitContent[i]);
            }
        }
        content = newParts.join('');
        if (!matchFound) {
           console.log('modal-overlay not found in', filepath);
        }
    }

    // Modify onclicks for the 4 summary columns
    content = content.replace(/(<div class="cal-summary-col" onclick="selectCalSummary\(this\);)[^"]*(">\s*<div[^>]*>Work Shift<\/div>)/g, "$1 switchView('view-work-shift-summary')$2");
    content = content.replace(/(<div class="cal-summary-col" onclick="selectCalSummary\(this\);)[^"]*(">\s*<div[^>]*>No Work<\/div>)/g, "$1 switchView('view-no-work-summary')$2");
    content = content.replace(/(<div class="cal-summary-col" onclick="selectCalSummary\(this\);)[^"]*(">\s*<div[^>]*>OT Plan<\/div>)/g, "$1 switchView('view-ot-plan-summary')$2");
    content = content.replace(/(<div class="cal-summary-col" onclick="selectCalSummary\(this\);)[^"]*(">\s*<div[^>]*>On Leave<\/div>)/g, "$1 switchView('view-leave-summary')$2");

    fs.writeFileSync(filepath, content, 'utf8');
    console.log('Updated ' + filepath);
}

const basePath = 'C:\\Users\\loong\\PQ-Mobile\\modules\\attendance\\options';
processFile(path.join(basePath, 'shift-plan.html'));
processFile(path.join(basePath, 'ot-plan.html'));
