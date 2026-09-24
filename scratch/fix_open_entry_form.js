const fs = require('fs');

let travelHtml = fs.readFileSync('modules/claims/options/travel-claim.html', 'utf-8');

// Fix openEntryForm signature and item variable inside openEntryForm
travelHtml = travelHtml.replace(
  'function openEntryForm() {',
  'function openEntryForm(mode, index = -1) {'
);

travelHtml = travelHtml.replace(
  'const item = index >= 0 ? formData.items[catKey][index] : null;',
  'const item = (index >= 0 && formData.items && formData.items[catKey]) ? formData.items[catKey][index] : null;'
);

fs.writeFileSync('modules/claims/options/travel-claim.html', travelHtml, 'utf-8');
console.log('Fixed openEntryForm in travel-claim.html');
