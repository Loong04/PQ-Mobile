const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../modules/claims/options');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  const issues = [];
  if (content.includes('</thead') && !content.includes('</thead>')) issues.push('malformed thead');
  if (content.includes('y>')) issues.push('rogue y>');
  if (content.includes('margin-bottom: 20px;"') && content.includes('<div class="table-scroll-container"')) issues.push('malformed div');
  
  if (issues.length > 0) {
    console.log('ISSUES IN', f, ':', issues.join(', '));
  } else {
    console.log('CLEAN:', f);
  }
});
