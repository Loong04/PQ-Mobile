const fs = require('fs');
const path = require('path');

const medicalPath = path.join(__dirname, '../modules/claims/options/medical-claim.html');
const advancePath = path.join(__dirname, '../modules/claims/options/advance-claim.html');
const expensesPath = path.join(__dirname, '../modules/claims/options/expenses-claim.html');

console.log("=== Checking Stepper Configurations ===");

// 1. Verify Medical Claim (3 steps)
const medicalHtml = fs.readFileSync(medicalPath, 'utf8');
const medicalMatches = medicalHtml.match(/class="stepper-item/g);
console.log(`Medical Claim stepper nodes count: ${medicalMatches ? medicalMatches.length : 0}`);
if (!medicalMatches || medicalMatches.length !== 3) {
  console.error("FAIL: Medical Claim should have exactly 3 stepper nodes!");
  process.exit(1);
}
console.log("✔ PASS: Medical Claim has 3 steps.");

// 2. Verify Advance Claim (3 steps)
const advanceHtml = fs.readFileSync(advancePath, 'utf8');
const advanceMatches = advanceHtml.match(/class="stepper-item/g);
console.log(`Advance Claim stepper nodes count: ${advanceMatches ? advanceMatches.length : 0}`);
if (!advanceMatches || advanceMatches.length !== 3) {
  console.error("FAIL: Advance Claim should have exactly 3 stepper nodes!");
  process.exit(1);
}
console.log("✔ PASS: Advance Claim has 3 steps.");

// 3. Verify Expense Claim (0 steps / no stepper)
const expensesHtml = fs.readFileSync(expensesPath, 'utf8');
const expensesMatches = expensesHtml.match(/class="claim-stepper-card"/g);
console.log(`Expense Claim stepper cards count: ${expensesMatches ? expensesMatches.length : 0}`);
if (expensesMatches && expensesMatches.length > 0) {
  console.error("FAIL: Expense Claim should not have a stepper card!");
  process.exit(1);
}
console.log("✔ PASS: Expense Claim has no stepper card.");

console.log("\nALL STEPPER VERIFICATION CHECKS PASSED!");
