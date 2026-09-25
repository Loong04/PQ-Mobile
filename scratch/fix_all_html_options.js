const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../modules/claims/options');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(f => {
  const filePath = path.join(dir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Remove rogue `y>` after `</tbody>` or anywhere standalone HTML typos
  content = content.replace(/<\/tbody>y>/g, '</tbody>');
  content = content.replace(/<\/thead\s+<tbody/g, '</thead>\n              <tbody');
  
  // 2. Fix malformed table container div
  content = content.replace(/margin-bottom: 20px;"\s+<div class="table-scroll-container"/g, 'margin-bottom: 20px;">\n          <div class="table-scroll-container"');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('FIXED:', f);
  } else {
    console.log('NO CHANGE:', f);
  }
});
