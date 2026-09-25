const fs = require('fs');
const path = require('path');

const bhContent = fs.readFileSync(path.join(__dirname, '../modules/claims/options/benefit-highlight.html'), 'utf8');

const requiredIDs = [
  'filterKeyword',
  'filterStartPeriod',
  'filterEndPeriod',
  'filterHighlightType',
  'filterMinAmount',
  'filterMaxAmount',
  'highlightFilterSummaryText'
];

let missing = [];
requiredIDs.forEach(id => {
  if (!bhContent.includes(`id="${id}"`)) {
    missing.push(id);
  }
});

if (missing.length > 0) {
  console.error('Missing IDs in benefit-highlight.html:', missing);
  process.exit(1);
}

console.log('✅ All 5 filter fields (Search Keyword, Start Period, End Period, Benefit Type, Amount Range) are present and validated in benefit-highlight.html');
