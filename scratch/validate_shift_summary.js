const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../modules/attendance/options/shift-summary.html');
const content = fs.readFileSync(filePath, 'utf8');

console.log('Validating shift-summary.html...');

let passed = true;

const checkItem = (desc, condition) => {
  if (condition) {
    console.log(`  [PASS] ${desc}`);
  } else {
    console.error(`  [FAIL] ${desc}`);
    passed = false;
  }
};

checkItem('File exists and has content', content.length > 5000);
checkItem('Header title "Shift Summary" is present', content.includes('Shift Summary'));
checkItem('Data Filter section is present', content.includes('Data Filter'));
checkItem('Date Switcher is present', content.includes('filterDateInput') && content.includes('adjustDate'));
checkItem('Shift Type Filter is present', content.includes('filterShiftType'));
checkItem('Department Filter is present', content.includes('filterDepartment'));
checkItem('Branch Filter is present', content.includes('filterBranch'));
checkItem('Section Filter is present', content.includes('filterSection'));
checkItem('Cost Centre Filter is present', content.includes('filterCostCentre'));
checkItem('Hero Donut Chart SVG is present', content.includes('shiftDonutSvg') && content.includes('donutSegmentsGroup'));
checkItem('Total Headcount 287 data is present', content.includes('count: 180.00') && content.includes('count: 3.00') && content.includes('count: 1.00'));
checkItem('Job Titles from screenshot present (ACCOUNT EXECUTIVE, BARTENDER, PRODUCTION OPERATOR, QUALITY CHECKER, OPERATION DIRECTOR, CLEANING SPECIALIST, SENIOR BARISTA, HR EXECUTIVE, WAREHOUSE ASSISTANT)', 
  content.includes('ACCOUNT EXECUTIVE') && 
  content.includes('BARTENDER') && 
  content.includes('PRODUCTION OPERATOR') && 
  content.includes('QUALITY CHECKER') && 
  content.includes('OPERATION DIRECTOR') && 
  content.includes('CLEANING SPECIALIST') && 
  content.includes('SENIOR BARISTA') && 
  content.includes('HR EXECUTIVE') && 
  content.includes('WAREHOUSE ASSISTANT')
);
checkItem('Grouped Cards View & Table View toggling is present', content.includes('breakdownCardsView') && content.includes('breakdownTableView') && content.includes('switchBreakdownView'));
checkItem('AGENTS.md and PeopleHCM theme tokens applied', content.includes('var(--purple-primary)') && content.includes('var(--bg-card)') && content.includes('history-card-item'));

if (passed) {
  console.log('\nALL SHIFT SUMMARY VALIDATION CHECKS PASSED PERFECTLY!');
} else {
  console.error('\nSOME CHECKS FAILED!');
  process.exit(1);
}
