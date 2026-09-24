const fs = require('fs');
const html = fs.readFileSync('c:/Users/loong/PQ-Mobile/modules/attendance/options/shift-summary.html', 'utf8');

console.log('File size:', html.length, 'bytes');

const hasSummaryTable = html.includes('summary-table-card') && html.includes('summary-table-hdr') && html.includes('summaryTableRowsContainer');
console.log('1. Summary Table present:', hasSummaryTable);

const hasTableFooter = html.includes('summary-table-footer') && html.includes('footerTotalHeadcount');
console.log('2. Table Footer Total present:', hasTableFooter);

const hasViewChartBtn = html.includes('class="view-chart-btn"') && html.includes('fa-solid fa-chart-pie') && html.includes('<span>View Chart</span>');
console.log('3. View Chart button compliant:', hasViewChartBtn);

const hasDedicatedChartView = html.includes('id="view-chart"') && html.includes('summaryDonutSvg');
console.log('4. Dedicated Chart View present:', hasDedicatedChartView);

const hasDetailView = html.includes('id="view-shift-detail"') && html.includes('detailEmployeeListContainer');
console.log('5. Shift Detail View present:', hasDetailView);

const hasEmpBadge = html.includes('staff-emp-badge') && html.includes('${emp.empNo}');
console.log('6. Employee ID standard compliant:', hasEmpBadge);

if (hasSummaryTable && hasTableFooter && hasViewChartBtn && hasDedicatedChartView && hasDetailView && hasEmpBadge) {
  console.log('=== ALL VALIDATIONS PASSED 100% ===');
} else {
  console.error('Validation failed');
  process.exit(1);
}
