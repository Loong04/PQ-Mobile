const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, '..', 'leave.html'), 'utf8');
const start = html.indexOf('id="viewApplyOffTimeForm"');
const end = html.indexOf('id="viewMyLeaveHistory"', start);
if (start < 0 || end <= start) throw new Error('Time Off form region was not found');

const form = html.slice(start, end);
const controls = [
  'id="timeOffDateInput"',
  'id="timeOffStartTime"',
  'id="timeOffEndTime"',
  'id="timeOffHoursInput"',
  'id="timeOffReasonSelect"',
  'id="timeOffRemarksTextarea"',
  'id="hiddenTimeOffFileInput"'
];
const positions = controls.map(control => form.indexOf(control));

if (positions.some(position => position < 0)) throw new Error('Time Off form is missing a required control');
if (!positions.every((position, index) => index === 0 || positions[index - 1] < position)) {
  throw new Error('Time Off controls are not in the required order');
}
if (form.includes('Time Off Type') || form.includes('Reason / Remarks')) {
  throw new Error('Legacy Time Off fields must be removed');
}
if (!/id="timeOffHoursInput"[^>]*readonly/.test(form)) {
  throw new Error('Hours must be a read-only calculated field');
}
if (!/id="timeOffReasonSelect"[\s\S]*?<option value="" selected>- Select Reason -<\/option>/.test(form)) {
  throw new Error('Reason must be a dropdown with a default prompt');
}
if (!form.includes('Upload Attachments')) throw new Error('Upload Attachments label is missing');
if (!html.includes('function updateTimeOffHours()')) throw new Error('Time Off hours calculation is missing');

console.log('Time Off form fields and ordering are correct.');
