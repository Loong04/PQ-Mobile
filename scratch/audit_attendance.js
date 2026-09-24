const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/loong/PQ-Mobile/modules/attendance/options';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  console.log('=== ' + f + ' ===');
  
  // Rule 1: Emp ID below name check
  const hasEmpIdPattern = content.includes('font-family: monospace') || content.includes('staff-emp-badge') || content.includes('emp-card-id') || content.includes('attFieldEmployee');
  console.log('  Emp ID below Name rule:', hasEmpIdPattern ? 'PASS' : 'WARN');

  // Rule 2: View Chart button check
  const hasViewChartBtn = content.includes('view-chart-btn') || content.includes('View Chart');
  const hasPieIcon = content.includes('fa-chart-pie');
  console.log('  View Chart button rule:', (hasViewChartBtn && hasPieIcon) ? 'PASS' : 'MISSING / CHECK');

  // Rule 3: Attendance Pending Approval Details Header Naming
  const hasOtPlanHeader = content.includes('OT Plan Approval');
  const hasAdviceHeader = content.includes('Attendance Advice Approval');
  const hasFinalOtHeader = content.includes('Final OT Approval');
  console.log('  Pending Approval Headers:', (hasOtPlanHeader && hasAdviceHeader && hasFinalOtHeader) ? 'PASS' : 'CHECK');

  // Rule 4: Summary & Detail Card Design (no left date badge)
  const hasDateBadgeInCards = content.includes('history-date-badge') && content.includes('SEP 23');
  console.log('  Left Date Badge Box present in cards:', hasDateBadgeInCards ? 'VIOLATION' : 'PASS');

  // Request requirement: Data Filter Accordion & Table Grid show data
  const hasFilterAccordion = content.includes('filter-accordion-card') || content.includes('Data Filter');
  const hasTableGrid = content.includes('summary-table-card') || content.includes('summary-table-hdr') || content.includes('excel-grid-table');
  console.log('  Collapsible Filter Accordion:', hasFilterAccordion ? 'PASS' : 'NO');
  console.log('  Table Grid Show Data:', hasTableGrid ? 'PASS' : 'NO');
});
