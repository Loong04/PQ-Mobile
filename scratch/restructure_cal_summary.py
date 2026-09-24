import re
import sys

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. CSS for view-container
    if '.view-container' not in content:
        css = """
    /* Hub and Spoke View Container */
    .view-container { display: none; width: 100%; height: 100%; position: absolute; top: 0; left: 0; background: var(--bg-body); z-index: 10; overflow: hidden; flex-direction: column; }
    .view-container.active { display: flex; z-index: 20; }
"""
        content = content.replace("/* Toast Notification */", css + "\n    /* Toast Notification */")

    # 2. JS for switchView
    if 'function switchView(' not in content:
        js = """
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
"""
        content = content.replace("function showToast(msg)", js + "\n    function showToast(msg)")

    # 3. Wrap phone-container internals
    if 'id="view-main"' not in content:
        # We find <div class="phone-container"> and append <div id="view-main" ...>
        content = content.replace('<div class="phone-container">', '<div class="phone-container" style="position: relative;">\n    <div id="view-main" class="view-container active" style="display: flex; flex-direction: column; height: 100%; overflow: hidden;">')
        
        # We need to close view-main right before the end of phone-container
        # Instead of parsing, we can just find <!-- Toast Component --> or similar?
        # Actually, if we just find `<!-- ================= SHIFT SELECTOR MODAL SHEET ================= -->` or similar modals, we can close it before the modals.
        # Wait, closing view-main before modals is better so modals can overlay over the entire phone container.
        
        # Modals start at: <!-- ================= SHIFT SELECTOR MODAL SHEET ================= --> in shift-plan
        # and <!-- ================= EDIT OT DETAILS MODAL ================= --> in ot-plan
        
        if '<!-- ================= CHOOSE DATES MODAL' in content:
            content = content.replace('<!-- ================= CHOOSE DATES MODAL', '</div> <!-- end view-main -->\n\n    <!-- ================= CHOOSE DATES MODAL')
        elif '<!-- ================= EDIT OT DETAILS MODAL' in content:
            content = content.replace('<!-- ================= EDIT OT DETAILS MODAL', '</div> <!-- end view-main -->\n\n    <!-- ================= EDIT OT DETAILS MODAL')
        else:
            # Fallback
            pass

    # 4. Modify onclicks for the 4 summary columns
    # We added class="cal-summary-col" in the previous step
    # We want to change `switchMainTab('staff')` to `switchView('view-work-shift-summary')` etc
    
    # We can just replace based on the inner text
    
    col1 = re.sub(r'(<div class="cal-summary-col" onclick="selectCalSummary\(this\);)[^"]*(">\s*<div[^>]*>Work Shift</div>)', r'\1 switchView(\'view-work-shift-summary\')\2', content)
    col2 = re.sub(r'(<div class="cal-summary-col" onclick="selectCalSummary\(this\);)[^"]*(">\s*<div[^>]*>No Work</div>)', r'\1 switchView(\'view-no-work-summary\')\2', col1)
    col3 = re.sub(r'(<div class="cal-summary-col" onclick="selectCalSummary\(this\);)[^"]*(">\s*<div[^>]*>OT Plan</div>)', r'\1 switchView(\'view-ot-plan-summary\')\2', col2)
    col4 = re.sub(r'(<div class="cal-summary-col" onclick="selectCalSummary\(this\);)[^"]*(">\s*<div[^>]*>On Leave</div>)', r'\1 switchView(\'view-leave-summary\')\2', col3)
    content = col4

    # 5. Inject the 4 summary views
    if 'id="view-work-shift-summary"' not in content:
        new_views = """
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
"""
        
        # Inject right before the modals
        if '<!-- ================= CHOOSE DATES MODAL' in content:
            content = content.replace('<!-- ================= CHOOSE DATES MODAL', new_views + '\n\n    <!-- ================= CHOOSE DATES MODAL')
        elif '<!-- ================= EDIT OT DETAILS MODAL' in content:
            content = content.replace('<!-- ================= EDIT OT DETAILS MODAL', new_views + '\n\n    <!-- ================= EDIT OT DETAILS MODAL')
        else:
            # Fallback
            content = content.replace('<!-- Toast Component -->', new_views + '\n\n    <!-- Toast Component -->')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {filepath}")

# Process both files
import os
base_path = r'C:\Users\loong\PQ-Mobile\modules\attendance\options'
process_file(os.path.join(base_path, 'shift-plan.html'))
process_file(os.path.join(base_path, 'ot-plan.html'))
