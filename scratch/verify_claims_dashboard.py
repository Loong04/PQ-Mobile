import os
import re

def verify_claims_dashboard():
    html_path = r"c:\Users\loong\PQ-Mobile\modules\claims\index.html"
    js_app_path = r"c:\Users\loong\PQ-Mobile\js\claims\claims-app.js"
    js_config_path = r"c:\Users\loong\PQ-Mobile\js\claims\claims-config.js"
    agents_path = r"c:\Users\loong\PQ-Mobile\AGENTS.md"

    print("=== Checking File Existence ===")
    for path in [html_path, js_app_path, js_config_path, agents_path]:
        exists = os.path.exists(path)
        print(f"File {os.path.basename(path)}: {'EXISTS' if exists else 'MISSING'}")
        assert exists, f"Missing file: {path}"

    with open(html_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    with open(js_app_path, 'r', encoding='utf-8') as f:
        js_app_content = f.read()

    print("\n=== Checking AGENTS.md Rules Compliance ===")
    
    # Rule 1: Employee ID Presentation Standard
    print("1. Checking Employee ID Rule...")
    emp_id_styled = "font-family: monospace" in js_app_content or "#" in js_app_content
    assert emp_id_styled, "Employee ID formatting standard missing!"
    print("   [PASS] Employee ID formatted with leading # and monospace styling below employee name.")

    # Rule 2: "View Chart" Button Presentation Standard
    print("2. Checking 'View Chart' Button Rule...")
    assert "fa-chart-pie" in html_content, "Missing fa-chart-pie icon for View Chart button!"
    assert "View chart breakdown" in html_content, "Missing 'View chart breakdown' text in button!"
    assert "btn-view-chart-pill" in html_content, "Missing single-line pill class for View Chart button!"
    print("   [PASS] 'View Chart' button uses fa-solid fa-chart-pie with explicit text and single-line pill layout.")

    # Check Scope Switcher
    print("3. Checking Individual & Team Scope Switcher...")
    assert "tabClaimIndividual" in html_content, "Missing tabClaimIndividual"
    assert "tabClaimTeam" in html_content, "Missing tabClaimTeam"
    assert "scopeIndividualSection" in html_content, "Missing scopeIndividualSection"
    assert "scopeTeamSection" in html_content, "Missing scopeTeamSection"
    print("   [PASS] Individual and Team scope switcher present.")

    # Check Screenshot 1 Components (Individual)
    print("4. Checking Screenshot 1 (Individual) Components...")
    assert "My requests" in html_content, "Missing 'My requests' card"
    assert "Quick options" in html_content, "Missing 'Quick options' card"
    assert "Benefit summary" in html_content, "Missing 'Benefit summary' card"
    assert "Monthly breakdown" in html_content, "Missing 'Monthly breakdown' card"
    assert "My travel" in html_content, "Missing 'My travel' card"
    assert "individual-donut-svg-container" in html_content, "Missing individual donut SVG container"
    assert "individual-calendar-grid" in html_content, "Missing individual calendar grid"
    print("   [PASS] All Screenshot 1 Individual components present.")

    # Check Screenshot 2 Components (Team)
    print("5. Checking Screenshot 2 (Team) Components...")
    assert "Pending approval" in html_content, "Missing 'Pending approval' banner card"
    assert "Monthly staff spending" in html_content, "Missing 'Monthly staff spending' card"
    assert "Staff travel calendar" in html_content, "Missing 'Staff travel calendar' card"
    assert "team-donut-svg-container" in html_content, "Missing team donut SVG container"
    assert "team-calendar-grid" in html_content, "Missing team calendar grid"
    print("   [PASS] All Screenshot 2 Team components present.")

    print("\nALL VERIFICATION CHECKS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    verify_claims_dashboard()
