const fs = require('fs');
const path = require('path');

const files = [
  'modules/attendance/options/shift-plan.html',
  'modules/attendance/options/ot-plan.html'
];

let allPassed = true;

files.forEach(relPath => {
  const filePath = path.join(__dirname, '..', relPath);
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(`\n================ Testing ${relPath} ================`);
  
  // 1. Check required view IDs
  const requiredViews = [
    'view-work-shift-summary',
    'view-no-work-summary',
    'view-ot-plan-summary',
    'view-leave-summary',
    'view-work-shift-detail',
    'view-no-work-detail',
    'view-ot-plan-detail',
    'view-leave-detail'
  ];
  
  requiredViews.forEach(v => {
    if (content.includes(`id="${v}"`)) {
      console.log(`  [PASS] View container #${v} found.`);
    } else {
      console.error(`  [FAIL] Missing view container #${v}!`);
      allPassed = false;
    }
  });

  // 2. Check open functions
  const requiredFunctions = [
    'openWorkShiftDetail',
    'openNoWorkDetail',
    'openOtPlanDetail',
    'openLeaveDetail',
    'switchView'
  ];
  
  requiredFunctions.forEach(fn => {
    if (content.includes(`function ${fn}`)) {
      console.log(`  [PASS] Function ${fn} found.`);
    } else {
      console.error(`  [FAIL] Missing function ${fn}!`);
      allPassed = false;
    }
  });

  // 3. Check datasets
  const requiredDatasets = [
    'workShiftEmployeeDataset',
    'noWorkEmployeeDataset',
    'otPlanEmployeeDataset',
    'leaveEmployeeDataset'
  ];

  requiredDatasets.forEach(ds => {
    if (content.includes(`const ${ds}`)) {
      console.log(`  [PASS] Dataset ${ds} found.`);
    } else {
      console.error(`  [FAIL] Missing dataset ${ds}!`);
      allPassed = false;
    }
  });

  // 4. Check specific staff names from screenshots
  const sampleStaff = [
    'Anderson ng',
    'Yee seong liew',
    'TEST',
    'hey',
    'BHIM BAHADUR TAMANG',
    'Jason ling soon kam',
    'Michael',
    'Tee ang lung',
    'Tan li',
    'Ahmad bin ali'
  ];

  sampleStaff.forEach(name => {
    if (content.includes(name)) {
      console.log(`  [PASS] Employee "${name}" found in data.`);
    } else {
      console.error(`  [FAIL] Missing employee "${name}"!`);
      allPassed = false;
    }
  });

  // 5. Check AGENTS.md rule: ID formatting with leading # and placement below name
  if (content.includes('#${emp.id}')) {
    console.log(`  [PASS] Employee ID formatted with leading # in card renderer.`);
  } else {
    console.error(`  [FAIL] Employee ID missing #${'${emp.id}'} format!`);
    allPassed = false;
  }

  // 6. Check that summary cards do NOT contain .history-date-badge
  const summaryBlock = content.substring(
    content.indexOf('<!-- ================= VIEW: WORK SHIFT SUMMARY ================= -->'),
    content.indexOf('<!-- ================= BOTTOM SHEET')
  );
  if (summaryBlock.includes('history-date-badge')) {
    console.error(`  [FAIL] Summary views contain forbidden history-date-badge!`);
    allPassed = false;
  } else {
    console.log(`  [PASS] Summary views strictly free of history-date-badge (AGENTS.md compliant).`);
  }
});

console.log('\n================ SUMMARY ================');
if (allPassed) {
  console.log('ALL VALIDATION CHECKS PASSED PERFECTLY!');
} else {
  console.error('SOME VALIDATION CHECKS FAILED!');
  process.exit(1);
}
