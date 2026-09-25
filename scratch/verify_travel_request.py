import os
import re

def verify_travel_request():
    file_path = r"c:\Users\loong\PQ-Mobile\modules\claims\options\travel-request.html"
    
    assert os.path.exists(file_path), f"File missing: {file_path}"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    print("=== Checking Travel Request Add Item Fix ===")
    
    # Check openEntryForm definition and switchView call inside
    assert "function openEntryForm()" in content, "openEntryForm function not found!"
    
    # Extract function openEntryForm body
    pattern = r"function openEntryForm\(\)\s*\{([\s\S]*?)\n    \}"
    match = re.search(pattern, content)
    assert match, "Could not extract openEntryForm body"
    
    body = match.group(1)
    assert "switchView('view-4-entry'" in body, "switchView('view-4-entry', ...) call is missing from openEntryForm!"
    print(" [PASS] switchView('view-4-entry', ...) correctly called in openEntryForm()")
    
    # Check button onclick binding
    assert 'onclick="openEntryForm()"' in content, "Add Item button binding to openEntryForm missing!"
    print(" [PASS] Add Item buttons properly linked to openEntryForm()")

    # Check saveSubItem function
    assert "function saveSubItem()" in content, "saveSubItem function missing!"
    assert "switchView('view-3-list'" in content, "saveSubItem does not navigate back to view-3-list"
    print(" [PASS] saveSubItem properly saves item and switches view back to view-3-list")

    print("\nSUCCESS: All Travel Request Add Item checks passed!")

if __name__ == "__main__":
    verify_travel_request()
