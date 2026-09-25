const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../modules/claims/options/expenses-claim.html');
const content = fs.readFileSync(filePath, 'utf8');

const requiredIDs = [
  'claimPeriodYear',
  'claimPeriodMonth',
  'claimDateFrom',
  'claimDateTo',
  'benefitYear',
  'benefitTypeSelect',
  'claimPurpose',
  'claimCurrencySelect',
  'claimTotalInput',
  'projectSelect',
  'costCentreSelect',
  'claimRemarks',
  'itemTxDate',
  'itemReceiptNo',
  'itemDescription',
  'itemExpenseCode',
  'itemAmount',
  'itemCurrency',
  'itemForexRate',
  'itemLocalAmount',
  'itemsTableContainer',
  'subChipsList',
  'globalFileInput',
  'toastNotification',
  'toastText'
];

let missing = [];
requiredIDs.forEach(id => {
  if (!content.includes(`id="${id}"`)) {
    missing.push(id);
  }
});

if (missing.length > 0) {
  console.error('Missing IDs in expenses-claim.html:', missing);
  process.exit(1);
}

console.log('✅ All required IDs present in expenses-claim.html');
