const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\loong\\PQ-Mobile\\modules\\claims\\options\\advance-claim.html', 'utf8');
const lines = content.split('\n');
let insideBody = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<body>')) insideBody = true;
  if (!insideBody) continue;
  if (lines[i].match(/<div[^>]*id="[^"]*"/) || lines[i].match(/<div[^>]*class="[^"]*view-container[^"]*"/)) {
    console.log(i + ': ' + lines[i].trim());
  }
}
