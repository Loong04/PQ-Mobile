const fs = require('fs');

// 1. travel-claim.html
let travel = fs.readFileSync('C:/Users/loong/PQ-Mobile/modules/claims/options/travel-claim.html', 'utf8');

// Replace category card titles and subtitles in View 2
travel = travel.replace('<div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">Mileage Claim</div>', '<div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">Mileage</div>');
travel = travel.replace('<div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">Travelling Receipt</div>', '<div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">Travel</div>');
travel = travel.replace('<div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">Other Expenses</div>', '<div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">Expense</div>');

// Replace helper titles in JS
travel = travel.replace("if (catKey === 'mileage') return 'Mileage Claim Items';", "if (catKey === 'mileage') return 'Mileage Items';");
travel = travel.replace("if (catKey === 'travel') return 'Travelling Receipt Items';", "if (catKey === 'travel') return 'Travel Items';");
travel = travel.replace("if (catKey === 'expense') return 'Other Expenses Items';", "if (catKey === 'expense') return 'Expense Items';");

travel = travel.replace("catName = 'Mileage Claim Items';", "catName = 'Mileage Items';");
travel = travel.replace("catName = 'Travelling Receipt Items';", "catName = 'Travel Items';");
travel = travel.replace("catName = 'Other Expenses Items';", "catName = 'Expense Items';");

fs.writeFileSync('C:/Users/loong/PQ-Mobile/modules/claims/options/travel-claim.html', travel, 'utf8');
console.log('Updated travel-claim.html tab names');


// 2. medical-claim.html
let medical = fs.readFileSync('C:/Users/loong/PQ-Mobile/modules/claims/options/medical-claim.html', 'utf8');

medical = medical.replace('<div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">Medical Treatment Info</div>', '<div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">Medical</div>');
medical = medical.replace('<div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">Expense Line Items</div>', '<div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">Details</div>');

medical = medical.replace("if (catKey === 'treatment') return 'Medical Treatment Info';", "if (catKey === 'treatment') return 'Medical';");
medical = medical.replace("if (catKey === 'expense') return 'Expense Line Items';", "if (catKey === 'expense') return 'Details';");

medical = medical.replace('<h2 id="v3CategoryTitleText" style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin: 0;">Expense Line Items</h2>', '<h2 id="v3CategoryTitleText" style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin: 0;">Details</h2>');

fs.writeFileSync('C:/Users/loong/PQ-Mobile/modules/claims/options/medical-claim.html', medical, 'utf8');
console.log('Updated medical-claim.html tab names');


// 3. entertainment-claim.html
let ent = fs.readFileSync('C:/Users/loong/PQ-Mobile/modules/claims/options/entertainment-claim.html', 'utf8');

ent = ent.replace('<div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">Expense Line Items</div>', '<div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">Detail</div>');
ent = ent.replace('<div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">Internal Attendees</div>', '<div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">Employees</div>');
ent = ent.replace('<div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">External Attendees (Guests)</div>', '<div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">Guest</div>');

ent = ent.replace("if (catKey === 'details') return 'Expense Line Items';", "if (catKey === 'details') return 'Detail';");
ent = ent.replace("if (catKey === 'employees') return 'Internal Attendees';", "if (catKey === 'employees') return 'Employees';");
ent = ent.replace("if (catKey === 'guests') return 'External Attendees';", "if (catKey === 'guests') return 'Guest';");

ent = ent.replace('<h2 id="v3CategoryTitleText" style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin: 0;">Expense Items List</h2>', '<h2 id="v3CategoryTitleText" style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin: 0;">Detail</h2>');

fs.writeFileSync('C:/Users/loong/PQ-Mobile/modules/claims/options/entertainment-claim.html', ent, 'utf8');
console.log('Updated entertainment-claim.html tab names');


// 4. advance-claim.html
let advance = fs.readFileSync('C:/Users/loong/PQ-Mobile/modules/claims/options/advance-claim.html', 'utf8');

advance = advance.replace('<div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">Advance Expense Details</div>', '<div style="font-size: 14px; font-weight: 800; color: var(--text-primary);">Expense</div>');
advance = advance.replace("return 'Advance Expense Details';", "return 'Expense';");
advance = advance.replace("if (titleText) titleText.innerText = 'Advance Expense Details';", "if (titleText) titleText.innerText = 'Expense';");
advance = advance.replace('<h2 id="v3CategoryTitleText" style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin: 0;">Advance Expense Details</h2>', '<h2 id="v3CategoryTitleText" style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin: 0;">Expense</h2>');

fs.writeFileSync('C:/Users/loong/PQ-Mobile/modules/claims/options/advance-claim.html', advance, 'utf8');
console.log('Updated advance-claim.html tab names');
