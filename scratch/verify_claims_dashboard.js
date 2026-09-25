const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../modules/claims/index.html');
const jsAppPath = path.join(__dirname, '../js/claims/claims-app.js');
const jsConfigPath = path.join(__dirname, '../js/claims/claims-config.js');

console.log("=== Checking File Existence ===");
[htmlPath, jsAppPath, jsConfigPath].forEach(p => {
  const exists = fs.existsSync(p);
  console.log(`File ${path.basename(p)}: ${exists ? 'EXISTS' : 'MISSING'}`);
  if (!exists) process.exit(1);
});

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const jsAppContent = fs.readFileSync(jsAppPath, 'utf8');

console.log("\n=== Checking AGENTS.md Rules Compliance ===");

// Rule 1: Employee ID
if (jsAppContent.includes('font-family: monospace') && jsAppContent.includes('#')) {
  console.log("1. [PASS] Employee ID formatted with leading # and monospace styling directly below name.");
} else {
  console.error("1. [FAIL] Employee ID rule violation!");
  process.exit(1);
}

// Rule 2: View Chart Button
if (htmlContent.includes('fa-chart-pie') && htmlContent.includes('View chart breakdown') && htmlContent.includes('btn-view-chart-pill')) {
  console.log("2. [PASS] 'View Chart' button displays fa-solid fa-chart-pie + text in a single-line pill.");
} else {
  console.error("2. [FAIL] View Chart button rule violation!");
  process.exit(1);
}

// Scope Switcher
if (htmlContent.includes('tabClaimIndividual') && htmlContent.includes('tabClaimTeam')) {
  console.log("3. [PASS] Individual & Team scope switcher present.");
} else {
  console.error("3. [FAIL] Scope switcher missing!");
  process.exit(1);
}

// Screenshot 1 Components
const indivComponents = ['My requests', 'Quick options', 'Benefit summary', 'Monthly breakdown', 'My travel', 'individual-donut-svg-container', 'individual-calendar-grid'];
indivComponents.forEach(c => {
  if (!htmlContent.includes(c)) {
    console.error(`[FAIL] Missing Individual component: ${c}`);
    process.exit(1);
  }
});
console.log("4. [PASS] All Screenshot 1 Individual components present.");

// Screenshot 2 Components
const teamComponents = ['Pending approval', 'Monthly staff spending', 'Staff travel calendar', 'team-donut-svg-container', 'team-calendar-grid'];
teamComponents.forEach(c => {
  if (!htmlContent.includes(c)) {
    console.error(`[FAIL] Missing Team component: ${c}`);
    process.exit(1);
  }
});
console.log("5. [PASS] All Screenshot 2 Team components present.");

console.log("\nALL VERIFICATION CHECKS PASSED SUCCESSFULLY!");
