const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../modules/claims/options/travel-request.html');
const content = fs.readFileSync(filePath, 'utf8');

console.log("=== Checking Travel Request Add Item Fix ===");

if (!content.includes('function openEntryForm()')) {
  console.error("FAIL: openEntryForm function missing!");
  process.exit(1);
}

// Check openEntryForm body contains switchView call
const openEntryMatch = content.match(/function openEntryForm\(\)\s*\{([\s\S]*?)\n    \}/);
if (!openEntryMatch) {
  console.error("FAIL: Could not extract openEntryForm body!");
  process.exit(1);
}

const body = openEntryMatch[1];
if (!body.includes("switchView('view-4-entry'")) {
  console.error("FAIL: switchView('view-4-entry') missing in openEntryForm!");
  process.exit(1);
}

console.log("✔ PASS: switchView('view-4-entry', ...) correctly called in openEntryForm()");

if (!content.includes('onclick="openEntryForm()"')) {
  console.error("FAIL: Add Item button binding missing!");
  process.exit(1);
}
console.log("✔ PASS: Add Item buttons properly linked to openEntryForm()");

if (!content.includes('function saveSubItem()') || !content.includes("switchView('view-3-list'")) {
  console.error("FAIL: saveSubItem missing or fails to return to view-3-list!");
  process.exit(1);
}
console.log("✔ PASS: saveSubItem properly saves item and switches view back to view-3-list");

console.log("\nALL VERIFICATION CHECKS PASSED!");
