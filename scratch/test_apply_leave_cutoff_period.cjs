const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, '..', 'leave.html'), 'utf8');
const start = html.indexOf('id="viewApplyLeaveForm"');
const end = html.indexOf('id="viewCreditLeaveForm"', start);
if (start < 0 || end <= start) throw new Error('Apply Leave form region was not found');

const form = html.slice(start, end);
const leaveTypeIndex = form.indexOf('id="mainApplyLeaveTypeSelect"');
const cutoffIndex = form.indexOf('id="mainApplyLeaveCutoffPeriod"');
const blockLeaveIndex = form.indexOf('id="mainToggleBlockLeave"');

if (leaveTypeIndex < 0 || cutoffIndex < 0 || blockLeaveIndex < 0) {
  throw new Error('Leave Type, Cutoff Period, and Block Leave controls must all exist');
}
if (!(leaveTypeIndex < cutoffIndex && cutoffIndex < blockLeaveIndex)) {
  throw new Error('Cutoff Period must sit between Leave Type and Block Leave');
}
if (!form.includes('Cutoff Period') || !form.includes('01/01/2026 - 31/12/2026')) {
  throw new Error('Cutoff Period label or date range is incorrect');
}
if (form.includes('>Cutoff:')) {
  throw new Error('The old heading Cutoff badge must be removed');
}

console.log('Apply Leave Cutoff Period placement is correct.');
