const fs = require('fs');
const path = require('path');

const bhContent = fs.readFileSync(path.join(__dirname, '../modules/claims/options/benefit-highlight.html'), 'utf8');
const ehContent = fs.readFileSync(path.join(__dirname, '../modules/claims/options/expenses-highlight.html'), 'utf8');

const bhThead = bhContent.match(/<thead>[\s\S]*?<\/thead>/)[0];
const ehThead = ehContent.match(/<thead>[\s\S]*?<\/thead>/)[0];

console.log('BH Thead:', bhThead.replace(/\s+/g, ' '));
console.log('EH Thead:', ehThead.replace(/\s+/g, ' '));

if (bhThead.includes('BRANCH') || bhThead.includes('DEPARTMENT') || bhThead.includes('POSITION')) {
  console.error('FAIL: Extra columns present in benefit-highlight table header');
  process.exit(1);
}

if (ehThead.includes('BRANCH') || ehThead.includes('DEPARTMENT') || ehThead.includes('POSITION')) {
  console.error('FAIL: Extra columns present in expenses-highlight table header');
  process.exit(1);
}

console.log('✅ PASS: Both table headers contain ONLY EMP#, NAME, AMOUNT!');
