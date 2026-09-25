const fs = require('fs');
const content = fs.readFileSync('modules/attendance/options/shift-plan.html', 'utf8');
const lines = content.split('\n');

let depth = 0;
lines.forEach((line, idx) => {
  const lineNum = idx + 1;
  if (lineNum >= 1500 && lineNum <= 1760) {
    const opens = (line.match(/<div[\s>]/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    depth += (opens - closes);
    if (line.includes('id="view-') || line.includes('modal') || line.includes('phone-container')) {
      console.log(`L${lineNum} [depth ${depth}]: ${line.trim().substring(0, 70)}`);
    }
  }
});
